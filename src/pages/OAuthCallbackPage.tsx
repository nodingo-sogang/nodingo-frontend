import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import styles from './OAuthCallbackPage.module.css';

const ONBOARDED_KEY = 'nd_onboarded';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (!accessToken || !refreshToken) {
      navigate('/login', { replace: true });
      return;
    }

    // 백엔드가 onboarded 파라미터를 보내지 않으므로 localStorage에서 확인
    const alreadyOnboarded = localStorage.getItem(ONBOARDED_KEY) === 'true';

    login(accessToken, refreshToken, alreadyOnboarded);
    navigate(alreadyOnboarded ? '/graph' : '/onboarding', { replace: true });
  }, [searchParams, login, navigate]);

  return (
    <div className={styles.page}>
      <div className={styles.spinner} />
      <p className={styles.msg}>로그인 처리 중...</p>
    </div>
  );
}
