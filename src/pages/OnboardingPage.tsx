import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/user';
import { graphApi } from '../api/graph';
import { useAuthStore } from '../store/authStore';
import type { UserPersona, KeywordResponse } from '../types';
import { PERSONA_LABEL } from '../types';
import { MOCK_PERSONAS, MOCK_MACRO, MOCK_MACRO_BY_PERSONA, MOCK_SPECIFIC } from '../mocks';
import Skeleton from '../components/common/Skeleton';
import styles from './OnboardingPage.module.css';

type Step = 'persona' | 'macro' | 'specific' | 'loading';

// 메인 그래프의 페르소나 시그니처 파스텔 + 이모지 + 짧은 태그라인 (무드 통일)
const PERSONA_THEME: Record<UserPersona, { soft: string; stroke: string; emoji: string; tagline: string }> = {
  POLITICS: { soft: '#EAF3FF', stroke: '#7CB5F4', emoji: '🏛️', tagline: '정책·선거·국회' },
  ECONOMY: { soft: '#FFF5E6', stroke: '#F1B45E', emoji: '💰', tagline: '금리·증시·부동산' },
  TECHNOLOGY: { soft: '#EAF8EE', stroke: '#7BCF91', emoji: '🔬', tagline: 'AI·반도체·IT' },
  SOCIETY: { soft: '#F4ECFF', stroke: '#B996EA', emoji: '👥', tagline: '복지·교육·노동' },
  CULTURE: { soft: '#FFECEC', stroke: '#F08C8C', emoji: '🎭', tagline: '예술·콘텐츠·트렌드' },
  INTERNATIONAL: { soft: '#E9F8FB', stroke: '#7CCFDC', emoji: '🌍', tagline: '외교·통상·세계' },
};

const DINGO_IMG = '/assets/characters/tier1_새내기.png';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setOnboarded } = useAuthStore();

  const [step, setStep] = useState<Step>('persona');
  const [selectedPersona, setSelectedPersona] = useState<UserPersona | null>(null);
  const [selectedMacro, setSelectedMacro] = useState<KeywordResponse | null>(null);
  const [selectedSpecific, setSelectedSpecific] = useState<number[]>([]);
  const [loadingMsg, setLoadingMsg] = useState('관심사를 분석하는 중...');
  // 온보딩 제출 완료(202) 여부 → 상태 폴링 시작 트리거
  const [submitted, setSubmitted] = useState(false);
  // 백엔드 추천 생성이 끝나(또는 폴백 타임아웃) 입장 준비됨
  const [ready, setReady] = useState(false);

  const stepIndex = { persona: 0, macro: 1, specific: 2, loading: 3 };
  const progress = (stepIndex[step] / 3) * 100;

  // Queries
  const { data: personasData } = useQuery({
    queryKey: ['personas'],
    queryFn: () =>
      userApi.getPersonas().then((r) => r.data.data).catch(() => MOCK_PERSONAS),
  });

  const personaMock = selectedPersona
    ? (MOCK_MACRO_BY_PERSONA[selectedPersona] ?? MOCK_MACRO)
    : MOCK_MACRO;

  const { data: macroData, isFetching: macroFetching } = useQuery({
    queryKey: ['macroKeywords', selectedPersona],
    queryFn: () =>
      userApi.getMacroKeywords(selectedPersona!).then((r) => {
        const d = r.data.data;
        // API가 빈 결과를 리턴하면 페르소나별 mock으로 폴백
        return d?.contents?.length ? d : personaMock;
      }).catch(() => personaMock),
    enabled: !!selectedPersona && step === 'macro',
  });

  const { data: specificData, isFetching: specificFetching } = useQuery({
    queryKey: ['specificKeywords', selectedMacro?.id],
    queryFn: () =>
      userApi.getSpecificKeywords(selectedMacro!.id).then((r) => {
        const d = r.data.data;
        return d?.contents?.length ? d : MOCK_SPECIFIC;
      }).catch(() => MOCK_SPECIFIC),
    enabled: !!selectedMacro && step === 'specific',
  });

  const { mutate: submitOnboarding } = useMutation({
    mutationFn: () =>
      userApi.postOnboarding({
        personas: [selectedPersona!],
        interest: {
          macro_keyword_id: selectedMacro!.id,
          specific_keyword_ids: selectedSpecific,
        },
      }).catch(() => null), // 백엔드 없어도 진행
    // 제출(202) 후 바로 이동하지 않고, 상태 폴링을 시작해 추천 생성이 끝날 때까지 대기
    onSettled: () => setSubmitted(true),
  });

  // 온보딩 처리 상태 폴링 (PENDING → COMPLETED). 추천 생성이 끝날 때까지 기다린다.
  const { data: onboardingStatus } = useQuery({
    queryKey: ['onboardingStatus'],
    queryFn: () =>
      userApi.getOnboardingStatus().then((r) => r.data.data).catch(() => null),
    enabled: submitted && !ready,
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      return s === 'COMPLETED' ? false : 2500;
    },
  });

  // 상태 결과에 따라 입장 준비 처리
  useEffect(() => {
    if (!submitted || ready) return;
    // 백엔드 추적 불가(mock/미배포): 잠깐 보여주고 입장 허용
    if (onboardingStatus === null) {
      const t = setTimeout(() => setReady(true), 2500);
      return () => clearTimeout(t);
    }
    // COMPLETED(또는 FAILED)면 입장 준비 완료
    if (onboardingStatus?.status === 'COMPLETED' || (onboardingStatus?.status as string) === 'FAILED') {
      setReady(true);
    }
  }, [onboardingStatus, submitted, ready]);

  // 하드 캡: 어떤 경우든 20초 후엔 입장 허용 (무한 대기 방지)
  useEffect(() => {
    if (!submitted || ready) return;
    const t = setTimeout(() => setReady(true), 20000);
    return () => clearTimeout(t);
  }, [submitted, ready]);

  // 입장 준비되면 그래프 데이터(탭 + 각 탭 노드)를 미리 받아 캐시에 넣어둠.
  // → /graph 진입 시 GraphScreen 쿼리가 캐시에서 즉시 채워져 mock 깜빡임 없이 실데이터로 바로 보임.
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      try {
        const tabsRes = await graphApi.getTabs();
        if (cancelled) return;
        const tabList = tabsRes.data.data;
        queryClient.setQueryData(['tabs'], tabList);
        await Promise.all((tabList?.tabs ?? []).map(async (t) => {
          try {
            const g = await graphApi.getGraphData(t.keyword_id);
            if (!cancelled) queryClient.setQueryData(['graph', t.keyword_id], g.data.data);
          } catch { /* 개별 탭 실패는 무시 (GraphScreen이 폴백) */ }
        }));
      } catch { /* tabs 실패 시 GraphScreen이 알아서 로딩 */ }
    })();
    return () => { cancelled = true; };
  }, [ready, queryClient]);

  const enterMain = () => {
    setOnboarded();
    navigate('/graph', { replace: true });
  };

  // 단계마다 등장하는 딩고 한마디 배너 (무드 통일)
  const dingoBanner = (msg: string) => (
    <div className={styles.dingo}>
      <span className={styles.dingoFace}>
        <img
          src={DINGO_IMG}
          alt="딩고"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
            (e.currentTarget.parentElement as HTMLElement).textContent = '🐦';
          }}
        />
      </span>
      <span className={styles.dingoMsg}>{msg}</span>
    </div>
  );

  const handlePersonaSelect = (persona: UserPersona) => {
    setSelectedPersona(persona);
    setStep('macro');
  };

  const handleMacroSelect = (kw: KeywordResponse) => {
    setSelectedMacro(kw);
    setSelectedSpecific([]);
    setStep('specific');
  };

  const handleSpecificToggle = (id: number) => {
    setSelectedSpecific((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 6
        ? [...prev, id]
        : prev,
    );
  };

  const handleSubmit = () => {
    setStep('loading');
    const msgs = [
      '관심사를 분석하는 중...',
      '뉴스 그래프를 구성하는 중...',
      '추천 콘텐츠를 준비하는 중...',
    ];
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i < msgs.length) setLoadingMsg(msgs[i]);
      else clearInterval(interval);
    }, 1200);
    submitOnboarding();
  };

  const handleBack = () => {
    if (step === 'macro') setStep('persona');
    else if (step === 'specific') setStep('macro');
  };

  const personas = personasData?.contents ?? [];
  const macroKeywords = macroData?.contents ?? [];
  const specificKeywords = specificData?.contents ?? [];

  return (
    <div className={styles.page}>
      {step !== 'loading' && (
        <>
          {/* Progress bar */}
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>

          {/* Header */}
          <div className={styles.header}>
            {step !== 'persona' && (
              <button className={styles.backBtn} onClick={handleBack}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
            )}
            <div className={styles.stepIndicator}>
              {step === 'persona' && '1 / 3'}
              {step === 'macro' && '2 / 3'}
              {step === 'specific' && '3 / 3'}
            </div>
          </div>
        </>
      )}

      {/* Step: Persona */}
      {step === 'persona' && (
        <div className={styles.content}>
          {dingoBanner('딩고가 너에게 딱 맞는 지식지도를 그려줄게! 🌱')}
          <h1 className={styles.title}>어떤 분야에 관심 있으신가요?</h1>
          <p className={styles.sub}>관심 분야를 하나 선택해주세요</p>
          <div className={styles.grid}>
            {(personas.length === 0
              ? (Object.keys(PERSONA_LABEL) as UserPersona[]).map((name) => ({ name, description: undefined as string | undefined }))
              : personas
            ).map((p) => {
              const t = PERSONA_THEME[p.name];
              const sel = selectedPersona === p.name;
              return (
                <button
                  key={p.name}
                  className={styles.card}
                  style={{
                    background: sel ? t.soft : '#FFFFFF',
                    borderColor: sel ? t.stroke : '#EFEEEA',
                  }}
                  onClick={() => handlePersonaSelect(p.name)}
                >
                  <span style={{ fontSize: 26, lineHeight: 1 }}>{t.emoji}</span>
                  <span className={styles.cardLabel}>{PERSONA_LABEL[p.name]}</span>
                  <span className={styles.cardDesc}>{t.tagline}</span>
                  {sel && (
                    <span className={styles.check} style={{ color: t.stroke }}>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step: Macro keywords */}
      {step === 'macro' && (
        <div className={styles.content}>
          {dingoBanner(
            `${selectedPersona ? PERSONA_THEME[selectedPersona].emoji + ' ' + PERSONA_LABEL[selectedPersona] : ''} 좋아! 어떤 주제가 끌려? 🔍`,
          )}
          <h1 className={styles.title}>
            {selectedPersona ? PERSONA_LABEL[selectedPersona] : ''} 분야의<br />
            어떤 주제가 궁금하신가요?
          </h1>
          <p className={styles.sub}>관심 주제를 하나 선택해주세요</p>
          {macroFetching ? (
            <div className={styles.grid}>
              {[0, 1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} height={58} radius={16} />
              ))}
            </div>
          ) : (
            <div className={styles.grid}>
              {macroKeywords.map((kw) => (
                <button
                  key={kw.id}
                  className={[
                    styles.card,
                    selectedMacro?.id === kw.id ? styles.selected : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleMacroSelect(kw)}
                >
                  <span className={styles.cardLabel}>{kw.word}</span>
                  {selectedMacro?.id === kw.id && (
                    <span className={styles.check}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step: Specific keywords */}
      {step === 'specific' && (
        <div className={styles.content}>
          {dingoBanner('거의 다 왔어! 세부 키워드를 골라줘 ✨')}
          <h1 className={styles.title}>
            세부 키워드를 선택해주세요
          </h1>
          <p className={styles.sub}>
            최대 6개까지 선택 가능해요 ({selectedSpecific.length}/6)
          </p>
          {specificFetching ? (
            <div className={styles.chipGrid}>
              {[64, 88, 72, 96, 80, 60, 100, 76].map((w, i) => (
                <Skeleton key={i} width={w} height={36} radius={999} />
              ))}
            </div>
          ) : (
            <>
              <div className={styles.chipGrid}>
                {specificKeywords.map((kw) => (
                  <button
                    key={kw.id}
                    className={[
                      styles.chip,
                      selectedSpecific.includes(kw.id) ? styles.chipSelected : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handleSpecificToggle(kw.id)}
                  >
                    {kw.word}
                  </button>
                ))}
              </div>
              <div className={styles.footer}>
                <button
                  className={styles.skipBtn}
                  onClick={handleSubmit}
                >
                  건너뛰기
                </button>
                <button
                  className={[
                    styles.nextBtn,
                    selectedSpecific.length === 0 ? styles.nextDisabled : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={handleSubmit}
                  disabled={selectedSpecific.length === 0}
                >
                  완료
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step: Loading */}
      {step === 'loading' && (
        <div className={styles.loadingScreen}>
          <div className={styles.loadingCharacter}>
            <span className={styles.loadingRing} />
            <span className={`${styles.loadingRing} ${styles.delay}`} />
            <span className={styles.loadingFace}>
              <img
                src={DINGO_IMG}
                alt="딩고"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                  (e.currentTarget.parentElement as HTMLElement).textContent = '🐦';
                }}
              />
            </span>
          </div>
          {ready ? (
            <>
              <p
                className={styles.loadingMsg}
                style={{ animation: 'none', color: '#0F1115', fontWeight: 800, fontSize: 18 }}
              >
                딩고의 지식지도가 준비됐어요! 🎉
              </p>
              <button
                onClick={enterMain}
                style={{
                  marginTop: 22,
                  padding: '15px 44px',
                  borderRadius: 16,
                  border: 'none',
                  background: '#5BBA6F',
                  color: '#fff',
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 0 #418550',
                  fontFamily: 'inherit',
                  animation: 'nodingo-modal-in 280ms ease both',
                }}
              >
                시작하기 →
              </button>
            </>
          ) : (
            <p className={styles.loadingMsg}>{loadingMsg}</p>
          )}
        </div>
      )}
    </div>
  );
}
