import { useEffect, useMemo, useState } from 'react';
import { forceSimulation, forceManyBody, forceCenter, forceCollide, forceX, forceY } from 'd3-force';

export type ScrapGraphNode = { id: number; word: string; persona: string };
type SimNode = ScrapGraphNode & { x: number; y: number };

const SVG_W = 360;
const SVG_H = 460;

function personaSoft(persona: string): string {
  const map: Record<string, string> = {
    ECONOMY: '#FFF5E6', POLITICS: '#EAF3FF', TECHNOLOGY: '#EAF8EE',
    SOCIETY: '#F4ECFF', CULTURE: '#FFECEC', INTERNATIONAL: '#E9F8FB',
  };
  return map[persona] ?? '#F4F4F0';
}
function personaStroke(persona: string): string {
  const map: Record<string, string> = {
    ECONOMY: '#F1B45E', POLITICS: '#7CB5F4', TECHNOLOGY: '#7BCF91',
    SOCIETY: '#B996EA', CULTURE: '#F08C8C', INTERNATIONAL: '#7CCFDC',
  };
  return map[persona] ?? '#CFCFC8';
}
function displayLabel(label: string): string {
  return label.length > 7 ? `${label.slice(0, 7)}…` : label;
}

interface Props {
  nodes: ScrapGraphNode[];
  onSelect?: (node: ScrapGraphNode) => void;
}

export default function ScrapGraphView({ nodes, onSelect }: Props) {
  const [positions, setPositions] = useState<Map<number, { x: number; y: number }>>(new Map());

  // 노드 집합이 실제로 바뀔 때만 시뮬레이션 재시작 (id 시그니처)
  const sig = useMemo(() => nodes.map(n => n.id).join(','), [nodes]);

  useEffect(() => {
    if (nodes.length === 0) { setPositions(new Map()); return; }
    const simNodes: SimNode[] = nodes.map((n, i) => {
      const angle = (Math.PI * 2 * i) / Math.max(1, nodes.length);
      const radius = 50 + (i % 4) * 30;
      return { ...n, x: SVG_W / 2 + Math.cos(angle) * radius, y: SVG_H / 2 + Math.sin(angle) * radius };
    });
    const sim = forceSimulation<SimNode>(simNodes)
      .force('charge', forceManyBody<SimNode>().strength(-130))
      .force('center', forceCenter<SimNode>(SVG_W / 2, SVG_H / 2).strength(0.5))
      .force('collide', forceCollide<SimNode>(38).strength(0.9))
      .force('x', forceX<SimNode>(SVG_W / 2).strength(0.06))
      .force('y', forceY<SimNode>(SVG_H / 2).strength(0.06));
    sim.on('tick', () => {
      simNodes.forEach(n => {
        n.x = Math.max(34, Math.min(SVG_W - 34, n.x));
        n.y = Math.max(34, Math.min(SVG_H - 40, n.y));
      });
      const m = new Map<number, { x: number; y: number }>();
      simNodes.forEach(n => m.set(n.id, { x: n.x, y: n.y }));
      setPositions(m);
    });
    return () => { sim.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  if (nodes.length === 0) {
    return (
      <div style={{
        margin: '24px 16px', padding: '34px 18px', borderRadius: 22,
        background: '#FFFFFF', textAlign: 'center', color: '#6B6B66',
        fontSize: 13, fontWeight: 700, lineHeight: 1.55,
      }}>
        아직 스크랩한 키워드가 없어요.<br />
        그래프에서 관심 키워드의 하트를 눌러 모아보세요.
      </div>
    );
  }

  return (
    <div style={{ padding: '4px 8px 16px' }}>
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ display: 'block', touchAction: 'manipulation' }}>
        {nodes.map(n => {
          const p = positions.get(n.id);
          if (!p) return null;
          return (
            <g key={n.id} onClick={() => onSelect?.(n)} style={{ cursor: 'pointer' }}>
              <circle
                cx={p.x} cy={p.y} r={20}
                fill={personaSoft(n.persona)}
                stroke={personaStroke(n.persona)}
                strokeWidth={2}
              />
              {/* 스크랩 표시 하트 */}
              <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={12} fill="#E8657A" style={{ pointerEvents: 'none' }}>♥</text>
              <text
                x={p.x} y={p.y + 34}
                textAnchor="middle" fontSize={11} fontWeight={800} fill="#0F1115"
                style={{ pointerEvents: 'none', textShadow: '0 0 6px rgba(255,255,255,0.95)' }}
              >
                {displayLabel(n.word)}
              </text>
            </g>
          );
        })}
      </svg>
      <div style={{ textAlign: 'center', fontSize: 11, color: '#9A9A94', fontWeight: 600, marginTop: 4 }}>
        탭하면 그래프에서 해당 키워드를 볼 수 있어요
      </div>
    </div>
  );
}
