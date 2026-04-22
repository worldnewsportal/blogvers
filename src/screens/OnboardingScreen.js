// src/screens/OnboardingScreen.js
import React, { useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { setIsOnboarded } from '../store/slices/uiSlice';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const SLIDES = [
  { id: 1, icon: '📖', title: 'اكتشف أفضل المقالات', subtitle: 'محتوى عربي متميز في التقنية والثقافة والعلوم والأعمال من أفضل الكتّاب', color: '#6C63FF' },
  { id: 2, icon: '✍️', title: 'اكتب وانشر بحرية', subtitle: 'محرر احترافي يدعم Markdown الكامل، أنشئ مقالاتك وشاركها مع الآلاف', color: '#FF6B6B' },
  { id: 3, icon: '👥', title: 'تواصل مع الكتّاب', subtitle: 'تابع كتّابك المفضلين، علّق وتفاعل، وابنِ شبكة معرفية متميزة', color: '#4ECDC4' },
  { id: 4, icon: '🚀', title: 'ابدأ رحلتك الآن', subtitle: 'انضم لمجتمع BlogVerse وكن جزءاً من ثورة المحتوى العربي الرقمي', color: COLORS.primary },
];

export const OnboardingScreen = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((s) => s.ui);
  const colors = COLORS[theme];
  const [current, setCurrent] = useState(0);
  const flatRef = useRef(null);

  const goNext = () => {
    if (current < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: current + 1 });
      setCurrent(current + 1);
    } else {
      dispatch(setIsOnboarded());
    }
  };

  return (
    <SafeAreaView style={[styles.onboardContainer, { backgroundColor: colors.background }]}>
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal pagingEnabled showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setCurrent(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <LinearGradient colors={[item.color + '20', 'transparent']} style={styles.slideGradient} />
            <Text style={styles.slideIcon}>{item.icon}</Text>
            <Text style={[styles.slideTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.slideSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i === current ? COLORS.primary : colors.textMuted, width: i === current ? 24 : 8 }]} />
        ))}
      </View>
      {/* Buttons */}
      <View style={styles.onboardActions}>
        {current > 0 && (
          <TouchableOpacity onPress={() => dispatch(setIsOnboarded())} style={[styles.skipBtn, { borderColor: colors.divider }]}>
            <Text style={[styles.skipText, { color: colors.textMuted }]}>تخطي</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={{ flex: 1 }} onPress={goNext}>
          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.nextBtn}>
            <Text style={styles.nextText}>{current === SLIDES.length - 1 ? 'ابدأ الآن 🚀' : 'التالي'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ==========================================
// SEARCH SCREEN
// ==========================================
import { TextInput } from 'react-native';
import { useDispatch as useD2, useSelector as useS2 } from 'react-redux';
import { searchPostsAsync, clearSearch } from '../store/slices/postsSlice';
import { PostCardHorizontal } from '../components/PostCard';
import { useNavigation as useNav } from '@react-navigation/native';

export const SearchScreen = () => {
  const dispatch = useD2();
  const navigation = useNav();
  const { searchResults, isLoading } = useS2((s) => s.posts);
  const { theme } = useS2((s) => s.ui);
  const colors = COLORS[theme];
  const [query, setQuery] = useState('');

  const handleSearch = (text) => {
    setQuery(text);
    if (text.length > 2) {
      dispatch(searchPostsAsync({ query: text }));
    } else {
      dispatch(clearSearch());
    }
  };

  const TRENDING_TAGS = ['تقنية', 'ذكاء اصطناعي', 'ريادة أعمال', 'صحة', 'سفر', 'برمجة', 'كتب', 'فلسفة'];

  return (
    <SafeAreaView style={[styles.container2, { backgroundColor: colors.background }]}>
      <View style={[styles.searchHeader, { backgroundColor: colors.surface }]}>
        <Text style={[styles.searchTitle, { color: colors.text }]}>البحث</Text>
        <View style={[styles.searchInputWrap, { backgroundColor: colors.inputBg }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="ابحث عن مقالات، كتّاب، وسوم..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={handleSearch}
            autoFocus
            textAlign="right"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); dispatch(clearSearch()); }}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!query ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={[styles.trendLabel, { color: colors.text }]}>🔥 الأكثر بحثاً</Text>
          <View style={styles.tagsGrid}>
            {TRENDING_TAGS.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={[styles.trendTag, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                onPress={() => handleSearch(tag)}
              >
                <MaterialCommunityIcons name="trending-up" size={14} color={COLORS.primary} />
                <Text style={[styles.trendTagText, { color: colors.text }]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCardHorizontal post={item} onPress={(p) => navigation.navigate('PostDetail', { postId: p.id, post: p })} theme={theme} />
          )}
          ListEmptyComponent={
            !isLoading && query.length > 2 && (
              <View style={styles.emptySearch}>
                <Text style={{ fontSize: 32 }}>🔍</Text>
                <Text style={[{ color: colors.textMuted, fontSize: 15, marginTop: 8, textAlign: 'center' }]}>لا نتائج لـ "{query}"</Text>
              </View>
            )
          }
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}
    </SafeAreaView>
  );
};

// ==========================================
// PROFILE SCREEN (stub)
// ==========================================
export const ProfileScreen = () => {
  const { profile } = useSelector((s) => s.auth);
  const { theme } = useSelector((s) => s.ui);
  const colors = COLORS[theme];
  const navigation = useNavigation();

  if (!profile) return (
    <SafeAreaView style={[styles.container2, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
      <Text style={{ fontSize: 40 }}>👤</Text>
      <Text style={[{ color: colors.text, fontSize: 18, fontWeight: '700', marginTop: 16, textAlign: 'center' }]}>سجّل الدخول لعرض ملفك</Text>
      <TouchableOpacity onPress={() => navigation.navigate('Auth')} style={[styles.nextBtn, { marginTop: 24, paddingHorizontal: 32 }]}>
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={{ borderRadius: 25, padding: 14, paddingHorizontal: 32 }}>
          <Text style={styles.nextText}>تسجيل الدخول</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={[styles.container2, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[COLORS.primary + '30', 'transparent']} style={{ paddingBottom: 20, paddingTop: 20 }}>
          <View style={{ alignItems: 'center' }}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={{ width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#FFF', fontSize: 36, fontWeight: '900' }}>{profile.displayName?.charAt(0)}</Text>
            </LinearGradient>
            <Text style={[{ color: colors.text, fontSize: 22, fontWeight: '900', marginTop: 12 }]}>{profile.displayName}</Text>
            <Text style={[{ color: colors.textMuted, fontSize: 14, marginTop: 4 }]}>@{profile.username}</Text>
            <View style={{ flexDirection: 'row', gap: 32, marginTop: 20 }}>
              {[['مقال', profile.postsCount || 0], ['متابع', profile.followersCount || 0], ['متابَع', profile.followingCount || 0]].map(([label, count]) => (
                <View key={label} style={{ alignItems: 'center' }}>
                  <Text style={[{ color: colors.text, fontSize: 20, fontWeight: '800' }]}>{count}</Text>
                  <Text style={[{ color: colors.textMuted, fontSize: 12 }]}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={{ flexDirection: 'row', alignItems: 'center', margin: 16, padding: 16, backgroundColor: colors.card, borderRadius: 16, gap: 12 }}>
          <MaterialCommunityIcons name="cog" size={22} color={COLORS.primary} />
          <Text style={[{ color: colors.text, fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'right' }]}>الإعدادات</Text>
          <MaterialCommunityIcons name="chevron-left" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Simple stubs for remaining screens
const SimpleScreen = ({ title, emoji }) => {
  const { theme } = useSelector((s) => s.ui);
  const colors = COLORS[theme];
  const navigation = useNavigation();
  return (
    <SafeAreaView style={[styles.container2, { backgroundColor: colors.background }]}>
      <View style={[styles.searchHeader, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-right" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.searchTitle, { color: colors.text }]}>{title}</Text>
        <View style={{ width: 22 }} />
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 64 }}>{emoji}</Text>
        <Text style={[{ color: colors.textMuted, fontSize: 16, marginTop: 16 }]}>قريباً...</Text>
      </View>
    </SafeAreaView>
  );
};

export const BookmarksScreen = () => <SimpleScreen title="المحفوظات" emoji="🔖" />;
export const NotificationsScreen = () => <SimpleScreen title="الإشعارات" emoji="🔔" />;
export const AboutScreen = () => <SimpleScreen title="عن BlogVerse" emoji="ℹ️" />;
export const CategoryScreen = () => <SimpleScreen title="التصنيف" emoji="📂" />;
export const TrendingScreen = () => <SimpleScreen title="الأكثر رواجاً" emoji="🔥" />;
export const AuthorProfileScreen = () => <SimpleScreen title="الملف الشخصي" emoji="👤" />;
export const EditPostScreen = () => <SimpleScreen title="تعديل المقال" emoji="✏️" />;

const styles = StyleSheet.create({
  container2: { flex: 1 },
  // Onboarding
  onboardContainer: { flex: 1 },
  slide: { alignItems: 'center', justifyContent: 'center', padding: SPACING['2xl'], position: 'relative' },
  slideGradient: { position: 'absolute', inset: 0 },
  slideIcon: { fontSize: 80, marginBottom: SPACING['2xl'] },
  slideTitle: { fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: SPACING.base },
  slideSubtitle: { fontSize: 16, textAlign: 'center', lineHeight: 26 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.xs, marginBottom: SPACING.xl },
  dot: { height: 8, borderRadius: 4 },
  onboardActions: { flexDirection: 'row', paddingHorizontal: SPACING.base, paddingBottom: SPACING['2xl'], gap: SPACING.sm },
  skipBtn: { borderWidth: 1, borderRadius: BORDER_RADIUS.full, paddingHorizontal: SPACING.xl, alignItems: 'center', justifyContent: 'center' },
  skipText: { fontSize: 15, fontWeight: '600' },
  nextBtn: { borderRadius: BORDER_RADIUS.full, paddingVertical: SPACING.base, alignItems: 'center' },
  nextText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  // Search
  searchHeader: { padding: SPACING.base, gap: SPACING.sm },
  searchTitle: { fontSize: 24, fontWeight: '900', textAlign: 'right' },
  searchInputWrap: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.base, borderRadius: BORDER_RADIUS.xl, height: 48 },
  searchInput: { flex: 1, fontSize: 15 },
  trendLabel: { fontSize: 18, fontWeight: '800', padding: SPACING.base, textAlign: 'right' },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: SPACING.base, gap: SPACING.sm },
  trendTag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  trendTagText: { fontSize: 13, fontWeight: '600' },
  emptySearch: { alignItems: 'center', paddingTop: 60 },
});

export default OnboardingScreen;
