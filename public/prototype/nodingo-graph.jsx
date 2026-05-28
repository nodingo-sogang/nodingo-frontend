/* global React */
// nodingo-graph.jsx — circle nodes (label-below) + bottom-sheet summary
// Props receive user state (level/scrapped/completedQuizzes) and host
// callbacks (onQuiz, onScrap, onLocked) so this stays a pure view.

const { useMemo: useGraphMemo, useEffect: useGraphEffect } = React;

// ─── tokens ─────────────────────────────────────────────────
window.NODINGO_TOKENS = {
  ink:   '#0F1115',
  bg:    '#FFFFFF',
  dim:   '#C6C6C2',
  edge:  '#E6E6E2',
  muted: '#6B6B66',
  warm:  '#FAF7F1',
};
window.NODINGO_ACCENTS = {
  coral:  { name: 'Coral',  c: '#E8654D', soft: '#FBE8E2' },
  indigo: { name: 'Indigo', c: '#3F5AE8', soft: '#E4E8FB' },
  forest: { name: 'Forest', c: '#1E8460', soft: '#DDEFE6' },
};

// graph layout — fit y∈[60,632] inside the slice between HUD top (~120)
// and the bottom sheet top (~404), so the active subgraph stays visible.
const GRAPH_Y_SCALE = 0.45;
const GRAPH_Y_SHIFT = 105;
const yOf = (n) => n.y * GRAPH_Y_SCALE + GRAPH_Y_SHIFT;

// ─── inject fog animations once ─────────────────────────────
function injectFogStyles() {
  if (document.getElementById('nodingo-fog-styles')) return;
  const s = document.createElement('style');
  s.id = 'nodingo-fog-styles';
  s.textContent = `
    @keyframes nodingo-fog-out {
      0%   { opacity: 1; transform: scale(1); }
      30%  { opacity: 0.6; transform: scale(1.15); }
      100% { opacity: 0; transform: scale(1.6); }
    }
    @keyframes nodingo-node-pop {
      0%   { transform: scale(0); opacity: 0; }
      60%  { transform: scale(1.18); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes nodingo-pulse-unlock {
      0%   { transform: scale(1); opacity: 0.7; }
      100% { transform: scale(2.4); opacity: 0; }
    }
    @keyframes nodingo-shine-unlock {
      0%   { opacity: 0; transform: scale(0.5); }
      50%  { opacity: 1; }
      100% { opacity: 0; transform: scale(2.6); }
    }
    @keyframes nodingo-label-unlock {
      0%   { opacity: 0; transform: translateX(-50%) translateY(8px); }
      100% { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes nodingo-unlock-badge {
      0%   { opacity: 0; transform: translateX(-50%) translateY(0); }
      20%  { opacity: 1; }
      80%  { opacity: 1; transform: translateX(-50%) translateY(-16px); }
      100% { opacity: 0; transform: translateX(-50%) translateY(-24px); }
    }
  `;
  document.head.appendChild(s);
}

// ─── single node — circle + label below ─────────────────────
function NodeLabel({ node, state, locked, scrapped, accent, onTap, unlocking }) {
  const T = window.NODINGO_TOKENS;
  const isSel = state === 'selected';
  const isRel = state === 'related';
  const isDim = state === 'dim';

  // sizing by weight
  const dot = node.weight >= 3 ? 26 : node.weight === 2 ? 18 : 12;
  const fontSize = node.weight >= 3 ? 13.5 : node.weight === 2 ? 12 : 11;
  const fontWeight = node.weight >= 3 ? 800 : node.weight === 2 ? 700 : 600;

  // color states for circle + label
  let dotBg, dotBorder, labelColor, ringShadow, opacity = 1;
  if (locked) {
    dotBg = '#F1F1ED'; dotBorder = '#E0E0DA'; labelColor = '#A8A8A4';
    ringShadow = 'none'; opacity = 0.78;
  } else if (isSel) {
    dotBg = T.ink; dotBorder = T.ink; labelColor = T.ink;
    ringShadow = '0 6px 14px rgba(15,17,21,0.35)';
  } else if (isRel) {
    dotBg = accent.c; dotBorder = accent.c; labelColor = accent.c;
    ringShadow = `0 0 0 4px ${accent.c}22, 0 4px 10px ${accent.c}33`;
  } else if (isDim) {
    dotBg = '#FFFFFF'; dotBorder = '#E8E8E4'; labelColor = T.dim;
    ringShadow = 'none'; opacity = 0.4;
  } else {
    dotBg = '#FFFFFF'; dotBorder = '#CFCFC8'; labelColor = T.ink;
    ringShadow = '0 1px 2px rgba(0,0,0,0.06)';
  }

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onTap(node.id, !!locked); }}
      style={{
        position: 'absolute',
        left: node.x, top: yOf(node),
        width: 0, height: 0,
        opacity, zIndex: isSel ? 30 : isRel ? 20 : 10,
        transition: 'opacity 360ms',
        cursor: 'pointer',
      }}>

      {/* ── 안개 오버레이 (잠긴 노드에만, 해제 연출 중 아닐 때) ── */}
      {locked && !unlocking && (
        <div style={{
          position: 'absolute',
          left: -dot * 1.8, top: -dot * 1.8,
          width: dot * 3.6, height: dot * 3.6,
          borderRadius: 999,
          background: 'radial-gradient(circle, rgba(238,238,232,0.96) 22%, rgba(238,238,232,0.62) 52%, rgba(238,238,232,0) 80%)',
          pointerEvents: 'none', zIndex: 4,
        }} />
      )}

      {/* ── 안개 해제 연출 (unlocking 중일 때) ── */}
      {unlocking && (
        <>
          {/* 안개 사라짐 */}
          <div style={{
            position: 'absolute',
            left: -dot * 2, top: -dot * 2,
            width: dot * 4, height: dot * 4,
            borderRadius: 999,
            background: 'radial-gradient(circle, rgba(235,235,228,0.98) 20%, rgba(235,235,228,0.65) 55%, rgba(235,235,228,0) 80%)',
            animation: 'nodingo-fog-out 1000ms ease-out forwards',
            pointerEvents: 'none', zIndex: 25,
          }} />
          {/* 골드 빛 링 */}
          <div style={{
            position: 'absolute',
            left: -(dot + 20) / 2, top: -(dot + 20) / 2,
            width: dot + 20, height: dot + 20,
            borderRadius: 999,
            border: '2px solid #FFD166',
            animation: 'nodingo-shine-unlock 900ms ease-out forwards',
            pointerEvents: 'none', zIndex: 26,
          }} />
          {/* 펄스 링 */}
          <div style={{
            position: 'absolute',
            left: -(dot + 10) / 2, top: -(dot + 10) / 2,
            width: dot + 10, height: dot + 10,
            borderRadius: 999,
            border: `1.5px solid ${accent.c}`,
            animation: 'nodingo-pulse-unlock 900ms ease-out forwards',
            pointerEvents: 'none', zIndex: 26,
          }} />
          {/* 노드 원 팝업 */}
          <div style={{
            position: 'absolute',
            left: -dot / 2, top: -dot / 2,
            width: dot, height: dot,
            borderRadius: 999,
            background: accent.c,
            border: `2px solid ${accent.c}`,
            animation: 'nodingo-node-pop 700ms cubic-bezier(.2,.7,.2,1) forwards',
            zIndex: 27,
          }} />
          {/* 레이블 팝업 */}
          <div style={{
            position: 'absolute',
            left: 0, top: dot / 2 + 5,
            fontSize, fontWeight,
            color: accent.c,
            letterSpacing: '-0.01em', whiteSpace: 'nowrap',
            textShadow: '0 0 8px rgba(255,255,255,1)',
            animation: 'nodingo-label-unlock 600ms 200ms both',
            pointerEvents: 'none', zIndex: 28,
            transform: 'translateX(-50%)',
          }}>{node.label}</div>
          {/* 🔓 해제! 뱃지 */}
          <div style={{
            position: 'absolute',
            left: 0, top: -22,
            fontSize: 10, fontWeight: 800,
            color: accent.c, whiteSpace: 'nowrap',
            animation: 'nodingo-unlock-badge 1100ms ease-out forwards',
            pointerEvents: 'none', zIndex: 29,
            transform: 'translateX(-50%)',
          }}>🔓 해제!</div>
        </>
      )}

      {/* pulse ring (related only) */}
      {isRel && !locked && (
        <div className="nodingo-pulse" style={{
          position: 'absolute',
          left: 0, top: 0,
          width: dot + 14, height: dot + 14,
          marginLeft: -(dot + 14) / 2, marginTop: -(dot + 14) / 2,
          borderRadius: 999,
          border: `1.5px solid ${accent.c}`,
          opacity: 0.55,
        }} />
      )}

      {/* circle */}
      <div style={{
        position: 'absolute', left: 0, top: 0,
        width: dot, height: dot,
        marginLeft: -dot / 2, marginTop: -dot / 2,
        borderRadius: 999,
        background: dotBg, border: `1.6px solid ${dotBorder}`,
        boxShadow: ringShadow,
        transition: 'all 360ms cubic-bezier(.2,.7,.2,1)',
        transform: `scale(${isSel ? 1.12 : isRel ? 1.06 : 1})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        filter: locked && !unlocking ? 'blur(0.4px)' : undefined,
      }}>
        {locked && !unlocking && (
          <svg width="7" height="9" viewBox="0 0 7 9" fill="none">
            <path d="M1.6 4V2.7a1.9 1.9 0 013.8 0V4" stroke="#A8A8A4" strokeWidth="1" strokeLinecap="round"/>
            <rect x="0.6" y="4" width="5.8" height="4.2" rx="1" fill="#A8A8A4"/>
          </svg>
        )}
        {/* scrapped indicator (top-right) */}
        {scrapped && !locked && (
          <div style={{
            position: 'absolute', top: -3, right: -3,
            width: 9, height: 9, borderRadius: 999,
            background: '#FF6B81', border: '1.5px solid #FFF',
            boxShadow: '0 0 4px rgba(255,107,129,0.5)',
          }} />
        )}
      </div>

      {/* label below (일반 노드만 — unlocking 중엔 위에서 따로 렌더링) */}
      {!unlocking && (
        <div style={{
          position: 'absolute',
          left: 0, top: dot / 2 + 5,
          transform: 'translateX(-50%)',
          fontSize, fontWeight, color: labelColor,
          letterSpacing: '-0.01em', whiteSpace: 'nowrap',
          textAlign: 'center',
          textShadow: '0 0 6px rgba(255,255,255,0.85), 0 0 6px rgba(255,255,255,0.85)',
          transition: 'color 360ms',
          pointerEvents: 'none',
        }}>
          {node.label}
        </div>
      )}
    </div>
  );
}

// ─── graph canvas ───────────────────────────────────────────
function GraphCanvas({
  nodes, edges, selectedId, relatedIds, accent,
  userLevel, scrappedSet, onTapNode, onTapBg,
  unlockingSet,
}) {
  injectFogStyles();

  const T = window.NODINGO_TOKENS;
  const UNLOCK = window.NODINGO_UNLOCK;
  const idMap = useGraphMemo(() => Object.fromEntries(nodes.map(n => [n.id, n])), [nodes]);

  return (
    <div
      onClick={onTapBg}
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        background: T.bg, overflow: 'hidden',
      }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(15,17,21,0.045) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        opacity: selectedId ? 0.22 : 0.55,
        transition: 'opacity 360ms',
        pointerEvents: 'none',
      }} />

      {/* edges */}
      <svg
        width="100%" height="100%" viewBox="0 0 390 740"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {edges.map(([a, b], i) => {
          const A = idMap[a], B = idMap[b];
          if (!A || !B) return null;
          const aLocked = (UNLOCK[a] || 1) > userLevel;
          const bLocked = (UNLOCK[b] || 1) > userLevel;
          const eitherLocked = aLocked || bLocked;
          let stroke = T.edge, w = 1, op = 1;
          if (eitherLocked) { stroke = '#EEEEEA'; op = 0.5; }
          if (selectedId) {
            const onPath = (a === selectedId || b === selectedId);
            if (onPath) { stroke = accent.c; w = 1.4; op = eitherLocked ? 0.3 : 0.85; }
            else { op = 0.15; }
          }
          return (
            <line key={i}
              x1={A.x} y1={yOf(A)} x2={B.x} y2={yOf(B)}
              stroke={stroke} strokeWidth={w} opacity={op}
              strokeDasharray={eitherLocked ? '3 3' : undefined}
              style={{ transition: 'all 360ms' }}
            />
          );
        })}
      </svg>

      {/* nodes */}
      {nodes.map(n => {
        const locked = (UNLOCK[n.id] || 1) > userLevel;
        let state = 'normal';
        if (selectedId) {
          if (n.id === selectedId) state = 'selected';
          else if (relatedIds.has(n.id)) state = 'related';
          else state = 'dim';
        }
        return (
          <NodeLabel key={n.id}
            node={n} state={state} locked={locked}
            scrapped={scrappedSet.has(n.id)}
            accent={accent} onTap={onTapNode}
            unlocking={unlockingSet ? unlockingSet.has(n.id) : false}
          />
        );
      })}
    </div>
  );
}

// ─── inline **bold** parser ─────────────────────────────────
function renderInlineBold(text, accent) {
  const out = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0, m, k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(<span key={k++}>{text.slice(last, m.index)}</span>);
    out.push(
      <span key={k++} style={{
        color: accent.c, fontWeight: 700,
        background: accent.soft, padding: '0 4px', borderRadius: 4,
      }}>{m[1]}</span>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(<span key={k++}>{text.slice(last)}</span>);
  return out;
}

// ─── bottom-sheet summary panel ─────────────────────────────
function SummaryPanel({
  data, nodeId, accent,
  scrapped, quizCompleted,
  onClose, onJump, onScrap, onQuiz,
}) {
  if (!data) return null;
  const T = window.NODINGO_TOKENS;
  const news = window.NODINGO_NEWS[nodeId] || window.NODINGO_NEWS_FALLBACK(data.title);
  const paragraphs = data.summary.split('\n\n');

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 86,
        height: 332,
        background: '#FFFFFF',
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        boxShadow: '0 -16px 38px rgba(15,17,21,0.18), 0 -1px 0 rgba(15,17,21,0.05)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 70,
        animation: 'nodingo-sheet-in 420ms cubic-bezier(.2,.7,.2,1)',
      }}>

      {/* drag handle */}
      <div style={{
        padding: '8px 0 4px',
        display: 'flex', justifyContent: 'center',
        flex: 'none',
      }}>
        <div style={{ width: 42, height: 4, borderRadius: 999, background: '#D8D8D2' }} />
      </div>

      {/* header */}
      <div style={{
        padding: '4px 18px 10px',
        display: 'flex', alignItems: 'flex-start', gap: 10,
        flex: 'none',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
            color: accent.c, textTransform: 'uppercase',
          }}>{data.kind}</div>
          <div style={{
            marginTop: 2,
            fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em',
            color: T.ink, lineHeight: 1.15, wordBreak: 'keep-all',
          }}>{data.title}</div>
          <div style={{
            marginTop: 8,
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '3px 8px', borderRadius: 999,
            background: T.ink, color: '#fff',
            fontSize: 10, fontWeight: 700, letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: 999, background: accent.c,
              boxShadow: `0 0 6px ${accent.c}`,
            }} />
            GraphRAG 요약
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flex: 'none' }}>
          <button onClick={onScrap} aria-label="스크랩" style={{
            width: 32, height: 32, borderRadius: 999,
            background: scrapped ? '#FFEFF1' : '#F4F4F0',
            border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 200ms',
          }}>
            <svg width="14" height="13" viewBox="0 0 13 12" fill="none">
              <path d="M6.5 11s-5-3-5-7a3 3 0 015-2.2A3 3 0 0111.5 4c0 4-5 7-5 7z"
                fill={scrapped ? '#FF6B81' : 'none'}
                stroke={scrapped ? '#FF6B81' : T.ink}
                strokeWidth="1.3" strokeLinejoin="round" />
            </svg>
          </button>
          <button onClick={onClose} aria-label="닫기" style={{
            width: 32, height: 32, borderRadius: 999, background: '#F4F4F0',
            border: 'none', cursor: 'pointer', padding: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="11" height="11" viewBox="0 0 10 10">
              <path d="M1 1l8 8M9 1l-8 8" stroke={T.ink} strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* scrollable body */}
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 18px 14px' }}>
        {paragraphs.map((p, i) => (
          <p key={i} style={{
            margin: '0 0 10px',
            fontSize: 13, lineHeight: 1.62, color: '#2A2C30',
            letterSpacing: '-0.01em', wordBreak: 'keep-all', textWrap: 'pretty',
          }}>{renderInlineBold(p, accent)}</p>
        ))}

        {/* news section */}
        <div style={{ marginTop: 12, paddingTop: 14, borderTop: '1px dashed #ECECE8' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 8,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
              color: T.muted, textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ fontSize: 13 }}>📰</span>
              출처 뉴스 · {news.length}
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, color: accent.c,
              padding: '2px 7px', borderRadius: 999,
              background: accent.soft, letterSpacing: '-0.01em',
            }}>퀴즈 출처</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {news.map((n, i) => <NewsCard key={i} n={n} />)}
          </div>
        </div>

        {/* related */}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px dashed #ECECE8' }}>
          <div style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
            color: T.muted, textTransform: 'uppercase', marginBottom: 8,
          }}>관련 키워드 · {data.related.length}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {data.related.map(rid => {
              const node = window.NODINGO_NODES.find(n => n.id === rid);
              if (!node) return null;
              return (
                <button key={rid} onClick={() => onJump(rid)} style={{
                  padding: '6px 10px', borderRadius: 999,
                  background: accent.soft, border: `1px solid ${accent.c}33`,
                  color: accent.c, fontSize: 11.5, fontWeight: 700,
                  cursor: 'pointer', letterSpacing: '-0.01em', whiteSpace: 'nowrap',
                }}>{node.label}</button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA footer */}
      <div style={{
        padding: '10px 14px 12px', borderTop: '1px solid #F2F2EE',
        flex: 'none',
      }}>
        <button onClick={onQuiz} disabled={quizCompleted} style={{
          width: '100%', padding: '13px 0', borderRadius: 18,
          background: quizCompleted ? '#E8F4EA' : accent.c,
          color: quizCompleted ? '#1E8460' : '#fff',
          border: 'none', cursor: quizCompleted ? 'default' : 'pointer',
          fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em',
          boxShadow: quizCompleted ? 'none' : `0 4px 0 ${darken(accent.c)}`,
          transition: 'all 120ms',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {quizCompleted ? (
            <>
              <svg width="15" height="15" viewBox="0 0 14 14"><path d="M3 7l3 3 5-6" stroke="#1E8460" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
              오늘 완료 · +60 XP 받음
            </>
          ) : (
            <>
              🎯 뉴스 기반 퀴즈 풀기
              <span style={{
                background: 'rgba(255,255,255,0.22)',
                padding: '2px 8px', borderRadius: 999,
                fontSize: 11, fontWeight: 800,
              }}>+60 XP</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── news card ──────────────────────────────────────────────
function NewsCard({ n }) {
  const T = window.NODINGO_TOKENS;
  if (n.placeholder) {
    return (
      <div style={{
        padding: '12px 12px', borderRadius: 14,
        background: '#FAF8F4', border: '1px dashed #D8D8D2',
        textAlign: 'center', color: T.muted,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.ink, letterSpacing: '-0.01em' }}>
          {n.title}
        </div>
        <div style={{ fontSize: 11.5, marginTop: 4 }}>{n.snippet}</div>
      </div>
    );
  }
  return (
    <a href="#" onClick={(e) => e.preventDefault()} style={{
      display: 'block', textDecoration: 'none',
      padding: '11px 12px', borderRadius: 14,
      background: '#FAF8F4', border: '1px solid #EFEEEA',
      transition: 'background 160ms',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        marginBottom: 4,
      }}>
        <span style={{
          padding: '2px 7px', borderRadius: 999,
          background: T.ink, color: '#fff',
          fontSize: 9.5, fontWeight: 800, letterSpacing: '0.02em',
        }}>{n.outlet}</span>
        <span style={{ fontSize: 10.5, color: T.muted, fontWeight: 600, letterSpacing: '-0.01em' }}>
          {n.date}
        </span>
      </div>
      <div style={{
        fontSize: 13, fontWeight: 700, color: T.ink,
        letterSpacing: '-0.02em', lineHeight: 1.35,
        wordBreak: 'keep-all',
      }}>{n.title}</div>
      <div style={{
        marginTop: 4,
        fontSize: 11.5, color: '#4A4C50', lineHeight: 1.5,
        letterSpacing: '-0.01em',
        wordBreak: 'keep-all',
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>{n.snippet}</div>
    </a>
  );
}

// ─── helpers ────────────────────────────────────────────────
function darken(hex) {
  const h = hex.replace('#','');
  const r = Math.max(0, parseInt(h.slice(0,2), 16) - 38);
  const g = Math.max(0, parseInt(h.slice(2,4), 16) - 38);
  const b = Math.max(0, parseInt(h.slice(4,6), 16) - 38);
  return `#${[r,g,b].map(x => x.toString(16).padStart(2,'0')).join('')}`;
}

// ─── locked-node toast (positioned ABOVE the sheet) ─────────
function LockedToast({ message }) {
  if (!message) return null;
  return (
    <div style={{
      position: 'absolute', top: 138, left: '50%',
      transform: 'translateX(-50%)', zIndex: 200,
      padding: '10px 16px', borderRadius: 16,
      background: '#0F1115', color: '#fff',
      fontSize: 12.5, fontWeight: 600, letterSpacing: '-0.01em',
      boxShadow: '0 12px 24px rgba(15,17,21,0.3)',
      display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
      animation: 'nodingo-toast 220ms cubic-bezier(.2,.7,.2,1)',
    }}>
      <span style={{ fontSize: 14 }}>🔒</span>
      {message}
    </div>
  );
}

Object.assign(window, {
  NodingoGraphCanvas: GraphCanvas,
  NodingoSummaryPanel: SummaryPanel,
  NodingoLockedToast: LockedToast,
  nodingoDarken: darken,
});
