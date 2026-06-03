import { useState } from 'react';
import { tierOf } from '../../mocks';
import { MOCK_INVITE_CODE, MOCK_FRIENDS } from '../../mocks';
import type { Friend } from '../../types/game';

interface FriendManageSheetProps {
  accentColor: string;
  onClose: () => void;
}

/**
 * 친구 관리 (초대 코드 방식) — 골격.
 * 백엔드(친구 API) 미구현이라 mock 로컬 상태로 동작.
 * 연결 시: friendApi.getMyInviteCode / addFriend / getFriends 로 교체.
 */
export default function FriendManageSheet({ accentColor, onClose }: FriendManageSheetProps) {
  // TODO(backend): friendApi.getMyInviteCode() 로 대체
  const [inviteCode] = useState(MOCK_INVITE_CODE);
  // TODO(backend): friendApi.getFriends() 로 대체
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);
  const [codeInput, setCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 1800);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast('복사에 실패했어요');
    }
  };

  const handleAdd = () => {
    const code = codeInput.trim().toUpperCase();
    if (!code) return;
    if (code === inviteCode) { showToast('내 코드는 추가할 수 없어요'); return; }
    // TODO(backend): friendApi.addFriend(code) → 성공 시 반환된 friend 추가
    const newFriend: Friend = {
      user_id: Date.now(),
      name: `친구 ${friends.length + 1}`,
      level: 1 + Math.floor(((code.charCodeAt(code.length - 1) || 0) % 20)),
      persona: '경제',
    };
    setFriends(prev => [newFriend, ...prev]);
    setCodeInput('');
    showToast('친구를 추가했어요! 🎉 (mock)');
  };

  const handleRemove = (userId: number) => {
    // TODO(backend): friendApi.removeFriend(userId)
    setFriends(prev => prev.filter(f => f.user_id !== userId));
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 200,
        background: 'rgba(15,17,21,0.5)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: 0,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 460,
          background: '#FFFFFF',
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          maxHeight: '82%',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'nodingo-sheet-in 420ms cubic-bezier(.2,.7,.2,1)',
        }}
      >
        {/* 핸들 + 헤더 */}
        <div style={{ padding: '8px 0 4px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 42, height: 4, borderRadius: 999, background: '#D8D8D2' }} />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '4px 18px 12px', borderBottom: '1px solid #EFEEEA',
        }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0F1115' }}>친구 관리</div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: '50%',
            background: '#F4F4F0', color: '#6B6B66', border: 'none',
            cursor: 'pointer', fontSize: 18, lineHeight: 1,
          }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 22px' }}>
          {/* 내 초대 코드 */}
          <div style={{
            fontSize: 11, fontWeight: 800, color: '#6B6B66',
            letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 7,
          }}>내 초대 코드</div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#E5F4E0', borderRadius: 16, padding: '12px 14px', marginBottom: 18,
          }}>
            <span style={{
              flex: 1, fontSize: 20, fontWeight: 900, color: '#1E8460',
              letterSpacing: '0.08em', fontVariantNumeric: 'tabular-nums',
            }}>{inviteCode}</span>
            <button onClick={copyCode} style={{
              padding: '9px 16px', borderRadius: 12, border: 'none',
              background: copied ? '#1E8460' : accentColor, color: '#fff',
              fontSize: 13, fontWeight: 800, cursor: 'pointer', flexShrink: 0,
            }}>{copied ? '복사됨 ✓' : '복사'}</button>
          </div>
          <p style={{ fontSize: 11.5, color: '#9A9A94', marginTop: -10, marginBottom: 20, lineHeight: 1.5 }}>
            이 코드를 친구에게 공유하면, 친구가 입력해 서로 친구가 됩니다.
          </p>

          {/* 친구 추가 */}
          <div style={{
            fontSize: 11, fontWeight: 800, color: '#6B6B66',
            letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 7,
          }}>코드로 친구 추가</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
            <input
              value={codeInput}
              onChange={e => setCodeInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
              placeholder="예: NDG-1A2B"
              style={{
                flex: 1, padding: '12px 14px', borderRadius: 14,
                border: '1.5px solid #E6E6E2', background: '#FFFFFF',
                fontSize: 14, fontWeight: 700, color: '#0F1115',
                fontFamily: 'inherit', outline: 'none',
                textTransform: 'uppercase',
              }}
            />
            <button onClick={handleAdd} disabled={!codeInput.trim()} style={{
              padding: '0 20px', borderRadius: 14, border: 'none',
              background: codeInput.trim() ? accentColor : '#E6E6E2',
              color: '#fff', fontSize: 14, fontWeight: 800,
              cursor: codeInput.trim() ? 'pointer' : 'not-allowed', flexShrink: 0,
            }}>추가</button>
          </div>

          {/* 친구 목록 */}
          <div style={{
            fontSize: 11, fontWeight: 800, color: '#6B6B66',
            letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 9,
          }}>내 친구 · {friends.length}</div>
          {friends.length === 0 ? (
            <div style={{
              padding: '24px 16px', borderRadius: 16, background: '#FAF7F1',
              textAlign: 'center', color: '#6B6B66', fontSize: 13, fontWeight: 600,
            }}>
              아직 친구가 없어요. 코드를 공유해 친구를 추가해보세요!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {friends.map(f => {
                const tier = tierOf(f.level);
                return (
                  <div key={f.user_id} style={{
                    display: 'flex', alignItems: 'center', gap: 11,
                    padding: '10px 12px', borderRadius: 16,
                    background: '#FFFFFF', border: '1px solid #EFEEEA',
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: tier.soft, border: `2px solid ${tier.color}`,
                      overflow: 'hidden', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <img
                        src={tier.characterImage} alt={tier.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#0F1115' }}>{f.name}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: tier.color }}>
                        {tier.name} · Lv {f.level}{f.persona ? ` · #${f.persona}` : ''}
                      </div>
                    </div>
                    <button onClick={() => handleRemove(f.user_id)} title="친구 삭제" style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: '#F4F4F0', color: '#9A9A94', border: 'none',
                      cursor: 'pointer', fontSize: 16, lineHeight: 1, flexShrink: 0,
                    }}>−</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {toast && (
          <div style={{
            position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            padding: '9px 14px', borderRadius: 999,
            background: 'rgba(15,17,21,0.88)', color: '#fff',
            fontSize: 12.5, fontWeight: 800, whiteSpace: 'nowrap',
            boxShadow: '0 10px 24px rgba(15,17,21,0.18)',
          }}>{toast}</div>
        )}
      </div>
    </div>
  );
}
