'use client';

import OctagonChart from '@/components/octagon/OctagonChart';
import { axisPctToRing, type AxisResult } from '@/lib/data/composites';

interface Props {
  /** Axis results in the order they should appear around the octagon. */
  axes: AxisResult[];
  size?: number;
  showLabels?: boolean;
}

/**
 * Composite octagon. The underlying chart is a fixed 8-vertex shape, so:
 *  - 8 axes (combined health + wealth) map 1:1 onto the 8 vertices.
 *  - 4 axes (single domain) are repeated so each pillar occupies 2 adjacent
 *    vertices, giving 4 fat sides on the octagon.
 *  - Any other length is padded with empty entries.
 */
function expandToEight<T>(arr: T[], empty: T): T[] {
  if (arr.length === 8) return arr;
  if (arr.length === 4) return arr.flatMap(v => [v, v]);
  const out = arr.slice(0, 8);
  while (out.length < 8) out.push(empty);
  return out;
}

export default function CompositeOctagon({ axes, size = 300, showLabels = true }: Props) {
  const rawScores = axes.map(a => axisPctToRing(a.indicatorPct));
  const rawLabels = axes.map(a => a.label);
  const scores = expandToEight(rawScores, 1);
  const labels = expandToEight(rawLabels, '');
  return (
    <OctagonChart
      scores={scores}
      labels={labels}
      maxScore={8}
      size={size}
      showLabels={showLabels}
      showScores={false}
    />
  );
}
