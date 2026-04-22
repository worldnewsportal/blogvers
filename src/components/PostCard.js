// src/components/PostCard.js
// ==========================================
// Beautiful Post Card Component
// ==========================================

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  I18nManager,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS, GRADIENTS } from '../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

// ==========================================
// LARGE CARD (Hero / Featured)
// ==========================================
export const PostCardLarge = memo(({ post, onPress, onBookmark, onLike, isLiked, isBookmarked, theme = 'dark' }) => {
  const colors = COLORS[theme];
  const fonts = FONT_SIZES.medium;

  const timeAgo = post.publishedAt?.toDate
    ? formatDistanceToNow(post.publishedAt.toDate(), { addSuffix: true, locale: ar })
    : 'الآن';

  return (
    <TouchableOpacity
      style={[styles.largeCard, { backgroundColor: colors.card }]}
      onPress={() => onPress(post)}
      activeOpacity={0.95}
    >
      {/* Cover Image */}
      <View style={styles.largeImageContainer}>
        <Image
          source={{ uri: post.coverImage || 'https://picsum.photos/800/400?random=' + post.id }}
          style={styles.largeImage}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={['transparent', 'rgba(15,15,26,0.95)']}
          style={styles.imageGradient}
        />

        {/* Category Badge */}
        <View style={[styles.categoryBadge, { backgroundColor: COLORS.primary }]}>
          <Text style={styles.categoryText}>{post.category || 'عام'}</Text>
        </View>

        {/* Premium Badge */}
        {post.isPremium && (
          <View style={styles.premiumBadge}>
            <MaterialCommunityIcons name="crown" size={12} color={COLORS.gold} />
            <Text style={styles.premiumText}>مميز</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.largeContent}>
        {/* Author Row */}
        <View style={styles.authorRow}>
          <Image
            source={{ uri: post.authorPhoto || `https://ui-avatars.com/api/?name=${post.authorName}&background=6C63FF&color=fff` }}
            style={styles.authorAvatar}
          />
          <View style={styles.authorInfo}>
            <Text style={[styles.authorName, { color: colors.text }]}>{post.authorName || 'كاتب مجهول'}</Text>
            <Text style={[styles.postTime, { color: colors.textMuted }]}>{timeAgo} · {post.readingTime || 3} دقائق للقراءة</Text>
          </View>
          <TouchableOpacity
            style={styles.bookmarkBtn}
            onPress={() => onBookmark && onBookmark(post.id)}
          >
            <Feather
              name={isBookmarked ? 'bookmark' : 'bookmark'}
              size={20}
              color={isBookmarked ? COLORS.primary : colors.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={[styles.largeTitle, { color: colors.text }]} numberOfLines={2}>
          {post.title}
        </Text>

        {/* Excerpt */}
        <Text style={[styles.excerpt, { color: colors.textSecondary }]} numberOfLines={2}>
          {post.excerpt}
        </Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => onLike && onLike(post.id)}
          >
            <MaterialCommunityIcons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={18}
              color={isLiked ? COLORS.secondary : colors.textMuted}
            />
            <Text style={[styles.statText, { color: colors.textMuted }]}>{formatNumber(post.likes || 0)}</Text>
          </TouchableOpacity>

          <View style={styles.statItem}>
            <MaterialCommunityIcons name="comment-outline" size={18} color={colors.textMuted} />
            <Text style={[styles.statText, { color: colors.textMuted }]}>{formatNumber(post.comments || 0)}</Text>
          </View>

          <View style={styles.statItem}>
            <MaterialCommunityIcons name="eye-outline" size={18} color={colors.textMuted} />
            <Text style={[styles.statText, { color: colors.textMuted }]}>{formatNumber(post.views || 0)}</Text>
          </View>

          {/* Tags */}
          {post.tags?.slice(0, 2).map((tag, i) => (
            <View key={i} style={[styles.tag, { backgroundColor: colors.inputBg }]}>
              <Text style={[styles.tagText, { color: colors.textSecondary }]}>#{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
});

// ==========================================
// HORIZONTAL CARD (Compact)
// ==========================================
export const PostCardHorizontal = memo(({ post, onPress, onBookmark, isBookmarked, theme = 'dark' }) => {
  const colors = COLORS[theme];

  const timeAgo = post.publishedAt?.toDate
    ? formatDistanceToNow(post.publishedAt.toDate(), { addSuffix: true, locale: ar })
    : 'الآن';

  return (
    <TouchableOpacity
      style={[styles.horizontalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
      onPress={() => onPress(post)}
      activeOpacity={0.92}
    >
      {/* Thumbnail */}
      <Image
        source={{ uri: post.coverImage || 'https://picsum.photos/200/200?random=' + post.id }}
        style={styles.thumbnail}
        contentFit="cover"
        transition={200}
      />

      {/* Content */}
      <View style={styles.horizontalContent}>
        <View style={[styles.miniCategoryBadge, { backgroundColor: COLORS.primary + '20' }]}>
          <Text style={[styles.miniCategoryText, { color: COLORS.primary }]}>{post.category || 'عام'}</Text>
        </View>

        <Text style={[styles.horizontalTitle, { color: colors.text }]} numberOfLines={2}>
          {post.title}
        </Text>

        <View style={styles.horizontalMeta}>
          <Text style={[styles.horizontalTime, { color: colors.textMuted }]}>{timeAgo}</Text>
          <View style={styles.miniStats}>
            <MaterialCommunityIcons name="heart-outline" size={13} color={colors.textMuted} />
            <Text style={[styles.miniStatText, { color: colors.textMuted }]}>{formatNumber(post.likes || 0)}</Text>
          </View>
        </View>
      </View>

      {/* Bookmark */}
      <TouchableOpacity onPress={() => onBookmark && onBookmark(post.id)} style={styles.miniBookmark}>
        <MaterialCommunityIcons
          name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
          size={18}
          color={isBookmarked ? COLORS.primary : colors.textMuted}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

// ==========================================
// TRENDING CARD (Wide horizontal scroll)
// ==========================================
export const PostCardTrending = memo(({ post, onPress, rank, theme = 'dark' }) => {
  const colors = COLORS[theme];

  return (
    <TouchableOpacity
      style={styles.trendingCard}
      onPress={() => onPress(post)}
      activeOpacity={0.93}
    >
      <Image
        source={{ uri: post.coverImage || 'https://picsum.photos/300/200?random=' + post.id }}
        style={styles.trendingImage}
        contentFit="cover"
        transition={200}
      />
      <LinearGradient colors={GRADIENTS.overlay} style={styles.trendingGradient}>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
        <View style={styles.trendingContent}>
          <Text style={styles.trendingTitle} numberOfLines={2}>{post.title}</Text>
          <View style={styles.trendingMeta}>
            <MaterialCommunityIcons name="fire" size={14} color={COLORS.secondary} />
            <Text style={styles.trendingViews}>{formatNumber(post.views || 0)} مشاهدة</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

// ==========================================
// SKELETON CARD (Loading)
// ==========================================
export const PostCardSkeleton = ({ theme = 'dark' }) => {
  const colors = COLORS[theme];
  return (
    <View style={[styles.largeCard, { backgroundColor: colors.card }]}>
      <View style={[styles.skeletonImage, { backgroundColor: colors.inputBg }]} />
      <View style={{ padding: SPACING.base }}>
        <View style={[styles.skeletonLine, { width: '40%', backgroundColor: colors.inputBg }]} />
        <View style={[styles.skeletonLine, { width: '90%', backgroundColor: colors.inputBg, height: 20, marginTop: 8 }]} />
        <View style={[styles.skeletonLine, { width: '70%', backgroundColor: colors.inputBg }]} />
      </View>
    </View>
  );
};

// ==========================================
// HELPERS
// ==========================================
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'م';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'ك';
  return num.toString();
};

const styles = StyleSheet.create({
  // Large Card
  largeCard: {
    borderRadius: BORDER_RADIUS.xl,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.base,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  largeImageContainer: {
    height: 200,
    position: 'relative',
  },
  largeImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  categoryBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  premiumBadge: {
    position: 'absolute',
    top: SPACING.sm,
    left: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    gap: 3,
  },
  premiumText: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
  },
  largeContent: {
    padding: SPACING.base,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '20',
  },
  authorInfo: {
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
  },
  postTime: {
    fontSize: 11,
    marginTop: 1,
  },
  bookmarkBtn: {
    padding: SPACING.xs,
  },
  largeTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: SPACING.xs,
    textAlign: 'right',
  },
  excerpt: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.sm,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  tagText: {
    fontSize: 11,
  },

  // Horizontal Card
  horizontalCard: {
    flexDirection: 'row',
    borderRadius: BORDER_RADIUS.lg,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
    overflow: 'hidden',
    borderWidth: 1,
    ...SHADOWS.sm,
  },
  thumbnail: {
    width: 90,
    height: 90,
    backgroundColor: '#1A1A2E',
  },
  horizontalContent: {
    flex: 1,
    padding: SPACING.sm,
    justifyContent: 'space-between',
  },
  miniCategoryBadge: {
    alignSelf: 'flex-end',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: 4,
  },
  miniCategoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  horizontalTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'right',
  },
  horizontalMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  horizontalTime: { fontSize: 11 },
  miniStats: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  miniStatText: { fontSize: 11 },
  miniBookmark: { padding: SPACING.sm, justifyContent: 'center' },

  // Trending Card
  trendingCard: {
    width: 220,
    height: 160,
    borderRadius: BORDER_RADIUS.xl,
    marginLeft: SPACING.base,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  trendingImage: { width: '100%', height: '100%' },
  trendingGradient: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'space-between',
    padding: SPACING.sm,
  },
  rankBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
  },
  rankText: { color: '#FFF', fontSize: 12, fontWeight: '800' },
  trendingContent: { },
  trendingTitle: { color: '#FFF', fontSize: 13, fontWeight: '700', lineHeight: 18, textAlign: 'right' },
  trendingMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  trendingViews: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },

  // Skeleton
  skeletonImage: { height: 180, width: '100%' },
  skeletonLine: { height: 14, borderRadius: 7, marginBottom: 8 },
});
