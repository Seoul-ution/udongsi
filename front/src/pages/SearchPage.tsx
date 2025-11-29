// src/pages/SearchPage.tsx
import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';

import { Dish } from '../components/DishCard';
import DishList from '../components/DishList';
import SearchBar from '../components/SearchBar';
import { searchDishes } from '../api/searchApi';

export default function SearchPage({ route, navigation }: any) {
  const initialQuery = route.params?.query || '';
  const [text, setText] = useState(initialQuery);
  const [results, setResults] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!text.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const data = await searchDishes(text);   // 🔥 여기서 백엔드 호출
      setResults(data);
    } catch (e) {
      console.error('검색 실패:', e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔙 뒤로가기 + 타이틀 */}
      <View style={styles.header}>
        <ArrowLeft size={24} color="#333" onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>검색</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* 검색창 */}
      <View style={{ marginTop: 10, paddingHorizontal: 16 }}>
        <SearchBar
          value={text}
          onChangeText={setText}
          onSubmit={handleSearch}
          placeholder="먹고 싶은 반찬을 검색해보세요"
        />
      </View>

      {/* 결과 */}
      {results.length > 0 ? (
        <DishList
          data={results}
          onDishPress={(dish) => navigation.navigate('DishDetail', { dish })}
          onAddCart={(dish) => {
            console.log('add cart from search:', dish.name);
          }}
        />
      ) : !loading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#999', fontSize: 16 },
});
