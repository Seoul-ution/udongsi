import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Dish } from '../components/DishCard';
import DishList from '../components/DishList';
import SearchBar from '../components/SearchBar';

const MOCK_RESULTS: Dish[] = [
  { id: 101, name: '할머니표 잡채', price: 5000, rating: 4.8, imageUrl: 'https://via.placeholder.com/150' },
  { id: 105, name: '잡채 고로케', price: 2000, rating: 4.2, imageUrl: 'https://via.placeholder.com/150' },
];

export default function SearchPage({ route, navigation }: any) {
  const initialQuery = route.params?.query || '';
  const [text, setText] = useState(initialQuery);
  const [results, setResults] = useState<Dish[]>(initialQuery ? MOCK_RESULTS : []);

  const handleSearch = () => {
    // 실제로는 API 호출
    setResults(MOCK_RESULTS); 
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ marginTop: 10 }}>
        <SearchBar 
          value={text} 
          onChangeText={setText} 
          onSubmit={handleSearch} 
          placeholder="먹고 싶은 반찬을 검색해보세요"
        />
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#999', fontSize: 16 },
});