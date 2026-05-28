import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import HUD from '../components/game/HUD';
import QuizModal from '../components/game/QuizModal';
import ReceiptModal from '../components/game/ReceiptModal';
import BottomNav from '../components/layout/BottomNav';
import GraphScreen from './graph/GraphScreen';
import RankingScreen from './ranking/RankingScreen';
import ProfileScreen from './profile/ProfileScreen';
import { MOCK_SUMMARIES, MOCK_USER_GAME, NODE_UNLOCK_LEVELS, xpForLevel, tierOf } from '../mocks';
import type { UserGame, Badge, ReceiptData } from '../types/game';
import type { NodeSummaryResponse } from '../types';

function checkBadges(updated: UserGame): Badge | null {
  const conditions: Array<[string, boolean]> = [
    ['first_login', true],
    ['first_explore', updated.totalNodesExplored >= 1],
    ['explore_10', updated.totalNodesExplored >= 10],
    ['explore_50', updated.totalNodesExplored >= 50],
    ['first_quiz', updated.completedQuizzes.length >= 1 || updated.totalQuizzesSolved >= 1],
    ['quiz_10', updated.totalQuizzesSolved >= 10],
    ['first_scrap', updated.scrapped.length >= 1],
    ['first_follow', updated.following >= 1],
    ['follow_10', updated.following >= 10],
    ['streak_7', updated.streak >= 7],
    ['streak_30', updated.streak >= 30],
  ];

  for (const [id, met] of conditions) {
    const badge = updated.badges.find(x => x.id === id);
    if (met && badge && !badge.earned) return { ...badge, earned: true };
  }
  return null;
}

type RewardData =
  | { kind: 'level'; level: number; tierName: string; tierColor: string; characterImage: string; unlockedCount: number }
  | { kind: 'tier'; level: number; tierName: string; tierColor: string; characterImage: string; unlockedCount: number }
  | { kind: 'badge'; badge: Badge; tierColor: string };

function RewardPopup({ reward, onClose }: { reward: RewardData | null; onClose: () => void }) {
  if (!reward) return null;

  const isBadge = reward.kind === 'badge';
  const color = isBadge ? reward.tierColor : reward.tierColor;
  const title = isBadge
    ? '뱃지 획득!'
    : reward.kind === 'tier'
      ? `${reward.tierName} 단계로 성장!`
      : `Lv ${reward.level} 달성!`;
  const subtitle = isBadge
    ? reward.badge.name
    : reward.unlockedCount > 0
      ? `${reward.unlockedCount}개의 안개 키워드가 더 선명해졌어요`
      : '더 깊은 지식지도를 탐험할 준비가 되었어요';
  const learn = isBadge
    ? reward.badge.description
    : '퀴즈, 스크랩, 노드 탐험으로 딩고의 관심사가 더 또렷해졌어요.';
  const action = isBadge
    ? reward.badge.condition
    : '새 키워드 탐색 · 뉴스 기반 퀴즈 · 스크랩 추천 정교화';

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 320,
      background: isBadge ? '#FFFFFF' : `linear-gradient(180deg, ${color} 0%, #6EC8F2 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '52px 26px 28px',
      textAlign: 'center',
      animation: 'nodingo-modal-in 360ms cubic-bezier(.2,.7,.2,1)',
    }}>
      <div style={{ flex: 1 }} />
      <div style={{
        width: 148,
        height: 148,
        borderRadius: '50%',
        background: isBadge ? '#FAF7F1' : 'rgba(255,255,255,0.22)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
        boxShadow: isBadge ? '0 12px 28px rgba(15,17,21,0.08)' : 'none',
        overflow: 'hidden',
      }}>
        {isBadge ? (
          <span style={{ fontSize: 70 }}>🏅</span>
        ) : (
          <img
            src={reward.characterImage}
            alt={reward.tierName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>

      <div style={{
        fontSize: isBadge ? 32 : 30,
        fontWeight: 900,
        color: isBadge ? '#0F1115' : '#FFFFFF',
        letterSpacing: '-0.04em',
        lineHeight: 1.15,
      }}>
        {title}
      </div>
      <div style={{
        marginTop: 10,
        fontSize: 18,
        fontWeight: 900,
        color: isBadge ? color : '#FFFFFF',
        lineHeight: 1.35,
      }}>
        {subtitle}
      </div>

      <div style={{
        width: '100%',
        marginTop: 28,
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 10,
      }}>
        <div style={{
          background: isBadge ? '#FAF7F1' : 'rgba(255,255,255,0.96)',
          borderRadius: 20,
          padding: '14px 16px',
          textAlign: 'left',
        }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#6B6B66', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            이제 할 수 있는 것
          </div>
          <div style={{ marginTop: 5, fontSize: 14, fontWeight: 800, color: '#0F1115', lineHeight: 1.45 }}>
            {action}
          </div>
        </div>
        <div style={{
          background: isBadge ? '#FAF7F1' : 'rgba(255,255,255,0.96)',
          borderRadius: 20,
          padding: '14px 16px',
          textAlign: 'left',
        }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#6B6B66', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            알게 된 것
          </div>
          <div style={{ marginTop: 5, fontSize: 14, fontWeight: 800, color: '#0F1115', lineHeight: 1.45 }}>
            {learn}
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      <button onClick={onClose} style={{
        width: '100%',
        padding: '15px 0',
        borderRadius: 20,
        background: isBadge ? color : '#FFFFFF',
        color: isBadge ? '#FFFFFF' : color,
        border: 'none',
        cursor: 'pointer',
        fontSize: 17,
        fontWeight: 900,
        boxShadow: isBadge ? `0 4px 0 ${color}99` : '0 6px 0 rgba(15,17,21,0.10)',
      }}>
        계속하기
      </button>
    </div>
  );
}

type ScrappedKeyword = {
  id: number;
  label: string;
  persona: string;
  summary: string;
};

type Tab = 'graph' | 'scrap' | 'ranking' | 'profile';

function fallbackNews(summary: NodeSummaryResponse | undefined, item: ScrappedKeyword) {
  if (summary?.news && summary.news.length > 0) return summary.news;
  return [{
    id: item.id * 100,
    title: `${item.label} 관련 원문`,
    outlet: 'Nodingo Source',
    date: '2025.05.27',
    url: `https://example.com/source/${item.id}`,
    snippet: item.summary,
  }];
}

function ScrapScreen({
  items,
  onOpen,
}: {
  items: ScrappedKeyword[];
  onOpen: (item: ScrappedKeyword) => void;
}) {
  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      background: '#FAF7F1',
      padding: '16px 16px 30px',
      overscrollBehavior: 'contain',
    }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 800,
          color: '#6B6B66',
          letterSpacing: '.08em',
          textTransform: 'uppercase',
        }}>
          딩고의 스크랩
        </div>
        <div style={{
          marginTop: 4,
          fontSize: 24,
          fontWeight: 900,
          color: '#0F1115',
          letterSpacing: '-0.03em',
        }}>
          모아둔 키워드와 기사 ♥
        </div>
      </div>

      {items.length === 0 ? (
        <div style={{
          marginTop: 24,
          padding: '34px 18px',
          borderRadius: 22,
          background: '#FFFFFF',
          textAlign: 'center',
          color: '#6B6B66',
          fontSize: 13,
          fontWeight: 700,
          lineHeight: 1.55,
        }}>
          아직 스크랩한 키워드가 없어요.<br />
          그래프에서 관심 키워드의 하트를 눌러 모아보세요.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(item => {
            const summary = MOCK_SUMMARIES[item.id];
            const news = fallbackNews(summary, item);
            return (
              <article key={item.id} style={{
                background: '#FFFFFF',
                borderRadius: 22,
                padding: 14,
                boxShadow: '0 2px 8px rgba(15,17,21,0.04)',
              }}>
                <button
                  onClick={() => onOpen(item)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 9,
                      height: 9,
                      borderRadius: 999,
                      background: '#E8657A',
                      boxShadow: '0 0 8px #E8657A66',
                    }} />
                    <span style={{ fontSize: 17, fontWeight: 900, color: '#0F1115' }}>{item.label}</span>
                    <span style={{
                      marginLeft: 'auto',
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: '#F4F4F0',
                      color: '#6B6B66',
                      fontSize: 10.5,
                      fontWeight: 800,
                    }}>
                      {item.persona}
                    </span>
                  </div>
                  <p style={{
                    marginTop: 8,
                    fontSize: 12.5,
                    lineHeight: 1.55,
                    color: '#4A4C50',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {item.summary.replace(/\*\*/g, '')}
                  </p>
                </button>

                <div style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px dashed #ECECE8',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 7,
                }}>
                  {news.slice(0, 3).map(article => (
                    <a
                      key={article.id}
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'block',
                        padding: '10px 11px',
                        borderRadius: 14,
                        background: '#FAF7F1',
                        border: '1px solid #EFEEEA',
                        textDecoration: 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        {article.outlet && (
                          <span style={{
                            padding: '2px 7px',
                            borderRadius: 999,
                            background: '#0F1115',
                            color: '#FFFFFF',
                            fontSize: 9.5,
                            fontWeight: 800,
                          }}>
                            {article.outlet}
                          </span>
                        )}
                        {article.date && (
                          <span style={{ fontSize: 10.5, color: '#6B6B66', fontWeight: 700 }}>
                            {article.date}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: '#0F1115', lineHeight: 1.35 }}>
                        {article.title}
                      </div>
                    </a>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function GraphPage() {
  const location = useLocation();
  const forceMock = location.pathname === '/preview';
  const [userGame, setUserGame] = useState<UserGame>(MOCK_USER_GAME);
  const [tab, setTab] = useState<Tab>('graph');
  const [quizFor, setQuizFor] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [unlockingNodes, setUnlockingNodes] = useState<Set<string>>(new Set());
  const [reward, setReward] = useState<RewardData | null>(null);
  const [receiptShownToday, setReceiptShownToday] = useState(false);
  const [scrappedKeywords, setScrappedKeywords] = useState<ScrappedKeyword[]>([]);

  const prevLevelRef = useRef(userGame.level);

  // Daily first-visit XP
  useEffect(() => {
    const today = new Date().toDateString();
    const last = localStorage.getItem('nodingo_last_visit');
    if (last !== today) {
      localStorage.setItem('nodingo_last_visit', today);
      setUserGame(prev => applyXp(prev, 10));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Watch for level-up to trigger unlock animation
  useEffect(() => {
    if (userGame.level > prevLevelRef.current) {
      const previousLevel = prevLevelRef.current;
      const toUnlock = Object.entries(NODE_UNLOCK_LEVELS)
        .filter(([, lv]) => lv > previousLevel && lv <= userGame.level)
        .map(([id]) => id);
      const prevTier = tierOf(previousLevel);
      const nextTier = tierOf(userGame.level);
      prevLevelRef.current = userGame.level;
      if (toUnlock.length > 0) {
        setUnlockingNodes(new Set(toUnlock));
        setTimeout(() => setUnlockingNodes(new Set()), 1200);
      }
      setReward({
        kind: prevTier.name !== nextTier.name ? 'tier' : 'level',
        level: userGame.level,
        tierName: nextTier.name,
        tierColor: nextTier.color,
        characterImage: nextTier.characterImage,
        unlockedCount: Math.max(toUnlock.length, 1),
      });
    }
  }, [userGame.level]);

  // Watch for badge conditions
  useEffect(() => {
    const badge = checkBadges(userGame);
    if (badge) {
      setUserGame(prev => ({
        ...prev,
        badges: prev.badges.map(b => b.id === badge.id ? { ...b, earned: true, earnedAt: new Date().toLocaleDateString('ko-KR') } : b),
      }));
      setReward({ kind: 'badge', badge, tierColor: tierOf(userGame.level).color });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userGame.streak, userGame.totalNodesExplored, userGame.totalQuizzesSolved, userGame.scrapped.length, userGame.following]);

  // ── XP helper ─────────────────────────────────────────────────────────────────

  function applyXp(prev: UserGame, xp: number): UserGame {
    let newXp = prev.xp + xp;
    let newLevel = prev.level;
    while (newXp >= xpForLevel(newLevel)) {
      newXp -= xpForLevel(newLevel);
      newLevel++;
    }
    return { ...prev, xp: newXp, level: newLevel };
  }

  // ── Callbacks from GraphScreen ────────────────────────────────────────────────

  const handleNodeExplore = useCallback((_nodeId: number, _nodeLabel: string) => {
    setUserGame(prev => applyXp(
      { ...prev, totalNodesExplored: prev.totalNodesExplored + 1 },
      5,
    ));
  }, []);

  const handleScrap = useCallback((_nodeId: number, _nodeLabel: string) => {
    setUserGame(prev => applyXp({
      ...prev,
      scrapped: prev.scrapped.includes(_nodeLabel) ? prev.scrapped : [...prev.scrapped, _nodeLabel],
    }, 3));
  }, []);

  const handleScrapChange = useCallback((item: ScrappedKeyword, scrapped: boolean) => {
    setScrappedKeywords(prev => {
      if (scrapped) {
        if (prev.some(x => x.id === item.id)) return prev;
        return [...prev, item];
      }
      return prev.filter(x => x.id !== item.id);
    });
  }, []);

  const handleQuizStart = useCallback((nodeLabel: string) => {
    setQuizFor(nodeLabel);
  }, []);

  // ── Quiz complete ─────────────────────────────────────────────────────────────

  const handleQuizComplete = useCallback((result: {
    correctCount: number; xpGained: number; nodeId: string;
  }) => {
    setQuizFor(null);

    const willCompleteGoal = userGame.dailyProgress + 1 >= userGame.dailyGoal;
    const bonusXp = willCompleteGoal && !receiptShownToday ? 50 : 0;

    setUserGame(prev => {
      const updated = applyXp(
        {
          ...prev,
          totalQuizzesSolved: prev.totalQuizzesSolved + result.correctCount,
          dailyProgress: Math.min(prev.dailyProgress + 1, prev.dailyGoal),
          completedQuizzes: [...prev.completedQuizzes, result.nodeId],
        },
        result.xpGained + bonusXp,
      );
      return updated;
    });

    if (willCompleteGoal && !receiptShownToday) {
      setReceiptShownToday(true);
      setReceipt({
        date: new Date().toLocaleDateString('ko-KR'),
        username: '딩고',
        synapseFrom: result.nodeId,
        synapseTo: '지식',
        serial: `NDG-${Date.now().toString().slice(-8)}`,
      });
    }
  }, [userGame.dailyProgress, userGame.dailyGoal, receiptShownToday]);

  const tier = tierOf(userGame.level);

  return (
    <div className="nodingo-stage">
      <div className="nodingo-device">
        <div className="nodingo-dynamic-island" />
        <div className="nodingo-statusbar">
          <span>9:41</span>
          <span className="nodingo-system-icons">
            <svg width="19" height="12" viewBox="0 0 19 12">
              <rect x="0" y="7.5" width="3.2" height="4.5" rx="0.7" fill="currentColor"/>
              <rect x="4.8" y="5" width="3.2" height="7" rx="0.7" fill="currentColor"/>
              <rect x="9.6" y="2.5" width="3.2" height="9.5" rx="0.7" fill="currentColor"/>
              <rect x="14.4" y="0" width="3.2" height="12" rx="0.7" fill="currentColor"/>
            </svg>
            <svg width="17" height="12" viewBox="0 0 17 12">
              <path d="M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z" fill="currentColor"/>
              <path d="M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z" fill="currentColor"/>
              <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor"/>
            </svg>
            <svg width="27" height="13" viewBox="0 0 27 13">
              <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke="currentColor" strokeOpacity="0.35" fill="none"/>
              <rect x="2" y="2" width="20" height="9" rx="2" fill="currentColor"/>
              <path d="M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z" fill="currentColor" fillOpacity="0.4"/>
            </svg>
          </span>
        </div>
        <div style={{
          position: 'relative',
          display: 'flex', flexDirection: 'column',
          height: '100%',
          background: '#FFFFFF',
          color: '#0F1115',
          overflow: 'hidden',
          fontFamily: 'Pretendard, -apple-system, system-ui, sans-serif',
        }}>
      {/* Fixed HUD */}
      <HUD userGame={userGame} onProfileTap={() => setTab('profile')} />

      {/* Page content - pushed below HUD and above BottomNav */}
      <div style={{
        flex: 1,
        marginTop: 'calc(var(--nodingo-status-offset, 0px) + 82px)',
        marginBottom: 86,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {tab === 'graph' && (
          <GraphScreen
            userGame={userGame}
            unlockingNodes={unlockingNodes}
            forceMock={forceMock}
            onNodeExplore={handleNodeExplore}
            onScrap={handleScrap}
            onScrapChange={handleScrapChange}
            onQuizStart={handleQuizStart}
          />
        )}
        {tab === 'scrap' && (
          <ScrapScreen
            items={scrappedKeywords}
            onOpen={(item) => {
              setTab('graph');
              void item;
              setTimeout(() => setQuizFor(null), 0);
            }}
          />
        )}
        {tab === 'ranking' && (
          <RankingScreen accentColor={tier.color} userGame={userGame} />
        )}
        {tab === 'profile' && (
          <ProfileScreen userGame={userGame} />
        )}
      </div>

      {/* Bottom Nav */}
      <BottomNav
        active={tab}
        onChange={setTab}
        accentColor={tier.color}
      />

      {/* Overlays */}
      {quizFor && (
        <QuizModal
          nodeId={quizFor}
          nodeLabel={quizFor}
          accent={tier.color}
          onClose={() => setQuizFor(null)}
          onComplete={handleQuizComplete}
        />
      )}
      {receipt && (
        <ReceiptModal
          data={receipt}
          onClose={() => setReceipt(null)}
        />
      )}
      <RewardPopup
        reward={reward}
        onClose={() => setReward(null)}
      />
        </div>
        <div className="nodingo-home-indicator" />
      </div>
    </div>
  );
}
