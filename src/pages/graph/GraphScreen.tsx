import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { useQuery, useQueries, useMutation } from '@tanstack/react-query';
import {
  forceSimulation, forceLink, forceManyBody,
  forceCenter, forceCollide, forceX, forceY,
} from 'd3-force';
import { graphApi } from '../../api/graph';
import { FogLayer, UnlockAnimation } from '../../components/game/FogOverlay';
import type { GraphNodeResponse, NodeSummaryResponse, NewsItemBrief } from '../../types';
import type { UserGame } from '../../types/game';
import { MOCK_TABS, MOCK_GRAPH, MOCK_SUMMARIES, NODE_UNLOCK_LEVELS, tierOf } from '../../mocks';
import styles from '../GraphPage.module.css';

const SVG_W = 500;
const SVG_H = 540;

const LABEL_TO_LOCK_KEY: Record<string, string> = {
  GraphRAG: 'graphrag',
  RAG: 'rag',
  지식그래프: 'knowledge',
  벡터DB: 'vectordb',
  LLM: 'llm',
  임베딩: 'embedding',
  청킹: 'chunking',
  Transformer: 'transformer',
  Attention: 'attention',
  GPT: 'gpt',
  토큰화: 'tokenize',
  자연어처리: 'nlp',
  파인튜닝: 'finetune',
  프롬프트: 'prompt',
  에이전트: 'agent',
  추론: 'reasoning',
  '엔티티 추출': 'entity',
  Cypher: 'cypher',
  Neo4j: 'neo4j',
  멀티모달: 'multimodal',
  환각: 'hallucination',
};

function nodeRadius(score: number): number {
  return 5 + score * 9;
}

function nodeDot(score: number): number {
  return score >= 0.9 ? 26 : score >= 0.7 ? 18 : 12;
}

function nodeFontSize(score: number): number {
  return score >= 0.9 ? 13.5 : score >= 0.7 ? 12 : 11;
}

function personaSoftColor(persona: string): string {
  const map: Record<string, string> = {
    ECONOMY: '#FFF5E6',
    POLITICS: '#EAF3FF',
    TECHNOLOGY: '#EAF8EE',
    SOCIETY: '#F4ECFF',
    CULTURE: '#FFECEC',
    INTERNATIONAL: '#E9F8FB',
  };
  return map[persona] ?? '#F4F4F0';
}

function personaStrokeColor(persona: string): string {
  const map: Record<string, string> = {
    ECONOMY: '#F1B45E',
    POLITICS: '#7CB5F4',
    TECHNOLOGY: '#7BCF91',
    SOCIETY: '#B996EA',
    CULTURE: '#F08C8C',
    INTERNATIONAL: '#7CCFDC',
  };
  return map[persona] ?? '#CFCFC8';
}

function layoutRadius(node: GraphNodeResponse): number {
  return nodeDot(node.score) + (node.score >= 0.7 ? 28 : 22);
}

function displayLabel(label: string): string {
  return label.length > 6 ? `${label.slice(0, 6)}…` : label;
}

function darken(hex: string): string {
  const raw = hex.replace('#', '');
  const n = parseInt(raw.length === 3 ? raw.split('').map(c => c + c).join('') : raw, 16);
  const r = Math.max(0, Math.floor(((n >> 16) & 255) * 0.72));
  const g = Math.max(0, Math.floor(((n >> 8) & 255) * 0.72));
  const b = Math.max(0, Math.floor((n & 255) * 0.72));
  return `rgb(${r}, ${g}, ${b})`;
}

function renderBold(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{
          color: '#E8654D',
          background: '#FBE8E2',
          padding: '0 4px',
          borderRadius: 4,
        }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

function newsForSummary(summary: NodeSummaryResponse | null): NewsItemBrief[] {
  if (!summary) return [];
  if (summary.news && summary.news.length > 0) return summary.news;

  const base = summary.summary
    .replace(/\*\*/g, '')
    .split(/[.!?。]\s*/)
    .map(s => s.trim())
    .filter(Boolean);

  const snippets = base.length > 0
    ? base.slice(0, 3)
    : [`${summary.word}와 관련된 뉴스 원문을 기반으로 요약과 퀴즈를 생성합니다.`];

  return snippets.map((snippet, index) => ({
    id: summary.keyword_id * 100 + index,
    title: `${summary.word} 관련 원문 ${index + 1}`,
    outlet: 'Nodingo Source',
    date: '2025.05.27',
    url: `https://example.com/source/${summary.keyword_id}-${index + 1}`,
    snippet,
  }));
}

type SimNode = GraphNodeResponse & { x?: number; y?: number; fx?: number | null; fy?: number | null };
type ScrappedNode = { id: number; label: string; persona: string; summary: string };

interface GraphScreenProps {
  userGame: UserGame;
  unlockingNodes: Set<string>;
  forceMock?: boolean;
  onNodeExplore: (nodeId: number, nodeLabel: string) => void;
  onScrap: (nodeId: number, nodeLabel: string) => void;
  onScrapChange?: (item: ScrappedNode, scrapped: boolean) => void;
  onQuizStart: (nodeLabel: string) => void;
}

export default function GraphScreen({
  userGame,
  unlockingNodes,
  forceMock = false,
  onNodeExplore,
  onScrap,
  onScrapChange,
  onQuizStart,
}: GraphScreenProps) {
  const [isLiveData, setIsLiveData] = useState(false);
  const [highlightKeywordId, setHighlightKeywordId] = useState<number | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scrappedNodes, setScrappedNodes] = useState<Map<number, ScrappedNode>>(new Map());
  const exploredRef = useRef<Set<number>>(new Set());

  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const transformRef = useRef(transform);
  useEffect(() => { transformRef.current = transform; }, [transform]);

  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const lastTransform = useRef(transform);
  const pinchDist = useRef<number | null>(null);

  const simNodesRef = useRef<SimNode[]>([]);
  const simulationRef = useRef<any>(null);
  const [positions, setPositions] = useState<Map<number, { x: number; y: number }>>(new Map());

  const dragNodeRef = useRef<SimNode | null>(null);
  const dragMoved = useRef(false);

  // ── Queries ───────────────────────────────────────────────────────────────────

  const { data: tabsData, isLoading: tabsLoading } = useQuery({
    queryKey: ['tabs'],
    queryFn: () => {
      if (forceMock) {
        setIsLiveData(false);
        return Promise.resolve(MOCK_TABS);
      }
      return graphApi.getTabs().then(r => { setIsLiveData(true); return r.data.data; })
        .catch(() => { setIsLiveData(false); return MOCK_TABS; });
    },
    placeholderData: MOCK_TABS,
  });

  const tabs = tabsData?.tabs ?? MOCK_TABS.tabs;

  const graphQueries = useQueries({
    queries: tabs.map(tab => ({
      queryKey: ['graph', tab.keyword_id],
      queryFn: () => {
        if (forceMock) return Promise.resolve(MOCK_GRAPH[tab.keyword_id] ?? MOCK_GRAPH[1]);
        return graphApi.getGraphData(tab.keyword_id)
          .then(r => r.data.data)
          .catch(() => MOCK_GRAPH[tab.keyword_id] ?? MOCK_GRAPH[1]);
      },
      placeholderData: MOCK_GRAPH[tab.keyword_id] ?? MOCK_GRAPH[1],
    })),
  });

  const graphLoading = graphQueries.some(q => q.isLoading && !q.data);

  const { allNodes, allEdges, tabNodeIds } = useMemo(() => {
    const nodeMap = new Map<number, GraphNodeResponse>();
    const edgeKey = new Set<string>();
    const edges: { source: number; target: number; weight: number }[] = [];
    const tabNodeIds = new Map<number, Set<number>>();

    tabs.forEach((tab, i) => {
      const data = graphQueries[i]?.data;
      if (!data) return;
      const ids = new Set<number>();
      data.nodes.forEach(n => { nodeMap.set(n.id, n); ids.add(n.id); });
      tabNodeIds.set(tab.keyword_id, ids);
      data.edges.forEach(e => {
        const k = `${Math.min(e.source, e.target)}-${Math.max(e.source, e.target)}`;
        if (!edgeKey.has(k)) { edgeKey.add(k); edges.push(e); }
      });
    });
    return { allNodes: [...nodeMap.values()], allEdges: edges, tabNodeIds };
  }, [tabs, graphQueries]);

  const { displayNodes, displayEdges, dynamicUnlockLevels } = useMemo(() => {
    const degree = new Map<number, number>();
    const strength = new Map<number, number>();
    const maxWeight = new Map<number, number>();

    allEdges.forEach(edge => {
      degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
      degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
      strength.set(edge.source, (strength.get(edge.source) ?? 0) + edge.weight);
      strength.set(edge.target, (strength.get(edge.target) ?? 0) + edge.weight);
      maxWeight.set(edge.source, Math.max(maxWeight.get(edge.source) ?? 0, edge.weight));
      maxWeight.set(edge.target, Math.max(maxWeight.get(edge.target) ?? 0, edge.weight));
    });

    const ranked = [...allNodes].sort((a, b) => {
      const aScore = a.score * 2.2 + (degree.get(a.id) ?? 0) * 0.26 + (strength.get(a.id) ?? 0) * 0.42 + (maxWeight.get(a.id) ?? 0);
      const bScore = b.score * 2.2 + (degree.get(b.id) ?? 0) * 0.26 + (strength.get(b.id) ?? 0) * 0.42 + (maxWeight.get(b.id) ?? 0);
      return bScore - aScore;
    });

    const visibleIds = new Set(ranked.slice(0, 20).map(node => node.id));
    const visibleNeighborIds = new Set<number>();
    allEdges.forEach(edge => {
      if (visibleIds.has(edge.source) && !visibleIds.has(edge.target)) visibleNeighborIds.add(edge.target);
      if (visibleIds.has(edge.target) && !visibleIds.has(edge.source)) visibleNeighborIds.add(edge.source);
    });

    const fogCandidates = ranked.filter(node => !visibleIds.has(node.id));
    const fogIds = fogCandidates
      .sort((a, b) => {
        const aNear = visibleNeighborIds.has(a.id) ? 1 : 0;
        const bNear = visibleNeighborIds.has(b.id) ? 1 : 0;
        if (aNear !== bNear) return bNear - aNear;
        return (strength.get(b.id) ?? 0) - (strength.get(a.id) ?? 0);
      })
      .slice(0, 16)
      .map(node => node.id);

    const displayIds = new Set([...visibleIds, ...fogIds]);
    const levels = new Map<number, number>();
    [...visibleIds].forEach(id => levels.set(id, 1));
    fogIds.forEach((id, index) => levels.set(id, 5 + Math.floor(index / 8)));

    return {
      displayNodes: allNodes.filter(node => displayIds.has(node.id)),
      displayEdges: allEdges.filter(edge => displayIds.has(edge.source) && displayIds.has(edge.target)),
      dynamicUnlockLevels: levels,
    };
  }, [allNodes, allEdges]);

  const { data: nodeSummary, isLoading: summaryLoading } = useQuery<NodeSummaryResponse | null>({
    queryKey: ['nodeSummary', selectedNodeId],
    queryFn: async () => {
      if (!selectedNodeId) return null;
      if (forceMock) return MOCK_SUMMARIES[selectedNodeId] ?? null;
      return graphApi.getNodeSummary(selectedNodeId)
        .then(r => r.data.data)
        .catch(() => MOCK_SUMMARIES[selectedNodeId] ?? null);
    },
    enabled: selectedNodeId !== null && sheetOpen,
    placeholderData: selectedNodeId !== null ? (MOCK_SUMMARIES[selectedNodeId] ?? null) : null,
  });

  // ── Scrap mutation ────────────────────────────────────────────────────────────

  const scrapMutation = useMutation({
    mutationFn: (node: ScrappedNode) => {
      if (forceMock) return Promise.resolve(null);
      return scrappedNodes.has(node.id)
        ? graphApi.unscrapKeyword(node.id)
        : graphApi.scrapKeyword(node.id);
    },
    onMutate: (node) => {
      setScrappedNodes(prev => {
        const next = new Map(prev);
        const wasScraped = next.has(node.id);
        if (wasScraped) {
          next.delete(node.id);
          onScrapChange?.(node, false);
        }
        else {
          next.set(node.id, node);
          onScrapChange?.(node, true);
          onScrap(node.id, node.label);
        }
        return next;
      });
    },
  });

  // ── Node lock check ───────────────────────────────────────────────────────────

  const isLocked = useCallback((node: GraphNodeResponse) => {
    const dynamicLevel = dynamicUnlockLevels.get(node.id);
    if (dynamicLevel !== undefined) return dynamicLevel > userGame.level;
    const key = LABEL_TO_LOCK_KEY[node.label] ?? node.label.toLowerCase().replace(/[\s-]+/g, '');
    return (NODE_UNLOCK_LEVELS[key] ?? 1) > userGame.level;
  }, [dynamicUnlockLevels, userGame.level]);

  const isUnlocking = useCallback((node: GraphNodeResponse) => {
    const key = LABEL_TO_LOCK_KEY[node.label] ?? node.label.toLowerCase().replace(/[\s-]+/g, '');
    return unlockingNodes.has(key);
  }, [unlockingNodes]);

  // ── Force simulation ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (displayNodes.length === 0) return;
    simulationRef.current?.stop();

    const simNodes: SimNode[] = displayNodes.map((n, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(1, displayNodes.length);
      const radius = 70 + (index % 4) * 38;
      return {
        ...n,
        x: SVG_W / 2 + Math.cos(angle) * radius,
        y: SVG_H / 2 + Math.sin(angle) * radius * 0.76,
      };
    });

    const simEdges = displayEdges.map(edge => ({
      source: edge.source,
      target: edge.target,
      weight: edge.weight,
    }));

    const sim = forceSimulation<SimNode>(simNodes)
      .force('link', forceLink<SimNode, { source: number | SimNode; target: number | SimNode; weight: number }>(simEdges)
        .id(node => node.id)
        .distance(edge => 66 + (1 - edge.weight) * 70)
        .strength(edge => 0.32 + edge.weight * 0.36))
      .force('charge', forceManyBody<SimNode>().strength(node => isLocked(node) ? -36 : -105))
      .force('center', forceCenter<SimNode>(SVG_W / 2, SVG_H / 2 - 18).strength(0.34))
      .force('x', forceX<SimNode>(SVG_W / 2).strength(0.055))
      .force('y', forceY<SimNode>(SVG_H / 2 - 18).strength(0.07))
      .force('collide', forceCollide<SimNode>(node => layoutRadius(node)).strength(0.92))
      .stop();

    for (let i = 0; i < 260; i++) sim.tick();

    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < simNodes.length; i++) {
        for (let j = i + 1; j < simNodes.length; j++) {
          const a = simNodes[i];
          const b = simNodes[j];
          const min = layoutRadius(a) + layoutRadius(b) - 4;
          const dx = (b.x ?? 0) - (a.x ?? 0);
          const dy = (b.y ?? 0) - (a.y ?? 0);
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < min) {
            const push = (min - dist) / 2;
            const ux = dx / dist;
            const uy = dy / dist;
            a.x = (a.x ?? SVG_W / 2) - ux * push;
            a.y = (a.y ?? SVG_H / 2) - uy * push;
            b.x = (b.x ?? SVG_W / 2) + ux * push;
            b.y = (b.y ?? SVG_H / 2) + uy * push;
          }
        }
      }
    }

    simNodes.forEach(node => {
      const pad = nodeDot(node.score) + 24;
      node.x = Math.max(pad, Math.min(SVG_W - pad, node.x ?? SVG_W / 2));
      node.y = Math.max(46, Math.min(SVG_H - 88, node.y ?? SVG_H / 2));
    });

    simNodesRef.current = simNodes;
    const map = new Map<number, { x: number; y: number }>();
    simNodes.forEach(n => map.set(n.id, { x: n.x!, y: n.y! }));
    setPositions(map);
    simulationRef.current = null;
  }, [displayNodes, displayEdges, isLocked]);

  // ── Highlight logic ───────────────────────────────────────────────────────────

  const tabHighlightIds = useMemo(() => {
    if (highlightKeywordId === null) return null;
    return tabNodeIds.get(highlightKeywordId) ?? null;
  }, [highlightKeywordId, tabNodeIds]);

  const hoverAdjacentIds = useMemo(() => {
    if (hoveredNodeId === null) return null;
    const set = new Set<number>([hoveredNodeId]);
    displayEdges.forEach(e => {
      if (e.source === hoveredNodeId) set.add(e.target);
      if (e.target === hoveredNodeId) set.add(e.source);
    });
    return set;
  }, [hoveredNodeId, displayEdges]);

  function isDimmed(nodeId: number): boolean {
    if (hoverAdjacentIds !== null) return !hoverAdjacentIds.has(nodeId);
    if (tabHighlightIds !== null) return !tabHighlightIds.has(nodeId);
    return false;
  }

  // ── SVG coordinate helper ─────────────────────────────────────────────────────

  const toSvgCoords = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const { x, y, scale } = transformRef.current;
    const svgX = (clientX - rect.left) * (SVG_W / rect.width);
    const svgY = (clientY - rect.top) * (SVG_H / rect.height);
    return { x: (svgX - x) / scale, y: (svgY - y) / scale };
  }, []);

  // ── Pan/zoom/drag handlers ─────────────────────────────────────────────────────

  const onBgPointerDown = useCallback((e: React.PointerEvent<SVGRectElement>) => {
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    lastTransform.current = transformRef.current;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }, []);

  const onSvgPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (dragNodeRef.current) {
      dragMoved.current = true;
      const { x, y } = toSvgCoords(e.clientX, e.clientY);
      dragNodeRef.current.fx = x;
      dragNodeRef.current.fy = y;
      simulationRef.current?.alphaTarget(0.3).restart();
      return;
    }
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setTransform({ ...lastTransform.current, x: lastTransform.current.x + dx, y: lastTransform.current.y + dy });
  }, [toSvgCoords]);

  const onSvgPointerUp = useCallback(() => {
    isPanning.current = false;
    if (dragNodeRef.current) {
      dragNodeRef.current.fx = null;
      dragNodeRef.current.fy = null;
      simulationRef.current?.alphaTarget(0);
      dragNodeRef.current = null;
    }
  }, []);

  const onWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({ ...prev, scale: Math.min(4, Math.max(0.2, prev.scale * delta)) }));
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchDist.current = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 2 && pinchDist.current !== null) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.sqrt(dx * dx + dy * dy);
      setTransform(prev => ({
        ...prev,
        scale: Math.min(4, Math.max(0.2, prev.scale * (newDist / pinchDist.current!))),
      }));
      pinchDist.current = newDist;
    }
  }, []);

  const onNodePointerUp = useCallback((e: React.PointerEvent<SVGCircleElement>, node: GraphNodeResponse) => {
    e.stopPropagation();
    if (!dragMoved.current && !isLocked(node)) {
      setSelectedNodeId(node.id);
      setSheetOpen(true);
      // XP for exploration
      if (!exploredRef.current.has(node.id)) {
        exploredRef.current.add(node.id);
        onNodeExplore(node.id, node.label);
      }
    }
    if (dragNodeRef.current) {
      dragNodeRef.current.fx = null;
      dragNodeRef.current.fy = null;
      simulationRef.current?.alphaTarget(0);
      dragNodeRef.current = null;
    }
  }, [isLocked, onNodeExplore]);

  // ── Daily goal indicator ──────────────────────────────────────────────────────

  const goalPct = Math.round((userGame.dailyProgress / userGame.dailyGoal) * 100);
  const remaining = Math.max(0, userGame.dailyGoal - userGame.dailyProgress);
  const tier = tierOf(userGame.level);
  const selectedNode = selectedNodeId === null ? null : displayNodes.find(n => n.id === selectedNodeId) ?? null;
  const selectedAdjacentIds = useMemo(() => {
    if (selectedNodeId === null) return new Set<number>();
    const set = new Set<number>([selectedNodeId]);
    displayEdges.forEach(e => {
      if (e.source === selectedNodeId) set.add(e.target);
      if (e.target === selectedNodeId) set.add(e.source);
    });
    return set;
  }, [selectedNodeId, displayEdges]);

  const relatedKeywords = useMemo(() => {
    if (selectedNodeId === null) return [];
    const ids = [...selectedAdjacentIds].filter(id => id !== selectedNodeId);
    return ids
      .map(id => displayNodes.find(n => n.id === id)?.label)
      .filter((label): label is string => Boolean(label))
      .slice(0, 5);
  }, [selectedAdjacentIds, selectedNodeId, displayNodes]);

  const quizCompleted = nodeSummary
    ? userGame.completedQuizzes.includes(nodeSummary.word)
    : false;
  const nodeNews = useMemo(() => newsForSummary(nodeSummary ?? null), [nodeSummary]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      position: 'relative', background: '#FFFFFF', overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', gap: 8, padding: '10px 16px 8px',
        overflowX: 'auto', flexShrink: 0, scrollbarWidth: 'none',
        background: '#FFFFFF',
      }}>
        {tabsLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.tabSkeleton} />
            ))
          : tabs.map(tab => {
              const active = highlightKeywordId === tab.keyword_id;
              return (
                <button
                  key={tab.keyword_id}
                  onClick={() => setHighlightKeywordId(prev => prev === tab.keyword_id ? null : tab.keyword_id)}
                  style={{
                    flexShrink: 0,
                    padding: '7px 14px',
                    borderRadius: 999,
                    border: 'none',
                    background: active ? '#0F1115' : '#F4F4F0',
                    color: active ? '#FFFFFF' : '#6B6B66',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {tab.word}
                </button>
              );
            })}
        <span style={{
          flexShrink: 0, fontSize: 10, fontWeight: 800, padding: '4px 9px',
          borderRadius: 999, alignSelf: 'center',
          background: isLiveData ? '#E8F4EA' : '#FFF1E2',
          color: isLiveData ? '#1E8460' : '#E8654D',
        }}>
          {isLiveData ? 'LIVE' : 'MOCK'}
        </span>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 16px 10px', flexShrink: 0,
        background: '#FFFFFF',
      }}>
        <span style={{ fontSize: 11, color: '#6B6B66', fontWeight: 700 }}>
          일일 목표
        </span>
        <div style={{
          flex: 1, height: 5,
          background: '#F1F1ED',
          borderRadius: 999, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${goalPct}%`,
            background: goalPct >= 100 ? '#7CE0B0' : tier.color,
            borderRadius: 999,
            transition: 'width 0.4s ease',
          }} />
        </div>
        <span style={{ fontSize: 11, color: '#6B6B66', fontWeight: 700, whiteSpace: 'nowrap' }}>
          {userGame.dailyProgress}/{userGame.dailyGoal}
        </span>
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#FFFFFF' }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(15,17,21,0.045) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          opacity: selectedNode ? 0.22 : 0.55,
          pointerEvents: 'none',
        }} />

        {graphLoading && (
          <div className={styles.graphLoader}>
            <div className={styles.spinner} />
          </div>
        )}

        {!graphLoading && (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            onPointerMove={onSvgPointerMove}
            onPointerUp={onSvgPointerUp}
            onPointerCancel={onSvgPointerUp}
            onWheel={onWheel}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            style={{ touchAction: 'none', width: '100%', height: '100%', display: 'block' }}
          >
            <defs>
              <filter id="soft-node-shadow" x="-80%" y="-80%" width="260%" height="260%">
                <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#0F1115" floodOpacity="0.18" />
              </filter>
            </defs>

            <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="transparent" onPointerDown={onBgPointerDown} />

            <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
              {displayEdges.map((edge, i) => {
                const src = positions.get(edge.source);
                const tgt = positions.get(edge.target);
                if (!src || !tgt) return null;
                const sourceNode = displayNodes.find(n => n.id === edge.source);
                const targetNode = displayNodes.find(n => n.id === edge.target);
                const lockedEdge = Boolean((sourceNode && isLocked(sourceNode)) || (targetNode && isLocked(targetNode)));
                const selectedEdge = selectedNodeId !== null && selectedAdjacentIds.has(edge.source) && selectedAdjacentIds.has(edge.target);
                return (
                  <line key={i}
                    x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                    stroke={lockedEdge ? '#EEEEEA' : selectedEdge ? tier.color : '#E6E6E2'}
                    strokeWidth={selectedEdge ? 1.4 : 1}
                    strokeOpacity={lockedEdge ? 0.5 : selectedEdge ? 0.95 : 1}
                    strokeDasharray={lockedEdge ? '3 3' : undefined}
                  />
                );
              })}

              {displayNodes.map(node => {
                const p = positions.get(node.id);
                if (!p) return null;
                const dot = nodeDot(node.score);
                const fontSize = nodeFontSize(node.score);
                const fontWeight = node.score >= 0.9 ? 800 : node.score >= 0.7 ? 700 : 600;
                const r = nodeRadius(node.score);
                const isSelected = node.id === selectedNodeId;
                const related = selectedNodeId !== null && selectedAdjacentIds.has(node.id) && !isSelected;
                const dimmed = isDimmed(node.id) && !isSelected && !related;
                const locked = isLocked(node);
                const unlocking = isUnlocking(node);
                const explored = exploredRef.current.has(node.id);
                const scrapped = scrappedNodes.has(node.id);
                const hitR = Math.max(22, dot + 8);
                const fill = locked
                  ? '#F4F4F0'
                  : scrapped
                    ? '#E8654D'
                    : isSelected
                      ? '#0F1115'
                      : related
                        ? tier.color
                        : explored
                          ? '#FFF1E2'
                          : personaSoftColor(node.persona);
                const stroke = locked
                  ? '#D8D8D2'
                  : scrapped
                    ? '#E8654D'
                    : isSelected
                      ? '#0F1115'
                      : related
                        ? tier.color
                        : explored
                          ? '#E8654D'
                          : personaStrokeColor(node.persona);
                const labelFill = locked
                  ? '#A8A8A4'
                  : scrapped
                    ? '#E8654D'
                    : related
                      ? tier.color
                      : explored
                        ? '#E8654D'
                        : '#0F1115';

                return (
                  <g key={node.id}
                    opacity={dimmed ? 0.42 : 1}
                    onMouseEnter={() => !locked && setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                  >
                    {related && (
                      <circle
                        className="nodingo-pulse"
                        cx={p.x} cy={p.y} r={dot + 5}
                        fill="none"
                        stroke={tier.color}
                        strokeWidth={2}
                        style={{ transformOrigin: `${p.x}px ${p.y}px`, pointerEvents: 'none' }}
                      />
                    )}
                    <circle
                      cx={p.x} cy={p.y} r={dot}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={isSelected ? 2 : 1.4}
                      filter={isSelected ? 'url(#soft-node-shadow)' : undefined}
                      style={{ pointerEvents: 'none' }}
                    />
                    <circle cx={p.x} cy={p.y} r={hitR}
                      fill="transparent"
                      style={{ cursor: locked ? 'not-allowed' : 'grab' }}
                      onPointerUp={e => onNodePointerUp(e, node)}
                    />
                    {locked ? (
                      <text
                        x={p.x} y={p.y + 4}
                        textAnchor="middle"
                        fontSize={8}
                        fill="#9A9A94"
                        style={{ userSelect: 'none', pointerEvents: 'none' }}
                      >
                        ●
                      </text>
                    ) : (
                      related && (
                        <circle
                          cx={p.x + dot * 0.6}
                          cy={p.y - dot * 0.58}
                          r={6}
                          fill="#FF5D7E"
                          stroke="#FFFFFF"
                          strokeWidth={2}
                          style={{ pointerEvents: 'none' }}
                        />
                      )
                    )}
                    {scrapped && !locked && (
                      <text
                        x={p.x}
                        y={p.y + 4}
                        textAnchor="middle"
                        fontSize={10}
                        fill="#FFFFFF"
                        fontWeight={900}
                        style={{ userSelect: 'none', pointerEvents: 'none' }}
                      >
                        ♥
                      </text>
                    )}
                    <text
                      x={p.x} y={p.y + dot + 13}
                      textAnchor="middle"
                      fontSize={fontSize}
                      fill={labelFill}
                      fontWeight={fontWeight}
                      letterSpacing="0"
                      style={{
                        userSelect: 'none',
                        pointerEvents: 'none',
                        textShadow: '0 0 6px rgba(255,255,255,0.95)',
                      }}
                    >
                      {displayLabel(node.label)}
                    </text>
                    {locked && <FogLayer cx={p.x} cy={p.y} r={r} />}
                    {unlocking && <UnlockAnimation cx={p.x} cy={p.y} r={r} color={tier.color} />}
                  </g>
                );
              })}
            </g>
          </svg>
        )}

        <button onClick={() => setTransform({ x: 0, y: 0, scale: 1 })} title="재중앙" style={{
          position: 'absolute',
          right: 16,
          bottom: sheetOpen ? 430 : 148,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: '#FFFFFF',
          border: '1px solid #E6E6E2',
          color: '#0F1115',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(15,17,21,0.10)',
          cursor: 'pointer',
          transition: 'bottom 240ms ease',
          zIndex: 40,
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
            <circle cx="12" cy="12" r="3" />
            <path d="M3 12h3M18 12h3M12 3v3M12 18v3" />
          </svg>
        </button>

        {!sheetOpen && (
          <div style={{
            position: 'absolute', bottom: 100, left: 0, right: 0,
            display: 'flex', justifyContent: 'center', pointerEvents: 'none',
          }}>
            <div style={{
              padding: '8px 14px',
              background: 'rgba(15,17,21,0.88)', color: '#fff',
              borderRadius: 999, fontSize: 11, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 8,
              animation: 'nodingo-toast 220ms ease both',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: 999,
                background: '#7CE0B0', boxShadow: '0 0 8px #7CE0B0',
              }} />
              오늘 퀴즈 <b>{remaining}</b>개 더 풀면 영수증 발급 🧾
            </div>
          </div>
        )}

        {sheetOpen && (
          <div style={{
            position: 'absolute',
            left: 0, right: 0, bottom: 0,
            height: 332,
            background: '#FFFFFF',
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            boxShadow: '0 -16px 38px rgba(15,17,21,0.18)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 70,
            animation: 'nodingo-sheet-in 420ms cubic-bezier(.2,.7,.2,1)',
          }}>
            <div style={{ padding: '8px 0 4px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 42, height: 4, borderRadius: 999, background: '#D8D8D2' }} />
            </div>

            {summaryLoading ? (
              <div className={styles.sheetLoader}><div className={styles.spinner} /></div>
            ) : nodeSummary ? (
              <>
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '4px 18px 10px',
                  borderBottom: '1px solid #EFEEEA',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 10.5, fontWeight: 800, color: '#6B6B66',
                      letterSpacing: '.06em', textTransform: 'uppercase',
                    }}>
                      <span>{nodeSummary.persona}</span>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: 999,
                        background: '#F4F4F0',
                        color: tier.color,
                        letterSpacing: 0,
                        textTransform: 'none',
                      }}>GraphRAG</span>
                    </div>
                    <div style={{
                      marginTop: 3,
                      fontSize: 22,
                      fontWeight: 900,
                      color: '#0F1115',
                      letterSpacing: '-0.03em',
                    }}>
                      {nodeSummary.word}
                    </div>
                  </div>
                  <button
                    onClick={() => scrapMutation.mutate({
                      id: selectedNodeId!,
                      label: nodeSummary.word,
                      persona: nodeSummary.persona,
                      summary: nodeSummary.summary,
                    })}
                    style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: scrappedNodes.has(selectedNodeId!) ? '#FFF1F3' : '#F4F4F0',
                      color: scrappedNodes.has(selectedNodeId!) ? '#E8657A' : '#6B6B66',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: 'none', cursor: 'pointer', flexShrink: 0,
                    }}
                    aria-label="스크랩"
                  >
                    <svg viewBox="0 0 24 24"
                      fill={scrappedNodes.has(selectedNodeId!) ? 'currentColor' : 'none'}
                      stroke="currentColor" strokeWidth="2.2" width="18" height="18">
                      <path d="M12 21s-7-4.35-9.4-8.25C.7 9.65 2.4 5.5 6.1 5.5c2.05 0 3.5 1.05 4.4 2.35C11.4 6.55 12.85 5.5 14.9 5.5c3.7 0 5.4 4.15 3.5 7.25C19 16.65 12 21 12 21z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSheetOpen(false)}
                    style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: '#F4F4F0',
                      color: '#6B6B66',
                      border: 'none', cursor: 'pointer',
                      fontSize: 20, lineHeight: 1,
                    }}
                    aria-label="닫기"
                  >
                    ×
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px 8px' }}>
                  <p style={{
                    fontSize: 13.5,
                    lineHeight: 1.68,
                    color: '#0F1115',
                    marginBottom: 12,
                  }}>
                    {renderBold(nodeSummary.summary)}
                  </p>

                  {nodeNews.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: '#6B6B66',
                        letterSpacing: '.06em',
                        textTransform: 'uppercase',
                        marginBottom: 7,
                      }}>
                        뉴스 원문 링크 · {nodeNews.length}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {nodeNews.slice(0, 4).map(news => {
                          const content = (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                {news.outlet && (
                                  <span style={{
                                    padding: '2px 7px',
                                    borderRadius: 999,
                                    background: '#0F1115',
                                    color: '#FFFFFF',
                                    fontSize: 9.5,
                                    fontWeight: 800,
                                  }}>
                                    {news.outlet}
                                  </span>
                                )}
                                {news.date && (
                                  <span style={{ fontSize: 10.5, color: '#6B6B66', fontWeight: 700 }}>
                                    {news.date}
                                  </span>
                                )}
                              </div>
                              <div style={{
                                fontSize: 12.5,
                                fontWeight: 800,
                                color: '#0F1115',
                                lineHeight: 1.38,
                                wordBreak: 'keep-all',
                              }}>
                                {news.title}
                              </div>
                              {news.snippet && (
                                <div style={{
                                  marginTop: 4,
                                  fontSize: 11.5,
                                  fontWeight: 500,
                                  color: '#4A4C50',
                                  lineHeight: 1.45,
                                  wordBreak: 'keep-all',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}>
                                  {news.snippet}
                                </div>
                              )}
                            </>
                          );

                          const cardStyle: CSSProperties = {
                            display: 'block',
                            background: '#FAF7F1',
                            border: '1px solid #EFEEEA',
                            borderRadius: 14,
                            padding: '10px 11px',
                            textDecoration: 'none',
                          };

                          return news.url ? (
                            <a
                              key={news.id}
                              href={news.url}
                              target="_blank"
                              rel="noreferrer"
                              style={cardStyle}
                            >
                              {content}
                            </a>
                          ) : (
                            <div key={news.id} style={cardStyle}>
                              {content}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {relatedKeywords.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {relatedKeywords.map(label => (
                        <span key={label} style={{
                          padding: '5px 9px',
                          borderRadius: 999,
                          background: '#F4F4F0',
                          color: '#6B6B66',
                          fontSize: 11,
                          fontWeight: 700,
                        }}>
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ padding: '10px 18px 16px', borderTop: '1px solid #EFEEEA' }}>
                  <button
                    onClick={() => {
                      if (quizCompleted) return;
                      setSheetOpen(false);
                      onQuizStart(nodeSummary.word);
                    }}
                    style={{
                      width: '100%', padding: '13px 0', borderRadius: 18,
                      background: quizCompleted ? '#E8F4EA' : tier.color,
                      color: quizCompleted ? '#1E8460' : '#fff',
                      border: 'none', cursor: quizCompleted ? 'default' : 'pointer',
                      fontSize: 14, fontWeight: 800,
                      boxShadow: quizCompleted ? 'none' : `0 4px 0 ${darken(tier.color)}`,
                    }}
                  >
                    {quizCompleted ? '✓ 오늘 완료 · +60 XP 받음' : '🎯 뉴스 기반 퀴즈 풀기  +60 XP'}
                  </button>
                </div>
              </>
            ) : (
              <p style={{ fontSize: 14, color: '#6B6B66', textAlign: 'center', padding: 32 }}>
                요약 정보가 없습니다.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
