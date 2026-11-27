import type { Morph } from 'material-shapes-ts';
import { springAt } from '../lib/spring';

/**
 * Drives every [data-loading-indicator] on the page. Per the M3 Expressive
 * spec the shape morphs to the next one in the sequence every 650ms on a
 * bouncy spring, turning a quarter each time, on top of a steady spin.
 *
 * Indicators only animate while they are on screen, and not at all in lite
 * motion mode, where the plain CSS spin from LoadingIndicator.astro stays.
 */

const sequence = ['SoftBurst', 'Cookie9Sided', 'Pentagon', 'Pill', 'Sunny', 'Cookie4Sided', 'Oval'] as const;
const morphEvery = 650;
const spinPeriod = 4666;
const morphSpring = { stiffness: 200, dampingRatio: 0.6 };

interface Live {
  svg: SVGSVGElement;
  path: SVGPathElement;
  start: number;
}

const live = new Map<HTMLElement, Live>();
let library: Promise<{ morphs: Morph[]; toPath: (morph: Morph, progress: number) => string }> | undefined;
let frame = 0;
let observer: IntersectionObserver | undefined;

function loadLibrary() {
  library ??= import('material-shapes-ts').then(({ MaterialShapes, Morph, morphToPath }) => ({
    morphs: sequence.map(
      (name, i) => new Morph(MaterialShapes.byName(name), MaterialShapes.byName(sequence[(i + 1) % sequence.length]!)),
    ),
    toPath: (morph: Morph, progress: number) => morphToPath(morph, progress).toSvgPathData(),
  }));
  return library;
}

async function play(el: HTMLElement) {
  const { morphs, toPath } = await loadLibrary();
  const svg = el.querySelector('svg');
  const path = el.querySelector('path');
  if (!svg || !path || live.has(el)) return;

  el.dataset.live = '';
  live.set(el, { svg, path, start: performance.now() });

  const tick = (now: number) => {
    for (const { svg, path, start } of live.values()) {
      const elapsed = now - start;
      const step = Math.floor(elapsed / morphEvery);
      const progress = springAt(morphSpring, (elapsed - step * morphEvery) / 1000);
      path.setAttribute('d', toPath(morphs[step % morphs.length]!, progress));
      const turn = (step + progress) * 90 + (elapsed / spinPeriod) * 360;
      svg.style.rotate = `${turn % 360}deg`;
    }
    frame = live.size ? requestAnimationFrame(tick) : 0;
  };

  if (!frame) frame = requestAnimationFrame(tick);
}

function pause(el: HTMLElement) {
  live.delete(el);
}

export function startIndicators() {
  if (document.documentElement.dataset.motion === 'lite') return;

  observer ??= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const el = entry.target as HTMLElement;
      if (entry.isIntersecting) play(el);
      else pause(el);
    }
  });

  for (const el of document.querySelectorAll<HTMLElement>('[data-loading-indicator]')) {
    observer.observe(el);
  }
}

/** Fetch the shape library ahead of time, e.g. when search is about to open. */
export function warmIndicators() {
  if (document.documentElement.dataset.motion !== 'lite') loadLibrary();
}
