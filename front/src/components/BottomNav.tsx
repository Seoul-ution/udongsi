import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Home, Menu, ShoppingCart, User } from 'lucide-react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const BottomNav: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          
          // 라벨 결정 로직 (options.tabBarLabel -> options.title -> route.name 순)
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
              navigation.navigate(route.name);
            }
          };

          // 아이콘 렌더링 헬퍼
          const renderIcon = () => {
            const iconSize = 24;
            switch (route.name) {
              case 'Home': return <Home size={iconSize} color={color} />;
              case 'Category': return <Menu size={iconSize} color={color} />;
              case 'Cart': return <ShoppingCart size={iconSize} color={color} />;
              case 'My': return <User size={iconSize} color={color} />;
              default: return <Home size={iconSize} color={color} />;
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.8}
            >
              {renderIcon()}
              <Text style={[styles.label, { color }]}>
                {label as string}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  container: {
    flexDirection: 'row',
    height: 60,
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