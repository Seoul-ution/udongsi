// src/routes/RootNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import BottomNav from '../components/BottomNav';
import CartPage from '../pages/CartPage';
import CategoryPage from '../pages/CategoryPage';
import HomePage from '../pages/HomePage';
import MyPage from '../pages/MyPage';

const Tab = createBottomTabNavigator();

const RootNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomNav {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{ tabBarLabel: '홈' }}
      />
      <Tab.Screen
        name="Category"
        component={CategoryPage}
        options={{ tabBarLabel: '카테고리' }}
      />
      <Tab.Screen
        name="Cart"
        component={CartPage}
        options={{ tabBarLabel: '장바구니' }}
      />
      <Tab.Screen
        name="My"
        component={MyPage}
        options={{ tabBarLabel: '마이페이지' }}
      />
    </Tab.Navigator>
  );
};

export default RootNavigator;