// src/pages/HomePage.tsx

import { StyleSheet, Text, View } from 'react-native';

export default function HomePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>우동시 🥘</Text>
      <Text style={styles.subtitle}>우리 동네 시장 반찬 공동구매 서비스</Text>
      <Text style={styles.content}>
        이제 여기서 MarketTabs, SearchBar, Banner 등을 조립하면 돼!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  content: {
    fontSize: 14,
    color: '#555',
  },
});