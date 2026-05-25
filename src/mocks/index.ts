import type {
  TabListResponse,
  GraphDataResponse,
  NodeSummaryResponse,
  PersonaListResponse,
  KeywordListResponse,
} from '../types';

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
      { id: 9001, title: '한은, 기준금리 3.5% 동결…"물가 목표 수렴 전까지 신중"' },
      { id: 9002, title: 'Fed 금리 동결에 원/달러 환율 1,360원대 유지' },
      { id: 9003, title: '시장 "연내 금리 인하 2회" 전망 유지…빅스텝 가능성은 낮아' },
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
      { id: 9010, title: 'EU AI Act 본격 시행…고위험 AI 시스템에 엄격한 규제 적용' },
      { id: 9011, title: '국내 AI기본법 국회 통과 임박…산업계 "규제 완화" 촉구' },
      { id: 9012, title: 'OpenAI·구글, EU 규정 대응에 연 수천억 투입 예정' },
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
      { id: 9020, title: '여야 대선 후보군 본격 가동…경선 일정 윤곽' },
      { id: 9021, title: '"민생 경제" vs "안보 외교"…대선 핵심 의제 갈림길' },
      { id: 9022, title: '여론조사 기관별 편차 커져…"표본·방법론 공개해야"' },
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
