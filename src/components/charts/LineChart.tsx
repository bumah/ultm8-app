/**
 * LineChart — full-width trend chart for the indicator detail page.
 * Hand-rolled SVG, no dependencies.
 */

interface LineChartPoint {
  label: string;   // x-axis label (e.g., date)
  value: number;
}

interface LineChartProps {
  data: LineChartPoint[];
  width?: number;   // default 100% of container via viewBox
  height?: number;  // default 200
  color?: string;
  yLabelFormat?: (v: number) => string;
}

export default function LineChart({
  data,
  width = 320,
  height = 200,
  color = '#E63B2F',
  yLabelFormat = (v) => Math.round(v).toString(),
}: LineChartProps) {
  if (data.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-dim)',
          fontSize: 13,
          border: '1px dashed var(--border)',
          borderRadius: 3,
        }}
      >
        No data yet
      </div>
    );
  }

  const padL = 40;
  const padR = 12;
  const padT = 16;
  const padB = 28;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const min = Math.min(...data.map(d => d.value));
  const max = Math.max(...data.map(d => d.value));
  const range = max - min || 1;

  // add 10% headroom above and below for visual breathing
  const yMin = min - range * 0.1;
  const yMax = max + range * 0.1;
  const yRange = yMax - yMin || 1;

  const xFor = (i: number) =>
    data.length === 1 ? padL + innerW / 2 : padL + (i / (data.length - 1)) * innerW;
  const yFor = (v: number) => padT + (1 - (v - yMin) / yRange) * innerH;

  // Y-axis grid lines (3 horizontal)
  const yTicks = [yMax, (yMax + yMin) / 2, yMin];

  const points = data.map((d, i) => ({
    x: xFor(i),
    y: yFor(d.value),
    label: d.label,
    value: d.value,
  }));

  const polylinePoints = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ display: 'block' }}
    >
      {/* Grid lines */}
      {yTicks.map((tick, i) => {
        const y = yFor(tick);
        return (
          <g key={i}>
            <line
              x1={padL}
              y1={y}
              x2={width - padR}
              y2={y}
              stroke="rgba(242,237,228,0.08)"
              strokeWidth={1}
              strokeDasharray={i === 1 ? '2 3' : undefined}
            />
            <text
              x={padL - 6}
              y={y + 3}
              textAnchor="end"
              fontSize={9}
              fill="rgba(242,237,228,0.4)"
              fontFamily="var(--mono), monospace"
            >
              {yLabelFormat(tick)}
            </text>
          </g>
        );
      })}

      {/* X-axis labels (first, middle, last) */}
      {data.length > 0 && (
        <>
          <text
            x={xFor(0)}
            y={height - 8}
            textAnchor="start"
            fontSize={9}
            fill="rgba(242,237,228,0.4)"
            fontFamily="var(--mono), monospace"
          >
            {data[0].label}
          </text>
          {data.length > 2 && (
            <text
              x={xFor(Math.floor(data.length / 2))}
              y={height - 8}
              textAnchor="middle"
              fontSize={9}
              fill="rgba(242,237,228,0.4)"
              fontFamily="var(--mono), monospace"
            >
              {data[Math.floor(data.length / 2)].label}
            </text>
          )}
          {data.length > 1 && (
            <text
              x={xFor(data.length - 1)}
              y={height - 8}
              textAnchor="end"
              fontSize={9}
              fill="rgba(242,237,228,0.4)"
              fontFamily="var(--mono), monospace"
            >
              {data[data.length - 1].label}
            </text>
          )}
        </>
      )}

      {/* Line */}
      {data.length > 1 && (
        <polyline
          points={polylinePoints}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={i === points.length - 1 ? 3.5 : 2.5}
          fill={color}
        />
      ))}
    </svg>
  );
}
