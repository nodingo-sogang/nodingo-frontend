/* global React, IOSDevice, TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakToggle, TweakButton */
// nodingo-app.jsx — root component
// Owns user state, screen routing, top HUD, bottom nav, and the modal stack.

const { useState, useMemo, useEffect, useRef } = React;

// ─── HUD (top status bar) ───────────────────────────────────
function HUD({ user, accent, onAvatarTap }) {
  const T = window.NODINGO_TOKENS;
  const tier = window.NODINGO_TIER_OF(user.level);
  const pct = (user.xp / window.NODINGO_XP_PER_LEVEL) * 100;

  return (
    <div style={{
      position: 'absolute', top: 47, left: 0, right: 0, zIndex: 80,
      padding: '8px 14px 10px',
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px) saturate(150%)',
      WebkitBackdropFilter: 'blur(12px) saturate(150%)',
      borderBottom: '1px solid rgba(15,17,21,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* avatar + tier */}
        <button onClick={onAvatarTap} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '4px 10px 4px 4px', borderRadius: 999,
          background: tier.soft, border: 'none', cursor: 'pointer',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          }}>{user.avatar}</div>
          <div style={{
            fontSize: 11, fontWeight: 800, color: tier.color, letterSpacing: '-0.01em',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span>{tier.emoji}</span><span>{tier.name}</span>
          </div>
        </button>

        <div style={{ flex: 1 }} />

        {/* streak */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 3,
          padding: '4px 9px', borderRadius: 999,
          background: '#FFF1E2', color: '#E8654D',
          fontSize: 12, fontWeight: 800, letterSpacing: '-0.01em',
        }}>
          <span style={{ fontSize: 13 }}>🔥</span>{user.streak}
        </div>
        {/* coins */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 3,
          padding: '4px 9px', borderRadius: 999,
          background: '#FFF8E1', color: '#B8870E',
          fontSize: 12, fontWeight: 800, letterSpacing: '-0.01em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          <span style={{ fontSize: 12 }}>🪙</span>{user.coins.toLocaleString()}
        </div>
      </div>

      {/* XP bar row */}
      <div style={{
        marginTop: 8, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 800, color: T.ink, letterSpacing: '-0.01em',
          width: 30, fontVariantNumeric: 'tabular-nums',
        }}>Lv {user.level}</div>
        <div style={{
          flex: 1, height: 8, background: '#F1F1ED',
          borderRadius: 999, overflow: 'hidden', position: 'relative',
        }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: `linear-gradient(90deg, ${accent.c} 0%, ${lighten(accent.c)} 100%)`,
            borderRadius: 999,
            transition: 'width 520ms cubic-bezier(.2,.7,.2,1)',
            boxShadow: `0 0 6px ${accent.c}66`,
          }} />
        </div>
        <div style={{
          fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '-0.01em',
          fontVariantNumeric: 'tabular-nums',
        }}>{user.xp} / {window.NODINGO_XP_PER_LEVEL}</div>
      </div>
    </div>
  );
}

// helper to lighten a hex toward white
function lighten(hex) {
  const h = hex.replace('#','');
  const r = Math.min(255, parseInt(h.slice(0,2),16) + 30);
  const g = Math.min(255, parseInt(h.slice(2,4),16) + 30);
  const b = Math.min(255, parseInt(h.slice(4,6),16) + 30);
  return `#${[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('')}`;
}

// ─── Bottom nav ─────────────────────────────────────────────
function BottomNav({ tab, setTab, accent }) {
  const T = window.NODINGO_TOKENS;
  const items = [
    { id: 'graph',   label: '그래프',   icon: GraphIcon },
    { id: 'ranking', label: '랭킹',     icon: TrophyIcon },
    { id: 'profile', label: '내 정보',  icon: UserIcon },
  ];
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
      {items.map(it => {
        const active = tab === it.id;
        const Icon = it.icon;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} style={{
            flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: 0, color: active ? accent.c : T.muted,
          }}>
            {/* active dot */}
            <div style={{
              width: 4, height: 4, borderRadius: 999,
              background: active ? accent.c : 'transparent',
              marginTop: 4, marginBottom: 2,
              transition: 'background 200ms',
            }} />
            <Icon color={active ? accent.c : T.muted} filled={active} />
            <div style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: '-0.01em',
            }}>{it.label}</div>
          </button>
        );
      })}
    </div>
  );
}

function GraphIcon({ color, filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="6" r="2.4" fill={filled ? color : 'none'} stroke={color} strokeWidth="1.6"/>
      <circle cx="5" cy="15" r="2.4" fill={filled ? color : 'none'} stroke={color} strokeWidth="1.6"/>
      <circle cx="17" cy="15" r="2.4" fill={filled ? color : 'none'} stroke={color} strokeWidth="1.6"/>
      <path d="M9.2 7.5L6.5 13M12.8 7.5l2.7 5.5M7 15h8" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
    </svg>
  );
}
function TrophyIcon({ color, filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M6 4h10v4a5 5 0 01-10 0V4z" fill={filled ? color : 'none'} stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M6 5H3v1a3 3 0 003 3M16 5h3v1a3 3 0 01-3 3" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M9 13h4l-.5 3h-3L9 13zM7.5 18h7" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function UserIcon({ color, filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="7.5" r="3.5" fill={filled ? color : 'none'} stroke={color} strokeWidth="1.6"/>
      <path d="M4 18.5c1.5-3.5 4-5 7-5s5.5 1.5 7 5" fill={filled ? color : 'none'} stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── overview hint ──────────────────────────────────────────
function OverviewHint({ user }) {
  const remaining = user.dailyGoal - user.dailyProgress;
  return (
    <div style={{
      position: 'absolute', bottom: 100, left: 0, right: 0,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 50,
    }}>
      <div style={{
        padding: '8px 14px',
        background: 'rgba(15,17,21,0.88)', color: '#fff',
        borderRadius: 999, fontSize: 11, fontWeight: 600,
        letterSpacing: '-0.01em',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {remaining > 0 ? (
          <>
            <span style={{
              width: 6, height: 6, borderRadius: 999, background: '#7CE0B0',
              boxShadow: '0 0 8px #7CE0B0',
            }} />
            <span>오늘 퀴즈 <b>{remaining}개</b> 더 풀면 영수증 발급 🧾</span>
          </>
        ) : (
          <>
            <span style={{
              width: 6, height: 6, borderRadius: 999, background: '#FFD166',
              boxShadow: '0 0 8px #FFD166',
            }} />
            <span>오늘의 목표 달성! 내일 또 만나요 ✨</span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Graph screen container ─────────────────────────────────
function GraphScreen({ user, accent, selectedNode, setSelectedNode, onQuiz, onScrap, onLocked, toast, unlockingNodes }) {
  const nodes = window.NODINGO_NODES;
  const edges = window.NODINGO_EDGES;
  const data = selectedNode
    ? (window.NODINGO_SUMMARIES[selectedNode]
       || window.NODINGO_FALLBACK(selectedNode, nodes.find(n => n.id === selectedNode)?.label || selectedNode))
    : null;
  const relatedIds = useMemo(() => data ? new Set(data.related) : new Set(), [data]);
  const scrappedSet = useMemo(() => new Set(user.scrapped), [user.scrapped]);
  const completedSet = useMemo(() => new Set(user.completedQuizzes), [user.completedQuizzes]);

  const handleTap = (id, isLocked) => {
    if (isLocked) { onLocked(id); return; }
    setSelectedNode(id);
  };

  return (
    <>
      <window.NodingoGraphCanvas
        nodes={nodes}
        edges={edges}
        selectedId={selectedNode}
        relatedIds={relatedIds}
        accent={accent}
        userLevel={user.level}
        scrappedSet={scrappedSet}
        onTapNode={handleTap}
        onTapBg={() => setSelectedNode(null)}
        unlockingSet={unlockingNodes}
      />

      {!selectedNode && <OverviewHint user={user} />}

      {selectedNode && (
        <window.NodingoSummaryPanel
          data={data}
          nodeId={selectedNode}
          accent={accent}
          scrapped={scrappedSet.has(selectedNode)}
          quizCompleted={completedSet.has(selectedNode)}
          onClose={() => setSelectedNode(null)}
          onJump={(id) => {
            const locked = (window.NODINGO_UNLOCK[id] || 1) > user.level;
            if (locked) { onLocked(id); return; }
            setSelectedNode(id);
          }}
          onScrap={() => onScrap(selectedNode)}
          onQuiz={() => onQuiz(selectedNode)}
        />
      )}

      <window.NodingoLockedToast message={toast} />
    </>
  );
}

// ─── App root ───────────────────────────────────────────────
function NodingoApp() {
  const tweakDefaults = /*EDITMODE-BEGIN*/{
    "accent": "coral",
    "startTab": "graph",
    "demoLowProgress": false
  }/*EDITMODE-END*/;
  const [t, setTweak] = useTweaks(tweakDefaults);
  const accent = window.NODINGO_ACCENTS[t.accent] || window.NODINGO_ACCENTS.coral;

  // user state
  const [user, setUser] = useState(() => ({
    ...window.NODINGO_DEFAULT_USER,
    ...(t.demoLowProgress ? { dailyProgress: 0, level: 2, xp: 30 } : {}),
  }));

  // ui state
  const [tab, setTab] = useState(t.startTab || 'graph');
  const [selectedNode, setSelectedNode] = useState('graphrag');
  const [quizFor, setQuizFor] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [toast, setToast] = useState('');
  const [receiptShownToday, setReceiptShownToday] = useState(false);

  // ── 안개 해제 연출용 state ──────────────────────────────
  const [unlockingNodes, setUnlockingNodes] = useState(new Set());

  // toast timer
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 1800);
    return () => clearTimeout(id);
  }, [toast]);

  // ─── handlers ─────────────────────────────────────────────
  const handleLocked = (id) => {
    const need = window.NODINGO_UNLOCK[id] || 1;
    const node = window.NODINGO_NODES.find(n => n.id === id);
    setToast(`Lv ${need}부터 잠금이 해제돼요 (${node?.label || id})`);
  };

  const handleScrap = (id) => {
    setUser(u => {
      const has = u.scrapped.includes(id);
      return { ...u, scrapped: has ? u.scrapped.filter(x => x !== id) : [...u.scrapped, id] };
    });
  };

  const handleStartQuiz = (id) => setQuizFor(id);

  const handleQuizComplete = ({ correctCount, xpGained, coinsGained, nodeId }) => {
    setQuizFor(null);

    // 1) merge state — handle level-up overflow correctly
    let newXp = user.xp + xpGained;
    let newLevel = user.level;
    while (newXp >= window.NODINGO_XP_PER_LEVEL) {
      newXp -= window.NODINGO_XP_PER_LEVEL;
      newLevel += 1;
    }

    // ── 레벨업 발생 시 안개 해제 연출 트리거 ──────────────
    if (newLevel > user.level) {
      const toUnlock = Object.entries(window.NODINGO_UNLOCK)
        .filter(([, lv]) => lv === newLevel)
        .map(([id]) => id);

      if (toUnlock.length > 0) {
        setUnlockingNodes(new Set(toUnlock));
        // 1.2초 후 연출 종료 → 실제 레벨 반영
        setTimeout(() => setUnlockingNodes(new Set()), 1200);
      }
    }

    const wasCompleted = user.completedQuizzes.includes(nodeId);
    const newProgress = wasCompleted ? user.dailyProgress : user.dailyProgress + 1;
    const newUser = {
      ...user,
      level: newLevel, xp: newXp,
      coins: user.coins + coinsGained,
      dailyProgress: Math.min(newProgress, user.dailyGoal),
      completedQuizzes: wasCompleted ? user.completedQuizzes : [...user.completedQuizzes, nodeId],
      totalQuizzesSolved: user.totalQuizzesSolved + 1,
    };
    setUser(newUser);

    // 2) Receipt trigger — once per day, when goal hits
    if (!receiptShownToday && newProgress >= user.dailyGoal) {
      const node = window.NODINGO_NODES.find(n => n.id === nodeId);
      const summary = window.NODINGO_SUMMARIES[nodeId];
      const related = summary?.related?.[0];
      const relNode = related ? window.NODINGO_NODES.find(n => n.id === related) : null;
      const now = new Date();
      const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;
      const serial = 'ND-' + (Math.floor(Math.random() * 0xFFFFFF)).toString(16).toUpperCase().padStart(6, '0') + '-' + Math.floor(Math.random()*900+100);

      setTimeout(() => {
        setReceipt({
          date: dateStr,
          username: newUser.username,
          brainKcal: 150,
          synapseFrom: node?.label || '키워드',
          synapseTo: relNode?.label || '관련 개념',
          savedFrom: '45분',
          savedTo: '3분',
          coinsGained,
          coinsTotal: newUser.coins,
          serial,
        });
        setReceiptShownToday(true);
      }, 380);
    }
  };

  const openReceiptDemo = () => {
    setReceipt({
      date: '2025.05.27',
      username: user.username,
      brainKcal: 150,
      synapseFrom: 'GraphRAG',
      synapseTo: '지식그래프',
      savedFrom: '45분',
      savedTo: '3분',
      coinsGained: 35,
      coinsTotal: user.coins + 35,
      serial: 'ND-A8F2C9-247',
    });
  };

  const handleJumpFromProfile = (id) => {
    setSelectedNode(id);
    setTab('graph');
  };

  // ─── render ───────────────────────────────────────────────
  const T = window.NODINGO_TOKENS;
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: T.bg, overflow: 'hidden',
      fontFamily: 'Pretendard, -apple-system, system-ui, sans-serif',
    }}>
      {/* main screen layer */}
      {tab === 'graph' && (
        <GraphScreen
          user={user} accent={accent}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
          onQuiz={handleStartQuiz}
          onScrap={handleScrap}
          onLocked={handleLocked}
          toast={toast}
          unlockingNodes={unlockingNodes}
        />
      )}
      {tab === 'ranking' && <window.NodingoRankingScreen user={user} />}
      {tab === 'profile' && <window.NodingoProfileScreen user={user} onJump={handleJumpFromProfile} />}

      {/* HUD (always visible) */}
      <HUD user={user} accent={accent} onAvatarTap={() => setTab('profile')} />

      {/* Bottom nav (always visible) */}
      <BottomNav tab={tab} setTab={setTab} accent={accent} />

      {/* Modals */}
      {quizFor && (
        <window.NodingoQuizModal
          nodeId={quizFor}
          accent={accent}
          onClose={() => setQuizFor(null)}
          onComplete={handleQuizComplete}
        />
      )}
      {receipt && (
        <window.NodingoReceiptModal
          data={receipt} accent={accent}
          onClose={() => setReceipt(null)}
        />
      )}

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Accent">
          <TweakRadio
            label="Color" value={t.accent}
            options={[
              { value: 'coral',  label: 'Coral'  },
              { value: 'indigo', label: 'Indigo' },
              { value: 'forest', label: 'Forest' },
            ]}
            onChange={(v) => setTweak('accent', v)}
          />
        </TweakSection>
        <TweakSection label="Demo">
          <TweakButton label="🧾 영수증 미리보기" onClick={openReceiptDemo} />
          <TweakButton
            label="🎯 GraphRAG 퀴즈 열기"
            onClick={() => setQuizFor('graphrag')} secondary
          />
          <TweakButton
            label="↩ 진행 리셋 (Lv 4 · 2/3)"
            onClick={() => {
              setUser(window.NODINGO_DEFAULT_USER);
              setReceiptShownToday(false);
            }}
            secondary
          />
        </TweakSection>
        <TweakSection label="Navigate">
          <TweakRadio
            label="Tab" value={tab}
            options={[
              { value: 'graph',   label: '그래프' },
              { value: 'ranking', label: '랭킹' },
              { value: 'profile', label: '내정보' },
            ]}
            onChange={(v) => setTab(v)}
          />
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

window.NodingoApp = NodingoApp;
