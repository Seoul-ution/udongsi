// src/pages/CategoryPage.tsx
// 피그마 카테고리 시안 기반 화면 구현

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  categoryApi,
  CategoryKey,
  CategoryMarketSection,
  TimeOption,
} from '../api/udongsiApi';

export interface Dish {
  id: number | string;
  imageUrl: string;
  name: string;
  current: number;
  threshold: number;
  price: number;
}

export interface MarketGroup {
  id: number | string; 
  name: string;
  storeName: string;
  dishes: Dish[];
}


// --------- 카테고리 UI용 설정 ---------

interface Category {
  key: CategoryKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const CATEGORIES: Category[] = [
  { key: 'fish', label: '생선', icon: 'fish' },
  { key: 'meat', label: '고기/정육', icon: 'restaurant' },
  { key: 'veggie', label: '채소/나물', icon: 'leaf' },
  { key: 'kimchi', label: '김치/반찬', icon: 'pizza' },
];

// -------------------------------------------------------
// 데이터 변환 함수: API 응답 (중첩 구조) -> UI State (플랫 구조)
// -------------------------------------------------------

const transformData = (sections: CategoryMarketSection[]): MarketGroup[] => {
  const groups: MarketGroup[] = [];
  sections.forEach(marketSection => {
    // 각 시장 섹션을 순회.
    marketSection.stores.forEach(store => {
      // 각 시장 내의 가게들을 순회하며 MarketGroup 객체를 생성.
      groups.push({
        id: store.storeId, 
        name: marketSection.marketName, 
        storeName: store.storeName, 
        dishes: store.dishes.map(dish => ({
          // Dish 필드 이름 매핑
          id: dish.dishId,
          imageUrl: dish.imageUrl,
          name: dish.dishName,
          current: dish.currentCount,
          threshold: dish.threshold,
          price: dish.price,
        })),
      });
    });
  });
  return groups;
};

// --------- 페이지 컴포넌트 ---------

const CategoryPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryKey>('fish');
  const [selectedTime, setSelectedTime] = useState<TimeOption>('am');
  const [sortBy, setSortBy] = useState<'distance' | 'popular'>('distance');

  // UI 렌더링을 위해 MarketGroup[] 타입을 사용.
  const [groups, setGroups] = useState<MarketGroup[]>([]);
  const [loading, setLoading] = useState(false);

  // 카테고리/시간/정렬이 바뀔 때마다 데이터 재조회
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // API 호출은 CategoryMarketSection[]를 반환.
        const apiResponse: CategoryMarketSection[] = await categoryApi.fetchCategorySections(
          { 
            category: selectedCategory, 
            time: selectedTime 
          } 
        );
        
        // API 응답을 UI State 구조로 변환하여 저장.
        const transformedData = transformData(apiResponse);
        setGroups(transformedData);

      } catch (e) {
        console.warn('fetchCategorySections error', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [selectedCategory, selectedTime, sortBy]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons name="menu" size={22} color="#4B5563" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>카테고리</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Ionicons
            name="notifications-outline"
            size={22}
            color="#4B5563"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 96 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 카테고리 선택 (가로 스크롤) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryItem,
                  active && styles.categoryItemActive,
                ]}
                onPress={() => setSelectedCategory(cat.key)}
              >
                <View
                  style={[
                    styles.categoryIconCircle,
                    active && styles.categoryIconCircleActive,
                  ]}
                >
                  <Ionicons
                    name={cat.icon}
                    size={26}
                    color={active ? '#FFFFFF' : '#F97316'}
                  />
                </View>
                <Text
                  style={[
                    styles.categoryLabel,
                    active && styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 필터 영역 (오전/오후 + 정렬) */}
        <View style={styles.filterRow}>
          <View style={styles.timeToggleContainer}>
            <TouchableOpacity
              style={[
                styles.timeChip,
                selectedTime === 'am' && styles.timeChipActive,
              ]}
              onPress={() => setSelectedTime('am')}
            >
              <Ionicons
                name="sunny"
                size={18}
                color={selectedTime === 'am' ? '#FFFFFF' : '#F97316'}
              />
              <Text
                style={[
                  styles.timeChipText,
                  selectedTime === 'am' && styles.timeChipTextActive,
                ]}
              >
                오전
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.timeChip,
                selectedTime === 'pm' && styles.timeChipActive,
              ]}
              onPress={() => setSelectedTime('pm')}
            >
              <Ionicons
                name="moon"
                size={18}
                color={selectedTime === 'pm' ? '#FFFFFF' : '#F97316'}
              />
              <Text
                style={[
                  styles.timeChipText,
                  selectedTime === 'pm' && styles.timeChipTextActive,
                ]}
              >
                오후
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.sortButton}
            onPress={() =>
              setSortBy((prev) =>
                prev === 'distance' ? 'popular' : 'distance',
              )
            }
          >
            <Text style={styles.sortText}>
              {sortBy === 'distance' ? '거리순' : '인기순'}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {/* 로딩 상태 간단 표시 (옵션) */}
        {loading && (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>불러오는 중…</Text>
          </View>
        )}

        {/* 시장별 카드 리스트 (MarketGroup[] 사용) */}
        {groups.map((group) => (
          <View key={group.id} style={styles.marketSection}>
            <Text style={styles.marketName}>{group.name}</Text>

            <View style={styles.storeCard}>
              <View style={styles.storeHeader}>
                <Text style={styles.storeName}>{group.storeName}</Text>
              </View>

              {group.dishes.map((dish: Dish) => (
                <View key={dish.id} style={styles.dishRow}>
                  <Image
                    source={{ uri: dish.imageUrl }}
                    style={styles.dishImage}
                  />

                  <View style={styles.dishInfo}>
                    <Text style={styles.dishName} numberOfLines={1}>
                      {dish.name}
                    </Text>
                    <Text style={styles.dishCount}>
                      {dish.current}/{dish.threshold}
                    </Text>
                  </View>

                  <View style={styles.dishRight}>
                    <Text style={styles.dishPrice}>
                      ₩{dish.price.toLocaleString()}
                    </Text>
                    <TouchableOpacity
                      style={styles.plusButton}
                      onPress={() => {
                        // TODO: 장바구니 추가 로직
                        console.log('add to cart', dish.name);
                      }}
                    >
                      <Ionicons name="add" size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {!loading && groups.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              선택한 조건에 맞는 반찬이 없어요 😭
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CategoryPage;

// --------- 스타일 ---------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FEF9F3', 
  },
  header: {
    height: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  scroll: {
    flex: 1,
  },

  // 카테고리
  categoryRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  categoryItemActive: {},
  categoryIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryIconCircleActive: {
    backgroundColor: '#F97316',
  },
  categoryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  categoryLabelActive: {
    color: '#F97316',
    fontWeight: '600',
  },

  // 필터
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  timeToggleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFF7ED',
  },
  timeChipActive: {
    backgroundColor: '#F97316',
  },
  timeChipText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#F97316',
    fontWeight: '600',
  },
  timeChipTextActive: {
    color: '#FFFFFF',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  sortText: {
    fontSize: 14,
    color: '#4B5563',
    marginRight: 4,
  },

  loadingBox: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  loadingText: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  // 시장 섹션
  marketSection: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  marketName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 8,
  },
  storeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  storeHeader: {
    marginBottom: 8,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  dishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  dishImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  dishInfo: {
    flex: 1,
  },
  dishName: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  dishCount: {
    fontSize: 12,
    color: '#F97316',
  },
  dishRight: {
    alignItems: 'flex-end',
  },
  dishPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F97316',
    marginBottom: 6,
  },
  plusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyBox: {
    paddingHorizontal: 16,
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});