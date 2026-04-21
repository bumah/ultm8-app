/**
 * Sparkline — tiny inline trend line.
 * Takes up to N recent data points, renders normalized SVG.
 * Hand-rolled, no external dependencies.
 */

interface SparklineProps {
  /** Data points in chronological order (oldest → newest) */
  data: number[];
  /** SVG width in px (default 80) */
  width?: number;
  /** SVG height in px (default 28) */
  height?: number;
  /** Line stroke color (default red2) */
  color?: string;
  /** Stroke width (default 1.5) */
  strokeWidth?: number;
}

export default function Sparkline({
  data,
  width = 80,
  height = 28,
  color = '#E63B2F',
  strokeWidth = 1.5,
}: SparklineProps) {
  if (data.length === 0) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="rgba(242,237,228,0.15)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      </svg>
    );
  }

  if (data.length === 1) {
    // Single point — show as a dot on a dashed baseline
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="rgba(242,237,228,0.1)"
          strokeWidth={1}
          strokeDasharray="2 2"
        />
        <circle cx={width / 2} cy={height / 2} r={2.5} fill={color} />
      </svg>
    );
  }

  // Normalize data to [0, 1]
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const padding = 3;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * innerW;
    // Flip Y (higher value = higher on chart)
    const y = padding + (1 - (v - min) / range) * innerH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const lastPointCoords = points[points.length - 1].split(',').map(Number);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Highlight last point */}
      <circle cx={lastPointCoords[0]} cy={lastPointCoords[1]} r={2} fill={color} />
    </svg>
  );
}
