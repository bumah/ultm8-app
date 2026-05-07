import Link from 'next/link';
import styles from './more.module.css';

export const metadata = { title: 'More \u2014 ULTM8' };

export default function MorePage() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.eyebrow}>More</div>
        <h1 className={styles.heading}>
          Tools, science<br />and <em>resources.</em>
        </h1>
        <p className={styles.sub}>
          Everything ULTM8 tracks {'\u2014'} explained {'\u2014'} plus the apps,
          wearables, books and guides we recommend.
        </p>
      </div>

      <div className={styles.list}>
        <Link href="/more/metrics" className={styles.card}>
          <div className={styles.cardLabel}>Metrics</div>
          <div className={styles.cardTitle}>The science behind every metric</div>
          <div className={styles.cardSub}>32 behaviours and indicators across health and wealth, with what each one is, why it matters, and the single lever that moves it.</div>
          <div className={styles.cardArrow}>{'\u2192'}</div>
        </Link>

        <Link href="/more/resources" className={styles.card}>
          <div className={styles.cardLabel}>Resources</div>
          <div className={styles.cardTitle}>Apps, wearables, books, guides</div>
          <div className={styles.cardSub}>Curated tools to help you build better habits and improve every indicator. Editorial picks {'\u2014'} ULTM8 doesn{'\u2019'}t earn commissions on any of these.</div>
          <div className={styles.cardArrow}>{'\u2192'}</div>
        </Link>

        <Link href="/profile" className={styles.card}>
          <div className={styles.cardLabel}>Profile</div>
          <div className={styles.cardTitle}>Your account and snapshots</div>
          <div className={styles.cardSub}>Edit your profile, manage your health and wealth snapshots, and sign out.</div>
          <div className={styles.cardArrow}>{'\u2192'}</div>
        </Link>
      </div>
    </div>
  );
}
