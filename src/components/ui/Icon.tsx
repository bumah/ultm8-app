/**
 * SVG icon component (Lucide-inspired).
 * Replaces emojis for consistent design language.
 */

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
  strokeWidth?: number;
};

export type IconName =
  | 'heart'        // ULTM8 Assessment
  | 'tooth'        // Dental
  | 'body'         // Full Body Check
  | 'ribbon'       // Cancer Check
  | 'wallet'       // Wealth
  | 'activity'    // Health
  | 'calendar'     // Calendar / schedule
  | 'check'        // Checkmark
  | 'plus'         // Add
  | 'chevron-right'
  | 'arrow-up'
  | 'arrow-down'
  | 'dumbbell'
  | 'scale'
  | 'pulse'
  | 'shield';

export default function Icon({
  name,
  size = 20,
  color = 'currentColor',
  className,
  strokeWidth = 1.75,
}: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  };

  switch (name) {
    case 'heart':
      return (
        <svg {...common}>
          <path d="M19.5 12.572 12 20l-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572" />
        </svg>
      );
    case 'tooth':
      return (
        <svg {...common}>
          <path d="M12 5.5C10 4 8 3 6 4c-2 1-2.5 3-2.5 5.5 0 2 1 4 1.5 6s1 4 3 4 2-3 3-3 1 3 3 3 2.5-2 3-4 1.5-4 1.5-6c0-2.5-.5-4.5-2.5-5.5s-4 0-6 1.5z" />
        </svg>
      );
    case 'body':
      return (
        <svg {...common}>
          <circle cx="12" cy="4" r="2" />
          <path d="M10 7h4l1.5 7H14v7h-4v-7H8.5L10 7z" />
        </svg>
      );
    case 'ribbon':
      return (
        <svg {...common}>
          <path d="M17.75 9A7 7 0 1 0 7 14.94L10 22l2-5 2 5 3-7.06" />
          <path d="M12 15.5L9.5 10.5 12 5.5l2.5 5z" />
        </svg>
      );
    case 'wallet':
      return (
        <svg {...common}>
          <path d="M19 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
          <path d="M16 14h.01" />
          <path d="M3 9V6a2 2 0 0 1 2-2h11" />
        </svg>
      );
    case 'activity':
      return (
        <svg {...common}>
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      );
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...common}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg {...common}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      );
    case 'arrow-up':
      return (
        <svg {...common}>
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      );
    case 'arrow-down':
      return (
        <svg {...common}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
      );
    case 'dumbbell':
      return (
        <svg {...common}>
          <path d="M14.4 14.4 9.6 9.6" />
          <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" />
          <path d="m21.5 21.5-1.4-1.4" />
          <path d="M3.9 3.9 2.5 2.5" />
          <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.767a2 2 0 1 1 2.829 2.829z" />
        </svg>
      );
    case 'scale':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3v4" />
          <circle cx="12" cy="13" r="1" />
        </svg>
      );
    case 'pulse':
      return (
        <svg {...common}>
          <path d="M3 12h4l3-9 4 18 3-9h4" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
  }
}
