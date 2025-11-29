// front/src/api/cartApi.ts

import { fetchJsonOrFallback } from './fetchWithFallback';
import type { DishDetail } from './types'; // DishDetail 타입은 types.ts에서 가져옵니다.

// 4-1. 장바구니에 반찬을 담는 API (POST /api/cart/items)

// 🔹 요청 본문 타입
export interface AddToCartRequest {
  userId: number; // ✅ number 타입 유지
  dishId: number;
  quantity: number; // 1 이상의 정수
}

// 🔹 성공 응답 데이터 구조 (명세: 담은 반찬 정보 + 개수)
export interface AddedCartItemData extends DishDetail {
  quantity: number; // 담긴 개수
}

// 🔹 API 응답 타입
interface AddToCartResponse {
  message: string;
  data: AddedCartItemData;
}

/**
 * 장바구니에 특정 반찬을 담는 API를 호출합니다.
 * @param req userId, dishId, quantity
 * @returns 성공 시 장바구니에 담긴 아이템 정보 (AddedCartItemData)
 */
export async function addToCart(req: AddToCartRequest): Promise<AddedCartItemData> {
  const path = '/cart/items';
  
  // 성공 시 data 객체에 담긴 반찬 정보와 개수를 반환합니다.
  const fallbackData: AddedCartItemData = { 
    // 최소한의 DishDetail 정보와 quantity를 포함
    dishId: req.dishId, 
    quantity: req.quantity,
    storeId: 0, storeName: 'Unknown', dishName: 'Unknown', 
    date: '', period: 'AM', // 'AM' 또는 'PM' 중 하나로 설정
    dishType: '', 
    price: 0, currentCount: 0, threshold: 0
  };

  const res = await fetchJsonOrFallback<AddToCartResponse>(path, { 
    message: 'Fail', 
    data: fallbackData 
  }, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (res.message !== 'OK' || !res.data) {
    // API 호출이 성공했으나 메시지가 'OK'가 아니거나 데이터가 없으면 오류 처리
    throw new Error(`장바구니 담기 실패: ${res.message}`);
  }

  return res.data;
}

// --------------------
// 5-1. 장바구니 목록 조회 API (GET /api/cart/items)
// --------------------

// 🔹 5-1 명세 응답 타입 (AddedCartItemData의 배열)
interface GetCartItemsResponse {
  message: string;
  data: AddedCartItemData[];
}

// [목업 데이터]
const MOCK_CART_ITEMS: AddedCartItemData[] = [
    {
      dishId: 101, storeId: 7, storeName: '망원 수산', 
      date: '2025-11-28', period: 'AM', dishName: '고등어조림', 
      dishType: '생선', price: 4800, currentCount: 13, threshold: 20, 
      quantity: 1, // 장바구니에 1개 담김
    },
    {
      dishId: 401, storeId: 12, storeName: '전라도 반찬', 
      date: '2025-11-28', period: 'PM', dishName: '파김치 1kg', 
      dishType: '김치/젓갈', price: 15000, currentCount: 3, threshold: 10, 
      quantity: 2, // 장바구니에 2개 담김
    },
];


/**
 * 특정 유저가 담은 모든 반찬 장바구니 목록을 조회합니다.
 * @param userId 장바구니를 조회할 사용자 ID
 * @returns 장바구니 아이템 리스트 (AddedCartItemData[])
 */
export async function getCartItems(userId: number): Promise<AddedCartItemData[]> { // ✅ number 타입 유지
  // 1. API 명세에 맞춘 경로 (Query Parameter 사용)
  const path = `/cart/items?userId=${userId}`;

  // 2. 서버 호출 실패 시 → 목업(MOCK_CART_ITEMS)으로 fallback
  const fallback = { message: 'OK', data: MOCK_CART_ITEMS };

  const res = await fetchJsonOrFallback<GetCartItemsResponse>(path, fallback);

  if (res.message === 'OK' && Array.isArray(res.data)) {
    return res.data;
  }
  // 404 Not Found (장바구니 비어있음) 등의 경우 빈 배열 반환
  if (res.message === 'Not Found') {
    return [];
  }
  
  throw new Error(`장바구니 목록 조회 실패: ${res.message}`);
}

// --------------------
// 5-2. 장바구니 수량 변경 API (PUT /api/cart/items)
// --------------------

// 🔹 요청 본문 타입 (AddToCartRequest와 동일)
export type UpdateCartQuantityRequest = AddToCartRequest;

// 🔹 성공 응답 데이터 구조 (명세: 변경된 반찬 정보 + 개수, AddedCartItemData와 동일)
interface UpdateCartQuantityResponse {
  message: string;
  data: AddedCartItemData;
}

/**
 * 장바구니의 특정 반찬 수량을 변경합니다.
 * @param req userId, dishId, quantity (새로운 수량)
 * @returns 성공 시 변경된 장바구니 아이템 정보 (AddedCartItemData)
 */
export async function updateCartItemQuantity(req: UpdateCartQuantityRequest): Promise<AddedCartItemData> {
  const path = '/cart/items';
  
  // 성공 시 data 객체에 담긴 반찬 정보와 개수를 반환합니다.
  const fallbackData: AddedCartItemData = { 
    dishId: req.dishId, 
    quantity: req.quantity,
    storeId: 0, storeName: 'Unknown', dishName: 'Unknown', 
    date: '2025-01-01', period: 'AM', // 'AM' 또는 'PM' 중 하나로 설정
    dishType: '', 
    price: 0, currentCount: 0, threshold: 0
  };

  const res = await fetchJsonOrFallback<UpdateCartQuantityResponse>(path, { 
    message: 'Fail', 
    data: fallbackData 
  }, {
    method: 'PUT', // PUT 또는 PATCH 사용
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (res.message !== 'OK' || !res.data) {
    throw new Error(`장바구니 수량 변경 실패: ${res.message}`);
  }

  return res.data;
}

// --------------------
// 5-3. 장바구니 항목 삭제 API (DELETE /api/cart/items)
// --------------------

// 🔹 요청 본문 타입
export interface RemoveCartItemRequest {
  userId: number; // ✅ number 타입 유지
  dishId: number;
}

// 🔹 성공 응답 데이터 구조 (명세: 메시지만 반환한다고 가정)
interface RemoveCartItemResponse {
  message: string;
}

/**
 * 장바구니의 특정 반찬 항목을 삭제합니다.
 * @param req userId, dishId
 */
export async function removeCartItem(req: RemoveCartItemRequest): Promise<void> {
  const path = '/cart/items';
  
  // 성공 시 data 객체가 없을 수 있으므로 응답 타입을 비워둡니다.
  const res = await fetchJsonOrFallback<RemoveCartItemResponse>(path, { 
    message: 'Fail'
  }, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (res.message !== 'OK') {
    throw new Error(`장바구니 삭제 실패: ${res.message}`);
  }
  // 성공 시는 아무것도 반환하지 않습니다.
}