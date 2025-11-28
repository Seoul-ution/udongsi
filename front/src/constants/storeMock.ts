// src/constants/storeMock.ts

import type { StoreEntity } from '../api/types';

export const STORE_MOCK: StoreEntity[] = [
  {
    storeId: 'store-1',
    storeName: '김네집 반찬',
    marketId: 'market-1',
    marketName: '망원시장',
    dishes: [
      {
        dishId: 'dish-1',
        date: '2025-11-28',
        period: 'AM',
        dishName: '우엉볶음 200g',
        price: 2900,
        currentCount: 6,
        threshold: 10,
      },
      {
        dishId: 'dish-2',
        date: '2025-11-28',
        period: 'PM',
        dishName: '고등어 구이 1마리',
        price: 3800,
        currentCount: 3,
        threshold: 10,
      },
    ],
  },
  {
    storeId: 'store-2',
    storeName: '이모네 반찬',
    marketId: 'market-2',
    marketName: '마포시장',
    dishes: [
      {
        dishId: 'dish-3',
        date: '2025-11-28',
        period: 'AM',
        dishName: '잡채 300g',
        price: 4500,
        currentCount: 8,
        threshold: 10,
      },
    ],
  },
];
