'use client';

import OctagonChart from '@/components/octagon/OctagonChart';
import { axisPctToRing, type AxisResult } from '@/lib/data/composites';

interface Props {
  /** 8 axis results, in the order they should appear around the octagon. */
  axes: AxisResult[];
  size?: number;
  showLabels?: boolean;
}

/**
 * Single combined octagon: 4 health pillars + 4 wealth pillars rendered on
 * one chart. Values are indicator-led; pillars without indicators (e.g. the
 * old Strength axis before push-ups landed) fall back to a low ring value.
 */
export default function CompositeOctagon({ axes, size = 300, showLabels = true }: Props) {
  const scores = axes.map(a => axisPctToRing(a.indicatorPct));
  const labels = axes.map(a => a.label);
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
