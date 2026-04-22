// src/screens/HomeScreen.js
// ==========================================
// Home Screen - Main Blog Feed
// ==========================================

import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  View, Text, FlatList, ScrollView, TouchableOpacity,
  RefreshControl, StatusBar, Animated, StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { fetchLatestPosts, fetchTrendingPosts, toggleLikeAsync } from '../store/slices/postsSlice';
import { toggleBookmark } from '../services/postsService';
import { PostCardLarge, PostCardHorizontal, PostCardTrending, PostCardSkeleton } from '../components/PostCard';
import {
  UnityBannerAd,
  InFeedAdCard,
  MediumRectangleBanner,
  useInterstitialAd,
} from '../components/UnityAdsComponents';
import { trackNavigationAndShowAd } from '../services/unityAdsService';
import { COLORS, SPACING, FONTS, FONT_SIZES, BORDER_RADIUS, GRADIENTS } from '../constants/theme';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { latest, trending, isLoading, isLoadingMore, hasMore, lastDoc, likedPosts, bookmarkedPosts } = useSelector((s) => s.posts);
  const { profile } = useSelector((s) => s.auth);
  const { theme, showAds } = useSelector((s) => s.ui);
  const { list: categories } = useSelector((s) => s.categories);
  const colors = COLORS[theme];

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('latest'); // latest | trending | following
  const scrollY = useRef(new Animated.Value(0)).current;

  // Animated header
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(() => {
    dispatch(fetchLatestPosts({}));
    dispatch(fetchTrendingPosts({ period: '7days' }));
  }, [dispatch]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && lastDoc) {
      dispatch(fetchLatestPosts({ lastDoc }));
    }
  }, [isLoadingMore, hasMore, lastDoc, dispatch]);

  const { show: showInterstitial } = useInterstitialAd();

  const handlePostPress = useCallback((post) => {
    // إعلان بيني ذكي كل 4 تنقلات تلقائياً
    trackNavigationAndShowAd();
    navigation.navigate('PostDetail', { postId: post.id, post });
  }, [navigation]);

  const handleLike = useCallback((postId) => {
    if (!profile) {
      navigation.navigate('Auth');
      return;
    }
    dispatch(toggleLikeAsync({ postId, userId: profile.uid }));
  }, [profile, dispatch, navigation]);

  const handleBookmark = useCallback(async (postId) => {
    if (!profile) {
      navigation.navigate('Auth');
      return;
    }
    await toggleBookmark(postId, profile.uid);
  }, [profile, navigation]);

  // ==========================================
  // RENDER HEADER
  // ==========================================
  const renderHeader = () => (
    <View>
      {/* Hero Greeting */}
      <LinearGradient
        colors={[colors.surface, colors.background]}
        style={styles.heroSection}
      >
        <View style={styles.greetingRow}>
          <View>
            <Text style={[styles.greeting, { color: colors.textMuted }]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.greetingName, { color: colors.text }]}>
              {profile ? profile.displayName : 'القارئ'}  👋
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={[styles.notifIcon, { backgroundColor: colors.inputBg }]}>
              <Feather name="bell" size={22} color={colors.text} />
              <View style={styles.notifDot} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={[styles.searchBar, { backgroundColor: colors.inputBg }]}
          onPress={() => navigation.navigate('Search')}
        >
          <Feather name="search" size={18} color={colors.textMuted} />
          <Text style={[styles.searchPlaceholder, { color: colors.textMuted }]}>
            ابحث عن مقالات، كتّاب...
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Categories */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>التصنيفات</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
          <Text style={[styles.seeAll, { color: COLORS.primary }]}>عرض الكل</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            { backgroundColor: selectedCategory === null ? COLORS.primary : colors.inputBg },
          ]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.categoryChipText, { color: selectedCategory === null ? '#FFF' : colors.textSecondary }]}>
            الكل
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryChip,
              { backgroundColor: selectedCategory === cat.id ? cat.color || COLORS.primary : colors.inputBg },
            ]}
            onPress={() => setSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text style={[styles.categoryChipText, { color: selectedCategory === cat.id ? '#FFF' : colors.textSecondary }]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Trending Section */}
      {trending.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialCommunityIcons name="fire" size={20} color={COLORS.secondary} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>الأكثر رواجاً</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Trending')}>
              <Text style={[styles.seeAll, { color: COLORS.primary }]}>المزيد</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.trendingScroll}
          >
            {trending.slice(0, 6).map((post, index) => (
              <PostCardTrending
                key={post.id}
                post={post}
                rank={index + 1}
                onPress={handlePostPress}
                theme={theme}
              />
            ))}
          </ScrollView>
        </>
      )}

      {/* Banner Ad — بانر Unity */}
      {showAds && <UnityBannerAd size="BANNER" style={{ marginVertical: SPACING.sm }} />}

      {/* Tab Filter */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.surface }]}>
        {[
          { key: 'latest', label: 'الأحدث', icon: 'clock-outline' },
          { key: 'trending', label: 'رائج', icon: 'trending-up' },
          { key: 'following', label: 'متابَعون', icon: 'account-group-outline' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={16}
              color={activeTab === tab.key ? COLORS.primary : colors.textMuted}
            />
            <Text style={[styles.tabText, { color: activeTab === tab.key ? COLORS.primary : colors.textMuted }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // ==========================================
  // RENDER POST ITEM
  // ==========================================
  const renderPost = useCallback(({ item, index }) => {
    // كل 3 مقالات: InFeedAdCard (مكافأة) | كل 6: MediumRectangle (بانر)
    if (showAds && index > 0 && index % 6 === 0) {
      return (
        <View key={`ad_mrec_${index}`}>
          <MediumRectangleBanner style={{ marginVertical: SPACING.sm }} />
          <PostCardLarge
            post={item}
            onPress={handlePostPress}
            onLike={handleLike}
            onBookmark={handleBookmark}
            isLiked={likedPosts.has(item.id)}
            isBookmarked={bookmarkedPosts.has(item.id)}
            theme={theme}
          />
        </View>
      );
    }

    if (showAds && index > 0 && index % 3 === 0) {
      return (
        <View key={`ad_feed_${index}`}>
          <InFeedAdCard onPress={(r) => console.log('InFeed result:', r)} />
          <PostCardLarge
            post={item}
            onPress={handlePostPress}
            onLike={handleLike}
            onBookmark={handleBookmark}
            isLiked={likedPosts.has(item.id)}
            isBookmarked={bookmarkedPosts.has(item.id)}
            theme={theme}
          />
        </View>
      );
    }

    // Alternate between large and horizontal cards
    if (index % 3 === 0) {
      return (
        <PostCardLarge
          key={item.id}
          post={item}
          onPress={handlePostPress}
          onLike={handleLike}
          onBookmark={handleBookmark}
          isLiked={likedPosts.has(item.id)}
          isBookmarked={bookmarkedPosts.has(item.id)}
          theme={theme}
        />
      );
    }

    return (
      <PostCardHorizontal
        key={item.id}
        post={item}
        onPress={handlePostPress}
        onBookmark={handleBookmark}
        isBookmarked={bookmarkedPosts.has(item.id)}
        theme={theme}
      />
    );
  }, [handlePostPress, handleLike, handleBookmark, likedPosts, bookmarkedPosts, theme, showAds]);

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footer}>
        {[1, 2].map((i) => <PostCardSkeleton key={i} theme={theme} />)}
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View>
          {[1, 2, 3].map((i) => <PostCardSkeleton key={i} theme={theme} />)}
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="newspaper-variant-outline" size={64} color={colors.textMuted} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>لا توجد مقالات بعد</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>كن أول من يكتب مقالاً!</Text>
        <TouchableOpacity
          style={[styles.writeBtn, { backgroundColor: COLORS.primary }]}
          onPress={() => navigation.navigate('CreatePost')}
        >
          <Feather name="edit-3" size={16} color="#FFF" />
          <Text style={styles.writeBtnText}>اكتب مقالاً</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Sticky Animated Header */}
      <Animated.View style={[styles.stickyHeader, { backgroundColor: colors.surface, opacity: headerOpacity }]}>
        <Text style={[styles.stickyTitle, { color: colors.text }]}>BlogVerse</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Feather name="search" size={22} color={colors.text} />
        </TouchableOpacity>
      </Animated.View>

      <FlatList
        data={latest}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
      />
    </SafeAreaView>
  );
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'صباح الخير';
  if (hour < 17) return 'مساء النور';
  return 'مساء الخير';
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroSection: { padding: SPACING.base, paddingTop: SPACING.sm },
  greetingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.base },
  greeting: { fontSize: 13, marginBottom: 2 },
  greetingName: { fontSize: 22, fontWeight: '800' },
  notificationBtn: {},
  notifIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.secondary },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.xl,
  },
  searchPlaceholder: { fontSize: 15 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  seeAll: { fontSize: 14, fontWeight: '600' },
  categoriesScroll: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.sm, gap: SPACING.sm },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  categoryIcon: { fontSize: 14 },
  categoryChipText: { fontSize: 13, fontWeight: '600' },
  trendingScroll: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.base, gap: SPACING.sm },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.base,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  activeTab: { backgroundColor: COLORS.primary + '20' },
  tabText: { fontSize: 13, fontWeight: '600' },
  footer: { paddingBottom: SPACING['2xl'] },
  emptyContainer: { alignItems: 'center', paddingTop: SPACING['4xl'], paddingHorizontal: SPACING['2xl'] },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: SPACING.base },
  emptySubtitle: { fontSize: 14, marginTop: SPACING.xs, textAlign: 'center' },
  writeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm + 2,
    borderRadius: BORDER_RADIUS.full,
  },
  writeBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  stickyTitle: { fontSize: 20, fontWeight: '900' },
});

export default HomeScreen;
