// front/src/store/cartStore.ts
import { create } from 'zustand';

// 장바구니에 담길 아이템 타입 (id는 number로 통일)
export interface CartItem {
  id: number; 
  name: string;
  price: number;
  quantity: number; 
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void; 
  updateQuantity: (id: number, delta: number) => void; 
  clearCart: () => void;
  // Mock 데이터 배열을 직접 받습니다.
  setItems: (newItems: CartItem[]) => void; 
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  
  // ✅ Mock 데이터 혹은 Store 타입 그대로 받을 때의 setItems
  setItems: (newItems) => set({ 
    items: newItems // 단순 할당
  }),

  // 장바구니 추가 로직
  addItem: (newItem) => set((state) => {
    const existingItem = state.items.find(i => i.id === newItem.id);
    if (existingItem) {
      return {
        items: state.items.map(i =>
          i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    }
    // 새 상품은 quantity를 1로 설정하여 추가
    return { items: [...state.items, { ...newItem, quantity: 1 }] };
  }),

  // 삭제 로직
  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  })),

  // 수량 변경 로직
  updateQuantity: (id, delta) => set((state) => ({
    items: state.items.map(i => {
      if (i.id === id) {
        const newQty = i.quantity + delta;
        // 수량이 1 이상일 경우에만 업데이트
        return newQty > 0 ? { ...i, quantity: newQty } : i; 
      }
      return i;
    })
  })),

  clearCart: () => set({ items: [] }),
}));