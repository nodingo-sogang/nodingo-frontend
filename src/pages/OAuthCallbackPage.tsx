import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { userApi } from '../api/user';
import styles from './OAuthCallbackPage.module.css';

const ONBOARDED_KEY = 'nd_onboarded';

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, setOnboarded } = useAuthStore();
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

    // 온보딩 완료 여부는 localStorage가 아니라 백엔드 상태를 진실로 본다.
    // (다른 브라우저/캐시 삭제 시에도 이미 온보딩한 계정은 온보딩을 반복하지 않도록)
    const localOnboarded = localStorage.getItem(ONBOARDED_KEY) === 'true';
    login(accessToken, refreshToken, localOnboarded); // 토큰부터 저장 (이후 API 호출용)

    (async () => {
      try {
        const res = await userApi.getOnboardingStatus();
        if (res.data.data?.status === 'COMPLETED') {
          setOnboarded();
          navigate('/graph', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      } catch {
        // 상태 조회 실패 시 기존 localStorage 기준으로 폴백
        navigate(localOnboarded ? '/graph' : '/onboarding', { replace: true });
      }
    })();
  }, [searchParams, login, setOnboarded, navigate]);

  return (
    <div className={styles.page}>
      <div className={styles.spinner} />
      <p className={styles.msg}>로그인 처리 중...</p>
    </div>
  );
}
