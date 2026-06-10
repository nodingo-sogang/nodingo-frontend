import { useState } from 'react';
import { tierOf } from '../../mocks';
import type { UserGame, Badge, ReceiptData } from '../../types/game';
import { useAuthStore } from '../../store/authStore';

interface ProfileScreenProps {
  userGame: UserGame;
  /** 오늘 발급된 영수증 (있으면 "다시 보기" 노출) */
  lastReceipt?: ReceiptData | null;
  onShowReceipt?: () => void;
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

export default function ProfileScreen({ userGame, lastReceipt, onShowReceipt }: ProfileScreenProps) {
  const { logout, withdraw } = useAuthStore();
  const tier = tierOf(userGame.level);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  const earnedCount = userGame.badges.filter(b => b.earned).length;

  const handleWithdraw = async () => {
    setWithdrawing(true);
    setWithdrawError('');
    try {
      await withdraw(); // 성공 시 내부에서 /login 으로 전체 리로드
    } catch (err) {
      // 실패: 백엔드 에러 메시지를 그대로 노출 (리로드 안 함 → 원인 확인 가능)
      setWithdrawing(false);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setWithdrawError(msg || '탈퇴에 실패했어요. 잠시 후 다시 시도해주세요.');
    }
  };

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
            src={userGame.profileImageUrl || tier.characterImage}
            alt={userGame.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => {
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
        <div style={{ fontSize: 20, fontWeight: 900, color: '#0F1115' }}>{userGame.name} 님</div>
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

      {lastReceipt && (
        <button onClick={onShowReceipt} style={{
          margin: '18px 16px 0',
          width: 'calc(100% - 32px)', padding: 14, borderRadius: 18,
          border: 'none',
          background: tier.soft, color: tier.color,
          fontSize: 14, fontWeight: 800, cursor: 'pointer',
          fontFamily: 'Pretendard, -apple-system, system-ui, sans-serif',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          🧾 오늘의 영수증 다시 보기
        </button>
      )}

      <button onClick={logout} style={{
        margin: `${lastReceipt ? 10 : 18}px 16px 0`,
        width: 'calc(100% - 32px)', padding: 14, borderRadius: 18,
        border: 'none',
        background: '#FFFFFF', color: '#6B6B66',
        fontSize: 14, fontWeight: 800, cursor: 'pointer',
        fontFamily: 'Pretendard, -apple-system, system-ui, sans-serif',
        boxShadow: '0 2px 6px rgba(15,17,21,0.04)',
      }}>
        로그아웃
      </button>

      <button onClick={() => setConfirmWithdraw(true)} style={{
        margin: '10px 16px 0',
        width: 'calc(100% - 32px)', padding: 12, borderRadius: 14,
        border: 'none', background: 'transparent', color: '#B0463C',
        fontSize: 12.5, fontWeight: 700, cursor: 'pointer',
        fontFamily: 'Pretendard, -apple-system, system-ui, sans-serif',
      }}>
        회원 탈퇴
      </button>

      {confirmWithdraw && (
        <div
          onClick={() => !withdrawing && setConfirmWithdraw(false)}
          style={{
            position: 'absolute', inset: 0, zIndex: 300,
            background: 'rgba(15,17,21,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: 360, background: '#FFFFFF',
            borderRadius: 24, padding: '24px 22px 18px', textAlign: 'center',
            animation: 'nodingo-modal-in 280ms cubic-bezier(.2,.7,.2,1)',
          }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
            <div style={{ fontSize: 19, fontWeight: 900, color: '#0F1115', marginBottom: 8 }}>
              정말 탈퇴하시겠어요?
            </div>
            <p style={{ fontSize: 13, color: '#6B6B66', lineHeight: 1.55, marginBottom: 20 }}>
              네이버 연동이 해제되고, <b>딩고의 모든 기록(레벨·뱃지·스크랩·친구)이 영구 삭제</b>됩니다.
              <br />이 작업은 되돌릴 수 없어요.
            </p>
            {withdrawError && (
              <div style={{
                background: '#FCEBEB', color: '#C0392B', borderRadius: 12,
                padding: '10px 12px', marginBottom: 16,
                fontSize: 12, fontWeight: 700, lineHeight: 1.5, textAlign: 'left',
                wordBreak: 'break-all',
              }}>
                {withdrawError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmWithdraw(false)}
                disabled={withdrawing}
                style={{
                  flex: 1, padding: 13, borderRadius: 14,
                  border: '1.5px solid #E6E6E2', background: '#FFFFFF',
                  fontSize: 14, fontWeight: 800, color: '#6B6B66', cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >취소</button>
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                style={{
                  flex: 1, padding: 13, borderRadius: 14, border: 'none',
                  background: '#E04F4F', color: '#fff',
                  fontSize: 14, fontWeight: 800,
                  cursor: withdrawing ? 'default' : 'pointer', opacity: withdrawing ? 0.7 : 1,
                  fontFamily: 'inherit',
                }}
              >{withdrawing ? '처리 중…' : '탈퇴하기'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
