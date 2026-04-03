'use client';

import styles from './SelectCard.module.css';

interface SelectCardProps {
  label: string;
  sub?: string;
  selected: boolean;
  onClick: () => void;
}

export default function SelectCard({ label, sub, selected, onClick }: SelectCardProps) {
  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <span className={styles.label}>{label}</span>
      {sub && <span className={styles.sub}>{sub}</span>}
    </button>
  );
}
