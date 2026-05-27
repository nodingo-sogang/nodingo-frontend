/* global React */
// nodingo-modals.jsx — Quiz flow + Daily Insight Receipt
// Both are full-overlay components mounted by the root app.

const { useState: useMState, useEffect: useMEffect, useMemo: useMMemo } = React;

// ─── Quiz Modal ─────────────────────────────────────────────
function QuizModal({ nodeId, accent, onClose, onComplete }) {
  const T = window.NODINGO_TOKENS;
  const node = window.NODINGO_NODES.find(n => n.id === nodeId);
  const quizzes = useMMemo(
    () => window.NODINGO_QUIZZES[nodeId] || window.NODINGO_QUIZ_FALLBACK(node?.label || ''),
    [nodeId]
  );

  const [qIdx, setQIdx] = useMState(0);
  const [picked, setPicked] = useMState(null);
  const [revealed, setRevealed] = useMState(false);
  const [correctCount, setCorrectCount] = useMState(0);
  const [finished, setFinished] = useMState(false);

  if (!node) return null;
  const q = quizzes[qIdx];
  const total = quizzes.length;

  const pickOption = (i) => {
    if (revealed) return;
    setPicked(i);
    setRevealed(true);
    if (i === q.a) setCorrectCount(c => c + 1);
  };

  const next = () => {
    if (qIdx + 1 < total) {
      setQIdx(qIdx + 1); setPicked(null); setRevealed(false);
    } else {
      setFinished(true);
    }
  };

  // ─── Result screen
  if (finished) {
    const xpGained = correctCount * 20;
    const coinsGained = correctCount * 10 + 5;
    const allCorrect = correctCount === total;
    return (
      <Overlay onClose={() => onComplete({ correctCount, xpGained, coinsGained, nodeId })}>
        <div style={overlayCardStyle()}>
          {/* big celebration head */}
          <div style={{
            padding: '32px 24px 20px', textAlign: 'center',
            background: allCorrect
              ? 'linear-gradient(180deg, #FFF8DC 0%, #FFFFFF 100%)'
              : 'linear-gradient(180deg, #F3F3EE 0%, #FFFFFF 100%)',
          }}>
            <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 8 }}>
              {allCorrect ? '🏆' : correctCount >= 2 ? '✨' : '💪'}
            </div>
            <div style={{
              fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: T.ink,
            }}>{allCorrect ? '퍼펙트!' : correctCount >= 2 ? '잘했어요!' : '다음엔 더 잘할 수 있어요'}</div>
            <div style={{ marginTop: 4, fontSize: 13, color: T.muted, fontWeight: 500 }}>
              {node.label} 퀴즈 · {correctCount} / {total} 정답
            </div>
          </div>

          <div style={{ padding: '4px 20px 16px' }}>
            <RewardRow icon="✨" label="획득한 경험치" value={`+${xpGained} XP`} color="#5BBA6F" />
            <RewardRow icon="🪙" label="획득한 N-Coin" value={`+${coinsGained}`} color="#F5B82E" />
            {allCorrect && (
              <RewardRow icon="🎁" label="퍼펙트 보너스" value="+20 XP · +10 🪙" color={accent.c} />
            )}
          </div>

          <div style={{ padding: '0 16px 18px' }}>
            <DuoButton color={accent.c} onClick={() => onComplete({
              correctCount, xpGained: xpGained + (allCorrect ? 20 : 0),
              coinsGained: coinsGained + (allCorrect ? 10 : 0), nodeId,
            })}>계속하기</DuoButton>
          </div>
        </div>
      </Overlay>
    );
  }

  // ─── Question screen
  return (
    <Overlay onClose={onClose}>
      <div style={overlayCardStyle()}>
        {/* top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '16px 18px 10px',
        }}>
          <button onClick={onClose} style={iconBtnStyle()}>
            <svg width="11" height="11" viewBox="0 0 10 10">
              <path d="M1 1l8 8M9 1l-8 8" stroke={T.ink} strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <div style={{
            flex: 1, height: 10, background: '#F1F1ED', borderRadius: 999, overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', width: `${((qIdx + (revealed ? 1 : 0)) / total) * 100}%`,
              background: accent.c, borderRadius: 999,
              transition: 'width 320ms cubic-bezier(.2,.7,.2,1)',
            }}/>
          </div>
          <div style={{
            fontSize: 12, fontWeight: 700, color: T.ink, fontVariantNumeric: 'tabular-nums',
          }}>{qIdx + 1} / {total}</div>
        </div>

        {/* topic chip + source */}
        <div style={{ padding: '4px 20px 0', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 999,
            background: accent.soft, color: accent.c,
            fontSize: 11, fontWeight: 700, letterSpacing: '-0.01em',
          }}>
            <span>🎯</span>{node.label}
          </div>
          {q.source && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 999,
              background: '#0F1115', color: '#fff',
              fontSize: 10.5, fontWeight: 700, letterSpacing: '-0.01em',
            }}>
              <span>📰</span>
              <span>{q.source.outlet}</span>
              <span style={{ opacity: 0.55 }}>·</span>
              <span style={{ opacity: 0.75, fontWeight: 600 }}>{q.source.date}</span>
            </div>
          )}
        </div>

        {/* question */}
        <div style={{ padding: '14px 20px 18px' }}>
          <div style={{
            fontSize: 19, fontWeight: 800, color: T.ink,
            letterSpacing: '-0.02em', lineHeight: 1.35,
            wordBreak: 'keep-all', textWrap: 'pretty',
          }}>{q.q}</div>
        </div>

        {/* options */}
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.options.map((opt, i) => {
            const isPicked = picked === i;
            const isCorrect = i === q.a;
            let bg = '#FFFFFF', border = '#E8E8E4', color = T.ink, shadow = '0 2px 0 #E8E8E4';
            if (revealed) {
              if (isCorrect) {
                bg = '#E8F6EC'; border = '#5BBA6F'; color = '#1E8460';
                shadow = '0 3px 0 #5BBA6F';
              } else if (isPicked) {
                bg = '#FCEBEB'; border = '#FF6B6B'; color = '#C13D3D';
                shadow = '0 3px 0 #FF6B6B';
              } else {
                color = '#A8A8A4';
              }
            } else if (isPicked) {
              bg = accent.soft; border = accent.c; color = accent.c;
            }
            return (
              <button key={i} onClick={() => pickOption(i)} style={{
                width: '100%', padding: '14px 14px',
                borderRadius: 18,
                background: bg, border: `2px solid ${border}`, color,
                fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em',
                textAlign: 'left',
                boxShadow: shadow,
                cursor: revealed ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'all 160ms',
                wordBreak: 'keep-all',
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: '#F4F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: T.ink, flex: 'none',
                }}>{String.fromCharCode(65 + i)}</div>
                <span style={{ flex: 1 }}>{opt}</span>
                {revealed && isCorrect && (
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <circle cx="9" cy="9" r="8" fill="#5BBA6F"/>
                    <path d="M5 9.5l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                )}
                {revealed && isPicked && !isCorrect && (
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <circle cx="9" cy="9" r="8" fill="#FF6B6B"/>
                    <path d="M5.5 5.5l7 7M12.5 5.5l-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* feedback / next */}
        <div style={{ flex: 1 }} />
        <div style={{ padding: 16, borderTop: revealed ? `1px solid ${picked === q.a ? '#D4EDD9' : '#FBDADA'}` : 'none' }}>
          {revealed && q.hint && picked !== q.a && (
            <div style={{
              padding: '8px 12px', marginBottom: 10,
              background: '#FFF8E1', borderRadius: 10,
              fontSize: 12, color: '#7A5500', fontWeight: 500,
            }}>💡 {q.hint}</div>
          )}
          <DuoButton
            color={revealed ? (picked === q.a ? '#5BBA6F' : '#FF6B6B') : '#D8D8D4'}
            textColor={revealed ? '#fff' : '#888'}
            onClick={revealed ? next : undefined}
            disabled={!revealed}
          >
            {!revealed ? '정답을 선택하세요' : qIdx + 1 < total ? '다음 문제' : '결과 보기'}
          </DuoButton>
        </div>
      </div>
    </Overlay>
  );
}

// ─── helpers ────────────────────────────────────────────────
function overlayCardStyle() {
  return {
    position: 'absolute',
    top: 60, bottom: 38, left: 12, right: 12,
    background: '#FFFFFF', borderRadius: 28,
    boxShadow: '0 30px 60px rgba(15,17,21,0.32)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    animation: 'nodingo-modal-in 320ms cubic-bezier(.2,.7,.2,1)',
  };
}

function iconBtnStyle() {
  return {
    width: 30, height: 30, borderRadius: 999, background: '#F4F4F0',
    border: 'none', cursor: 'pointer', padding: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
  };
}

function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, zIndex: 300,
      background: 'rgba(15,17,21,0.4)',
      backdropFilter: 'blur(2px)',
      animation: 'nodingo-fade-in 180ms ease',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', inset: 0 }}>
        {children}
      </div>
    </div>
  );
}

function DuoButton({ color, textColor = '#fff', onClick, disabled, children }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: '100%', padding: '14px 0',
      borderRadius: 18, border: 'none',
      background: color, color: textColor,
      fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em',
      cursor: disabled ? 'default' : 'pointer',
      boxShadow: disabled ? 'none' : `0 4px 0 ${window.nodingoDarken(color)}`,
      transition: 'all 120ms',
      transform: disabled ? 'none' : undefined,
    }}>{children}</button>
  );
}

function RewardRow({ icon, label, value, color }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 14px', marginTop: 8,
      borderRadius: 16, background: '#FAF8F4',
      border: '1px solid #EFEFEC',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 12,
        background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
      }}>{icon}</div>
      <div style={{ flex: 1, fontSize: 13, color: '#2A2C30', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 800, color, letterSpacing: '-0.01em' }}>{value}</div>
    </div>
  );
}

// ─── Daily Insight Receipt ──────────────────────────────────
function ReceiptModal({ data, accent, onClose }) {
  const T = window.NODINGO_TOKENS;
  // confetti pieces
  const pieces = useMMemo(() =>
    Array.from({ length: 22 }, (_, i) => ({
      i,
      x: Math.random() * 100,
      delay: Math.random() * 0.4,
      dur: 1.4 + Math.random() * 0.8,
      hue: ['#E8654D','#F5B82E','#5BBA6F','#4FA3E0','#8B6FE0'][i % 5],
      rot: Math.random() * 360,
      shape: i % 3,
    })), []);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 400,
      background: 'rgba(15,17,21,0.55)',
      backdropFilter: 'blur(2px)',
      animation: 'nodingo-fade-in 200ms ease',
      overflow: 'hidden',
    }}>
      {/* confetti */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {pieces.map(p => (
          <div key={p.i} style={{
            position: 'absolute',
            left: `${p.x}%`, top: -20,
            width: p.shape === 0 ? 8 : 10, height: p.shape === 0 ? 14 : 10,
            background: p.hue,
            borderRadius: p.shape === 2 ? 999 : 2,
            transform: `rotate(${p.rot}deg)`,
            animation: `nodingo-confetti ${p.dur}s ${p.delay}s ease-in forwards`,
          }} />
        ))}
      </div>

      {/* receipt — slides up from bottom */}
      <div style={{
        position: 'absolute', left: 18, right: 18, bottom: 22,
        animation: 'nodingo-receipt-in 520ms cubic-bezier(.2,.7,.2,1)',
      }}>
        <ReceiptPaper data={data} accent={accent} onClose={onClose} />
      </div>
    </div>
  );
}

function ReceiptPaper({ data, accent, onClose }) {
  const T = window.NODINGO_TOKENS;
  return (
    <div style={{
      position: 'relative',
      background: '#FFFFFF',
      borderTopLeftRadius: 24, borderTopRightRadius: 24,
      borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
      boxShadow: '0 30px 60px rgba(15,17,21,0.4)',
      paddingBottom: 12,
    }}>
      {/* top notch tape */}
      <div style={{
        position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
        width: 48, height: 16, borderRadius: 999,
        background: '#FFD7BA', opacity: 0.65,
        boxShadow: 'inset 0 0 0 1px #F1BFA0',
      }} />

      {/* header */}
      <div style={{ padding: '22px 22px 12px', textAlign: 'center' }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.16em',
          color: T.muted, textTransform: 'uppercase', marginBottom: 6,
        }}>NODINGO · DAILY INSIGHT</div>
        <div style={{
          fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em', color: T.ink,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          오늘의 지식 영수증 <span>🧾</span>
        </div>
        <div style={{
          marginTop: 6, fontSize: 12, color: T.muted, fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
          letterSpacing: '0.02em',
        }}>
          {data.date} · {data.username}님
        </div>
      </div>

      <DashedLine />

      {/* line items */}
      <div style={{ padding: '14px 22px 8px' }}>
        <ReceiptRow
          icon="🔥"
          label="오늘의 지식 칼로리"
          value={`+${data.brainKcal} Brain Kcal`}
          accent="#E8654D"
        />
        <ReceiptRow
          icon="🧠"
          label="새로 연결된 시냅스"
          value=""
          extra={
            <div style={{
              marginTop: 6, padding: '8px 10px',
              background: accent.soft, borderRadius: 10,
              fontSize: 12.5, fontWeight: 600, color: accent.c,
              letterSpacing: '-0.01em', lineHeight: 1.4,
              wordBreak: 'keep-all',
            }}>{data.synapseFrom} <span style={{ opacity: 0.6 }}>➔</span> {data.synapseTo}</div>
          }
        />
        <ReceiptRow
          icon="⏱"
          label="절약한 시간"
          value=""
          extra={
            <div style={{ marginTop: 4, fontSize: 13, fontWeight: 700, color: T.ink, letterSpacing: '-0.01em' }}>
              AI 요약으로 <s style={{ color: T.muted, fontWeight: 600 }}>{data.savedFrom}</s>
              {' '}<span style={{ color: '#5BBA6F' }}>➔ {data.savedTo} 컷!</span>
            </div>
          }
        />
      </div>

      <DashedLine />

      {/* total */}
      <div style={{
        padding: '12px 22px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>누적 코인</div>
          <div style={{
            fontSize: 22, fontWeight: 900, color: T.ink, letterSpacing: '-0.02em',
            marginTop: 2, fontVariantNumeric: 'tabular-nums',
          }}>
            +{data.coinsGained} <span style={{ fontSize: 14, color: T.muted, fontWeight: 600 }}>🪙</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>잔액</div>
          <div style={{
            fontSize: 16, fontWeight: 800, color: T.ink, letterSpacing: '-0.01em', marginTop: 4,
            fontVariantNumeric: 'tabular-nums',
          }}>{data.coinsTotal} 🪙</div>
        </div>
      </div>

      <DashedLine />

      {/* barcode */}
      <div style={{ padding: '12px 22px 6px', textAlign: 'center' }}>
        <Barcode />
        <div style={{
          fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
          fontSize: 9.5, color: T.muted, letterSpacing: '0.2em', marginTop: 4,
        }}>{data.serial}</div>
      </div>

      {/* CTAs */}
      <div style={{ padding: '4px 14px 8px', display: 'flex', gap: 8 }}>
        <button onClick={onClose} style={{
          padding: '13px 16px', borderRadius: 16,
          background: '#F2F2EE', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 700, color: T.ink, letterSpacing: '-0.01em',
          flex: 'none',
        }}>닫기</button>
        <button style={{
          flex: 1, padding: '13px 0', borderRadius: 16, border: 'none', cursor: 'pointer',
          background: 'linear-gradient(135deg, #F58529 0%, #DD2A7B 50%, #8134AF 100%)',
          color: '#fff', fontSize: 13, fontWeight: 800, letterSpacing: '-0.01em',
          boxShadow: '0 4px 0 #6A1F8B',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <InstagramGlyph />
          Instagram 스토리에 공유
        </button>
      </div>

      {/* sawtooth bottom edge */}
      <SawtoothBottom />
    </div>
  );
}

function DashedLine() {
  return (
    <div style={{ position: 'relative', height: 1, margin: '0 18px' }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(to right, #D8D8D2 0, #D8D8D2 4px, transparent 4px, transparent 8px)',
      }} />
    </div>
  );
}

function ReceiptRow({ icon, label, value, extra, accent }) {
  return (
    <div style={{ padding: '10px 0', borderBottom: '1px dashed #EEEEE8' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: '#FAF8F4', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flex: 'none',
        }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11.5, color: '#6B6B66', fontWeight: 600 }}>{label}</div>
          {value && (
            <div style={{
              fontSize: 15, fontWeight: 800, color: accent || '#0F1115',
              letterSpacing: '-0.02em', marginTop: 1, fontVariantNumeric: 'tabular-nums',
            }}>{value}</div>
          )}
        </div>
      </div>
      {extra}
    </div>
  );
}

function Barcode() {
  // pseudo-barcode of varying-width bars
  const bars = useMMemo(() => {
    const out = []; let x = 0;
    for (let i = 0; i < 38; i++) {
      const w = [1, 1, 2, 2, 3][Math.floor(Math.random() * 5)];
      out.push({ x, w });
      x += w + 1;
    }
    return out;
  }, []);
  const w = bars[bars.length - 1].x + bars[bars.length - 1].w;
  return (
    <svg width="100%" height="28" viewBox={`0 0 ${w} 28`} preserveAspectRatio="none">
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y="0" width={b.w} height="28" fill="#0F1115" />
      ))}
    </svg>
  );
}

function SawtoothBottom() {
  // bottom sawtooth edge via SVG mask-like background
  return (
    <div style={{ position: 'relative', height: 10, marginTop: 4 }}>
      <svg width="100%" height="10" viewBox="0 0 100 10" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, display: 'block' }}>
        <path d="M0 0 L100 0 L100 4 L96 10 L92 4 L88 10 L84 4 L80 10 L76 4 L72 10 L68 4 L64 10 L60 4 L56 10 L52 4 L48 10 L44 4 L40 10 L36 4 L32 10 L28 4 L24 10 L20 4 L16 10 L12 4 L8 10 L4 4 L0 10 Z"
          fill="#FFFFFF" />
      </svg>
    </div>
  );
}

function InstagramGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="13" height="13" rx="3.5" stroke="#fff" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="3" stroke="#fff" strokeWidth="1.4" />
      <circle cx="11.6" cy="4.5" r="0.7" fill="#fff" />
    </svg>
  );
}

Object.assign(window, {
  NodingoQuizModal: QuizModal,
  NodingoReceiptModal: ReceiptModal,
  NodingoDuoButton: DuoButton,
});
