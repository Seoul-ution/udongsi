// front/App.tsx
import { SafeAreaView, StatusBar } from 'react-native';
import HomePage from './src/pages/HomePage';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" />
      <HomePage />
    </SafeAreaView>
  );
}