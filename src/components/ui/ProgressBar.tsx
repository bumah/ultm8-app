'use client';

import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  label: string;
  count?: string;
  percent: number;
}

export default function ProgressBar({ label, count, percent }: ProgressBarProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.labels}>
        <span className={styles.text}>{label}</span>
        {count && <span className={styles.text}>{count}</span>}
      </div>
      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
