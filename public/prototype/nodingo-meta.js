// ─── Tiers ──────────────────────────────────────────────────
window.NODINGO_TIERS = [
  { min: 1,  max: 3,  name: '새싹',          emoji: '🌱', color: '#5BBA6F', soft: '#E5F4E0' },
  { min: 4,  max: 7,  name: '초보 모험가',   emoji: '🧭', color: '#4FA3E0', soft: '#E1F0FA' },
  { min: 8,  max: 12, name: '탐험가',        emoji: '🔭', color: '#8B6FE0', soft: '#EBE4FA' },
  { min: 13, max: 18, name: '지식 사냥꾼',   emoji: '🦉', color: '#E8954D', soft: '#FBEEDE' },
  { min: 19, max: 24, name: '현자',          emoji: '🪐', color: '#E04F8C', soft: '#FBE2EE' },
  { min: 25, max: 99, name: '노딩고 마스터', emoji: '🌟', color: '#F5B82E', soft: '#FCEFCD' },
];

window.NODINGO_XP_PER_LEVEL = 120;
window.NODINGO_TIER_OF = (level) =>
  window.NODINGO_TIERS.find(t => level >= t.min && level <= t.max) || window.NODINGO_TIERS[0];
window.NODINGO_NEXT_TIER_AT = (level) => {
  const t = window.NODINGO_TIER_OF(level);
  return t.max + 1;
};

// ─── Node unlock levels ─────────────────────────────────────
window.NODINGO_UNLOCK = {
  graphrag: 1, rag: 1, knowledge: 1, llm: 1, vectordb: 1, embedding: 1,
  chunking: 1, transformer: 1, gpt: 1, attention: 1, nlp: 1,
  prompt: 3, tokenize: 3, hallucination: 3,
  agent: 5, finetune: 5,
  reasoning: 6, entity: 6,
  neo4j: 7, cypher: 8, multimodal: 9,
};

// ─── Default user state ─────────────────────────────────────
window.NODINGO_DEFAULT_USER = {
  username: '지영',
  avatar: '🦊',
  level: 4,
  xp: 65,
  coins: 535,
  streak: 7,
  dailyGoal: 3,
  dailyProgress: 2,
  scrapped: ['graphrag', 'rag', 'knowledge'],
  completedQuizzes: ['rag', 'embedding'],
  totalNodesExplored: 14,
  totalQuizzesSolved: 23,
  joinDays: 32,
};

// ─── Source news per node ───────────────────────────────────
// (In production: user-curated or auto-collected per keyword.)
// Each article: { outlet, date, title, snippet }
window.NODINGO_NEWS = {
  graphrag: [
    {
      outlet: 'TechBrief', date: '2024.07.18',
      title: "MS, 'GraphRAG' 공개… 다중 홉 질문 정답률 12% 향상",
      snippet: 'Microsoft Research가 발표한 GraphRAG는 문서에서 엔티티와 관계를 추출해 지식그래프로 구조화한 뒤 LLM 검색에 활용한다. 자체 벤치마크에서 기존 RAG 대비 다중 홉 질문 정답률이 평균 12% 향상됐다.',
    },
    {
      outlet: 'AI Today', date: '2024.11.04',
      title: '국내 스타트업, GraphRAG 기반 사내 지식봇 도입 가속',
      snippet: '환각 답변에 시달리던 기업들이 GraphRAG를 도입하고 있다. 답변 근거를 그래프로 시각화할 수 있어 컴플라이언스 부서에서 선호된다는 분석이다.',
    },
    {
      outlet: 'Dev Weekly', date: '2025.02.21',
      title: 'Neo4j-LangChain GraphRAG 템플릿, 100만 다운로드 돌파',
      snippet: 'Cypher로 표현된 서브그래프를 LLM 컨텍스트에 자동 주입하는 오픈소스 템플릿이 인기다. 평균 응답 토큰 수는 30% 감소했지만 정답률은 유지됐다.',
    },
  ],
  rag: [
    {
      outlet: 'TechBrief', date: '2023.09.05',
      title: '환각 줄이는 RAG, 엔터프라이즈 LLM의 표준 패턴으로',
      snippet: 'RAG는 LLM 답변에 사내 문서 출처를 함께 제공해 환각을 줄인다. 대기업의 80%가 RAG 파이프라인을 채택했다는 조사가 나왔다.',
    },
    {
      outlet: 'AI Today', date: '2024.05.12',
      title: '청크 사이즈가 RAG 정확도를 가른다',
      snippet: '연구에 따르면 청크가 너무 크면 관련 없는 문장이 섞여 정확도가 떨어지고, 너무 작으면 맥락이 끊긴다. 500~800 토큰이 권장 범위로 나타났다.',
    },
  ],
  knowledge: [
    {
      outlet: 'Dev Weekly', date: '2024.10.30',
      title: 'Neo4j, Cypher 쿼리 학습용 무료 강좌 오픈',
      snippet: '지식그래프 대표 DB인 Neo4j가 SQL 사용자를 위한 Cypher 입문 코스를 공개했다. 노드-관계-속성 모델을 3시간 안에 익힐 수 있도록 설계됐다.',
    },
    {
      outlet: 'AI Today', date: '2024.12.15',
      title: '구글, 지식그래프 기반 검색 결과 30% 확대',
      snippet: '구글은 검색 결과 상단의 답변 카드를 자체 지식그래프에서 더 적극적으로 채우기 시작했다. 다중 홉 관계 탐색이 핵심 기술이다.',
    },
  ],
  llm: [
    {
      outlet: 'TechBrief', date: '2024.03.10',
      title: 'LLM, 단일 \'다음 토큰 예측\' 학습으로 다양한 능력 발현',
      snippet: '거대 언어 모델은 다음 토큰을 예측하도록 학습되지만, 그 결과 추론·요약·번역 등 다양한 작업을 추가 학습 없이 수행한다는 분석이 다시 주목받고 있다.',
    },
    {
      outlet: 'AI Today', date: '2024.08.22',
      title: '환각, LLM 신뢰성의 마지막 장벽',
      snippet: '대형 모델이 사실과 다른 답변을 자신 있게 제시하는 \'환각\' 현상이 도입 최대 걸림돌이다. RAG·파인튜닝·에이전트 등 여러 완화책이 동시에 시도되고 있다.',
    },
  ],
  vectordb: [
    {
      outlet: 'Dev Weekly', date: '2024.06.08',
      title: 'HNSW vs IVF, 벡터DB 인덱스 선택 가이드',
      snippet: '대표적인 ANN 인덱스 HNSW는 정확도가 높고 빠르지만 메모리를 많이 쓴다. IVF는 메모리 효율이 좋지만 정확도가 다소 낮다. 워크로드에 맞춰 선택해야 한다.',
    },
    {
      outlet: 'AI Today', date: '2024.09.14',
      title: 'Pinecone·Weaviate, RAG 붐 타고 폭풍 성장',
      snippet: 'RAG가 산업 표준이 되며 벡터DB 시장도 동반 성장 중이다. 두 회사 모두 작년 매출 3배 이상 성장했다.',
    },
  ],
  embedding: [
    {
      outlet: 'AI Today', date: '2024.02.05',
      title: 'OpenAI, text-embedding-3 출시…한국어 검색 정확도 12% 개선',
      snippet: '의미적으로 유사한 문장이 벡터 공간에서 가까워지도록 학습한 새 임베딩 모델. 한국어 검색 정확도가 이전 세대 대비 12% 향상됐다고 발표.',
    },
    {
      outlet: 'Dev Weekly', date: '2024.04.19',
      title: '오픈소스 BGE·E5, 상용 임베딩 모델 추격',
      snippet: 'BGE와 E5 등 오픈소스 임베딩 모델이 영어권 벤치마크에서 상용 모델과 격차를 좁히고 있다.',
    },
  ],
  chunking: [
    {
      outlet: 'Dev Weekly', date: '2024.07.30',
      title: '시맨틱 청킹이 검색 정확도를 6% 끌어올리는 이유',
      snippet: '문장 단위 의미 유사도로 청크를 나누는 \'시맨틱 청킹\'이 고정 길이 방식보다 검색 품질이 일관되게 좋다는 비교 실험이 공개됐다. 의미 단위로 잘라 맥락을 보존하기 때문이다.',
    },
  ],
  transformer: [
    {
      outlet: 'TechBrief', date: '2024.01.18',
      title: "'Attention is All You Need' 인용 14만 회 돌파",
      snippet: '2017년 Google이 발표한 Transformer 논문은 self-attention만으로 RNN을 대체하며 현대 LLM의 표준 백본이 되었다. 병렬화와 장거리 의존성 학습이 핵심 강점이다.',
    },
  ],
};

window.NODINGO_NEWS_FALLBACK = (label) => [
  {
    outlet: '관련 뉴스 자동 수집 중', date: '–',
    title: `"${label}" 키워드 관련 기사를 모으는 중입니다`,
    snippet: '뉴스를 직접 추가하면 그래프 RAG가 자동으로 요약과 퀴즈를 만들어 드려요.',
    placeholder: true,
  },
];

// ─── Quizzes — every Q answerable from the matching news snippet ─
// Each Q includes `source` = which article it came from (outlet · date).
window.NODINGO_QUIZZES = {
  graphrag: [
    {
      q: 'TechBrief 기사에 따르면, GraphRAG는 다중 홉 질문 정답률을 기존 RAG 대비 얼마나 끌어올렸나?',
      options: ['약 5%', '약 12%', '약 25%', '약 40%'],
      a: 1,
      source: { outlet: 'TechBrief', date: '2024.07.18' },
    },
    {
      q: 'AI Today에 따르면, GraphRAG가 컴플라이언스 부서에서 선호되는 이유는?',
      options: [
        '비용이 가장 저렴해서',
        '답변 근거를 그래프로 시각화할 수 있어서',
        '한국어 답변이 가장 자연스러워서',
        '학습이 필요 없어서',
      ],
      a: 1,
      source: { outlet: 'AI Today', date: '2024.11.04' },
    },
    {
      q: 'Dev Weekly가 보도한 Neo4j-LangChain 템플릿의 효과로 옳은 것은?',
      options: [
        '응답 토큰 수 30% 감소, 정답률 유지',
        '응답 토큰 수 10% 증가, 정답률 두 배',
        '토큰 수 유지, 정답률 50% 하락',
        '토큰 수·정답률 모두 변동 없음',
      ],
      a: 0,
      source: { outlet: 'Dev Weekly', date: '2025.02.21' },
    },
  ],
  rag: [
    {
      q: 'TechBrief 기사가 인용한 조사에서, RAG 파이프라인을 채택한 대기업의 비율은?',
      options: ['약 30%', '약 50%', '약 80%', '약 95%'],
      a: 2,
      source: { outlet: 'TechBrief', date: '2023.09.05' },
    },
    {
      q: 'AI Today에 따르면, 권장되는 청크 토큰 범위는?',
      options: ['100~300', '500~800', '1500~2000', '3000 이상'],
      a: 1,
      source: { outlet: 'AI Today', date: '2024.05.12' },
    },
    {
      q: '청크가 너무 작을 때 발생하는 문제는?',
      options: [
        '관련 없는 문장이 섞인다',
        '맥락이 끊긴다',
        '벡터DB 비용이 폭증한다',
        '환각이 사라진다',
      ],
      a: 1,
      source: { outlet: 'AI Today', date: '2024.05.12' },
    },
  ],
  knowledge: [
    {
      q: 'Dev Weekly에 따르면, Neo4j가 공개한 무료 강좌는 누구를 위한 것인가?',
      options: ['초등학생', 'SQL 사용자', '디자이너', '경영진'],
      a: 1,
      source: { outlet: 'Dev Weekly', date: '2024.10.30' },
    },
    {
      q: '지식그래프의 기본 데이터 모델은?',
      options: ['표(행·열)', '노드-관계-속성', '키-값', '큐'],
      a: 1,
      source: { outlet: 'Dev Weekly', date: '2024.10.30' },
    },
    {
      q: 'AI Today에 따르면, 구글이 검색 결과 답변 카드를 확대하는 데 사용하는 핵심 기술은?',
      options: ['이미지 OCR', '다중 홉 관계 탐색', '광고 입찰', '음성 인식'],
      a: 1,
      source: { outlet: 'AI Today', date: '2024.12.15' },
    },
  ],
  llm: [
    {
      q: 'TechBrief 기사가 강조한 LLM의 사전학습 목표는?',
      options: ['이미지 분류', '다음 토큰 예측', '음성 합성', '강화학습 보상 최대화'],
      a: 1,
      source: { outlet: 'TechBrief', date: '2024.03.10' },
    },
    {
      q: 'AI Today가 \'LLM 신뢰성의 마지막 장벽\'으로 지목한 현상은?',
      options: ['추론 지연', '환각(Hallucination)', '비용 폭등', '토큰 부족'],
      a: 1,
      source: { outlet: 'AI Today', date: '2024.08.22' },
    },
    {
      q: 'AI Today가 언급한 환각 완화 방법이 아닌 것은?',
      options: ['RAG', '파인튜닝', '에이전트', 'PageRank'],
      a: 3,
      source: { outlet: 'AI Today', date: '2024.08.22' },
    },
  ],
  vectordb: [
    {
      q: 'Dev Weekly의 인덱스 가이드에 따르면, HNSW의 특징은?',
      options: [
        '정확도 높고 빠르나 메모리 사용이 큼',
        '메모리 효율이 가장 좋음',
        '학습이 필요 없음',
        '디스크 기반으로만 동작',
      ],
      a: 0,
      source: { outlet: 'Dev Weekly', date: '2024.06.08' },
    },
    {
      q: 'AI Today 기사에 따르면, Pinecone·Weaviate의 작년 매출 성장은?',
      options: ['10% 미만', '50%', '약 2배', '3배 이상'],
      a: 3,
      source: { outlet: 'AI Today', date: '2024.09.14' },
    },
    {
      q: '벡터DB의 핵심 검색 알고리즘은?',
      options: ['B-Tree 인덱스', 'ANN(근사 최근접 이웃)', 'Bloom Filter', 'Hash Join'],
      a: 1,
      source: { outlet: 'Dev Weekly', date: '2024.06.08' },
    },
  ],
  embedding: [
    {
      q: 'AI Today에 따르면, text-embedding-3는 한국어 검색 정확도를 이전 세대 대비 얼마나 끌어올렸나?',
      options: ['3%', '12%', '25%', '50%'],
      a: 1,
      source: { outlet: 'AI Today', date: '2024.02.05' },
    },
    {
      q: '임베딩의 핵심 아이디어는?',
      options: [
        '문서 압축',
        '의미가 비슷한 문장이 벡터 공간에서 가까워지도록 학습',
        '단어를 무작위 ID에 매핑',
        '문법 트리 생성',
      ],
      a: 1,
      source: { outlet: 'AI Today', date: '2024.02.05' },
    },
    {
      q: 'Dev Weekly 기사에서 \'상용 모델 추격\'으로 거론된 오픈소스 임베딩은?',
      options: ['CLIP·SAM', 'BGE·E5', 'BERT-large·GPT-2', 'Stable·SDXL'],
      a: 1,
      source: { outlet: 'Dev Weekly', date: '2024.04.19' },
    },
  ],
  chunking: [
    {
      q: 'Dev Weekly에 따르면, 시맨틱 청킹은 검색 정확도를 얼마나 끌어올렸나?',
      options: ['1%', '6%', '15%', '30%'],
      a: 1,
      source: { outlet: 'Dev Weekly', date: '2024.07.30' },
    },
    {
      q: '시맨틱 청킹이 정확도가 더 일관된 이유는?',
      options: [
        '청크 크기가 매우 작아서',
        '의미 단위로 잘라 맥락이 보존되기 때문',
        '랜덤 분할이라 편향이 사라져서',
        '단어 수가 고정되기 때문',
      ],
      a: 1,
      source: { outlet: 'Dev Weekly', date: '2024.07.30' },
    },
    {
      q: '시맨틱 청킹의 분할 기준은?',
      options: ['글자 수', '문장 단위 의미 유사도', '문단 줄바꿈', '저자 메타데이터'],
      a: 1,
      source: { outlet: 'Dev Weekly', date: '2024.07.30' },
    },
  ],
  transformer: [
    {
      q: "TechBrief에 따르면, 'Attention is All You Need' 논문의 인용 횟수는?",
      options: ['약 3만 회', '약 7만 회', '약 14만 회', '약 30만 회'],
      a: 2,
      source: { outlet: 'TechBrief', date: '2024.01.18' },
    },
    {
      q: 'Transformer가 RNN을 대체한 핵심 메커니즘은?',
      options: ['컨볼루션', 'Self-Attention', '강화학습', '드롭아웃'],
      a: 1,
      source: { outlet: 'TechBrief', date: '2024.01.18' },
    },
    {
      q: 'TechBrief 기사가 꼽은 Transformer의 강점은?',
      options: [
        '병렬화와 장거리 의존성 학습',
        '메모리를 가장 적게 씀',
        '학습 시간이 0초',
        '한국어만 잘함',
      ],
      a: 0,
      source: { outlet: 'TechBrief', date: '2024.01.18' },
    },
  ],
};

window.NODINGO_QUIZ_FALLBACK = (label) => [
  {
    q: `이 키워드("${label}")의 출처 뉴스가 아직 충분히 모이지 않았어요. 그래도 도전해 볼까요?`,
    options: [
      '관련 노드를 따라가며 맥락을 모은다',
      '키워드를 잊어버린다',
      '레벨을 낮춘다',
      '코인을 버린다',
    ],
    a: 0,
    source: { outlet: '학습 가이드', date: '–' },
  },
];

// ─── Community / Leaderboard ────────────────────────────────
window.NODINGO_COMMUNITY = [
  { rank: 1,  name: '도현',  avatar: '🦉', level: 28, weekXp: 1840 },
  { rank: 2,  name: '서연',  avatar: '🐺', level: 22, weekXp: 1620 },
  { rank: 3,  name: '민준',  avatar: '🦊', level: 19, weekXp: 1430 },
  { rank: 4,  name: '하윤',  avatar: '🦝', level: 17, weekXp: 1280 },
  { rank: 5,  name: '서준',  avatar: '🐻', level: 15, weekXp: 1140 },
  { rank: 6,  name: '예준',  avatar: '🐧', level: 13, weekXp: 980 },
  { rank: 7,  name: '시우',  avatar: '🐰', level: 11, weekXp: 870 },
  { rank: 8,  name: '지호',  avatar: '🦌', level: 9,  weekXp: 720 },
  { rank: 24, name: '지영',  avatar: '🦊', level: 4,  weekXp: 425, isMe: true },
];
