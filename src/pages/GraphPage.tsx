import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import HUD from '../components/game/HUD';
import QuizModal from '../components/game/QuizModal';
import ReceiptModal from '../components/game/ReceiptModal';
import BottomNav from '../components/layout/BottomNav';
import Sidebar from '../components/layout/Sidebar';
import { useMediaQuery } from '../hooks/useMediaQuery';
import GraphScreen from './graph/GraphScreen';
import RankingScreen from './ranking/RankingScreen';
import ProfileScreen from './profile/ProfileScreen';
import { MOCK_SUMMARIES, MOCK_USER_GAME, NODE_UNLOCK_LEVELS, xpForLevel, tierOf } from '../mocks';
import { USE_MOCK } from '../api/config';
import { gameApi } from '../api/game';
import { scrapApi } from '../api/scrap';
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
  forceMock,
}: {
  items: ScrappedKeyword[];
  onOpen: (item: ScrappedKeyword) => void;
  forceMock: boolean;
}) {
  // 서버에 저장된 스크랩 보관함 (영속). 실패/미로그인 시 로컬 세션 스크랩(items)로 폴백.
  const { data: serverItems } = useQuery<ScrappedKeyword[]>({
    queryKey: ['scrapSummaries'],
    queryFn: () =>
      scrapApi.getScrapSummaries()
        .then(r => (r.data.data?.content ?? []).map(s => ({
          id: s.keyword_id,
          label: s.word,
          persona: s.persona,
          summary: s.summary,
        })))
        .catch(() => [] as ScrappedKeyword[]),
    enabled: !forceMock,
  });

  // 서버 스크랩이 있으면 그것, 없으면 로컬(이번 세션 스크랩) 표시
  const list = serverItems && serverItems.length > 0 ? serverItems : items;

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

      {list.length === 0 ? (
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
          {list.map(item => {
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
  // /preview 라우트이거나 VITE_USE_MOCK=true 면 mock 강제
  const forceMock = location.pathname === '/preview' || USE_MOCK;
  // 데스크톱(≥1024px)에서는 사이드바 + 넓은 그래프 + 우측 패널 레이아웃으로 분기
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [userGame, setUserGame] = useState<UserGame>(MOCK_USER_GAME);
  const [tab, setTab] = useState<Tab>('graph');
  const [quizFor, setQuizFor] = useState<{ keywordId: number; label: string } | null>(null);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [unlockingNodes, setUnlockingNodes] = useState<Set<string>>(new Set());
  const [reward, setReward] = useState<RewardData | null>(null);
  const [receiptShownToday, setReceiptShownToday] = useState(false);
  const [scrappedKeywords, setScrappedKeywords] = useState<ScrappedKeyword[]>([]);

  const prevLevelRef = useRef(userGame.level);

  // mock(데모) 모드 한정: 일일 첫 방문 보너스. 라이브는 서버가 출석 처리하므로 제외.
  useEffect(() => {
    if (!forceMock) return;
    const today = new Date().toDateString();
    const last = localStorage.getItem('nodingo_last_visit');
    if (last !== today) {
      localStorage.setItem('nodingo_last_visit', today);
      setUserGame(prev => applyXp(prev, 10));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceMock]);

  // 게임 레벨/XP의 단일 진실 = 백엔드. /game · /progress를 받아 서버 값으로 동기화한다.
  // 액션(탐험·스크랩·퀴즈) 후 호출하면 화면이 서버와 항상 일치 → 새로고침 시 "리셋" 사라짐.
  // suppressReward=true면 초기 로드 시 level-up 팝업을 띄우지 않는다.
  const syncGameFromServer = useCallback(async (suppressReward = false) => {
    if (forceMock) return;
    try {
      const [profileRes, progressRes] = await Promise.all([
        gameApi.getProfile(),
        gameApi.getProgress(),
      ]);
      const profile = profileRes.data.data;
      const progress = progressRes.data.data;
      if (profile && suppressReward) {
        prevLevelRef.current = profile.user_game.level;
      }
      setUserGame(prev => ({
        ...prev,
        level: profile?.user_game.level ?? prev.level,
        xp: profile?.user_game.xp ?? prev.xp,
        streak: profile?.user_game.streak ?? prev.streak,
        dailyGoal: profile?.daily_goals.quizzes_required ?? prev.dailyGoal,
        dailyProgress: profile?.daily_goals.quizzes_completed ?? prev.dailyProgress,
        totalNodesExplored: progress?.explored_count ?? prev.totalNodesExplored,
      }));
    } catch {
      // 서버 미응답 시 현재 상태 유지
    }
  }, [forceMock]);

  // 초기 로드: 서버 값으로 동기화 (리워드 팝업 억제)
  useEffect(() => {
    void syncGameFromServer(true);
  }, [syncGameFromServer]);

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
    if (forceMock) {
      setUserGame(prev => applyXp(
        { ...prev, totalNodesExplored: prev.totalNodesExplored + 1 },
        5,
      ));
    } else {
      // 서버가 탐험 XP(+5)를 적립 → 최신 레벨/진행률을 서버에서 다시 가져옴
      void syncGameFromServer();
    }
  }, [forceMock, syncGameFromServer]);

  const handleScrap = useCallback((_nodeId: number, _nodeLabel: string) => {
    // 뱃지용 로컬 스크랩 목록은 항상 갱신
    setUserGame(prev => ({
      ...prev,
      scrapped: prev.scrapped.includes(_nodeLabel) ? prev.scrapped : [...prev.scrapped, _nodeLabel],
    }));
    // mock은 로컬 XP, 라이브는 서버가 스크랩 XP 적립 (동기화는 onGameSync에서 처리)
    if (forceMock) {
      setUserGame(prev => applyXp(prev, 3));
    }
  }, [forceMock]);

  const handleScrapChange = useCallback((item: ScrappedKeyword, scrapped: boolean) => {
    setScrappedKeywords(prev => {
      if (scrapped) {
        if (prev.some(x => x.id === item.id)) return prev;
        return [...prev, item];
      }
      return prev.filter(x => x.id !== item.id);
    });
  }, []);

  const handleQuizStart = useCallback((keywordId: number, nodeLabel: string) => {
    setQuizFor({ keywordId, label: nodeLabel });
  }, []);

  // ── Quiz complete ─────────────────────────────────────────────────────────────

  const handleQuizComplete = useCallback((result: {
    correctCount: number; xpGained: number; nodeId: string;
  }) => {
    setQuizFor(null);

    const willCompleteGoal = userGame.dailyProgress + 1 >= userGame.dailyGoal;
    const bonusXp = willCompleteGoal && !receiptShownToday ? 50 : 0;

    if (forceMock) {
      setUserGame(prev => applyXp(
        {
          ...prev,
          totalQuizzesSolved: prev.totalQuizzesSolved + result.correctCount,
          dailyProgress: Math.min(prev.dailyProgress + 1, prev.dailyGoal),
          completedQuizzes: [...prev.completedQuizzes, result.nodeId],
        },
        result.xpGained + bonusXp,
      ));
    } else {
      // 라이브: 뱃지/완료표시용 로컬 필드만 갱신, 레벨/XP/진행률은 서버에서 동기화
      setUserGame(prev => ({
        ...prev,
        totalQuizzesSolved: prev.totalQuizzesSolved + result.correctCount,
        completedQuizzes: [...prev.completedQuizzes, result.nodeId],
      }));
      void syncGameFromServer();
    }

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
  }, [userGame.dailyProgress, userGame.dailyGoal, receiptShownToday, forceMock, syncGameFromServer]);

  const tier = tierOf(userGame.level);

  // 모바일/데스크톱 공통으로 재사용하는 탭 콘텐츠 (로직·데이터 동일, 배치만 다름)
  const graphContent = (
    <GraphScreen
      userGame={userGame}
      unlockingNodes={unlockingNodes}
      forceMock={forceMock}
      onNodeExplore={handleNodeExplore}
      onScrap={handleScrap}
      onScrapChange={handleScrapChange}
      onQuizStart={handleQuizStart}
      onGameSync={syncGameFromServer}
      isDesktop={isDesktop}
    />
  );
  const scrapContent = (
    <ScrapScreen
      items={scrappedKeywords}
      forceMock={forceMock}
      onOpen={(item) => {
        setTab('graph');
        void item;
        setTimeout(() => setQuizFor(null), 0);
      }}
    />
  );
  const rankingContent = <RankingScreen accentColor={tier.color} userGame={userGame} />;
  const profileContent = <ProfileScreen userGame={userGame} />;

  const overlays = (
    <>
      {quizFor && (
        <QuizModal
          keywordId={quizFor.keywordId}
          nodeId={quizFor.label}
          nodeLabel={quizFor.label}
          accent={tier.color}
          forceMock={forceMock}
          isDesktop={isDesktop}
          onClose={() => setQuizFor(null)}
          onComplete={handleQuizComplete}
        />
      )}
      {receipt && <ReceiptModal data={receipt} onClose={() => setReceipt(null)} />}
      <RewardPopup reward={reward} onClose={() => setReward(null)} />
    </>
  );

  // ── 데스크톱 (≥1024px): 사이드바 + 넓은 메인 ──────────────────────────────────
  if (isDesktop) {
    return (
      <div className="nodingo-desktop">
        <Sidebar
          active={tab}
          onChange={setTab}
          accentColor={tier.color}
          userGame={userGame}
        />
        <main style={{
          flex: 1, minWidth: 0,
          position: 'relative',
          height: '100%',
          overflow: 'hidden',
          background: '#FFFFFF',
          display: 'flex', flexDirection: 'column',
        }}>
          {tab === 'graph' && graphContent}
          {tab !== 'graph' && (
            <div style={{
              flex: 1, display: 'flex', justifyContent: 'center',
              overflow: 'hidden', background: '#FAF7F1',
            }}>
              <div style={{ width: '100%', maxWidth: 560, height: '100%', position: 'relative' }}>
                {tab === 'scrap' && scrapContent}
                {tab === 'ranking' && rankingContent}
                {tab === 'profile' && profileContent}
              </div>
            </div>
          )}
          {overlays}
        </main>
      </div>
    );
  }

  // ── 모바일: 풀블리드 + 상단 HUD + 하단 탭 ─────────────────────────────────────
  return (
    <div className="nodingo-shell">
      <div className="nodingo-app">
        <div style={{
          position: 'relative',
          display: 'flex', flexDirection: 'column',
          height: '100%',
          background: '#FFFFFF',
          color: '#0F1115',
          overflow: 'hidden',
          fontFamily: 'Pretendard, -apple-system, system-ui, sans-serif',
        }}>
          <HUD userGame={userGame} onProfileTap={() => setTab('profile')} />

          <div style={{
            flex: 1,
            marginTop: 'calc(var(--nodingo-status-offset, 0px) + 82px)',
            marginBottom: 86,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {tab === 'graph' && graphContent}
            {tab === 'scrap' && scrapContent}
            {tab === 'ranking' && rankingContent}
            {tab === 'profile' && profileContent}
          </div>

          <BottomNav active={tab} onChange={setTab} accentColor={tier.color} />

          {overlays}
        </div>
      </div>
    </div>
  );
}
