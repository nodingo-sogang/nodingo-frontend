import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tierOf } from '../../mocks';
import { MOCK_FRIENDS, MOCK_FRIEND_REQUESTS } from '../../mocks';
import { friendApi } from '../../api/friend';
import Skeleton from '../common/Skeleton';
import type { FriendProfile } from '../../types/game';

interface FriendManageSheetProps {
  accentColor: string;
  onClose: () => void;
}

/**
 * 친구 관리 — 백엔드 모델: 닉네임 검색 → 친구 요청 → 수락.
 * 라이브 호출 + 실패(미로그인 등) 시 목록은 mock 폴백.
 */
export default function FriendManageSheet({ accentColor, onClose }: FriendManageSheetProps) {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState<FriendProfile | null | 'none'>(null);
  const [searching, setSearching] = useState(false);
  const [requestedIds, setRequestedIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 1800);
  };

  // 내 친구 목록 / 받은 요청 (실패 시 mock 폴백).
  // placeholderData 없음 → 로딩 중 mock 깜빡임 대신 스켈레톤 표시.
  const { data: friends = [], isLoading: friendsLoading, refetch: refetchFriends } = useQuery<FriendProfile[]>({
    queryKey: ['friends'],
    queryFn: () => friendApi.getFriends().catch(() => MOCK_FRIENDS),
  });
  const { data: requests = [], refetch: refetchRequests } = useQuery<FriendProfile[]>({
    queryKey: ['friendRequests'],
    queryFn: () => friendApi.getReceivedRequests().catch(() => MOCK_FRIEND_REQUESTS),
  });

  const handleSearch = async () => {
    const nickname = query.trim();
    if (!nickname) return;
    setSearching(true);
    setSearched(null);
    try {
      const user = await friendApi.searchByNickname(nickname);
      setSearched(user ?? 'none');
    } catch {
      setSearched('none');
    } finally {
      setSearching(false);
    }
  };

  // axios 에러에서 백엔드 실제 메시지/상태를 추출 (catch에서 가짜 안내 대신 진짜 원인 노출)
  const errMessage = (err: unknown, fallback: string) => {
    const res = (err as { response?: { data?: { message?: string }; status?: number } })?.response;
    return res?.data?.message || `${fallback} (${res?.status ?? '네트워크 오류'})`;
  };

  const handleRequest = async (target: FriendProfile) => {
    if (!target.user_id) { showToast('상대 정보를 찾을 수 없어요 (user_id 누락)'); return; }
    setRequestedIds(prev => new Set(prev).add(target.user_id));
    try {
      await friendApi.sendRequest(target.user_id);
      showToast(`${target.nickname}님에게 친구 요청을 보냈어요 🤝`);
    } catch (err) {
      // 실패 시 optimistic '요청됨' 롤백 + 백엔드 실제 메시지 노출
      setRequestedIds(prev => { const n = new Set(prev); n.delete(target.user_id); return n; });
      showToast(errMessage(err, '친구 요청 실패'));
    }
  };

  const handleAccept = async (requester: FriendProfile) => {
    try {
      await friendApi.acceptRequest(requester.user_id);
      showToast(`${requester.nickname}님과 친구가 됐어요! 🎉`);
      void refetchRequests();
      void refetchFriends();
    } catch (err) {
      showToast(errMessage(err, '수락 실패'));
    }
  };

  const rowAvatar = (friend: FriendProfile) => {
    const tier = tierOf(friend.level);
    return (
      <div style={{
        width: 38, height: 38, borderRadius: '50%',
        background: tier.soft, border: `2px solid ${tier.color}`,
        overflow: 'hidden', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img
          src={friend.profileImageUrl || tier.characterImage} alt={friend.nickname}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={e => {
            const img = e.currentTarget as HTMLImageElement;
            if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.src = tier.characterImage; }
            else { img.style.display = 'none'; }
          }}
        />
      </div>
    );
  };

  const sectionLabel = (text: string) => (
    <div style={{
      fontSize: 11, fontWeight: 800, color: '#6B6B66',
      letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 9,
    }}>{text}</div>
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 200,
        background: 'rgba(15,17,21,0.5)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 460,
          background: '#FFFFFF',
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          maxHeight: '85%',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          animation: 'nodingo-sheet-in 420ms cubic-bezier(.2,.7,.2,1)',
        }}
      >
        <div style={{ padding: '8px 0 4px', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 42, height: 4, borderRadius: 999, background: '#D8D8D2' }} />
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '4px 18px 12px', borderBottom: '1px solid #EFEEEA',
        }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0F1115' }}>친구</div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: '50%',
            background: '#F4F4F0', color: '#6B6B66', border: 'none',
            cursor: 'pointer', fontSize: 18, lineHeight: 1,
          }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px 22px' }}>
          {/* 친구 검색 */}
          {sectionLabel('닉네임으로 친구 찾기')}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              placeholder="친구 닉네임 입력"
              style={{
                flex: 1, padding: '12px 14px', borderRadius: 14,
                border: '1.5px solid #E6E6E2', background: '#FFFFFF',
                fontSize: 14, fontWeight: 700, color: '#0F1115',
                fontFamily: 'inherit', outline: 'none',
              }}
            />
            <button onClick={handleSearch} disabled={!query.trim() || searching} style={{
              padding: '0 20px', borderRadius: 14, border: 'none',
              background: query.trim() ? accentColor : '#E6E6E2',
              color: '#fff', fontSize: 14, fontWeight: 800,
              cursor: query.trim() ? 'pointer' : 'not-allowed', flexShrink: 0,
            }}>{searching ? '검색중' : '검색'}</button>
          </div>

          {/* 검색 결과 */}
          {searched === 'none' && (
            <div style={{
              padding: '14px 16px', borderRadius: 14, background: '#FAF7F1',
              textAlign: 'center', color: '#6B6B66', fontSize: 13, fontWeight: 600, marginBottom: 22,
            }}>
              검색 결과가 없어요.
            </div>
          )}
          {searched && searched !== 'none' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '10px 12px', borderRadius: 16, marginBottom: 22,
              background: '#E5F4E0', border: '1px solid #BFE3B5',
            }}>
              {rowAvatar(searched)}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0F1115' }}>{searched.nickname}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: tierOf(searched.level).color }}>
                  {tierOf(searched.level).name} · Lv {searched.level}{searched.persona ? ` · #${searched.persona}` : ''}
                </div>
              </div>
              <button
                onClick={() => handleRequest(searched)}
                disabled={requestedIds.has(searched.user_id)}
                style={{
                  padding: '9px 14px', borderRadius: 12, border: 'none',
                  background: requestedIds.has(searched.user_id) ? '#D8D8D2' : accentColor,
                  color: '#fff', fontSize: 13, fontWeight: 800,
                  cursor: requestedIds.has(searched.user_id) ? 'default' : 'pointer', flexShrink: 0,
                }}
              >{requestedIds.has(searched.user_id) ? '요청됨' : '친구 요청'}</button>
            </div>
          )}

          {/* 받은 요청 */}
          {requests.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              {sectionLabel(`받은 요청 · ${requests.length}`)}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {requests.map(r => (
                  <div key={r.user_id} style={{
                    display: 'flex', alignItems: 'center', gap: 11,
                    padding: '10px 12px', borderRadius: 16,
                    background: '#FFFFFF', border: '1px solid #EFEEEA',
                  }}>
                    {rowAvatar(r)}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#0F1115' }}>{r.nickname}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: tierOf(r.level).color }}>
                        {tierOf(r.level).name} · Lv {r.level}{r.persona ? ` · #${r.persona}` : ''}
                      </div>
                    </div>
                    <button onClick={() => handleAccept(r)} style={{
                      padding: '9px 16px', borderRadius: 12, border: 'none',
                      background: accentColor, color: '#fff', fontSize: 13, fontWeight: 800,
                      cursor: 'pointer', flexShrink: 0,
                    }}>수락</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 내 친구 */}
          {sectionLabel(friendsLoading ? '내 친구' : `내 친구 · ${friends.length}`)}
          {friendsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 11,
                  padding: '10px 12px', borderRadius: 16,
                  background: '#FFFFFF', border: '1px solid #EFEEEA',
                }}>
                  <Skeleton width={38} height={38} radius="50%" />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Skeleton width="45%" height={13} />
                    <Skeleton width="60%" height={11} />
                  </div>
                </div>
              ))}
            </div>
          ) : friends.length === 0 ? (
            <div style={{
              padding: '24px 16px', borderRadius: 16, background: '#FAF7F1',
              textAlign: 'center', color: '#6B6B66', fontSize: 13, fontWeight: 600,
            }}>
              아직 친구가 없어요. 닉네임으로 검색해 친구를 추가해보세요!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {friends.map(f => (
                <div key={f.user_id} style={{
                  display: 'flex', alignItems: 'center', gap: 11,
                  padding: '10px 12px', borderRadius: 16,
                  background: '#FFFFFF', border: '1px solid #EFEEEA',
                }}>
                  {rowAvatar(f)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#0F1115' }}>{f.nickname}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: tierOf(f.level).color }}>
                      {tierOf(f.level).name} · Lv {f.level}{f.persona ? ` · #${f.persona}` : ''}
                    </div>
                  </div>
                </div>
              ))}
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