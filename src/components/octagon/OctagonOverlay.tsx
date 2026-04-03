'use client';

import { useRef, useEffect } from 'react';

export interface OctagonLayer {
  scores: number[];
  color: string;
  label: string;      // e.g. "Apr 2, 2026"
  opacity?: number;    // fill opacity, default 0.10
}

interface OctagonOverlayProps {
  layers: OctagonLayer[];
  labels: string[];     // 8 axis labels
  maxScore?: number;
  size?: number;
}

export default function OctagonOverlay({
  layers,
  labels,
  maxScore = 8,
  size = 320,
}: OctagonOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || layers.length === 0) return;

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
    const startAngle = -Math.PI / 2;

    ctx.clearRect(0, 0, size, size);

    // Draw concentric ring outlines
    for (let ring = 1; ring <= maxScore; ring++) {
      const r = (ring / maxScore) * R;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const angle = startAngle + i * angleStep;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = ring === maxScore
        ? 'rgba(242, 237, 228, 0.12)'
        : 'rgba(242, 237, 228, 0.04)';
      ctx.lineWidth = ring === maxScore ? 1.5 : 0.5;
      ctx.stroke();
    }

    // Draw radial spokes
    for (let i = 0; i < n; i++) {
      const angle = startAngle + i * angleStep;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle));
      ctx.strokeStyle = 'rgba(242, 237, 228, 0.04)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Draw each layer (oldest first so newest is on top)
    layers.forEach((layer, layerIdx) => {
      const fillAlpha = layer.opacity ?? (layerIdx === layers.length - 1 ? 0.15 : 0.06);
      const strokeAlpha = layerIdx === layers.length - 1 ? 1.0 : 0.4;

      ctx.beginPath();
      const points: [number, number][] = [];
      for (let i = 0; i < n; i++) {
        const angle = startAngle + i * angleStep;
        const val = Math.max(1, Math.min(maxScore, layer.scores[i] || 1));
        const r = (val / maxScore) * R;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        points.push([x, y]);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Fill
      const hex = Math.round(fillAlpha * 255).toString(16).padStart(2, '0');
      ctx.fillStyle = layer.color + hex;
      ctx.fill();

      // Stroke
      ctx.globalAlpha = strokeAlpha;
      ctx.strokeStyle = layer.color;
      ctx.lineWidth = layerIdx === layers.length - 1 ? 2 : 1.5;
      ctx.setLineDash(layerIdx === layers.length - 1 ? [] : [4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;

      // Dots on newest layer only
      if (layerIdx === layers.length - 1) {
        points.forEach(([x, y]) => {
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = layer.color;
          ctx.fill();
        });
      }
    });

    // Labels
    ctx.font = '700 9px "Barlow", sans-serif';
    ctx.textBaseline = 'middle';
    const labelR = R + 28;

    for (let i = 0; i < n; i++) {
      const angle = startAngle + i * angleStep;
      const x = cx + labelR * Math.cos(angle);
      const y = cy + labelR * Math.sin(angle);

      ctx.fillStyle = 'rgba(242, 237, 228, 0.45)';

      const angleDeg = ((angle * 180) / Math.PI + 360) % 360;
      if (angleDeg > 90 && angleDeg < 270) ctx.textAlign = 'right';
      else if ((angleDeg > 80 && angleDeg < 100) || (angleDeg > 260 && angleDeg < 280)) ctx.textAlign = 'center';
      else ctx.textAlign = 'left';
      if (angleDeg < 10 || angleDeg > 350) ctx.textAlign = 'center';
      if (angleDeg > 170 && angleDeg < 190) ctx.textAlign = 'center';

      const abbrev = labels[i]
        .replace('Blood Pressure', 'BP').replace('Blood Sugar', 'BS')
        .replace('Cholesterol', 'CHOL').replace('Resting HR', 'RHR')
        .replace('Body Fat', 'BF').replace('Muscle Mass', 'MM')
        .replace('Push-ups', 'PU').replace('5km Run', '5KM')
        .replace('Net Worth', 'NW').replace('Debt Level', 'DEBT')
        .replace('Savings Capacity', 'SAVE').replace('Emergency Fund', 'EMRG')
        .replace('Retirement Pot', 'RET').replace('FI Ratio', 'FI')
        .replace('Lifestyle Creep', 'LIFE').replace('Credit Score', 'CRED');

      ctx.fillText(abbrev.toUpperCase(), x, y);
    }
  }, [layers, labels, maxScore, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', margin: '0 auto', maxWidth: '100%' }}
    />
  );
}
