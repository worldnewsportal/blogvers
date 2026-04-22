// src/screens/PostDetailScreen.js
// ==========================================
// Post Detail Screen - Full Article View
// ==========================================

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Share, Animated, Dimensions, TextInput, KeyboardAvoidingView,
  Platform, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { formatDistanceToNow, format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { fetchPost, toggleLikeAsync } from '../store/slices/postsSlice';
import { toggleBookmark, addComment, getPostComments } from '../services/postsService';
import {
  UnityBannerAd,
  RewardedAdButton,
  RewardedInterstitialCard,
  MediumRectangleBanner,
  PremiumUnlockModal,
} from '../components/UnityAdsComponents';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, GRADIENTS, FONT_SIZES } from '../constants/theme';

const { width, height } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 320;
const HEADER_MIN_HEIGHT = 80;

const PostDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { postId, post: initialPost } = route.params;

  const { currentPost, isLoading, likedPosts } = useSelector((s) => s.posts);
  const { profile } = useSelector((s) => s.auth);
  const { theme, showAds, fontSize } = useSelector((s) => s.ui);
  const colors = COLORS[theme];
  const fonts = FONT_SIZES[fontSize];

  const post = currentPost?.id === postId ? currentPost : initialPost;

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [addingComment, setAddingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [showRICard,   setShowRICard]   = useState(false);   // Rewarded Interstitial
  const [premiumModal, setPremiumModal] = useState(false);   // Premium Unlock Modal
  const [contentUnlocked, setContentUnlocked] = useState(false); // حالة المحتوى المفتوح

  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  useEffect(() => {
    dispatch(fetchPost(postId));
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      const { comments: fetchedComments } = await getPostComments(postId);
      setComments(fetchedComments);
    } catch (error) {
      console.log('Comments error:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Animated header
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [1, 0.85],
    extrapolate: 'clamp',
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const progress = (contentOffset.y / (contentSize.height - layoutMeasurement.height)) * 100;
        if (progress >= 70 && !showRICard && post?.isPremium && !contentUnlocked) {
          setShowRICard(true);
        }
      },
    }
  );

  const handleLike = useCallback(() => {
    if (!profile) { navigation.navigate('Auth'); return; }
    dispatch(toggleLikeAsync({ postId: post.id, userId: profile.uid }));
  }, [profile, post, dispatch, navigation]);

  const handleBookmark = useCallback(async () => {
    if (!profile) { navigation.navigate('Auth'); return; }
    const newState = await toggleBookmark(post.id, profile.uid);
    setIsBookmarked(newState);
  }, [profile, post, navigation]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `اقرأ هذا المقال الرائع: ${post.title}\n\nblogverse://post/${post.id}`,
        title: post.title,
        url: `https://blogverse.app/post/${post.id}`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  }, [post]);

  const handleAddComment = useCallback(async () => {
    if (!profile) { navigation.navigate('Auth'); return; }
    if (!commentText.trim()) return;

    try {
      setAddingComment(true);
      const comment = await addComment(post.id, profile.uid, commentText.trim());
      setComments((prev) => [{ ...comment, userData: profile }, ...prev]);
      setCommentText('');
    } catch (error) {
      Alert.alert('خطأ', 'فشل إضافة التعليق');
    } finally {
      setAddingComment(false);
    }
  }, [profile, post, commentText, navigation]);

  const handleAuthorPress = useCallback(() => {
    navigation.navigate('AuthorProfile', { userId: post.authorId });
  }, [post, navigation]);

  if (!post) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <MaterialCommunityIcons name="loading" size={40} color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>جاري التحميل...</Text>
      </View>
    );
  }

  const isLiked = likedPosts.has(post.id);
  const publishDate = post.publishedAt?.toDate
    ? format(post.publishedAt.toDate(), 'dd MMMM yyyy', { locale: ar })
    : '';

  const markdownStyles = {
    body: {
      color: colors.text,
      fontSize: fonts.base,
      lineHeight: fonts.base * 1.8,
      fontFamily: 'Cairo-Regular',
      textAlign: 'right',
    },
    heading1: { color: colors.text, fontSize: fonts['3xl'], fontWeight: '800', marginVertical: SPACING.base },
    heading2: { color: colors.text, fontSize: fonts['2xl'], fontWeight: '700', marginVertical: SPACING.md },
    heading3: { color: colors.text, fontSize: fonts.xl, fontWeight: '600', marginVertical: SPACING.sm },
    paragraph: { marginBottom: SPACING.base, lineHeight: fonts.base * 1.8 },
    blockquote: {
      backgroundColor: COLORS.primary + '15',
      borderLeftWidth: 4,
      borderLeftColor: COLORS.primary,
      paddingHorizontal: SPACING.base,
      paddingVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.sm,
      marginVertical: SPACING.sm,
    },
    code_block: {
      backgroundColor: colors.inputBg,
      padding: SPACING.base,
      borderRadius: BORDER_RADIUS.md,
      fontFamily: 'FiraCode-Regular',
      fontSize: fonts.sm,
      marginVertical: SPACING.sm,
    },
    image: { width: width - 32, borderRadius: BORDER_RADIUS.lg },
    link: { color: COLORS.primary },
    strong: { fontWeight: '700', color: colors.text },
    em: { fontStyle: 'italic', color: colors.textSecondary },
    bullet_list: { marginBottom: SPACING.sm },
    ordered_list: { marginBottom: SPACING.sm },
    list_item: { marginBottom: SPACING.xs },
    hr: { backgroundColor: colors.divider, height: 1, marginVertical: SPACING.base },
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Reading Progress Bar */}
      <View style={[styles.progressBarContainer, { backgroundColor: colors.divider }]}>
        <Animated.View
          style={[styles.progressBar, { width: `${readProgress}%` }]}
        />
      </View>

      {/* Animated Header Image */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.View style={[styles.headerImage, { opacity: imageOpacity }]}>
          <Image
            source={{ uri: post.coverImage || 'https://picsum.photos/800/400?random=' + post.id }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(15,15,26,0.98)']}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Back Button */}
        <SafeAreaView edges={['top']} style={styles.headerControls}>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-right" size={20} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
              onPress={handleShare}
            >
              <Feather name="share-2" size={18} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
              onPress={handleBookmark}
            >
              <MaterialCommunityIcons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={isBookmarked ? COLORS.primary : '#FFF'}
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Scrollable Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <Animated.ScrollView
          ref={scrollViewRef}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT - 40 }}
        >
          {/* Article Content */}
          <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
            {/* Category & Reading Time */}
            <View style={styles.metaBadges}>
              <View style={[styles.badge, { backgroundColor: COLORS.primary }]}>
                <Text style={styles.badgeText}>{post.category || 'عام'}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.inputBg }]}>
                <MaterialCommunityIcons name="clock-outline" size={12} color={colors.textMuted} />
                <Text style={[styles.badgeText, { color: colors.textMuted }]}>{post.readingTime || 3} دقائق</Text>
              </View>
              {post.isPremium && (
                <View style={[styles.badge, { backgroundColor: COLORS.gold + '20' }]}>
                  <MaterialCommunityIcons name="crown" size={12} color={COLORS.gold} />
                  <Text style={[styles.badgeText, { color: COLORS.gold }]}>مميز</Text>
                </View>
              )}
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: colors.text, fontSize: fonts['3xl'] }]}>
              {post.title}
            </Text>

            {/* Author Card */}
            <TouchableOpacity
              style={[styles.authorCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={handleAuthorPress}
            >
              <Image
                source={{ uri: post.authorPhoto || `https://ui-avatars.com/api/?name=${post.authorName}&background=6C63FF&color=fff&size=80` }}
                style={styles.authorPhoto}
              />
              <View style={styles.authorMeta}>
                <Text style={[styles.authorName, { color: colors.text }]}>{post.authorName || 'كاتب مجهول'}</Text>
                <Text style={[styles.authorBio, { color: colors.textMuted }]}>{post.authorBio || 'كاتب في BlogVerse'}</Text>
                <Text style={[styles.publishDate, { color: colors.textMuted }]}>{publishDate}</Text>
              </View>
              <TouchableOpacity
                style={[styles.followBtn, { backgroundColor: isFollowing ? colors.inputBg : COLORS.primary }]}
                onPress={() => setIsFollowing(!isFollowing)}
              >
                <Text style={[styles.followBtnText, { color: isFollowing ? colors.text : '#FFF' }]}>
                  {isFollowing ? 'متابَع' : 'تابع'}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>

            {/* Article Body */}
            <View style={styles.articleBody}>
              <Markdown style={markdownStyles}>
                {post.content || ''}
              </Markdown>
            </View>

            {/* Tags */}
            {post.tags?.length > 0 && (
              <View style={styles.tagsContainer}>
                {post.tags.map((tag, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.tagChip, { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary + '30' }]}
                    onPress={() => navigation.navigate('Tag', { tag })}
                  >
                    <Text style={[styles.tagChipText, { color: COLORS.primary }]}>#{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* بانر منتصف المقال */}
            {showAds && <MediumRectangleBanner style={{ marginVertical: SPACING.base }} />}

            {/* زر مكافأة — فتح محتوى إضافي */}
            {showAds && !contentUnlocked && (
              <RewardedAdButton
                label="🎁 شاهد إعلاناً لفتح المحتوى الإضافي"
                onReward={() => setContentUnlocked(true)}
                style={{ marginVertical: SPACING.base }}
              />
            )}

            {/* بطاقة Rewarded Interstitial عند 70% قراءة */}
            {showAds && showRICard && (
              <RewardedInterstitialCard
                articleTitle={post.title}
                onReward={() => { setContentUnlocked(true); setShowRICard(false); }}
                style={{ marginBottom: SPACING.base }}
              />
            )}

            {/* Action Bar */}
            <View style={[styles.actionBar, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleLike}>
                <MaterialCommunityIcons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isLiked ? COLORS.secondary : colors.textSecondary}
                />
                <Text style={[styles.actionCount, { color: colors.textSecondary }]}>{post.likes || 0}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={() => setShowComments(!showComments)}>
                <MaterialCommunityIcons name="comment-outline" size={24} color={colors.textSecondary} />
                <Text style={[styles.actionCount, { color: colors.textSecondary }]}>{post.comments || 0}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
                <Feather name="share-2" size={22} color={colors.textSecondary} />
                <Text style={[styles.actionCount, { color: colors.textSecondary }]}>{post.shares || 0}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={handleBookmark}>
                <MaterialCommunityIcons
                  name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={isBookmarked ? COLORS.primary : colors.textSecondary}
                />
              </TouchableOpacity>

              <View style={styles.actionBtn}>
                <MaterialCommunityIcons name="eye-outline" size={22} color={colors.textSecondary} />
                <Text style={[styles.actionCount, { color: colors.textSecondary }]}>{post.views || 0}</Text>
              </View>
            </View>

            {/* COMMENTS SECTION */}
            {showComments && (
              <View style={styles.commentsSection}>
                <Text style={[styles.commentsTitle, { color: colors.text }]}>
                  التعليقات ({post.comments || 0})
                </Text>

                {/* Comment Input */}
                <View style={[styles.commentInput, { backgroundColor: colors.inputBg }]}>
                  <Image
                    source={{ uri: profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName}&background=6C63FF&color=fff` }}
                    style={styles.commentAvatar}
                  />
                  <TextInput
                    style={[styles.commentTextInput, { color: colors.text }]}
                    placeholder="اكتب تعليقاً..."
                    placeholderTextColor={colors.textMuted}
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                    maxLength={500}
                    textAlign="right"
                  />
                  <TouchableOpacity
                    style={[styles.sendBtn, { backgroundColor: commentText.trim() ? COLORS.primary : colors.inputBg }]}
                    onPress={handleAddComment}
                    disabled={addingComment || !commentText.trim()}
                  >
                    <Feather name="send" size={16} color={commentText.trim() ? '#FFF' : colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Comments List */}
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} colors={colors} />
                ))}

                {commentsLoading && (
                  <View style={styles.loadingComments}>
                    <MaterialCommunityIcons name="loading" size={24} color={COLORS.primary} />
                  </View>
                )}
              </View>
            )}

            {/* بانر أسفل المقال + نافذة Premium */}
            {showAds && <UnityBannerAd size="BANNER" style={{ marginBottom: SPACING.base }} />}
            <PremiumUnlockModal
              visible={premiumModal}
              onClose={() => setPremiumModal(false)}
              onUnlock={() => { setContentUnlocked(true); setPremiumModal(false); }}
              contentTitle={post.title}
            />

            <View style={{ height: 100 }} />
          </View>
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const CommentItem = ({ comment, colors }) => (
  <View style={[styles.commentItem, { borderBottomColor: colors.divider }]}>
    <Image
      source={{ uri: comment.userData?.photoURL || `https://ui-avatars.com/api/?name=User&background=6C63FF&color=fff` }}
      style={styles.commentUserAvatar}
    />
    <View style={styles.commentContent}>
      <Text style={[styles.commentUserName, { color: colors.text }]}>
        {comment.userData?.displayName || 'مستخدم'}
      </Text>
      <Text style={[styles.commentText, { color: colors.textSecondary }]}>{comment.text}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.sm },
  loadingText: { fontSize: 14 },
  progressBarContainer: { height: 3, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 },
  progressBar: { height: '100%', backgroundColor: COLORS.primary },
  header: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, overflow: 'hidden' },
  headerImage: { ...StyleSheet.absoluteFillObject },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: { flexDirection: 'row', gap: SPACING.sm },
  contentContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.xl,
    minHeight: height,
  },
  metaBadges: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm, flexWrap: 'wrap' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  title: { fontWeight: '800', lineHeight: 40, textAlign: 'right', marginBottom: SPACING.base },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  authorPhoto: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary + '20' },
  authorMeta: { flex: 1 },
  authorName: { fontSize: 15, fontWeight: '700', textAlign: 'right' },
  authorBio: { fontSize: 12, textAlign: 'right', marginTop: 2 },
  publishDate: { fontSize: 11, textAlign: 'right', marginTop: 2 },
  followBtn: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.full },
  followBtnText: { fontSize: 13, fontWeight: '700' },
  articleBody: { marginBottom: SPACING.xl },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl, justifyContent: 'flex-end' },
  tagChip: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.full, borderWidth: 1 },
  tagChipText: { fontSize: 12, fontWeight: '600' },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.xl,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm },
  actionCount: { fontSize: 13, fontWeight: '600' },
  commentsSection: { marginBottom: SPACING.xl },
  commentsTitle: { fontSize: 18, fontWeight: '800', textAlign: 'right', marginBottom: SPACING.base },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.base,
  },
  commentAvatar: { width: 36, height: 36, borderRadius: 18 },
  commentTextInput: { flex: 1, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  commentItem: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingVertical: SPACING.base,
    borderBottomWidth: 1,
  },
  commentUserAvatar: { width: 36, height: 36, borderRadius: 18 },
  commentContent: { flex: 1 },
  commentUserName: { fontSize: 13, fontWeight: '700', textAlign: 'right' },
  commentText: { fontSize: 14, lineHeight: 20, textAlign: 'right', marginTop: 4 },
  loadingComments: { alignItems: 'center', paddingVertical: SPACING.base },
});

export default PostDetailScreen;
