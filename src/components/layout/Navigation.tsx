import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import styles from './Navigation.module.css';

interface NavigationProps {
  dark?: boolean;
}

export default function Navigation({ dark = false }: NavigationProps) {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className={[styles.nav, dark ? styles.dark : ''].filter(Boolean).join(' ')}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <circle cx="11" cy="11" r="4" fill="currentColor" />
            <circle cx="4" cy="5" r="2.5" fill="currentColor" opacity="0.7" />
            <circle cx="18" cy="5" r="2.5" fill="currentColor" opacity="0.7" />
            <circle cx="4" cy="17" r="2.5" fill="currentColor" opacity="0.7" />
            <circle cx="18" cy="17" r="2.5" fill="currentColor" opacity="0.7" />
            <line x1="11" y1="11" x2="4" y2="5" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <line x1="11" y1="11" x2="18" y2="5" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <line x1="11" y1="11" x2="4" y2="17" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <line x1="11" y1="11" x2="18" y2="17" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
          </svg>
          <span>Nodingo</span>
        </Link>

        <div className={styles.actions}>
          {isAuthenticated ? (
            <>
              <Link to="/graph" className={styles.link}>그래프</Link>
              <button onClick={handleLogout} className={styles.link}>로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.link}>로그인</Link>
              <Link to="/login" className={styles.cta}>시작하기</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
