'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ActionPlan, DailyProgress, PlanBehaviour } from '@/types/database';
import styles from './calendar.module.css';

/* ── helpers ── */

const DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

const MONTH_NAMES_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekEnd(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getTodayStr(): string {
  return toDateStr(new Date());
}

function getWeekDates(weekStart: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatWeekLabel(weekStart: Date): string {
  return `Week of ${MONTH_NAMES[weekStart.getMonth()]} ${weekStart.getDate()}, ${weekStart.getFullYear()}`;
}

function formatDayDetailTitle(date: Date): string {
  const dayIdx = (date.getDay() + 6) % 7; // 0=Mon
  const dayName = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'][dayIdx];
  return `${dayName}, ${MONTH_NAMES_FULL[date.getMonth()].toUpperCase()} ${date.getDate()}`;
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

/**
 * Convert a verbose weekly target into a short daily action.
 * "At least 3 sessions, 30 mins each" -> "30 min session"
 * "At least 7hrs, 5 nights" -> "7hrs+ sleep"
 * "No more than 2 sugary drinks this week" -> "No sugary drinks"
 * "No sugary drinks - limit sugary meals to 1" -> "No sugary drinks"
 * "At least 5 mins breathing daily" -> "5 min breathing"
 * "Save a fixed amount on payday" -> "Save on payday"
 */
function toDailyAction(target: string, behaviour: string, direction: string): string {
  const t = target;

  // Sleep: extract hours target
  const sleepMatch = t.match(/(\d+(?:\.\d+)?(?:-\d+)?)\s*hrs?/i);
  if (sleepMatch && behaviour.toLowerCase() === 'sleep') {
    return `${sleepMatch[1]}hrs+ tonight`;
  }

  // Breathing/stress: extract minutes
  const breathMatch = t.match(/(\d+)\s*mins?\s*(breathing|daily)/i);
  if (breathMatch) return `${breathMatch[1]} min breathing`;

  // Sessions: extract duration or just say "session today"
  const sessionDurMatch = t.match(/(\d+)\s*mins?\s*each/i);
  if (sessionDurMatch) return `${sessionDurMatch[1]} min session`;
  if (/session/i.test(t) && !/track|review/i.test(t)) return 'Session today';

  // Walks
  if (/walk/i.test(t)) {
    const walkDur = t.match(/(\d+)\s*mins?/i);
    return walkDur ? `${walkDur[1]} min walk` : 'Walk today';
  }

  // Elevated HR
  if (/elevated\s*hr/i.test(t)) {
    const hrDur = t.match(/(\d+)\s*mins?/i);
    return hrDur ? `${hrDur[1]} min cardio` : 'Cardio session';
  }

  // "No sugary drinks" / "No salty meals" / "No alcohol" / "Smoke-free"
  if (/smoke.free|stay smoke/i.test(t)) return 'Smoke-free today';
  if (/no\s+sugary\s+drinks/i.test(t)) return 'No sugary drinks';
  if (/no\s+salty/i.test(t)) return 'No salty meals';
  if (/no\s+alcohol/i.test(t)) return 'No alcohol today';
  if (/no\s+added\s+sugar/i.test(t)) return 'No added sugar';

  // "Limit to X per day" -> "Max X today"
  const limitMatch = t.match(/limit\s+to\s+(\d+)\s+per\s+day/i);
  if (limitMatch) return `Max ${limitMatch[1]} today`;

  // "No more than X [thing] this week" -> just the limit action
  const noMoreMatch = t.match(/no\s+more\s+than\s+\d+\s+(.*?)(?:\s+this\s+week)?$/i);
  if (noMoreMatch) {
    const thing = noMoreMatch[1].replace(/\s+this\s+week/i, '').trim();
    return `Limit ${thing}`;
  }

  // Reduce: generic "Stick to limit"
  if (direction === 'reduce' && t.length > 40) return 'Stick to limit today';

  // Wealth: common patterns
  if (/track|review|check|confirm|identify|research|open|set up|list|order/i.test(t)) {
    const shortened = t
      .replace(/\s+this\s+week/gi, '')
      .replace(/\s+this\s+month/gi, '')
      .replace(/\s+— .*$/g, '');
    return shortened.length > 35 ? shortened.slice(0, 32) + '...' : shortened;
  }

  // Fallback: truncate if too long
  if (t.length > 35) {
    return t.slice(0, 32).replace(/\s+\S*$/, '') + '...';
  }

  return t;
}

/* ── types ── */

interface PlanInfo {
  plan: ActionPlan;
  type: 'health' | 'wealth';
}

interface DayData {
  date: Date;
  dateStr: string;
  isToday: boolean;
  isFuture: boolean;
  isPast: boolean;
  progress: DailyProgress[];
  hasAnyCompleted: boolean;
}

interface DetailTask {
  progressRow: DailyProgress | null;
  behaviourIndex: number;
  behaviour: string;
  direction: 'increase' | 'reduce' | 'maintain';
  target: string;
  dailyAction: string;
  completed: boolean;
  planType: 'health' | 'wealth';
  planId: string;
  targetAchieved: boolean;
}

/* ── component ── */

export default function CalendarPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [weekProgress, setWeekProgress] = useState<DailyProgress[]>([]);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(null);
  const [weekLoading, setWeekLoading] = useState(false);

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => getTodayStr(), []);
  const currentWeekStart = useMemo(() => getWeekStart(new Date()), []);
  const isCurrentWeek = isSameDay(weekStart, currentWeekStart);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const weekEndDate = useMemo(() => getWeekEnd(weekStart), [weekStart]);

  /* ── plan ID -> type map ── */
  const planTypeMap = useMemo(() => {
    const map = new Map<string, 'health' | 'wealth'>();
    for (const p of plans) {
      map.set(p.plan.id, p.type);
    }
    return map;
  }, [plans]);

  /* ── load active plans ── */
  const loadPlans = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

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

    const planInfos: PlanInfo[] = (activePlans as ActionPlan[]).map((p) => ({
      plan: p,
      type: p.assessment_type,
    }));

    setPlans(planInfos);
    setLoading(false);
  }, [supabase]);

  /* ── load week progress ── */
  const loadWeekProgress = useCallback(async () => {
    if (plans.length === 0) return;

    setWeekLoading(true);

    const weekStartStr = toDateStr(weekStart);
    const weekEndStr = toDateStr(weekEndDate);

    const planIds = plans.map((p) => p.plan.id);

    const { data } = await supabase
      .from('daily_progress')
      .select('*')
      .in('plan_id', planIds)
      .gte('date', weekStartStr)
      .lte('date', weekEndStr)
      .order('date', { ascending: true })
      .order('behaviour_index', { ascending: true });

    setWeekProgress((data || []) as DailyProgress[]);
    setWeekLoading(false);
  }, [supabase, plans, weekStart, weekEndDate]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    if (plans.length > 0) {
      loadWeekProgress();
    }
  }, [plans, loadWeekProgress]);

  /* ── Auto-select today when on current week ── */
  useEffect(() => {
    if (isCurrentWeek) {
      const todayIdx = weekDates.findIndex((d) => isSameDay(d, today));
      if (todayIdx >= 0) {
        setSelectedDayIdx(todayIdx);
      }
    } else {
      setSelectedDayIdx(0);
    }
  }, [isCurrentWeek, weekDates, today]);

  /* ── Build day data ── */
  const dayDataArray: DayData[] = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return weekDates.map((date) => {
      const dateStr = toDateStr(date);
      const dayProgress = weekProgress.filter((dp) => dp.date === dateStr);
      const hasAnyCompleted = dayProgress.some((dp) => dp.completed);
      const dateNorm = new Date(date);
      dateNorm.setHours(0, 0, 0, 0);

      return {
        date,
        dateStr,
        isToday: isSameDay(date, today),
        isFuture: dateNorm.getTime() > now.getTime(),
        isPast: dateNorm.getTime() < now.getTime(),
        progress: dayProgress,
        hasAnyCompleted,
      };
    });
  }, [weekDates, weekProgress, today]);

  /* ── Count completed days per behaviour for the week (for TARGET ACHIEVED) ── */
  const weekCompletedByBehaviour = useMemo(() => {
    const map = new Map<string, number>(); // key: `${planId}-${behaviourIndex}`
    for (const dp of weekProgress) {
      if (dp.completed) {
        const key = `${dp.plan_id}-${dp.behaviour_index}`;
        map.set(key, (map.get(key) || 0) + 1);
      }
    }
    return map;
  }, [weekProgress]);

  /* ── Build detail tasks for selected day ── */
  const detailTasks: DetailTask[] = useMemo(() => {
    if (selectedDayIdx === null) return [];
    const dayData = dayDataArray[selectedDayIdx];
    if (!dayData) return [];

    // Future days show no tasks
    if (dayData.isFuture) return [];

    const tasks: DetailTask[] = [];

    for (const planInfo of plans) {
      const planBehaviours: PlanBehaviour[] = planInfo.plan.plan_data;
      const dayProgressForPlan = dayData.progress.filter(
        (dp) => dp.plan_id === planInfo.plan.id
      );

      for (let i = 0; i < planBehaviours.length; i++) {
        const b = planBehaviours[i];
        const progressRow = dayProgressForPlan.find(
          (dp) => dp.behaviour_index === i
        );

        // Only show behaviours that have progress rows for this day
        if (progressRow) {
          const targetText = progressRow.target_text || '';
          const dailyAction = toDailyAction(targetText, b.behaviour, b.direction);
          const weeklyTarget = parseWeeklyTarget(targetText, b.direction);
          const key = `${planInfo.plan.id}-${i}`;
          const daysCompleted = weekCompletedByBehaviour.get(key) || 0;
          const targetAchieved = daysCompleted >= weeklyTarget;

          tasks.push({
            progressRow,
            behaviourIndex: i,
            behaviour: b.behaviour,
            direction: b.direction,
            target: targetText,
            dailyAction,
            completed: progressRow.completed,
            planType: planInfo.type,
            planId: planInfo.plan.id,
            targetAchieved,
          });
        }
      }
    }

    return tasks;
  }, [selectedDayIdx, dayDataArray, plans, weekCompletedByBehaviour]);

  /* ── Toggle checkbox (today only) ── */
  const toggleTask = useCallback(
    async (task: DetailTask) => {
      if (!task.progressRow) return;

      const newCompleted = !task.completed;
      const newCompletedAt = newCompleted ? new Date().toISOString() : null;
      const rowId = task.progressRow.id;

      // Optimistic update
      setWeekProgress((prev) =>
        prev.map((dp) =>
          dp.id === rowId
            ? { ...dp, completed: newCompleted, completed_at: newCompletedAt }
            : dp
        )
      );

      // Persist
      await supabase
        .from('daily_progress')
        .update({
          completed: newCompleted,
          completed_at: newCompletedAt,
        })
        .eq('id', rowId);
    },
    [supabase]
  );

  /* ── Navigation ── */
  const goToPrevWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(prev);
  };

  const goToNextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(next);
  };

  const goToToday = () => {
    setWeekStart(getWeekStart(new Date()));
  };

  /* ── Selected day info ── */
  const selectedDay: DayData | null =
    selectedDayIdx !== null ? dayDataArray[selectedDayIdx] : null;
  const selectedIsToday = selectedDay?.isToday ?? false;

  // Allow checking off tasks within the last 7 days (rolling window)
  const selectedIsEditable = (() => {
    if (!selectedDay) return false;
    if (selectedDay.isFuture) return false;
    const dayDate = new Date(selectedDay.dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dayDate.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  })();

  /* ── Render: loading ── */
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <div className={styles.loadingText}>Loading Calendar</div>
        </div>
      </div>
    );
  }

  /* ── Render: no plans ── */
  if (plans.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.eyebrow}>Calendar</div>
          <h1 className={styles.heading}>
            YOUR
            <br />
            <em>Schedule.</em>
          </h1>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyCard}>
            <h3 className={styles.emptyTitle}>No Active Plans</h3>
            <p className={styles.emptyText}>
              Complete an assessment to generate your personalised 8-week action
              plan. Your daily items will then appear here on the calendar.
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

  /* ── Render: has plans ── */
  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.eyebrow}>Calendar</div>
        <h1 className={styles.heading}>
          YOUR
          <br />
          <em>Schedule.</em>
        </h1>
      </div>

      {/* Week navigation */}
      <div className={styles.weekNav}>
        <button
          className={styles.navArrow}
          onClick={goToPrevWeek}
          aria-label="Previous week"
        >
          <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className={styles.weekLabel}>{formatWeekLabel(weekStart)}</div>
        <button
          className={styles.navArrow}
          onClick={goToNextWeek}
          aria-label="Next week"
        >
          <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          className={`${styles.todayBtn} ${isCurrentWeek ? styles.todayBtnHidden : ''}`}
          onClick={goToToday}
        >
          TODAY
        </button>
      </div>

      {/* Week grid */}
      {weekLoading ? (
        <div className={styles.weekGrid}>
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className={styles.dayCol}>
              <div className={styles.dayName}>{DAY_NAMES[i]}</div>
              <div className={styles.dayNumber}>{weekDates[i].getDate()}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.weekGrid}>
          {dayDataArray.map((day, i) => {
            const isSelected = selectedDayIdx === i;

            const dayClasses = [
              styles.dayCol,
              isSelected ? styles.dayColSelected : '',
              day.isToday ? styles.dayColToday : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <div
                key={day.dateStr}
                className={dayClasses}
                onClick={() => setSelectedDayIdx(i)}
                role="button"
                tabIndex={0}
                aria-label={`${DAY_NAMES[i]} ${day.date.getDate()}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedDayIdx(i);
                  }
                }}
              >
                <div className={styles.dayName}>{DAY_NAMES[i]}</div>
                <div className={styles.dayNumber}>{day.date.getDate()}</div>
                {day.progress.length > 0 && (
                  <div className={styles.dayDot}>
                    <div
                      className={
                        day.hasAnyCompleted
                          ? styles.dayDotFilled
                          : styles.dayDotEmpty
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Day detail panel */}
      {selectedDay && !weekLoading && (
        <div className={styles.dayDetail} key={selectedDay.dateStr}>
          <div className={styles.dayDetailHeader}>
            <div className={styles.dayDetailTitle}>
              {formatDayDetailTitle(selectedDay.date)}
            </div>
          </div>
          <div className={styles.dayDetailDivider} />

          {selectedDay.isFuture ? (
            <div className={styles.dayDetailEmpty}>
              <div className={styles.dayDetailEmptyText}>
                No tasks yet - future day
              </div>
            </div>
          ) : detailTasks.length > 0 ? (
            <div className={styles.detailTaskList}>
              {detailTasks.map((task) => {
                const arrowChar =
                  task.direction === 'increase'
                    ? '\u2191'
                    : task.direction === 'reduce'
                      ? '\u2193'
                      : '\u2194';
                const arrowClass =
                  task.direction === 'increase'
                    ? styles.taskArrowIncrease
                    : task.direction === 'reduce'
                      ? styles.taskArrowReduce
                      : styles.taskArrowMaintain;

                // TARGET ACHIEVED: weekly target met, no checkbox needed
                if (task.targetAchieved && !task.completed) {
                  return (
                    <div
                      key={`${task.planId}-${task.behaviourIndex}`}
                      className={`${styles.detailTaskRow} ${styles.detailTaskRowAchieved}`}
                    >
                      <div className={`${styles.taskArrow} ${arrowClass}`}>
                        {arrowChar}
                      </div>
                      <div className={styles.taskInfo}>
                        <div className={styles.taskName}>{task.behaviour}</div>
                        <div className={styles.taskAchieved}>
                          &#10003; TARGET ACHIEVED
                        </div>
                      </div>
                      <div className={styles.taskCheckboxPlaceholder} />
                    </div>
                  );
                }

                const canToggle = selectedIsEditable && task.progressRow !== null;

                const rowClasses = [
                  styles.detailTaskRow,
                  task.completed ? styles.detailTaskRowCompleted : '',
                  !selectedIsToday ? styles.detailTaskRowPast : '',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <div
                    key={`${task.planId}-${task.behaviourIndex}`}
                    className={rowClasses}
                  >
                    {/* Arrow */}
                    <div className={`${styles.taskArrow} ${arrowClass}`}>
                      {arrowChar}
                    </div>

                    {/* Name + daily action */}
                    <div className={styles.taskInfo}>
                      <div className={styles.taskName}>
                        {task.behaviour}
                      </div>
                      <div className={styles.taskTarget}>
                        {task.dailyAction}
                      </div>
                    </div>

                    {/* Checkbox */}
                    <div
                      className={`${styles.taskCheckbox} ${
                        !canToggle ? styles.taskCheckboxReadonly : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        className={styles.taskCheckboxInput}
                        checked={task.completed}
                        onChange={() => {
                          if (canToggle) {
                            toggleTask(task);
                          }
                        }}
                        disabled={!canToggle}
                        aria-label={`Mark ${task.behaviour} as ${
                          task.completed ? 'incomplete' : 'complete'
                        }`}
                      />
                      <div
                        className={`${styles.taskCheckboxBox} ${
                          task.completed ? styles.taskCheckboxChecked : ''
                        }`}
                      >
                        <span
                          className={`${styles.taskCheckboxMark} ${
                            task.completed
                              ? styles.taskCheckboxMarkVisible
                              : ''
                          }`}
                        >
                          &#10003;
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.dayDetailEmpty}>
              <div className={styles.dayDetailEmptyText}>
                No tasks for this day
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
