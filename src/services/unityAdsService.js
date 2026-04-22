// src/services/unityAdsService.js
// ══════════════════════════════════════════════════
//  Unity Ads SDK 4.x — نظام إعلانات متكامل لأقصى أرباح
//  يدعم: Banner | Interstitial | Rewarded | Rewarded Interstitial
//  مع نظام ذكي لتحسين الأرباح وتقليل الاستهلاك
// ══════════════════════════════════════════════════

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ──────────────────────────────────────────────────
// الحزمة الرئيسية — react-native-unity-ads
// ──────────────────────────────────────────────────
let UnityAds = null;
let BannerView = null;

try {
  const module = require('react-native-unity-ads');
  UnityAds  = module.UnityAds;
  BannerView = module.BannerView;
} catch (e) {
  console.warn('[UnityAds] Package not found – running in stub mode');
}

// ──────────────────────────────────────────────────
// Config من app.json
// ──────────────────────────────────────────────────
const cfg = Constants.expoConfig?.extra ?? {};

const GAME_ID = Platform.select({
  android: cfg.unityGameIdAndroid ?? 'YOUR_UNITY_GAME_ID_ANDROID',
  ios:     cfg.unityGameIdIos     ?? 'YOUR_UNITY_GAME_ID_IOS',
});

// ★ في وضع التطوير تستخدم Game ID الاختباري تلقائياً
const IS_TEST = __DEV__ || cfg.unityTestMode === true;
const TEST_GAME_ID_ANDROID = '5139735';
const TEST_GAME_ID_IOS     = '5139732';
const ACTIVE_GAME_ID = IS_TEST
  ? Platform.select({ android: TEST_GAME_ID_ANDROID, ios: TEST_GAME_ID_IOS })
  : GAME_ID;

// ──────────────────────────────────────────────────
// معرّفات Placements
// (تطابق ما أنشأته في Unity Dashboard)
// ──────────────────────────────────────────────────
export const PLACEMENTS = {
  BANNER:               Platform.select({ android: cfg.unityBannerPlacementId              ?? 'Banner_Android',              ios: 'Banner_iOS' }),
  INTERSTITIAL:         Platform.select({ android: cfg.unityInterstitialPlacementId        ?? 'Interstitial_Android',        ios: 'Interstitial_iOS' }),
  REWARDED:             Platform.select({ android: cfg.unityRewardedPlacementId            ?? 'Rewarded_Android',            ios: 'Rewarded_iOS' }),
  REWARDED_INTERSTITIAL:Platform.select({ android: cfg.unityRewardedInterstitialPlacementId ?? 'RewardedInterstitial_Android', ios: 'RewardedInterstitial_iOS' }),
};

// ──────────────────────────────────────────────────
// حالة داخلية
// ──────────────────────────────────────────────────
const state = {
  initialized:      false,
  initializing:     false,
  loaded: {
    [PLACEMENTS.INTERSTITIAL]:          false,
    [PLACEMENTS.REWARDED]:              false,
    [PLACEMENTS.REWARDED_INTERSTITIAL]: false,
  },
  loading: {
    [PLACEMENTS.INTERSTITIAL]:          false,
    [PLACEMENTS.REWARDED]:              false,
    [PLACEMENTS.REWARDED_INTERSTITIAL]: false,
  },
  // عدّاد المشاهدات لكل نوع
  impressions: {
    banner:               0,
    interstitial:         0,
    rewarded:             0,
    rewardedInterstitial: 0,
  },
  // آخر وقت عُرض فيه كل نوع (لمنع الإزعاج)
  lastShown: {
    interstitial:         0,
    rewarded:             0,
    rewardedInterstitial: 0,
  },
  listeners: {},
};

// ──────────────────────────────────────────────────
// ثوابت تحسين الأرباح (Revenue Optimization)
// ──────────────────────────────────────────────────
const REVENUE_CONFIG = {
  // الحد الأدنى بالثواني بين الإعلانات البينية
  interstitialCooldown:         45,
  // الحد الأدنى بالثواني بين الإعلانات المكافأة
  rewardedCooldown:             30,
  // الحد الأدنى بالثواني بين RI
  rewardedInterstitialCooldown: 60,
  // عدد الأحداث قبل عرض إعلان بيني (كل X تنقل)
  interstitialFrequency:        4,
  // عداد التنقلات
  navigationCount:              0,
};

// ──────────────────────────────────────────────────
// التهيئة الرئيسية
// ──────────────────────────────────────────────────
export const initUnityAds = async () => {
  if (state.initialized || state.initializing || !UnityAds) return;
  state.initializing = true;

  return new Promise((resolve) => {
    UnityAds.initialize(
      ACTIVE_GAME_ID,
      IS_TEST,
      false, // enablePerPlacementLoad
      (error) => {
        if (error) {
          console.error('[UnityAds] Init error:', error);
          state.initializing = false;
          resolve(false);
        } else {
          console.log(`[UnityAds] ✅ Initialized (gameId=${ACTIVE_GAME_ID}, test=${IS_TEST})`);
          state.initialized  = true;
          state.initializing = false;
          // تحميل جميع الإعلانات مسبقاً
          preloadAll();
          resolve(true);
        }
      }
    );
  });
};

// ──────────────────────────────────────────────────
// تحميل مسبق لكل أنواع الإعلانات
// ──────────────────────────────────────────────────
const preloadAll = () => {
  loadPlacement(PLACEMENTS.INTERSTITIAL);
  loadPlacement(PLACEMENTS.REWARDED);
  loadPlacement(PLACEMENTS.REWARDED_INTERSTITIAL);
};

const loadPlacement = (placementId) => {
  if (!UnityAds || state.loading[placementId] || state.loaded[placementId]) return;
  state.loading[placementId] = true;

  UnityAds.load(
    placementId,
    (pid) => {
      state.loaded[pid]  = true;
      state.loading[pid] = false;
      console.log(`[UnityAds] ✅ Loaded: ${pid}`);
    },
    (pid, error) => {
      state.loaded[pid]  = false;
      state.loading[pid] = false;
      console.warn(`[UnityAds] ❌ Load failed [${pid}]:`, error);
      // إعادة المحاولة بعد 30 ثانية
      setTimeout(() => loadPlacement(pid), 30_000);
    }
  );
};

// ──────────────────────────────────────────────────
// 1. INTERSTITIAL – إعلان بيني كامل الشاشة
//    الاستخدام المثالي: بين المقالات، عند التنقل
// ──────────────────────────────────────────────────
export const showInterstitial = async (onFinish) => {
  if (!state.initialized) await initUnityAds();

  const now       = Date.now() / 1000;
  const cooldown  = REVENUE_CONFIG.interstitialCooldown;
  const lastShown = state.lastShown.interstitial;

  if (now - lastShown < cooldown) {
    console.log(`[UnityAds] ⏱ Interstitial cooldown (${Math.round(cooldown - (now - lastShown))}s left)`);
    onFinish?.({ skipped: true, reason: 'cooldown' });
    return false;
  }

  if (!state.loaded[PLACEMENTS.INTERSTITIAL]) {
    loadPlacement(PLACEMENTS.INTERSTITIAL);
    onFinish?.({ skipped: true, reason: 'not_loaded' });
    return false;
  }

  return new Promise((resolve) => {
    UnityAds.show(
      PLACEMENTS.INTERSTITIAL,
      (pid, result) => {
        // result: 'completed' | 'skipped' | 'error'
        state.loaded[pid]              = false;
        state.lastShown.interstitial   = Date.now() / 1000;
        state.impressions.interstitial += 1;
        // تحميل الإعلان التالي فوراً
        loadPlacement(pid);
        const payload = { type: 'interstitial', result, pid };
        onFinish?.(payload);
        resolve(result === 'completed');
      },
      (pid, error) => {
        console.warn('[UnityAds] Interstitial show error:', error);
        loadPlacement(pid);
        onFinish?.({ skipped: true, reason: 'error', error });
        resolve(false);
      }
    );
  });
};

// ──────────────────────────────────────────────────
// تشغيل إعلان بيني ذكي عند التنقل بين الصفحات
// يُعرض تلقائياً كل X تنقلات
// ──────────────────────────────────────────────────
export const trackNavigationAndShowAd = async (onFinish) => {
  REVENUE_CONFIG.navigationCount += 1;
  if (REVENUE_CONFIG.navigationCount % REVENUE_CONFIG.interstitialFrequency === 0) {
    return showInterstitial(onFinish);
  }
  return false;
};

// ──────────────────────────────────────────────────
// 2. REWARDED VIDEO – إعلان مكافأة
//    الاستخدام المثالي: فتح محتوى مميز، إزالة قيود
// ──────────────────────────────────────────────────
export const showRewarded = async (onReward, onSkip) => {
  if (!state.initialized) await initUnityAds();

  if (!state.loaded[PLACEMENTS.REWARDED]) {
    loadPlacement(PLACEMENTS.REWARDED);
    onSkip?.({ reason: 'not_loaded' });
    return false;
  }

  return new Promise((resolve) => {
    UnityAds.show(
      PLACEMENTS.REWARDED,
      (pid, result) => {
        state.loaded[pid]           = false;
        state.lastShown.rewarded    = Date.now() / 1000;
        state.impressions.rewarded += 1;
        loadPlacement(pid);

        if (result === 'completed') {
          onReward?.({ type: 'rewarded', pid, earned: true });
          resolve({ earned: true });
        } else {
          onSkip?.({ type: 'rewarded', pid, result });
          resolve({ earned: false, result });
        }
      },
      (pid, error) => {
        console.warn('[UnityAds] Rewarded show error:', error);
        loadPlacement(pid);
        onSkip?.({ reason: 'error', error });
        resolve({ earned: false, error });
      }
    );
  });
};

// ──────────────────────────────────────────────────
// 3. REWARDED INTERSTITIAL – مكافأة بينية (أعلى CPM)
//    يجمع بين CPM الإعلان البيني وتفاعل المكافأة
//    الاستخدام: نهاية قراءة مقال، فتح سلسلة مقالات
// ──────────────────────────────────────────────────
export const showRewardedInterstitial = async (onReward, onSkip) => {
  if (!state.initialized) await initUnityAds();

  const pid = PLACEMENTS.REWARDED_INTERSTITIAL;
  if (!state.loaded[pid]) {
    loadPlacement(pid);
    onSkip?.({ reason: 'not_loaded' });
    return false;
  }

  return new Promise((resolve) => {
    UnityAds.show(
      pid,
      (p, result) => {
        state.loaded[p]                      = false;
        state.lastShown.rewardedInterstitial  = Date.now() / 1000;
        state.impressions.rewardedInterstitial += 1;
        loadPlacement(p);

        if (result === 'completed') {
          onReward?.({ type: 'rewarded_interstitial', earned: true });
          resolve({ earned: true });
        } else {
          onSkip?.({ result });
          resolve({ earned: false, result });
        }
      },
      (p, error) => {
        loadPlacement(p);
        onSkip?.({ reason: 'error' });
        resolve({ earned: false });
      }
    );
  });
};

// ──────────────────────────────────────────────────
// حالة التحميل العامة (للواجهة)
// ──────────────────────────────────────────────────
export const getAdStatus = () => ({
  initialized:           state.initialized,
  interstitialReady:     state.loaded[PLACEMENTS.INTERSTITIAL],
  rewardedReady:         state.loaded[PLACEMENTS.REWARDED],
  rewardedInterstitialReady: state.loaded[PLACEMENTS.REWARDED_INTERSTITIAL],
  impressions:           { ...state.impressions },
});

export const isRewardedReady   = () => state.loaded[PLACEMENTS.REWARDED];
export const isInterstitialReady = () => state.loaded[PLACEMENTS.INTERSTITIAL];

// BannerView يُصدَّر لاستخدامه كمكوّن JSX
export { BannerView as UnityBannerView };
export default { initUnityAds, showInterstitial, showRewarded, showRewardedInterstitial, PLACEMENTS, getAdStatus };
