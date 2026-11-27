import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { githubReleases } from './lib/releases';

const category = z.object({
  /** owner/name of the repo whose GitHub releases are the builds. */
  repo: z.string().optional(),
  summary: z.string(),
});

const devices = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/data/devices' }),
  schema: z.object({
    name: z.string(),
    brand: z.string(),
    model: z.string(),
    codename: z.string(),
    soc: z.string(),
    order: z.number().default(0),
    tagline: z.string(),
    guide: z.string(),
    source: z.url(),
    categories: z.object({
      roms: category,
      recoveries: category,
      kernels: category,
    }),
  }),
});

const builds = defineCollection({
  loader: githubReleases(),
  schema: z.object({
    device: z.string(),
    category: z.enum(['roms', 'recoveries', 'kernels']),
    repo: z.string(),
    tag: z.string(),
    name: z.string(),
    title: z.string(),
    subtitle: z.string().optional(),
    prerelease: z.boolean(),
    publishedAt: z.coerce.date(),
    url: z.url(),
    assets: z.array(
      z.object({
        name: z.string(),
        size: z.number(),
        url: z.url(),
        contentType: z.string(),
        sha256: z.string().nullable(),
      }),
    ),
  }),
});

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  devices,
  builds,
};
