import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BLABELS } from '@/lib/scoring/health-scoring';
import { WBLABELS } from '@/lib/scoring/wealth-scoring';
import { getOverallRating, computeBehaviourPct } from '@/lib/scoring/shared';
import OctagonChart from '@/components/octagon/OctagonChart';
import Link from 'next/link';
import styles from './dashboard.module.css';

/* ── DB column keys ── */
const HEALTH_B_KEYS = [
  'b_sleep', 'b_smoking', 'b_strength', 'b_sweat',
  'b_sugar', 'b_salt', 'b_spirits', 'b_stress',
] as const;
const WEALTH_B_KEYS = [
  'b_active_income', 'b_passive_income', 'b_expenses', 'b_discretionary',
  'b_savings', 'b_debt_repayment', 'b_retirement', 'b_investment',
] as const;

/* ── Helpers ── */
function fmtDate(d: string | null | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function daysSince(d: string): number {
  const then = new Date(d);
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

/** Is a weekly health check-in due? (every 7 days) */
function isHealthCheckinDue(lastDate: string | null | undefined): boolean {
  if (!lastDate) return true;
  return daysSince(lastDate) >= 7;
}

/** Is a monthly wealth check-in due? */
function isWealthCheckinDue(lastDate: string | null | undefined): boolean {
  if (!lastDate) return true;
  return daysSince(lastDate) >= 30;
}

/** ISO week key: YYYY-Www */
function weekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const week = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** Month key: YYYY-MM */
function monthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Count consecutive weeks ending at current week that have a check-in. */
function computeWeeklyStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const weeks = new Set(dates.map(weekKey));
  let streak = 0;
  const cursor = new Date();
  while (weeks.has(weekKey(cursor.toISOString()))) {
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

/** Count consecutive months ending at current month that have a check-in. */
function computeMonthlyStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const months = new Set(dates.map(monthKey));
  let streak = 0;
  const cursor = new Date();
  while (months.has(monthKey(cursor.toISOString()))) {
    streak++;
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return streak;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile?.onboarding_complete) {
    redirect('/onboarding');
  }

  /* Latest assessments (used as "last check-in" for now — will be replaced
     by weekly_checkins table in Phase 2) */
  const { data: healthAssessmentData } = await supabase
    .from('health_assessments')
    .select('*')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  const { data: wealthAssessmentData } = await supabase
    .from('wealth_assessments')
    .select('*')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  const healthAssessment = healthAssessmentData as Record<string, unknown> | null;
  const wealthAssessment = wealthAssessmentData as Record<string, unknown> | null;

  /* Extract behaviour scores (1-4 each) */
  const healthScores: number[] = healthAssessment
    ? HEALTH_B_KEYS.map(k => (healthAssessment[k] as number) || 1)
    : [];
  const wealthScores: number[] = wealthAssessment
    ? WEALTH_B_KEYS.map(k => (wealthAssessment[k] as number) || 1)
    : [];

  const healthPct = healthScores.length ? computeBehaviourPct(healthScores) : 0;
  const wealthPct = wealthScores.length ? computeBehaviourPct(wealthScores) : 0;
  const healthRating = getOverallRating(healthPct);
  const wealthRating = getOverallRating(wealthPct);

  const healthLastAt = (healthAssessment?.completed_at as string | null | undefined) ?? null;
  const wealthLastAt = (wealthAssessment?.completed_at as string | null | undefined) ?? null;
  const healthId = (healthAssessment?.id as string | undefined) ?? null;
  const wealthId = (wealthAssessment?.id as string | undefined) ?? null;
  const healthDue = isHealthCheckinDue(healthLastAt);
  const wealthDue = isWealthCheckinDue(wealthLastAt);
  const anyCheckinDue = healthDue || wealthDue;

  /* ── Streak calculation ──
     Count consecutive weeks (health) / months (wealth) with check-ins,
     ending at the current period. */
  const { data: allHealthDates } = await supabase
    .from('health_assessments')
    .select('completed_at')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false });

  const { data: allWealthDates } = await supabase
    .from('wealth_assessments')
    .select('completed_at')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false });

  const healthStreak = computeWeeklyStreak(
    (allHealthDates || []).map(r => r.completed_at as string)
  );
  const wealthStreak = computeMonthlyStreak(
    (allWealthDates || []).map(r => r.completed_at as string)
  );

  /* Upcoming events from Calendar */
  const today = new Date().toISOString().split('T')[0];
  const { data: upcomingEvents } = await supabase
    .from('user_events')
    .select('id, title, event_date, category')
    .eq('user_id', user.id)
    .gte('event_date', today)
    .eq('completed', false)
    .order('event_date', { ascending: true })
    .limit(3);

  return (
    <div className={styles.container}>
      <div className={styles.greeting}>
        <div className={styles.eyebrow}>Welcome</div>
        <h1 className={styles.heading}>
          {profile.name || 'Fighter'}
        </h1>
      </div>

      {/* Octagons */}
      {!healthAssessment && !wealthAssessment ? (
        <div className={styles.emptyCard}>
          <h3 className={styles.emptyTitle}>Start your journey</h3>
          <p className={styles.emptyText}>
            Take your first check-in to build your octagon and see where you stand.
          </p>
          <div className={styles.assessLinks}>
            <Link href="/assess/health" className={styles.assessLink}>
              <span className={styles.assessIcon}>+</span>
              <div>
                <strong>Health Check-in</strong>
                <span>8 habits, 1 minute</span>
              </div>
            </Link>
            <Link href="/assess/wealth" className={styles.assessLink}>
              <span className={styles.assessIcon}>+</span>
              <div>
                <strong>Wealth Check-in</strong>
                <span>8 habits, 1 minute</span>
              </div>
            </Link>
          </div>
        </div>
      ) : (
        <div className={styles.octagonGrid}>
          {/* Health */}
          {healthAssessment && healthId ? (
            <Link href={`/results/health/${healthId}`} className={styles.octagonCardLink}>
              <div className={styles.octagonLabel}>Health</div>
              <div className={styles.octagonChart}>
                <OctagonChart
                  scores={healthScores}
                  labels={[...BLABELS]}
                  maxScore={4}
                  size={180}
                  showLabels={false}
                  showScores={false}
                />
              </div>
              <div className={styles.octagonScore}>
                <span className={styles.octagonPct}>{healthPct}%</span>
                <span className={styles.octagonRating} style={{ color: healthRating.color }}>
                  {healthRating.label}
                </span>
              </div>
              <div className={styles.octagonMeta}>
                Last: {fmtDate(healthLastAt)}
              </div>
              {healthStreak > 1 && (
                <div className={styles.streakBadge}>
                  🔥 {healthStreak}-week streak
                </div>
              )}
            </Link>
          ) : (
            <div className={styles.octagonCard}>
              <div className={styles.octagonLabel}>Health</div>
              <Link href="/assess/health" className={styles.octagonEmpty}>
                <span>+</span>
                Start health check-in
              </Link>
            </div>
          )}

          {/* Wealth */}
          {wealthAssessment && wealthId ? (
            <Link href={`/results/wealth/${wealthId}`} className={styles.octagonCardLink}>
              <div className={styles.octagonLabel}>Wealth</div>
              <div className={styles.octagonChart}>
                <OctagonChart
                  scores={wealthScores}
                  labels={[...WBLABELS]}
                  maxScore={4}
                  size={180}
                  showLabels={false}
                  showScores={false}
                />
              </div>
              <div className={styles.octagonScore}>
                <span className={styles.octagonPct}>{wealthPct}%</span>
                <span className={styles.octagonRating} style={{ color: wealthRating.color }}>
                  {wealthRating.label}
                </span>
              </div>
              <div className={styles.octagonMeta}>
                Last: {fmtDate(wealthLastAt)}
              </div>
              {wealthStreak > 1 && (
                <div className={styles.streakBadge}>
                  🔥 {wealthStreak}-month streak
                </div>
              )}
            </Link>
          ) : (
            <div className={styles.octagonCard}>
              <div className={styles.octagonLabel}>Wealth</div>
              <Link href="/assess/wealth" className={styles.octagonEmpty}>
                <span>+</span>
                Start wealth check-in
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Check-in prompt */}
      {(healthAssessment || wealthAssessment) && anyCheckinDue && (
        <div className={styles.checkinPrompt}>
          <div className={styles.checkinPromptTitle}>
            Check-in due
          </div>
          <p className={styles.checkinPromptText}>
            {healthDue && wealthDue
              ? 'Both your health and wealth check-ins are ready. Each takes 1 minute.'
              : healthDue
              ? 'Your weekly health check-in is ready. Takes 1 minute.'
              : 'Your monthly wealth check-in is ready. Takes 1 minute.'}
          </p>
          <div className={styles.checkinPromptActions}>
            {healthDue && (
              <Link href="/assess/health" className={styles.checkinBtn}>
                Health &rarr;
              </Link>
            )}
            {wealthDue && (
              <Link href="/assess/wealth" className={styles.checkinBtn}>
                Wealth &rarr;
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Upcoming events */}
      {upcomingEvents && upcomingEvents.length > 0 && (
        <div className={styles.upcomingSection}>
          <div className={styles.upcomingTitle}>Upcoming</div>
          <div className={styles.upcomingList}>
            {upcomingEvents.map(ev => (
              <div key={ev.id} className={styles.upcomingRow}>
                <span className={styles.upcomingName}>{ev.title}</span>
                <span className={styles.upcomingDate}>{fmtDate(ev.event_date)}</span>
              </div>
            ))}
          </div>
          <Link href="/calendar" className={styles.upcomingMore}>
            View Calendar &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
