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
          ULTM<span className={styles.accent}>8</span> CHALLENGE
        </div>

        <h1 className={styles.heading}>
          Score your health.<br />
          Score your wealth.<br />
          <em>Build your octagon.</em>
        </h1>

        <p className={styles.sub}>
          The personal assessment that maps your 8 health behaviours
          and 8 wealth behaviours — then gives you an 8-week plan
          to improve both.
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
              <div className={styles.featureDesc}>8-week personalised action plan with weekly targets</div>
            </div>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div>
              <div className={styles.featureName}>Calendar</div>
              <div className={styles.featureDesc}>Daily accountability with habit tracking</div>
            </div>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div>
              <div className={styles.featureName}>Progress</div>
              <div className={styles.featureDesc}>Octagon history and score trends over time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Try without account */}
      <div className={styles.section}>
        <div className={styles.sectionEyebrow}>Take the Challenge</div>

        <p className={styles.trySub}>
          Want to see where you stand before signing up?
          Take the standalone assessment — no account required.
        </p>

        <div className={styles.challengeLinks}>
          <a href="https://health.ultm8challenge.com" target="_blank" rel="noopener noreferrer" className={styles.challengeLink}>
            <div className={styles.challengeLabel}>Health Challenge</div>
            <div className={styles.challengeUrl}>health.ultm8challenge.com</div>
          </a>
          <a href="https://wealth.ultm8challenge.com" target="_blank" rel="noopener noreferrer" className={styles.challengeLink}>
            <div className={styles.challengeLabel}>Wealth Challenge</div>
            <div className={styles.challengeUrl}>wealth.ultm8challenge.com</div>
          </a>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className={styles.bottomCta}>
        <div className={styles.bottomText}>Ready to track your progress?</div>
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
