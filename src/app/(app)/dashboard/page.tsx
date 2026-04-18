import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getOverallRating } from '@/lib/scoring/shared';
import Icon, { IconName } from '@/components/ui/Icon';
import Link from 'next/link';
import styles from './dashboard.module.css';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Check onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile?.onboarding_complete) {
    redirect('/onboarding');
  }

  // Get latest assessments (include id + key metrics for dashboard cards)
  const { data: healthAssessment } = await supabase
    .from('health_assessments')
    .select('id, octagon_score_pct, behaviour_score_pct, completed_at, i_blood_pressure, i_blood_pressure_diastolic, i_body_fat')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  const { data: wealthAssessment } = await supabase
    .from('wealth_assessments')
    .select('id, octagon_score_pct, behaviour_score_pct, completed_at, computed_net_worth, fd_income, fd_expenses')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  const hasAssessments = healthAssessment || wealthAssessment;

  // Get health check dates
  const { data: healthSnapshot } = await supabase
    .from('health_snapshot')
    .select('dental_last, dental_next, eye_last, eye_next, cancer_last, cancer_next')
    .eq('user_id', user.id)
    .single();

  return (
    <div className={styles.container}>
      <div className={styles.greeting}>
        <div className={styles.eyebrow}>Dashboard</div>
        <h1 className={styles.heading}>
          Welcome,<br /><em>{profile.name || 'Fighter'}</em>
        </h1>
      </div>

      {!hasAssessments ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyCard}>
            <h3 className={styles.emptyTitle}>Start Your Journey</h3>
            <p className={styles.emptyText}>
              Take your first assessment to build your octagon and get a personalised 8-week plan.
            </p>
            <div className={styles.assessLinks}>
              <a href="/assess/health" className={styles.assessLink}>
                <span className={styles.assessIcon}>+</span>
                <div>
                  <strong>Health Assessment</strong>
                  <span>8 behaviours + 8 indicators</span>
                </div>
              </a>
              <a href="/assess/wealth" className={styles.assessLink}>
                <span className={styles.assessIcon}>+</span>
                <div>
                  <strong>Wealth Assessment</strong>
                  <span>8 behaviours + financial data</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Score cards */}
          <div className={styles.scores}>
            {healthAssessment && (() => {
              const octR = getOverallRating(healthAssessment.octagon_score_pct);
              const behR = getOverallRating(healthAssessment.behaviour_score_pct);
              return (
              <a href={`/results/health/${healthAssessment.id}`} className={styles.scoreCard}>
                <div className={styles.scoreCardTop}>
                  <div className={styles.scoreLabel}>Health Octagon</div>
                  <div className={styles.scoreColumns}>
                    <div className={styles.scoreCol}>
                      <div className={styles.scoreColLabel}>Indicators</div>
                      <div className={styles.scoreColValue}>{healthAssessment.octagon_score_pct}%</div>
                      <div className={styles.scoreColRating} style={{ color: octR.color }}>{octR.label}</div>
                    </div>
                    <div className={styles.scoreCol}>
                      <div className={styles.scoreColLabel}>Behaviours</div>
                      <div className={styles.scoreColValue}>{healthAssessment.behaviour_score_pct}%</div>
                      <div className={styles.scoreColRating} style={{ color: behR.color }}>{behR.label}</div>
                    </div>
                  </div>
                  <div className={styles.scoreMetrics}>
                    <div className={styles.scoreMetric}>
                      <span className={styles.scoreMetricLabel}>BP</span>
                      <span className={styles.scoreMetricValue}>
                        {healthAssessment.i_blood_pressure
                          ? `${healthAssessment.i_blood_pressure}${healthAssessment.i_blood_pressure_diastolic ? '/' + healthAssessment.i_blood_pressure_diastolic : ''} mmHg`
                          : '—'}
                      </span>
                    </div>
                    <div className={styles.scoreMetric}>
                      <span className={styles.scoreMetricLabel}>Body Fat</span>
                      <span className={styles.scoreMetricValue}>
                        {healthAssessment.i_body_fat ? `${healthAssessment.i_body_fat}%` : '—'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.scoreCta}>
                  View Results <span>&rarr;</span>
                </div>
              </a>
              );
            })()}
            {wealthAssessment && (() => {
              const octR = getOverallRating(wealthAssessment.octagon_score_pct);
              const behR = getOverallRating(wealthAssessment.behaviour_score_pct);
              return (
              <a href={`/results/wealth/${wealthAssessment.id}`} className={styles.scoreCard}>
                <div className={styles.scoreCardTop}>
                  <div className={styles.scoreLabel}>Wealth Octagon</div>
                  <div className={styles.scoreColumns}>
                    <div className={styles.scoreCol}>
                      <div className={styles.scoreColLabel}>Indicators</div>
                      <div className={styles.scoreColValue}>{wealthAssessment.octagon_score_pct}%</div>
                      <div className={styles.scoreColRating} style={{ color: octR.color }}>{octR.label}</div>
                    </div>
                    <div className={styles.scoreCol}>
                      <div className={styles.scoreColLabel}>Behaviours</div>
                      <div className={styles.scoreColValue}>{wealthAssessment.behaviour_score_pct}%</div>
                      <div className={styles.scoreColRating} style={{ color: behR.color }}>{behR.label}</div>
                    </div>
                  </div>
                  <div className={styles.scoreMetrics}>
                    <div className={styles.scoreMetric}>
                      <span className={styles.scoreMetricLabel}>Net Income</span>
                      <span className={styles.scoreMetricValue}>
                        {profile.currency}{Math.round((wealthAssessment.fd_income || 0) - (wealthAssessment.fd_expenses || 0)).toLocaleString()}/mo
                      </span>
                    </div>
                    <div className={styles.scoreMetric}>
                      <span className={styles.scoreMetricLabel}>Net Worth</span>
                      <span className={styles.scoreMetricValue}>
                        {wealthAssessment.computed_net_worth != null
                          ? `${wealthAssessment.computed_net_worth >= 0 ? '' : '-'}${profile.currency}${Math.abs(Math.round(wealthAssessment.computed_net_worth)).toLocaleString()}`
                          : '—'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.scoreCta}>
                  View Results <span>&rarr;</span>
                </div>
              </a>
              );
            })()}
            {(!healthAssessment || !wealthAssessment) && (
              <a
                href={!healthAssessment ? '/assess/health' : '/assess/wealth'}
                className={styles.addAssessment}
              >
                <span>+</span>
                Take {!healthAssessment ? 'Health' : 'Wealth'} Assessment
              </a>
            )}
          </div>

          {/* Retake assessments */}
          <div className={styles.retakeSection}>
            <div className={styles.retakeTitle}>Retake</div>
            <div className={styles.retakeLinks}>
              <a href="/assess/health" className={styles.retakeLink}>
                <span className={styles.retakeIcon}>&#8635;</span>
                Health
              </a>
              <a href="/assess/wealth" className={styles.retakeLink}>
                <span className={styles.retakeIcon}>&#8635;</span>
                Wealth
              </a>
            </div>
          </div>

          {/* Key Dates */}
          {(() => {
            const checks = [
              { label: 'ULTM8 Assessment', icon: 'heart' as IconName, last: healthAssessment?.completed_at, next: healthAssessment ? new Date(new Date(healthAssessment.completed_at).getTime() + 56 * 24 * 60 * 60 * 1000).toISOString() : null },
              { label: 'Dental', icon: 'tooth' as IconName, last: healthSnapshot?.dental_last, next: healthSnapshot?.dental_next },
              { label: 'Full Body Check', icon: 'body' as IconName, last: healthSnapshot?.eye_last, next: healthSnapshot?.eye_next },
              { label: 'Cancer Check', icon: 'ribbon' as IconName, last: healthSnapshot?.cancer_last, next: healthSnapshot?.cancer_next },
            ];
            const hasAnyDate = checks.some(c => c.last || c.next);
            const fmtDate = (d: string | null | undefined) => {
              if (!d) return '—';
              return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            };

            return (
              <div className={styles.keyDatesSection}>
                <div className={styles.keyDatesTitle}>Key Dates</div>
                {hasAnyDate ? (
                  <div className={styles.keyDatesList}>
                    {checks.map((check, i) => (
                      <div className={styles.keyDateRow} key={i}>
                        <div className={styles.keyDateIcon}><Icon name={check.icon} size={18} /></div>
                        <div className={styles.keyDateContent}>
                          <div className={styles.keyDateLabel}>{check.label}</div>
                          <div className={styles.keyDateDates}>
                            <span className={styles.keyDatePair}>
                              <span className={styles.keyDateTag}>Last</span> {fmtDate(check.last)}
                            </span>
                            <span className={styles.keyDatePair}>
                              <span className={styles.keyDateTag}>Next</span> {fmtDate(check.next)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.keyDatesEmpty}>
                    No upcoming appointments set.
                  </div>
                )}
                <Link href="/profile" className={styles.keyDatesEdit}>
                  Edit dates &rarr;
                </Link>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}
