// src/pages/CartPage.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 상품 데이터 타입 정의
interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  marketName: string;
  storeName: string;
  checked: boolean;
}

// 목업 데이터
const mockCartData: CartItem[] = [
  { id: 1, name: '맛있는 반찬 게트럭', price: 6000, quantity: 1, marketName: '망원시장', storeName: '△△ 가게', checked: true },
  { id: 2, name: '오징어조림 200g', price: 3000, quantity: 1, marketName: '망원시장', storeName: '△△ 가게', checked: true },
  
  { id: 3, name: '파김치 200g', price: 4000, quantity: 0, marketName: '망원시장', storeName: '★★ 가게', checked: false },
  { id: 4, name: '파김치 200g', price: 3000, quantity: 0, marketName: '망원시장', storeName: '★★ 가게', checked: false },
  
  { id: 5, name: '제육볶음 300g', price: 18000, quantity: 2, marketName: '신촌시장', storeName: '◎◎ 가게', checked: true },
  { id: 6, name: '두부조림 한 팩', price: 3600, quantity: 1, marketName: '신촌시장', storeName: '◎◎ 가게', checked: false },
];

const DELIVERY_FEE = 600;
const MARKET_DELIVERY_FEE = 300; // 시장별 배달비 (목업 데이터)


// 수량 조절 컴포넌트
const QuantityControl: React.FC<{ quantity: number; onQuantityChange: (newQuantity: number) => void }> = ({ quantity, onQuantityChange }) => (
  <View style={styles.quantityControlContainer}>
    <TouchableOpacity style={styles.quantityButton} onPress={() => onQuantityChange(quantity > 0 ? quantity - 1 : 0)}>
      <Text style={styles.quantityButtonText}>−</Text>
    </TouchableOpacity>
    <View style={styles.quantityInput}>
      <Text style={styles.quantityInputText}>{quantity}</Text>
    </View>
    <TouchableOpacity style={styles.quantityButton} onPress={() => onQuantityChange(quantity + 1)}>
      <Text style={styles.quantityButtonText}>+</Text>
    </TouchableOpacity>
  </View>
);

// 단일 상품 아이템 컴포넌트
const CartItemComponent: React.FC<{ item: CartItem; onUpdate: (updatedItem: CartItem) => void }> = ({ item, onUpdate }) => {
  const handleQuantityChange = (newQuantity: number) => {
    onUpdate({ ...item, quantity: newQuantity });
  };

  const handleCheck = () => {
    onUpdate({ ...item, checked: !item.checked });
  };

  const itemPriceText = `₩${item.price.toLocaleString()}`;
  const isZeroQuantity = item.quantity === 0;

  return (
    <View style={styles.itemContainer}>
      {/* 체크박스 */}
      <TouchableOpacity onPress={handleCheck} style={styles.checkboxWrapper}>
        <Ionicons 
          name={item.checked ? 'checkbox-sharp' : 'square-outline'} 
          size={22} 
          color={item.checked ? '#FF8C00' : '#CCCCCC'} // 이미지 속 주황색 체크박스
        />
      </TouchableOpacity>
      
      {/* 상품 정보 */}
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
      </View>

      {/* 가격 및 수량 조절 */}
      <View style={styles.priceAndQuantity}>
        <Text style={styles.itemPrice}>{itemPriceText}</Text>
        <QuantityControl 
          quantity={item.quantity} 
          onQuantityChange={handleQuantityChange} 
        />
      </View>
    </View>
  );
};

// 메인 장바구니 페이지
const CartPage: React.FC = ({ navigation }: any) => {
  const [cartItems, setCartItems] = useState(mockCartData);

  // 상품 업데이트 핸들러
  const handleItemUpdate = (updatedItem: CartItem) => {
    setCartItems(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  // 장바구니 그룹화 (시장 및 가게별)
  const groupedCart = cartItems.reduce((acc, item) => {
    const market = item.marketName;
    const store = item.storeName;

    if (!acc[market]) {
      acc[market] = { marketDeliveryFee: MARKET_DELIVERY_FEE, stores: {} };
    }
    if (!acc[market].stores[store]) {
      acc[market].stores[store] = [];
    }
    acc[market].stores[store].push(item);
    return acc;
  }, {} as any);

  // 총 금액 계산
  const totalSummary = cartItems.filter(item => item.checked && item.quantity > 0)
    .reduce((acc, item) => {
      acc.subtotal += item.price * item.quantity;
      return acc;
    }, { subtotal: 0, deliveryFee: DELIVERY_FEE, discount: 0 });

  const finalAmount = totalSummary.subtotal + totalSummary.deliveryFee - totalSummary.discount;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>장바구니 ({cartItems.length})</Text>
        <View style={{ width: 24 }} /> {/* 우측 여백 맞추기 */}
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {Object.entries(groupedCart).map(([marketName, marketData]) => (
          <View key={marketName} style={styles.marketSection}>
            {/* 시장 헤더 */}
            <View style={styles.marketHeader}>
              <Text style={styles.marketTitle}>{marketName}</Text>
              <Text style={styles.marketDeliveryFee}>+{MARKET_DELIVERY_FEE.toLocaleString()}원</Text>
            </View>

            {/* 가게 목록 */}
            {Object.entries((marketData as any).stores).map(([storeName, storeItems]) => (
              <View key={storeName} style={styles.storeSection}>
                <Text style={styles.storeTitle}>{storeName}</Text>
                {/* 상품 목록 */}
                {(storeItems as CartItem[]).map(item => (
                  <CartItemComponent key={item.id} item={item} onUpdate={handleItemUpdate} />
                ))}
              </View>
            ))}
          </View>
        ))}
        
        {/* 결제 요약 섹션 */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>결제 상세</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>상품 금액</Text>
            <Text style={styles.summaryValue}>₩{totalSummary.subtotal.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>배달비</Text>
            <Text style={styles.summaryValue}>₩{totalSummary.deliveryFee.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, styles.discountLabel]}>총 할인 금액</Text>
            <Text style={[styles.summaryValue, styles.discountValue]}>-₩{totalSummary.discount.toLocaleString()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>결제 예정 금액</Text>
            <Text style={styles.totalValue}>₩{finalAmount.toLocaleString()}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} /> {/* 주문 버튼과의 간격 확보 */}
      </ScrollView>

      {/* 주문 버튼 (화면 하단 고정) */}
      <View style={styles.orderButtonContainer}>
        <TouchableOpacity style={styles.orderButton} onPress={() => console.log('우동시 주문하기')}>
          <Text style={styles.orderButtonText}>
            {finalAmount.toLocaleString()}원 우동시 주문하기
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF', // 배경색 흰색
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  // Market Section
  marketSection: {
    marginBottom: 20,
    paddingBottom: 10,
  },
  marketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  marketTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  marketDeliveryFee: {
    fontSize: 14,
    fontWeight: '500',
    color: '#F97316', // 주황색 톤
  },

  // Store Section
  storeSection: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 10,
  },
  storeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#444',
    paddingHorizontal: 4,
    marginBottom: 8,
  },

  // Cart Item Component
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F9F9F9',
  },
  checkboxWrapper: {
    padding: 4,
  },
  itemDetails: {
    flex: 1,
    paddingLeft: 8,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
  },
  priceAndQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 170, // 가격과 수량 조절을 위한 고정 너비
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  
  // Quantity Control
  quantityControlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    overflow: 'hidden',
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#333',
    lineHeight: 30,
  },
  quantityInput: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  quantityInputText: {
    fontSize: 15,
    color: '#333',
  },

  // Summary Card
  summaryCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    // 이미지에 보이는 미세한 그림자
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  discountLabel: {
    color: '#A0A0A0',
  },
  discountValue: {
    color: '#FF4500', // 빨간색 계열 할인 금액
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F97316', // 결제 예정 금액 주황색
  },

  // Order Button (Fixed at Bottom)
  orderButtonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  orderButton: {
    backgroundColor: '#FF8C00', 
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default CartPage;