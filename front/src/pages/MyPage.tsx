// src/pages/MyPage.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 임시 사용자 데이터
const USER_NAME = 'OOO';

// 메뉴 항목 타입
interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: string;
}

// 주문 및 혜택 내역 메뉴
const HISTORY_MENU: MenuItem[] = [
  { icon: 'mail-outline', label: '주문 내역', route: 'OrderHistory' },
  { icon: 'card-outline', label: '결제 수단', route: 'PaymentMethods' },
  { icon: 'gift-outline', label: '쿠폰 / 포인트', route: 'Coupons' },
];

// 기타 정보 메뉴
const GENERAL_MENU: MenuItem[] = [
  { icon: 'calendar-outline', label: '가입일은 최근', route: 'SignupDate' },
  { icon: 'lock-open-outline', label: '개인정보 수정', route: 'EditProfile' },
  { icon: 'document-text-outline', label: '서비스 이용약관', route: 'Terms' },
];

// 메뉴 항목 컴포넌트
const MenuItemComponent: React.FC<{ item: MenuItem; onPress: () => void }> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    {/* 아이콘 색상: 이미지 속 연한 주황/베이지 톤 */}
    <Ionicons name={item.icon} size={20} color="#FFE5C9" style={styles.menuIcon} /> 
    <Text style={styles.menuLabel}>{item.label}</Text>
    {/* 오른쪽 화살표 색상: 이미지와 비슷한 연한 회색/베이지 톤 */}
    <Ionicons name="chevron-forward-outline" size={20} color="#BFBFBF" /> 
  </TouchableOpacity>
);


const MyPage: React.FC = ({ navigation }: any) => {
  const handleMenuPress = (route: string) => {
    console.log(`${route} 메뉴로 이동 요청`);
    // navigation.navigate(route); 
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마이페이지</Text>
        <TouchableOpacity onPress={() => console.log('설정 버튼 클릭')}>
          {/* 설정 아이콘 색상: 이미지의 짙은 회색/갈색 톤 */}
          <Ionicons name="settings-outline" size={24} color="#666666" /> 
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 사용자 프로필 섹션 */}
        <View style={styles.profileCard}>
          <View style={styles.profileAvatar}>
            <Text style={styles.avatarText}>사람</Text> 
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{USER_NAME} 님</Text>
            <Text style={styles.profileGreeting}>안녕하세요</Text>
          </View>
        </View>

        {/* 내역 섹션 */}
        <Text style={styles.sectionTitle}>내역</Text> 
        <View style={styles.menuCard}>
          {HISTORY_MENU.map((item, index) => (
            <MenuItemComponent
              key={item.route}
              item={item}
              onPress={() => handleMenuPress(item.route)}
            />
          ))}
        </View>

        {/* 기타 섹션 */}
        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>기타</Text> 
        <View style={styles.menuCard}>
          {GENERAL_MENU.map((item, index) => (
            <MenuItemComponent
              key={item.route}
              item={item}
              onPress={() => handleMenuPress(item.route)}
            />
          ))}
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFE5C9', 
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFE5C9', 
    borderBottomWidth: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333', 
  },

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', 
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, 
    shadowRadius: 3,
    elevation: 2,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFE5C9', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20, 
    fontWeight: '700',
    color: '#FFFFFF', 
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333', 
    marginBottom: 4,
  },
  profileGreeting: {
    fontSize: 14,
    color: '#8F8F8F', 
  },

  // Menu Sections
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#444444', 
    marginBottom: 8,
    paddingLeft: 4,
  },
  menuCard: {
    backgroundColor: '#FFFFFF', 
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 0, 
  },
  menuIcon: {
    marginRight: 12,
    width: 20,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#555555', 
  },
});

export default MyPage;