// src/api/homeApi.ts
import { DEFAULT_USER_ID, MOCK_USERS } from '../constants/userMock';
import { fetchJsonOrFallback } from './fetchWithFallback';
import type { Market, Period, StoreEntity, User, DishDetail, ApiResponse } from './types';

// 🔹 특가 카드에서 사용할 타입
export interface SpecialDeal {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  discountRate?: number;
  currentCount: number;
  threshold: number;
}

// 🔹 1. 현재 유저 정보: 완전 프론트 하드코딩
export async function getCurrentUser(): Promise<User> {
  const user = MOCK_USERS.find((u) => u.id === DEFAULT_USER_ID)!;
  return user;
}

// 🔹 2. 주소 기반 시장 리스트: 실제 API 호출
export async function getMarketsByAddress(address: string): Promise<Market[]> {
    const path = `/markets?address=${encodeURIComponent(address)}`;
    
    const fallbackData: Market[] = [
        // ... (목업 데이터)
    ];

    // ApiResponse<Market[]> 타입을 받습니다.
    const res = await fetchJsonOrFallback<ApiResponse<Market[]>>(path, { 
        message: 'Fail', 
        data: fallbackData 
    });

    // 🚨 수정: 응답 객체 전체 대신, data 필드만 반환
    return res.data; 
}

/// ✅ 3-2 서버 응답 전용 타입
type StoreWithDishesApi = {
  storeId: number;
  storeName: string;
  distance: number;
  dishes: {
    dishId: number;
    dishName: string;
    price: number;
    currentCount: number;
    threshold: number;
  }[];
};

// 🔹 3. 통합 API: 시장 + 기간별 가게/반찬 리스트 
// 백엔드 엔드포인트: /api/stores-with-dishes/{marketId}
/**
 * 특정 시장 ID에 해당하는 가게 목록과 각 가게의 반찬 목록을 조회합니다.
 * @param marketId 조회할 시장 ID
 * @param period 오전/오후 필터링 (선택 사항)
 * @returns 가게 및 반찬 정보 배열 (StoreEntity[])
 */
export async function getStoresWithDishes(
  marketId: number,
  period?: Period,
): Promise<StoreEntity[]> {
  let path = `/stores-with-dishes/${marketId}`;
  if (period) {
    path += `?period=${period}`;
  }

  // 🔸 서버 응답 타입은 StoreWithDishesApi[] 로 받기
  const res = await fetchJsonOrFallback<ApiResponse<StoreWithDishesApi[]>>(path, {
    message: 'OK',
    data: [],
  });

  if (res.message !== 'OK' || !Array.isArray(res.data)) {
    console.error('가게 및 반찬 목록 로딩 실패:', res.message, res.data);
    return [];
  }

  // 🔁 서버 응답 → 프론트에서 쓰는 StoreEntity[] 로 변환
  const stores: StoreEntity[] = res.data.map((store) => ({
    storeId: store.storeId,
    storeName: store.storeName,
    marketId,        // 응답에 없으니 파라미터로 받은 marketId 사용
    marketName: '',  // 필요하면 나중에 서버에서 같이 내려주도록 변경

    // DishBase[] 로 매핑
    dishes: (store.dishes ?? []).map((dish) => ({
      dishId: dish.dishId,
      date: '',                 // 아직 응답에 없으니 빈 값
      period: period ?? '오전',   // 현재 필터링 기준으로 채워줌
      dishName: dish.dishName,
      price: dish.price,
      currentCount: dish.currentCount,
      threshold: dish.threshold,
      imageUrl: undefined,      // 이미지 없으면 일단 비워두기
    })),
  }));

  return stores;
}

// 🔹 4. 오늘의 특가 / 추천 상품 조회: GET /api/home/special
export async function getHomeSpecial(): Promise<SpecialDeal[]> {
  type SpecialRaw = {
    dishId: number;
    dishName: string;
    price: number;
    currentCount: number;
    threshold: number;
    // 백엔드에 있으면 쓰고, 없어도 에러 안 나게 optional
    originalPrice?: number;
    discountRate?: number;
  };

  // ※ config.ts 의 API_BASE_URL 이 이미 `/api` 까지 포함돼 있다고 가정
  const res = await fetchJsonOrFallback<{ message: string; data: SpecialRaw[] }>(
    '/home/special',
    { message: 'OK', data: [] },
  );

  const list = res.data ?? [];

  return list.map((item) => ({
    id: item.dishId,
    name: item.dishName,
    price: item.price,
    originalPrice: item.originalPrice,
    discountRate: item.discountRate,
    currentCount: item.currentCount,
    threshold: item.threshold,
  }));
}

// --------------------
// 5. 3-1 카테고리별 가게/반찬 리스트 반환
//    GET /api/categories/{category}/dishes
// --------------------

// 3-1 API의 Response 구조를 정의
type CategoryDishesResponse = {
  message: string;
  // data 배열의 각 요소는 위에서 정의한 DishDetail 타입과 유사해야 합니다.
  data: DishDetail[]; 
};

/**
 * 카테고리 이름으로 모든 시장의 반찬 리스트를 가져옵니다.
 * @param category 예: '생선', '육류', '김치/젓갈'
 */
export async function getDishesByCategory(
  category: string,
): Promise<DishDetail[]> {
  // Path: /api/categories/{category}/dishes
  const path = `/categories/${encodeURIComponent(category)}/dishes`;
  
  const res = await fetchJsonOrFallback<CategoryDishesResponse>(path, {
    message: 'OK',
    data: [],
  });

  return res.data ?? [];
}