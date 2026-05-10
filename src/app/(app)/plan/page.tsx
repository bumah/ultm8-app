'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { BLABELS, HLABELS } from '@/lib/scoring/health-scoring';
import { WBLABELS, WHLABELS } from '@/lib/scoring/wealth-scoring';
import { levelFromPct } from '@/lib/scoring/shared';
import {
  HEALTH_AXES, WEALTH_AXES,
  buildHealthAxes, buildWealthAxes, avgIndicatorPct,
} from '@/lib/data/composites';
import CompositeOctagon from '@/components/composites/CompositeOctagon';
import PillarAccordion, { type PillarRow } from '@/components/composites/PillarAccordion';
import styles from './plan.module.css';

/* ── DB column keys ── */
const HEALTH_B_KEYS = [
  'b_sleep', 'b_smoking', 'b_strength', 'b_sweat',
  'b_sugar', 'b_salt', 'b_spirits', 'b_stress',
] as const;

const WEALTH_B_KEYS = [
  'b_active_income', 'b_passive_income', 'b_expenses', 'b_discretionary',
  'b_savings', 'b_debt_repayment', 'b_retirement', 'b_investment',
] as const;

const HEALTH_I_KEYS = [
  'is_blood_pressure', 'is_weight', 'is_pushups', 'is_resting_hr',
  'is_body_fat', 'is_sleep_quality', 'is_blood_sugar', 'is_wellbeing',
] as const;

const WEALTH_I_KEYS = [
  'is_net_income', 'is_discretionary_spend', 'is_emergency_fund', 'is_debt_level',
  'is_net_worth', 'is_pension_fund', 'is_passive_income', 'is_fi_ratio',
] as const;

/** Behaviour slug strings used by personal-challenges `targets`. */
const HEALTH_BEHAVIOUR_SLUGS = [
  'sleep', 'smoking', 'strength', 'sweat', 'sugar', 'salt', 'spirits', 'stress',
] as const;

const WEALTH_BEHAVIOUR_SLUGS = [
  'active_income', 'passive_income', 'expenses', 'discretionary',
  'savings', 'debt_repayment', 'retirement', 'investment',
] as const;

interface AssessmentRow {
  octagon_score_pct?: number;
  behaviour_score_pct?: number;
  indicator_score_pct?: number;
  [key: string]: unknown;
}

export default function PlanPage() {
  const [loading, setLoading] = useState(true);
  const [healthAssessment, setHealthAssessment] = useState<AssessmentRow | null>(null);
  const [wealthAssessment, setWealthAssessment] = useState<AssessmentRow | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [healthRes, wealthRes] = await Promise.all([
        supabase
          .from('health_assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('wealth_assessments')
          .select('*')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      setHealthAssessment(healthRes.data as AssessmentRow | null);
      setWealthAssessment(wealthRes.data as AssessmentRow | null);
      setLoading(false);
    }
    load();
  }, []);

  /* ── Composite axes (raw scores for accordion rows) ── */
  const healthScores = useMemo(() => {
    if (!healthAssessment) return null;
    return {
      b: HEALTH_B_KEYS.map(k => (healthAssessment[k] as number) ?? 0),
      i: HEALTH_I_KEYS.map(k => (healthAssessment[k] as number) ?? 0),
    };
  }, [healthAssessment]);

  const wealthScores = useMemo(() => {
    if (!wealthAssessment) return null;
    return {
      b: WEALTH_B_KEYS.map(k => (wealthAssessment[k] as number) ?? 0),
      i: WEALTH_I_KEYS.map(k => (wealthAssessment[k] as number) ?? 0),
    };
  }, [wealthAssessment]);

  const healthAxes = useMemo(
    () => healthScores ? buildHealthAxes(healthScores.b, healthScores.i) : null,
    [healthScores],
  );
  const wealthAxes = useMemo(
    () => wealthScores ? buildWealthAxes(wealthScores.b, wealthScores.i) : null,
    [wealthScores],
  );

  const overallLevel = useMemo(() => {
    const all = (healthAxes ?? []).concat(wealthAxes ?? []);
    if (all.length === 0) return null;
    return levelFromPct(avgIndicatorPct(all));
  }, [healthAxes, wealthAxes]);

  /* ── Build pillar rows for the accordion ── */
  const pillarRows = useMemo<PillarRow[]>(() => {
    const rows: PillarRow[] = [];
    if (healthAxes && healthScores) {
      HEALTH_AXES.forEach((def, i) => {
        rows.push({
          axis: healthAxes[i],
          indicatorLabels: def.indicatorIndices.map(idx => HLABELS[idx]),
          indicatorScores: def.indicatorIndices.map(idx => healthScores.i[idx] ?? 0),
          behaviourLabels: def.behaviourIndices.map(idx => BLABELS[idx]),
          behaviourScores: def.behaviourIndices.map(idx => healthScores.b[idx] ?? 0),
          behaviourSlugs: def.behaviourIndices.map(idx => HEALTH_BEHAVIOUR_SLUGS[idx]),
          domain: 'health',
        });
      });
    }
    if (wealthAxes && wealthScores) {
      WEALTH_AXES.forEach((def, i) => {
        rows.push({
          axis: wealthAxes[i],
          indicatorLabels: def.indicatorIndices.map(idx => WHLABELS[idx]),
          indicatorScores: def.indicatorIndices.map(idx => wealthScores.i[idx] ?? 0),
          behaviourLabels: def.behaviourIndices.map(idx => WBLABELS[idx]),
          behaviourScores: def.behaviourIndices.map(idx => wealthScores.b[idx] ?? 0),
          behaviourSlugs: def.behaviourIndices.map(idx => WEALTH_BEHAVIOUR_SLUGS[idx]),
          domain: 'wealth',
        });
      });
    }
    return rows;
  }, [healthAxes, wealthAxes, healthScores, wealthScores]);

  const hasHealth = !!healthAssessment;
  const hasWealth = !!wealthAssessment;
  const hasBoth = hasHealth && hasWealth;
  const allAxes = (healthAxes ?? []).concat(wealthAxes ?? []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading{'\u2026'}</div>
      </div>
    );
  }

  /* ── Empty state ── */
  if (!hasHealth && !hasWealth) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.eyebrow}>Plan</div>
          <h1 className={styles.heading}>
            Your<br /><em>recommendations.</em>
          </h1>
        </div>
        <div className={styles.emptyCard}>
          <div className={styles.emptyTitle}>No check-ins yet</div>
          <p className={styles.emptyText}>
            Take your first check-in to see your octagon, level, and personalised recommendations.
          </p>
          <div className={styles.emptyLinks}>
            <Link href="/assess" className={styles.emptyLink}>
              Start check-in &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.eyebrow}>Plan</div>
        <h1 className={styles.heading}>
          Your<br /><em>recommendations.</em>
        </h1>
      </div>

      {!hasBoth && (
        <div className={styles.missingPrompt}>
          <Link href="/assess">
            + Complete your check-in
          </Link>
        </div>
      )}

      {/* Composite octagon \u2014 indicator-led. Always combined: 4 health + 4 wealth
          when both exist, otherwise the 4 of the available domain. */}
      {allAxes.length > 0 && (
        <div className={styles.octBlock}>
          {overallLevel && (
            <div className={styles.octLevel} style={{ color: overallLevel.color }}>
              {overallLevel.label}
            </div>
          )}
          <div className={styles.octChart}>
            <CompositeOctagon
              axes={allAxes}
              size={260}
              showLabels
            />
          </div>
          <Link href="/assess" className={styles.checkinBtn}>
            New check-in {'\u2192'}
          </Link>
        </div>
      )}

      {/* 8-pillar accordion: indicator + behaviour + recommended challenges. */}
      {pillarRows.length > 0 && (
        <PillarAccordion rows={pillarRows} title="Pillars" />
      )}
    </div>
  );
}
