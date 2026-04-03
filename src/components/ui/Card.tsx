import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  impact?: boolean;
}

export default function Card({ children, className, impact }: CardProps) {
  return (
    <div className={`${styles.card} ${impact ? styles.impact : ''} ${className || ''}`}>
      {children}
    </div>
  );
}
