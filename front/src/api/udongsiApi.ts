// src/api/udongsiApi.ts
// 우동시(우리 동네 시장) 관련 API들을 한 곳에서 관리하는 통합 파일

import { fetchJsonOrFallback } from './fetchWithFallback';
import type { DishBase, Market, User } from './types';

// -------------------------------------------------------
// 공통 타입
// -------------------------------------------------------

export type TimeOption = 'am' | 'pm';
export type CategoryKey = 'fish' | 'meat' | 'veggie' | 'kimchi';

// 홈 탭 UI용
export interface HomeMarketTab {
  id: number;
  name: string;
}

export interface HomeDishCardData {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  rating?: number;
}

// 카테고리 섹션 UI용 (시장 단위 → 가게 단위 → 반찬 리스트)
export interface CategoryMarketSection {
  marketId: number;
  marketName: string;
  stores: {
    storeId: number;
    storeName: string;
    dishes: {
      dishId: number;
      dishName: string;
      price: number;
      currentCount: number;
      threshold: number;
      imageUrl: string;
    }[];
  }[];
}

// 장바구니 API용 Payload
export interface CartItemPayload {
  userId: number;
  dishId: number;
  quantity: number;
}

// -------------------------------------------------------
// 목업 데이터
// -------------------------------------------------------

// 유저 목업
const MOCK_USERS: User[] = [
  { id: 1, address: '서울시 마포구 망원동' },
];

// 시장 목업
const MOCK_MARKETS: Market[] = [
  { marketId: 1, marketName: '망원시장' },
  { marketId: 2, marketName: '수산시장 A' },
];

// 홈 탭 상단 시장 탭 목업
const MOCK_HOME_MARKETS: HomeMarketTab[] = [
  { id: 1, name: '시장 1' },
  { id: 2, name: '시장 2' },
  { id: 3, name: '시장 3' },
  { id: 4, name: '시장 4' },
];

// 홈 탭 메인 카드 목업
const MOCK_HOME_DISHES: HomeDishCardData[] = [
  {
    id: 1,
    name: '프리미엄 김치 세트',
    price: 12100,
    imageUrl:
      'https://images.pexels.com/photos/6937405/pexels-photo-6937405.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.8,
  },
  {
    id: 2,
    name: '제철 나물 모둠',
    price: 8900,
    imageUrl:
      'https://images.pexels.com/photos/2092906/pexels-photo-2092906.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.6,
  },
  {
    id: 3,
    name: '고등어구이 정식',
    price: 9800,
    imageUrl:
      'https://images.pexels.com/photos/6287529/pexels-photo-6287529.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.7,
  },
];

// 카테고리 섹션(시장 → 가게 → 반찬) 목업
const MOCK_CATEGORY_SECTIONS: CategoryMarketSection[] = [
  {
    marketId: 1,
    marketName: '망원시장',
    stores: [
      {
        storeId: 1,
        storeName: '△△ 가게',
        dishes: [
          {
            dishId: 1,
            dishName: '고등어조림 200g',
            price: 4800,
            currentCount: 13,
            threshold: 20,
            imageUrl:
              'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=800',
          },
          {
            dishId: 2,
            dishName: '오징어 2마리',
            price: 3000,
            currentCount: 4,
            threshold: 8,
            imageUrl:
              'https://images.pexels.com/photos/1282429/pexels-photo-1282429.jpeg?auto=compress&cs=tinysrgb&w=800',
          },
        ],
      },
      {
        storeId: 2,
        storeName: '★★ 가게',
        dishes: [
          {
            dishId: 3,
            dishName: '꽃게 3마리 세트',
            price: 8000,
            currentCount: 3,
            threshold: 6,
            imageUrl:
              'https://images.pexels.com/photos/5409025/pexels-photo-5409025.jpeg?auto=compress&cs=tinysrgb&w=800',
          },
          {
            dishId: 4,
            dishName: '새우 2마리',
            price: 3000,
            currentCount: 4,
            threshold: 8,
            imageUrl:
              'https://images.pexels.com/photos/3731474/pexels-photo-3731474.jpeg?auto=compress&cs=tinysrgb&w=800',
          },
        ],
      },
    ],
  },
];

// -------------------------------------------------------
// 공통 fetch 헬퍼
// -------------------------------------------------------

async function getWithFallback<T>(
  path: string,
  mock: T,
  init?: RequestInit,
): Promise<T> {
  return fetchJsonOrFallback<T>(path, mock, init);
}

// -------------------------------------------------------
// homeApi
// -------------------------------------------------------

export const homeApi = {
  /**
   * 홈 탭 데이터 (배너용 시장 탭 + 오늘의 반찬 카드)
   */
  async fetchHomeData(userId: number) {
    // 지금은 userId를 안 쓰고 목업만 반환
    const mock = {
      markets: MOCK_HOME_MARKETS,
      dishes: MOCK_HOME_DISHES,
    };

    return getWithFallback('/home', mock);
  },
};

// -------------------------------------------------------
// categoryApi
// -------------------------------------------------------

export const categoryApi = {
  /**
   * 카테고리(생선/고기/야채/김치 등)별 시장/가게/반찬 섹션
   */
  async fetchCategorySections({
    category,
    time,
  }: {
    category: CategoryKey;
    time: TimeOption;
  }): Promise<CategoryMarketSection[]> {
    // 지금은 category, time을 쓰지 않고 동일한 목업 반환
    console.log('[categoryApi] category=', category, 'time=', time);
    return getWithFallback('/categories', MOCK_CATEGORY_SECTIONS);
  },
};

// -------------------------------------------------------
// cartApi
// -------------------------------------------------------

export const cartApi = {
  /**
   * 현재 유저 장바구니 조회
   * (백엔드 연동 전까지는 빈 배열 반환)
   */
  async fetchCart(userId: number) {
    console.log('[cartApi] fetchCart userId=', userId);
    // 나중에 GET /cart?userId=... 로 교체
    return [] as CartItemPayload[];
  },

  /**
   * 장바구니에 반찬 추가
   * (백엔드 연동 전까지는 그대로 echo)
   */
  async addToCart(payload: CartItemPayload) {
    console.log('[cartApi] addToCart payload=', payload);
    // 나중에 POST /cart 로 교체
    return payload;
  },
};

// -------------------------------------------------------
// marketApi
// -------------------------------------------------------

export const marketApi = {
  /**
   * 유저 기준 근처 시장 리스트
   */
  async fetchNearbyMarkets(userId: number): Promise<Market[]> {
    console.log('[marketApi] fetchNearbyMarkets userId=', userId);
    // 예: GET /markets/nearby?userId=...
    const path = `/markets/nearby?userId=${userId}`;
    return getWithFallback(path, MOCK_MARKETS);
  },
};

// -------------------------------------------------------
// dishApi
// -------------------------------------------------------

export const dishApi = {
  /**
   * 특정 가게(storeId)의 반찬 리스트
   */
  async fetchDishesByStore(storeId: number): Promise<DishBase[]> {
    console.log('[dishApi] fetchDishesByStore storeId=', storeId);
    const path = `/stores/${storeId}/dishes`;
    // 목업은 없으므로 빈 배열을 폴백으로 사용
    return getWithFallback<DishBase[]>(path, []);
  },
};