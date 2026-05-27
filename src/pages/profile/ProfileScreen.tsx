import { tierOf } from '../../mocks';
import type { UserGame, Badge } from '../../types/game';
import { useAuthStore } from '../../store/authStore';

interface ProfileScreenProps {
  userGame: UserGame;
}

const CATEGORY_ICON: Record<string, string> = {
  attendance: '📅', explore: '🗺️', quiz: '🧠', social: '👥', special: '⭐',
};

interface BadgeTileProps { badge: Badge }

function BadgeTile({ badge }: BadgeTileProps) {
  return (
    <div style={{
      background: badge.earned ? '#FFFFFF' : '#F4F4F0',
      borderRadius: 14, padding: '10px 6px',
      textAlign: 'center',
      opacity: badge.earned ? 1 : 0.4,
      border: badge.earned ? '1px solid rgba(15,17,21,0.08)' : 'none',
    }}>
      <div style={{ fontSize: 22 }}>{CATEGORY_ICON[badge.category] ?? '🏅'}</div>
      <span style={{
        display: 'block',
        fontSize: 10, fontWeight: 700, color: '#0F1115', marginTop: 4,
        lineHeight: 1.25,
      }}>{badge.name}</span>
    </div>
  );
}

export default function ProfileScreen({ userGame }: ProfileScreenProps) {
  const { logout } = useAuthStore();
  const tier = tierOf(userGame.level);

  const earnedCount = userGame.badges.filter(b => b.earned).length;

  return (
    <div style={{
      overflowY: 'auto', height: '100%', padding: '0 0 32px',
      overscrollBehavior: 'contain',
      background: '#FAF7F1',
    }}>
      <div style={{
        padding: '20px 20px 14px', textAlign: 'center',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: tier.soft,
          border: `3px solid ${tier.color}`,
          display: 'inline-flex', alignItems: 'center',
          justifyContent: 'center', marginBottom: 10,
          overflow: 'hidden',
        }}>
          <img
            src={tier.characterImage}
            alt={tier.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
              (e.currentTarget.parentElement as HTMLElement).textContent = '🙂';
            }}
          />
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#0F1115' }}>딩고 님</div>
        <div style={{ fontSize: 12, color: '#6B6B66', marginTop: 2 }}>
          {tier.name} · Lv {userGame.level}
        </div>
      </div>

      <div style={{
        margin: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
      }}>
        {[
          { label: '탐험 노드', value: `${userGame.totalNodesExplored}개`, icon: '⬡' },
          { label: '완료 퀴즈', value: `${userGame.totalQuizzesSolved}개`, icon: '🎯' },
          { label: '연속 출석', value: `${userGame.streak}일`, icon: '🔥' },
          { label: '뱃지', value: `${earnedCount}개`, icon: '🏅' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: '#FFFFFF', borderRadius: 16, padding: 14,
            boxShadow: '0 2px 6px rgba(15,17,21,0.04)',
          }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontSize: 17, fontWeight: 900, color: '#0F1115' }}>{stat.value}</div>
            <div style={{ fontSize: 10.5, color: '#6B6B66', marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ margin: '12px 16px 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6B6B66',
          textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
          뱃지 · {earnedCount}/{userGame.badges.length}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {userGame.badges.map(b => <BadgeTile key={b.id} badge={b} />)}
        </div>
      </div>

      <button onClick={logout} style={{
        margin: '18px 16px 0',
        width: 'calc(100% - 32px)', padding: 14, borderRadius: 18,
        border: 'none',
        background: '#FFFFFF', color: '#6B6B66',
        fontSize: 14, fontWeight: 800, cursor: 'pointer',
        fontFamily: 'Pretendard, -apple-system, system-ui, sans-serif',
        boxShadow: '0 2px 6px rgba(15,17,21,0.04)',
      }}>
        로그아웃
      </button>
    </div>
  );
}
