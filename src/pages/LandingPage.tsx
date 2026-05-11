import { Link } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import Button from '../components/common/Button';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <Navigation />

      {/* Hero */}
      <section className={styles.hero}>
        <span className={styles.badge}>GraphRAG 기반 뉴스 분석</span>
        <h1 className={styles.heroTitle}>
          뉴스를 연결하면<br />
          <span className={styles.highlight}>진실이 보입니다</span>
        </h1>
        <p className={styles.heroSub}>
          AI가 수천 개의 뉴스에서 인물·기업·사건의 관계를 분석해<br />
          당신만의 지식 그래프로 만들어 드립니다.
        </p>
        <div className={styles.heroCta}>
          <Link to="/login">
            <Button size="lg">무료로 시작하기</Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="secondary">로그인</Button>
          </Link>
        </div>

        {/* Graph mockup */}
        <div className={styles.graphMockup}>
          <svg viewBox="0 0 360 280" className={styles.mockupSvg}>
            <defs>
              <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0066cc" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0066cc" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse cx="180" cy="140" rx="160" ry="120" fill="url(#glow)" />
            {/* Edges */}
            {[
              [180, 140, 90, 80], [180, 140, 270, 80], [180, 140, 90, 200],
              [180, 140, 270, 200], [180, 140, 180, 50], [180, 140, 60, 140],
              [180, 140, 300, 140],
            ].map(([x1, y1, x2, y2], i) => (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#0066cc" strokeWidth="1" strokeOpacity="0.25" />
            ))}
            {/* Center node */}
            <circle cx="180" cy="140" r="28" fill="#0066cc" fillOpacity="0.12" stroke="#0066cc" strokeWidth="2" />
            <text x="180" y="136" textAnchor="middle" fontSize="11" fill="#0066cc" fontWeight="700">경제</text>
            <text x="180" y="150" textAnchor="middle" fontSize="9" fill="#0066cc">금리</text>
            {/* Outer nodes */}
            {[
              [90, 80, '#30d158', '한국은행'],
              [270, 80, '#ff9f0a', '기준금리'],
              [90, 200, '#bf5af2', '물가'],
              [270, 200, '#ff453a', '환율'],
              [180, 50, '#0a84ff', '통화정책'],
              [60, 140, '#30d158', '수출'],
              [300, 140, '#ff9f0a', '부동산'],
            ].map(([cx, cy, fill, label], i) => (
              <g key={i}>
                <circle cx={cx as number} cy={cy as number} r="18"
                  fill={fill as string} fillOpacity="0.15"
                  stroke={fill as string} strokeWidth="1.5" />
                <text x={cx as number} y={(cy as number) + 4} textAnchor="middle"
                  fontSize="9" fill={fill as string} fontWeight="600">
                  {label as string}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </section>

      {/* How it works */}
      <section className={styles.howSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>어떻게 동작하나요?</h2>
          <div className={styles.steps}>
            {[
              {
                num: '01',
                title: '관심 분야 선택',
                desc: '경제·정치·기술 등 원하는 분야를 선택하면 AI가 맞춤 뉴스를 수집합니다.',
              },
              {
                num: '02',
                title: '자동 관계 분석',
                desc: 'GraphRAG 기술로 뉴스 속 인물·기업·사건의 연결 고리를 자동 추출합니다.',
              },
              {
                num: '03',
                title: '지식 그래프 탐색',
                desc: '인터랙티브 그래프를 탐색하며 뉴스 맥락을 한눈에 파악하세요.',
              },
            ].map((step) => (
              <div key={step.num} className={styles.step}>
                <span className={styles.stepNum}>{step.num}</span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.featuresSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>주요 기능</h2>
          <div className={styles.features}>
            {[
              {
                icon: '🔗',
                title: '지식 그래프',
                desc: '뉴스에서 추출된 엔티티와 관계를 인터랙티브 그래프로 시각화합니다.',
              },
              {
                icon: '🤖',
                title: 'AI 요약',
                desc: '각 키워드별 핵심 내용을 AI가 자동 요약해 빠르게 파악할 수 있습니다.',
              },
              {
                icon: '🔔',
                title: '맞춤 알림',
                desc: '설정한 시간에 오늘의 추천 뉴스 그래프를 푸시 알림으로 받아보세요.',
              },
              {
                icon: '📌',
                title: '스크랩',
                desc: '중요한 뉴스를 스크랩해 나만의 컬렉션을 만들어 보세요.',
              },
            ].map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>지금 바로 시작해보세요</h2>
          <p className={styles.ctaSub}>네이버 계정으로 5초 만에 가입 완료</p>
          <Link to="/login">
            <Button size="lg">무료로 시작하기</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <p className={styles.footerText}>
            © 2026 Nodingo · AI 융합 캡스톤 디자인
          </p>
        </div>
      </footer>
    </div>
  );
}
