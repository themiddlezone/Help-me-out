/**
 * Damped spring maths shared by the CSS motion tokens and the few places that
 * animate from script (the loading indicator).
 *
 * Material 3 describes motion as springs with a stiffness and a damping ratio
 * (mass is always 1). The browser has no native spring easing, so for CSS the
 * curve is sampled into a linear() easing that lasts until the spring settles.
 */

export interface Spring {
  stiffness: number;
  dampingRatio: number;
}

/** Position of a spring released at 0 heading for 1, at time t in seconds. */
export function springAt({ stiffness, dampingRatio: z }: Spring, t: number): number {
  const w0 = Math.sqrt(stiffness);

  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + ((z * w0) / wd) * Math.sin(wd * t));
  }

  if (z === 1) {
    return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
  }

  const s = Math.sqrt(z * z - 1);
  const r1 = -w0 * (z - s);
  const r2 = -w0 * (z + s);
  return 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1);
}

/** Seconds until the spring stays within `epsilon` of its target. */
export function settleTime(spring: Spring, epsilon = 0.001): number {
  let last = 0;
  for (let t = 0; t < 5; t += 0.001) {
    if (Math.abs(springAt(spring, t) - 1) > epsilon) last = t;
  }
  return last + 0.001;
}

/** Sample a spring into a CSS linear() easing plus the duration it needs. */
export function springToCss(spring: Spring): { easing: string; duration: number } {
  const seconds = settleTime(spring);
  // Roughly one point per frame keeps the overshoot smooth without bloating the string.
  const steps = Math.min(64, Math.max(16, Math.ceil(seconds * 60)));
  const points: string[] = [];

  for (let i = 0; i <= steps; i++) {
    const value = i === steps ? 1 : springAt(spring, (seconds * i) / steps);
    points.push(String(Math.round(value * 10000) / 10000));
  }

  return { easing: `linear(${points.join(', ')})`, duration: Math.round(seconds * 1000) };
}
