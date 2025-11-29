// src/constants/user.ts
// 유저 정보 및 시장 매핑 목업 데이터

import type { Market, User } from '../api/types';

export const MOCK_USERS: User[] = [
  { id: 1, address: '서울시 마포구 망원동' },
  { id: 2, address: '서울시 마포구 합정동' },
];

// 주소 → 배달 가능한 시장 리스트
export const ADDRESS_MARKET_MAP: Record<string, Market[]> = {
  '서울시 마포구 망원동': [
    { marketId: 1, marketName: '망원시장' },
    { marketId: 2, marketName: '마포시장' },
  ],
  '서울시 마포구 합정동': [
    { marketId: 1, marketName: '망원시장' },
    { marketId: 3, marketName: '홍대시장' },
  ],
};

// 로그인 없으니, 기본 유저 하나 가정
export const DEFAULT_USER_ID = 1;
