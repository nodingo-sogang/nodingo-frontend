import type {
  TabListResponse,
  GraphDataResponse,
  NodeSummaryResponse,
  PersonaListResponse,
  KeywordListResponse,
} from '../types';

export const MOCK_TABS: TabListResponse = {
  tabs: [
    { id: 1, keyword: '금리', persona: 'ECONOMY' },
    { id: 2, keyword: 'AI 규제', persona: 'TECHNOLOGY' },
    { id: 3, keyword: '대선', persona: 'POLITICS' },
  ],
};

export const MOCK_GRAPH: Record<number, GraphDataResponse> = {
  1: {
    nodes: [
      { id: 101, label: '금리', score: 1.0, summary: '기준금리 정책의 핵심 키워드', persona: 'ECONOMY' },
      { id: 102, label: '한국은행', score: 0.8, summary: '대한민국 중앙은행', persona: 'ECONOMY' },
      { id: 103, label: '물가', score: 0.7, summary: '소비자물가지수(CPI) 동향', persona: 'ECONOMY' },
      { id: 104, label: '환율', score: 0.65, summary: '원/달러 환율 변동', persona: 'ECONOMY' },
      { id: 105, label: '통화정책', score: 0.75, summary: '금통위 통화정책 방향', persona: 'ECONOMY' },
      { id: 106, label: '수출', score: 0.55, summary: '반도체 수출 동향', persona: 'ECONOMY' },
      { id: 107, label: '부동산', score: 0.6, summary: '금리와 부동산 시장 연관성', persona: 'ECONOMY' },
      { id: 108, label: 'Fed', score: 0.7, summary: '미국 연방준비제도', persona: 'ECONOMY' },
      { id: 109, label: '인플레이션', score: 0.65, summary: '글로벌 인플레이션 현황', persona: 'ECONOMY' },
    ],
    edges: [
      { source: 101, target: 102, weight: 0.9 },
      { source: 101, target: 103, weight: 0.8 },
      { source: 101, target: 104, weight: 0.7 },
      { source: 101, target: 105, weight: 0.85 },
      { source: 101, target: 108, weight: 0.75 },
      { source: 102, target: 105, weight: 0.8 },
      { source: 103, target: 109, weight: 0.7 },
      { source: 104, target: 106, weight: 0.6 },
      { source: 105, target: 108, weight: 0.65 },
      { source: 107, target: 101, weight: 0.55 },
    ],
  },
  2: {
    nodes: [
      { id: 201, label: 'AI 규제', score: 1.0, summary: 'EU AI Act 및 국내 AI 규제 동향', persona: 'TECHNOLOGY' },
      { id: 202, label: 'ChatGPT', score: 0.85, summary: 'OpenAI의 대화형 AI 서비스', persona: 'TECHNOLOGY' },
      { id: 203, label: 'OpenAI', score: 0.8, summary: '생성형 AI 선도 기업', persona: 'TECHNOLOGY' },
      { id: 204, label: 'EU AI Act', score: 0.9, summary: '세계 최초 AI 포괄 규제법', persona: 'TECHNOLOGY' },
      { id: 205, label: '딥페이크', score: 0.7, summary: '생성형 AI 악용 사례', persona: 'TECHNOLOGY' },
      { id: 206, label: '네이버', score: 0.65, summary: '국내 AI 기술 선도 기업', persona: 'TECHNOLOGY' },
      { id: 207, label: '삼성', score: 0.6, summary: '온디바이스 AI 전략', persona: 'TECHNOLOGY' },
    ],
    edges: [
      { source: 201, target: 204, weight: 0.95 },
      { source: 201, target: 202, weight: 0.8 },
      { source: 202, target: 203, weight: 0.9 },
      { source: 201, target: 205, weight: 0.7 },
      { source: 206, target: 202, weight: 0.6 },
      { source: 207, target: 202, weight: 0.55 },
    ],
  },
  3: {
    nodes: [
      { id: 301, label: '대선', score: 1.0, summary: '2027 대통령 선거 주요 이슈', persona: 'POLITICS' },
      { id: 302, label: '여론조사', score: 0.75, summary: '주요 후보 지지율 동향', persona: 'POLITICS' },
      { id: 303, label: '공약', score: 0.7, summary: '주요 정당 핵심 공약 분석', persona: 'POLITICS' },
      { id: 304, label: '국민의힘', score: 0.8, summary: '여당 선거 전략', persona: 'POLITICS' },
      { id: 305, label: '민주당', score: 0.8, summary: '야당 선거 전략', persona: 'POLITICS' },
      { id: 306, label: '경제민주화', score: 0.6, summary: '경제 공약 핵심 키워드', persona: 'POLITICS' },
    ],
    edges: [
      { source: 301, target: 302, weight: 0.85 },
      { source: 301, target: 303, weight: 0.8 },
      { source: 304, target: 301, weight: 0.75 },
      { source: 305, target: 301, weight: 0.75 },
      { source: 303, target: 306, weight: 0.65 },
      { source: 302, target: 304, weight: 0.6 },
      { source: 302, target: 305, weight: 0.6 },
    ],
  },
};

export const MOCK_SUMMARIES: Record<number, NodeSummaryResponse> = {
  101: {
    keywordId: 101,
    word: '금리',
    persona: 'ECONOMY',
    summary:
      '한국은행 금융통화위원회가 기준금리를 연 3.5%로 동결했습니다. ' +
      '고물가와 경기 침체 우려 속에서 통화정책 방향에 시장의 이목이 집중되고 있으며, ' +
      '미국 Fed의 금리 인하 시기가 국내 통화정책에 미치는 영향이 주목됩니다.',
  },
  201: {
    keywordId: 201,
    word: 'AI 규제',
    persona: 'TECHNOLOGY',
    summary:
      'EU AI Act가 발효되며 글로벌 AI 규제 논의가 본격화됐습니다. ' +
      '국내에서도 생성형 AI 관련 법제화 논의가 진행 중이며, ' +
      '딥페이크·허위정보 확산을 막기 위한 정책적 대응이 시급하다는 여론이 높습니다.',
  },
  301: {
    keywordId: 301,
    word: '대선',
    persona: 'POLITICS',
    summary:
      '2027년 대통령 선거를 앞두고 여야 후보군 구도가 윤곽을 드러내고 있습니다. ' +
      '경제 민생 이슈가 핵심 공약 경쟁의 중심이 되고 있으며, ' +
      '여론조사 결과에 따라 후보 단일화 논의도 활발히 이루어지고 있습니다.',
  },
};

export const MOCK_PERSONAS: PersonaListResponse = {
  contents: [
    { name: 'ECONOMY', description: '경제·금융·산업 관련 뉴스' },
    { name: 'POLITICS', description: '정치·정책·선거 관련 뉴스' },
    { name: 'TECHNOLOGY', description: 'IT·AI·과학기술 관련 뉴스' },
    { name: 'SOCIETY', description: '사회·교육·복지 관련 뉴스' },
    { name: 'CULTURE', description: '문화·예술·스포츠 관련 뉴스' },
    { name: 'INTERNATIONAL', description: '국제·외교·글로벌 이슈' },
  ],
};

export const MOCK_MACRO: KeywordListResponse = {
  contents: [
    { id: 1001, word: '통화정책' },
    { id: 1002, word: '주식시장' },
    { id: 1003, word: '부동산' },
    { id: 1004, word: '무역' },
    { id: 1005, word: '반도체' },
    { id: 1006, word: '에너지' },
  ],
};

export const MOCK_SPECIFIC: KeywordListResponse = {
  contents: [
    { id: 2001, word: '기준금리' },
    { id: 2002, word: 'Fed' },
    { id: 2003, word: '양적완화' },
    { id: 2004, word: '인플레이션' },
    { id: 2005, word: '환율' },
    { id: 2006, word: '물가지수' },
  ],
};
