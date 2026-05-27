// Knowledge graph data for the Nodingo prototype.
// A user's "AI 학습 노트" with GraphRAG as the centerpiece.

window.NODINGO_NODES = [
  // central
  { id: 'graphrag',     label: 'GraphRAG',      x: 196, y: 360, weight: 3 },

  // level 1 — directly connected to GraphRAG
  { id: 'rag',          label: 'RAG',           x: 102, y: 296, weight: 2 },
  { id: 'knowledge',    label: '지식그래프',    x: 296, y: 274, weight: 2 },
  { id: 'vectordb',     label: '벡터DB',        x: 90,  y: 430, weight: 2 },
  { id: 'llm',          label: 'LLM',           x: 304, y: 462, weight: 2 },
  { id: 'embedding',    label: '임베딩',        x: 184, y: 224, weight: 1 },
  { id: 'chunking',     label: '청킹',          x: 64,  y: 218, weight: 1 },

  // level 2
  { id: 'transformer',  label: 'Transformer',   x: 308, y: 374, weight: 2 },
  { id: 'attention',    label: 'Attention',     x: 248, y: 540, weight: 1 },
  { id: 'gpt',          label: 'GPT',           x: 348, y: 552, weight: 1 },
  { id: 'tokenize',     label: '토큰화',        x: 170, y: 540, weight: 1 },
  { id: 'nlp',          label: '자연어처리',    x: 58,  y: 558, weight: 2 },

  // periphery
  { id: 'finetune',     label: '파인튜닝',      x: 22,  y: 360, weight: 1 },
  { id: 'prompt',       label: '프롬프트',      x: 240, y: 138, weight: 1 },
  { id: 'agent',        label: '에이전트',      x: 42,  y: 130, weight: 1 },
  { id: 'reasoning',    label: '추론',          x: 348, y: 198, weight: 1 },
  { id: 'entity',       label: '엔티티 추출',   x: 332, y: 124, weight: 1 },
  { id: 'cypher',       label: 'Cypher',        x: 24,  y: 478, weight: 1 },
  { id: 'neo4j',        label: 'Neo4j',         x: 174, y: 124, weight: 1 },
  { id: 'multimodal',   label: '멀티모달',      x: 124, y: 632, weight: 1 },
  { id: 'hallucination',label: '환각',          x: 330, y: 632, weight: 1 },
];

window.NODINGO_EDGES = [
  ['graphrag','rag'], ['graphrag','knowledge'], ['graphrag','vectordb'],
  ['graphrag','llm'], ['graphrag','embedding'], ['graphrag','chunking'],
  ['rag','chunking'], ['rag','embedding'], ['rag','vectordb'], ['rag','hallucination'],
  ['knowledge','entity'], ['knowledge','neo4j'], ['knowledge','cypher'],
  ['llm','transformer'], ['llm','attention'], ['llm','gpt'],
  ['llm','prompt'], ['llm','agent'], ['llm','reasoning'],
  ['llm','hallucination'], ['llm','nlp'], ['llm','multimodal'],
  ['transformer','attention'], ['transformer','gpt'],
  ['embedding','tokenize'], ['embedding','vectordb'],
  ['nlp','tokenize'], ['nlp','finetune'],
  ['entity','knowledge'],
];

// Per-keyword AI summary (the "Graph RAG model" output).
// Each entry: { title, kind, summary, related, sources }
window.NODINGO_SUMMARIES = {
  graphrag: {
    title: 'GraphRAG',
    kind: '개념 · AI / 검색',
    summary: 'GraphRAG는 **지식그래프**를 활용해 LLM의 **검색 증강 생성(RAG)** 성능을 끌어올리는 기법이다. 문서를 청크 단위로 벡터화해 유사도 검색만 수행하는 전통적 RAG와 달리, 텍스트에서 **엔티티(Entity)**와 **관계(Relation)**를 추출해 그래프로 구조화한 뒤, 질의 시 관련 서브그래프를 함께 검색해 컨텍스트로 제공한다.\n\n이 방식은 다중 홉(multi-hop) 추론이 필요한 복잡한 질문에 강점을 보이며, 답변의 근거(provenance)를 시각적으로 추적할 수 있다는 점에서 노딩고의 핵심 엔진으로 채택되었다.',
    related: ['rag', 'knowledge', 'vectordb', 'llm', 'embedding', 'chunking', 'entity'],
    sources: ['Microsoft Research, 2024', '내 노트 · 2025.03.12'],
  },
  rag: {
    title: 'RAG',
    kind: '개념 · 검색 증강 생성',
    summary: 'RAG (Retrieval-Augmented Generation)는 LLM이 학습 시점 이후의 지식이나 사적 문서를 다룰 수 있도록, **외부 문서에서 관련 정보를 검색**해 프롬프트에 끼워 넣는 패턴이다. 일반적으로 문서를 **청킹** → **임베딩** → **벡터DB 저장**의 파이프라인으로 색인한다.\n\n장점은 **환각(hallucination) 감소**와 출처 추적이며, 한계는 청크가 단편적이어서 다중 홉 질의에 약하다는 점이다. 이 한계를 보완하기 위해 **GraphRAG**가 등장했다.',
    related: ['graphrag', 'chunking', 'embedding', 'vectordb', 'hallucination'],
    sources: ['Lewis et al., 2020', '내 노트 · 2025.02.04'],
  },
  knowledge: {
    title: '지식그래프',
    kind: '데이터 구조',
    summary: '지식그래프(Knowledge Graph)는 세상의 사실을 **노드(엔티티)**와 **엣지(관계)**의 그래프로 표현하는 데이터 구조다. 관계형 DB에 비해 다대다 관계와 다중 홉 질의에 자연스럽고, 그래프 알고리즘을 직접 적용할 수 있다.\n\n대표 구현으로 **Neo4j**, 질의 언어로 **Cypher**가 있다. 노딩고는 사용자의 메모를 자동으로 엔티티·관계로 분해해 개인 지식그래프를 구축한다.',
    related: ['entity', 'neo4j', 'cypher', 'graphrag'],
    sources: ['Hogan et al., 2021', '내 노트 · 2025.04.02'],
  },
  llm: {
    title: 'LLM',
    kind: '모델 · 거대 언어 모델',
    summary: 'LLM (Large Language Model)은 수십억~수조 개의 파라미터를 가진 **Transformer 기반 언어 모델**이다. 다음 토큰 예측이라는 단일 목표로 사전학습되었지만, 그 결과로 추론·요약·번역·코딩 등 폭넓은 작업을 수행할 수 있다.\n\n프로덕션에서는 **프롬프트 엔지니어링**, **RAG**, **파인튜닝**, **에이전트** 패턴이 주로 활용되며, **환각(hallucination)** 완화가 핵심 과제다.',
    related: ['transformer', 'attention', 'gpt', 'prompt', 'agent', 'hallucination', 'nlp'],
    sources: ['Vaswani et al., 2017', 'Brown et al., 2020'],
  },
  vectordb: {
    title: '벡터DB',
    kind: '인프라',
    summary: '벡터DB는 고차원 임베딩 벡터를 저장하고 **근사 최근접 이웃(ANN)** 검색을 빠르게 수행하는 데이터베이스다. HNSW, IVF 같은 인덱스 구조를 사용해 수억 개의 벡터에서도 ms 단위로 유사 항목을 찾을 수 있다.\n\nRAG 파이프라인의 검색 단계를 담당하며, GraphRAG에서는 벡터 검색과 그래프 탐색을 결합해 사용한다.',
    related: ['embedding', 'rag', 'graphrag'],
    sources: ['Pinecone Docs', 'Weaviate Docs'],
  },
  embedding: {
    title: '임베딩',
    kind: '표현 · Representation',
    summary: '임베딩은 단어·문장·문서 같은 이산적 객체를 **연속적인 고차원 벡터**로 변환하는 표현 학습 방법이다. 의미적으로 유사한 항목이 벡터 공간에서 가까이 위치하도록 학습된다.\n\n현대 RAG 파이프라인의 기반이며, OpenAI text-embedding-3, BGE, E5 등이 널리 쓰인다.',
    related: ['tokenize', 'vectordb', 'rag', 'graphrag'],
    sources: ['Mikolov et al., 2013'],
  },
  transformer: {
    title: 'Transformer',
    kind: '아키텍처',
    summary: '2017년 Google이 "Attention is All You Need"에서 제안한 아키텍처. RNN의 순차 처리 한계를 **Self-Attention**으로 대체해 병렬화와 장거리 의존성 학습을 동시에 해결했다.\n\n오늘날 거의 모든 LLM, 비전·오디오 모델의 표준 백본이다.',
    related: ['attention', 'llm', 'gpt'],
    sources: ['Vaswani et al., 2017'],
  },
  chunking: {
    title: '청킹',
    kind: '전처리',
    summary: '청킹(Chunking)은 긴 문서를 임베딩하기 좋은 단위로 잘라내는 전처리 단계다. 너무 작으면 맥락이 깨지고, 너무 크면 검색 정확도가 떨어진다.\n\n문장·문단·시맨틱 청킹 등 다양한 전략이 있으며, GraphRAG에서는 청크 사이의 관계 자체를 그래프로 보존한다.',
    related: ['rag', 'graphrag', 'embedding'],
    sources: ['LangChain Docs'],
  },
};

// Generic fallback for nodes without a hand-written summary.
window.NODINGO_FALLBACK = (id, label) => ({
  title: label,
  kind: '개념',
  summary: `**${label}**에 대한 노트가 아직 충분히 쌓이지 않았다. 관련 노드를 따라가며 맥락을 탐색해 보자.\n\n노딩고는 사용자의 메모와 외부 자료를 통합해 이 키워드를 둘러싼 지식 그래프를 점진적으로 확장한다.`,
  related: (window.NODINGO_EDGES
    .filter(([a,b]) => a===id || b===id)
    .map(([a,b]) => a===id ? b : a)),
  sources: ['관련 노트 자동 수집 중'],
});
