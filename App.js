// App.js
// ==========================================
// BlogVerse - Main Entry Point
// ==========================================

import React, { useEffect, useCallback } from 'react';
import { I18nManager, LogBox, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import * as Notifications from 'expo-notifications';
import NetInfo from '@react-native-community/netinfo';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { handleNetworkChange } from './src/services/firebase';
import { initUnityAds } from './src/services/unityAdsService';

// Prevent splash from auto-hiding
SplashScreen.preventAutoHideAsync();

// Force RTL for Arabic
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

// Ignore known harmless warnings
LogBox.ignoreLogs([
  'Non-serializable values were found',
  'AsyncStorage has been extracted',
  'ViewPropTypes will be removed',
  'Sending \`onAnimatedValueUpdate\`',
]);

// Notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ==========================================
// TOAST CONFIG
// ==========================================
const toastConfig = {
  success: ({ text1, text2 }) => (
    <Toast
      config={{
        success: (props) => <ToastSuccess {...props} />,
      }}
    />
  ),
};

export default function App() {
  const [appReady, setAppReady] = React.useState(false);

  const prepare = useCallback(async () => {
    try {
      // Load custom fonts
      await Font.loadAsync({
        'Cairo-Regular': require('./assets/fonts/Cairo-Regular.ttf'),
        'Cairo-Medium': require('./assets/fonts/Cairo-Medium.ttf'),
        'Cairo-SemiBold': require('./assets/fonts/Cairo-SemiBold.ttf'),
        'Cairo-Bold': require('./assets/fonts/Cairo-Bold.ttf'),
        'Cairo-ExtraBold': require('./assets/fonts/Cairo-ExtraBold.ttf'),
        'Cairo-Black': require('./assets/fonts/Cairo-Black.ttf'),
        'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
        'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
        'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
        'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
        'FiraCode-Regular': require('./assets/fonts/FiraCode-Regular.ttf'),
      });

      // Register for push notifications
      await registerForPushNotifications();

      // تهيئة Unity Ads مبكراً لتحميل الإعلانات
      await initUnityAds();

      // Network state listener
      NetInfo.addEventListener((state) => {
        handleNetworkChange(state.isConnected);
        if (!state.isConnected) {
          Toast.show({
            type: 'info',
            text1: '📶 لا يوجد اتصال بالإنترنت',
            text2: 'بعض المحتوى قد لا يتوفر',
            visibilityTime: 3000,
          });
        }
      });

    } catch (error) {
      console.warn('App prepare error:', error);
    } finally {
      setAppReady(true);
    }
  }, []);

  useEffect(() => {
    prepare();
  }, [prepare]);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <Provider store={store}>
          <AppNavigator />
          <Toast
            config={{
              success: ({ text1, text2 }) => null,
              error: ({ text1, text2 }) => null,
            }}
            position="top"
            topOffset={60}
          />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// ==========================================
// PUSH NOTIFICATIONS REGISTRATION
// ==========================================
const registerForPushNotifications = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return null;

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'YOUR_EAS_PROJECT_ID',
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'BlogVerse',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6C63FF',
        sound: 'notification-sound',
      });

      await Notifications.setNotificationChannelAsync('comments', {
        name: 'التعليقات الجديدة',
        importance: Notifications.AndroidImportance.HIGH,
        lightColor: '#FF6B6B',
      });

      await Notifications.setNotificationChannelAsync('follows', {
        name: 'المتابعون الجدد',
        importance: Notifications.AndroidImportance.DEFAULT,
        lightColor: '#4ECDC4',
      });
    }

    return token;
  } catch (error) {
    console.log('Push notification registration failed:', error);
    return null;
  }
};
