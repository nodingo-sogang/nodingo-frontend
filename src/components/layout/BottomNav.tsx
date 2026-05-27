export type BottomNavTab = 'graph' | 'scrap' | 'ranking' | 'profile';

interface BottomNavProps {
  active: BottomNavTab;
  onChange: (tab: BottomNavTab) => void;
  accentColor?: string;
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
        <path d="M12 21s-7-4.35-9.4-8.25C.7 9.65 2.4 5.5 6.1 5.5c2.05 0 3.5 1.05 4.4 2.35C11.4 6.55 12.85 5.5 14.9 5.5c3.7 0 5.4 4.15 3.5 7.25C19 16.65 12 21 12 21z" />
      </svg>
    ),
  },
  {
    id: 'ranking',
    label: '랭킹',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: '내 정보',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav({ active, onChange, accentColor }: BottomNavProps) {
  const color = accentColor ?? '#5BBA6F';

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 80,
      height: 86, paddingBottom: 32,
      background: 'rgba(255,255,255,0.96)',
      backdropFilter: 'blur(12px) saturate(150%)',
      WebkitBackdropFilter: 'blur(12px) saturate(150%)',
      borderTop: '1px solid rgba(15,17,21,0.06)',
      display: 'flex',
    }}>
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button key={tab.id} onClick={() => onChange(tab.id)} style={{
            flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            color: isActive ? color : '#6B6B66',
            padding: 0,
          }}>
            <div style={{
              width: 4, height: 4, borderRadius: 999,
              background: isActive ? color : 'transparent',
              marginTop: 4, marginBottom: 2,
            }} />
            <span style={{ width: 22, height: 22, display: 'flex' }}>{tab.icon}</span>
            <span style={{ fontSize: 10.5, fontWeight: 700 }}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
