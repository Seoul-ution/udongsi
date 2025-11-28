import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, TextInputProps } from 'react-native';
import { Search } from 'lucide-react-native';

interface SearchBarProps extends TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChangeText, onSubmit, ...props }) => {
  return (
    <View style={styles.container}>
      <Search color="#9CA3AF" size={20} />
      <TextInput
        style={styles.input}
        placeholder="오늘 먹고 싶은 반찬은?"
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        autoCapitalize="none"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
    height: '100%',
    // @ts-ignore: Web only style
    outlineStyle: 'none' as any, 
  },
});

export default SearchBar;