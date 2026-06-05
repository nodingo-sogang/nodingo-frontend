import { useEffect, useState } from 'react';
import { MOCK_QUIZZES } from '../../mocks';
import { quizApi } from '../../api/quiz';

interface QuizModalProps {
  /** 백엔드 호출용 소분류 키워드 ID */
  keywordId: number;
  /** 게임 상태 키 (= 키워드 단어). onComplete/완료 처리에 사용 */
  nodeId: string;
  nodeLabel: string;
  accent: string;
  forceMock?: boolean;
  /** 데스크톱: 전체 폭 바텀시트 대신 가운데 카드로 표시 */
  isDesktop?: boolean;
  onClose: () => void;
  onComplete: (result: { correctCount: number; xpGained: number; nodeId: string }) => void;
}

/** mock/live 공통 정규화 퀴즈 형태 */
interface UIQuiz {
  /** live 퀴즈의 quiz_id. mock 이면 null */
  id: number | null;
  q: string;
  options: string[];
  /** 0-based 정답 인덱스. live 는 제출 전까지 null */
  answer: number | null;
  source: { outlet: string; date: string; url?: string };
  /** 이미 제출한 퀴즈 (목록 응답 solved). 선제 차단/완료 표시용 */
  solved: boolean;
}

function mockQuizzes(nodeId: string): UIQuiz[] {
  const key = nodeId.toLowerCase().replace(/[\s-]+/g, '');
  const list = MOCK_QUIZZES[key] ?? MOCK_QUIZZES.default;
  return list.map(item => ({
    id: null,
    q: item.q,
    options: item.options,
    answer: item.a,
    source: item.source,
    solved: false,
  }));
}

export default function QuizModal({
  keywordId,
  nodeId,
  nodeLabel,
  accent,
  forceMock = false,
  isDesktop = false,
  onClose,
  onComplete,
}: QuizModalProps) {
  const [quizzes, setQuizzes] = useState<UIQuiz[]>(() => (forceMock ? mockQuizzes(nodeId) : []));
  const [loading, setLoading] = useState(!forceMock);
  // live: 서버 채점 결과로 결정되는 단일 출처(정답/XP). mock: 클라이언트 계산.
  const [isLive, setIsLive] = useState(false);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealedAnswer, setRevealedAnswer] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  // 이미 제출한 퀴즈 (백엔드 400) — 정답/오답 대신 "이미 풀었어요" 안내
  const [alreadyDone, setAlreadyDone] = useState(false);
  // live 응답이 성공했지만 퀴즈가 0개 (관련 뉴스 부족 등) — mock 대신 빈 상태 노출
  const [noQuiz, setNoQuiz] = useState(false);
  const [phase, setPhase] = useState<'question' | 'answer' | 'result'>('question');

  // ── 퀴즈 목록 로드 (GET /api/graphs/nodes/{keywordId}/quizzes) ──────────────────
  useEffect(() => {
    if (forceMock) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await quizApi.getQuizzes(keywordId);
        const data = res.data.data;
        if (cancelled) return;
        if (data && data.quizzes.length > 0) {
          setQuizzes(data.quizzes.map(quiz => ({
            id: quiz.quiz_id,
            q: quiz.question,
            options: quiz.options,
            answer: null,
            source: {
              outlet: quiz.source_outlet,
              date: quiz.source_date,
              url: quiz.source_url,
            },
            solved: quiz.solved ?? false,
          })));
          setIsLive(true);
        } else if (data) {
          // 성공 응답이지만 퀴즈 0개 = 관련 뉴스 부족 등으로 미생성 → 빈 상태 (mock 폴백 금지)
          setQuizzes([]);
          setIsLive(true);
          setNoQuiz(true);
        } else {
          setQuizzes(mockQuizzes(nodeId));
        }
      } catch {
        // 서버 미응답(네트워크/5xx) 시에만 mock 으로 진행
        if (!cancelled) setQuizzes(mockQuizzes(nodeId));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keywordId, forceMock]);

  const q = quizzes[current];
  // 이미 푼 퀴즈는 클릭 없이도 정답/완료 영역을 바로 노출 (선제 표시)
  const solved = !!q?.solved;
  const showAnswerArea = phase === 'answer' || solved;
  // 노드의 퀴즈를 이미 전부 푼 경우 — 결과 화면을 점수 대신 안내로 대체
  const allSolved = quizzes.length > 0 && quizzes.every(x => x.solved);

  const handleSelect = async (idx: number) => {
    // 이미 푼 퀴즈는 클릭 자체를 막아 헛된 재제출(400) 호출 제거
    if (phase !== 'question' || submitting || !q || q.solved) return;
    setSelected(idx);

    if (isLive && q.id != null) {
      // 서버 채점 (POST .../quizzes/{quizId}/submit)
      setSubmitting(true);
      try {
        // 백엔드 검증이 1-based(1~4)를 요구하므로 idx+1로 전송
        const res = await quizApi.submit(keywordId, q.id, { selected_option_index: idx + 1 });
        const reward = res.data.data;
        // 백엔드 correct_answer_index(=answerIndex)는 0-based → 그대로 정답 인덱스로 사용
        const answerIdx = reward ? reward.correct_answer_index : null;
        setRevealedAnswer(answerIdx);
        // ⚠️ 백엔드 채점(correct/earned_xp)은 0-based 정답 vs 1-based 제출 불일치 버그가 있어
        //    정/오답은 프론트에서 직접 판정 (정답 인덱스 == 내가 고른 인덱스)
        const isCorrect = answerIdx !== null ? idx === answerIdx : Boolean(reward?.correct);
        if (isCorrect) {
          setCorrectCount(c => c + 1);
          setEarnedXp(x => x + (reward?.earned_xp ?? 0));
        }
      } catch (err) {
        // 400 = 이미 제출한 퀴즈 → "이미 풀었어요" 안내 (정답/오답 표시 안 함)
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 400) setAlreadyDone(true);
        setRevealedAnswer(null);
      } finally {
        setSubmitting(false);
        setPhase('answer');
      }
      return;
    }

    // mock 채점
    setRevealedAnswer(q.answer);
    if (idx === q.answer) setCorrectCount(c => c + 1);
    setPhase('answer');
  };

  const handleNext = () => {
    if (current + 1 < quizzes.length) {
      setCurrent(c => c + 1);
      setSelected(null);
      setRevealedAnswer(null);
      setAlreadyDone(false);
      setPhase('question');
    } else {
      setPhase('result');
    }
  };

  const totalXp = isLive ? earnedXp : correctCount * 20;

  const handleComplete = () => {
    onComplete({ correctCount, xpGained: totalXp, nodeId });
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: 'rgba(15,17,21,0.5)',
      display: 'flex',
      alignItems: isDesktop ? 'center' : 'flex-end',
      justifyContent: 'center',
      padding: isDesktop ? 24 : 0,
    }}>
      <div style={{
        width: '100%',
        maxWidth: isDesktop ? 460 : undefined,
        background: '#FFFFFF',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        borderBottomLeftRadius: isDesktop ? 28 : 0,
        borderBottomRightRadius: isDesktop ? 28 : 0,
        overflow: 'hidden',
        animation: isDesktop
          ? 'nodingo-modal-in 320ms cubic-bezier(.2,.7,.2,1)'
          : 'nodingo-sheet-in 400ms cubic-bezier(.2,.7,.2,1)',
      }}>
        {loading || !q ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 30, marginBottom: 12 }}>{loading ? '🧠' : noQuiz ? '🔒' : '🧠'}</div>
            <p style={{ fontSize: 14, fontWeight: 800, color: '#6B6B66', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {loading
                ? '퀴즈를 불러오는 중…'
                : noQuiz
                  ? '관련 뉴스가 부족해\n아직 퀴즈가 없어요.'
                  : '퀴즈가 없습니다.'}
            </p>
            {!loading && !q && (
              <button onClick={onClose} style={{
                marginTop: 18, padding: '12px 28px', borderRadius: 18, border: 'none',
                background: accent, color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer',
                fontFamily: 'Pretendard, -apple-system, system-ui, sans-serif',
              }}>닫기</button>
            )}
          </div>
        ) : phase !== 'result' ? (
          <>
            <div style={{
              height: 5,
              background: '#F1F1ED',
            }}>
              <div style={{
                height: '100%',
                width: `${((current + 1) / quizzes.length) * 100}%`,
                background: accent,
                transition: 'width 300ms ease',
              }} />
            </div>
            <div style={{ padding: '22px 20px 24px' }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 18,
              }}>
                <span style={{ fontSize: 13, color: accent, fontWeight: 800 }}>{nodeLabel} 퀴즈</span>
                <span style={{
                  fontSize: 11, color: '#6B6B66',
                  background: '#F4F4F0',
                  padding: '3px 10px', borderRadius: 999,
                  fontWeight: 800,
                }}>
                  {current + 1} / {quizzes.length}
                </span>
              </div>

              <p style={{
                fontSize: 18, fontWeight: 900, color: '#0F1115',
                lineHeight: 1.45, marginBottom: 20,
                letterSpacing: '-0.02em',
              }}>
                {q.q}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {q.options.map((opt, i) => {
                  let bg = '#FFFFFF';
                  let border = '1.5px solid #E8E8E4';
                  let color = '#0F1115';
                  if (showAnswerArea) {
                    if (revealedAnswer !== null && i === revealedAnswer) { bg = '#E8F6EC'; border = '1.5px solid #5BBA6F'; color = '#1E8460'; }
                    else if (i === selected && alreadyDone) { bg = '#F4F4F0'; border = '1.5px solid #D8D8D2'; color = '#6B6B66'; }
                    else if (i === selected) { bg = '#FCEBEB'; border = '1.5px solid #FF6B6B'; color = '#D84A4A'; }
                  }
                  return (
                    <button key={i} onClick={() => handleSelect(i)} disabled={submitting || solved} style={{
                      background: bg, border, borderRadius: 16,
                      padding: '13px 15px', textAlign: 'left',
                      fontSize: 14, color,
                      cursor: phase === 'question' && !submitting && !solved ? 'pointer' : 'default',
                      opacity: solved ? 0.55 : (submitting && i !== selected ? 0.6 : 1),
                      transition: 'all 0.18s',
                      fontFamily: 'Pretendard, -apple-system, system-ui, sans-serif',
                      lineHeight: 1.4,
                      fontWeight: 700,
                    }}>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {showAnswerArea && (alreadyDone || solved) && (
                <div style={{
                  marginTop: 12, padding: '10px 12px', borderRadius: 12,
                  background: '#F4F4F0', color: '#6B6B66',
                  fontSize: 12.5, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  ✓ 이미 푼 퀴즈예요. 다음 문제로 넘어가세요.
                </div>
              )}

              {showAnswerArea && (
                <div style={{ marginTop: 12, fontSize: 11, color: '#6B6B66' }}>
                  출처: {q.source.outlet} · {q.source.date}
                  {q.source.url && (
                    <a
                      href={q.source.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: accent, fontWeight: 800, marginLeft: 6, textDecoration: 'none' }}
                    >
                      원문
                    </a>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button onClick={onClose} style={{
                  flex: 1, padding: 13, borderRadius: 18, border: 'none',
                  background: '#F4F4F0', color: '#6B6B66',
                  fontSize: 14, cursor: 'pointer', fontWeight: 800,
                  fontFamily: 'Pretendard, -apple-system, system-ui, sans-serif',
                }}>닫기</button>
                {showAnswerArea && (
                  <button onClick={handleNext} style={{
                    flex: 2, padding: 13, borderRadius: 18, border: 'none',
                    background: accent, color: '#fff',
                    fontSize: 14, fontWeight: 800, cursor: 'pointer',
                    fontFamily: 'Pretendard, -apple-system, system-ui, sans-serif',
                  }}>
                    {current + 1 < quizzes.length ? '다음 문제' : '결과 보기'}
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: '28px 20px 24px' }}>
            {allSolved ? (
              <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
                <p style={{ fontSize: 20, fontWeight: 900, color: '#0F1115', marginBottom: 6 }}>
                  이미 다 푼 퀴즈예요
                </p>
                <p style={{ fontSize: 12, color: '#6B6B66' }}>
                  이 노드의 퀴즈는 모두 완료했어요. 다른 노드를 탐험해보세요!
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
                <div style={{ fontSize: 52, marginBottom: 12 }}>
                  {correctCount === quizzes.length ? '🎉' : correctCount > 0 ? '🌟' : '💪'}
                </div>
                <p style={{ fontSize: 20, fontWeight: 900, color: '#0F1115', marginBottom: 6 }}>
                  {correctCount} / {quizzes.length} 정답
                </p>
                <p style={{ fontSize: 30, fontWeight: 900, color: accent, marginBottom: 4 }}>
                  +{totalXp} XP
                </p>
                <p style={{ fontSize: 12, color: '#6B6B66' }}>
                  {isLive ? '뉴스 기반 퀴즈 보상 획득!' : '정답당 +20 XP 획득!'}
                </p>
              </div>
            )}
            <button onClick={handleComplete} style={{
              width: '100%', padding: 14, borderRadius: 18, border: 'none',
              background: accent, color: '#fff',
              fontSize: 15, fontWeight: 800, cursor: 'pointer',
              fontFamily: 'Pretendard, -apple-system, system-ui, sans-serif',
            }}>완료</button>
          </div>
        )}
      </div>
    </div>
  );
}
