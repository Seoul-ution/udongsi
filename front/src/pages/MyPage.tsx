// src/pages/MyPage.tsx
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const SECTIONS: MenuSection[] = [
  {
    title: '내역',
    items: [
      { label: '주문 내역', icon: 'bag-outline' },
      { label: '결제 수단', icon: 'card-outline' },
      { label: '쿠폰 / 포인트', icon: 'gift-outline' },
    ],
  },
  {
    title: '기타',
    items: [
      { label: '가입일은 최근', icon: 'calendar-outline' },
      { label: '개인정보 수정', icon: 'lock-closed-outline' },
      { label: '서비스 이용약관', icon: 'document-text-outline' },
    ],
  },
];

const MyPage: React.FC = () => {
  const userName = 'OOO';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마이페이지</Text>
        <TouchableOpacity activeOpacity={0.8}>
          <Ionicons name="settings-outline" size={22} color="#4B3B35" />
        </TouchableOpacity>
      </View>

      {/* 본문 */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 유저 카드 */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>ME</Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userName} 님</Text>
            <Text style={styles.userGreeting}>안녕하세요</Text>
          </View>
        </View>

        {/* 섹션들 */}
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.sectionWrapper}>
            <Text style={styles.sectionTitle}>{section.title}</Text>

            <View style={styles.sectionCard}>
              {section.items.map((item, index) => {
                const isLast = index === section.items.length - 1;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.menuRow, !isLast && styles.menuRowDivider]}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuLeft}>
                      <View style={styles.menuIconWrapper}>
                        <Ionicons name={item.icon} size={18} color="#F97316" />
                      </View>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#D1D5DB"
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const BACKGROUND = '#FFF7EB'; // 다른 페이지와 동일한 배경색
const CARD_BG = '#FFFFFF';
const TEXT_PRIMARY = '#4B3B35';
const TEXT_SECONDARY = '#6B7280';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BACKGROUND, // 상단도 배경색 통일
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  userCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FDBA74',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  userGreeting: {
    fontSize: 13,
    color: TEXT_SECONDARY,
  },
  sectionWrapper: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_SECONDARY,
    marginBottom: 10,
  },
  sectionCard: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  menuRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 14,
    color: TEXT_PRIMARY,
  },
});

export default MyPage;