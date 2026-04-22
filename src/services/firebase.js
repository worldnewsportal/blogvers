// src/services/firebase.js
// ==========================================
// Firebase Configuration & Initialization
// Supports thousands of concurrent users
// ==========================================

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED,
  enableNetwork,
  disableNetwork,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';
import { getFunctions } from 'firebase/functions';
import { getMessaging, isSupported as isMessagingSupported } from 'firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// ==========================================
// Firebase Config from Environment
// ==========================================
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || process.env.FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || process.env.FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.firebaseAppId || process.env.FIREBASE_APP_ID,
  measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId,
};

// ==========================================
// Initialize Firebase (Singleton Pattern)
// ==========================================
let app;
let auth;
let db;
let storage;
let analytics = null;
let performance = null;
let functions;
let messaging = null;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Auth with AsyncStorage persistence
auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore with offline support + unlimited cache
db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  }),
});

// Storage
storage = getStorage(app);

// Functions (Cloud Functions)
functions = getFunctions(app, 'us-central1');

// Analytics (async check)
(async () => {
  try {
    if (await isSupported()) {
      analytics = getAnalytics(app);
    }
  } catch (e) {
    console.log('Analytics not supported:', e);
  }
})();

// Performance Monitoring
try {
  performance = getPerformance(app);
} catch (e) {
  console.log('Performance not supported:', e);
}

// Cloud Messaging
(async () => {
  try {
    if (await isMessagingSupported()) {
      messaging = getMessaging(app);
    }
  } catch (e) {
    console.log('Messaging not supported:', e);
  }
})();

// ==========================================
// Network State Handler
// ==========================================
export const handleNetworkChange = async (isConnected) => {
  try {
    if (isConnected) {
      await enableNetwork(db);
    } else {
      await disableNetwork(db);
    }
  } catch (error) {
    console.error('Network change error:', error);
  }
};

export { app, auth, db, storage, analytics, performance, functions, messaging };

// ==========================================
// Firestore Collections Constants
// ==========================================
export const COLLECTIONS = {
  USERS: 'users',
  POSTS: 'posts',
  COMMENTS: 'comments',
  CATEGORIES: 'categories',
  TAGS: 'tags',
  LIKES: 'likes',
  BOOKMARKS: 'bookmarks',
  FOLLOWS: 'follows',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports',
  ANALYTICS: 'analytics',
  NEWSLETTERS: 'newsletters',
  SERIES: 'series',
  DRAFTS: 'drafts',
};

export default app;
