// front/src/pages/CartPage.tsx

import { Check, ChevronLeft, Minus, Plus } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// NOTE: shallow 제거
import { useCartStore, CartItem as StoreCartItem } from '../store/cartStore'; 

// UI_CartItem 타입 정의 (Mock 데이터 포함)
interface UI_CartItem extends StoreCartItem {
  storeName: string;
  marketName: string; 
  deliveryFee: number;
  
  // UI_CartItem이 필요로 하는 기타 필드 (타입 충족용 임시 Mock)
  dishId: number;
  storeId: number;
  dishType: string;
  date: string;
  period: 'AM' | 'PM';
  currentCount: number;
  threshold: number;
}

// ------------------------
// 🚨 MOCK DATA DEFINITION 🚨
// ------------------------
const MOCK_CART_ITEMS: Omit<UI_CartItem, 'dishId' | 'storeId' | 'dishType' | 'date' | 'period' | 'currentCount' | 'threshold'>[] = [
    {
        id: 101, 
        name: '돼지불고기 (200g)',
        price: 8500,
        quantity: 2, 
        imageUrl: 'https://via.placeholder.com/150/ff7f7f',
        storeName: '서울 반찬가게',
        marketName: '망원시장',
        deliveryFee: 3000,
    },
    {
        id: 102, 
        name: '오징어채 볶음 (150g)',
        price: 4000,
        quantity: 1, 
        imageUrl: 'https://via.placeholder.com/150/7f7fff',
        storeName: '강남 반찬집',
        marketName: '신촌시장',
        deliveryFee: 2500,
    },
    {
        id: 103, 
        name: '계란말이',
        price: 5000,
        quantity: 3, 
        imageUrl: 'https://via.placeholder.com/150/7fff7f',
        storeName: '서울 반찬가게',
        marketName: '망원시장',
        deliveryFee: 3000,
    },
    {
        id: 104, 
        name: '배추김치 (1kg)',
        price: 9000,
        quantity: 1, 
        imageUrl: 'https://via.placeholder.com/150/ff7f7f',
        storeName: '김치명인',
        marketName: '영동시장', 
        deliveryFee: 4000,
    },
];

export default function CartPage({ navigation }: any) {
  
  // Zustand 상태 및 액션 가져오기 (shallow 제거)
  const { items, removeItem, updateQuantity, setItems } = useCartStore((state) => ({
    items: state.items,
    removeItem: state.removeItem, 
    updateQuantity: state.updateQuantity, 
    setItems: state.setItems, 
  })); 
  
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set()); 
  
  // Mock 데이터 초기 로딩 함수 (최초 1회만 실행)
  const loadMockCartItems = useCallback(() => {
    if (items.length === 0) { 
        const storeItems: StoreCartItem[] = MOCK_CART_ITEMS.map(item => ({
             id: item.id,
             name: item.name,
             price: item.price,
             quantity: item.quantity,
             imageUrl: item.imageUrl,
        }));
        setItems(storeItems); 
    }
    setLoading(false);
  }, [items.length, setItems]); 

  // 1. useEffect: 최초 마운트 시 Mock 데이터 로드
  React.useEffect(() => {
    loadMockCartItems(); 
  }, [loadMockCartItems]); 
  
  // 2. useEffect: items가 업데이트될 때마다 모든 항목을 기본 선택 상태로 유지
  React.useEffect(() => {
    const itemIds = items.map(i => i.id); 
    setSelectedIds(new Set(itemIds)); 
  }, [items]); 

  // UI용 데이터 변환 (StoreCartItem -> UI_CartItem)
  const cartItems: UI_CartItem[] = useMemo(() => {
    return items.map((item: StoreCartItem) => {
        const mockInfo = MOCK_CART_ITEMS.find(m => m.id === item.id) || {
            storeName: '임시 가게',
            marketName: '임시 시장',
            deliveryFee: 3000,
        };
        
        return { 
            ...item, 
            dishId: item.id,
            storeName: mockInfo.storeName,
            marketName: mockInfo.marketName, 
            deliveryFee: mockInfo.deliveryFee,
            // 나머지 타입 충족용 목업 필드 (임시 값)
            storeId: item.id % 2 === 0 ? 2 : 1,
            dishType: '밑반찬',
            date: '2025-01-01', 
            period: item.id % 2 === 0 ? 'PM' : 'AM',
            currentCount: 1, 
            threshold: 10, 
        } as UI_CartItem; 
    });
  }, [items]); 
  
  // ------------------------------------------------
  // 🚨 Handlers: ZUSTAND ACTIONS 직접 사용 🚨
  // ------------------------------------------------

  // 항목 삭제 핸들러 (Store 액션 직접 호출)
  const handleRemoveItem = useCallback((dishId: number) => { 
    removeItem(dishId);
  }, [removeItem]); 
  
  // 수량 변경 핸들러 (Store 액션 직접 호출)
  const handleUpdateQuantity = useCallback((dishId: number, delta: number) => { 
    updateQuantity(dishId, delta);
  }, [updateQuantity]); 
  
  // 수량 감소 핸들러 (1개일 때 삭제 처리)
  const handleDecrease = useCallback((item: UI_CartItem) => { 
    if (item.quantity <= 1) {
      Alert.alert('삭제', '선택하신 상품을 장바구니에서 삭제하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => { handleRemoveItem(item.id); } },
      ]);
    } else {
      handleUpdateQuantity(item.id, -1);
    }
  }, [handleRemoveItem, handleUpdateQuantity]); 
  
  // 선택/해제 토글
  const toggleSelection = (id: number) => { 
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };
  
  // 시장별 그룹핑 및 가격 계산 로직 (기존과 동일)
  const groupedItems = useMemo(() => {
    const markets: Record<string, { deliveryFee: number, stores: Record<string, UI_CartItem[]> }> = {};
    cartItems.forEach(item => {
      if (!markets[item.marketName]) {
        markets[item.marketName] = { deliveryFee: item.deliveryFee, stores: {} };
      }
      if (!markets[item.marketName].stores[item.storeName]) {
        markets[item.marketName].stores[item.storeName] = [];
      }
      markets[item.marketName].stores[item.storeName].push(item);
    });
    return markets;
  }, [cartItems]);

  const selectedItems = cartItems.filter(item => selectedIds.has(item.id)); 
  
  const productPrice = selectedItems.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);
  
  // 선택된 상품이 속한 시장만 배달비 계산
  const activeMarkets = new Set(selectedItems.map(i => i.marketName));
  
  const totalDeliveryFee = Array.from(activeMarkets).reduce((sum, marketName) => {
    const marketItem = cartItems.find(i => i.marketName === marketName);
    return sum + (marketItem ? marketItem.deliveryFee : 0);
  }, 0);

  const totalPrice = productPrice + totalDeliveryFee;
  
  const handleOrderPress = () => {
    if (selectedItems.length === 0) {
      Alert.alert('알림', '주문할 상품을 선택해주세요.');
      return;
    }
    Alert.alert('주문 준비', `총 ${totalPrice.toLocaleString()}원으로 주문을 진행합니다.`);
    // navigation.navigate('Order', { totalPrice }); 
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>장바구니 ({loading ? '...' : cartItems.length})</Text> 
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? ( 
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F97316" />
          </View>
        ) : cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>장바구니가 비어있습니다.</Text>
          </View>
        ) : (
          Object.entries(groupedItems).map(([marketName, marketInfo]) => (
            <View key={marketName} style={styles.marketSection}>
              <View style={styles.marketHeader}>
                <Text style={styles.marketName}>{marketName}</Text>
                {/* 선택된 상품이 해당 시장에 있을 때만 배달비 표시 */}
                {activeMarkets.has(marketName) && (
                    <Text style={styles.deliveryFee}>+{marketInfo.deliveryFee.toLocaleString()}원</Text>
                )}
              </View>

              {Object.entries(marketInfo.stores).map(([storeName, items]) => (
                <View key={storeName} style={styles.storeSection}>
                  <Text style={styles.storeName}>{storeName}</Text>
                  
                  {items.map((item) => (
                    <View key={item.id} style={styles.itemRow}> 
                      <TouchableOpacity 
                        onPress={() => toggleSelection(item.id)}
                        style={[styles.checkbox, selectedIds.has(item.id) && styles.checkboxChecked]}
                      >
                        {selectedIds.has(item.id) && <Check size={14} color="#FFF" strokeWidth={3} />}
                      </TouchableOpacity>

                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        <Text style={styles.itemPrice}>₩{item.price.toLocaleString()}</Text>
                      </View>

                      <View style={styles.qtyControl}>
                        <TouchableOpacity onPress={() => handleDecrease(item)} style={styles.qtyBtn}>
                          <Minus size={14} color="#666" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity onPress={() => handleUpdateQuantity(item.id, 1)} style={styles.qtyBtn}>
                          <Plus size={14} color="#666" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))
        )}

        {cartItems.length > 0 && !loading && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>상품 금액</Text>
              <Text style={styles.summaryValue}>₩{productPrice.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>배달비</Text>
              <Text style={styles.summaryValue}>₩{totalDeliveryFee.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>총 할인 금액</Text>
              <Text style={[styles.summaryValue, { color: '#F97316' }]}>-₩0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>결제예정금액</Text>
              <Text style={styles.totalPrice}>₩{totalPrice.toLocaleString()}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {cartItems.length > 0 && !loading && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.orderBtn}
            onPress={handleOrderPress}
          >
            <Text style={styles.orderBtnText}>₩{totalPrice.toLocaleString()} 우동시 주문하기</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 50, backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#EEE'
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  scrollContent: { paddingBottom: 100 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#888', fontSize: 16 },
  loadingContainer: { padding: 40, alignItems: 'center' },
  marketSection: { 
    marginTop: 12, backgroundColor: '#FFF', 
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#EEE',
    paddingBottom: 8
  },
  marketHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#F5F5F5'
  },
  marketName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  deliveryFee: { fontSize: 14, color: '#F97316', fontWeight: '500' },
  storeSection: { paddingHorizontal: 16, paddingTop: 16 },
  storeName: { fontSize: 14, color: '#666', marginBottom: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkbox: { 
    width: 20, height: 20, borderRadius: 4, borderWidth: 1, borderColor: '#DDD', 
    marginRight: 12, alignItems: 'center', justifyContent: 'center'
  },
  checkboxChecked: { backgroundColor: '#F97316', borderColor: '#F97316' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, color: '#333', marginBottom: 4 },
  itemPrice: { fontSize: 15, fontWeight: 'bold', color: '#F97316' },
  qtyControl: { 
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EEE', borderRadius: 6 
  },
  qtyBtn: { padding: 8 },
  qtyText: { fontSize: 14, fontWeight: 'bold', marginHorizontal: 8, minWidth: 16, textAlign: 'center' },
  summaryContainer: { backgroundColor: '#FFF', marginTop: 12, padding: 20 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 14, color: '#666' },
  summaryValue: { fontSize: 14, fontWeight: '500', color: '#333' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  totalPrice: { fontSize: 20, fontWeight: 'bold', color: '#F97316' },
  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: '#FFF', padding: 16, borderTopWidth: 1, borderTopColor: '#EEE' 
  },
  orderBtn: { 
    backgroundColor: '#F97316', borderRadius: 12, paddingVertical: 16, 
    alignItems: 'center' 
  },
  orderBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});