// src/components/UnityAdsComponents.js
// ══════════════════════════════════════════════════
//  مكوّنات Unity Ads — كل الأنواع جاهزة للاستخدام
//  Banner | Interstitial | Rewarded | RewardedInterstitial
// ══════════════════════════════════════════════════

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
  Animated, Modal, Dimensions, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import {
  UnityBannerView,
  PLACEMENTS,
  showInterstitial,
  showRewarded,
  showRewardedInterstitial,
  isRewardedReady,
  initUnityAds,
} from '../services/unityAdsService';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');

// ══════════════════════════════════════════════════
// 1. BANNER AD ─ شريط إعلاني
//    يُستخدم في: الصفحة الرئيسية، نهاية المقالات
// ══════════════════════════════════════════════════
export const UnityBannerAd = ({
  placementId = PLACEMENTS.BANNER,
  size = 'BANNER',          // BANNER | LARGE_BANNER | MEDIUM_RECTANGLE
  style,
  showLabel = true,
}) => {
  const { showAds, theme } = useSelector((s) => s.ui);
  const colors = COLORS[theme];
  const [loaded, setLoaded]   = useState(false);
  const [failed, setFailed]   = useState(false);
  const fadeAnim              = useRef(new Animated.Value(0)).current;

  const onLoad = useCallback(() => {
    setLoaded(true);
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const onError = useCallback((err) => {
    console.warn('[UnityBanner] Error:', err);
    setFailed(true);
  }, []);

  if (!showAds || failed || !UnityBannerView) return null;

  const bannerHeight = { BANNER: 50, LARGE_BANNER: 100, MEDIUM_RECTANGLE: 250 }[size] ?? 50;

  return (
    <Animated.View style={[styles.bannerWrap, { opacity: fadeAnim }, style]}>
      {showLabel && (
        <Text style={[styles.adLabel, { color: colors.textMuted }]}>إعلان</Text>
      )}
      <View style={[styles.bannerContainer, { height: bannerHeight, backgroundColor: colors.inputBg }]}>
        <UnityBannerView
          placementId={placementId}
          size={size}
          onLoad={onLoad}
          onError={onError}
          style={{ width: '100%', height: bannerHeight }}
        />
        {!loaded && (
          <View style={styles.bannerSkeleton}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// ══════════════════════════════════════════════════
// 2. INTERSTITIAL TRIGGER ─ زر/لحظة تُطلق الإعلان البيني
// ══════════════════════════════════════════════════
export const useInterstitialAd = () => {
  const { showAds } = useSelector((s) => s.ui);
  const show = useCallback(async (onFinish) => {
    if (!showAds) return false;
    return showInterstitial(onFinish);
  }, [showAds]);
  return { show };
};

// ══════════════════════════════════════════════════
// 3. REWARDED AD BUTTON ─ زر "شاهد إعلاناً للمكافأة"
//    الاستخدام: فتح مقالات مميزة، إزالة قيود القراءة
// ══════════════════════════════════════════════════
export const RewardedAdButton = ({
  onReward,
  label    = 'شاهد إعلاناً للحصول على المكافأة 🎁',
  rewardLabel = 'تمت المكافأة بنجاح! ✅',
  style,
  variant  = 'primary',   // primary | outline | small
}) => {
  const { showAds, theme } = useSelector((s) => s.ui);
  const colors = COLORS[theme];
  const [loading,    setLoading]    = useState(false);
  const [rewarded,   setRewarded]   = useState(false);
  const [ready,      setReady]      = useState(false);
  const pulseAnim                   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const check = setInterval(() => setReady(isRewardedReady()), 2000);
    setReady(isRewardedReady());
    return () => clearInterval(check);
  }, []);

  // نبضة انتباه كل 5 ثواني
  useEffect(() => {
    if (!ready) return;
    const pulse = () =>
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 180, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 180, useNativeDriver: true }),
      ]).start();
    const id = setInterval(pulse, 5000);
    return () => clearInterval(id);
  }, [ready, pulseAnim]);

  if (!showAds) return null;

  const handlePress = async () => {
    if (loading || rewarded) return;
    setLoading(true);
    const result = await showRewarded(
      () => { setRewarded(true); onReward?.(); },
      () => {}
    );
    setLoading(false);
  };

  if (rewarded) {
    return (
      <View style={[styles.rewardedDone, { backgroundColor: COLORS.dark.success + '20', borderColor: COLORS.dark.success + '40' }]}>
        <MaterialCommunityIcons name="check-circle" size={20} color={COLORS.dark.success} />
        <Text style={[styles.rewardedDoneText, { color: COLORS.dark.success }]}>{rewardLabel}</Text>
      </View>
    );
  }

  if (variant === 'small') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={loading || !ready}
        style={[styles.smallRewardBtn, { backgroundColor: colors.inputBg, borderColor: COLORS.gold + '50' }, style]}
      >
        {loading
          ? <ActivityIndicator size="small" color={COLORS.gold} />
          : <MaterialCommunityIcons name="gift-outline" size={18} color={COLORS.gold} />
        }
        <Text style={[styles.smallRewardText, { color: COLORS.gold }]}>
          {ready ? 'إعلان مكافأة' : 'جاري التحميل...'}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={[{ transform: [{ scale: pulseAnim }] }, style]}>
      <TouchableOpacity onPress={handlePress} disabled={loading || !ready} activeOpacity={0.88}>
        <LinearGradient
          colors={ready ? [COLORS.gold, '#FF9500'] : [colors.textMuted, colors.textMuted]}
          style={styles.rewardedBtn}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        >
          {loading
            ? <ActivityIndicator size="small" color="#FFF" />
            : <MaterialCommunityIcons name={ready ? 'play-circle-outline' : 'loading'} size={22} color="#FFF" />
          }
          <Text style={styles.rewardedBtnText}>{ready ? label : 'جاري تحميل الإعلان...'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ══════════════════════════════════════════════════
// 4. REWARDED INTERSTITIAL CARD ─ أعلى CPM
//    يظهر في نهاية المقال كعرض للاستمرار
// ══════════════════════════════════════════════════
export const RewardedInterstitialCard = ({ onReward, articleTitle, style }) => {
  const { showAds, theme } = useSelector((s) => s.ui);
  const colors = COLORS[theme];
  const [dismissed, setDismissed] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const slideAnim                 = useRef(new Animated.Value(60)).current;
  const opacityAnim               = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim,  { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(opacityAnim,{ toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  if (!showAds || dismissed) return null;

  const handleWatch = async () => {
    setLoading(true);
    await showRewardedInterstitial(
      () => { onReward?.(); setDismissed(true); },
      () => setLoading(false)
    );
    setLoading(false);
  };

  return (
    <Animated.View
      style={[
        styles.riCard,
        { backgroundColor: colors.card, borderColor: COLORS.primary + '40', transform: [{ translateY: slideAnim }], opacity: opacityAnim },
        style,
      ]}
    >
      {/* زر الإغلاق */}
      <TouchableOpacity style={styles.riClose} onPress={() => setDismissed(true)}>
        <MaterialCommunityIcons name="close" size={16} color={colors.textMuted} />
      </TouchableOpacity>

      <LinearGradient colors={[COLORS.primary + '15', COLORS.primary + '05']} style={styles.riGradient}>
        {/* أيقونة */}
        <View style={[styles.riIconWrap, { backgroundColor: COLORS.primary + '20' }]}>
          <MaterialCommunityIcons name="star-circle" size={32} color={COLORS.primary} />
        </View>

        {/* النص */}
        <Text style={[styles.riTitle, { color: colors.text }]}>
          استمر في القراءة مجاناً 📖
        </Text>
        <Text style={[styles.riSubtitle, { color: colors.textSecondary }]}>
          شاهد إعلاناً قصيراً (30 ثانية) وأنت تقرأ{'\n'}بقية هذا المقال بدون أي قيود
        </Text>

        {/* الإحصائيات */}
        <View style={styles.riStats}>
          {[
            { icon: 'clock-outline',    label: '30 ثانية فقط' },
            { icon: 'lock-open-outline', label: 'وصول كامل'   },
            { icon: 'gift-outline',      label: 'مجاناً تماماً' },
          ].map((s) => (
            <View key={s.icon} style={styles.riStat}>
              <MaterialCommunityIcons name={s.icon} size={14} color={COLORS.primary} />
              <Text style={[styles.riStatText, { color: colors.textSecondary }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* أزرار */}
        <View style={styles.riActions}>
          <TouchableOpacity
            style={[styles.riSkip, { borderColor: colors.divider }]}
            onPress={() => setDismissed(true)}
          >
            <Text style={[styles.riSkipText, { color: colors.textMuted }]}>لاحقاً</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleWatch} disabled={loading} style={{ flex: 1 }}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.riWatchBtn}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              {loading
                ? <ActivityIndicator size="small" color="#FFF" />
                : <MaterialCommunityIcons name="play-circle" size={18} color="#FFF" />
              }
              <Text style={styles.riWatchText}>شاهد الإعلان</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Text style={[styles.riDisclosure, { color: colors.textMuted }]}>
          🔒 إعلان Unity Ads · خصوصيتك محمية
        </Text>
      </LinearGradient>
    </Animated.View>
  );
};

// ══════════════════════════════════════════════════
// 5. IN-FEED AD CARD ─ بطاقة إعلانية داخل القائمة
//    تقليد بطاقة مقال لدمج الإعلان بالمحتوى
// ══════════════════════════════════════════════════
export const InFeedAdCard = ({ onPress, style }) => {
  const { showAds, theme } = useSelector((s) => s.ui);
  const colors = COLORS[theme];

  if (!showAds) return null;

  const handlePress = async () => {
    await showRewarded(
      () => onPress?.({ rewarded: true }),
      () => onPress?.({ rewarded: false })
    );
  };

  return (
    <TouchableOpacity
      style={[styles.feedAdCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }, style]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[COLORS.primary + '08', COLORS.secondary + '08']}
        style={styles.feedAdGradient}
      >
        <View style={styles.feedAdHeader}>
          <View style={[styles.adPill, { backgroundColor: COLORS.primary + '20' }]}>
            <MaterialCommunityIcons name="bullhorn-outline" size={10} color={COLORS.primary} />
            <Text style={[styles.adPillText, { color: COLORS.primary }]}>إعلان ممول</Text>
          </View>
          <MaterialCommunityIcons name="play-circle-outline" size={28} color={COLORS.primary} />
        </View>

        <Text style={[styles.feedAdTitle, { color: colors.text }]}>
          🎁 اكسب مكافأة إضافية
        </Text>
        <Text style={[styles.feedAdSub, { color: colors.textSecondary }]}>
          شاهد فيديو قصير واحصل على محتوى مميز مجاناً
        </Text>

        <View style={styles.feedAdFooter}>
          <View style={[styles.feedAdBtn, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.feedAdBtnText}>شاهد الآن</Text>
          </View>
          <View style={styles.feedAdTime}>
            <MaterialCommunityIcons name="timer-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.feedAdTimeText, { color: colors.textMuted }]}>30 ث</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ══════════════════════════════════════════════════
// 6. MEDIUM RECTANGLE BANNER ─ بانر مربع (أعلى CTR)
// ══════════════════════════════════════════════════
export const MediumRectangleBanner = ({ style }) => (
  <UnityBannerAd size="MEDIUM_RECTANGLE" style={style} />
);

// ══════════════════════════════════════════════════
// 7. LARGE BANNER ─ بانر كبير
// ══════════════════════════════════════════════════
export const LargeBannerAd = ({ style }) => (
  <UnityBannerAd size="LARGE_BANNER" style={style} />
);

// ══════════════════════════════════════════════════
// 8. PREMIUM UNLOCK MODAL ─ نافذة فتح محتوى مميز
// ══════════════════════════════════════════════════
export const PremiumUnlockModal = ({ visible, onClose, onUnlock, contentTitle }) => {
  const { theme } = useSelector((s) => s.ui);
  const colors = COLORS[theme];
  const [loading, setLoading] = useState(false);

  const handleWatch = async () => {
    setLoading(true);
    await showRewarded(
      () => { onUnlock?.(); onClose?.(); },
      () => setLoading(false)
    );
    setLoading(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
          <MaterialCommunityIcons name="crown" size={48} color={COLORS.gold} style={{ alignSelf: 'center' }} />
          <Text style={[styles.modalTitle, { color: colors.text }]}>محتوى مميز 👑</Text>
          <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
            "{contentTitle}" محتوى مميز. اختر طريقة الوصول:
          </Text>

          <TouchableOpacity onPress={handleWatch} disabled={loading} style={{ marginTop: SPACING.base }}>
            <LinearGradient colors={[COLORS.gold, '#FF9500']} style={styles.modalWatchBtn}>
              {loading
                ? <ActivityIndicator color="#FFF" size="small" />
                : <MaterialCommunityIcons name="play-circle" size={20} color="#FFF" />
              }
              <Text style={styles.modalWatchText}>شاهد إعلاناً (مجاناً)</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modalClose, { borderColor: colors.divider }]}
            onPress={onClose}
          >
            <Text style={[styles.modalCloseText, { color: colors.textMuted }]}>إغلاق</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ══════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════
const styles = StyleSheet.create({
  // Banner
  bannerWrap: { alignItems: 'center', marginVertical: SPACING.sm },
  adLabel: { fontSize: 9, letterSpacing: 1, marginBottom: 2 },
  bannerContainer: { alignItems: 'center', justifyContent: 'center', borderRadius: BORDER_RADIUS.sm, overflow: 'hidden' },
  bannerSkeleton: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },

  // Rewarded Button
  rewardedBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.base, paddingHorizontal: SPACING.xl, borderRadius: BORDER_RADIUS.xl, ...SHADOWS.lg },
  rewardedBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  rewardedDone: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, padding: SPACING.base, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, justifyContent: 'center' },
  rewardedDoneText: { fontSize: 14, fontWeight: '700' },
  smallRewardBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.sm, paddingVertical: 6, borderRadius: BORDER_RADIUS.lg, borderWidth: 1 },
  smallRewardText: { fontSize: 12, fontWeight: '700' },

  // Rewarded Interstitial Card
  riCard: { marginHorizontal: SPACING.base, marginVertical: SPACING.base, borderRadius: BORDER_RADIUS['2xl'], borderWidth: 1.5, overflow: 'hidden', ...SHADOWS.xl },
  riClose: { position: 'absolute', top: SPACING.sm, left: SPACING.sm, zIndex: 10, padding: 4 },
  riGradient: { padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm },
  riIconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xs },
  riTitle: { fontSize: 20, fontWeight: '900', textAlign: 'center' },
  riSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  riStats: { flexDirection: 'row', gap: SPACING.base, marginVertical: SPACING.sm },
  riStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  riStatText: { fontSize: 12, fontWeight: '600' },
  riActions: { flexDirection: 'row', gap: SPACING.sm, width: '100%', marginTop: SPACING.sm },
  riSkip: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm + 2, borderRadius: BORDER_RADIUS.xl, borderWidth: 1.5, justifyContent: 'center' },
  riSkipText: { fontSize: 14, fontWeight: '600' },
  riWatchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm + 2, borderRadius: BORDER_RADIUS.xl },
  riWatchText: { color: '#FFF', fontSize: 15, fontWeight: '800' },
  riDisclosure: { fontSize: 10, marginTop: SPACING.xs },

  // In-Feed Ad Card
  feedAdCard: { marginHorizontal: SPACING.base, marginBottom: SPACING.sm, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, overflow: 'hidden' },
  feedAdGradient: { padding: SPACING.base },
  feedAdHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  adPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: BORDER_RADIUS.full },
  adPillText: { fontSize: 10, fontWeight: '700' },
  feedAdTitle: { fontSize: 16, fontWeight: '800', textAlign: 'right', marginBottom: 4 },
  feedAdSub: { fontSize: 13, textAlign: 'right', lineHeight: 20, marginBottom: SPACING.sm },
  feedAdFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  feedAdBtn: { paddingHorizontal: SPACING.base, paddingVertical: 7, borderRadius: BORDER_RADIUS.full },
  feedAdBtnText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  feedAdTime: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  feedAdTimeText: { fontSize: 11 },

  // Premium Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  modalCard: { width: '100%', borderRadius: BORDER_RADIUS['2xl'], padding: SPACING.xl, gap: SPACING.sm, ...SHADOWS.xl },
  modalTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  modalSub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  modalWatchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm, paddingVertical: SPACING.base, borderRadius: BORDER_RADIUS.xl },
  modalWatchText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  modalClose: { paddingVertical: SPACING.sm, alignItems: 'center', marginTop: SPACING.xs, borderTopWidth: 1 },
  modalCloseText: { fontSize: 14 },
});
