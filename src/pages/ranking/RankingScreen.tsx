import { useState } from 'react';
import { MOCK_RANKING_FRIENDS, MOCK_RANKING_PERSONA, tierOf, xpForLevel } from '../../mocks';
import type { RankingEntry, UserGame } from '../../types/game';

const PODIUM_COLORS = ['#F5B82E', '#C0C0C0', '#CD7F32'];
const PODIUM_HEIGHTS = [84, 64, 52];

interface PodiumProps { entries: RankingEntry[]; accentColor: string }

function Podium({ entries, accentColor }: PodiumProps) {
  const top3 = entries.filter(e => e.rank <= 3).sort((a, b) => a.rank - b.rank);
  const ORDER = [1, 0, 2];
  const ordered = ORDER.map(i => top3[i]).filter(Boolean);

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      gap: 10, padding: '8px 20px 0',
    }}>
      {ordered.map((e, i) => {
        const origIdx = ORDER[i];
        const h = PODIUM_HEIGHTS[origIdx];
        const medalColor = PODIUM_COLORS[origIdx];
        return (
          <div key={e.rank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            {e.isMe && (
              <span style={{
                fontSize: 10, fontWeight: 700, color: accentColor,
                background: `${accentColor}22`, padding: '2px 8px', borderRadius: 20,
              }}>나</span>
            )}
            <div style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: tierOf(e.level).soft,
              border: `2px solid ${tierOf(e.level).color}`,
              overflow: 'hidden',
              boxShadow: '0 4px 10px rgba(15,17,21,0.10)',
            }}>
              <img
                src={tierOf(e.level).characterImage}
                alt={tierOf(e.level).name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#0F1115', textAlign: 'center', maxWidth: 68 }}>
              {e.name}
            </div>
            <div style={{
              width: 74, height: h,
              background: medalColor,
              borderRadius: '18px 18px 8px 8px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 2,
              boxShadow: '0 6px 14px rgba(15,17,21,0.10)',
            }}>
              <span style={{ fontSize: 17, fontWeight: 900, color: '#FFFFFF' }}>
                {e.rank}
              </span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.82)', fontWeight: 700 }}>
                {e.weekXp.toLocaleString()} XP
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface RankRowProps {
  entry: RankingEntry;
  accentColor: string;
  onPoke?: (entry: RankingEntry) => void;
  onOpenMap?: (entry: RankingEntry) => void;
}

function RankRow({ entry, accentColor, onPoke, onOpenMap }: RankRowProps) {
  const tier = tierOf(entry.level);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 10px',
      background: entry.isMe ? `${accentColor}10` : '#FFFFFF',
      borderRadius: 16,
    }}>
      <span style={{
        width: 28, fontSize: 13, fontWeight: 700,
        color: entry.rank <= 3 ? PODIUM_COLORS[entry.rank - 1] : '#9A9A94',
        textAlign: 'center', flexShrink: 0,
      }}>
        {entry.rank}
      </span>
      <div style={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        background: tier.soft,
        border: `1.5px solid ${tier.color}`,
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <img
          src={tier.characterImage}
          alt={tier.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#0F1115' }}>{entry.name}</span>
          {entry.isMe && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: accentColor,
              background: `${accentColor}22`, padding: '1px 7px', borderRadius: 20,
            }}>나</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span style={{ fontSize: 11, color: tier.color, fontWeight: 600 }}>
            Lv {entry.level}
          </span>
          {entry.persona && (
            <span style={{ fontSize: 11, color: '#6B6B66' }}>
              #{entry.persona}
            </span>
          )}
        </div>
      </div>
      <span style={{ fontSize: 13, fontWeight: 800, color: '#0F1115', flexShrink: 0 }}>
        {entry.weekXp.toLocaleString()} XP
      </span>
      {!entry.isMe && (
        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          <button
            onClick={() => onPoke?.(entry)}
            title="툭 건들기"
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: '#FFF1E2', color: '#E8654D',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13,
            }}
          >
            👋
          </button>
          <button
            onClick={() => onOpenMap?.(entry)}
            title="지식지도 보기"
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: '#F4F4F0', color: '#6B6B66',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="6" r="2.4" stroke="currentColor" strokeWidth="1.8"/>
              <circle cx="5" cy="15" r="2.4" stroke="currentColor" strokeWidth="1.8"/>
              <circle cx="17" cy="15" r="2.4" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M9.2 7.5L6.5 13M12.8 7.5l2.7 5.5M7 15h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

interface RankingScreenProps {
  accentColor: string;
  userGame: UserGame;
}

export default function RankingScreen({ accentColor, userGame }: RankingScreenProps) {
  const [rankTab, setRankTab] = useState<'friends' | 'persona'>('friends');
  const [toast, setToast] = useState('');
  const [mapUser, setMapUser] = useState<RankingEntry | null>(null);
  const entries = rankTab === 'friends' ? MOCK_RANKING_FRIENDS : MOCK_RANKING_PERSONA;
  const top3 = entries.filter(e => e.rank <= 3);
  const rest = entries.filter(e => e.rank > 3 && !e.isMe);
  const me = entries.find(e => e.isMe);
  const myTier = tierOf(userGame.level);
  const neededXp = xpForLevel(userGame.level);
  const weekXp = me?.weekXp ?? userGame.xp;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 1600);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', overflowY: 'auto',
      overscrollBehavior: 'contain',
      background: '#FAF7F1',
    }}>
      <div style={{ padding: '14px 20px 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#6B6B66',
          letterSpacing: '.08em', textTransform: 'uppercase' }}>이번 주 랭킹</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: '#0F1115',
          letterSpacing: '-0.03em', marginTop: 4 }}>지식 모험가 TOP 100 🏆</div>
        <div style={{ fontSize: 12, color: '#6B6B66', marginTop: 4 }}>
          매주 일요일 자정 초기화 · 보상 지급</div>
      </div>

      <div style={{
        margin: '0 16px 14px',
        padding: '12px 14px',
        borderRadius: 20,
        background: '#FFFFFF',
        boxShadow: '0 2px 8px rgba(15,17,21,0.04)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 42,
          height: 42,
          borderRadius: '50%',
          background: myTier.soft,
          border: `2px solid ${myTier.color}`,
          overflow: 'hidden',
          flexShrink: 0,
        }}>
          <img
            src={myTier.characterImage}
            alt={myTier.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: myTier.color }}>
            {myTier.name} · Lv {userGame.level}
          </div>
          <div style={{ marginTop: 5, height: 7, borderRadius: 999, background: '#F1F1ED', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, Math.round((userGame.xp / neededXp) * 100))}%`,
              height: '100%',
              borderRadius: 999,
              background: myTier.color,
            }} />
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#0F1115' }}>
            {weekXp.toLocaleString()}
          </div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#6B6B66' }}>week XP</div>
        </div>
      </div>

      <div style={{
        padding: '0 20px 14px', display: 'flex', gap: 6, flexShrink: 0,
      }}>
        {(['friends', 'persona'] as const).map(t => (
          <button key={t} onClick={() => setRankTab(t)} style={{
            padding: '7px 16px', borderRadius: 999,
            border: 'none',
            background: rankTab === t ? '#0F1115' : '#F4F4F0',
            color: rankTab === t ? '#fff' : '#6B6B66',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Pretendard, -apple-system, system-ui, sans-serif',
            transition: 'all 0.18s',
          }}>
            {t === 'friends' ? '친구' : '관심분야'}
          </button>
        ))}
      </div>

      <Podium entries={top3} accentColor={accentColor} />

      <div style={{
        margin: '14px 16px 0',
        background: '#FFFFFF',
        borderRadius: 22, padding: 8,
        boxShadow: '0 2px 8px rgba(15,17,21,0.04)',
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        {rest.map(e => (
          <RankRow
            key={e.rank}
            entry={e}
            accentColor={accentColor}
            onPoke={(entry) => showToast(`${entry.name}님에게 툭 건드리기를 보냈어요`)}
            onOpenMap={(entry) => setMapUser(entry)}
          />
        ))}
      </div>

      <div style={{ flex: 1 }} />

      {me && (
        <div style={{
          position: 'sticky', bottom: 0,
          margin: '8px 16px',
          padding: '0 6px',
          background: tierOf(me.level).soft,
          borderRadius: 18,
          border: `1.5px solid ${tierOf(me.level).color}33`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <RankRow entry={me} accentColor={accentColor} />
        </div>
      )}

      {toast && (
        <div style={{
          position: 'sticky',
          bottom: 76,
          alignSelf: 'center',
          zIndex: 30,
          padding: '9px 14px',
          borderRadius: 999,
          background: 'rgba(15,17,21,0.88)',
          color: '#FFFFFF',
          fontSize: 12,
          fontWeight: 800,
          boxShadow: '0 10px 24px rgba(15,17,21,0.18)',
        }}>
          {toast}
        </div>
      )}

      {mapUser && (
        <div
          onClick={() => setMapUser(null)}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 120,
            background: 'rgba(15,17,21,0.34)',
            display: 'flex',
            alignItems: 'flex-end',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              background: '#FFFFFF',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: '10px 18px 20px',
              boxShadow: '0 -16px 38px rgba(15,17,21,0.18)',
              animation: 'nodingo-sheet-in 420ms cubic-bezier(.2,.7,.2,1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
              <div style={{ width: 42, height: 4, borderRadius: 999, background: '#D8D8D2' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: tierOf(mapUser.level).soft,
                border: `2px solid ${tierOf(mapUser.level).color}`,
                overflow: 'hidden',
              }}>
                <img
                  src={tierOf(mapUser.level).characterImage}
                  alt={tierOf(mapUser.level).name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#0F1115' }}>
                  {mapUser.name}님의 지식지도
                </div>
                <div style={{ fontSize: 12, color: '#6B6B66', marginTop: 2 }}>
                  {tierOf(mapUser.level).name} · Lv {mapUser.level} · {mapUser.weekXp.toLocaleString()} XP
                </div>
              </div>
              <button onClick={() => setMapUser(null)} style={{
                width: 34, height: 34, borderRadius: '50%',
                background: '#F4F4F0', color: '#6B6B66',
                border: 'none', cursor: 'pointer',
                fontSize: 20,
              }}>
                ×
              </button>
            </div>
            <div style={{
              height: 188,
              borderRadius: 20,
              background: '#FAF7F1',
              position: 'relative',
              overflow: 'hidden',
              border: '1px solid #EFEEEA',
            }}>
              <svg viewBox="0 0 320 188" width="100%" height="100%">
                <line x1="160" y1="94" x2="92" y2="68" stroke={tierOf(mapUser.level).color} strokeWidth="1.4" opacity="0.7" />
                <line x1="160" y1="94" x2="224" y2="56" stroke={tierOf(mapUser.level).color} strokeWidth="1.4" opacity="0.7" />
                <line x1="160" y1="94" x2="232" y2="132" stroke="#D8D8D2" strokeWidth="1" />
                <line x1="160" y1="94" x2="86" y2="128" stroke="#D8D8D2" strokeWidth="1" />
                {[
                  [160, 94, 24, mapUser.name],
                  [92, 68, 17, '금리'],
                  [224, 56, 17, 'AI 규제'],
                  [232, 132, 14, '대선'],
                  [86, 128, 14, '복지정책'],
                ].map(([x, y, r, label]) => (
                  <g key={String(label)}>
                    <circle cx={Number(x)} cy={Number(y)} r={Number(r)} fill="#FFFFFF" stroke={tierOf(mapUser.level).color} strokeWidth="2" />
                    <text x={Number(x)} y={Number(y) + Number(r) + 14} textAnchor="middle" fontSize="11" fontWeight="800" fill="#0F1115">
                      {label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            <button onClick={() => showToast(`${mapUser.name}님의 지식지도 탐색은 발표용 미리보기예요`)} style={{
              marginTop: 12,
              width: '100%',
              padding: '13px 0',
              borderRadius: 18,
              background: tierOf(mapUser.level).color,
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 800,
            }}>
              지식지도 방문하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
