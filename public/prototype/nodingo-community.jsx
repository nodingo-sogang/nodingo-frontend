/* global React */
// nodingo-community.jsx — Ranking screen + Profile screen
// Two scrollable feeds used by the bottom-tab router.

const { useMemo: useCMemo } = React;

// ─── Ranking screen ─────────────────────────────────────────
function RankingScreen({ user }) {
  const T = window.NODINGO_TOKENS;
  const list = useCMemo(() => {
    // inject the user's "real" row if not already represented at a high rank
    const others = window.NODINGO_COMMUNITY.filter(c => !c.isMe);
    const me = {
      rank: 24, name: user.username, avatar: user.avatar,
      level: user.level, weekXp: user.xp + 360, // pretend cumulative for the week
      isMe: true,
    };
    return [...others.slice(0, 8), me, ...others.slice(8)];
  }, [user]);

  const top3 = list.filter(r => !r.isMe).slice(0, 3);
  const rest = list.filter(r => r.rank > 3 || r.isMe);

  return (
    <div style={{
      position: 'absolute', top: 120, left: 0, right: 0, bottom: 0,
      overflow: 'auto', background: '#FAF7F1',
      paddingBottom: 100,
    }}>
      {/* Header */}
      <div style={{ padding: '14px 20px 16px' }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          color: T.muted, textTransform: 'uppercase',
        }}>이번 주 랭킹</div>
        <div style={{
          marginTop: 4, fontSize: 24, fontWeight: 900, color: T.ink,
          letterSpacing: '-0.03em',
        }}>지식 모험가 TOP 100 🏆</div>
        <div style={{ marginTop: 4, fontSize: 12, color: T.muted, fontWeight: 500 }}>
          매주 일요일 자정 초기화 · 보상 지급
        </div>
      </div>

      {/* Tab pills */}
      <div style={{ padding: '0 20px 14px', display: 'flex', gap: 6 }}>
        <Pill active>이번 주</Pill>
        <Pill>친구</Pill>
        <Pill>전체</Pill>
      </div>

      {/* Podium */}
      <Podium top3={top3} />

      {/* Rest of list */}
      <div style={{
        margin: '14px 16px 0', background: '#FFFFFF',
        borderRadius: 22, padding: 8,
        boxShadow: '0 2px 8px rgba(15,17,21,0.04)',
      }}>
        {rest.slice(0, 15).map((r, i) => (
          <RankRow key={r.rank + '-' + r.name} row={r} accent={r.isMe} />
        ))}
      </div>

      {/* Footer message */}
      <div style={{
        margin: '14px 20px 0', padding: '14px 16px',
        background: '#FFF8E1', borderRadius: 16,
        fontSize: 12.5, color: '#7A5500', fontWeight: 600,
        display: 'flex', gap: 10, alignItems: 'center',
        letterSpacing: '-0.01em',
      }}>
        <div style={{ fontSize: 22 }}>💡</div>
        <div>오늘 퀴즈 1개만 더 풀면 <b>탑 20</b> 진입!</div>
      </div>
    </div>
  );
}

function Pill({ children, active }) {
  const T = window.NODINGO_TOKENS;
  return (
    <button style={{
      padding: '7px 14px', borderRadius: 999,
      background: active ? T.ink : '#FFFFFF',
      color: active ? '#fff' : T.ink,
      border: active ? 'none' : '1px solid #ECECE8',
      fontSize: 12.5, fontWeight: 700, letterSpacing: '-0.01em',
      cursor: 'pointer',
    }}>{children}</button>
  );
}

function Podium({ top3 }) {
  const order = [top3[1], top3[0], top3[2]].filter(Boolean); // 2nd, 1st, 3rd
  const heights = [88, 110, 76];
  const medals = ['🥈', '🥇', '🥉'];
  const ranks = [2, 1, 3];

  return (
    <div style={{
      margin: '0 16px', padding: '20px 12px 16px',
      background: 'linear-gradient(180deg, #FFF3D0 0%, #FFF8E8 100%)',
      borderRadius: 22, position: 'relative', overflow: 'hidden',
    }}>
      {/* sparkles */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(245,184,46,0.12) 0, transparent 30%), radial-gradient(circle at 80% 20%, rgba(245,184,46,0.1) 0, transparent 30%)',
      }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10 }}>
        {order.map((r, i) => r && (
          <div key={r.name} style={{ flex: 1, textAlign: 'center' }}>
            <PodiumAvatar r={r} medal={medals[i]} crown={i === 1} />
            <div style={{
              marginTop: 8, fontSize: 13, fontWeight: 800, color: '#0F1115',
              letterSpacing: '-0.01em',
            }}>{r.name}</div>
            <div style={{ marginTop: 2, fontSize: 10.5, color: '#7A5500', fontWeight: 700 }}>
              {r.weekXp.toLocaleString()} XP
            </div>
            <div style={{
              marginTop: 6,
              height: heights[i],
              background: i === 1
                ? 'linear-gradient(180deg, #F5D372 0%, #E8A52E 100%)'
                : i === 0
                  ? 'linear-gradient(180deg, #DADAD2 0%, #B5B5AB 100%)'
                  : 'linear-gradient(180deg, #E8A879 0%, #B5764A 100%)',
              borderRadius: '12px 12px 0 0',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
              paddingTop: 8,
              fontSize: 22, fontWeight: 900, color: '#fff',
              fontVariantNumeric: 'tabular-nums',
              boxShadow: 'inset 0 -2px 6px rgba(0,0,0,0.08)',
            }}>{ranks[i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PodiumAvatar({ r, medal, crown }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {crown && (
        <div style={{
          position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
          fontSize: 22, filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.15))',
        }}>👑</div>
      )}
      <div style={{
        width: 54, height: 54, borderRadius: '50%',
        background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 26, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '2px solid #fff',
      }}>{r.avatar}</div>
      <div style={{
        position: 'absolute', bottom: -4, right: -6, fontSize: 18,
        filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.15))',
      }}>{medal}</div>
    </div>
  );
}

function RankRow({ row, accent }) {
  const T = window.NODINGO_TOKENS;
  const tier = window.NODINGO_TIER_OF(row.level);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 12px', borderRadius: 16,
      background: accent ? '#FFF3E8' : 'transparent',
      border: accent ? '1.5px solid #E8654D' : '1px solid transparent',
      marginBottom: 2,
    }}>
      <div style={{
        width: 28, textAlign: 'center', fontSize: 14, fontWeight: 800,
        color: accent ? '#E8654D' : T.muted, fontVariantNumeric: 'tabular-nums',
      }}>{row.rank}</div>
      <div style={{
        width: 38, height: 38, borderRadius: '50%',
        background: tier.soft, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
      }}>{row.avatar}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 800, color: T.ink, letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {row.name}
          {accent && <span style={{
            padding: '1px 6px', borderRadius: 999,
            background: '#E8654D', color: '#fff',
            fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
          }}>나</span>}
        </div>
        <div style={{
          marginTop: 1, fontSize: 11, color: T.muted, fontWeight: 600,
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <span style={{ color: tier.color }}>{tier.emoji} {tier.name}</span>
          <span style={{ color: '#D8D8D2' }}>·</span>
          <span>Lv {row.level}</span>
        </div>
      </div>
      <div style={{
        fontSize: 13, fontWeight: 800, color: T.ink, letterSpacing: '-0.01em',
        fontVariantNumeric: 'tabular-nums',
      }}>{row.weekXp.toLocaleString()}<span style={{ color: T.muted, fontSize: 10, fontWeight: 700, marginLeft: 2 }}>XP</span></div>
    </div>
  );
}

// ─── Profile screen ─────────────────────────────────────────
function ProfileScreen({ user, onJump }) {
  const T = window.NODINGO_TOKENS;
  const tier = window.NODINGO_TIER_OF(user.level);
  const xpInLevel = user.xp;
  const xpToNext = window.NODINGO_XP_PER_LEVEL;
  const pct = (xpInLevel / xpToNext) * 100;
  const nextTierAt = window.NODINGO_NEXT_TIER_AT(user.level);
  const levelsToNextTier = nextTierAt - user.level;

  return (
    <div style={{
      position: 'absolute', top: 120, left: 0, right: 0, bottom: 0,
      overflow: 'auto',
      background: '#FAF7F1', paddingBottom: 100,
    }}>
      {/* Tier card */}
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{
          position: 'relative', overflow: 'hidden',
          background: `linear-gradient(135deg, ${tier.color} 0%, ${darken2(tier.color)} 100%)`,
          borderRadius: 24, padding: '18px 18px 16px', color: '#fff',
          boxShadow: `0 8px 20px ${tier.color}55`,
        }}>
          {/* deco */}
          <div style={{
            position: 'absolute', right: -20, top: -20, fontSize: 110, opacity: 0.15,
            transform: 'rotate(-12deg)',
          }}>{tier.emoji}</div>

          <div style={{
            display: 'inline-block', padding: '3px 9px', borderRadius: 999,
            background: 'rgba(255,255,255,0.22)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
          }}>현재 등급</div>
          <div style={{
            marginTop: 8, fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>{tier.emoji}</span>{tier.name}
          </div>
          <div style={{ marginTop: 4, fontSize: 13, opacity: 0.92, fontWeight: 600 }}>
            Lv {user.level} · {user.username}
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ height: 10, background: 'rgba(255,255,255,0.25)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`,
                background: '#FFFFFF', borderRadius: 999,
                boxShadow: '0 0 8px rgba(255,255,255,0.5)',
              }} />
            </div>
            <div style={{
              marginTop: 6, display: 'flex', justifyContent: 'space-between',
              fontSize: 11, fontWeight: 700, opacity: 0.92,
            }}>
              <span>{xpInLevel} / {xpToNext} XP</span>
              <span>다음 등급까지 Lv {levelsToNextTier}개</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily progress */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          background: '#FFFFFF', borderRadius: 20, padding: 16,
          boxShadow: '0 2px 8px rgba(15,17,21,0.04)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>오늘의 목표</div>
              <div style={{
                marginTop: 4, fontSize: 16, fontWeight: 800, color: T.ink, letterSpacing: '-0.02em',
              }}>퀴즈 {user.dailyProgress} / {user.dailyGoal} 클리어</div>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 10px', borderRadius: 999,
              background: '#FFF1E2', color: '#E8654D',
              fontSize: 11, fontWeight: 800,
            }}>🔥 {user.streak}일</div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
            {Array.from({ length: user.dailyGoal }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 10, borderRadius: 999,
                background: i < user.dailyProgress ? '#5BBA6F' : '#F1F1ED',
                boxShadow: i < user.dailyProgress ? '0 0 6px #5BBA6F55' : 'none',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ padding: '12px 12px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <StatCard icon="🧠" label="탐색한 노드" value={user.totalNodesExplored} unit="개" color="#4FA3E0" />
        <StatCard icon="🎯" label="푼 퀴즈" value={user.totalQuizzesSolved} unit="문제" color="#5BBA6F" />
        <StatCard icon="🪙" label="N-Coin" value={user.coins.toLocaleString()} unit="" color="#F5B82E" />
        <StatCard icon="📅" label="활동일" value={user.joinDays} unit="일" color="#8B6FE0" />
      </div>

      {/* Scrapped */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>스크랩한 키워드 · {user.scrapped.length}</div>
          <button style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontSize: 11, fontWeight: 700, color: '#E8654D', letterSpacing: '-0.01em',
          }}>전체 보기 →</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {user.scrapped.map(id => {
            const n = window.NODINGO_NODES.find(x => x.id === id);
            if (!n) return null;
            return (
              <button key={id} onClick={() => onJump && onJump(id)} style={{
                padding: '7px 11px', borderRadius: 999,
                background: '#FFEFF1', border: '1px solid #FFD3D9',
                color: '#C13D5C', fontSize: 12.5, fontWeight: 700,
                cursor: 'pointer', letterSpacing: '-0.01em',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span style={{ fontSize: 10 }}>❤</span>{n.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: '0.06em',
          textTransform: 'uppercase', marginBottom: 8,
        }}>최근 획득 배지</div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { emoji: '🔥', name: '7일 연속', color: '#FFE2D0' },
            { emoji: '🎯', name: '첫 만점', color: '#E5F4E0' },
            { emoji: '🧠', name: '시냅스 10개', color: '#E1F0FA' },
            { emoji: '🦊', name: '얼리버드', color: '#EBE4FA' },
          ].map(b => (
            <div key={b.name} style={{
              flex: 'none', width: 78, padding: '12px 8px',
              background: b.color, borderRadius: 16, textAlign: 'center',
              border: '1px solid rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: 26 }}>{b.emoji}</div>
              <div style={{
                marginTop: 4, fontSize: 11, fontWeight: 700, color: '#0F1115', letterSpacing: '-0.01em',
              }}>{b.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, unit, color }) {
  const T = window.NODINGO_TOKENS;
  return (
    <div style={{
      background: '#FFFFFF', borderRadius: 18, padding: 12,
      boxShadow: '0 2px 8px rgba(15,17,21,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 10,
          background: `${color}1A`, color, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14,
        }}>{icon}</div>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.muted }}>{label}</div>
      </div>
      <div style={{
        marginTop: 8, fontSize: 22, fontWeight: 900, color: T.ink,
        letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums',
      }}>
        {value}<span style={{ fontSize: 12, color: T.muted, fontWeight: 700, marginLeft: 3 }}>{unit}</span>
      </div>
    </div>
  );
}

function darken2(hex) {
  const h = hex.replace('#','');
  const r = Math.max(0, parseInt(h.slice(0,2), 16) - 50);
  const g = Math.max(0, parseInt(h.slice(2,4), 16) - 50);
  const b = Math.max(0, parseInt(h.slice(4,6), 16) - 50);
  return `#${[r,g,b].map(x => x.toString(16).padStart(2,'0')).join('')}`;
}

Object.assign(window, {
  NodingoRankingScreen: RankingScreen,
  NodingoProfileScreen: ProfileScreen,
});
