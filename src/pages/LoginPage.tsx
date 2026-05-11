import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import styles from './LoginPage.module.css';

const IS_DEV = import.meta.env.DEV;

export default function LoginPage() {
  const { isAuthenticated, isOnboarded, login } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isOnboarded ? '/graph' : '/onboarding', { replace: true });
    }
  }, [isAuthenticated, isOnboarded, navigate]);

  const handleNaverLogin = () => {
    window.location.href = authApi.naverLoginUrl();
  };

  const handleDevLogin = () => {
    login('dev-token', 'dev-refresh', true);
    navigate('/graph', { replace: true });
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoWrap}>
          <svg width="40" height="40" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="4" fill="#0066cc" />
            <circle cx="4" cy="5" r="2.5" fill="#0066cc" opacity="0.7" />
            <circle cx="18" cy="5" r="2.5" fill="#0066cc" opacity="0.7" />
            <circle cx="4" cy="17" r="2.5" fill="#0066cc" opacity="0.7" />
            <circle cx="18" cy="17" r="2.5" fill="#0066cc" opacity="0.7" />
            <line x1="11" y1="11" x2="4" y2="5" stroke="#0066cc" strokeWidth="1.5" opacity="0.4" />
            <line x1="11" y1="11" x2="18" y2="5" stroke="#0066cc" strokeWidth="1.5" opacity="0.4" />
            <line x1="11" y1="11" x2="4" y2="17" stroke="#0066cc" strokeWidth="1.5" opacity="0.4" />
            <line x1="11" y1="11" x2="18" y2="17" stroke="#0066cc" strokeWidth="1.5" opacity="0.4" />
          </svg>
          <span className={styles.logoName}>Nodingo</span>
        </div>

        <h1 className={styles.title}>로그인</h1>
        <p className={styles.sub}>네이버 계정으로 간편하게 시작하세요</p>

        <button className={styles.naverBtn} onClick={handleNaverLogin}>
          {/* Naver N logo */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="4" fill="#03C75A" />
            <path d="M13.5 12.5L10.2 7H7v10h3.5v-5.5L13.8 17H17V7h-3.5v5.5z" fill="white" />
          </svg>
          네이버로 시작하기
        </button>

        <p className={styles.terms}>
          로그인 시{' '}
          <span className={styles.termLink}>이용약관</span>
          {' '}및{' '}
          <span className={styles.termLink}>개인정보처리방침</span>
          에 동의하게 됩니다.
        </p>

        {IS_DEV && (
          <button className={styles.devBtn} onClick={handleDevLogin}>
            🛠 개발자 모드로 보기 (Mock 데이터)
          </button>
        )}
      </div>
    </div>
  );
}
