// front/src/api/categoryApi.ts
import { fetchJsonOrFallback } from './fetchWithFallback';


// [목업 데이터] 카테고리별로 다른 데이터를 정의합니다.
const MOCK_DB: Record<string, any[]> = {
  fish: [
    {
      marketName: '망원시장',
      stores: [
        {
          storeId: 's1',
          storeName: '청정 수산',
          products: [
            { id: 'p1', name: '고등어조림 200g', price: 4800, current: 13, total: 20, img: 'https://via.placeholder.com/150' },
            { id: 'p2', name: '오징어 2마리', price: 3000, current: 4, total: 8, img: 'https://via.placeholder.com/150' },
          ]
        }
      ]
    },
    {
      marketName: '노량진 수산시장',
      stores: [
        {
          storeId: 's2',
          storeName: '형제 상회',
          products: [
            { id: 'p3', name: '모둠회 소', price: 35000, current: 2, total: 5, img: 'https://via.placeholder.com/150' },
          ]
        }
      ]
    }
  ],
  meat: [
    {
      marketName: '마장동 축산물시장',
      stores: [
        {
          storeId: 'm1',
          storeName: '한우 명가',
          products: [
            { id: 'm_p1', name: '1++ 등심 300g', price: 45000, current: 5, total: 10, img: 'https://via.placeholder.com/150' },
            { id: 'm_p2', name: '국거리용 양지', price: 12000, current: 8, total: 20, img: 'https://via.placeholder.com/150' },
          ]
        }
      ]
    }
  ],
  vege: [
    {
      marketName: '경동시장',
      stores: [
        {
          storeId: 'v1',
          storeName: '할머니 나물',
          products: [
            { id: 'v_p1', name: '고사리 나물', price: 5000, current: 10, total: 30, img: 'https://via.placeholder.com/150' },
            { id: 'v_p2', name: '시금치 한 단', price: 2000, current: 15, total: 20, img: 'https://via.placeholder.com/150' },
          ]
        }
      ]
    }
  ],
  side: [
    {
      marketName: '광장시장',
      stores: [
        {
          storeId: 'side1',
          storeName: '전라도 반찬',
          products: [
            { id: 's_p1', name: '파김치 1kg', price: 15000, current: 3, total: 10, img: 'https://via.placeholder.com/150' },
          ]
        }
      ]
    }
  ]
};

export const getCategoryProducts = async (category: string, period: string) => {
  // 0. 로딩 연출용 딜레이 (선택)
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 1. API 명세에 맞춘 경로
  const path = `/categories/${category}/dishes?period=${period}`;

  // 2. 서버 호출 못 하거나 에러 나면 → 목업(MOCK_DB[category])로 fallback
  const fallback = MOCK_DB[category] || [];

  return fetchJsonOrFallback<any[]>(path, fallback);
};