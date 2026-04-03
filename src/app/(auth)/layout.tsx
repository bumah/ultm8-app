import styles from './auth.module.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          ULTM<span className={styles.accent}>8</span>
        </div>
        {children}
      </div>
    </div>
  );
}
