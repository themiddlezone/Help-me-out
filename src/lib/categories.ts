/**
 * The three kinds of download a device can have. Each one gets its own
 * colour role and shape so they stay recognisable across pages.
 */
export const categories = {
  roms: {
    title: 'ROMs',
    singular: 'ROM',
    icon: 'android',
    shape: 'Cookie9Sided',
    role: 'primary',
    blurb: 'Full system builds you flash from recovery.',
  },
  recoveries: {
    title: 'Recoveries',
    singular: 'recovery',
    icon: 'build',
    shape: 'Pentagon',
    role: 'secondary',
    blurb: 'Custom recovery images for flashing and backups.',
  },
  kernels: {
    title: 'Kernels',
    singular: 'kernel',
    icon: 'memory',
    shape: 'Cookie6Sided',
    role: 'tertiary',
    blurb: 'Custom kernels with root built in.',
  },
} as const;

export type CategoryId = keyof typeof categories;
export const categoryIds = Object.keys(categories) as CategoryId[];
