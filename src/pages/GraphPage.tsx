import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useQuery, useQueries, useMutation } from '@tanstack/react-query';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  forceX,
  forceY,
} from 'd3-force';
import type { SimulationNodeDatum, SimulationLinkDatum, Simulation } from 'd3-force';
import { graphApi } from '../api/graph';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../hooks/useTheme';
import BottomNav, { type BottomNavTab } from '../components/layout/BottomNav';
import BottomSheet from '../components/common/BottomSheet';
import type { GraphNodeResponse, NodeSummaryResponse } from '../types';
import { MOCK_TABS, MOCK_GRAPH, MOCK_SUMMARIES } from '../mocks';
import styles from './GraphPage.module.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const SVG_W = 500;
const SVG_H = 540;

function nodeColor(persona: string): string {
  const map: Record<string, string> = {
    ECONOMY: '#ff9f0a',
    POLITICS: '#0a84ff',
    TECHNOLOGY: '#30d158',
    SOCIETY: '#bf5af2',
    CULTURE: '#ff453a',
    INTERNATIONAL: '#64d2ff',
  };
  return map[persona] ?? '#0066cc';
}

function nodeRadius(score: number): number {
  return 5 + score * 9;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type SimNode = GraphNodeResponse & SimulationNodeDatum;
type SimLink = SimulationLinkDatum<SimNode> & { weight: number };
type ScrappedNode = { id: number; label: string; persona: string; summary: string };

// ─── GraphPage ────────────────────────────────────────────────────────────────

export default function GraphPage() {
  const { logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<BottomNavTab>('graph');
  const [highlightKeywordId, setHighlightKeywordId] = useState<number | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scrappedNodes, setScrappedNodes] = useState<Map<number, ScrappedNode>>(new Map());

  // Pan/zoom
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const transformRef = useRef(transform);
  useEffect(() => { transformRef.current = transform; }, [transform]);

  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const lastTransform = useRef(transform);
  const pinchDist = useRef<number | null>(null);

  // Force simulation
  const simNodesRef = useRef<SimNode[]>([]);
  const simulationRef = useRef<Simulation<SimNode, SimLink> | null>(null);
  const [positions, setPositions] = useState<Map<number, { x: number; y: number }>>(new Map());

  // Drag
  const dragNodeRef = useRef<SimNode | null>(null);
  const dragMoved = useRef(false);

  // ── Queries ──────────────────────────────────────────────────────────────────

  const { data: tabsData, isLoading: tabsLoading } = useQuery({
    queryKey: ['tabs'],
    queryFn: () => graphApi.getTabs().then((r) => r.data.data).catch(() => MOCK_TABS),
    placeholderData: MOCK_TABS,
  });

  const tabs = tabsData?.tabs ?? MOCK_TABS.tabs;

  // 모든 탭의 그래프를 동시에 fetch
  const graphQueries = useQueries({
    queries: tabs.map((tab) => ({
      queryKey: ['graph', tab.keyword_id],
      queryFn: () =>
        graphApi
          .getGraphData(tab.keyword_id)
          .then((r) => r.data.data)
          .catch(() => MOCK_GRAPH[tab.keyword_id] ?? MOCK_GRAPH[1]),
      placeholderData: MOCK_GRAPH[tab.keyword_id] ?? MOCK_GRAPH[1],
    })),
  });

  const graphLoading = graphQueries.some((q) => q.isLoading && !q.data);

  // 노드/엣지 합산 (중복 제거) + 탭별 nodeId Set
  const { allNodes, allEdges, tabNodeIds } = useMemo(() => {
    const nodeMap = new Map<number, GraphNodeResponse>();
    const edgeKey = new Set<string>();
    const edges: { source: number; target: number; weight: number }[] = [];
    const tabNodeIds = new Map<number, Set<number>>();

    tabs.forEach((tab, i) => {
      const data = graphQueries[i]?.data;
      if (!data) return;

      const ids = new Set<number>();
      data.nodes.forEach((n) => { nodeMap.set(n.id, n); ids.add(n.id); });
      tabNodeIds.set(tab.keyword_id, ids);

      data.edges.forEach((e) => {
        const k = `${Math.min(e.source, e.target)}-${Math.max(e.source, e.target)}`;
        if (!edgeKey.has(k)) { edgeKey.add(k); edges.push(e); }
      });
    });

    return { allNodes: [...nodeMap.values()], allEdges: edges, tabNodeIds };
  }, [tabs, graphQueries]);

  const { data: nodeSummary, isLoading: summaryLoading } = useQuery<NodeSummaryResponse | null>({
    queryKey: ['nodeSummary', selectedNodeId],
    queryFn: async () => {
      if (!selectedNodeId) return null;
      return graphApi
        .getNodeSummary(selectedNodeId)
        .then((r) => r.data.data)
        .catch(() => MOCK_SUMMARIES[selectedNodeId] ?? null);
    },
    enabled: selectedNodeId !== null && sheetOpen,
    placeholderData: selectedNodeId !== null ? (MOCK_SUMMARIES[selectedNodeId] ?? null) : null,
  });

  // ── Scrap mutation ────────────────────────────────────────────────────────────

  const scrapMutation = useMutation({
    mutationFn: (node: ScrappedNode) =>
      scrappedNodes.has(node.id)
        ? graphApi.unscrapKeyword(node.id)
        : graphApi.scrapKeyword(node.id),
    onMutate: (node) => {
      setScrappedNodes((prev) => {
        const next = new Map(prev);
        if (next.has(node.id)) next.delete(node.id);
        else next.set(node.id, node);
        return next;
      });
    },
  });

  // ── Force simulation ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (allNodes.length === 0) return;

    simulationRef.current?.stop();

    const simNodes: SimNode[] = allNodes.map((n) => {
      const existing = simNodesRef.current.find((s) => s.id === n.id);
      return existing
        ? { ...n, x: existing.x ?? SVG_W / 2, y: existing.y ?? SVG_H / 2 }
        : { ...n, x: SVG_W / 2 + (Math.random() - 0.5) * 100, y: SVG_H / 2 + (Math.random() - 0.5) * 100 };
    });
    simNodesRef.current = simNodes;

    const simLinks: SimLink[] = allEdges.map((e) => ({
      source: e.source as unknown as SimNode,
      target: e.target as unknown as SimNode,
      weight: e.weight,
    }));

    // 노드 수에 따라 반발력 조정 (노드가 적을수록 약하게)
    const chargeStrength = Math.max(-200, -20 * Math.sqrt(simNodes.length));

    const sim = forceSimulation<SimNode>(simNodes)
      .force(
        'link',
        forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.id)
          .distance((l) => 80 + (1 - l.weight) * 40)
          .strength(0.5),
      )
      .force('charge', forceManyBody<SimNode>().strength(chargeStrength))
      .force('center', forceCenter<SimNode>(SVG_W / 2, SVG_H / 2).strength(0.15))
      .force('x', forceX<SimNode>(SVG_W / 2).strength(0.08))
      .force('y', forceY<SimNode>(SVG_H / 2).strength(0.08))
      .force('collide', forceCollide<SimNode>((d) => nodeRadius(d.score) + 8))
      .alphaDecay(0.025)
      .on('tick', () => {
        // 노드가 SVG 영역을 벗어나지 않도록 클램핑
        simNodesRef.current.forEach((n) => {
          const r = nodeRadius(n.score) + 8;
          n.x = Math.max(r, Math.min(SVG_W - r, n.x ?? SVG_W / 2));
          n.y = Math.max(r, Math.min(SVG_H - r, n.y ?? SVG_H / 2));
        });
        const map = new Map<number, { x: number; y: number }>();
        simNodesRef.current.forEach((n) => map.set(n.id, { x: n.x!, y: n.y! }));
        setPositions(new Map(map));
      });

    simulationRef.current = sim;
    return () => { sim.stop(); };
  }, [allNodes, allEdges]);

  // ── Highlight logic ───────────────────────────────────────────────────────────

  // 탭 하이라이트 대상 노드들
  const tabHighlightIds = useMemo(() => {
    if (highlightKeywordId === null) return null;
    return tabNodeIds.get(highlightKeywordId) ?? null;
  }, [highlightKeywordId, tabNodeIds]);

  // 호버 인접 노드들
  const hoverAdjacentIds = useMemo(() => {
    if (hoveredNodeId === null) return null;
    const set = new Set<number>([hoveredNodeId]);
    allEdges.forEach((e) => {
      if (e.source === hoveredNodeId) set.add(e.target);
      if (e.target === hoveredNodeId) set.add(e.source);
    });
    return set;
  }, [hoveredNodeId, allEdges]);

  function isDimmed(nodeId: number): boolean {
    // 호버 중이면 호버 기준 우선
    if (hoverAdjacentIds !== null) return !hoverAdjacentIds.has(nodeId);
    // 탭 하이라이트 중이면 탭 기준
    if (tabHighlightIds !== null) return !tabHighlightIds.has(nodeId);
    return false;
  }

  function isHighlighted(nodeId: number): boolean {
    if (hoverAdjacentIds !== null) return hoverAdjacentIds.has(nodeId);
    if (tabHighlightIds !== null) return tabHighlightIds.has(nodeId);
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

  // ── Pan handlers ──────────────────────────────────────────────────────────────

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
    setTransform((prev) => ({ ...prev, scale: Math.min(4, Math.max(0.2, prev.scale * delta)) }));
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
      setTransform((prev) => ({
        ...prev,
        scale: Math.min(4, Math.max(0.2, prev.scale * (newDist / pinchDist.current!))),
      }));
      pinchDist.current = newDist;
    }
  }, []);

  // ── Node drag handlers ────────────────────────────────────────────────────────

  const onNodePointerDown = useCallback((e: React.PointerEvent<SVGCircleElement>, node: SimNode) => {
    e.stopPropagation();
    dragNodeRef.current = node;
    dragMoved.current = false;
    node.fx = node.x;
    node.fy = node.y;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }, []);

  const onNodePointerUp = useCallback((e: React.PointerEvent<SVGCircleElement>, nodeId: number) => {
    e.stopPropagation();
    if (!dragMoved.current) {
      setSelectedNodeId(nodeId);
      setSheetOpen(true);
    }
    if (dragNodeRef.current) {
      dragNodeRef.current.fx = null;
      dragNodeRef.current.fy = null;
      simulationRef.current?.alphaTarget(0);
      dragNodeRef.current = null;
    }
  }, []);

  const handleRecenter = () => setTransform({ x: 0, y: 0, scale: 1 });

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <header className={styles.topBar}>
        <div className={styles.logo}>
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="4" fill="#2997ff" />
            <circle cx="4" cy="5" r="2.5" fill="#2997ff" opacity="0.7" />
            <circle cx="18" cy="5" r="2.5" fill="#2997ff" opacity="0.7" />
            <circle cx="4" cy="17" r="2.5" fill="#2997ff" opacity="0.7" />
            <circle cx="18" cy="17" r="2.5" fill="#2997ff" opacity="0.7" />
            <line x1="11" y1="11" x2="4" y2="5" stroke="#2997ff" strokeWidth="1.5" opacity="0.4" />
            <line x1="11" y1="11" x2="18" y2="5" stroke="#2997ff" strokeWidth="1.5" opacity="0.4" />
            <line x1="11" y1="11" x2="4" y2="17" stroke="#2997ff" strokeWidth="1.5" opacity="0.4" />
            <line x1="11" y1="11" x2="18" y2="17" stroke="#2997ff" strokeWidth="1.5" opacity="0.4" />
          </svg>
          <span>Nodingo</span>
        </div>
        <div className={styles.topBarActions}>
          <button className={styles.themeToggle} onClick={toggleTheme} title={theme === 'dark' ? '라이트 모드' : '다크 모드'}>
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>
          <button className={styles.logoutBtn} onClick={logout}>로그아웃</button>
        </div>
      </header>

      {/* Keyword filter chips */}
      {activeTab === 'graph' && (
        <div className={styles.tabs}>
          {tabsLoading
            ? Array.from({ length: 3 }).map((_, i) => <div key={i} className={styles.tabSkeleton} />)
            : tabs.map((tab) => (
                <button
                  key={tab.keyword_id}
                  className={[
                    styles.tab,
                    highlightKeywordId === tab.keyword_id ? styles.tabActive : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => setHighlightKeywordId((prev) => (prev === tab.keyword_id ? null : tab.keyword_id))}
                >
                  {tab.word}
                </button>
              ))}
        </div>
      )}

      {/* Main content */}
      <main className={styles.main}>
        {activeTab === 'graph' && (
          <>
            {graphLoading && (
              <div className={styles.graphLoader}>
                <div className={styles.spinner} />
              </div>
            )}

            {!graphLoading && (
              <svg
                ref={svgRef}
                className={styles.svg}
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                onPointerMove={onSvgPointerMove}
                onPointerUp={onSvgPointerUp}
                onPointerCancel={onSvgPointerUp}
                onWheel={onWheel}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                style={{ touchAction: 'none' }}
              >
                <defs>
                  {/* 노드 글로우: blur만 적용 → 자연스러운 그라디언트 페이드 */}
                  <filter id="node-glow" x="-200%" y="-200%" width="500%" height="500%">
                    <feGaussianBlur stdDeviation="7" />
                  </filter>
                  {/* 선택 시 추가 외곽 글로우 */}
                  <filter id="node-glow-lg" x="-250%" y="-250%" width="600%" height="600%">
                    <feGaussianBlur stdDeviation="12" />
                  </filter>
                  {/* 코어 흰 점 */}
                  <filter id="core-glow" x="-300%" y="-300%" width="700%" height="700%">
                    <feGaussianBlur stdDeviation="1.5" />
                  </filter>
                  {/* 하이라이트 엣지 */}
                  <filter id="edge-glow" x="-20%" y="-300%" width="140%" height="700%">
                    <feGaussianBlur stdDeviation="1.2" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="transparent" onPointerDown={onBgPointerDown} />

                <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
                  {/* Edges — 성좌선 */}
                  {allEdges.map((edge, i) => {
                    const src = positions.get(edge.source);
                    const tgt = positions.get(edge.target);
                    if (!src || !tgt) return null;
                    const srcDimmed = isDimmed(edge.source);
                    const tgtDimmed = isDimmed(edge.target);
                    const edgeDimmed = srcDimmed || tgtDimmed;
                    const edgeHighlighted = isHighlighted(edge.source) && isHighlighted(edge.target);

                    return (
                      <line
                        key={i}
                        x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                        stroke="#ffffff"
                        strokeWidth={edgeHighlighted ? edge.weight * 1.5 : 0.5}
                        strokeOpacity={edgeDimmed ? 0.03 : edgeHighlighted ? 0.45 : 0.1}
                        filter={edgeHighlighted ? 'url(#edge-glow)' : undefined}
                        style={{ transition: 'stroke-opacity 0.25s' }}
                      />
                    );
                  })}

                  {/* Nodes */}
                  {allNodes.map((node) => {
                    const p = positions.get(node.id);
                    if (!p) return null;
                    const r = nodeRadius(node.score);
                    const color = nodeColor(node.persona);
                    const isSelected = node.id === selectedNodeId;
                    const dimmed = isDimmed(node.id);
                    const highlighted = isHighlighted(node.id);
                    const hovered = hoveredNodeId === node.id;
                    const simNode = simNodesRef.current.find((s) => s.id === node.id)!;

                    // 글로우 원 반지름 (blur로 자연스럽게 페이드)
                    const glowR = r * 1.6;
                    const coreR = Math.max(1, r * 0.2);
                    // 히트 영역
                    const hitR = Math.max(14, glowR);

                    return (
                      <g key={node.id}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                      >
                        {/* 선택 시 외곽 후광 */}
                        {isSelected && (
                          <circle cx={p.x} cy={p.y} r={glowR * 1.8}
                            fill={color} fillOpacity={0.25}
                            filter="url(#node-glow-lg)"
                            style={{ pointerEvents: 'none' }}
                          />
                        )}

                        {/* 메인 글로우 — blur 처리된 원 하나 → 중심에서 투명하게 퍼짐 */}
                        <circle cx={p.x} cy={p.y} r={glowR}
                          fill={color}
                          fillOpacity={
                            dimmed        ? 0.06
                            : isSelected  ? 0.9
                            : highlighted ? 0.75
                            : hovered     ? 0.65
                            :               0.5
                          }
                          filter="url(#node-glow)"
                          style={{ transition: 'fill-opacity 0.2s', pointerEvents: 'none' }}
                        />

                        {/* 히트 영역 (투명, 넓게) */}
                        <circle cx={p.x} cy={p.y} r={hitR}
                          fill="transparent"
                          style={{ cursor: 'grab' }}
                          onPointerDown={(e) => onNodePointerDown(e, simNode)}
                          onPointerUp={(e) => onNodePointerUp(e, node.id)}
                        />

                        {/* 밝은 흰 코어 점 */}
                        <circle cx={p.x} cy={p.y} r={coreR}
                          fill="#ffffff"
                          fillOpacity={dimmed ? 0.15 : 1}
                          filter="url(#core-glow)"
                          style={{ transition: 'fill-opacity 0.2s', pointerEvents: 'none' }}
                        />

                        {/* 라벨 — 호버된 노드 + 인접 노드 + 선택된 노드에만 표시 */}
                        {(isSelected || (hoverAdjacentIds !== null && hoverAdjacentIds.has(node.id))) && (
                          <text
                            x={p.x} y={p.y + glowR + 13}
                            textAnchor="middle"
                            fontSize={11}
                            fill="#ffffff"
                            fillOpacity={isSelected ? 1 : 0.9}
                            fontWeight="500"
                            letterSpacing="0.2"
                            style={{ userSelect: 'none', pointerEvents: 'none' }}
                          >
                            {node.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>
            )}

            <button className={styles.recenterFab} onClick={handleRecenter} title="재중앙">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M3 12h3M18 12h3M12 3v3M12 18v3" />
              </svg>
            </button>

            <div className={styles.legend}>
              {[
                ['경제', '#ff9f0a'], ['정치', '#0a84ff'], ['기술', '#30d158'],
                ['사회', '#bf5af2'], ['문화', '#ff453a'], ['국제', '#64d2ff'],
              ].map(([label, color]) => (
                <div key={label} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: color, boxShadow: `0 0 5px 1px ${color}` }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'scrap' && (
          scrappedNodes.size === 0 ? (
            <div className={styles.emptyState}>
              <p>스크랩한 키워드가 없어요</p>
              <p className={styles.emptyHint}>그래프에서 노드를 스크랩해보세요</p>
            </div>
          ) : (
            <div className={styles.scrapList}>
              {[...scrappedNodes.values()].map((node) => (
                <div key={node.id} className={styles.scrapCard}>
                  <div className={styles.scrapCardHeader}>
                    <div className={styles.scrapCardLabel}>
                      <span className={styles.scrapCardDot} style={{ background: nodeColor(node.persona) }} />
                      <span className={styles.scrapCardWord}>{node.label}</span>
                      <span className={styles.scrapCardPersona}>{node.persona}</span>
                    </div>
                    <button className={styles.unscrapBtn} onClick={() => scrapMutation.mutate(node)}>해제</button>
                  </div>
                  <p className={styles.scrapCardSummary}>{node.summary}</p>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'feed' && (
          <div className={styles.emptyState}><p>피드 준비 중</p></div>
        )}

        {activeTab === 'profile' && (
          <div className={styles.profileTab}>
            <div className={styles.profileCard}>
              <div className={styles.profileAvatar}>N</div>
              <p className={styles.profileName}>Nodingo 사용자</p>
              <button className={styles.profileLogout} onClick={logout}>로그아웃</button>
            </div>
          </div>
        )}
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} />

      {/* Node detail sheet */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={summaryLoading ? '로딩 중...' : (nodeSummary?.word ?? '')}
      >
        {summaryLoading ? (
          <div className={styles.sheetLoader}><div className={styles.spinner} /></div>
        ) : nodeSummary ? (
          <div className={styles.sheetContent}>
            <div className={styles.sheetMeta}>
              <span className={styles.sheetPersona}>{nodeSummary.persona}</span>
              <button
                className={`${styles.scrapBtn} ${scrappedNodes.has(selectedNodeId!) ? styles.scrapBtnActive : ''}`}
                onClick={() => scrapMutation.mutate({
                  id: selectedNodeId!,
                  label: nodeSummary.word,
                  persona: nodeSummary.persona,
                  summary: nodeSummary.summary,
                })}
              >
                <svg viewBox="0 0 24 24" fill={scrappedNodes.has(selectedNodeId!) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
                {scrappedNodes.has(selectedNodeId!) ? '스크랩됨' : '스크랩'}
              </button>
            </div>
            <p className={styles.sheetSummary}>{nodeSummary.summary}</p>
          </div>
        ) : (
          <p className={styles.sheetEmpty}>요약 정보가 없습니다.</p>
        )}
      </BottomSheet>
    </div>
  );
}
