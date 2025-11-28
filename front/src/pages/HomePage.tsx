import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Alert, View, Text, Image, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Menu, Bell, Search, Plus, RefreshCw, Star } from 'lucide-react-native';

import MarketTabs from '../components/MarketTabs';
import TimeFilter, { DeliveryTime } from '../components/TimeFilter';
import HotDealList from '../components/HotDealList';

import { getCurrentUser, getMarketsByAddress, getStoresWithDishes } from '../api/homeApi';
import { Market, StoreEntity } from '../api/types';

export default function HomePage({ navigation }: any) {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [period, setPeriod] = useState<DeliveryTime>('AM');
  const [stores, setStores] = useState<StoreEntity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await getCurrentUser();
        const marketList = await getMarketsByAddress(user.address);
        setMarkets(marketList);
        if (marketList.length > 0) setSelectedMarketId(marketList[0].marketId);
      } catch (e) { console.error(e); }
    };
    init();
  }, []);

  const fetchData = async () => {
    if (!selectedMarketId) return;
    setLoading(true);
    try {
      const data = await getStoresWithDishes(selectedMarketId, period as any);
      setStores(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedMarketId, period]);

  // ✅ [수정된 부분] 헤더 렌더링
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.iconBtn}>
        <Menu color="#333" size={24} />
      </TouchableOpacity>
      
      {/* 검색바 영역에 TouchableOpacity를 추가하여 검색 페이지로 이동 */}
      <TouchableOpacity 
        style={styles.searchBar} 
        onPress={() => navigation.navigate('Search')} // 👈 Search 페이지로 이동
        activeOpacity={0.8}
      >
        <Search color="#999" size={20} />
        <Text style={styles.placeholder}>반찬 검색...</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.iconBtn}>
        <Bell color="#333" size={24} />
        <View style={styles.badge} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()} {/* 수정된 헤더 사용 */}

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchData} />}
      >
        {/* MarketTabs, HotDealList, TimeFilter, StoreList... (나머지는 그대로 유지) */}
        <MarketTabs 
          markets={markets.map(m => ({ id: m.marketId as any, name: m.marketName }))} 
          selectedId={selectedMarketId as any} 
          onSelect={(id) => setSelectedMarketId(id as any)} 
        />
        <HotDealList />
        <TimeFilter selectedTime={period} onSelect={setPeriod} />

        <View style={styles.storeList}>
          {stores.map((store) => (
            <View key={store.storeId} style={styles.storeCard}>
              <View style={styles.storeHeader}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={styles.storeName}>{store.storeName}</Text>
                  <Star size={14} fill="#FFD700" color="#FFD700" style={{marginLeft: 4}} />
                  <Text style={styles.storeRating}>125</Text>
                </View>
                <RefreshCw size={16} color="#999" />
              </View>

              {store.dishes.map((dish, idx) => (
                <View key={dish.dishId} style={[styles.dishRow, idx !== store.dishes.length - 1 && styles.borderBottom]}>
                  <Image source={{ uri: dish.imageUrl || 'https://via.placeholder.com/150' }} style={styles.dishImg} />
                  <View style={{flex: 1}}>
                    <Text style={styles.dishName}>{dish.dishName}</Text>
                    <View style={styles.miniProgressBg}>
                      <View style={[styles.miniProgressFill, { width: `${(dish.currentCount / dish.threshold) * 100}%` }]} />
                    </View>
                    <View style={styles.miniProgressLabel}>
                      <Text style={styles.miniText}>{dish.currentCount}/{dish.threshold}</Text>
                      <Text style={styles.miniTextOrange}>{dish.threshold - dish.currentCount}개 필요</Text>
                    </View>
                  </View>
                  <View style={{alignItems: 'flex-end', marginLeft: 10}}>
                    <Text style={styles.dishPrice}>₩{dish.price.toLocaleString()}</Text>
                    <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('DishDetail', { dish })}>
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
  
  // 헤더 스타일
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  iconBtn: { padding: 4 },
  badge: { position: 'absolute', top: 4, right: 4, width: 8, height: 8, backgroundColor: '#F97316', borderRadius: 4 },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFE4C4', borderRadius: 20, paddingHorizontal: 12, height: 40, marginHorizontal: 12 }, // View에서 TouchableOpacity로 변경되지만, 스타일은 재사용
  placeholder: { marginLeft: 8, color: '#666', fontSize: 15 },
  
  // Store List Styles (나머지는 그대로 유지)
  storeList: { paddingHorizontal: 16 },
  storeCard: { backgroundColor: '#FFF', borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#FFF7ED', padding: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  storeHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  storeName: { fontSize: 16, fontWeight: 'bold' },
  storeRating: { marginLeft: 4, color: '#666', fontSize: 13 },
  dishRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dishImg: { width: 50, height: 50, borderRadius: 25, marginRight: 12, backgroundColor: '#eee' },
  dishName: { fontSize: 15, fontWeight: '500', marginBottom: 6 },
  dishPrice: { fontSize: 14, fontWeight: 'bold', color: '#D97706', marginBottom: 6 },
  miniProgressBg: { height: 4, backgroundColor: '#F3F4F6', borderRadius: 2, marginBottom: 4 },
  miniProgressFill: { height: '100%', backgroundColor: '#F97316', borderRadius: 2 },
  miniProgressLabel: { flexDirection: 'row', justifyContent: 'space-between' },
  miniText: { fontSize: 10, color: '#999' },
  miniTextOrange: { fontSize: 10, color: '#F97316', fontWeight: 'bold' },
  addBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#84CC16', alignItems: 'center', justifyContent: 'center' },
});