'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { GOAL_TEMPLATES, type BaselineFigures, type GoalCategory } from '@/lib/data/goal-templates';
import { getIndicatorDef } from '@/lib/data/indicator-library';
import styles from '../more.module.css';

export default function GoalsPage() {
  const [baseline, setBaseline] = useState<BaselineFigures>({
    monthlyIncome: null, monthlyExpenses: null, heightCm: null, gender: null,
  });
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('monthly_income, monthly_expenses, height_cm, gender')
        .eq('id', user.id)
        .single();
      if (data) {
        setHasProfile(true);
        setBaseline({
          monthlyIncome: data.monthly_income ?? null,
          monthlyExpenses: data.monthly_expenses ?? null,
          heightCm: data.height_cm ?? null,
          gender: data.gender ?? null,
        });
      }
    }
    load();
  }, []);

  const grouped = (cat: GoalCategory) => GOAL_TEMPLATES.filter(g => g.category === cat);

  function buildGoalUrl(g: typeof GOAL_TEMPLATES[number]): string {
    const target = g.resolveTarget(baseline);
    const params = new URLSearchParams();
    if (target.value != null) params.set('suggestTarget', String(target.value));
    if (target.value2 != null) params.set('suggestTarget2', String(target.value2));
    params.set('suggestDurationDays', String(g.defaultDurationDays));
    return `/trends/${g.indicatorKey}?${params.toString()}`;
  }

  const renderList = (cat: GoalCategory) => (
    <div>
      {grouped(cat).map(g => {
        const target = g.resolveTarget(baseline);
        const def = getIndicatorDef(g.indicatorKey);
        return (
          <Link key={g.indicatorKey + g.name} href={buildGoalUrl(g)} className={styles.scheduleRow}>
            <div className={styles.scheduleBody}>
              <div className={styles.scheduleName}>{g.name}</div>
              <div className={styles.scheduleDesc}>{g.description}</div>
              <div className={styles.scheduleBadges}>
                <span className={`${styles.scheduleBadge} ${styles[`scheduleBadge_${g.category}`]}`}>
                  {def?.label ?? g.indicatorKey}
                </span>
                <span className={styles.scheduleBadge}>{target.display}</span>
              </div>
            </div>
            <span className={styles.eventAdd}>+ Set</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <div className={styles.container}>
      <Link href="/more" className={styles.back}>&larr; More</Link>

      <div className={styles.header}>
        <div className={styles.eyebrow}>ULTM8 Goals</div>
        <h1 className={styles.heading}>
          Benchmarks worth<br /><em>aiming for.</em>
        </h1>
        <p className={styles.sub}>
          Tap any benchmark to set it as a goal against the indicator. Targets are
          tuned to your baseline {hasProfile ? '\u2014 income, expenses, and height from your profile.' : '\u2014 sign in and complete your profile to personalise the numbers.'}
        </p>
      </div>

      <div className={styles.sectionLabel}>Health</div>
      {renderList('health')}

      <div className={styles.sectionLabel}>Wealth</div>
      {renderList('wealth')}

      {(!baseline.monthlyIncome || !baseline.monthlyExpenses) && (
        <p className={styles.eventDisclaimer}>
          Wealth targets use your monthly income + expenses. Add them on the
          <Link href="/profile" style={{ color: 'var(--action)', marginLeft: 4 }}>Profile</Link> page to personalise.
        </p>
      )}
    </div>
  );
}
