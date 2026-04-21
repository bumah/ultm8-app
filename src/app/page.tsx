import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import styles from './landing.module.css';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.logo}>
          ULTM<span className={styles.accent}>8</span>
        </div>

        <h1 className={styles.heading}>
          Build your body.<br />
          Build your bank.<br />
          <em>Transform your life.</em>
        </h1>

        <p className={styles.sub}>
          A weekly health check-in and a monthly wealth check-in.
          Two octagons. Eight habits each. Track the numbers that
          matter and watch your trends over time.
        </p>

        <div className={styles.heroCtas}>
          <Link href="/register" className={styles.ctaPrimary}>
            Create Account &rarr;
          </Link>
          <Link href="/login" className={styles.ctaGhost}>
            Sign In
          </Link>
        </div>
      </div>

      {/* What you get */}
      <div className={styles.section}>
        <div className={styles.sectionEyebrow}>Your Toolkit</div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div>
              <div className={styles.featureName}>Dashboard</div>
              <div className={styles.featureDesc}>Your health and wealth scores at a glance</div>
            </div>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
            </div>
            <div>
              <div className={styles.featureName}>Plan</div>
              <div className={styles.featureDesc}>Personalised recommendations based on your latest check-in</div>
            </div>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div>
              <div className={styles.featureName}>Calendar</div>
              <div className={styles.featureDesc}>Schedule check-ins, bill payments and health appointments</div>
            </div>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
            </div>
            <div>
              <div className={styles.featureName}>Trends</div>
              <div className={styles.featureDesc}>Log the numbers you care about and see them over time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className={styles.bottomCta}>
        <div className={styles.bottomText}>Ready for your first check-in?</div>
        <Link href="/register" className={styles.ctaPrimary}>
          Create Account &rarr;
        </Link>
        <div className={styles.bottomSignIn}>
          Already have an account? <Link href="/login" className={styles.bottomLink}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
