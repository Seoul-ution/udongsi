// src/api/types.ts
// ✅ 백엔드 DB 설계를 반영한 공통 타입 정의

// 오전/오후
export type Period = 'AM' | 'PM';

// [프론트 목업 전용] 사용자
export interface User {
  id: string;
  address: string;
}

// [프론트 목업 전용] 시장
export interface Market {
  marketId: string;
  marketName: string;
}

// [백엔드 DB 설계] 반찬 테이블 구조
export interface DishBase {
  dishId: string;
  date: string;       // '2025-11-28'
  period: Period;     // 'AM' | 'PM'
  dishName: string;
  price: number;
  currentCount: number;
  threshold: number;
}

// [백엔드 DB 설계] 가게 테이블 구조
export interface StoreEntity {
  storeId: string;
  storeName: string;
  marketId: string;
  marketName: string;
  dishes: DishBase[]; // 해당 가게의 반찬들
}