// front/App.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // 추가됨
import { Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 페이지들
import CartPage from './src/pages/CartPage';
import CategoryPage from './src/pages/CategoryPage';
import DishDetailPage from './src/pages/DishDetailPage';
import HomePage from './src/pages/HomePage';
import OrderPage from './src/pages/OrderPage';
import SearchPage from './src/pages/SearchPage';
import MyPage from './src/pages/MyPage';

// 컴포넌트
import BottomNav from './src/components/BottomNav';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

/*
const MyPage = () => {
  return (
    <View style={{ flex: 1, backgroundColor: 'tomato', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: 'white', fontSize: 20 }}>TEST MY PAGE</Text>
    </View>
  );
};
*/

// 1. 하단 탭 네비게이션 (메인 화면들)
function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomePage} options={{ title: '홈' }} />
      <Tab.Screen name="Category" component={CategoryPage} options={{ title: '카테고리' }} />
      <Tab.Screen name="Cart" component={CartPage} options={{ title: '장바구니' }} />
      <Tab.Screen name="My" component={MyPage} options={{ title: '마이페이지' }} />
    </Tab.Navigator>
  );
}

// 2. 전체 앱 네비게이션 (탭 + 상세 페이지들)
export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* 메인 탭 화면 */}
          <Stack.Screen name="MainTabs" component={MainTabNavigator} />
          
          {/* 탭바 없이 덮어씌워지는 상세 화면들 */}
          <Stack.Screen name="Search" component={SearchPage} />
          <Stack.Screen name="DishDetail" component={DishDetailPage} />
          <Stack.Screen name="Order" component={OrderPage} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}