import { springToCss, type Spring } from './spring';

/**
 * Material 3 Expressive motion scheme. Spatial springs move, resize and
 * reshape things and are allowed to overshoot. Effects springs handle colour
 * and opacity and never bounce.
 */
export const springs = {
  'fast-spatial': { stiffness: 800, dampingRatio: 0.6 },
  'default-spatial': { stiffness: 380, dampingRatio: 0.8 },
  'slow-spatial': { stiffness: 200, dampingRatio: 0.8 },
  'fast-effects': { stiffness: 3800, dampingRatio: 1 },
  'default-effects': { stiffness: 1600, dampingRatio: 1 },
  'slow-effects': { stiffness: 800, dampingRatio: 1 },
} satisfies Record<string, Spring>;

export type SpringName = keyof typeof springs;

let cached: string | undefined;

/**
 * Custom properties for every spring, e.g.
 *   transition: transform var(--spring-fast-spatial);
 * where the value is "<duration> <easing>". Lite mode zeroes the durations.
 */
export function motionCss(): string {
  if (cached) return cached;

  const full: string[] = [];
  const lite: string[] = [];

  for (const [name, spring] of Object.entries(springs)) {
    const { easing, duration } = springToCss(spring);
    full.push(`--ease-${name}: ${easing};`);
    full.push(`--duration-${name}: ${duration}ms;`);
    full.push(`--spring-${name}: var(--duration-${name}) var(--ease-${name});`);
    lite.push(`--duration-${name}: 0ms;`);
  }

  cached = `:root{${full.join('')}}:root[data-motion='lite']{${lite.join('')}}`;
  return cached;
}
