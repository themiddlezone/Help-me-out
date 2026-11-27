import {
  MaterialShapes,
  Morph,
  roundedPolygonToPath,
  type Cubic,
  type MaterialShapeName,
} from 'material-shapes-ts';

/**
 * Build-time helpers for the Material 3 shape library. Pages ship plain SVG
 * paths and CSS, the library itself only reaches the browser for the loading
 * indicator.
 */

export type ShapeName = MaterialShapeName;

const paths = new Map<ShapeName, string>();

/** SVG path data for a shape inside a unit box, for use with viewBox="0 0 1 1". */
export function shapePath(name: ShapeName): string {
  let d = paths.get(name);
  if (!d) {
    d = roundedPolygonToPath(MaterialShapes.byName(name)).toSvgPathData();
    paths.set(name, d);
  }
  return d;
}

const pct = (n: number) => `${Math.round(n * 10000) / 100}%`;

function toCssShape(cubics: Cubic[]): string {
  const [x, y] = cubics[0]!.points;
  const commands = cubics.map(({ points: p }) => {
    return `curve to ${pct(p[6]!)} ${pct(p[7]!)} with ${pct(p[2]!)} ${pct(p[3]!)} / ${pct(p[4]!)} ${pct(p[5]!)}`;
  });
  return `shape(from ${pct(x!)} ${pct(y!)}, ${commands.join(', ')}, close)`;
}

/**
 * Two clip-path values with the same list of commands, so CSS can morph
 * between them. Used with the .morph class from components.css.
 */
export function morphStyle(from: ShapeName, to: ShapeName, rotate = 0): string {
  const morph = new Morph(MaterialShapes.byName(from), MaterialShapes.byName(to));
  const style = [`--morph-from: ${toCssShape(morph.asCubics(0))}`, `--morph-to: ${toCssShape(morph.asCubics(1))}`];
  if (rotate) style.push(`--morph-rotate: ${rotate}deg`);
  return style.join('; ');
}
