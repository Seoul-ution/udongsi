import { ChevronDown, Moon, Sun } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type DeliveryTime = 'AM' | 'PM';

interface TimeFilterProps {
  selectedTime: DeliveryTime;
  onSelect: (time: DeliveryTime) => void;
}

const TimeFilter: React.FC<TimeFilterProps> = ({ selectedTime, onSelect }) => {
  return (
    <View style={styles.container}>
      {/* ☀️/🌙 토글 버튼 그룹 */}
      <View style={styles.toggleGroup}>
        <TouchableOpacity
          style={[styles.btn, selectedTime === 'AM' && styles.activeBtn]}
          onPress={() => onSelect('AM')}
        >
          <Sun size={16} color={selectedTime === 'AM' ? '#FFF' : '#F97316'} />
          <Text style={[styles.text, selectedTime === 'AM' && styles.activeText]}>오전</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, selectedTime === 'PM' && styles.activeBtn]}
          onPress={() => onSelect('PM')}
        >
          <Moon size={16} color={selectedTime === 'PM' ? '#FFF' : '#D97706'} />
          <Text style={[styles.text, selectedTime === 'PM' && styles.activeText]}>오후</Text>
        </TouchableOpacity>
      </View>

      {/* 우측 정렬 필터 */}
      <TouchableOpacity style={styles.sortBtn}>
        <Text style={styles.sortText}>추천순</Text>
        <ChevronDown size={14} color="#666" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#FFF7ED', // 연한 베이지색
    borderRadius: 20,
    padding: 4,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginRight: 4,
  },
  activeBtn: {
    backgroundColor: '#F97316', // 주황색
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  text: { marginLeft: 6, fontWeight: '600', color: '#F97316' },
  activeText: { color: '#FFF' },
  sortBtn: { flexDirection: 'row', alignItems: 'center' },
  sortText: { fontSize: 13, color: '#666', marginRight: 4 },
});

export default TimeFilter;