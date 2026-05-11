import styles from './BottomNav.module.css';

export type BottomNavTab = 'graph' | 'scrap' | 'feed' | 'profile';

interface BottomNavProps {
  active: BottomNavTab;
  onChange: (tab: BottomNavTab) => void;
}

const TABS: { id: BottomNavTab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'graph',
    label: '그래프',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <circle cx="4" cy="6" r="2" />
        <circle cx="20" cy="6" r="2" />
        <circle cx="4" cy="18" r="2" />
        <circle cx="20" cy="18" r="2" />
        <line x1="12" y1="12" x2="4" y2="6" />
        <line x1="12" y1="12" x2="20" y2="6" />
        <line x1="12" y1="12" x2="4" y2="18" />
        <line x1="12" y1="12" x2="20" y2="18" />
      </svg>
    ),
  },
  {
    id: 'scrap',
    label: '스크랩',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    id: 'feed',
    label: '피드',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h16M4 12h16M4 18h10" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: '프로필',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className={styles.nav}>
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={[styles.item, active === tab.id ? styles.active : ''].filter(Boolean).join(' ')}
          onClick={() => onChange(tab.id)}
        >
          <span className={styles.icon}>{tab.icon}</span>
          <span className={styles.label}>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
