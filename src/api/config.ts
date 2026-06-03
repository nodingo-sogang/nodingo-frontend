// API 동작 모드 설정
//
// VITE_USE_MOCK=true 로 빌드/실행하면 실서버 호출을 건너뛰고
// 항상 mock 데이터를 사용한다. (백엔드 미배포 구간에서 전체 화면을 mock으로 강제)
//
// 미설정/false 면 기존 동작: 실서버를 호출하고 실패 시 각 쿼리에서 mock 으로 fallback.
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
