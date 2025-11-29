import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 더미 데이터
const DEALS = [
  { id: 1, name: '프리미엄 김치 세트', price: 12100, originalPrice: 32000, discount: '62%', current: 13, total: 16, img: 'https://via.placeholder.com/300x200' },
  { id: 2, name: '제철 나물 모음', price: 8900, originalPrice: 15000, discount: '40%', current: 8, total: 10, img: 'https://via.placeholder.com/300x200' },
];

const HotDealList = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔥 오늘의 엄청난 특가 공구</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {DEALS.map((deal) => (
          <TouchableOpacity key={deal.id} style={styles.card} activeOpacity={0.9}>
            {/* 이미지 & 할인 뱃지 */}
            <View>
              <Image source={{ uri: deal.img }} style={styles.image} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{deal.discount} 특가</Text>
              </View>
            </View>

            {/* 상품 정보 */}
            <View style={styles.content}>
              <Text style={styles.name} numberOfLines={1}>{deal.name}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>₩{deal.price.toLocaleString()}</Text>
                <Text style={styles.originalPrice}>₩{deal.originalPrice.toLocaleString()}</Text>
              </View>
              
              {/* 공구 진행 상황 */}
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>공구 성립까지</Text>
                <Text style={styles.remainLabel}>{deal.total - deal.current}개 더 필요</Text>
              </View>
              {/* 진행바 게이지 */}
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${(deal.current / deal.total) * 100}%` }]} />
              </View>
              <View style={styles.countRow}>
                <Text style={styles.countText}>{deal.current}개</Text>
                <Text style={styles.countText}>{deal.total}개</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#F97316', marginLeft: 16, marginBottom: 12 },
  scrollContent: { paddingHorizontal: 16 },
  card: { 
    width: 200, backgroundColor: '#FFF', borderRadius: 16, marginRight: 12, 
    overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6' 
  },
  image: { width: '100%', height: 120, backgroundColor: '#eee' },
  badge: { 
    position: 'absolute', top: 10, left: 10, backgroundColor: '#F97316', 
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 
  },
  badgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  content: { padding: 12 },
  name: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#F97316', marginRight: 6 },
  originalPrice: { fontSize: 12, color: '#999', textDecorationLine: 'line-through' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressLabel: { fontSize: 11, color: '#666' },
  remainLabel: { fontSize: 11, color: '#F97316', fontWeight: 'bold' },
  progressBarBg: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, marginBottom: 4 },
  progressBarFill: { height: '100%', backgroundColor: '#84CC16', borderRadius: 3 },
  countRow: { flexDirection: 'row', justifyContent: 'space-between' },
  countText: { fontSize: 10, color: '#999' },
});

export default HotDealList;