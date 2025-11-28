// front/src/pages/CategoryPage.tsx
import { Bell, Carrot, Drumstick, Fish, Leaf, Menu, Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { addToCart } from '../api/cartApi'; // cartApi.ts 파일에서 import

// ❌ 기존: getCategoryProducts from '../api/categoryApi'
// ✅ 변경: getDishesByCategory from '../api/homeApi' (또는 해당 API 파일)
import { getDishesByCategory } from '../api/homeApi'; // 가정: homeApi.ts에 3-1 API 함수가 정의됨
import TimeFilter, { DeliveryTime } from '../components/TimeFilter';
import { useCartStore } from '../store/cartStore';
import { DishDetail } from '../api/types'; // DishDetail 타입 import

// 카테고리 ID와 API에서 사용하는 이름(apiName)을 매핑
const CATEGORIES = [
  { id: 'fish', name: '생선', icon: Fish, apiName: '생선' },
  { id: 'meat', name: '육류', icon: Drumstick, apiName: '육류' },
  { id: 'vege', name: '나물', icon: Leaf, apiName: '나물/무침' },
  { id: 'side', name: '김치/젓갈', icon: Carrot, apiName: '김치/젓갈' },
];

// 헬퍼 함수: 백엔드에서 받은 단일 리스트 (DishDetail[])를 
// 페이지가 기대하는 시장/가게별 그룹화 구조로 변환
const groupDishesByMarketAndStore = (dishes: DishDetail[]) => {
  const grouped: { [marketId: number]: { marketName: string, stores: any[] } } = {};
  
  dishes.forEach(dish => {
    // 🚨 3-1 명세에는 Market ID가 없으므로, 모든 반찬을 하나의 가상 시장에 그룹화합니다.
    // 만약 백엔드가 Market Name/ID를 주지 않는다면, 임시 Market ID 0 사용
    const marketId = 0; 
    const marketName = "전체 시장 상품"; 
    
    if (!grouped[marketId]) {
      grouped[marketId] = { marketName, stores: [] };
    }

    let store = grouped[marketId].stores.find((s: any) => s.storeId === dish.storeId);
    if (!store) {
      store = { storeId: dish.storeId, storeName: dish.storeName, products: [] };
      grouped[marketId].stores.push(store);
    }
    
    // DishDetail을 prod 형태로 변환
    store.products.push({
      id: dish.dishId,
      name: dish.dishName,
      price: dish.price,
      current: dish.currentCount,
      total: dish.threshold,
    });
  });

  return Object.values(grouped);
};


export default function CategoryPage({ navigation }: any) {
  const [activeCategory, setActiveCategory] = useState('fish');
  const [period, setPeriod] = useState<DeliveryTime>('AM');
  const [marketData, setMarketData] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);

  // ✅ 장바구니 담기 함수 가져오기
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const selectedCat = CATEGORIES.find(c => c.id === activeCategory);
        if (!selectedCat) return;

        // 1. API 호출: homeApi.ts의 getDishesByCategory 사용
        // 3-1 API는 period 필터링이 명시되지 않았으므로 period는 사용하지 않음 (백엔드 명세 확인 필요)
        const rawData: DishDetail[] = await getDishesByCategory(selectedCat.apiName);
        
        // 2. 데이터 구조 변환: 단일 리스트를 시장/가게별로 그룹화
        const groupedData = groupDishesByMarketAndStore(rawData);
        setMarketData(groupedData);

      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [activeCategory, period]); 

  // 상세 페이지로 이동
  const goToDetail = (prod: any) => {
    navigation.navigate('DishDetail', { 
      dish: { 
        ...prod, 
        dishId: prod.id, 
        dishName: prod.name,
        price: prod.price,
        currentCount: prod.current,
        threshold: prod.total,
        imageUrl: prod.img, 
        rating: 4.5 
      } 
    });
  };

  const TEMP_USER_ID = 1;

  // ✅ 장바구니 담기 핸들러
  const handleAddToCart = async (prod: any) => {
    try {
      // 1. API 호출: 장바구니에 아이템 추가 요청
      const request = {
        userId: TEMP_USER_ID, // 임시 ID 사용
        dishId: prod.id,
        quantity: 1, // 기본 1개 담기
      };
      
      const addedItem = await addToCart(request);

      // 2. API 성공 시에만 스토어 상태 업데이트
      addItem({
        id: addedItem.dishId, // API 응답에서 dishId 사용
        name: addedItem.dishName, // API 응답에서 dishName 사용
        price: addedItem.price, // API 응답에서 price 사용
        quantity: addedItem.quantity, // API 응답에서 quantity 사용
      });

      Alert.alert('장바구니', `${addedItem.dishName}을(를) 담았습니다.`, [
        { text: '계속 쇼핑', style: 'cancel' },
        { text: '확인', onPress: () => navigation.navigate('Cart') }
      ]);
      
    } catch (error) {
      console.error("장바구니 API 호출 실패:", error);
      Alert.alert('오류', '장바구니 담기에 실패했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn}><Menu color="#333" size={24} /></TouchableOpacity>
        <Text style={styles.headerTitle}>카테고리</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Bell color="#333" size={24} />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity 
                key={cat.id} 
                style={styles.catItem} 
                onPress={() => setActiveCategory(cat.id)}
              >
                <View style={[styles.catCircle, isActive && styles.catCircleActive]}>
                  <cat.icon size={28} color={isActive ? '#FFF' : '#888'} />
                </View>
                <Text style={[styles.catText, isActive && styles.catTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.filterRow}>
          <TimeFilter selectedTime={period} onSelect={setPeriod} /> 
        </View>

        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#F97316" />
          </View>
        ) : (
          <>
            {marketData.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>등록된 상품이 없습니다.</Text>
              </View>
            ) : (
              marketData.map((marketItem, mIdx) => (
                <View key={mIdx} style={styles.marketSection}>
                  <Text style={styles.marketTitle}>{marketItem.marketName}</Text>
                  
                  {marketItem.stores.map((store: any) => (
                    <View key={store.storeId} style={styles.storeCard}>
                      <Text style={styles.storeName}>{store.storeName}</Text>
                      
                      {store.products.map((prod: any, pIdx: number) => (
                        <TouchableOpacity 
                          key={prod.id} 
                          style={[styles.productRow, pIdx !== store.products.length - 1 && styles.borderBottom]}
                          onPress={() => goToDetail(prod)}
                        >
                          <Image source={{ uri: prod.img }} style={styles.prodImg} />
                          
                          <View style={styles.prodInfo}>
                            <Text style={styles.prodName}>{prod.name}</Text>
                            <Text style={styles.stockText}>
                              {prod.current}/{prod.total}
                            </Text>
                          </View>

                          <View style={styles.priceArea}>
                            <Text style={styles.price}>₩{prod.price.toLocaleString()}</Text>
                            
                            <TouchableOpacity 
                              style={styles.addBtn}
                              onPress={(e) => {
                                e.stopPropagation(); 
                                handleAddToCart(prod);
                              }}
                            >
                              <Plus size={16} color="#FFF" />
                            </TouchableOpacity>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  iconBtn: { padding: 4 },
  badge: { position: 'absolute', top: 4, right: 4, width: 8, height: 8, backgroundColor: '#F97316', borderRadius: 4 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  catItem: { alignItems: 'center' },
  catCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', marginBottom: 8, borderWidth: 1, borderColor: '#EEE' },
  catCircleActive: { backgroundColor: '#F97316', borderColor: '#F97316', shadowColor: "#F97316", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 },
  catText: { fontSize: 13, color: '#888' },
  catTextActive: { fontWeight: 'bold', color: '#F97316' },
  filterRow: { marginTop: 16 },
  marketSection: { paddingHorizontal: 16, marginTop: 8 },
  marketTitle: { fontSize: 16, fontWeight: 'bold', color: '#555', marginBottom: 12 },
  storeCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#FFF7ED', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  storeName: { fontSize: 16, fontWeight: '600', marginBottom: 16, color: '#333' },
  productRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  prodImg: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEE', marginRight: 12 },
  prodInfo: { flex: 1 },
  prodName: { fontSize: 15, color: '#333', marginBottom: 4 },
  stockText: { fontSize: 12, color: '#F97316', fontWeight: '500' },
  priceArea: { alignItems: 'flex-end', justifyContent: 'center' },
  price: { fontSize: 15, fontWeight: 'bold', color: '#D97706', marginBottom: 6 },
  addBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#A3E635', alignItems: 'center', justifyContent: 'center' },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 16 },
});