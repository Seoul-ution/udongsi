import { ChefHat, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// ✅ 장바구니 데이터 가져오기 위해 import
import { useCartStore } from '../store/cartStore';

// 더미 데이터: 주소 목록
const ADDRESS_LIST = [
  '서울시립대 정문 앞A',
  '서울시립대 정문 앞B',
  '시립대 후문',
  '회기아파트 입구A'
];

// 더미 데이터: 결제 수단
const PAYMENT_METHODS = [
  '신용/체크카드',
  '토스페이',
  '카카오페이'
];

export default function OrderPage({ route, navigation }: any) {
  // 이전 페이지(장바구니)에서 넘겨준 총 금액 받기
  const { totalPrice } = route.params || { totalPrice: 0 };
  
  // ✅ 장바구니에 담긴 아이템들 가져오기
  const cartItems = useCartStore((state) => state.items);

  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [selectedPaymentIdx, setSelectedPaymentIdx] = useState(0);
  
  // ✅ 상품 목록 펼치기/접기 상태
  const [showItems, setShowItems] = useState(false);

  const handlePayment = () => {
    Alert.alert('결제 완료', `${totalPrice.toLocaleString()}원 결제가 완료되었습니다!`, [
      { text: '확인', onPress: () => navigation.navigate('Home') } // 홈으로 이동
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. 상단 로고 헤더 */}
      <View style={styles.header}>
        {/* ✅ 뒤로가기 버튼 추가 */}
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => navigation.goBack()}
        >
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>

        {/* 로고 영역 */}
        <View style={styles.logoArea}>
          <ChefHat size={32} color="#F97316" />
          <Text style={styles.logoText}>우동시</Text>
        </View>
        
        {/* 우측 균형을 위한 빈 View (선택사항) */}
        <View style={{ width: 40 }} />
      </View>

      {/* 2. 스크롤 가능한 콘텐츠 영역 */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 주문식품 요약 */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>주문식품</Text>
            {/* ✅ 토글 버튼 기능 추가 */}
            <TouchableOpacity 
              style={styles.outlineBtn} 
              onPress={() => setShowItems(!showItems)}
            >
              <Text style={styles.outlineBtnText}>
                {showItems ? '접기' : '주요상품 확인'}
              </Text>
              {showItems ? <ChevronUp size={14} color="#666" /> : <ChevronDown size={14} color="#666" />}
            </TouchableOpacity>
          </View>

          {/* ✅ 버튼 눌렀을 때만 보이는 상품 리스트 */}
          {showItems && (
            <View style={styles.itemList}>
              {cartItems.map((item) => (
                <View key={item.id} style={styles.itemRowSimple}>
                  <Text style={styles.itemNameSimple} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemQtySimple}>{item.quantity}개</Text>
                  <Text style={styles.itemPriceSimple}>{(item.price * item.quantity).toLocaleString()}원</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* 배달 정보 (주소 선택) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>배달정보</Text>
          <Text style={styles.subTitle}>배달장소 선택</Text>
          
          <View style={styles.radioGroup}>
            {ADDRESS_LIST.map((addr, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={styles.radioRow}
                onPress={() => setSelectedAddressIdx(idx)}
              >
                <View style={[styles.radioCircle, selectedAddressIdx === idx && styles.radioCircleSelected]}>
                  {selectedAddressIdx === idx && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>{addr}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.dividerDot} />

        {/* 내 연락처 */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.rowBetween}>
            <View>
              <Text style={styles.sectionTitle}>내 연락처</Text>
              <Text style={styles.contactText}>010-XXXX-XXXX</Text>
            </View>
            <ChevronRight size={20} color="#CCC" />
          </TouchableOpacity>
        </View>

        <View style={styles.thickDivider} />

        {/* 결제 수단 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>결제수단</Text>
          <View style={styles.radioGroup}>
            {PAYMENT_METHODS.map((method, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={styles.radioRow}
                onPress={() => setSelectedPaymentIdx(idx)}
              >
                <View style={[styles.radioCircle, selectedPaymentIdx === idx && styles.radioCircleSelected]}>
                  {selectedPaymentIdx === idx && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioText}>{method}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.dividerDot} />

        {/* 할인 쿠폰 */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>할인쿠폰</Text>
            <Text style={styles.couponCount}>보유쿠폰 1개</Text>
          </View>
          <TouchableOpacity style={styles.couponInput}>
            <Text style={styles.couponPlaceholder}>사용가능한 쿠폰을 선택하세요</Text>
            <ChevronRight size={18} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* 하단 여백 확보 */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* 3. 하단 고정 결제 버튼 (스크롤 밖) */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.payBtn} onPress={handlePayment}>
          <Text style={styles.payBtnText}>{totalPrice.toLocaleString()} 결제</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  
  // 헤더 수정됨: 좌측 뒤로가기 버튼 + 중앙 로고
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F5F5F5' 
  },
  backBtn: { padding: 4 },
  logoArea: { alignItems: 'center' },
  logoText: { fontSize: 16, fontWeight: 'bold', color: '#333', marginTop: 4 },

  scrollContent: { paddingBottom: 100 }, // 버튼 가리지 않게 여백

  // 공통 섹션 스타일
  section: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  subTitle: { fontSize: 14, color: '#666', marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  // 구분선
  divider: { height: 8, backgroundColor: '#FFF7ED' }, // 연한 주황색 구분선
  dividerDot: { borderWidth: 1, borderColor: '#F5F5F5', borderStyle: 'dotted', marginHorizontal: 20 },
  thickDivider: { height: 8, backgroundColor: '#FFF7ED' },

  // 버튼 스타일
  outlineBtn: { 
    borderWidth: 1, borderColor: '#DDD', borderRadius: 4, 
    paddingHorizontal: 12, paddingVertical: 6,
    flexDirection: 'row', alignItems: 'center' 
  },
  outlineBtnText: { fontSize: 12, color: '#666', marginRight: 4 },

  // ✅ 주문 상품 리스트 스타일
  itemList: { marginTop: 16, backgroundColor: '#FAFAFA', padding: 16, borderRadius: 8 },
  itemRowSimple: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  itemNameSimple: { flex: 1, fontSize: 14, color: '#555' },
  itemQtySimple: { width: 40, textAlign: 'center', fontSize: 14, color: '#888' },
  itemPriceSimple: { width: 80, textAlign: 'right', fontSize: 14, fontWeight: 'bold', color: '#333' },

  // 라디오 버튼 스타일
  radioGroup: { marginTop: 4 },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  radioCircle: { 
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#DDD', 
    alignItems: 'center', justifyContent: 'center', marginRight: 10 
  },
  radioCircleSelected: { borderColor: '#007AFF' }, // 파란색 선택
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#007AFF' },
  radioText: { fontSize: 15, color: '#333' },

  // 연락처
  contactText: { fontSize: 16, color: '#333', marginTop: 4 },

  // 쿠폰
  couponCount: { fontSize: 13, color: '#666' },
  couponInput: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, marginTop: 8 
  },
  couponPlaceholder: { color: '#999', fontSize: 14 },

  // 하단 고정 버튼
  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: '#FFF', padding: 16, borderTopWidth: 1, borderTopColor: '#EEE' 
  },
  payBtn: { 
    backgroundColor: '#F97316', borderRadius: 12, paddingVertical: 16, alignItems: 'center' 
  },
  payBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});