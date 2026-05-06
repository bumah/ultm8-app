'use client';

import styles from './OptionCard.module.css';

interface OptionCardProps {
  score: number;
  text: string;
  selected: boolean;
  onClick: () => void;
}

export default function OptionCard({ text, selected, onClick }: OptionCardProps) {
  return (
    <button
      type="button"
      className={`${styles.opt} ${selected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <span className={styles.marker} aria-hidden />
      <span className={styles.text}>{text}</span>
    </button>
  );
}
