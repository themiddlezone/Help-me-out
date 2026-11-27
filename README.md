# Varifocal

Source for [themiddlezone.github.io/Help-me-out](https://themiddlezone.github.io/Help-me-out/), the download and help
site for Varifocal's custom ROMs, recoveries and kernels. Right now that means LineageOS 23.2 and the SukiSU kernel for
the Exynos Galaxy A12 (SM-A127F, `a12s`).

It is a static [Astro](https://astro.build) site. The download pages are custom Astro pages, the guides, FAQ and support
pages run on [Starlight](https://starlight.astro.build), and both share one Material 3 Expressive theme. Search is
[Pagefind](https://pagefind.app), built into the output, so there is no server.

## Running it locally

You need Node 22.23 or newer (CI uses Node 24).

```sh
npm ci
npm run dev
```

The dev server prints a local URL ending in `/Help-me-out/`. Builds are pulled from the GitHub API, which allows 60
anonymous requests an hour. If you hit that, pass a token:

```sh
GITHUB_TOKEN=$(gh auth token) npm run dev
```

`npm run build` writes the site to `dist`, and `npm run preview` serves it. Search only works on a built site.

## Where builds come from

Nothing is uploaded here. Every device has a file in `src/data/devices` that names the repo publishing each kind of
build, and every GitHub release in that repo becomes a build page:

- Releases marked as pre-release show as **Test** builds, the rest as **Official**.
- The newest official release is marked **Latest**.
- The first `.zip` asset is the main download. Every asset is listed with its size and the SHA-256 that GitHub records.
- The release notes are rendered as written on GitHub.

So publishing a release in the ROM or kernel repo is all it takes. The site picks it up on the next deploy, which happens
on every push to `main`, every six hours on a schedule, and whenever a build repo sends a `build-published` dispatch.
To trigger one from a release workflow, use a token with **Contents: write** on this repo:

```sh
gh api repos/themiddlezone/Help-me-out/dispatches -f event_type=build-published
```

You can also run the **Deploy site** workflow by hand from the Actions tab.

## Adding a device

1. Copy `src/data/devices/a12s.json` to `src/data/devices/<codename>.json` and fill it in. Leave `repo` out of a
   category that has nothing yet and it shows as "Coming soon".
2. Write its guides under `src/content/docs/docs/<codename>/`. The download pages link to `install-lineageos` and
   `flash-kernel` in that folder, see `guideFor` in `src/lib/data.ts`.
3. Add the guides to `sidebar` in `astro.config.mjs`.

## Fonts

Google Sans Flex and Material Symbols Rounded are self-hosted from `src/assets/fonts`, cut down to the axes and icons the
site uses. Using a new icon means adding its name to `scripts/fonts.sh` and running it again (it needs `fonttools` and
`brotli` from pip).

## Deploying

`.github/workflows/deploy.yml` builds the site and publishes it with GitHub Pages. Pull requests get a build to catch
errors but are not deployed. In the repo settings, Pages has to use **GitHub Actions** as its source.

## License

[AGPL-3.0](LICENSE). The fonts keep their own licenses, which sit next to them in `src/assets/fonts`.
