import { readdir, readFile } from 'node:fs/promises';
import type { Loader } from 'astro/loaders';

/**
 * Content loader that turns GitHub releases into build entries.
 *
 * Every device file in src/data/devices lists the repo that publishes each
 * kind of build. Releases are fetched at build time, so a new release shows up
 * after the next deploy. The Pages workflow also runs on a schedule and can be
 * triggered from the build repos with a repository_dispatch event.
 *
 * Set GITHUB_TOKEN to avoid the 60 requests an hour anonymous limit.
 */

interface Source {
  device: string;
  category: string;
  repo: string;
}

interface GitHubAsset {
  name: string;
  size: number;
  content_type: string;
  browser_download_url: string;
  digest?: string | null;
}

interface GitHubRelease {
  tag_name: string;
  name: string | null;
  body: string | null;
  draft: boolean;
  prerelease: boolean;
  published_at: string | null;
  created_at: string;
  html_url: string;
  assets: GitHubAsset[];
}

async function readSources(dir: URL): Promise<Source[]> {
  const sources: Source[] = [];
  for (const file of await readdir(dir)) {
    if (!file.endsWith('.json')) continue;
    const device = JSON.parse(await readFile(new URL(file, dir), 'utf8'));
    for (const [category, entry] of Object.entries<{ repo?: string }>(device.categories ?? {})) {
      if (entry.repo) sources.push({ device: file.replace(/\.json$/, ''), category, repo: entry.repo });
    }
  }
  return sources;
}

async function fetchReleases(repo: string): Promise<GitHubRelease[]> {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'varifocal-site',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const releases: GitHubRelease[] = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=100&page=${page}`, {
      headers,
    });
    if (!res.ok) {
      throw new Error(`GitHub answered ${res.status} for ${repo}: ${await res.text()}`);
    }
    const batch = (await res.json()) as GitHubRelease[];
    releases.push(...batch);
    if (batch.length < 100) return releases;
  }
}

/** Tidy release notes written for GitHub so they sit well inside a page. */
export function cleanNotes(body: string): string {
  const lines = body
    .replace(/\r\n?/g, '\n')
    // House style uses plain hyphens.
    .replace(/[ \t]*\u2014[ \t]*/g, ' - ')
    .replace(/\u2013/g, '-')
    .split('\n');

  const out: string[] = [];
  let fenced = false;
  let seenContent = false;

  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;

    if (!fenced && /^#\s/.test(line)) {
      // The page already prints the release name as its h1, so a leading h1
      // in the notes is dropped and any later one becomes an h2.
      if (!seenContent) continue;
      out.push(`#${line}`);
    } else {
      out.push(line);
    }

    if (line.trim()) seenContent = true;
  }

  return out.join('\n').trim();
}

/** "Release 1 - rom38 - LineageOS 23.2" becomes a title and a subtitle. */
function splitName(name: string): { title: string; subtitle?: string } {
  const at = name.indexOf(' - ');
  if (at === -1) return { title: name };
  return { title: name.slice(0, at), subtitle: name.slice(at + 3) };
}

export function githubReleases(): Loader {
  return {
    name: 'github-releases',
    async load({ store, logger, config, parseData, renderMarkdown, generateDigest }) {
      const sources = await readSources(new URL('./src/data/devices/', config.root));
      const kept = new Set<string>();

      for (const source of sources) {
        const prefix = `${source.device}/${source.category}/`;
        let releases: GitHubRelease[];

        try {
          releases = await fetchReleases(source.repo);
        } catch (error) {
          // A failed deploy is better than one that silently drops every build.
          if (process.env.CI) throw error;
          logger.warn(`Keeping cached ${prefix} builds: ${(error as Error).message}`);
          for (const id of store.keys()) if (id.startsWith(prefix)) kept.add(id);
          continue;
        }

        for (const release of releases) {
          if (release.draft) continue;

          const id = prefix + release.tag_name;
          const notes = cleanNotes(release.body ?? '');
          const name = (release.name?.trim() || release.tag_name).replace(/\s*[\u2014\u2013]\s*/g, ' - ');
          const raw = {
            device: source.device,
            category: source.category,
            repo: source.repo,
            tag: release.tag_name,
            name,
            ...splitName(name),
            prerelease: release.prerelease,
            publishedAt: release.published_at ?? release.created_at,
            url: release.html_url,
            assets: release.assets.map((asset) => ({
              name: asset.name,
              size: asset.size,
              url: asset.browser_download_url,
              contentType: asset.content_type,
              sha256: asset.digest?.startsWith('sha256:') ? asset.digest.slice(7) : null,
            })),
          };

          kept.add(id);
          const digest = generateDigest({ raw, notes });
          if (store.get(id)?.digest === digest) continue;

          const data = await parseData({ id, data: raw });
          const rendered = notes ? await renderMarkdown(notes) : undefined;
          store.set({ id, data, body: notes, rendered, digest });
        }

        logger.info(`${source.repo}: ${releases.filter((r) => !r.draft).length} releases`);
      }

      for (const id of store.keys()) if (!kept.has(id)) store.delete(id);
    },
  };
}
