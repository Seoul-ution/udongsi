import { create } from 'zustand';

// 장바구니에 담길 아이템 타입
export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string | number) => void;
  updateQuantity: (id: string | number, delta: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  
  // 장바구니 추가 로직 (이미 있으면 수량 +1)
  addItem: (newItem) => set((state) => {
    const existingItem = state.items.find(i => i.id === newItem.id);
    if (existingItem) {
      return {
        items: state.items.map(i =>
          i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    }
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
        return newQty > 0 ? { ...i, quantity: newQty } : i;
      }
      return i;
    })
  })),

  // 전체 비우기
  clearCart: () => set({ items: [] }),
}));