// src/components/AdBanner.js
// ==========================================
// AdMob Banner Ad Component
// Fully integrated with fallback
// ==========================================

import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds, InterstitialAd, RewardedAd, AdEventType, RewardedAdEventType } from 'expo-ads-admob';
import Constants from 'expo-constants';
import { COLORS, SPACING } from '../constants/theme';

const isTestMode = __DEV__;

// Ad Unit IDs
const AD_UNITS = {
  banner: {
    android: isTestMode
      ? TestIds.BANNER
      : Constants.expoConfig?.extra?.admobAndroidBannerId,
    ios: isTestMode
      ? TestIds.BANNER
      : Constants.expoConfig?.extra?.admobIosBannerId,
  },
  interstitial: {
    android: isTestMode
      ? TestIds.INTERSTITIAL
      : Constants.expoConfig?.extra?.admobAndroidInterstitialId,
    ios: isTestMode
      ? TestIds.INTERSTITIAL
      : Constants.expoConfig?.extra?.admobIosInterstitialId,
  },
  rewarded: {
    android: isTestMode
      ? TestIds.REWARDED
      : Constants.expoConfig?.extra?.admobAndroidRewardedId,
    ios: isTestMode
      ? TestIds.REWARDED
      : Constants.expoConfig?.extra?.admobIosRewardedId,
  },
};

const getAdUnitId = (type) => {
  return Platform.select({
    android: AD_UNITS[type].android,
    ios: AD_UNITS[type].ios,
  });
};

// ==========================================
// BANNER AD
// ==========================================
export const AdBannerComponent = ({ size = 'BANNER', style }) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adFailed, setAdFailed] = useState(false);

  if (adFailed) return null;

  const adSize = {
    BANNER: BannerAdSize.BANNER,
    LARGE_BANNER: BannerAdSize.LARGE_BANNER,
    MEDIUM_RECTANGLE: BannerAdSize.MEDIUM_RECTANGLE,
    FULL_BANNER: BannerAdSize.FULL_BANNER,
    LEADERBOARD: BannerAdSize.LEADERBOARD,
  }[size] || BannerAdSize.BANNER;

  return (
    <View style={[styles.bannerContainer, style]}>
      <BannerAd
        unitId={getAdUnitId('banner')}
        size={adSize}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
          keywords: ['blogging', 'writing', 'technology', 'culture'],
        }}
        onAdLoaded={() => setAdLoaded(true)}
        onAdFailedToLoad={(error) => {
          console.log('Banner ad failed:', error);
          setAdFailed(true);
        }}
      />
    </View>
  );
};

// ==========================================
// INTERSTITIAL AD HOOK
// ==========================================
let interstitialAd = null;
let isInterstitialLoaded = false;

export const loadInterstitialAd = () => {
  interstitialAd = InterstitialAd.createForAdRequest(getAdUnitId('interstitial'), {
    requestNonPersonalizedAdsOnly: false,
    keywords: ['blogging', 'writing', 'technology'],
  });

  interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
    isInterstitialLoaded = true;
  });

  interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
    isInterstitialLoaded = false;
    loadInterstitialAd(); // Preload next ad
  });

  interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
    console.log('Interstitial error:', error);
    isInterstitialLoaded = false;
    setTimeout(loadInterstitialAd, 5000); // Retry after 5s
  });

  interstitialAd.load();
};

export const showInterstitialAd = async () => {
  try {
    if (isInterstitialLoaded && interstitialAd) {
      await interstitialAd.show();
      return true;
    }
    return false;
  } catch (error) {
    console.log('Failed to show interstitial:', error);
    return false;
  }
};

// ==========================================
// REWARDED AD
// ==========================================
let rewardedAd = null;
let isRewardedLoaded = false;

export const loadRewardedAd = () => {
  rewardedAd = RewardedAd.createForAdRequest(getAdUnitId('rewarded'), {
    requestNonPersonalizedAdsOnly: false,
  });

  rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
    isRewardedLoaded = true;
  });

  rewardedAd.addAdEventListener(AdEventType.ERROR, (error) => {
    console.log('Rewarded ad error:', error);
    isRewardedLoaded = false;
    setTimeout(loadRewardedAd, 5000);
  });

  rewardedAd.load();
};

export const showRewardedAd = () => {
  return new Promise((resolve, reject) => {
    if (!isRewardedLoaded || !rewardedAd) {
      resolve({ rewarded: false });
      return;
    }

    const earnedListener = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        resolve({ rewarded: true, reward });
        earnedListener();
        isRewardedLoaded = false;
        loadRewardedAd();
      }
    );

    const closeListener = rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      resolve({ rewarded: false });
      closeListener();
    });

    rewardedAd.show().catch((err) => {
      reject(err);
    });
  });
};

// ==========================================
// NATIVE AD PLACEHOLDER (for future use)
// ==========================================
export const AdNativeCard = ({ style }) => {
  return (
    <View style={[styles.nativeAdContainer, style]}>
      <AdBannerComponent size="MEDIUM_RECTANGLE" />
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginVertical: SPACING.sm,
  },
  nativeAdContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: SPACING.md,
  },
});

export default AdBannerComponent;
