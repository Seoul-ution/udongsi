import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native'; 
import SearchBar from '../components/SearchBar';
import DishList from '../components/DishList';
import { Dish } from '../components/DishCard';

const MOCK_RESULTS: Dish[] = [
  { id: 101, name: '할머니표 잡채', price: 5000, rating: 4.8, imageUrl: 'https://via.placeholder.com/150' },
  { id: 105, name: '잡채 고로케', price: 2000, rating: 4.2, imageUrl: 'https://via.placeholder.com/150' },
];

export default function SearchPage({ route, navigation }: any) {
  const initialQuery = route.params?.query || '';
  const [text, setText] = useState(initialQuery);
  const [results, setResults] = useState<Dish[]>(initialQuery ? MOCK_RESULTS : []);

  const handleSearch = () => {
    // ✅ 팝업창(Alert.alert) 제거됨. 바로 검색 로직 실행.
    // 실제로는 API 호출 로직이 들어갑니다.
    setResults(MOCK_RESULTS); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        {/* 뒤로가기 버튼 */}
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        
        {/* 검색바 */}
        <View style={styles.searchBarWrapper}>
          <SearchBar 
            value={text} 
            onChangeText={setText} 
            onSubmit={handleSearch} 
            placeholder="먹고 싶은 반찬을 검색해보세요"
          />
        </View>
      </View>

      {results.length > 0 ? (
        <DishList
          data={results}
          onDishPress={(dish) => navigation.navigate('DishDetail', { dish })}
          onAddCart={() => {}}
        />
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backBtn: {
    paddingRight: 10,
    paddingVertical: 5,
  },
  searchBarWrapper: {
    flex: 1,
    marginHorizontal: 0, 
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#999', fontSize: 16 },
});