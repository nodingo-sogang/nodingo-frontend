import { NAV_TABS, type BottomNavTab } from './BottomNav';
import { tierOf, xpForLevel } from '../../mocks';
import type { UserGame } from '../../types/game';

interface SidebarProps {
  active: BottomNavTab;
  onChange: (tab: BottomNavTab) => void;
  accentColor?: string;
  userGame: UserGame;
}

/**
 * 데스크톱(≥1024px) 전용 세로 사이드바.
 * 모바일 BottomNav 와 동일한 탭 정의(NAV_TABS)를 재사용하고,
 * HUD 정보(프로필/레벨/XP/스트릭)를 상단에 통합한다.
 */
export default function Sidebar({ active, onChange, accentColor, userGame }: SidebarProps) {
  const color = accentColor ?? '#5BBA6F';
  const tier = tierOf(userGame.level);
  const needed = xpForLevel(userGame.level);
  const pct = Math.min(100, Math.round((userGame.xp / needed) * 100));

  return (
    <nav
      style={{
        width: 248,
        flexShrink: 0,
        height: '100%',
        background: '#FFFFFF',
        borderRight: '1px solid rgba(15,17,21,0.07)',
        display: 'flex',
        flexDirection: 'column',
        padding: '22px 16px 18px',
      }}
    >
      {/* 브랜드 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '0 6px', marginBottom: 20 }}>
        <svg width="26" height="26" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="4" fill={color} />
          <circle cx="4" cy="5" r="2.5" fill={color} opacity="0.7" />
          <circle cx="18" cy="5" r="2.5" fill={color} opacity="0.7" />
          <circle cx="4" cy="17" r="2.5" fill={color} opacity="0.7" />
          <circle cx="18" cy="17" r="2.5" fill={color} opacity="0.7" />
          <line x1="11" y1="11" x2="4" y2="5" stroke={color} strokeWidth="1.5" opacity="0.4" />
          <line x1="11" y1="11" x2="18" y2="5" stroke={color} strokeWidth="1.5" opacity="0.4" />
          <line x1="11" y1="11" x2="4" y2="17" stroke={color} strokeWidth="1.5" opacity="0.4" />
          <line x1="11" y1="11" x2="18" y2="17" stroke={color} strokeWidth="1.5" opacity="0.4" />
        </svg>
        <span style={{ fontSize: 18, fontWeight: 900, color: '#0F1115', letterSpacing: '-0.02em' }}>
          Nodingo
        </span>
      </div>

      {/* 프로필 + 레벨/XP + 스트릭 */}
      <button
        onClick={() => onChange('profile')}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 10px', borderRadius: 16,
          background: tier.soft, border: 'none', cursor: 'pointer',
          textAlign: 'left', marginBottom: 6,
        }}
      >
        <div style={{
          width: 38, height: 38, borderRadius: '50%', background: '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', flexShrink: 0,
        }}>
          <img
            src={userGame.profileImageUrl || tier.characterImage}
            alt={userGame.name}
            style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (!img.dataset.fallback) {
                img.dataset.fallback = '1';
                img.src = tier.characterImage;
              } else {
                img.style.display = 'none';
                (img.parentElement as HTMLElement).textContent = '🙂';
              }
            }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: '#0F1115' }}>{userGame.name}</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: tier.color }}>· {tier.name}</span>
            <span style={{
              marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 2,
              fontSize: 11, fontWeight: 800, color: '#E8654D',
            }}>🔥{userGame.streak}</span>
          </div>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 9.5, fontWeight: 800, color: '#0F1115', fontVariantNumeric: 'tabular-nums' }}>
              Lv{userGame.level}
            </span>
            <div style={{ flex: 1, height: 6, background: '#FFFFFF', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: tier.color, borderRadius: 999 }} />
            </div>
          </div>
        </div>
      </button>

      <div style={{ height: 1, background: 'rgba(15,17,21,0.06)', margin: '14px 6px' }} />

      {/* 세로 네비 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 12px', borderRadius: 14,
                background: isActive ? tier.soft : 'transparent',
                color: isActive ? tier.color : '#4A4C50',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                fontSize: 14, fontWeight: isActive ? 800 : 600,
                transition: 'background 0.15s',
              }}
            >
              <span style={{ width: 22, height: 22, display: 'flex', flexShrink: 0 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ padding: '0 8px', fontSize: 10.5, color: '#9A9A94', fontWeight: 600 }}>
        뉴스 지식 그래프
      </div>
    </nav>
  );
}
