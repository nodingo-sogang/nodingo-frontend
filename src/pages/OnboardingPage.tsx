import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { userApi } from '../api/user';
import { useAuthStore } from '../store/authStore';
import type { UserPersona, KeywordResponse } from '../types';
import { PERSONA_LABEL } from '../types';
import { MOCK_PERSONAS, MOCK_MACRO, MOCK_MACRO_BY_PERSONA, MOCK_SPECIFIC } from '../mocks';
import styles from './OnboardingPage.module.css';

type Step = 'persona' | 'macro' | 'specific' | 'loading';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { setOnboarded } = useAuthStore();

  const [step, setStep] = useState<Step>('persona');
  const [selectedPersona, setSelectedPersona] = useState<UserPersona | null>(null);
  const [selectedMacro, setSelectedMacro] = useState<KeywordResponse | null>(null);
  const [selectedSpecific, setSelectedSpecific] = useState<number[]>([]);
  const [loadingMsg, setLoadingMsg] = useState('관심사를 분석하는 중...');

  const stepIndex = { persona: 0, macro: 1, specific: 2, loading: 3 };
  const progress = (stepIndex[step] / 3) * 100;

  // Queries
  const { data: personasData } = useQuery({
    queryKey: ['personas'],
    queryFn: () =>
      userApi.getPersonas().then((r) => r.data.data).catch(() => MOCK_PERSONAS),
    placeholderData: MOCK_PERSONAS,
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
    placeholderData: personaMock,
  });

  const { data: specificData, isFetching: specificFetching } = useQuery({
    queryKey: ['specificKeywords', selectedMacro?.id],
    queryFn: () =>
      userApi.getSpecificKeywords(selectedMacro!.id).then((r) => {
        const d = r.data.data;
        return d?.contents?.length ? d : MOCK_SPECIFIC;
      }).catch(() => MOCK_SPECIFIC),
    enabled: !!selectedMacro && step === 'specific',
    placeholderData: MOCK_SPECIFIC,
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
    onSettled: () => {
      setOnboarded();
      navigate('/graph', { replace: true });
    },
  });

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
          <h1 className={styles.title}>어떤 분야에 관심 있으신가요?</h1>
          <p className={styles.sub}>관심 분야를 하나 선택해주세요</p>
          <div className={styles.grid}>
            {personas.length === 0
              ? Object.entries(PERSONA_LABEL).map(([key, label]) => (
                  <button
                    key={key}
                    className={[
                      styles.card,
                      selectedPersona === key ? styles.selected : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handlePersonaSelect(key as UserPersona)}
                  >
                    <span className={styles.cardLabel}>{label}</span>
                    {selectedPersona === key && (
                      <span className={styles.check}>✓</span>
                    )}
                  </button>
                ))
              : personas.map((p) => (
                  <button
                    key={p.name}
                    className={[
                      styles.card,
                      selectedPersona === p.name ? styles.selected : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => handlePersonaSelect(p.name)}
                  >
                    <span className={styles.cardLabel}>{PERSONA_LABEL[p.name]}</span>
                    {p.description && (
                      <span className={styles.cardDesc}>{p.description}</span>
                    )}
                    {selectedPersona === p.name && (
                      <span className={styles.check}>✓</span>
                    )}
                  </button>
                ))}
          </div>
        </div>
      )}

      {/* Step: Macro keywords */}
      {step === 'macro' && (
        <div className={styles.content}>
          <h1 className={styles.title}>
            {selectedPersona ? PERSONA_LABEL[selectedPersona] : ''} 분야의<br />
            어떤 주제가 궁금하신가요?
          </h1>
          <p className={styles.sub}>관심 주제를 하나 선택해주세요</p>
          {macroFetching ? (
            <div className={styles.loader} />
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
          <h1 className={styles.title}>
            세부 키워드를 선택해주세요
          </h1>
          <p className={styles.sub}>
            최대 6개까지 선택 가능해요 ({selectedSpecific.length}/6)
          </p>
          {specificFetching ? (
            <div className={styles.loader} />
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
          <div className={styles.loadingGraph}>
            <svg viewBox="0 0 200 200" className={styles.loadingSvg}>
              {[
                [100, 100, 24, '#0066cc'],
                [55, 55, 14, '#30d158'],
                [145, 55, 14, '#ff9f0a'],
                [55, 145, 14, '#bf5af2'],
                [145, 145, 14, '#ff453a'],
              ].map(([cx, cy, r, fill], i) => (
                <circle
                  key={i}
                  cx={cx as number}
                  cy={cy as number}
                  r={r as number}
                  fill={fill as string}
                  fillOpacity="0.8"
                  className={styles.pulseNode}
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
              {[
                [100, 100, 55, 55],
                [100, 100, 145, 55],
                [100, 100, 55, 145],
                [100, 100, 145, 145],
              ].map(([x1, y1, x2, y2], i) => (
                <line
                  key={i}
                  x1={x1 as number}
                  y1={y1 as number}
                  x2={x2 as number}
                  y2={y2 as number}
                  stroke="#0066cc"
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                />
              ))}
            </svg>
          </div>
          <p className={styles.loadingMsg}>{loadingMsg}</p>
        </div>
      )}
    </div>
  );
}
