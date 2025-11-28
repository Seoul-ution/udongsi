// src/pages/HomePage.tsx

import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  getCurrentUser,
  getMarketsByAddress,
  getStoresWithDishes,
} from '../api/homeApi';
import type { Market, Period, StoreEntity } from '../api/types';

export default function HomePage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('AM');
  const [stores, setStores] = useState<StoreEntity[]>([]);
  const [loading, setLoading] = useState(false);

  // 1️⃣ 초기: 유저 → 주소 → 시장 리스트 가져오기
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        const marketList = await getMarketsByAddress(user.address);
        setMarkets(marketList);
        if (marketList.length > 0) {
          setSelectedMarketId(marketList[0].marketId);
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // 2️⃣ 선택된 시장/오전·오후에 맞는 가게+반찬 조회
  useEffect(() => {
    const fetchStores = async () => {
      if (!selectedMarketId) return;
      setLoading(true);
      try {
        const data = await getStoresWithDishes(selectedMarketId, period);
        setStores(data);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, [selectedMarketId, period]);

  const selectedMarket = markets.find((m) => m.marketId === selectedMarketId);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>우동시 🥘</Text>
      <Text style={styles.subtitle}>우리 동네 시장 반찬 공동구매</Text>

      {/* 시장 선택 탭 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.marketTabs}
      >
        {markets.map((m) => {
          const active = m.marketId === selectedMarketId;
          return (
            <Pressable
              key={m.marketId}
              onPress={() => setSelectedMarketId(m.marketId)}
              style={[styles.marketTab, active && styles.marketTabActive]}
            >
              <Text
                style={[
                  styles.marketTabText,
                  active && styles.marketTabTextActive,
                ]}
              >
                {m.marketName}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* 오전/오후 필터 */}
      <View style={styles.timeFilter}>
        {(['AM', 'PM'] as Period[]).map((p) => {
          const active = p === period;
          return (
            <Pressable
              key={p}
              onPress={() => setPeriod(p)}
              style={[styles.timeButton, active && styles.timeButtonActive]}
            >
              <Text
                style={[
                  styles.timeButtonText,
                  active && styles.timeButtonTextActive,
                ]}
              >
                {p === 'AM' ? '오전' : '오후'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 제목 */}
      <Text style={styles.sectionTitle}>
        {selectedMarket ? selectedMarket.marketName : '시장 선택 없음'} ·{' '}
        {period === 'AM' ? '오전' : '오후'} 공구 반찬
      </Text>

      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}

      {!loading && (
        <ScrollView style={styles.dishList}>
          {stores.map((store) => (
            <View key={store.storeId} style={styles.storeBlock}>
              <Text style={styles.storeName}>{store.storeName}</Text>
              {store.dishes.map((dish) => (
                <View key={dish.dishId} style={styles.dishCard}>
                  <Text style={styles.dishName}>{dish.dishName}</Text>
                  <Text style={styles.price}>
                    {dish.price.toLocaleString()}원
                  </Text>
                  <Text style={styles.progressText}>
                    {dish.currentCount} / {dish.threshold}명
                  </Text>
                </View>
              ))}
            </View>
          ))}

          {stores.length === 0 && (
            <Text style={styles.emptyText}>
              선택한 조건에 해당하는 반찬이 없어요 😥
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 40, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: '800' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 16 },
  marketTabs: { marginBottom: 12 },
  marketTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  marketTabActive: { backgroundColor: '#ff7043', borderColor: '#ff7043' },
  marketTabText: { fontSize: 13, color: '#555' },
  marketTabTextActive: { color: '#fff', fontWeight: '600' },
  timeFilter: { flexDirection: 'row', marginBottom: 12 },
  timeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  timeButtonActive: { backgroundColor: '#4caf50', borderColor: '#4caf50' },
  timeButtonText: { fontSize: 13, color: '#555' },
  timeButtonTextActive: { color: '#fff', fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  dishList: { flex: 1 },
  storeBlock: { marginBottom: 12 },
  storeName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  dishCard: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dishName: { fontSize: 14, fontWeight: '500' },
  price: { fontSize: 13, fontWeight: '600' },
  progressText: { fontSize: 12, color: '#999' },
  emptyText: { marginTop: 20, fontSize: 13, color: '#888' },
});