import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Dish } from './DishCard';

// Dish 타입을 확장하여 수량 포함
export interface CartItemType extends Dish {
  quantity: number;
}

interface CartItemProps {
  item: CartItemType;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onIncrease, onDecrease, onRemove }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: item.imageUrl }} style={styles.image} />

      <View style={styles.content}>
        <View style={styles.rowBetween}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <TouchableOpacity onPress={onRemove} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Ionicons size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.rowBetween}>
          <Text style={styles.price}>
            {(item.price * item.quantity).toLocaleString()}원
          </Text>
          
          <View style={styles.counter}>
            <TouchableOpacity onPress={onDecrease} style={styles.countBtn}>
              <Ionicons size={14} color="#4B5563" />
            </TouchableOpacity>
            <Text style={styles.countText}>{item.quantity}</Text>
            <TouchableOpacity onPress={onIncrease} style={styles.countBtn}>
              <Ionicons size={14} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
  },
  countBtn: {
    padding: 6,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
});

export default CartItem;