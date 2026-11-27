import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import type { CategoryId } from './categories';

export type Device = CollectionEntry<'devices'>;
export type Build = CollectionEntry<'builds'>;
export type Asset = Build['data']['assets'][number];

export async function getDevices(): Promise<Device[]> {
  const devices = await getCollection('devices');
  return devices.sort((a, b) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name));
}

export async function getDevice(id: string): Promise<Device | undefined> {
  return getEntry('devices', id);
}

/** Builds newest first, optionally narrowed to one device and category. */
export async function getBuilds(device?: string, category?: CategoryId): Promise<Build[]> {
  const builds = await getCollection(
    'builds',
    ({ data }) => (!device || data.device === device) && (!category || data.category === category),
  );
  return builds.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

/** The file most people want: the flashable zip, or the first asset otherwise. */
export function primaryAsset(build: Build): Asset | undefined {
  return build.data.assets.find((asset) => asset.name.endsWith('.zip')) ?? build.data.assets[0];
}

/** Newest build that is not marked as a pre-release on GitHub. */
export function latestOfficial(builds: Build[]): Build | undefined {
  return builds.find((build) => !build.data.prerelease);
}

export function buildPath(build: Build): string {
  return `/${build.data.device}/${build.data.category}/${build.data.tag}/`;
}

/** Which install guide covers a category. */
export function guideFor(device: string, category: CategoryId): string | undefined {
  if (category === 'roms') return `/docs/${device}/install-lineageos/`;
  if (category === 'kernels') return `/docs/${device}/flash-kernel/`;
  return undefined;
}
