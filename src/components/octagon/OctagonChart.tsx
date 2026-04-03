'use client';

import { useRef, useEffect, useState } from 'react';

interface OctagonChartProps {
  scores: number[];        // 8 values, each 1-8
  labels: string[];        // 8 short labels
  maxScore?: number;       // default 8
  size?: number;           // canvas size, default 320
  accentColor?: string;    // fill/stroke color, default '#C8241A'
  fillOpacity?: number;    // polygon fill opacity, default 0.12
  showLabels?: boolean;    // default true
  showScores?: boolean;    // default true
}

export default function OctagonChart({
  scores,
  labels,
  maxScore = 8,
  size = 320,
  accentColor = '#C8241A',
  fillOpacity = 0.12,
  showLabels = true,
  showScores = true,
}: OctagonChartProps) {
  const [tooltip, setTooltip] = useState<{ label: string; score: number; x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const R = size * 0.35;
    const n = 8;
    const angleStep = (2 * Math.PI) / n;
    const startAngle = -Math.PI / 2; // start at top

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Draw 8 concentric ring outlines
    for (let ring = 1; ring <= maxScore; ring++) {
      const r = (ring / maxScore) * R;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const angle = startAngle + i * angleStep;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = ring === maxScore
        ? 'rgba(242, 237, 228, 0.15)'
        : 'rgba(242, 237, 228, 0.06)';
      ctx.lineWidth = ring === maxScore ? 1.5 : 0.5;
      ctx.stroke();
    }

    // Draw 8 radial spokes
    for (let i = 0; i < n; i++) {
      const angle = startAngle + i * angleStep;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
      ctx.strokeStyle = 'rgba(242, 237, 228, 0.06)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Draw data polygon (filled)
    ctx.beginPath();
    const points: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const angle = startAngle + i * angleStep;
      const val = Math.max(1, Math.min(maxScore, scores[i] || 1));
      const r = (val / maxScore) * R;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      points.push([x, y]);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Fill
    ctx.fillStyle = accentColor + Math.round(fillOpacity * 255).toString(16).padStart(2, '0');
    ctx.fill();

    // Stroke
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw score dots at each vertex
    points.forEach(([x, y], i) => {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = accentColor;
      ctx.fill();

      // Score number near dot
      if (showScores && scores[i]) {
        ctx.font = '700 11px "Barlow Condensed", sans-serif';
        ctx.fillStyle = '#F2EDE4';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Offset score text slightly outward
        const angle = startAngle + i * angleStep;
        const offset = 14;
        ctx.fillText(
          String(scores[i]),
          x + offset * Math.cos(angle),
          y + offset * Math.sin(angle)
        );
      }
    });

    // Draw labels around the perimeter
    if (showLabels) {
      ctx.font = '700 9px "Barlow", sans-serif';
      ctx.textBaseline = 'middle';

      const labelR = R + 28;

      for (let i = 0; i < n; i++) {
        const angle = startAngle + i * angleStep;
        const x = cx + labelR * Math.cos(angle);
        const y = cy + labelR * Math.sin(angle);

        // Color based on score
        const score = scores[i] || 0;
        if (score >= 7) ctx.fillStyle = '#C8F135';
        else if (score >= 5) ctx.fillStyle = '#00D4AA';
        else if (score >= 3) ctx.fillStyle = '#F5A623';
        else ctx.fillStyle = '#e74c3c';

        // Align text based on position
        const angleDeg = ((angle * 180) / Math.PI + 360) % 360;
        if (angleDeg > 90 && angleDeg < 270) {
          ctx.textAlign = 'right';
        } else if (angleDeg > 80 && angleDeg < 100) {
          ctx.textAlign = 'center';
        } else if (angleDeg > 260 && angleDeg < 280) {
          ctx.textAlign = 'center';
        } else {
          ctx.textAlign = 'left';
        }

        // Top/bottom center alignment
        if (angleDeg < 10 || angleDeg > 350) ctx.textAlign = 'center';
        if (angleDeg > 170 && angleDeg < 190) ctx.textAlign = 'center';

        // Abbreviate labels
        const abbrev = labels[i]
          .replace('Blood Pressure', 'BP')
          .replace('Blood Sugar', 'BS')
          .replace('Cholesterol', 'CHOL')
          .replace('Resting HR', 'RHR')
          .replace('Body Fat', 'BF')
          .replace('Muscle Mass', 'MM')
          .replace('Push-ups', 'PU')
          .replace('5km Run', '5KM');

        ctx.fillText(abbrev.toUpperCase(), x, y);
      }
    }
  }, [scores, labels, maxScore, size, accentColor, fillOpacity, showLabels, showScores]);

  function handleCanvasInteraction(e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    // Account for CSS scaling (canvas may be smaller than `size` due to maxWidth:100%)
    const scaleX = size / rect.width;
    const scaleY = size / rect.height;
    const px = (clientX - rect.left) * scaleX;
    const py = (clientY - rect.top) * scaleY;

    const cx = size / 2;
    const cy = size / 2;
    const R = size * 0.35;
    const n = 8;
    const angleStep = (2 * Math.PI) / n;
    const startAngle = -Math.PI / 2;
    const labelR = R + 28;
    const hitRadius = 40; // generous for finger taps

    for (let i = 0; i < n; i++) {
      const angle = startAngle + i * angleStep;
      const lx = cx + labelR * Math.cos(angle);
      const ly = cy + labelR * Math.sin(angle);
      const dist = Math.sqrt((px - lx) ** 2 + (py - ly) ** 2);
      if (dist < hitRadius) {
        if (tooltip?.label === labels[i]) {
          setTooltip(null); // toggle off if same label tapped
        } else {
          setTooltip({ label: labels[i], score: scores[i] || 0, x: lx, y: ly });
        }
        return;
      }
    }
    setTooltip(null);
  }

  // Position tooltip in CSS pixel space (account for scale)
  const wrapRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', maxWidth: size, margin: '0 auto' }}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasInteraction}
        onTouchEnd={handleCanvasInteraction}
        style={{
          display: 'block',
          width: '100%',
          maxWidth: size,
          cursor: 'pointer',
          touchAction: 'manipulation',
        }}
      />
      {tooltip && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            top: tooltip.y > size / 2 ? `calc(${(tooltip.y / size) * 100}% - 44px)` : `calc(${(tooltip.y / size) * 100}% + 12px)`,
            background: '#1A1714',
            border: '1px solid rgba(242,237,228,0.2)',
            borderRadius: '3px',
            padding: '8px 14px',
            zIndex: 10,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '18px', fontWeight: 900, color: accentColor }}>
            {tooltip.score}/{maxScore}
          </span>
          <span style={{ fontSize: '13px', color: '#F2EDE4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {tooltip.label}
          </span>
        </div>
      )}
    </div>
  );
}
