// src/components/DishCard.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  GestureResponderEvent,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export interface Dish {
  id: number | string;
  name: string;
  price: number; // 현재 판매가 (할인가)
  rating?: number;
  imageUrl: string;

  // 🔽 아래 값들은 있으면 피그마처럼 보여주고, 없으면 생략됨
  originalPrice?: number;  // 정가
  discountRate?: number;   // 62 같은 정수 퍼센트
  current?: number;        // 현재 공구 수량
  threshold?: number;      // 공구 성립 수량
}

interface DishCardProps {
  dish: Dish;
  onPress: () => void;
  onAddCart: () => void;
}

const DishCard: React.FC<DishCardProps> = ({ dish, onPress, onAddCart }) => {
  const handleAddCart = (e: GestureResponderEvent) => {
    e.stopPropagation();
    onAddCart();
  };

  // ----- 할인 / 공구 관련 계산 -----
  const hasOriginalPrice =
    typeof dish.originalPrice === 'number' && dish.originalPrice! > dish.price;

  const computedDiscountRate =
    typeof dish.discountRate === 'number'
      ? dish.discountRate
      : hasOriginalPrice
      ? Math.round((1 - dish.price / (dish.originalPrice as number)) * 100)
      : undefined;

  const current = dish.current ?? 0;
  const threshold = dish.threshold ?? 0;
  const hasGroupData = threshold > 0;

  const remaining = hasGroupData ? Math.max(threshold - current, 0) : 0;
  const progress = hasGroupData ? Math.min(current / threshold, 1) : 0;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* 상단 이미지 + 할인 뱃지 */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: dish.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {computedDiscountRate !== undefined && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{computedDiscountRate}% 특가</Text>
          </View>
        )}
      </View>

      {/* 텍스트 / 가격 영역 */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {dish.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.currentPrice}>
            ₩{dish.price.toLocaleString()}
          </Text>
          {hasOriginalPrice && (
            <Text style={styles.originalPrice}>
              ₩{(dish.originalPrice as number).toLocaleString()}
            </Text>
          )}
        </View>

        {hasGroupData && (
          <>
            <View style={styles.groupRow}>
              <Text style={styles.groupLabel}>공구 성립까지</Text>
              <Text style={styles.groupHighlight}>
                {remaining > 0 ? `${remaining}개 더 필요` : '공구 성립!'}
              </Text>
            </View>

            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progress * 100}%` },
                ]}
              />
            </View>

            <View style={styles.countRow}>
              <Text style={styles.countText}>{current}개</Text>
              <Text style={styles.countText}>{threshold}개</Text>
            </View>
          </>
        )}
      </View>

      {/* 장바구니 플로팅 + 버튼 */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddCart}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const CARD_RADIUS = 24;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: CARD_RADIUS,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    // 그림자
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  imageWrapper: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F97316',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  info: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F97316',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  groupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  groupLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  groupHighlight: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F97316',
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#FDEAD7',
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#84CC16', // 공구 진행 색
  },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  countText: {
    fontSize: 11,
    color: '#6B7280',
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DishCard;