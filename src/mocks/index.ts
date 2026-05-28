import type {
  TabListResponse,
  GraphDataResponse,
  NodeSummaryResponse,
  PersonaListResponse,
  KeywordListResponse,
} from '../types';
import type { Tier, Badge, UserGame, RankingEntry } from '../types/game';

// ─── Tabs ─────────────────────────────────────────────────────────────────────

export const MOCK_TABS: TabListResponse = {
  tabs: [
    { keyword_id: 1, word: '금리', persona: 'ECONOMY' },
    { keyword_id: 2, word: 'AI 규제', persona: 'TECHNOLOGY' },
    { keyword_id: 3, word: '대선', persona: 'POLITICS' },
    { keyword_id: 4, word: '복지정책', persona: 'SOCIETY' },
    { keyword_id: 5, word: '미중관계', persona: 'INTERNATIONAL' },
  ],
};

// ─── Graph data ───────────────────────────────────────────────────────────────
//
// Cross-graph shared nodes (same id → deduped in allNodes, edges merged):
//   104  환율       ECONOMY      — tabs 1, 5
//   501  삼성전자   TECHNOLOGY   — tabs 1, 2
//   502  반도체     TECHNOLOGY   — tabs 1, 2, 5
//   503  일자리     SOCIETY      — tabs 2, 4
//   507  복지예산   ECONOMY      — tabs 1, 4
//   509  청년정책   SOCIETY      — tabs 3, 4

export const MOCK_GRAPH: Record<number, GraphDataResponse> = {
  // ── Tab 1: 금리 ─────────────────────────────────────────────────────────────
  1: {
    nodes: [
      { id: 101, label: '금리',      score: 1.00, summary: '', persona: 'ECONOMY' },
      { id: 102, label: '한국은행',  score: 0.80, summary: '', persona: 'ECONOMY' },
      { id: 103, label: '물가',      score: 0.72, summary: '', persona: 'ECONOMY' },
      { id: 104, label: '환율',      score: 0.65, summary: '', persona: 'ECONOMY' },
      { id: 105, label: '통화정책',  score: 0.78, summary: '', persona: 'ECONOMY' },
      { id: 106, label: '수출',      score: 0.58, summary: '', persona: 'ECONOMY' },
      { id: 107, label: '부동산',    score: 0.62, summary: '', persona: 'ECONOMY' },
      { id: 108, label: 'Fed',       score: 0.70, summary: '', persona: 'INTERNATIONAL' },
      { id: 109, label: '인플레이션', score: 0.68, summary: '', persona: 'ECONOMY' },
      { id: 110, label: '주식시장',  score: 0.60, summary: '', persona: 'ECONOMY' },
      { id: 111, label: '가계부채',  score: 0.55, summary: '', persona: 'SOCIETY' },
      { id: 501, label: '삼성전자',  score: 0.52, summary: '', persona: 'TECHNOLOGY' },
      { id: 502, label: '반도체',    score: 0.60, summary: '', persona: 'TECHNOLOGY' },
      { id: 507, label: '복지예산',  score: 0.48, summary: '', persona: 'SOCIETY' },
    ],
    edges: [
      { source: 101, target: 102, weight: 0.90 },
      { source: 101, target: 103, weight: 0.80 },
      { source: 101, target: 104, weight: 0.72 },
      { source: 101, target: 105, weight: 0.88 },
      { source: 101, target: 108, weight: 0.78 },
      { source: 102, target: 105, weight: 0.82 },
      { source: 103, target: 109, weight: 0.72 },
      { source: 104, target: 106, weight: 0.62 },
      { source: 105, target: 108, weight: 0.68 },
      { source: 107, target: 101, weight: 0.58 },
      { source: 110, target: 101, weight: 0.60 },
      { source: 111, target: 107, weight: 0.50 },
      { source: 502, target: 106, weight: 0.55 },
      { source: 501, target: 502, weight: 0.75 },
      { source: 507, target: 102, weight: 0.42 },
    ],
  },

  // ── Tab 2: AI 규제 ───────────────────────────────────────────────────────────
  2: {
    nodes: [
      { id: 201, label: 'AI 규제',     score: 1.00, summary: '', persona: 'TECHNOLOGY' },
      { id: 202, label: 'ChatGPT',     score: 0.85, summary: '', persona: 'TECHNOLOGY' },
      { id: 203, label: 'OpenAI',      score: 0.82, summary: '', persona: 'TECHNOLOGY' },
      { id: 204, label: 'EU AI Act',   score: 0.88, summary: '', persona: 'POLITICS' },
      { id: 205, label: '딥페이크',    score: 0.70, summary: '', persona: 'TECHNOLOGY' },
      { id: 206, label: '네이버',      score: 0.65, summary: '', persona: 'TECHNOLOGY' },
      { id: 207, label: '구글',        score: 0.60, summary: '', persona: 'INTERNATIONAL' },
      { id: 208, label: '개인정보보호', score: 0.62, summary: '', persona: 'SOCIETY' },
      { id: 209, label: '스타트업',    score: 0.55, summary: '', persona: 'ECONOMY' },
      { id: 501, label: '삼성전자',    score: 0.58, summary: '', persona: 'TECHNOLOGY' },
      { id: 502, label: '반도체',      score: 0.65, summary: '', persona: 'TECHNOLOGY' },
      { id: 503, label: '일자리',      score: 0.60, summary: '', persona: 'SOCIETY' },
    ],
    edges: [
      { source: 201, target: 204, weight: 0.95 },
      { source: 201, target: 202, weight: 0.82 },
      { source: 202, target: 203, weight: 0.92 },
      { source: 201, target: 205, weight: 0.72 },
      { source: 206, target: 202, weight: 0.62 },
      { source: 207, target: 202, weight: 0.58 },
      { source: 201, target: 208, weight: 0.68 },
      { source: 209, target: 203, weight: 0.55 },
      { source: 501, target: 202, weight: 0.60 },
      { source: 501, target: 502, weight: 0.75 },
      { source: 503, target: 201, weight: 0.65 },
      { source: 208, target: 503, weight: 0.55 },
    ],
  },

  // ── Tab 3: 대선 ─────────────────────────────────────────────────────────────
  3: {
    nodes: [
      { id: 301, label: '대선',      score: 1.00, summary: '', persona: 'POLITICS' },
      { id: 302, label: '여론조사',  score: 0.75, summary: '', persona: 'POLITICS' },
      { id: 303, label: '공약',      score: 0.72, summary: '', persona: 'POLITICS' },
      { id: 304, label: '국민의힘',  score: 0.80, summary: '', persona: 'POLITICS' },
      { id: 305, label: '민주당',    score: 0.80, summary: '', persona: 'POLITICS' },
      { id: 306, label: '경제민주화', score: 0.62, summary: '', persona: 'ECONOMY' },
      { id: 307, label: '후보단일화', score: 0.68, summary: '', persona: 'POLITICS' },
      { id: 308, label: '탄핵정국',  score: 0.70, summary: '', persona: 'POLITICS' },
      { id: 309, label: '선거법',    score: 0.55, summary: '', persona: 'POLITICS' },
      { id: 310, label: '외교정책',  score: 0.52, summary: '', persona: 'INTERNATIONAL' },
      { id: 509, label: '청년정책',  score: 0.58, summary: '', persona: 'SOCIETY' },
    ],
    edges: [
      { source: 301, target: 302, weight: 0.85 },
      { source: 301, target: 303, weight: 0.80 },
      { source: 304, target: 301, weight: 0.78 },
      { source: 305, target: 301, weight: 0.78 },
      { source: 303, target: 306, weight: 0.65 },
      { source: 302, target: 304, weight: 0.62 },
      { source: 302, target: 305, weight: 0.62 },
      { source: 301, target: 307, weight: 0.70 },
      { source: 308, target: 301, weight: 0.72 },
      { source: 309, target: 301, weight: 0.55 },
      { source: 509, target: 303, weight: 0.60 },
      { source: 310, target: 301, weight: 0.50 },
    ],
  },

  // ── Tab 4: 복지정책 ──────────────────────────────────────────────────────────
  4: {
    nodes: [
      { id: 401, label: '복지정책',   score: 1.00, summary: '', persona: 'SOCIETY' },
      { id: 402, label: '국민연금',   score: 0.82, summary: '', persona: 'SOCIETY' },
      { id: 403, label: '의료개혁',   score: 0.78, summary: '', persona: 'SOCIETY' },
      { id: 404, label: '저출생',     score: 0.75, summary: '', persona: 'SOCIETY' },
      { id: 405, label: '육아지원',   score: 0.70, summary: '', persona: 'SOCIETY' },
      { id: 406, label: '기초생활수급', score: 0.60, summary: '', persona: 'SOCIETY' },
      { id: 407, label: '교육격차',   score: 0.62, summary: '', persona: 'SOCIETY' },
      { id: 408, label: '사회보험',   score: 0.55, summary: '', persona: 'ECONOMY' },
      { id: 409, label: '노인복지',   score: 0.58, summary: '', persona: 'SOCIETY' },
      { id: 503, label: '일자리',     score: 0.65, summary: '', persona: 'SOCIETY' },
      { id: 507, label: '복지예산',   score: 0.68, summary: '', persona: 'ECONOMY' },
      { id: 509, label: '청년정책',   score: 0.72, summary: '', persona: 'SOCIETY' },
    ],
    edges: [
      { source: 401, target: 402, weight: 0.88 },
      { source: 401, target: 403, weight: 0.80 },
      { source: 401, target: 404, weight: 0.78 },
      { source: 401, target: 405, weight: 0.75 },
      { source: 402, target: 507, weight: 0.70 },
      { source: 404, target: 405, weight: 0.72 },
      { source: 503, target: 401, weight: 0.68 },
      { source: 507, target: 401, weight: 0.70 },
      { source: 509, target: 401, weight: 0.75 },
      { source: 406, target: 401, weight: 0.62 },
      { source: 407, target: 404, weight: 0.58 },
      { source: 408, target: 402, weight: 0.55 },
      { source: 409, target: 401, weight: 0.60 },
      { source: 503, target: 407, weight: 0.50 },
      { source: 509, target: 404, weight: 0.65 },
    ],
  },

  // ── Tab 5: 미중관계 ──────────────────────────────────────────────────────────
  5: {
    nodes: [
      { id: 601, label: '미중관계',  score: 1.00, summary: '', persona: 'INTERNATIONAL' },
      { id: 602, label: '관세전쟁',  score: 0.82, summary: '', persona: 'ECONOMY' },
      { id: 603, label: '대만',      score: 0.78, summary: '', persona: 'INTERNATIONAL' },
      { id: 604, label: '반도체전쟁', score: 0.80, summary: '', persona: 'INTERNATIONAL' },
      { id: 605, label: 'NATO',      score: 0.65, summary: '', persona: 'INTERNATIONAL' },
      { id: 606, label: '우크라이나', score: 0.62, summary: '', persona: 'INTERNATIONAL' },
      { id: 607, label: '에너지',    score: 0.58, summary: '', persona: 'INTERNATIONAL' },
      { id: 608, label: '달러패권',  score: 0.68, summary: '', persona: 'ECONOMY' },
      { id: 609, label: '한중관계',  score: 0.60, summary: '', persona: 'INTERNATIONAL' },
      { id: 610, label: '트럼프',    score: 0.75, summary: '', persona: 'POLITICS' },
      { id: 104, label: '환율',      score: 0.65, summary: '', persona: 'ECONOMY' },
      { id: 502, label: '반도체',    score: 0.72, summary: '', persona: 'TECHNOLOGY' },
    ],
    edges: [
      { source: 601, target: 602, weight: 0.85 },
      { source: 601, target: 603, weight: 0.80 },
      { source: 601, target: 604, weight: 0.85 },
      { source: 604, target: 502, weight: 0.82 },
      { source: 604, target: 603, weight: 0.75 },
      { source: 602, target: 104, weight: 0.70 },
      { source: 608, target: 601, weight: 0.72 },
      { source: 608, target: 104, weight: 0.60 },
      { source: 605, target: 601, weight: 0.62 },
      { source: 606, target: 601, weight: 0.60 },
      { source: 607, target: 601, weight: 0.58 },
      { source: 610, target: 601, weight: 0.78 },
      { source: 610, target: 603, weight: 0.72 },
      { source: 609, target: 601, weight: 0.65 },
    ],
  },
};

// ─── Summaries ────────────────────────────────────────────────────────────────

export const MOCK_SUMMARIES: Record<number, NodeSummaryResponse> = {
  // ── 금리 클러스터 ──────────────────────────────────────────────────────────
  101: {
    keyword_id: 101, word: '금리', persona: 'ECONOMY',
    summary: '한국은행 금통위가 기준금리를 연 3.5%로 동결했습니다. 고물가·경기 둔화 우려 속에서 인하 시점에 대한 시장 기대가 높아지고 있으며, Fed의 통화정책 방향이 국내 금리 결정에 핵심 변수로 작용하고 있습니다.',
    news: [
      { id: 9001, title: '한은, 기준금리 3.5% 동결…"물가 목표 수렴 전까지 신중"', outlet: 'Nodingo News', date: '2025.05.20', url: 'https://example.com/news/9001', snippet: '금통위는 물가가 목표 수준에 안정적으로 수렴하기 전까지 통화정책을 신중하게 운용하겠다고 밝혔다.' },
      { id: 9002, title: 'Fed 금리 동결에 원/달러 환율 1,360원대 유지', outlet: 'Market Brief', date: '2025.05.21', url: 'https://example.com/news/9002', snippet: '미국 금리 인하 지연 가능성이 커지며 원/달러 환율은 1,360원대에서 등락했다.' },
      { id: 9003, title: '시장 "연내 금리 인하 2회" 전망 유지…빅스텝 가능성은 낮아', outlet: 'Economy Daily', date: '2025.05.22', url: 'https://example.com/news/9003', snippet: '시장 참가자들은 경기 둔화와 물가 흐름을 근거로 연내 완만한 인하 가능성을 보고 있다.' },
    ],
  },
  102: {
    keyword_id: 102, word: '한국은행', persona: 'ECONOMY',
    summary: '한국은행은 물가 안정과 금융 안정을 이중 목표로 삼아 통화정책을 운용합니다. 최근 총재는 "섣부른 금리 인하는 자산 버블을 자극할 수 있다"며 신중한 입장을 유지하고 있습니다.',
  },
  103: {
    keyword_id: 103, word: '물가', persona: 'ECONOMY',
    summary: '소비자물가지수(CPI)가 전년 대비 2.3% 상승하며 한국은행 목표치(2%)에 근접했습니다. 에너지·식료품 가격 안정이 물가 하락을 이끌었으나 서비스 물가는 여전히 높은 수준입니다.',
  },
  104: {
    keyword_id: 104, word: '환율', persona: 'ECONOMY',
    summary: '원/달러 환율이 1,360원대에서 등락 중입니다. 미국 금리 인하 지연 우려와 무역수지 개선이 상충하며 변동성이 높아지고 있으며, 수출 기업 실적에 직접적인 영향을 미치고 있습니다.',
  },
  105: {
    keyword_id: 105, word: '통화정책', persona: 'ECONOMY',
    summary: '금통위는 경기 회복과 물가 안정 사이에서 통화정책 방향 설정에 고심하고 있습니다. 내수 부진이 지속될 경우 연내 금리 인하 가능성이 열려있다는 전망이 우세합니다.',
  },
  106: {
    keyword_id: 106, word: '수출', persona: 'ECONOMY',
    summary: '반도체 수출 회복에 힘입어 3개월 연속 무역수지 흑자를 기록했습니다. 다만 대중국 수출 감소와 글로벌 수요 불확실성이 회복 속도를 제한하고 있습니다.',
  },
  107: {
    keyword_id: 107, word: '부동산', persona: 'ECONOMY',
    summary: '금리 동결 장기화로 서울 아파트 거래량이 소폭 증가했습니다. 전문가들은 금리 인하 신호가 본격화될 경우 매수 심리가 빠르게 회복될 수 있다고 경고합니다.',
  },
  108: {
    keyword_id: 108, word: 'Fed', persona: 'INTERNATIONAL',
    summary: '미국 연방준비제도(Fed)가 금리를 5.25~5.5%로 유지하며 "데이터에 기반한 결정"을 강조했습니다. 시장은 연내 2회 인하를 전망하고 있으나, 고용 지표 호조로 인하 시점이 늦춰질 가능성도 있습니다.',
  },
  109: {
    keyword_id: 109, word: '인플레이션', persona: 'ECONOMY',
    summary: '글로벌 인플레이션이 정점을 지나 하락 추세에 있으나, 서비스 인플레이션은 여전히 끈적한(sticky) 모습을 보입니다. 에너지 가격 재급등 여부가 핵심 리스크로 꼽힙니다.',
  },
  110: {
    keyword_id: 110, word: '주식시장', persona: 'ECONOMY',
    summary: '코스피가 2,600선에서 공방 중입니다. 미국 금리 방향성 불확실성과 기업 실적 개선 기대가 맞서며 방향성이 불분명한 상황입니다. 외국인 순매수 여부가 단기 변수입니다.',
  },
  111: {
    keyword_id: 111, word: '가계부채', persona: 'SOCIETY',
    summary: '가계부채가 GDP 대비 100%를 넘어 세계 최고 수준을 유지하고 있습니다. 금리 인하 시 부채 증가 재가속 우려가 있어, 한국은행이 인하 속도 조절의 근거로 제시하는 주요 요인입니다.',
  },
  // ── AI 규제 클러스터 ──────────────────────────────────────────────────────
  201: {
    keyword_id: 201, word: 'AI 규제', persona: 'TECHNOLOGY',
    summary: 'EU AI Act 시행을 계기로 글로벌 AI 규제 논의가 본격화됐습니다. 국내에서도 생성형 AI 법제화 논의가 진행 중이며, 딥페이크·허위정보 확산을 막기 위한 정책 대응 필요성이 부각되고 있습니다.',
    news: [
      { id: 9010, title: 'EU AI Act 본격 시행…고위험 AI 시스템에 엄격한 규제 적용', outlet: 'AI Policy', date: '2025.05.18', url: 'https://example.com/news/9010', snippet: 'EU AI Act는 고위험 AI 시스템에 대해 투명성, 안전성, 사후 관리 의무를 요구한다.' },
      { id: 9011, title: '국내 AI기본법 국회 통과 임박…산업계 "규제 완화" 촉구', outlet: 'Tech Law', date: '2025.05.19', url: 'https://example.com/news/9011', snippet: '국내 AI기본법 논의에서는 산업 육성과 이용자 보호 사이의 균형이 핵심 쟁점으로 떠올랐다.' },
      { id: 9012, title: 'OpenAI·구글, EU 규정 대응에 연 수천억 투입 예정', outlet: 'Global Tech', date: '2025.05.20', url: 'https://example.com/news/9012', snippet: '글로벌 AI 기업들은 EU 시장 대응을 위해 컴플라이언스 조직과 모델 관리 체계를 강화하고 있다.' },
    ],
  },
  202: {
    keyword_id: 202, word: 'ChatGPT', persona: 'TECHNOLOGY',
    summary: 'OpenAI의 ChatGPT가 월간 활성 사용자 2억 명을 돌파했습니다. 기업용 서비스 확대와 함께 교육·의료·법률 분야 도입이 빨라지고 있으며, 개인정보 처리 방식이 각국 규제 기관의 주목을 받고 있습니다.',
  },
  203: {
    keyword_id: 203, word: 'OpenAI', persona: 'TECHNOLOGY',
    summary: 'OpenAI가 GPT-5 출시를 준비 중이라는 보도가 이어지고 있습니다. 마이크로소프트와의 파트너십을 통해 기업 AI 시장 점유율을 높이는 전략을 취하고 있으며, 경쟁사 Google·Anthropic과의 격차 유지가 관건입니다.',
  },
  204: {
    keyword_id: 204, word: 'EU AI Act', persona: 'POLITICS',
    summary: '세계 최초의 포괄적 AI 규제법인 EU AI Act가 발효됐습니다. 고위험 AI 시스템에 대한 엄격한 규제를 담고 있으며, 글로벌 기업들은 EU 시장 진입을 위해 컴플라이언스 체계를 갖추는 데 막대한 비용을 투입하고 있습니다.',
  },
  205: {
    keyword_id: 205, word: '딥페이크', persona: 'TECHNOLOGY',
    summary: '생성형 AI를 활용한 딥페이크 범죄가 급증하고 있습니다. 특히 불법 합성물 제작과 선거 개입 우려가 커지며, 국내외 플랫폼에 딥페이크 탐지·차단 의무를 부과하는 입법이 추진되고 있습니다.',
  },
  206: {
    keyword_id: 206, word: '네이버', persona: 'TECHNOLOGY',
    summary: '네이버가 자체 개발 AI 모델 "하이퍼클로바X"를 앞세워 기업용 AI 시장 공략을 강화하고 있습니다. 검색·쇼핑·클라우드 사업에 AI를 접목해 글로벌 빅테크와의 차별화를 모색 중입니다.',
  },
  207: {
    keyword_id: 207, word: '구글', persona: 'INTERNATIONAL',
    summary: '구글이 Gemini 모델 업그레이드를 통해 OpenAI 추격에 나섰습니다. 한국 AI 시장에서도 구글 클라우드와 Workspace AI 기능 확대로 국내 기업 고객 유치 경쟁이 치열해지고 있습니다.',
  },
  208: {
    keyword_id: 208, word: '개인정보보호', persona: 'SOCIETY',
    summary: '개인정보보호위원회가 AI 서비스의 개인정보 수집·이용 실태를 점검하고 있습니다. AI 학습 데이터에 개인정보가 포함될 경우 GDPR 및 국내 개인정보보호법 위반 소지가 있어 기업들의 주의가 요구됩니다.',
  },
  209: {
    keyword_id: 209, word: '스타트업', persona: 'ECONOMY',
    summary: 'AI 스타트업 투자가 둔화됐으나, 기업용 B2B AI 솔루션에 자금이 집중되는 양상입니다. 국내 AI 스타트업 생태계 육성을 위한 정부 정책 펀드와 세제 혜택 논의도 활발합니다.',
  },
  // ── 대선 클러스터 ──────────────────────────────────────────────────────────
  301: {
    keyword_id: 301, word: '대선', persona: 'POLITICS',
    summary: '2027년 대통령 선거를 앞두고 여야 잠재 후보군 윤곽이 드러나고 있습니다. 경제 민생 이슈가 핵심 공약 경쟁의 중심이 되고 있으며, 여론조사 결과에 따라 후보 단일화 논의도 가시화되고 있습니다.',
    news: [
      { id: 9020, title: '여야 대선 후보군 본격 가동…경선 일정 윤곽', outlet: 'Politics Now', date: '2025.05.16', url: 'https://example.com/news/9020', snippet: '여야는 경선 일정을 조율하며 잠재 후보군의 정책 행보를 본격화하고 있다.' },
      { id: 9021, title: '"민생 경제" vs "안보 외교"…대선 핵심 의제 갈림길', outlet: 'Public Agenda', date: '2025.05.17', url: 'https://example.com/news/9021', snippet: '대선 의제는 경제 민생, 안보 외교, 청년 주거 정책을 중심으로 재편되고 있다.' },
      { id: 9022, title: '여론조사 기관별 편차 커져…"표본·방법론 공개해야"', outlet: 'Election Lab', date: '2025.05.18', url: 'https://example.com/news/9022', snippet: '전문가들은 조사 방식과 표본 설계 차이가 후보 지지율 편차를 키우고 있다고 지적했다.' },
    ],
  },
  302: {
    keyword_id: 302, word: '여론조사', persona: 'POLITICS',
    summary: '주요 기관의 대통령 지지율 여론조사에서 야당 잠재 후보가 앞서는 결과가 잇따르고 있습니다. 조사 방법론 논란도 이어지며, 표본 설계와 문항 구성의 중립성이 도마 위에 오르고 있습니다.',
  },
  303: {
    keyword_id: 303, word: '공약', persona: 'POLITICS',
    summary: '여야 주요 후보들이 저출생 대응, 주거 안정, 청년 취업 지원을 핵심 공약으로 내걸고 있습니다. 재원 조달 방안의 현실성을 둘러싼 논쟁이 이어지며 공약의 실현 가능성에 의문이 제기되고 있습니다.',
  },
  304: {
    keyword_id: 304, word: '국민의힘', persona: 'POLITICS',
    summary: '국민의힘이 당 쇄신과 외연 확장을 목표로 비대위 체제를 가동 중입니다. 탄핵 이후 당 지지율 회복이 최대 과제이며, 중도층 공략을 위한 인재 영입이 활발히 이루어지고 있습니다.',
  },
  305: {
    keyword_id: 305, word: '민주당', persona: 'POLITICS',
    summary: '민주당이 높은 지지율을 유지하며 대선 후보 경선 준비에 나섰습니다. 복수의 잠재 후보가 당내 경쟁을 벌이고 있으며, 진보 지지층 결집과 중도 확장의 균형이 핵심 전략 과제입니다.',
  },
  306: {
    keyword_id: 306, word: '경제민주화', persona: 'ECONOMY',
    summary: '재벌 개혁과 불공정 거래 근절을 내용으로 하는 경제민주화 공약이 재주목받고 있습니다. 중소기업·자영업자 보호 법안과 플랫폼 독점 규제 강화 방안이 핵심 의제로 떠오르고 있습니다.',
  },
  307: {
    keyword_id: 307, word: '후보단일화', persona: 'POLITICS',
    summary: '야권 후보단일화 가능성이 여론조사와 전략적 계산에 따라 부상하고 있습니다. 과거 단일화 학습 효과로 협상 시기·방식을 둘러싼 갈등이 예상되며, 지지층 이탈 없는 단일화가 관건입니다.',
  },
  308: {
    keyword_id: 308, word: '탄핵정국', persona: 'POLITICS',
    summary: '탄핵 정국이 정치 지형을 근본적으로 재편하며 대선 구도에 직접적인 영향을 미치고 있습니다. 헌재 결정 이후 정치적 유불리를 둘러싼 여야의 대응 전략이 표심을 좌우할 전망입니다.',
  },
  309: {
    keyword_id: 309, word: '선거법', persona: 'POLITICS',
    summary: '선거법 개정 논의가 국회에서 지속되고 있습니다. 비례대표 확대와 권역별 비례제 도입 여부가 핵심 쟁점이며, 여야의 이해관계가 첨예하게 대립해 합의 도출이 쉽지 않은 상황입니다.',
  },
  310: {
    keyword_id: 310, word: '외교정책', persona: 'INTERNATIONAL',
    summary: '대선 후보들이 한미동맹 강화와 한중 관계 균형을 동시에 내세우며 외교정책 경쟁을 벌이고 있습니다. 북핵 문제 해법과 경제안보 전략이 외교공약의 핵심 테마로 부각되고 있습니다.',
  },
  // ── 복지정책 클러스터 ─────────────────────────────────────────────────────
  401: {
    keyword_id: 401, word: '복지정책', persona: 'SOCIETY',
    summary: '정부가 복지 지출 구조조정과 저출생·고령화 대응을 동시에 추진하고 있습니다. 재정 건전성과 복지 확충 사이의 균형이 쟁점이 되고 있으며, 여야 간 복지 철학의 차이가 두드러지고 있습니다.',
  },
  402: {
    keyword_id: 402, word: '국민연금', persona: 'SOCIETY',
    summary: '국민연금 고갈 시점이 2055년으로 앞당겨질 수 있다는 재정 추계 결과가 나왔습니다. 보험료율 인상과 수급 연령 조정을 포함한 구조개혁이 시급하지만, 정치적 부담으로 논의가 지연되고 있습니다.',
  },
  403: {
    keyword_id: 403, word: '의료개혁', persona: 'SOCIETY',
    summary: '의대 정원 확대를 둘러싼 정부와 의료계의 갈등이 장기화되고 있습니다. 지방·필수의료 공급 부족 해소를 위한 정원 증원의 필요성과 의사 수급 불균형 우려가 맞서고 있습니다.',
  },
  404: {
    keyword_id: 404, word: '저출생', persona: 'SOCIETY',
    summary: '합계출산율이 0.72명으로 역대 최저를 기록했습니다. 정부는 저출생 예산을 100조 원으로 확대하는 방안을 검토 중이지만, 효과적인 정책 설계 없이는 단순 예산 증가의 한계가 있다는 지적도 있습니다.',
  },
  405: {
    keyword_id: 405, word: '육아지원', persona: 'SOCIETY',
    summary: '아이돌봄 서비스 확대와 부모급여 인상이 추진되고 있습니다. 육아 휴직 사용률 제고와 직장 내 보육 인프라 확충이 병행되어야 실질적인 효과를 거둘 수 있다는 전문가 의견이 지배적입니다.',
  },
  406: {
    keyword_id: 406, word: '기초생활수급', persona: 'SOCIETY',
    summary: '기초생활수급자 선정 기준 완화 논의가 진행 중입니다. 부양의무자 기준 전면 폐지와 생계급여 인상이 핵심 의제이며, 복지 사각지대 해소를 위한 사회안전망 강화 필요성이 부각되고 있습니다.',
  },
  407: {
    keyword_id: 407, word: '교육격차', persona: 'SOCIETY',
    summary: '소득 수준에 따른 교육 격차가 확대되고 있습니다. 사교육비 증가와 공교육 부실화가 맞물리며, 교육기회 균등화를 위한 제도적 보완책 마련이 시급하다는 목소리가 높습니다.',
  },
  408: {
    keyword_id: 408, word: '사회보험', persona: 'ECONOMY',
    summary: '4대 사회보험(국민연금·건강보험·고용보험·산재보험) 재정 건전성 강화가 과제로 떠올랐습니다. 플랫폼 노동자·프리랜서의 사각지대 해소를 위한 보험 적용 확대 논의가 이루어지고 있습니다.',
  },
  409: {
    keyword_id: 409, word: '노인복지', persona: 'SOCIETY',
    summary: '초고령사회 진입에 따라 노인 돌봄 서비스와 요양 시설 확충이 시급한 과제가 됐습니다. 노인 빈곤율 완화를 위한 기초연금 인상과 노인 일자리 질 개선도 정책 의제로 주목받고 있습니다.',
  },
  // ── 미중관계 클러스터 ─────────────────────────────────────────────────────
  601: {
    keyword_id: 601, word: '미중관계', persona: 'INTERNATIONAL',
    summary: '미국과 중국의 전략 경쟁이 무역·기술·군사 전 분야로 확대되고 있습니다. 한국은 동맹인 미국과 최대 교역국인 중국 사이에서 전략적 모호성을 유지하고 있으나, 명확한 포지셔닝을 요구받는 압박이 커지고 있습니다.',
  },
  602: {
    keyword_id: 602, word: '관세전쟁', persona: 'ECONOMY',
    summary: '미국이 중국산 전기차·배터리·태양광 패널에 고율 관세를 부과했습니다. 이에 중국도 보복 관세로 맞서며 글로벌 공급망 재편 압박이 가속화되고 있습니다. 한국 수출 기업도 간접 영향권에 들어서고 있습니다.',
  },
  603: {
    keyword_id: 603, word: '대만', persona: 'INTERNATIONAL',
    summary: '대만해협 긴장이 고조되며 지정학적 리스크가 반도체·전자 공급망 전반에 불확실성을 더하고 있습니다. 미국의 대만 방어 공약 강화와 중국의 군사훈련이 맞물리며 아시아 안보 구도가 변화하고 있습니다.',
  },
  604: {
    keyword_id: 604, word: '반도체전쟁', persona: 'INTERNATIONAL',
    summary: '미국이 첨단 반도체 장비·기술의 대중 수출 규제를 강화하며 기술 패권 경쟁이 심화되고 있습니다. 한국 반도체 기업은 미국 규제와 중국 시장 사이에서 생산·투자 전략 재설계가 불가피한 상황입니다.',
  },
  605: {
    keyword_id: 605, word: 'NATO', persona: 'INTERNATIONAL',
    summary: 'NATO가 중국을 "체계적 도전"으로 규정하며 인도태평양 파트너국과의 협력을 강화하고 있습니다. 한국의 NATO 협력 확대 여부가 한중 관계에 미치는 영향을 두고 외교부 내 논의가 진행 중입니다.',
  },
  606: {
    keyword_id: 606, word: '우크라이나', persona: 'INTERNATIONAL',
    summary: '러시아-우크라이나 전쟁이 장기화되며 글로벌 에너지·식량 공급망 불안이 지속되고 있습니다. 한국의 우크라이나 지원 수위와 러시아 제재 동참 정도가 외교적 민감 사안으로 남아 있습니다.',
  },
  607: {
    keyword_id: 607, word: '에너지', persona: 'INTERNATIONAL',
    summary: '미중 갈등과 우크라이나 전쟁으로 에너지 공급망이 재편되고 있습니다. LNG 수입 다변화와 원전 르네상스가 에너지 안보 전략의 핵심으로 떠올랐으며, 한국의 에너지 믹스 전환 속도가 주목됩니다.',
  },
  608: {
    keyword_id: 608, word: '달러패권', persona: 'ECONOMY',
    summary: '미국 달러 패권에 도전하는 탈달러화 움직임이 일부 국가를 중심으로 확산되고 있습니다. 중국 위안화 결제 확대와 BRICS 공동통화 논의가 이어지지만, 달러 대체는 단기적으로 제한적이라는 분석이 다수입니다.',
  },
  609: {
    keyword_id: 609, word: '한중관계', persona: 'INTERNATIONAL',
    summary: '사드 갈등 이후 냉각된 한중 관계가 서서히 회복 국면에 접어들고 있습니다. 경제 협력 복원과 동시에 미국의 대중 견제 정책에 동참하는 압력 사이에서 한국 외교의 균형 잡기가 이어지고 있습니다.',
  },
  610: {
    keyword_id: 610, word: '트럼프', persona: 'POLITICS',
    summary: '트럼프 전 대통령의 재집권으로 미국의 대외 정책이 급격히 변화하고 있습니다. 방위비 분담금 재협상 압박, 관세 강화, 다자주의 후퇴 등이 한국 외교·경제에 복합적 과제를 던지고 있습니다.',
  },
  // ── 공유 노드 ──────────────────────────────────────────────────────────────
  501: {
    keyword_id: 501, word: '삼성전자', persona: 'TECHNOLOGY',
    summary: '삼성전자가 HBM 공급 경쟁에서 SK하이닉스에 뒤처졌다는 평가 속에서 파운드리 수율 개선과 3세대 HBM 인증에 총력을 기울이고 있습니다. AI 반도체 수요 폭증이 실적 반등의 핵심 동력이 될 전망입니다.',
  },
  502: {
    keyword_id: 502, word: '반도체', persona: 'TECHNOLOGY',
    summary: '글로벌 AI 수요 급증으로 메모리·시스템 반도체 모두 강한 회복세를 보이고 있습니다. 한국은 DRAM·NAND 분야 세계 1~2위를 유지하고 있으나, 미중 기술 패권 경쟁의 한가운데 놓인 전략 산업이기도 합니다.',
  },
  503: {
    keyword_id: 503, word: '일자리', persona: 'SOCIETY',
    summary: 'AI·자동화로 인한 일자리 대체 우려가 커지는 가운데, 고용 구조의 전환이 가속화되고 있습니다. 정부는 디지털 전환 지원과 직업 재훈련 프로그램 확충을 통해 노동시장 충격 완화에 나서고 있습니다.',
  },
  507: {
    keyword_id: 507, word: '복지예산', persona: 'ECONOMY',
    summary: '복지 관련 정부 지출이 전체 예산의 35%를 넘어섰습니다. 고령화 가속으로 자연 증가분만으로도 재정 부담이 커지는 가운데, 지출 효율화와 복지 확충 사이의 균형을 찾는 것이 재정 당국의 과제입니다.',
  },
  509: {
    keyword_id: 509, word: '청년정책', persona: 'SOCIETY',
    summary: '청년 취업난과 주거 부담 해소를 위한 맞춤형 정책이 쏟아지고 있습니다. 청년 내일채움공제, 청년 월세 지원, 청년도약계좌 등 다양한 프로그램이 운용되고 있으나 체감 효과는 여전히 낮다는 평가입니다.',
  },
};

// ─── Onboarding ───────────────────────────────────────────────────────────────

export const MOCK_PERSONAS: PersonaListResponse = {
  contents: [
    { name: 'ECONOMY',       description: '경제·금융·산업 관련 뉴스' },
    { name: 'POLITICS',      description: '정치·정책·선거 관련 뉴스' },
    { name: 'TECHNOLOGY',    description: 'IT·AI·과학기술 관련 뉴스' },
    { name: 'SOCIETY',       description: '사회·교육·복지 관련 뉴스' },
    { name: 'CULTURE',       description: '문화·예술·스포츠 관련 뉴스' },
    { name: 'INTERNATIONAL', description: '국제·외교·글로벌 이슈' },
  ],
};

// 페르소나별 매크로 키워드 목업
export const MOCK_MACRO_BY_PERSONA: Record<string, KeywordListResponse> = {
  ECONOMY: {
    contents: [
      { id: 1001, word: '통화정책' },
      { id: 1002, word: '주식시장' },
      { id: 1003, word: '부동산' },
      { id: 1004, word: '무역' },
      { id: 1005, word: '반도체' },
      { id: 1006, word: '에너지' },
    ],
  },
  POLITICS: {
    contents: [
      { id: 1011, word: '대선' },
      { id: 1012, word: '국회' },
      { id: 1013, word: '탄핵' },
      { id: 1014, word: '외교' },
      { id: 1015, word: '복지정책' },
      { id: 1016, word: '선거법' },
    ],
  },
  TECHNOLOGY: {
    contents: [
      { id: 1021, word: 'AI 규제' },
      { id: 1022, word: '반도체' },
      { id: 1023, word: '빅테크' },
      { id: 1024, word: '사이버보안' },
      { id: 1025, word: '우주개발' },
      { id: 1026, word: '전기차' },
    ],
  },
  SOCIETY: {
    contents: [
      { id: 1031, word: '저출생' },
      { id: 1032, word: '의료개혁' },
      { id: 1033, word: '교육' },
      { id: 1034, word: '일자리' },
      { id: 1035, word: '주거' },
      { id: 1036, word: '청년' },
    ],
  },
  CULTURE: {
    contents: [
      { id: 1041, word: 'K-콘텐츠' },
      { id: 1042, word: '스포츠' },
      { id: 1043, word: '영화' },
      { id: 1044, word: '음악' },
      { id: 1045, word: '게임' },
      { id: 1046, word: '미술' },
    ],
  },
  INTERNATIONAL: {
    contents: [
      { id: 1051, word: '미중관계' },
      { id: 1052, word: '한미동맹' },
      { id: 1053, word: '우크라이나' },
      { id: 1054, word: '중동' },
      { id: 1055, word: '관세전쟁' },
      { id: 1056, word: '기후협약' },
    ],
  },
};

// 기본값 (페르소나 매칭 실패 시)
export const MOCK_MACRO: KeywordListResponse = MOCK_MACRO_BY_PERSONA.ECONOMY;

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

// ── 티어 정의 ──────────────────────────────────────────
export const TIERS: Tier[] = [
  { min:1,  max:3,  name:'새내기',          color:'#5BBA6F', soft:'#E5F4E0', characterImage:'/assets/characters/tier1_새내기.png' },
  { min:4,  max:7,  name:'시사 입문러',     color:'#4FA3E0', soft:'#E1F0FA', characterImage:'/assets/characters/tier2_시사입문러.png' },
  { min:8,  max:12, name:'벼락치기 취준생', color:'#8B6FE0', soft:'#EBE4FA', characterImage:'/assets/characters/tier3_벼락치기취준생.png' },
  { min:13, max:18, name:'여의도 주니어',   color:'#E8954D', soft:'#FBEEDE', characterImage:'/assets/characters/tier4_여의도주니어.png' },
  { min:19, max:24, name:'시사 덕후',       color:'#E04F8C', soft:'#FBE2EE', characterImage:'/assets/characters/tier5_시사덕후.png' },
  { min:25, max:99, name:'살아있는 위키',   color:'#F5B82E', soft:'#FCEFCD', characterImage:'/assets/characters/tier6_살아있는위키.png' },
];

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.4, level - 1));
}

export function tierOf(level: number): Tier {
  return TIERS.find(t => level >= t.min && level <= t.max) ?? TIERS[0];
}

// ── 노드 잠금 레벨 ──────────────────────────────────────
export const NODE_UNLOCK_LEVELS: Record<string, number> = {
  graphrag:1, rag:1, knowledge:1, llm:1, vectordb:1,
  embedding:1, chunking:1, transformer:1, gpt:1, attention:1, nlp:1,
  prompt:3, tokenize:3, hallucination:3,
  agent:5, finetune:5,
  reasoning:6, entity:6,
  neo4j:7, cypher:8, multimodal:9,
};

// ── 뱃지 15개 ────────────────────────────────────────────
export const ALL_BADGES: Badge[] = [
  { id:'first_login',   name:'첫 발걸음',    category:'attendance', description:'노딩고에 첫 발을 내딛었어요',  condition:'첫 출석',         earned:false },
  { id:'streak_7',      name:'일주일 개근',  category:'attendance', description:'7일 연속 출석 달성!',         condition:'7일 연속 출석',   earned:false },
  { id:'streak_30',     name:'한 달 개근',   category:'attendance', description:'30일 연속 출석 달성!',        condition:'30일 연속 출석',  earned:false },
  { id:'first_explore', name:'첫 탐험',      category:'explore',    description:'첫 번째 노드를 탐험했어요',   condition:'노드 첫 클릭',    earned:false },
  { id:'explore_10',    name:'동네 탐험가',  category:'explore',    description:'노드 10개를 탐험했어요',      condition:'노드 10개 탐색',  earned:false },
  { id:'explore_50',    name:'지도 완성자',  category:'explore',    description:'노드 50개를 탐험했어요',      condition:'노드 50개 탐색',  earned:false },
  { id:'first_quiz',    name:'첫 도전',      category:'quiz',       description:'첫 퀴즈를 완료했어요',        condition:'퀴즈 첫 완료',    earned:false },
  { id:'quiz_10',       name:'퀴즈 고수',    category:'quiz',       description:'퀴즈 10회를 완료했어요',      condition:'퀴즈 10회 완료',  earned:false },
  { id:'perfect_5',     name:'완벽주의자',   category:'quiz',       description:'퍼펙트 스코어 5회 달성!',     condition:'퍼펙트 5회',      earned:false },
  { id:'first_follow',  name:'첫 인연',      category:'social',     description:'첫 번째 친구를 팔로우했어요', condition:'팔로우 1명',      earned:false },
  { id:'follow_10',     name:'인싸 입문',    category:'social',     description:'10명을 팔로우했어요',         condition:'팔로우 10명',     earned:false },
  { id:'ranking_top10', name:'랭킹 입성',    category:'social',     description:'랭킹 TOP 10에 진입했어요',    condition:'랭킹 TOP 10',     earned:false },
  { id:'first_scrap',   name:'첫 스크랩',    category:'special',    description:'첫 번째 키워드를 스크랩했어요', condition:'첫 스크랩',     earned:false },
  { id:'receipt_10',    name:'영수증 수집가', category:'special',   description:'영수증을 10장 발급했어요',     condition:'영수증 10장',     earned:false },
  { id:'nodingo_start', name:'노딩고 시작',  category:'special',    description:'노딩고와의 여정을 시작했어요!', condition:'첫 로그인',      earned:true, earnedAt:'2025.05.27' },
];

export const MOCK_USER_GAME: UserGame = {
  level: 1, xp: 82,
  streak: 1, dailyGoal: 2, dailyProgress: 0,
  scrapped: [],
  completedQuizzes: [],
  badges: ALL_BADGES.map(b =>
    b.id === 'nodingo_start'
      ? { ...b, earned: true, earnedAt: '2026.05.27' }
      : { ...b, earned: false, earnedAt: undefined }
  ),
  following: 0,
  totalNodesExplored: 0,
  totalQuizzesSolved: 0,
};

export const MOCK_QUIZZES: Record<string, Array<{
  q: string; options: string[]; a: number;
  source: { outlet: string; date: string; url?: string };
}>> = {
  금리: [
    { q:'한국은행이 기준금리를 동결한 주된 이유로 언급된 것은?', options:['수출 급감','물가 목표 수렴 전까지 신중한 운용','주식시장 과열','부동산 공급 부족'], a:1, source:{outlet:'Nodingo News', date:'2025.05.20', url:'https://example.com/news/9001'} },
    { q:'Fed 금리 동결 이후 원/달러 환율은 어느 구간에서 등락했다고 설명됐나?', options:['1,100원대','1,240원대','1,360원대','1,580원대'], a:2, source:{outlet:'Market Brief', date:'2025.05.21', url:'https://example.com/news/9002'} },
    { q:'시장 참가자들이 전망한 연내 금리 인하 흐름은?', options:['인하 가능성 없음','완만한 인하 가능성','즉각적인 빅스텝 인하','금리 대폭 인상'], a:1, source:{outlet:'Economy Daily', date:'2025.05.22', url:'https://example.com/news/9003'} },
  ],
  한국은행: [
    { q:'한국은행의 통화정책 운용에서 함께 고려되는 두 목표는?', options:['물가 안정과 금융 안정','수출 확대와 관광 진흥','교육 개혁과 복지 확대','환율 고정과 임금 통제'], a:0, source:{outlet:'Nodingo News', date:'2025.05.20', url:'https://example.com/news/9001'} },
    { q:'한국은행이 섣부른 금리 인하를 경계하는 이유로 맞는 것은?', options:['세수 감소 우려','자산 버블 자극 가능성','무역수지 흑자 확대','국채 발행 중단'], a:1, source:{outlet:'Nodingo News', date:'2025.05.20', url:'https://example.com/news/9001'} },
    { q:'기준금리 결정에 영향을 주는 해외 변수로 언급된 것은?', options:['OPEC 감산','Fed 통화정책','일본 소비세','중국 관광객'], a:1, source:{outlet:'Market Brief', date:'2025.05.21', url:'https://example.com/news/9002'} },
  ],
  ai규제: [
    { q:'EU AI Act가 특히 엄격한 의무를 부과하는 대상은?', options:['저위험 게임 AI','고위험 AI 시스템','개인 블로그 추천 알고리즘','오프라인 계산기'], a:1, source:{outlet:'AI Policy', date:'2025.05.18', url:'https://example.com/news/9010'} },
    { q:'국내 AI기본법 논의의 핵심 쟁점은?', options:['산업 육성과 이용자 보호의 균형','모든 AI 서비스 금지','검색엔진 폐쇄','반도체 수입 중단'], a:0, source:{outlet:'Tech Law', date:'2025.05.19', url:'https://example.com/news/9011'} },
    { q:'글로벌 AI 기업들이 EU 규정 대응을 위해 강화하는 것은?', options:['오프라인 매장','컴플라이언스 조직과 모델 관리 체계','스마트폰 생산라인','게임 퍼블리싱'], a:1, source:{outlet:'Global Tech', date:'2025.05.20', url:'https://example.com/news/9012'} },
  ],
  대선: [
    { q:'대선 후보군 행보가 본격화되며 함께 조율되는 것은?', options:['경선 일정','수능 일정','월드컵 조 편성','금리 고시'], a:0, source:{outlet:'Politics Now', date:'2025.05.16', url:'https://example.com/news/9020'} },
    { q:'대선 핵심 의제로 언급된 조합은?', options:['민생 경제·안보 외교·청년 주거','날씨·스포츠·여행','음악 차트·영화 예매','해외 축제·패션'], a:0, source:{outlet:'Public Agenda', date:'2025.05.17', url:'https://example.com/news/9021'} },
    { q:'여론조사 편차가 커지는 이유로 지적된 것은?', options:['조사 방식과 표본 설계 차이','투표소 위치 변경','환율 변동','기온 상승'], a:0, source:{outlet:'Election Lab', date:'2025.05.18', url:'https://example.com/news/9022'} },
  ],
  복지정책: [
    { q:'복지정책 논의에서 함께 고려되는 두 축은?', options:['재정 건전성과 복지 확충','환율과 수출 단가','문화행사와 관광객','기술특허와 게임'], a:0, source:{outlet:'Nodingo AI', date:'2025.05.27'} },
    { q:'저출생·고령화 대응에서 지적되는 한계는?', options:['단순 예산 증가만으로는 효과가 제한될 수 있음','복지예산이 전혀 필요 없음','의료개혁과 무관함','청년정책을 폐지해야 함'], a:0, source:{outlet:'Nodingo AI', date:'2025.05.27'} },
    { q:'복지정책의 주요 쟁점으로 맞는 것은?', options:['재원 조달과 정책 효과성','날씨 예보 정확도','해외 스포츠 일정','검색 광고 단가'], a:0, source:{outlet:'Nodingo AI', date:'2025.05.27'} },
  ],
  미중관계: [
    { q:'미중관계에서 경쟁이 확대되는 분야로 맞는 것은?', options:['무역·기술·군사','요리·관광·음악','교육·미술·스포츠','농구·야구·축구'], a:0, source:{outlet:'Nodingo AI', date:'2025.05.27'} },
    { q:'한국이 미중관계 속에서 받는 압박은?', options:['동맹과 최대 교역국 사이의 포지셔닝 요구','모든 수출 중단 요구','국내 선거 폐지 요구','의료보험 폐지 요구'], a:0, source:{outlet:'Nodingo AI', date:'2025.05.27'} },
    { q:'미중 갈등이 공급망에 주는 영향으로 맞는 것은?', options:['반도체·에너지 등 전략 산업 불확실성 확대','문화 콘텐츠 제작비 고정','지역 날씨 안정','국내 물가 완전 고정'], a:0, source:{outlet:'Nodingo AI', date:'2025.05.27'} },
  ],
  chatgpt: [
    { q:'ChatGPT 도입이 빠르게 확대되는 분야로 언급된 것은?', options:['교육·의료·법률','농구·야구·축구','조선·원양어업만','오프라인 서점만'], a:0, source:{outlet:'Nodingo AI', date:'2025.05.27'} },
    { q:'ChatGPT와 같은 생성형 AI에서 규제 기관이 주목하는 이슈는?', options:['개인정보 처리 방식','전기요금 고지서 색상','스포츠 중계권','환율 고정제'], a:0, source:{outlet:'Nodingo AI', date:'2025.05.27'} },
    { q:'기업용 AI 서비스 확대와 함께 중요해지는 것은?', options:['데이터 보호와 컴플라이언스','종이신문 배달망','오프라인 매표소','수동 계산기'], a:0, source:{outlet:'Nodingo AI', date:'2025.05.27'} },
  ],
  graphrag: [
    { q:'GraphRAG는 다중 홉 질문 정답률을 기존 RAG 대비 얼마나 끌어올렸나?', options:['약 5%','약 12%','약 25%','약 40%'], a:1, source:{outlet:'TechBrief', date:'2024.07.18'} },
    { q:'GraphRAG가 컴플라이언스 부서에서 선호되는 이유는?', options:['비용이 저렴해서','답변 근거를 그래프로 시각화할 수 있어서','한국어 답변이 자연스러워서','학습이 필요 없어서'], a:1, source:{outlet:'AI Today', date:'2024.11.04'} },
    { q:'GraphRAG의 핵심 구성 요소가 아닌 것은?', options:['지식그래프','엔티티 추출','이미지 분류','벡터DB'], a:2, source:{outlet:'Dev Weekly', date:'2025.02.21'} },
  ],
  default: [
    { q:'이 키워드와 가장 관련 깊은 개념은?', options:['지식그래프','이미지 처리','음성 인식','블록체인'], a:0, source:{outlet:'Nodingo AI', date:'2025.05.27'} },
  ],
};

export const MOCK_RANKING_FRIENDS: RankingEntry[] = [
  { rank:1,  name:'찬우', avatar:'', level:28, weekXp:1840, persona:'기술' },
  { rank:2,  name:'상운', avatar:'', level:25, weekXp:1710, persona:'국제' },
  { rank:3,  name:'성민', avatar:'', level:22, weekXp:1620, persona:'경제' },
  { rank:4,  name:'장수', avatar:'', level:18, weekXp:1375, persona:'정치' },
  { rank:5,  name:'유철', avatar:'', level:16, weekXp:1190, persona:'사회' },
  { rank:6,  name:'수현', avatar:'', level:13, weekXp:980,  persona:'기술' },
  { rank:7,  name:'준상', avatar:'', level:9,  weekXp:760,  persona:'경제' },
  { rank:8,  name:'준모', avatar:'', level:7,  weekXp:610,  persona:'국제' },
  { rank:24, name:'딩고', avatar:'', level:4,  weekXp:425,  persona:'경제', isMe:true },
];

export const MOCK_RANKING_PERSONA: RankingEntry[] = [
  { rank:1,  name:'서윤', avatar:'', level:24, weekXp:1540, persona:'경제' },
  { rank:2,  name:'민재', avatar:'', level:21, weekXp:1415, persona:'경제' },
  { rank:3,  name:'하린', avatar:'', level:19, weekXp:1320, persona:'경제' },
  { rank:4,  name:'도윤', avatar:'', level:17, weekXp:1180, persona:'경제' },
  { rank:5,  name:'지안', avatar:'', level:15, weekXp:1030, persona:'경제' },
  { rank:6,  name:'태오', avatar:'', level:12, weekXp:890,  persona:'경제' },
  { rank:7,  name:'나은', avatar:'', level:10, weekXp:770,  persona:'경제' },
  { rank:8,  name:'이준', avatar:'', level:8,  weekXp:650,  persona:'경제' },
  { rank:12, name:'딩고', avatar:'', level:4,  weekXp:425,  persona:'경제', isMe:true },
];
