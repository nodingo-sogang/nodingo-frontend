import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import styles from './OAuthCallbackPage.module.css';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const onboarded = params.get('onboarded') === 'true';

    if (!accessToken || !refreshToken) {
      navigate('/login', { replace: true });
      return;
    }

    login(accessToken, refreshToken, onboarded);

    if (onboarded) {
      navigate('/graph', { replace: true });
    } else {
      navigate('/onboarding', { replace: true });
    }
  }, [login, navigate]);

  return (
    <div className={styles.page}>
      <div className={styles.spinner} />
      <p className={styles.msg}>로그인 처리 중...</p>
    </div>
  );
}
