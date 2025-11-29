import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

interface BannerProps {
  onPress?: () => void;
}

const Banner: React.FC<BannerProps> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800' }} 
        style={styles.background}
        imageStyle={{ borderRadius: 16 }}
      >
        <View style={styles.overlay}>
          <View style={styles.textGroup}>
            <Text style={styles.subtitle}>첫 주문 고객님을 위한</Text>
            <Text style={styles.title}>전 메뉴 5,000원 할인!</Text>
            <Text style={styles.description}>시장 맛집을 집앞으로 🚀</Text>
          </View>
          
          <View style={styles.iconButton}>
            <ChevronRight color="#FFF" size={20} />
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 24,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textGroup: {
    flex: 1,
  },
  subtitle: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4,
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#F3F4F6',
    fontSize: 13,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Banner;