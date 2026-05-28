import { useState } from 'react';
import { MOCK_QUIZZES } from '../../mocks';

interface QuizModalProps {
  nodeId: string;
  nodeLabel: string;
  accent: string;
  onClose: () => void;
  onComplete: (result: { correctCount: number; xpGained: number; nodeId: string }) => void;
}

export default function QuizModal({ nodeId, nodeLabel, accent, onClose, onComplete }: QuizModalProps) {
  const key = nodeId.toLowerCase().replace(/[\s-]+/g, '');
  const quizzes = MOCK_QUIZZES[key] ?? MOCK_QUIZZES.default;

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<'question' | 'answer' | 'result'>('question');

  const q = quizzes[current];

  const handleSelect = (idx: number) => {
    if (phase !== 'question') return;
    setSelected(idx);
    setPhase('answer');
    if (idx === q.a) setCorrectCount(c => c + 1);
  };

  const handleNext = () => {
    if (current + 1 < quizzes.length) {
      setCurrent(c => c + 1);
      setSelected(null);
      setPhase('question');
    } else {
      setPhase('result');
    }
  };

  const handleComplete = () => {
    onComplete({ correctCount, xpGained: correctCount * 20, nodeId });
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      background: 'rgba(15,17,21,0.5)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div style={{
        width: '100%',
        background: '#FFFFFF',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        overflow: 'hidden',
        animation: 'nodingo-sheet-in 400ms cubic-bezier(.2,.7,.2,1)',
      }}>
        {phase !== 'result' ? (
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
                  if (phase === 'answer') {
                    if (i === q.a) { bg = '#E8F6EC'; border = '1.5px solid #5BBA6F'; color = '#1E8460'; }
                    else if (i === selected) { bg = '#FCEBEB'; border = '1.5px solid #FF6B6B'; color = '#D84A4A'; }
                  }
                  return (
                    <button key={i} onClick={() => handleSelect(i)} style={{
                      background: bg, border, borderRadius: 16,
                      padding: '13px 15px', textAlign: 'left',
                      fontSize: 14, color,
                      cursor: phase === 'question' ? 'pointer' : 'default',
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

              {phase === 'answer' && (
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
                {phase === 'answer' && (
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
            <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>
                {correctCount === quizzes.length ? '🎉' : correctCount > 0 ? '🌟' : '💪'}
              </div>
              <p style={{ fontSize: 20, fontWeight: 900, color: '#0F1115', marginBottom: 6 }}>
                {correctCount} / {quizzes.length} 정답
              </p>
              <p style={{ fontSize: 30, fontWeight: 900, color: accent, marginBottom: 4 }}>
                +{correctCount * 20} XP
              </p>
              <p style={{ fontSize: 12, color: '#6B6B66' }}>
                정답당 +20 XP 획득!
              </p>
            </div>
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
