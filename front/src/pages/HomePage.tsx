// src/pages/HomePage.tsx

import { Bell, Menu, Plus, RefreshCw, Search, Star } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// 컴포넌트 불러오기
import HotDealList from '../components/HotDealList';
import MarketTabs from '../components/MarketTabs';
import TimeFilter, { DeliveryTime } from '../components/TimeFilter';

// API 및 타입
import { getCurrentUser, getMarketsByAddress, getStoresWithDishes } from '../api/homeApi';
import { Market, StoreEntity, Period } from '../api/types';

// 🔁 한글 시간값(오전/오후) → API용 Period(AM/PM) 매핑 함수
const mapDeliveryToPeriod = (time: DeliveryTime): Period => {
  if (time === 'PM') return '오후';
  return '오전'; // 기본값: 오전
};

export default function HomePage({ navigation }: any) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarketId, setSelectedMarketId] = useState<number | null>(null);
  const [period, setPeriod] = useState<DeliveryTime>('AM'); 
  const [stores, setStores] = useState<StoreEntity[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. 초기 로딩
  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser();
        const marketList = await getMarketsByAddress(user.address);

        if (Array.isArray(marketList)) {
          setMarkets(marketList);
          if (marketList.length > 0) {
            setSelectedMarketId(marketList[0].marketId);
          }
        } else {
          setMarkets([]);
          setSelectedMarketId(null);
          console.error('Markets API response was not an array:', marketList);
        }
      } catch (e) {
        console.error('Failed to initialize markets:', e);
        setMarkets([]);
      }
    };
    init();
  }, []);

  // 2. 데이터 페칭
  const fetchData = async () => {
    if (!selectedMarketId) return;
    setLoading(true);
    try {
      // 🔥 한글(오전/오후) → AM/PM으로 변환해서 API 호출
      const apiPeriod = mapDeliveryToPeriod(period);
      const data = await getStoresWithDishes(selectedMarketId, apiPeriod);
      setStores(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMarketId, period]);

  useEffect(() => {
    if (stores.length) {
      console.log('stores[0]', stores[0]);
      console.log('stores[0].dishes', stores[0].dishes);
    }
  }, [stores]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn}>
          <Menu color="#333" size={24} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Search')}
        >
          <Search color="#999" size={20} />
          <Text style={styles.placeholder}>반찬 검색...</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn}>
          <Bell color="#333" size={24} />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
      >
        {/* 시장 탭 */}
        {Array.isArray(markets) && (
          <MarketTabs
            markets={markets.map((m) => ({ id: m.marketId as any, name: m.marketName }))}
            selectedId={selectedMarketId as any}
            onSelect={(id) => setSelectedMarketId(id as any)}
          />
        )}

        {/* 특가 공구 */}
        <HotDealList />

        {/* 시간 필터 (UI는 그대로 한글) */}
        <TimeFilter selectedTime={period} onSelect={setPeriod} />

        {/* 가게별 리스트 */}
        <View style={styles.storeList}>
          {stores.map((store) => (
            <View key={store.storeId} style={styles.storeCard}>
              <View style={styles.storeHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.storeName}>{store.storeName}</Text>
                  <Star
                    size={14}
                    fill="#FFD700"
                    color="#FFD700"
                    style={{ marginLeft: 4 }}
                  />
                  <Text style={styles.storeRating}>125</Text>
                </View>
                <RefreshCw size={16} color="#999" />
              </View>

              {store.dishes.map((dish, idx) => (
                <View
                  key={dish.dishId}
                  style={[
                    styles.dishRow,
                    idx !== store.dishes.length - 1 && styles.borderBottom,
                  ]}
                >
                  <Image
                    source={{
                      uri: dish.imageUrl || 'https://via.placeholder.com/150',
                    }}
                    style={styles.dishImg}
                  />

                  <View style={{ flex: 1 }}>
                    <Text style={styles.dishName}>{dish.dishName}</Text>

                    <View style={styles.miniProgressBg}>
                      <View
                        style={[
                          styles.miniProgressFill,
                          {
                            width: `${(dish.currentCount / dish.threshold) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.miniProgressLabel}>
                      <Text style={styles.miniText}>
                        {dish.currentCount}/{dish.threshold}
                      </Text>
                      <Text style={styles.miniTextOrange}>
                        {dish.threshold - dish.currentCount}개 필요
                      </Text>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
                    <Text style={styles.dishPrice}>
                      ₩{dish.price.toLocaleString()}
                    </Text>
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={() => navigation.navigate('DishDetail', { dish })}
                    >
                      <Plus size={16} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconBtn: { padding: 4 },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    backgroundColor: '#F97316',
    borderRadius: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE4C4',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
    marginHorizontal: 12,
  },
  placeholder: { marginLeft: 8, color: '#666', fontSize: 15 },
  storeList: { paddingHorizontal: 16 },
  storeCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFF7ED',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  storeName: { fontSize: 16, fontWeight: 'bold' },
  storeRating: { marginLeft: 4, color: '#666', fontSize: 13 },
  dishRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dishImg: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#eee',
  },
  dishName: { fontSize: 15, fontWeight: '500', marginBottom: 6 },
  dishPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D97706',
    marginBottom: 6,
  },
  miniProgressBg: {
    height: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 2,
    marginBottom: 4,
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: '#F97316',
    borderRadius: 2,
  },
  miniProgressLabel: { flexDirection: 'row', justifyContent: 'space-between' },
  miniText: { fontSize: 10, color: '#999' },
  miniTextOrange: { fontSize: 10, color: '#F97316', fontWeight: 'bold' },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#84CC16',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
