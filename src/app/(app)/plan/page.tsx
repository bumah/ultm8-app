'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { BLABELS } from '@/lib/scoring/health-scoring';
import { WBLABELS } from '@/lib/scoring/wealth-scoring';
import { BGRADES, getBehaviourTierIndex, getTierColor } from '@/lib/scoring/shared';
import { BRECS } from '@/lib/data/health-recommendations';
import { WBRECS } from '@/lib/data/wealth-recommendations';
import { HEALTH_PLAN } from '@/lib/data/health-plan';
import { WEALTH_PLAN } from '@/lib/data/wealth-plan';
import styles from './plan.module.css';

/* ── DB column keys ── */
const HEALTH_B_KEYS = [
  'b_sleep', 'b_smoking', 'b_strength', 'b_sweat',
  'b_sugar', 'b_salt', 'b_spirits', 'b_stress',
] as const;

const WEALTH_B_KEYS = [
  'b_income', 'b_spending', 'b_saving', 'b_debt',
  'b_investments', 'b_pension', 'b_protection', 'b_tax',
] as const;

/* ── Types ── */
interface AssessmentRow {
  [key: string]: unknown;
}

interface Recommendation {
  behaviourIndex: number;
  name: string;
  score: number;
  grade: string;
  color: string;
  direction: 'increase' | 'reduce' | 'maintain';
  rec: string;
  next: string;
}

/* ── Page ── */
export default function PlanPage() {
  const [loading, setLoading] = useState(true);
  const [healthAssessment, setHealthAssessment] = useState<AssessmentRow | null>(null);
  const [wealthAssessment, setWealthAssessment] = useState<AssessmentRow | null>(null);
  const [activeTab, setActiveTab] = useState<'health' | 'wealth'>('health');

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const [healthRes, wealthRes] = await Promise.all([
        supabase
          .from('health_assessments')
          .select('b_sleep, b_smoking, b_strength, b_sweat, b_sugar, b_salt, b_spirits, b_stress')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from('wealth_assessments')
          .select('b_income, b_spending, b_saving, b_debt, b_investments, b_pension, b_protection, b_tax')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(1)
          .single(),
      ]);

      setHealthAssessment(healthRes.data as AssessmentRow | null);
      setWealthAssessment(wealthRes.data as AssessmentRow | null);

      // Default tab: whichever has data (health first if both)
      if (healthRes.data) setActiveTab('health');
      else if (wealthRes.data) setActiveTab('wealth');

      setLoading(false);
    }
    load();
  }, []);

  function buildHealthRecs(): Recommendation[] {
    if (!healthAssessment) return [];
    return HEALTH_B_KEYS.map((key, i) => {
      const score = (healthAssessment[key] as number) || 1;
      const rec = BRECS[i]?.[score] || { rec: '', next: '' };
      return {
        behaviourIndex: i,
        name: BLABELS[i],
        score,
        grade: BGRADES[getBehaviourTierIndex(score)],
        color: getTierColor(score, 4),
        direction: HEALTH_PLAN[i].type === 'increase' ? 'increase' : 'reduce',
        rec: rec.rec,
        next: rec.next,
      };
    });
  }

  function buildWealthRecs(): Recommendation[] {
    if (!wealthAssessment) return [];
    return WEALTH_B_KEYS.map((key, i) => {
      const score = (wealthAssessment[key] as number) || 1;
      const rec = WBRECS[i]?.[score] || { rec: '', next: '' };
      return {
        behaviourIndex: i,
        name: WBLABELS[i],
        score,
        grade: BGRADES[getBehaviourTierIndex(score)],
        color: getTierColor(score, 4),
        direction: WEALTH_PLAN[i].type === 'increase' ? 'increase' : 'reduce',
        rec: rec.rec,
        next: rec.next,
      };
    });
  }

  const healthRecs = buildHealthRecs();
  const wealthRecs = buildWealthRecs();
  const hasHealth = !!healthAssessment;
  const hasWealth = !!wealthAssessment;
  const hasBoth = hasHealth && hasWealth;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading…</div>
      </div>
    );
  }

  /* ── Empty state ── */
  if (!hasHealth && !hasWealth) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.eyebrow}>Your Plan</div>
          <h1 className={styles.heading}>
            Your<br /><em>Recommendations.</em>
          </h1>
        </div>
        <div className={styles.emptyCard}>
          <div className={styles.emptyTitle}>No assessments yet</div>
          <p className={styles.emptyText}>
            Take your first assessment to see personalised recommendations for each behaviour.
          </p>
          <div className={styles.emptyLinks}>
            <Link href="/assess/health" className={styles.emptyLink}>
              Take Health Assessment &rarr;
            </Link>
            <Link href="/assess/wealth" className={styles.emptyLink}>
              Take Wealth Assessment &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const recs = activeTab === 'health' ? healthRecs : wealthRecs;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.eyebrow}>Your Plan</div>
        <h1 className={styles.heading}>
          Your<br /><em>Recommendations.</em>
        </h1>
        <p className={styles.sub}>
          Personalised guidance for each behaviour based on your latest assessment scores.
        </p>
      </div>

      {/* Tabs */}
      {hasBoth && (
        <div className={styles.typeTabs}>
          <button
            className={`${styles.typeTab} ${activeTab === 'health' ? styles.typeTabActive : ''}`}
            onClick={() => setActiveTab('health')}
          >
            Health
          </button>
          <button
            className={`${styles.typeTab} ${activeTab === 'wealth' ? styles.typeTabActive : ''}`}
            onClick={() => setActiveTab('wealth')}
          >
            Wealth
          </button>
        </div>
      )}

      {/* Missing type prompt */}
      {!hasBoth && (
        <div className={styles.missingPrompt}>
          <Link href={hasHealth ? '/assess/wealth' : '/assess/health'}>
            + Take {hasHealth ? 'Wealth' : 'Health'} Assessment
          </Link>
        </div>
      )}

      {/* Recommendation cards */}
      <div className={styles.recList}>
        {recs.map((r) => {
          const arrow = r.direction === 'increase' ? '↑' : '↓';
          return (
            <div className={styles.recCard} key={r.behaviourIndex}>
              <div className={styles.recHeader}>
                <div className={styles.recNameWrap}>
                  <span className={styles.recArrow} style={{ color: r.color }}>
                    {arrow}
                  </span>
                  <span className={styles.recName}>{r.name}</span>
                </div>
                <span className={styles.recGrade} style={{ color: r.color }}>
                  {r.grade}
                </span>
              </div>

              <p className={styles.recText}>{r.rec}</p>

              <div className={styles.recNextLabel}>Next step</div>
              <p className={styles.recNext}>{r.next}</p>

              <Link
                href={`/calendar?title=${encodeURIComponent(`${r.name}: ${r.next}`)}&category=${activeTab}`}
                className={styles.recAction}
              >
                + Schedule in Calendar
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
