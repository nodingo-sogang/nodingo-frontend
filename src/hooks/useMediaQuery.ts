import { useEffect, useState } from 'react';

/**
 * CSS 미디어 쿼리 매칭 여부를 반환하는 훅.
 * 예) const isDesktop = useMediaQuery('(min-width: 1024px)');
 *
 * 한 코드베이스에서 모바일/데스크톱 레이아웃을 분기할 때 사용한다.
 * 로직·데이터·API 는 그대로 공유하고, 이 값으로 레이아웃만 바꾼다.
 */
export function useMediaQuery(query: string): boolean {
  const getMatch = () =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false;

  const [matches, setMatches] = useState(getMatch);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}
