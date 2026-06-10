import { apiClient } from './client';
import type { ApiResponse, NodeSummaryResponse } from '../types';

// Spring Slice 응답에서 content만 사용
interface SummarySlice {
  content: NodeSummaryResponse[];
  last?: boolean;
}
interface NodeSlice {
  content: { id: number; word: string; persona: string }[];
  last?: boolean;
}

// 스크랩 그래프(엣지 포함) — 백엔드 미테스트/명세 미정이라 필드명 흔들림 방어(word/label, weight 옵션)
interface ScrapGraphRaw {
  nodes: { id: number; word?: string; label?: string; persona?: string; score?: number }[];
  edges: { source: number; target: number; weight?: number }[];
}

export const scrapApi = {
  // 스크랩한 키워드 요약 목록 (보관함 카드용, 4개씩)
  getScrapSummaries: (page = 0) =>
    apiClient.get<ApiResponse<SummarySlice>>('/api/users/scraps/keywords/summaries', {
      params: { page },
    }),

  // 스크랩한 키워드 노드 목록 (그래프용, 20개씩)
  getScrapNodes: (page = 0) =>
    apiClient.get<ApiResponse<NodeSlice>>('/api/users/scraps/keywords/nodes', {
      params: { page },
    }),

  // 스크랩 그래프 (노드 + 엣지) — 신규. 실패/미배포 시 호출부에서 노드-only로 폴백
  getScrapGraph: () =>
    apiClient.get<ApiResponse<ScrapGraphRaw>>('/api/users/scraps/keywords/graph'),
};