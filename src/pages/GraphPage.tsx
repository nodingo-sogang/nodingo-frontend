import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { graphApi } from '../api/graph';
import { newsApi } from '../api/news';
import { useAuthStore } from '../store/authStore';
import BottomNav, { type BottomNavTab } from '../components/layout/BottomNav';
import BottomSheet from '../components/common/BottomSheet';
import type { GraphNodeResponse, GraphEdgeResponse, NodeSummaryResponse } from '../types';
import { MOCK_TABS, MOCK_GRAPH, MOCK_SUMMARIES } from '../mocks';
import styles from './GraphPage.module.css';

// ─── Layout helpers ───────────────────────────────────────────────────────────

const SVG_W = 500;
const SVG_H = 540;

function layoutNodes(
  nodes: GraphNodeResponse[],
  edges: GraphEdgeResponse[],
): Map<number, { x: number; y: number }> {
  const pos = new Map<number, { x: number; y: number }>();
  if (nodes.length === 0) return pos;

  // Degree centrality to find hub nodes
  const degree = new Map<number, number>();
  edges.forEach(({ source, target }) => {
    degree.set(source, (degree.get(source) ?? 0) + 1);
    degree.set(target, (degree.get(target) ?? 0) + 1);
  });

  const sorted = [...nodes].sort(
    (a, b) => (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0),
  );

  const cx = SVG_W / 2;
  const cy = SVG_H / 2;
  const count = sorted.length;

  sorted.forEach((node, i) => {
    if (i === 0) {
      pos.set(node.id, { x: cx, y: cy });
    } else {
      const ring = Math.ceil(i / 6);
      const posInRing = ((i - 1) % 6) + 1;
      const total = Math.min(6, count - 6 * (ring - 1));
      const angle = ((posInRing - 1) / total) * 2 * Math.PI - Math.PI / 2;
      const r = ring * 130;
      pos.set(node.id, {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      });
    }
  });

  return pos;
}

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
  return 14 + score * 12;
}

// ─── GraphPage ─────────────────────────────────────────────────────────────────

export default function GraphPage() {
  const { logout } = useAuthStore();

  const [activeTab, setActiveTab] = useState<BottomNavTab>('graph');
  const [selectedKeywordId, setSelectedKeywordId] = useState<number | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [scrapped, setScrapped] = useState<Set<number>>(new Set());

  // Pan/zoom state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });
  const lastTransform = useRef(transform);
  const pinchDist = useRef<number | null>(null);

  // ── Queries ──────────────────────────────────────────────────────────────────

  const { data: tabsData, isLoading: tabsLoading } = useQuery({
    queryKey: ['tabs'],
    queryFn: () =>
      graphApi.getTabs().then((r) => r.data.data).catch(() => MOCK_TABS),
    placeholderData: MOCK_TABS,
  });

  const tabs = tabsData?.tabs ?? MOCK_TABS.tabs;

  // Auto-select first tab
  useEffect(() => {
    if (tabs.length > 0 && selectedKeywordId === null) {
      setSelectedKeywordId(tabs[0].id);
    }
  }, [tabs, selectedKeywordId]);

  const { data: graphData, isLoading: graphLoading } = useQuery({
    queryKey: ['graph', selectedKeywordId],
    queryFn: () =>
      graphApi
        .getGraphData(selectedKeywordId!)
        .then((r) => r.data.data)
        .catch(() => MOCK_GRAPH[selectedKeywordId!] ?? MOCK_GRAPH[1]),
    enabled: selectedKeywordId !== null,
    placeholderData: selectedKeywordId !== null
      ? (MOCK_GRAPH[selectedKeywordId] ?? MOCK_GRAPH[1])
      : undefined,
  });

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
    placeholderData: selectedNodeId !== null
      ? (MOCK_SUMMARIES[selectedNodeId] ?? null)
      : null,
  });

  // ── Mutations ────────────────────────────────────────────────────────────────

  const scrapMutation = useMutation({
    mutationFn: (newsId: number) =>
      scrapped.has(newsId) ? newsApi.unscrap(newsId) : newsApi.scrap(newsId),
    onSuccess: (_data, newsId) => {
      setScrapped((prev) => {
        const next = new Set(prev);
        if (next.has(newsId)) next.delete(newsId);
        else next.add(newsId);
        return next;
      });
    },
  });

  // ── Graph layout ─────────────────────────────────────────────────────────────

  const nodes = graphData?.nodes ?? [];
  const edges = graphData?.edges ?? [];
  const positions = layoutNodes(nodes, edges);

  // ── Pan/Zoom handlers ─────────────────────────────────────────────────────────

  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (e.target !== svgRef.current && !(e.target as Element).classList.contains('bg')) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX, y: e.clientY };
    lastTransform.current = transform;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }, [transform]);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!isPanning.current) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setTransform({
      ...lastTransform.current,
      x: lastTransform.current.x + dx,
      y: lastTransform.current.y + dy,
    });
  }, []);

  const onPointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  const onWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(3, Math.max(0.3, prev.scale * delta)),
    }));
  }, []);

  // Touch pinch
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
      const ratio = newDist / pinchDist.current;
      pinchDist.current = newDist;
      setTransform((prev) => ({
        ...prev,
        scale: Math.min(3, Math.max(0.3, prev.scale * ratio)),
      }));
    }
  }, []);

  // ── Node click ────────────────────────────────────────────────────────────────

  const onNodeClick = (nodeId: number) => {
    setSelectedNodeId(nodeId);
    setSheetOpen(true);
  };

  const handleRecenter = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

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
        <button className={styles.logoutBtn} onClick={logout}>로그아웃</button>
      </header>

      {/* Tab chips */}
      {activeTab === 'graph' && (
        <div className={styles.tabs}>
          {tabsLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.tabSkeleton} />
              ))
            : tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={[
                    styles.tab,
                    selectedKeywordId === tab.id ? styles.tabActive : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setSelectedKeywordId(tab.id)}
                >
                  {tab.keyword}
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
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onWheel={onWheel}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                style={{ touchAction: 'none' }}
              >
                {/* Click-through background */}
                <rect
                  className="bg"
                  x="0"
                  y="0"
                  width={SVG_W}
                  height={SVG_H}
                  fill="transparent"
                />
                <g
                  transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
                  style={{ transformOrigin: `${SVG_W / 2}px ${SVG_H / 2}px` }}
                >
                  {/* Edges */}
                  {edges.map((edge, i) => {
                    const src = positions.get(edge.source);
                    const tgt = positions.get(edge.target);
                    if (!src || !tgt) return null;
                    return (
                      <line
                        key={i}
                        x1={src.x}
                        y1={src.y}
                        x2={tgt.x}
                        y2={tgt.y}
                        stroke="#0066cc"
                        strokeWidth={Math.max(0.5, edge.weight * 2)}
                        strokeOpacity={0.2 + edge.weight * 0.3}
                      />
                    );
                  })}

                  {/* Nodes */}
                  {nodes.map((node) => {
                    const p = positions.get(node.id);
                    if (!p) return null;
                    const r = nodeRadius(node.score);
                    const color = nodeColor(node.persona);
                    const isSelected = node.id === selectedNodeId;

                    return (
                      <g
                        key={node.id}
                        className={styles.nodeGroup}
                        onClick={() => onNodeClick(node.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={r + 4}
                          fill={color}
                          fillOpacity={isSelected ? 0.2 : 0.1}
                        />
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={r}
                          fill={color}
                          fillOpacity={0.85}
                          stroke={isSelected ? '#fff' : color}
                          strokeWidth={isSelected ? 2.5 : 0}
                        />
                        <text
                          x={p.x}
                          y={p.y + 1}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={Math.max(9, r * 0.55)}
                          fill="#fff"
                          fontWeight="600"
                          style={{ userSelect: 'none', pointerEvents: 'none' }}
                        >
                          {node.label.length > 6 ? node.label.slice(0, 6) : node.label}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            )}

            {/* Recenter FAB */}
            <button className={styles.recenterFab} onClick={handleRecenter} title="재중앙">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M3 12h3M18 12h3M12 3v3M12 18v3" />
              </svg>
            </button>

            {/* Legend */}
            <div className={styles.legend}>
              {[
                ['경제', '#ff9f0a'],
                ['정치', '#0a84ff'],
                ['기술', '#30d158'],
                ['사회', '#bf5af2'],
                ['문화', '#ff453a'],
                ['국제', '#64d2ff'],
              ].map(([label, color]) => (
                <div key={label} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: color }} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'scrap' && (
          <div className={styles.emptyState}>
            <p>스크랩한 뉴스가 없어요</p>
            <p className={styles.emptyHint}>그래프에서 뉴스를 스크랩해보세요</p>
          </div>
        )}

        {activeTab === 'feed' && (
          <div className={styles.emptyState}>
            <p>피드 준비 중</p>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className={styles.profileTab}>
            <div className={styles.profileCard}>
              <div className={styles.profileAvatar}>N</div>
              <p className={styles.profileName}>Nodingo 사용자</p>
              <button
                className={styles.profileLogout}
                onClick={logout}
              >
                로그아웃
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <BottomNav active={activeTab} onChange={setActiveTab} />

      {/* Node Detail Sheet */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={summaryLoading ? '로딩 중...' : (nodeSummary?.word ?? '')}
      >
        {summaryLoading ? (
          <div className={styles.sheetLoader}>
            <div className={styles.spinner} />
          </div>
        ) : nodeSummary ? (
          <div className={styles.sheetContent}>
            <div className={styles.sheetMeta}>
              <span className={styles.sheetPersona}>{nodeSummary.persona}</span>
            </div>
            <p className={styles.sheetSummary}>{nodeSummary.summary}</p>

            <h4 className={styles.sheetNewsTitle}>관련 뉴스</h4>
            <NewsListForNode
              nodeId={selectedNodeId!}
              scrapped={scrapped}
              onScrap={(id) => scrapMutation.mutate(id)}
            />
          </div>
        ) : (
          <p className={styles.sheetEmpty}>요약 정보가 없습니다.</p>
        )}
      </BottomSheet>
    </div>
  );
}

// ─── NewsListForNode ───────────────────────────────────────────────────────────

function NewsListForNode({
  nodeId: _nodeId,
  scrapped: _scrapped,
  onScrap: _onScrap,
}: {
  nodeId: number;
  scrapped: Set<number>;
  onScrap: (id: number) => void;
}) {
  // In the current API there's no "news by node" list endpoint,
  // so we show a placeholder list that links to the node's related news
  // when that endpoint becomes available.
  return (
    <div className={styles.newsList}>
      <div className={styles.newsPlaceholder}>
        <p>이 노드와 연결된 뉴스 목록은 추후 제공될 예정입니다.</p>
        <p className={styles.emptyHint}>
          뉴스 ID를 알고 있다면 직접 스크랩할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
