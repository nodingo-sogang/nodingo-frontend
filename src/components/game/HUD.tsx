import { tierOf, xpForLevel } from '../../mocks';
import type { UserGame } from '../../types/game';

interface HUDProps {
  userGame: UserGame;
  onProfileTap: () => void;
}

export default function HUD({ userGame, onProfileTap }: HUDProps) {
  const tier = tierOf(userGame.level);
  const needed = xpForLevel(userGame.level);
  const pct = Math.min(100, Math.round((userGame.xp / needed) * 100));

  return (
    <div style={{
      position: 'absolute',
      top: 'var(--nodingo-status-offset, 0px)', left: 0, right: 0,
      zIndex: 80,
      padding: '8px 14px 10px',
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px) saturate(150%)',
      WebkitBackdropFilter: 'blur(12px) saturate(150%)',
      borderBottom: '1px solid rgba(15,17,21,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button onClick={onProfileTap} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '4px 10px 4px 4px', borderRadius: 999,
          background: tier.soft, border: 'none', cursor: 'pointer',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}>
            <img
              src={tier.characterImage}
              alt={tier.name}
              style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                (e.currentTarget.parentElement as HTMLElement).textContent = '🙂';
              }}
            />
          </div>
          <div style={{
            fontSize: 11, fontWeight: 800, color: tier.color,
            letterSpacing: '-0.01em',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span>딩고</span>
            <span style={{ color: '#6B6B66', fontWeight: 700 }}>· {tier.name}</span>
          </div>
        </button>

        <div style={{ flex: 1 }} />

        <div style={{
          display: 'flex', alignItems: 'center', gap: 3,
          padding: '4px 9px', borderRadius: 999,
          background: '#FFF1E2', color: '#E8654D',
          fontSize: 12, fontWeight: 800,
        }}>
          <span style={{ fontSize: 13 }}>🔥</span>{userGame.streak}
        </div>
      </div>

      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          fontSize: 10, fontWeight: 800, color: '#0F1115',
          width: 30, fontVariantNumeric: 'tabular-nums',
        }}>Lv {userGame.level}</div>
        <div style={{
          flex: 1, height: 8, background: '#F1F1ED',
          borderRadius: 999, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: tier.color,
            borderRadius: 999,
            transition: 'width 520ms cubic-bezier(.2,.7,.2,1)',
          }} />
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, color: '#6B6B66',
          fontVariantNumeric: 'tabular-nums',
        }}>{userGame.xp} / {needed}</div>
      </div>
    </div>
  );
}
