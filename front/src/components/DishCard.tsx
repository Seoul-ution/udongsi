import { Plus, Star } from 'lucide-react-native';
import React from 'react';
import { GestureResponderEvent, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface Dish {
  id: number;
  name: string;
  price: number;
  rating?: number;
  imageUrl: string;
  // 필요시 추가 필드 정의
}

interface DishCardProps {
  dish: Dish;
  onPress: () => void;
  onAddCart: () => void;
}

const DishCard: React.FC<DishCardProps> = ({ dish, onPress, onAddCart }) => {
  const handleAddCart = (e: GestureResponderEvent) => {
    e.stopPropagation(); // 웹/앱 이벤트 전파 방지
    onAddCart();
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress} 
      activeOpacity={0.8}
    >
      <Image 
        source={{ uri: dish.imageUrl }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.info}>
        <View style={styles.ratingRow}>
          <Star size={12} color="#F97316" fill="#F97316" />
          <Text style={styles.ratingText}>{dish.rating?.toFixed(1) || '0.0'}</Text>
        </View>
        
        <Text style={styles.name} numberOfLines={1}>{dish.name}</Text>
        <Text style={styles.price}>
          {dish.price.toLocaleString()}원
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={handleAddCart}
      >
        <Plus size={20} color="#4B5563" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    marginBottom: 12,
    borderRadius: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginRight: 16,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#F97316',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DishCard;