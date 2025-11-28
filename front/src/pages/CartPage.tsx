import { Check, ChevronLeft, Minus, Plus } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCartStore } from '../store/cartStore';

// UI 구현을 위한 확장 타입
interface UI_CartItem {
  id: number | string;
  name: string;
  price: number;
  quantity: number;
  marketName: string;
  storeName: string;
  deliveryFee: number;
}

export default function CartPage({ navigation }: any) {
  const rawCartItems = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  // [UI용 데이터 변환]
  const cartItems: UI_CartItem[] = useMemo(() => {
    return rawCartItems.map((item, index) => ({
      ...item,
      marketName: index % 2 === 0 ? '망원시장' : '신촌시장', 
      storeName: index % 3 === 0 ? '△△ 가게' : '★★ 가게', 
      deliveryFee: 300,
    }));
  }, [rawCartItems]);

  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  React.useEffect(() => {
    setSelectedIds(new Set(cartItems.map(i => i.id)));
  }, [cartItems.length]);

  const toggleSelection = (id: string | number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  // ✅ 수량 감소 핸들러 (1개일 때 삭제 물어보기)
  const handleDecrease = (item: UI_CartItem) => {
    if (item.quantity <= 1) {
      Alert.alert('삭제', '선택하신 상품을 장바구니에서 삭제하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive', 
          onPress: () => removeItem(item.id) 
        },
      ]);
    } else {
      updateQuantity(item.id, -1);
    }
  };

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
  const productPrice = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
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
    navigation.navigate('Order', { totalPrice });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>장바구니 ({cartItems.length})</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>장바구니가 비어있습니다.</Text>
          </View>
        ) : (
          Object.entries(groupedItems).map(([marketName, marketInfo]) => (
            <View key={marketName} style={styles.marketSection}>
              <View style={styles.marketHeader}>
                <Text style={styles.marketName}>{marketName}</Text>
                <Text style={styles.deliveryFee}>+{marketInfo.deliveryFee}원</Text>
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
                        {/* ✅ handleDecrease 함수 연결 */}
                        <TouchableOpacity onPress={() => handleDecrease(item)} style={styles.qtyBtn}>
                          <Minus size={14} color="#666" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.qtyBtn}>
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

        {cartItems.length > 0 && (
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

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.orderBtn}
            onPress={handleOrderPress}
          >
            <Text style={styles.orderBtnText}>우동시 주문하기</Text>
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