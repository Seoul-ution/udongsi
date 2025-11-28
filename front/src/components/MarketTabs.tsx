import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';

// 시장 데이터 타입 정의
export interface Market {
  id: number;
  name: string;
}

interface MarketTabsProps {
  markets: Market[];
  selectedId: number;
  onSelect: (id: number) => void;
}

const MarketTabs: React.FC<MarketTabsProps> = ({ markets, selectedId, onSelect }) => {
  return (
    <View style={styles.wrapper}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.container}
      >
        {markets.map((market) => {
          const isSelected = market.id === selectedId;
          return (
            <TouchableOpacity
              key={market.id}
              style={[styles.tab, isSelected && styles.activeTab]}
              onPress={() => onSelect(market.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.text, isSelected && styles.activeText]}>
                {market.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFF',
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  text: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  activeText: {
    color: '#FFF',
  },
});

export default MarketTabs;