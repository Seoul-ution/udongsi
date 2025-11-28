// src/api/config.ts
// ✅ 백엔드 연동/목업 동작 설정

// 나중에는 EXPO_PUBLIC_API_BASE_URL 같은 환경변수로 바꿔도 됨
export const API_BASE_URL = 'http://localhost:8080'; // 예시

// 개발 중에 "무조건 목업만 쓰고 싶다"면 true 로 바꾸면 됨
export const FORCE_MOCK = false;