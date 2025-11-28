// src/api/homeApi.ts
// ✅ 홈 화면에서 사용할 API 래퍼
// - 백엔드 연동 시: 실제 API 호출
// - 연동 실패/미완료 시: 목업 데이터 사용

import { STORE_MOCK } from '../constants/storeMock';
import { ADDRESS_MARKET_MAP, DEFAULT_USER_ID, MOCK_USERS } from '../constants/userMock';
import { fetchJsonOrFallback } from './fetchWithFallback';
import type { Market, Period, StoreEntity, User } from './types';

// 1. 현재 유저 정보
export async function getCurrentUser(): Promise<User> {
  const mockUser = MOCK_USERS.find((u) => u.id === DEFAULT_USER_ID)!;

  // 예시: GET /users/current
  return fetchJsonOrFallback<User>('/users/current', mockUser);
}

// 2. 주소 기반 시장 리스트 조회
export async function getMarketsByAddress(address: string): Promise<Market[]> {
  const mockMarkets = ADDRESS_MARKET_MAP[address] ?? [];

  // 예시: GET /markets?address=...
  const query = `/markets?address=${encodeURIComponent(address)}`;
  return fetchJsonOrFallback<Market[]>(query, mockMarkets);
}

// 3. 시장 + 오전/오후 기준 가게 + 반찬 리스트 조회
export async function getStoresWithDishes(
  marketId: string,
  period: Period,
): Promise<StoreEntity[]> {
  // 🔹 백엔드가 줄 것으로 기대하는 응답 형태: StoreEntity[]
  const apiPath = `/stores?marketId=${marketId}&period=${period}`;

  // 🔹 목업: STORE_MOCK에서 marketId 와 period 에 맞는 것만
  const mockStores = STORE_MOCK
    .filter((store) => store.marketId === marketId)
    .map((store) => ({
      ...store,
      dishes: store.dishes.filter((dish) => dish.period === period),
    }))
    .filter((store) => store.dishes.length > 0);

  return fetchJsonOrFallback<StoreEntity[]>(apiPath, mockStores);
}