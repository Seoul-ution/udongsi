import React from 'react';
import { FlatList, View, Text, StyleSheet, ActivityIndicator, ListRenderItem } from 'react-native';
import DishCard, { Dish } from './DishCard';

interface DishListProps {
  data: Dish[];
  isLoading?: boolean;
  onDishPress: (dish: Dish) => void;
  onAddCart: (dish: Dish) => void;
  ListHeaderComponent?: React.ReactElement<any> | React.ReactElement | null;
  refreshing?: boolean;
  onRefresh?: () => void;
}

const DishList: React.FC<DishListProps> = ({ 
  data, 
  isLoading = false, 
  onDishPress, 
  onAddCart, 
  ListHeaderComponent,
  refreshing = false,
  onRefresh
}) => {
  
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>반찬이 없습니다 😭</Text>
      <Text style={styles.emptySubText}>나중에 다시 확인해주세요.</Text>
    </View>
  );

  const renderItem: ListRenderItem<Dish> = ({ item }) => (
    <DishCard 
      dish={item} 
      onPress={() => onDishPress(item)} 
      onAddCart={() => onAddCart(item)}
    />
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        {ListHeaderComponent}
        <ActivityIndicator size="large" color="#F97316" style={styles.spinner} />
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={styles.listContent}
      onRefresh={onRefresh}
      refreshing={refreshing}
      showsVerticalScrollIndicator={false}
      initialNumToRender={5}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  spinner: {
    marginTop: 40,
  },
  listContent: {
    paddingBottom: 100, // 하단 탭바 높이만큼 여백 확보
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default DishList;