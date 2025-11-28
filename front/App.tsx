// App.tsx
// 앱 전체의 루트 엔트리
// src/pages/HomePage를 불러와 첫 화면으로 사용

import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import HomePage from './src/pages/HomePage';

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <HomePage />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});