'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ActionPlan, DailyProgress, PlanBehaviour } from '@/types/database';
import styles from './plan.module.css';

import { generatePlan } from '@/lib/utils/plan-generator';
import Button from '@/components/ui/Button';

/* ── helpers ── */

function getTodayStr(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function getCurrentWeek(startDate: string): number {
  const today = new Date();
  const start = new Date(startDate);
  const daysDiff = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.min(8, Math.max(1, Math.floor(daysDiff / 7) + 1));
}

function getWeekDateRange(startDate: string, weekNum: number): { start: string; end: string } {
  const s = new Date(startDate);
  s.setDate(s.getDate() + (weekNum - 1) * 7);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return { start: fmt(s), end: fmt(e) };
}

function getPlanEndDate(startDate: string): string {
  const d = new Date(startDate);
  d.setDate(d.getDate() + 55); // 8 weeks - 1 day
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Parse the weekly target number from plan text.
 * e.g. "At least 3 sessions this week" -> 3
 *      "At least 7hrs, 5 nights" -> 5
 *      "At least 5 mins breathing daily" -> 7
 *      "No more than 2 sugary drinks this week" -> 7 (reduce = daily adherence)
 *      "Protect your 7-9hrs every night" -> 7
 */
function parseWeeklyTarget(target: string, direction: string): number {
  const t = target.toLowerCase();

  // "daily" / "every night" / "every morning" / "every day" = 7
  if (/daily|every\s*(night|morning|day)/.test(t)) return 7;

  // "X nights" / "X mornings"
  const nightMatch = t.match(/(\d+)\s*(?:nights?|mornings?)/);
  if (nightMatch) return parseInt(nightMatch[1], 10);

  // "X sessions" / "X walks" / "X times"
  const sessionMatch = t.match(/(\d+)\s*(?:sessions?|walks?|times?|occasions?)/);
  if (sessionMatch) return parseInt(sessionMatch[1], 10);

  // "X days" (explicit)
  const dayMatch = t.match(/(\d+)\s*(?:days?\s*(?:this\s*week)?)/);
  if (dayMatch) return parseInt(dayMatch[1], 10);

  // For reduce behaviours, the daily checkbox = "stuck to limit today" -> 7 days target
  if (direction === 'reduce') return 7;

  // "At least X+" (generic fallback for increase)
  const atLeastMatch = t.match(/at\s*least\s*(\d+)\+?\s*(?:session|walk|time)/);
  if (atLeastMatch) return parseInt(atLeastMatch[1], 10);

  // Fallback: 7 (treat as daily habit)
  return 7;
}

/* ── types ── */

interface PlanWithProgress {
  plan: ActionPlan;
  currentWeek: number;
  weekProgress: DailyProgress[];
}

interface HabitProgressData {
  behaviourIndex: number;
  behaviour: string;
  direction: 'increase' | 'reduce' | 'maintain';
  targetText: string;
  daysCompleted: number;
  weeklyTarget: number;
}

/* ── component ── */

export default function PlanPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<PlanWithProgress[]>([]);
  const [activeTab, setActiveTab] = useState<'health' | 'wealth'>('health');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [weekData, setWeekData] = useState<DailyProgress[]>([]);
  const [weekLoading, setWeekLoading] = useState(false);
  const [showRestart, setShowRestart] = useState(false);
  const [restartDate, setRestartDate] = useState(getTodayStr());
  const [restarting, setRestarting] = useState(false);

  /* ── fetch plans ── */
  const loadPlans = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: activePlans } = await supabase
      .from('action_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!activePlans || activePlans.length === 0) {
      setPlans([]);
      setLoading(false);
      return;
    }

    const results: PlanWithProgress[] = [];

    for (const plan of activePlans as ActionPlan[]) {
      const currentWeek = getCurrentWeek(plan.start_date);

      // Fetch current week's progress
      const { data: weekProgress } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('plan_id', plan.id)
        .eq('week_number', currentWeek)
        .order('date', { ascending: true })
        .order('behaviour_index', { ascending: true });

      results.push({
        plan,
        currentWeek,
        weekProgress: (weekProgress || []) as DailyProgress[],
      });
    }

    setPlans(results);

    // Set initial tab and week
    if (results.length > 0) {
      setActiveTab(results[0].plan.assessment_type);
      setSelectedWeek(results[0].currentWeek);
      setWeekData(results[0].weekProgress);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const activePlan = plans.find((p) => p.plan.assessment_type === activeTab);

  /* ── fetch week data when selected week changes ── */
  useEffect(() => {
    if (!activePlan) return;

    // If viewing the current week, use the data we already loaded
    if (selectedWeek === activePlan.currentWeek) {
      setWeekData(activePlan.weekProgress);
      return;
    }

    // Otherwise, fetch that week's data
    let cancelled = false;
    setWeekLoading(true);

    (async () => {
      const { data } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('plan_id', activePlan.plan.id)
        .eq('week_number', selectedWeek)
        .order('date', { ascending: true })
        .order('behaviour_index', { ascending: true });

      if (!cancelled) {
        setWeekData((data || []) as DailyProgress[]);
        setWeekLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activePlan, selectedWeek, supabase]);

  /* ── derive habit progress ── */
  const habits: HabitProgressData[] = [];
  if (activePlan) {
    const planBehaviours: PlanBehaviour[] = activePlan.plan.plan_data;

    for (let i = 0; i < planBehaviours.length; i++) {
      const b = planBehaviours[i];
      const targetText = b.weekly_targets[selectedWeek - 1] || '';
      const weeklyTarget = parseWeeklyTarget(targetText, b.direction);
      const weekRows = weekData.filter((dp) => dp.behaviour_index === i);
      const daysCompleted = weekRows.filter((dp) => dp.completed).length;

      habits.push({
        behaviourIndex: i,
        behaviour: b.behaviour,
        direction: b.direction,
        targetText,
        daysCompleted,
        weeklyTarget,
      });
    }
  }

  /* ── week overall percentage ── */
  const weekTotalTargets = habits.reduce((sum, h) => sum + h.weeklyTarget, 0);
  const weekTotalCompleted = habits.reduce((sum, h) => sum + Math.min(h.daysCompleted, h.weeklyTarget), 0);
  const weekOverallPct =
    weekTotalTargets > 0
      ? Math.round((weekTotalCompleted / weekTotalTargets) * 100)
      : 0;

  /* ── status helpers ── */
  function getStatus(
    daysCompleted: number,
    weeklyTarget: number,
    isCurrentOrFutureWeek: boolean
  ): 'achieved' | 'on-track' | 'behind' {
    if (daysCompleted >= weeklyTarget) return 'achieved';
    if (isCurrentOrFutureWeek) {
      // For current/future weeks, check if on pace
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
      const daysElapsed = dayOfWeek === 0 ? 7 : dayOfWeek; // treat Sunday as day 7
      const expectedPace = (weeklyTarget / 7) * daysElapsed;
      if (daysCompleted >= expectedPace * 0.7) return 'on-track';
      return 'behind';
    }
    // Past week, not achieved
    if (daysCompleted >= weeklyTarget * 0.7) return 'on-track';
    return 'behind';
  }

  function getStatusLabel(status: 'achieved' | 'on-track' | 'behind'): string {
    switch (status) {
      case 'achieved':
        return 'ACHIEVED';
      case 'on-track':
        return 'IN PROGRESS';
      case 'behind':
        return 'BEHIND';
    }
  }

  function getStatusClass(status: 'achieved' | 'on-track' | 'behind'): string {
    switch (status) {
      case 'achieved':
        return styles.statusAchieved;
      case 'on-track':
        return styles.statusOnTrack;
      case 'behind':
        return styles.statusBehind;
    }
  }

  /* ── tab switching ── */
  const handleTabSwitch = (type: 'health' | 'wealth') => {
    setActiveTab(type);
    const plan = plans.find((p) => p.plan.assessment_type === type);
    if (plan) {
      setSelectedWeek(plan.currentWeek);
    }
  };

  /* ── Restart plan handler ── */
  const handleRestartPlan = useCallback(async () => {
    if (!activePlan) return;
    setRestarting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const plan = activePlan.plan;

    // Delete existing daily_progress rows for this plan
    await supabase.from('daily_progress').delete().eq('plan_id', plan.id);

    // Update the plan's start_date
    await supabase.from('action_plans').update({
      start_date: restartDate,
    }).eq('id', plan.id);

    // Regenerate daily progress rows from new start date
    const bScores = (plan.plan_data as PlanBehaviour[]).map((b) => {
      // We don't have the original scores, but we can infer the track index
      // from the plan data. The plan was already generated correctly.
      return 1; // placeholder — we regenerate from existing plan_data directly
    });

    // Generate rows directly from plan_data
    const dailyRows: { date: string; week_number: number; behaviour_index: number; behaviour_name: string; target_text: string }[] = [];
    const startDate = new Date(restartDate);
    for (let day = 0; day < 56; day++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + day);
      const weekNum = Math.floor(day / 7) + 1;
      const dateStr = date.toISOString().split('T')[0];
      for (let b = 0; b < (plan.plan_data as PlanBehaviour[]).length; b++) {
        const behaviour = (plan.plan_data as PlanBehaviour[])[b];
        dailyRows.push({
          date: dateStr,
          week_number: weekNum,
          behaviour_index: b,
          behaviour_name: behaviour.behaviour,
          target_text: behaviour.weekly_targets[weekNum - 1],
        });
      }
    }

    // Insert in batches
    const progressRows = dailyRows.map(r => ({
      user_id: user.id,
      plan_id: plan.id,
      ...r,
      completed: false,
    }));
    for (let i = 0; i < progressRows.length; i += 100) {
      await supabase.from('daily_progress').insert(progressRows.slice(i, i + 100));
    }

    setShowRestart(false);
    setRestarting(false);
    // Reload
    loadPlans();
  }, [activePlan, restartDate, supabase, loadPlans]);

  const isCurrentOrFutureWeek = activePlan
    ? selectedWeek >= activePlan.currentWeek
    : false;

  /* ── render ── */

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <div className={styles.loadingText}>Loading Plan</div>
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.eyebrow}>8-Week Plan</div>
          <h1 className={styles.heading}>
            YOUR
            <br />
            <em>Plan.</em>
          </h1>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyCard}>
            <h3 className={styles.emptyTitle}>No Active Plan</h3>
            <p className={styles.emptyText}>
              Complete an assessment to generate your personalised 8-week action
              plan.
            </p>
            <div className={styles.assessLinks}>
              <a href="/assess/health" className={styles.assessLink}>
                <span className={styles.assessIcon}>+</span>
                <div>
                  <strong>Health Assessment</strong>
                  <span>8 behaviours to build your health plan</span>
                </div>
              </a>
              <a href="/assess/wealth" className={styles.assessLink}>
                <span className={styles.assessIcon}>+</span>
                <div>
                  <strong>Wealth Assessment</strong>
                  <span>8 behaviours to build your wealth plan</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const healthPlan = plans.find((p) => p.plan.assessment_type === 'health');
  const wealthPlan = plans.find((p) => p.plan.assessment_type === 'wealth');
  const hasBothPlans = !!healthPlan && !!wealthPlan;

  const planIsCompleted = activePlan ? activePlan.currentWeek > 8 : false;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.eyebrow}>8-Week Plan</div>
        <h1 className={styles.heading}>
          YOUR
          <br />
          <em>Plan.</em>
        </h1>
      </div>

      {/* Type tabs */}
      {hasBothPlans && (
        <div className={styles.typeTabs}>
          <button
            className={`${styles.typeTab} ${
              activeTab === 'health' ? styles.typeTabActive : ''
            }`}
            onClick={() => handleTabSwitch('health')}
          >
            Health
          </button>
          <button
            className={`${styles.typeTab} ${
              activeTab === 'wealth' ? styles.typeTabActive : ''
            }`}
            onClick={() => handleTabSwitch('wealth')}
          >
            Wealth
          </button>
        </div>
      )}

      {activePlan && !planIsCompleted && (
        <>
          {/* Week indicator with dates */}
          <div className={styles.weekIndicator}>
            <div className={styles.weekLabel}>
              Week {selectedWeek} of 8
              {selectedWeek === activePlan.currentWeek && (
                <span className={styles.currentBadge}>Current</span>
              )}
            </div>
            <div className={styles.weekDates}>
              {(() => {
                const range = getWeekDateRange(activePlan.plan.start_date, selectedWeek);
                return `${range.start} – ${range.end}`;
              })()}
            </div>
            <div className={styles.weekEndDate}>
              Ends {getPlanEndDate(activePlan.plan.start_date)}
            </div>
          </div>

          {/* Week selector pills — future weeks locked */}
          <div className={styles.weekSelector}>
            {Array.from({ length: 8 }, (_, i) => {
              const weekNum = i + 1;
              const isPast = weekNum < activePlan.currentWeek;
              const isCurrent = weekNum === activePlan.currentWeek;
              const isFuture = weekNum > activePlan.currentWeek;
              return (
                <button
                  key={weekNum}
                  className={`${styles.weekPill} ${
                    selectedWeek === weekNum ? styles.weekPillActive : ''
                  } ${isPast && selectedWeek !== weekNum ? styles.weekPillPast : ''} ${
                    isFuture ? styles.weekPillLocked : ''
                  }`}
                  onClick={() => {
                    if (!isFuture) setSelectedWeek(weekNum);
                  }}
                  disabled={isFuture}
                  title={isFuture ? 'Future week — locked' : undefined}
                >
                  {isFuture ? '🔒' : `W${weekNum}`}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Habit progress cards */}
          {weekLoading ? (
            <div className={styles.loading}>
              <div className={styles.spinner} />
            </div>
          ) : (
            <div className={styles.habitList}>
              {habits.map((habit) => {
                const status = getStatus(
                  habit.daysCompleted,
                  habit.weeklyTarget,
                  isCurrentOrFutureWeek
                );
                const statusLabel = getStatusLabel(status);
                const statusClass = getStatusClass(status);
                const arrowChar =
                  habit.direction === 'increase'
                    ? '\u2191'
                    : habit.direction === 'reduce'
                      ? '\u2193'
                      : '\u2194';
                const arrowClass =
                  habit.direction === 'increase'
                    ? styles.arrowIncrease
                    : habit.direction === 'reduce'
                      ? styles.arrowReduce
                      : styles.arrowMaintain;

                // Dots: show weeklyTarget dots, fill based on daysCompleted
                const dotCount = habit.weeklyTarget;

                return (
                  <div key={habit.behaviourIndex} className={styles.habitCard}>
                    {/* Left: arrow + name + target text */}
                    <div className={styles.habitLeft}>
                      <div className={styles.habitHeader}>
                        <span className={`${styles.habitArrow} ${arrowClass}`}>
                          {arrowChar}
                        </span>
                        <span className={styles.habitName}>
                          {habit.behaviour}
                        </span>
                      </div>
                      <div className={styles.habitTarget}>
                        {habit.targetText}
                      </div>
                    </div>

                    {/* Right: dots + count + status */}
                    <div className={styles.habitRight}>
                      <div className={styles.habitDots}>
                        {Array.from({ length: dotCount }, (_, di) => (
                          <div
                            key={di}
                            className={`${styles.habitDot} ${
                              di < habit.daysCompleted
                                ? styles.habitDotFilled
                                : ''
                            }`}
                          />
                        ))}
                      </div>
                      <div className={styles.habitCountRow}>
                        <span className={styles.habitCountLabel}>
                          This week:
                        </span>
                        <span className={styles.habitCount}>
                          {habit.daysCompleted}/{habit.weeklyTarget}
                        </span>
                      </div>
                      <div className={`${styles.statusBadge} ${statusClass}`}>
                        <span className={styles.statusDot}>
                          {status === 'achieved' ? '\u25CF' : '\u25CB'}
                        </span>
                        {statusLabel}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Divider */}
          {!weekLoading && habits.length > 0 && (
            <>
              <div className={styles.divider} />

              {/* Week summary */}
              <div className={styles.weekSummary}>
                <span className={styles.weekSummaryLabel}>
                  Week {selectedWeek} Overall:
                </span>
                <span className={styles.weekSummaryPct}>{weekOverallPct}%</span>
              </div>
            </>
          )}
        </>
      )}

      {/* Plan completed state */}
      {activePlan && planIsCompleted && (
        <div className={styles.planCompleted}>
          <div className={styles.planCompletedBadge}>
            8-Week Plan Complete
          </div>
          <div className={styles.planCompletedSub}>
            Retake your {activeTab} assessment to generate a new plan, or restart this one.
          </div>
        </div>
      )}

      {/* Restart plan */}
      {activePlan && (
        <div className={styles.restartSection}>
          {!showRestart ? (
            <button
              className={styles.restartToggle}
              onClick={() => { setRestartDate(getTodayStr()); setShowRestart(true); }}
            >
              ↻ Restart Plan
            </button>
          ) : (
            <div className={styles.restartCard}>
              <div className={styles.restartTitle}>Restart Plan</div>
              <p className={styles.restartText}>
                This will reset all progress and start from Week 1 with the same plan targets.
              </p>
              <div className={styles.restartDateWrap}>
                <label className={styles.restartDateLabel}>Start from</label>
                <input
                  type="date"
                  className={styles.restartDateInput}
                  value={restartDate}
                  onChange={(e) => setRestartDate(e.target.value)}
                  min={getTodayStr()}
                />
              </div>
              <div className={styles.restartActions}>
                <Button onClick={handleRestartPlan} disabled={restarting}>
                  {restarting ? 'Restarting...' : 'Confirm Restart'}
                </Button>
                <Button variant="ghost" onClick={() => setShowRestart(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
