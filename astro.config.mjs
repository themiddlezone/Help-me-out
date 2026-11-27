// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// The Pages workflow passes these from actions/configure-pages, so a custom
// domain later on only needs to be set in the repo settings.
const site = process.env.SITE_URL || 'https://themiddlezone.github.io';
const base = process.env.BASE_PATH ?? '/Help-me-out';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  // Lossless whitespace removal. The default JSX-style rules drop the spaces
  // between inline elements that sit on separate lines.
  compressHTML: true,
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
  integrations: [
    starlight({
      title: 'Varifocal',
      description: 'Install guides, FAQ and changelog for Varifocal builds.',
      disable404Route: true,
      favicon: '/favicon.svg',
      customCss: ['./src/styles/global.css', './src/styles/starlight.css'],
      editLink: {
        baseUrl: 'https://github.com/themiddlezone/Help-me-out/edit/main/',
      },
      components: {
        Head: './src/components/starlight/Head.astro',
        Header: './src/components/starlight/Header.astro',
        PageFrame: './src/components/starlight/PageFrame.astro',
        ThemeProvider: './src/components/starlight/Empty.astro',
        ThemeSelect: './src/components/starlight/Empty.astro',
      },
      expressiveCode: {
        themes: ['github-dark-default'],
        useStarlightDarkModeSwitch: false,
        useStarlightUiThemeColors: false,
        styleOverrides: {
          borderRadius: '16px',
          borderColor: 'var(--md-sys-color-outline-variant)',
          codeBackground: 'var(--md-sys-color-surface-container-lowest)',
          codeFontFamily: 'var(--font-mono)',
          uiFontFamily: 'var(--font-sans)',
          frames: {
            shadowColor: 'transparent',
            editorTabBarBackground: 'var(--md-sys-color-surface-container)',
            editorActiveTabBackground: 'var(--md-sys-color-surface-container-lowest)',
            editorActiveTabIndicatorTopColor: 'var(--md-sys-color-primary)',
            terminalTitlebarBackground: 'var(--md-sys-color-surface-container)',
            terminalTitlebarBorderBottomColor: 'transparent',
            terminalBackground: 'var(--md-sys-color-surface-container-lowest)',
            inlineButtonBackground: 'var(--md-sys-color-secondary-container)',
            inlineButtonForeground: 'var(--md-sys-color-on-secondary-container)',
            inlineButtonBorder: 'transparent',
          },
        },
      },
      sidebar: [
        { label: 'Start here', link: '/docs/' },
        {
          label: 'Galaxy A12 (a12s)',
          items: [
            { label: 'Before you flash', link: '/docs/a12s/before-you-flash/' },
            { label: 'Unlock the bootloader', link: '/docs/a12s/unlock-bootloader/' },
            { label: 'Install LineageOS', link: '/docs/a12s/install-lineageos/' },
            { label: 'Flash the SukiSU kernel', link: '/docs/a12s/flash-kernel/' },
            { label: 'Updating', link: '/docs/a12s/updating/' },
          ],
        },
        {
          label: 'Help',
          items: [
            { label: 'FAQ', link: '/faq/' },
            { label: 'Changelog', link: '/changelog/' },
            { label: 'Support', link: '/support/' },
          ],
        },
      ],
    }),
  ],
});
