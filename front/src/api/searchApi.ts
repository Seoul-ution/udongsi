// src/api/searchApi.ts
import { API_BASE_URL } from './config';
import { Dish } from '../components/DishCard';

export async function searchDishes(keyword: string): Promise<Dish[]> {
  if (!keyword.trim()) return [];

  const url = `${API_BASE_URL}/common/search?keyword=${encodeURIComponent(keyword)}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`검색 실패: ${res.status}`);
  }

  const json = await res.json();

  const items = json.data ?? [];

  return items.map((item: any): Dish => ({
    id: item.dishId,
    name: item.dishName,
    price: item.price,
    rating: 0,
    imageUrl: 'https://via.placeholder.com/150',
    current: item.currentCount,
    total: item.threshold,
    storeName: item.storeName,
  }));
}
