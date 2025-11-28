import { ChevronLeft, Minus, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCartStore } from '../store/cartStore';

export default function DishDetailPage({ route, navigation }: any) {
  const { dish } = route.params || {};
  const [quantity, setQuantity] = useState(1);
  const addItemToCart = useCartStore((state) => state.addItem);

  if (!dish) return <View style={styles.center}><Text>상품 정보가 없습니다.</Text></View>;

  // 더미 데이터 (할인율 등 계산용)
  const discountRate = 33;
  const originalPrice = Math.round(dish.price * (100 / (100 - discountRate))); 
  const remainCount = (dish.total || 20) - (dish.current || 0);

  const handleAddToCart = () => {
    addItemToCart({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      quantity: quantity,
      imageUrl: dish.imageUrl,
    });

    Alert.alert('장바구니 담기', '장바구니에 추가되었습니다.', [
      { text: '확인', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View style={styles.container}>
      {/* 1. 상단 이미지 영역 */}
      <View style={styles.imageHeader}>
        <Image source={{ uri: dish.imageUrl }} style={styles.image} />
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft color="#333" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 2. 타이틀 및 가게 정보 */}
        <View style={styles.titleSection}>
          <Text style={styles.dishName}>{dish.name}</Text>
          <Text style={styles.storeName}>시장 1 · △△ 가게</Text>
        </View>

        {/* 3. 가격 정보 카드 */}
        <View style={styles.card}>
          <View style={styles.priceRow}>
            <Text style={styles.salePrice}>₩{dish.price.toLocaleString()}</Text>
            <Text style={styles.originalPrice}>₩{originalPrice.toLocaleString()}</Text>
          </View>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>공구가 {discountRate}% 할인</Text>
          </View>
        </View>

        {/* 4. 수량 및 진행률 카드 */}
        <View style={styles.card}>
          {/* 수량 조절 */}
          <View style={styles.qtyRow}>
            <Text style={styles.sectionLabel}>수량</Text>
            <View style={styles.counter}>
              <TouchableOpacity 
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={styles.countBtn}
              >
                <Minus size={18} color="#888" />
              </TouchableOpacity>
              <Text style={styles.countText}>{quantity}</Text>
              <TouchableOpacity 
                onPress={() => setQuantity(quantity + 1)}
                style={[styles.countBtn, styles.plusBtn]}
              >
                <Plus size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 공구 진행바 */}
          <View style={styles.progressContainer}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>공구 진행률</Text>
              <Text style={styles.remainText}>{remainCount}명 더 모이면 배송 시작!!</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${(dish.current / dish.total) * 100}%` }]} />
            </View>
            <View style={styles.progressStats}>
              <Text style={styles.statText}>{dish.current || 0}개</Text>
              <Text style={styles.statText}>{dish.total || 0}개</Text>
            </View>
          </View>
        </View>

        {/* 5. 최종 금액 표시 */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>최종 결제 금액</Text>
          <Text style={styles.totalValue}>₩{(dish.price * quantity).toLocaleString()}</Text>
        </View>
      </ScrollView>

      {/* 6. 하단 버튼 */}
      <SafeAreaView style={styles.footer}>
        <TouchableOpacity style={styles.cartButton} onPress={handleAddToCart}>
          <Text style={styles.cartButtonText}>장바구니 추가</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFAF5' }, // 연한 베이지 배경
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // 이미지 헤더
  imageHeader: { height: 250, width: '100%', position: 'relative' },
  image: { width: '100%', height: '100%' },
  backBtn: { 
    position: 'absolute', top: 50, left: 16, 
    backgroundColor: 'rgba(255,255,255,0.8)', padding: 8, borderRadius: 20 
  },

  scrollContent: { padding: 20, paddingBottom: 100 },

  // 타이틀
  titleSection: { marginBottom: 20 },
  dishName: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  storeName: { fontSize: 14, color: '#888' },

  // 카드 공통
  card: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2
  },

  // 가격 정보
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  salePrice: { fontSize: 24, fontWeight: 'bold', color: '#D97706', marginRight: 8 }, // 짙은 주황
  originalPrice: { fontSize: 16, color: '#999', textDecorationLine: 'line-through' },
  badgeContainer: { 
    backgroundColor: '#FFF7ED', paddingHorizontal: 10, paddingVertical: 6, 
    borderRadius: 8, alignSelf: 'flex-start' 
  },
  badgeText: { color: '#D97706', fontWeight: 'bold', fontSize: 13 },

  // 수량 및 진행률
  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sectionLabel: { fontSize: 16, color: '#333' },
  counter: { flexDirection: 'row', alignItems: 'center' },
  countBtn: { 
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6', 
    alignItems: 'center', justifyContent: 'center' 
  },
  plusBtn: { backgroundColor: '#A3E635' }, // 연두색 버튼 (이미지 참고)
  countText: { fontSize: 18, fontWeight: 'bold', marginHorizontal: 16, minWidth: 20, textAlign: 'center' },

  progressContainer: {},
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, color: '#666' },
  remainText: { fontSize: 13, color: '#F97316', fontWeight: 'bold' },
  progressTrack: { height: 10, backgroundColor: '#F3F4F6', borderRadius: 5, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', backgroundColor: '#A3E635' }, // 진행바 색상
  progressStats: { flexDirection: 'row', justifyContent: 'space-between' },
  statText: { fontSize: 12, color: '#888' },

  // 최종 금액 섹션
  totalSection: {
    backgroundColor: '#FFF0E0', borderRadius: 16, padding: 20, // 옅은 주황 배경
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20
  },
  totalLabel: { fontSize: 16, color: '#555' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#333' },

  // 하단 버튼
  footer: { 
    position: 'absolute', bottom: 0, width: '100%', 
    backgroundColor: '#FFF', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 30, // 아이폰 하단 바 고려
    borderTopWidth: 1, borderTopColor: '#F3F4F6'
  },
  cartButton: {
    backgroundColor: '#84CC16', // 그라데이션 대신 연두색 단색 처리 (이미지와 유사)
    paddingVertical: 16, borderRadius: 12, alignItems: 'center'
  },
  cartButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});