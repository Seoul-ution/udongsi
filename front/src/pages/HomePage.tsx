// src/pages/HomePage.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 컴포넌트
import Banner from "../components/Banner";
import DishList from "../components/DishList";
import MarketTabs, { Market } from "../components/MarketTabs";
import SearchBar from "../components/SearchBar";
import TimeFilter, { DeliveryTime } from "../components/TimeFilter";

// 타입 및 목업 데이터
import type { DishBase, Period, StoreEntity } from "../api/types";
import { Dish } from "../components/DishCard";
import { STORE_MOCK as storeMock } from "../constants/storeMock";
import { ADDRESS_MARKET_MAP, DEFAULT_USER_ID, MOCK_USERS } from "../constants/userMock";

const currentUser = MOCK_USERS.find((user) => user.id === DEFAULT_USER_ID);
const DEFAULT_USER_ADDRESS = currentUser?.address ?? "서울시 마포구 망원동"; // 기본값 설정

// 💡 userMock (marketId: number)을 MarketTabs (id: number)로 변환
const rawMarkets = ADDRESS_MARKET_MAP[DEFAULT_USER_ADDRESS] ?? [];

const mockMarkets: Market[] = rawMarkets.map((m) => ({
  id: m.marketId,
  name: m.marketName,
}));

const HomePage: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [selectedMarketId, setSelectedMarketId] = useState(
    mockMarkets[0]?.id ?? 1
  );
  const [deliveryTime, setDeliveryTime] = useState<DeliveryTime>("lunch");

  // TimeFilter의 DeliveryTime ('lunch'|'dinner')을 API Period ('AM'|'PM')으로 변환
  const getPeriodFromTime = (time: DeliveryTime): Period => {
    return time === "lunch" ? "AM" : "PM";
  };

  const currentPeriod = getPeriodFromTime(deliveryTime);

  // 현재 선택된 시장의 데이터 추출
  const selectedStore = (storeMock as StoreEntity[]).find(
    (store) => store.marketId === selectedMarketId
  );

  // DishBase -> Dish 타입으로 데이터 변환 및 필터링
  const dishList: Dish[] = (selectedStore?.dishes ?? [])
    .filter((dish: DishBase) => dish.period === currentPeriod)
    // DishBase (dishId: number) -> Dish (id: number)으로 매핑
    .map((d: DishBase) => ({
      // 💡 dishId가 number이므로 Number() 변환 없이 그대로 사용
      id: d.dishId,
      name: d.dishName,
      price: d.price,
      rating: undefined,
      imageUrl: "https://via.placeholder.com/80?text=Dish", // Placeholder
    }));

  // 검색 필터 적용
  const filteredList = dishList.filter((dish) =>
    dish.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleDishPress = (dish: Dish) => {
    console.log("Dish Pressed:", dish.name);
  };

  const handleAddCart = (dish: Dish) => {
    console.log("Add to Cart:", dish.name);
  };

  const HeaderComponent = (
    <View>
      {/* 상단 검색 / 아이콘 영역 */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="menu-outline" size={22} color="#374151" />
        </TouchableOpacity>

        <View style={styles.searchWrapper}>
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            placeholder="반찬 검색..."
          />
        </View>

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons
            name="notifications-outline"
            size={22}
            color="#374151"
          />
          <View style={styles.alarmBadge} />
        </TouchableOpacity>
      </View>

      {/* 시장 선택 탭 */}
      <MarketTabs
        markets={mockMarkets}
        selectedId={selectedMarketId}
        onSelect={setSelectedMarketId}
      />

      {/* 특가 공구 섹션 타이틀 + 배너 */}
      <View style={styles.highlightHeader}>
        <Text style={styles.highlightTitle}>오늘의 엄청난 특가 공구</Text>
      </View>
      <Banner />

      {/* 시간 필터 (오전/오후 느낌) */}
      <TimeFilter selectedTime={deliveryTime} onSelect={setDeliveryTime} />

      {/* 가게별 오늘의 반찬 타이틀 */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {selectedStore?.storeName ?? "전체 시장"} 오늘의 반찬
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <DishList
        data={filteredList}
        isLoading={false}
        onDishPress={handleDishPress}
        onAddCart={handleAddCart}
        ListHeaderComponent={HeaderComponent}
      />
    </SafeAreaView>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrapper: {
    flex: 1,
  },
  alarmBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F97316",
  },
  highlightHeader: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F97316",
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
  },
});
