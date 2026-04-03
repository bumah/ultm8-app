'use client';

import styles from './TopBar.module.css';

interface TopBarProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export default function TopBar({ title, showBack, onBack }: TopBarProps) {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        ULTM<span className={styles.accent}>8</span>
      </div>
      {title && <span className={styles.title}>{title}</span>}
      {showBack && (
        <button className={styles.back} onClick={onBack}>
          &larr; Back
        </button>
      )}
    </nav>
  );
}
