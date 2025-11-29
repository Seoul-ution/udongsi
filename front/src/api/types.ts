// src/api/types.ts
// ✅ 백엔드 DB 설계를 반영한 공통 타입 정의

// 오전/오후
export type Period = 'AM' | 'PM';

// [프론트 목업 전용] 사용자
export interface User {
  id: number;
  address: string;
}

// [프론트 목업 전용] 시장
export interface Market {
  marketId: number;
  marketName: string;
}

export interface DishBase {
  dishId: number;
  date: string;
  period: Period;
  dishName: string;
  price: number;
  currentCount: number;
  threshold: number;
  imageUrl?: string; 
}

// [백엔드 DB 설계] 가게 테이블 구조
export interface StoreEntity {
  storeId: number;
  storeName: string;
  marketId: number;
  marketName: string;
  dishes: DishBase[]; // 해당 가게의 반찬들
}

export type DishDetail = {
  dishId: number;
  storeId: number; 
  storeName: string;
  date: string;
  period: Period; 
  dishName: string;
  dishType: string;
  price: number;
  currentCount: number;
  threshold: number;
};

export interface ApiResponse<T> {
  // 응답 메시지 (성공: "OK", 실패: "Bad Request" 등)
  message: string; 
  data: T; 
}