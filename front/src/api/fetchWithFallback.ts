// src/api/fetchWithFallback.ts
// ✅ 백엔드 호출 실패 시, 목업 데이터로 자동 폴백하는 헬퍼

import { API_BASE_URL, FORCE_MOCK } from './config';

export async function fetchJsonOrFallback<T>(
  path: string,
  mockData: T,
  init?: RequestInit,
): Promise<T> {
  if (FORCE_MOCK) {
    console.warn(`[fetchJsonOrFallback] FORCE_MOCK=true → ${path} 에서 목업 사용`);
    return mockData;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, init);

    if (!res.ok) {
      console.warn(
        `[fetchJsonOrFallback] ${path} 응답 상태 코드: ${res.status}, 목업으로 폴백합니다.`,
      );
      return mockData;
    }

    const data = (await res.json()) as T;
    return data;
  } catch (error) {
    console.warn(
      `[fetchJsonOrFallback] ${path} 호출 중 에러 발생, 목업으로 폴백합니다.`,
      error,
    );
    return mockData;
  }
}

