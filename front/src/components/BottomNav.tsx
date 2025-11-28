// src/components/BottomNav.tsx
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BottomNav: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets(); // iOS 홈 인디케이터 높이 가져오기

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom || 4 }]}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;
          const color = isFocused ? '#F97316' : '#9CA3AF';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          const size = 24;
          let iconName: keyof typeof Ionicons.glyphMap = 'ellipse-outline';

          if (route.name === 'Home') {
            iconName = isFocused ? 'home' : 'home-outline';
          } else if (route.name === 'Category') {
            iconName = isFocused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Cart') {
            iconName = isFocused ? 'cart' : 'cart-outline';
          } else if (route.name === 'My') {
            iconName = isFocused ? 'person' : 'person-outline';
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.8}
            >
              <Ionicons name={iconName} size={size} color={color} />
              <Text style={[styles.label, { color }]}>{label as string}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const TAB_HEIGHT = 60;

const styles = StyleSheet.create({
  // 네이티브에서 React Navigation이 알아서 탭바 위치를 잡아줌
  wrapper: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  container: {
    flexDirection: 'row',
    height: TAB_HEIGHT,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'android' ? 0 : 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  label: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default BottomNav;