import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type DeliveryTime = 'lunch' | 'dinner';

interface TimeFilterProps {
  selectedTime: DeliveryTime;
  onSelect: (time: DeliveryTime) => void;
}

const TimeFilter: React.FC<TimeFilterProps> = ({ selectedTime, onSelect }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>지금 핫한 반찬 🔥</Text>
        <Text style={styles.subTitle}>마감 전 주문하세요!</Text>
      </View>

      <View style={styles.toggleGroup}>
        {(['lunch', 'dinner'] as const).map((time) => {
          const isActive = selectedTime === time;
          return (
            <TouchableOpacity
              key={time}
              style={[styles.chip, isActive && styles.activeChip]}
              onPress={() => onSelect(time)}
            >
              <Ionicons size={14} color={isActive ? '#FFF' : '#6B7280'} />
              <Text style={[styles.chipText, isActive && styles.activeChipText]}>
                {time === 'lunch' ? '점심 배달' : '저녁 배달'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginRight: 8,
  },
  subTitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    alignSelf: 'flex-start',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  activeChip: {
    backgroundColor: '#F97316',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
  },
  activeChipText: {
    color: '#FFF',
  },
});

export default TimeFilter;