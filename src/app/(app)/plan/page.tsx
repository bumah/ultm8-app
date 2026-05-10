'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { BLABELS } from '@/lib/scoring/health-scoring';
import { WBLABELS } from '@/lib/scoring/wealth-scoring';
import {
  BGRADES, getBehaviourTierIndex, getTierColor, signedScoreToRing, levelFromPct,
} from '@/lib/scoring/shared';
import { BRECS } from '@/lib/data/health-recommendations';
import { WBRECS } from '@/lib/data/wealth-recommendations';
import { HEALTH_PLAN } from '@/lib/data/health-plan';
import { WEALTH_PLAN } from '@/lib/data/wealth-plan';
import {
  PERSONAL_CHALLENGES, challengeEndDate,
  type PersonalChallenge,
} from '@/lib/data/personal-challenges';
import OctagonChart from '@/components/octagon/OctagonChart';
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

export default function PlanPage() {
  const [loading, setLoading] = useState(true);
  const [healthAssessment, setHealthAssessment] = useState<AssessmentRow | null>(null);
  const [wealthAssessment, setWealthAssessment] = useState<AssessmentRow | null>(null);
  const [activeTab, setActiveTab] = useState<'health' | 'wealth'>('health');

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

      if (healthRes.data) setActiveTab('health');
      else if (wealthRes.data) setActiveTab('wealth');

      setLoading(false);
    }
    load();
  }, []);

  /* ── Recommendations ── */
  const healthRecs = useMemo<Recommendation[]>(() => {
    if (!healthAssessment) return [];
    return HEALTH_B_KEYS.map((key, i) => {
      const score = (healthAssessment[key] as number) ?? 0;
      const rec = BRECS[i]?.[score] || { rec: '', next: '' };
      return {
        behaviourIndex: i,
        name: BLABELS[i],
        score,
        grade: BGRADES[getBehaviourTierIndex(score)],
        color: getTierColor(score),
        direction: HEALTH_PLAN[i].type === 'increase' ? 'increase' : 'reduce',
        rec: rec.rec,
        next: rec.next ?? '',
      };
    });
  }, [healthAssessment]);

  const wealthRecs = useMemo<Recommendation[]>(() => {
    if (!wealthAssessment) return [];
    return WEALTH_B_KEYS.map((key, i) => {
      const score = (wealthAssessment[key] as number) ?? 0;
      const rec = WBRECS[i]?.[score] || { rec: '', next: '' };
      return {
        behaviourIndex: i,
        name: WBLABELS[i],
        score,
        grade: BGRADES[getBehaviourTierIndex(score)],
        color: getTierColor(score),
        direction: WEALTH_PLAN[i].type === 'increase' ? 'increase' : 'reduce',
        rec: rec.rec,
        next: rec.next ?? '',
      };
    });
  }, [wealthAssessment]);

  /* ── Octagon scores (signed -> ring) ── */
  const healthOctagon = useMemo(() => {
    if (!healthAssessment) return null;
    const scores = HEALTH_B_KEYS.map(k => signedScoreToRing((healthAssessment[k] as number) ?? 0));
    const pct = (healthAssessment.octagon_score_pct as number) ?? 0;
    return { scores, level: levelFromPct(pct) };
  }, [healthAssessment]);

  const wealthOctagon = useMemo(() => {
    if (!wealthAssessment) return null;
    const scores = WEALTH_B_KEYS.map(k => signedScoreToRing((wealthAssessment[k] as number) ?? 0));
    const pct = (wealthAssessment.octagon_score_pct as number) ?? 0;
    return { scores, level: levelFromPct(pct) };
  }, [wealthAssessment]);

  /* ── Suggested challenges from weak behaviours ── */
  const suggestedChallenges = useMemo<PersonalChallenge[]>(() => {
    const assessment = activeTab === 'health' ? healthAssessment : wealthAssessment;
    if (!assessment) return [];
    const slugs = activeTab === 'health' ? HEALTH_BEHAVIOUR_SLUGS : WEALTH_BEHAVIOUR_SLUGS;
    const keys = activeTab === 'health' ? HEALTH_B_KEYS : WEALTH_B_KEYS;

    // Sort behaviours by score asc \u2014 weakest first.
    const ranked = slugs
      .map((slug, i) => ({ slug, score: (assessment[keys[i]] as number) ?? 0 }))
      .sort((a, b) => a.score - b.score);

    // Pull challenges that target each weak behaviour, dedupe by slug.
    const out: PersonalChallenge[] = [];
    const seen = new Set<string>();
    for (const b of ranked) {
      if (b.score >= 1) break; // only suggest for behaviours scoring 0 or below
      const matches = PERSONAL_CHALLENGES.filter(c => c.targets.includes(b.slug));
      for (const m of matches) {
        if (seen.has(m.slug)) continue;
        seen.add(m.slug);
        out.push(m);
        if (out.length >= 6) break;
      }
      if (out.length >= 6) break;
    }
    return out;
  }, [activeTab, healthAssessment, wealthAssessment]);

  const hasHealth = !!healthAssessment;
  const hasWealth = !!wealthAssessment;
  const hasBoth = hasHealth && hasWealth;

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading\u2026</div>
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
            Take your first assessment to see your octagon, level, and personalised recommendations.
          </p>
          <div className={styles.emptyLinks}>
            <Link href="/assess/health" className={styles.emptyLink}>
              Health check-in &rarr;
            </Link>
            <Link href="/assess/wealth" className={styles.emptyLink}>
              Wealth check-in &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const recs = activeTab === 'health' ? healthRecs : wealthRecs;
  const labels = activeTab === 'health' ? BLABELS : WBLABELS;
  const oct = activeTab === 'health' ? healthOctagon : wealthOctagon;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.eyebrow}>Plan</div>
        <h1 className={styles.heading}>
          Your<br /><em>recommendations.</em>
        </h1>
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

      {!hasBoth && (
        <div className={styles.missingPrompt}>
          <Link href={hasHealth ? '/assess/wealth' : '/assess/health'}>
            + Take {hasHealth ? 'Wealth' : 'Health'} check-in
          </Link>
        </div>
      )}

      {/* Octagon + level */}
      {oct && (
        <div className={styles.octBlock}>
          <div className={styles.octLevel} style={{ color: oct.level.color }}>
            {oct.level.label}
          </div>
          <div className={styles.octChart}>
            <OctagonChart
              scores={oct.scores}
              labels={[...labels]}
              maxScore={8}
              size={260}
              showLabels
              showScores={false}
            />
          </div>
          <Link
            href={`/assess/${activeTab}`}
            className={styles.checkinBtn}
          >
            New {activeTab} check-in {'\u2192'}
          </Link>
        </div>
      )}

      {/* Suggested challenges */}
      {suggestedChallenges.length > 0 && (
        <div className={styles.suggestionsBlock}>
          <div className={styles.sectionLabel}>Suggested challenges</div>
          <p className={styles.sectionHint}>
            Habit streaks that target the behaviours scoring lowest in your last check-in.
          </p>
          <div className={styles.suggestionList}>
            {suggestedChallenges.map(c => (
              <Link
                key={c.slug}
                href={`/calendar?title=${encodeURIComponent(c.name)}&category=${c.category}&recurFreq=${c.cadence}&recurInterval=1&recurEndDate=${challengeEndDate(c)}`}
                className={styles.suggestionRow}
              >
                <div className={styles.suggestionBody}>
                  <div className={styles.suggestionName}>{c.short}</div>
                  <div className={styles.suggestionMeta}>
                    {c.cadence === 'daily' ? 'Daily' : c.cadence === 'weekly' ? 'Weekly' : 'Monthly'}
                    {' \u00B7 '}
                    {c.durationCount} {c.durationUnit}
                  </div>
                </div>
                <span className={styles.suggestionAdd}>+ Take</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation cards */}
      <div className={styles.sectionLabel}>Behaviour recommendations</div>
      <div className={styles.recList}>
        {recs.map((r) => {
          const arrow = r.direction === 'increase' ? '\u2191' : '\u2193';
          return (
            <div className={styles.recCard} key={r.behaviourIndex}>
              <div className={styles.recHeader}>
                <div className={styles.recNameWrap}>
                  <span className={styles.recArrow} style={{ color: r.color }}>{arrow}</span>
                  <span className={styles.recName}>{r.name}</span>
                </div>
                <span className={styles.recGrade} style={{ color: r.color }}>{r.grade}</span>
              </div>
              <p className={styles.recText}>{r.rec}</p>
              {r.next && (
                <>
                  <div className={styles.recNextLabel}>Next step</div>
                  <p className={styles.recNext}>{r.next}</p>
                </>
              )}
              <Link
                href={`/calendar?title=${encodeURIComponent(`${r.name}: ${r.next || r.rec.slice(0, 60)}`)}&category=${activeTab}`}
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
