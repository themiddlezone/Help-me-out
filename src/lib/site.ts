export const site = {
  name: 'Varifocal',
  tagline: 'Custom ROMs, recoveries and kernels',
  description:
    'Download LineageOS, custom kernels and recoveries for the Samsung Galaxy A12 (SM-A127F), with install guides and an FAQ.',
  author: 'varifocal',
  email: 'varifocall@gmail.com',
  repo: 'https://github.com/themiddlezone/Help-me-out',
  org: 'https://github.com/a12s-dev',
};

export const socials = [
  { label: 'Telegram', href: 'https://t.me/Varifocal', icon: 'telegram' },
  { label: 'GitHub', href: 'https://github.com/varifocal', icon: 'github' },
  { label: 'Email', href: `mailto:${site.email}`, icon: 'mail' },
] as const;

/** Destinations in the floating toolbar, in order. */
export const sections = [
  { id: 'downloads', label: 'Downloads', icon: 'download', href: '/' },
  { id: 'docs', label: 'Docs', icon: 'menu_book', href: '/docs/' },
  { id: 'faq', label: 'FAQ', icon: 'help', href: '/faq/' },
  { id: 'changelog', label: 'Changelog', icon: 'history', href: '/changelog/' },
  { id: 'support', label: 'Support', icon: 'favorite', href: '/support/' },
] as const;

export type SectionId = (typeof sections)[number]['id'];

/** Which toolbar item a path belongs to, ignoring the base path. */
export function sectionFor(path: string): SectionId {
  if (path.startsWith('/docs/')) return 'docs';
  if (path.startsWith('/faq/')) return 'faq';
  if (path.startsWith('/changelog/')) return 'changelog';
  if (path.startsWith('/support/')) return 'support';
  return 'downloads';
}
