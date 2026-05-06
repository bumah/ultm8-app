'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { BLABELS, HLABELS } from '@/lib/scoring/health-scoring';
import { WBLABELS, WHLABELS } from '@/lib/scoring/wealth-scoring';
import { signedScoreToRing } from '@/lib/scoring/shared';
import OctagonOverlay from '@/components/octagon/OctagonOverlay';
import styles from './compare.module.css';

const HEALTH_B_KEYS = [
  'b_sleep', 'b_smoking', 'b_strength', 'b_sweat',
  'b_sugar', 'b_salt', 'b_spirits', 'b_stress',
] as const;

const WEALTH_B_KEYS = [
  'b_active_income', 'b_passive_income', 'b_expenses', 'b_discretionary',
  'b_savings', 'b_debt_repayment', 'b_retirement', 'b_investment',
] as const;

// Distinct overlay colours — drawn from the v2 palette.
const COLORS = ['#F5F0E8', '#1D6FA4', '#C8241A', '#C49A2A'];

type CheckIn = {
  id: string;
  completed_at: string;
  scores: number[];           // 8 behaviour scores
  pct: number;                // behaviour_score_pct
};

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function ComparePage() {
  const params = useParams();
  const type = (params.type as string) === 'wealth' ? 'wealth' : 'health';

  const [loading, setLoading] = useState(true);
  const [checkins, setCheckins] = useState<CheckIn[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const labels = type === 'health' ? BLABELS : WBLABELS;
  const indicatorLabels = type === 'health' ? HLABELS : WHLABELS;

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const table = type === 'health' ? 'health_assessments' : 'wealth_assessments';
      const cols = (type === 'health' ? HEALTH_B_KEYS : WEALTH_B_KEYS).join(', ');

      const { data } = await supabase
        .from(table)
        .select(`id, completed_at, behaviour_score_pct, ${cols}`)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(20);

      const rows = ((data || []) as unknown) as Record<string, unknown>[];
      const keys = type === 'health' ? HEALTH_B_KEYS : WEALTH_B_KEYS;
      const items: CheckIn[] = rows.map(r => ({
        id: r.id as string,
        completed_at: r.completed_at as string,
        scores: keys.map(k => (r[k] as number) ?? 0),
        pct: (r.behaviour_score_pct as number) ?? 0,
      }));

      setCheckins(items);
      // Pre-select latest 2 for an instant comparison
      setSelected(new Set(items.slice(0, 2).map(i => i.id)));
      setLoading(false);
    }
    load();
  }, [type]);

  const layers = useMemo(() => {
    const picked = checkins.filter(c => selected.has(c.id));
    return picked.map((c, i) => ({
      // Octagon expects 1..maxScore; project signed scores onto 1..8.
      scores: c.scores.map(s => signedScoreToRing(s)),
      raw: c.scores,
      color: COLORS[i % COLORS.length],
      label: shortDate(c.completed_at),
      opacity: 0.18,
    }));
  }, [checkins, selected]);

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < COLORS.length) next.add(id);
      return next;
    });
  }

  // Signed scores are projected onto rings 2..8 via signedScoreToRing — maxScore=8.
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.eyebrow}>Compare</div>
        <h1 className={styles.heading}>
          {type === 'health' ? 'Health' : 'Wealth'}<br /><em>check-ins.</em>
        </h1>
        <p className={styles.sub}>
          Pick up to {COLORS.length} check-ins to overlay on the same octagon.
        </p>
      </div>

      <div className={styles.tabs}>
        <Link href="/compare/health" className={`${styles.tab} ${type === 'health' ? styles.tabActive : ''}`}>Health</Link>
        <Link href="/compare/wealth" className={`${styles.tab} ${type === 'wealth' ? styles.tabActive : ''}`}>Wealth</Link>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : checkins.length < 2 ? (
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>Not enough check-ins yet</div>
          <p className={styles.emptyText}>
            Complete at least two {type === 'health' ? 'weekly health' : 'monthly wealth'} check-ins to compare them here.
          </p>
        </div>
      ) : (
        <>
          {/* Overlay canvas */}
          <div className={styles.canvasWrap}>
            <OctagonOverlay
              layers={layers}
              labels={[...labels]}
              maxScore={8}
              size={320}
            />
          </div>

          {/* Legend */}
          <div className={styles.legend}>
            {layers.map(l => (
              <div key={l.label} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: l.color }} />
                <span className={styles.legendLabel}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* Selectable list */}
          <div className={styles.list}>
            <div className={styles.listLabel}>All check-ins</div>
            {checkins.map(c => {
              const isSelected = selected.has(c.id);
              const colorIdx = Array.from(selected).indexOf(c.id);
              const dotColor = isSelected ? COLORS[colorIdx % COLORS.length] : 'transparent';
              return (
                <button
                  key={c.id}
                  className={`${styles.row} ${isSelected ? styles.rowOn : ''}`}
                  onClick={() => toggle(c.id)}
                >
                  <span className={styles.rowDot} style={{ background: dotColor, borderColor: isSelected ? dotColor : 'var(--border)' }} />
                  <span className={styles.rowDate}>{shortDate(c.completed_at)}</span>
                  <span className={styles.rowPct}>{c.pct}%</span>
                </button>
              );
            })}
          </div>

          {/* Per-axis comparison */}
          <div className={styles.breakdown}>
            <div className={styles.breakdownLabel}>By behaviour</div>
            {labels.map((b, idx) => (
              <div key={b} className={styles.brRow}>
                <div className={styles.brName}>{b}</div>
                <div className={styles.brScores}>
                  {layers.map(l => (
                    <span
                      key={l.label}
                      className={styles.brScore}
                      style={{ color: l.color }}
                    >
                      {l.raw[idx] > 0 ? `+${l.raw[idx]}` : l.raw[idx]}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div className={styles.brHint}>
              Drives: {indicatorLabels.slice(0, 3).join(', ')}…
            </div>
          </div>
        </>
      )}
    </div>
  );
}
