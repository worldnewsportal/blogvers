// src/navigation/AppNavigator.js
// ==========================================
// Main App Navigation
// ==========================================

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Screens
import HomeScreen from '../screens/HomeScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SearchScreen from '../screens/SearchScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import CategoryScreen from '../screens/CategoryScreen';
import AuthorProfileScreen from '../screens/AuthorProfileScreen';
import EditPostScreen from '../screens/EditPostScreen';
import PrivacyPolicyScreen from '../screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from '../screens/TermsOfServiceScreen';
import AboutScreen from '../screens/AboutScreen';
import TrendingScreen from '../screens/TrendingScreen';

import { COLORS, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { subscribeToAuthState } from '../services/authService';
import { setUser, setProfile, setInitialized } from '../store/slices/authSlice';
import { getUserProfile } from '../services/authService';
import { setDefaultCategories } from '../store/slices/categoriesSlice';
import { fetchCategories } from '../store/slices/categoriesSlice';
import { initUnityAds } from '../services/unityAdsService';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// ==========================================
// BOTTOM TAB NAVIGATOR
// ==========================================
const TabNavigator = () => {
  const { theme } = useSelector((s) => s.ui);
  const { unreadCount } = useSelector((s) => s.notifications);
  const colors = COLORS[theme];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === 'ios' ? 85 : 65,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Home: focused ? 'home' : 'home-outline',
            Search: focused ? 'magnify' : 'magnify',
            Create: 'plus-circle',
            Bookmarks: focused ? 'bookmark' : 'bookmark-outline',
            Profile: focused ? 'account' : 'account-outline',
          };
          return (
            <View style={route.name === 'Create' ? styles.createBtnWrapper : null}>
              {route.name === 'Create' ? (
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.createBtn}
                >
                  <MaterialCommunityIcons name="pencil-plus" size={26} color="#FFF" />
                </LinearGradient>
              ) : (
                <MaterialCommunityIcons name={icons[route.name]} size={size} color={color} />
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'الرئيسية' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarLabel: 'البحث' }} />
      <Tab.Screen name="Create" component={CreatePostScreen} options={{ tabBarLabel: 'اكتب' }} />
      <Tab.Screen
        name="Bookmarks"
        component={BookmarksScreen}
        options={{ tabBarLabel: 'المحفوظات' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'حسابي',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
    </Tab.Navigator>
  );
};

// ==========================================
// DRAWER NAVIGATOR
// ==========================================
const DrawerNavigator = () => {
  const { theme } = useSelector((s) => s.ui);
  const colors = COLORS[theme];

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: colors.surface,
          width: 280,
        },
        drawerActiveTintColor: COLORS.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: '600',
        },
      }}
      drawerContent={(props) => <CustomDrawer {...props} colors={colors} />}
    >
      <Drawer.Screen name="MainTabs" component={TabNavigator} options={{ title: 'الرئيسية', drawerIcon: ({ color }) => <MaterialCommunityIcons name="home" size={22} color={color} /> }} />
      <Drawer.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'الإشعارات', drawerIcon: ({ color }) => <MaterialCommunityIcons name="bell" size={22} color={color} /> }} />
      <Drawer.Screen name="Trending" component={TrendingScreen} options={{ title: 'الأكثر رواجاً', drawerIcon: ({ color }) => <MaterialCommunityIcons name="fire" size={22} color={color} /> }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'الإعدادات', drawerIcon: ({ color }) => <MaterialCommunityIcons name="cog" size={22} color={color} /> }} />
      <Drawer.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'سياسة الخصوصية', drawerIcon: ({ color }) => <MaterialCommunityIcons name="shield" size={22} color={color} /> }} />
      <Drawer.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ title: 'شروط الخدمة', drawerIcon: ({ color }) => <MaterialCommunityIcons name="file-document" size={22} color={color} /> }} />
      <Drawer.Screen name="About" component={AboutScreen} options={{ title: 'عن التطبيق', drawerIcon: ({ color }) => <MaterialCommunityIcons name="information" size={22} color={color} /> }} />
    </Drawer.Navigator>
  );
};

// ==========================================
// CUSTOM DRAWER CONTENT
// ==========================================
const CustomDrawer = ({ navigation, state, colors }) => {
  const { profile } = useSelector((s) => s.auth);

  return (
    <View style={{ flex: 1, paddingTop: 50 }}>
      {/* Header */}
      <TouchableOpacity
        onPress={() => {
          navigation.closeDrawer();
          navigation.navigate('Profile');
        }}
        style={[styles.drawerHeader, { borderBottomColor: colors.divider }]}
      >
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.drawerAvatar}>
          <Text style={styles.drawerAvatarText}>
            {profile?.displayName?.charAt(0) || 'B'}
          </Text>
        </LinearGradient>
        <View>
          <Text style={[styles.drawerName, { color: colors.text }]}>
            {profile?.displayName || 'BlogVerse'}
          </Text>
          <Text style={[styles.drawerEmail, { color: colors.textMuted }]}>
            {profile?.email || 'القارئ الكريم'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Stats */}
      {profile && (
        <View style={[styles.drawerStats, { borderBottomColor: colors.divider }]}>
          <View style={styles.drawerStat}>
            <Text style={[styles.drawerStatNum, { color: COLORS.primary }]}>{profile.postsCount || 0}</Text>
            <Text style={[styles.drawerStatLabel, { color: colors.textMuted }]}>مقال</Text>
          </View>
          <View style={styles.drawerStat}>
            <Text style={[styles.drawerStatNum, { color: COLORS.primary }]}>{profile.followersCount || 0}</Text>
            <Text style={[styles.drawerStatLabel, { color: colors.textMuted }]}>متابع</Text>
          </View>
          <View style={styles.drawerStat}>
            <Text style={[styles.drawerStatNum, { color: COLORS.primary }]}>{profile.followingCount || 0}</Text>
            <Text style={[styles.drawerStatLabel, { color: colors.textMuted }]}>متابَع</Text>
          </View>
        </View>
      )}

      {/* Menu Items */}
      <View style={{ flex: 1, paddingTop: 8 }}>
        {[
          { name: 'MainTabs', icon: 'home', label: 'الرئيسية' },
          { name: 'Notifications', icon: 'bell', label: 'الإشعارات' },
          { name: 'Trending', icon: 'fire', label: 'الأكثر رواجاً' },
          { name: 'Settings', icon: 'cog', label: 'الإعدادات' },
        ].map((item) => (
          <TouchableOpacity
            key={item.name}
            style={styles.drawerItem}
            onPress={() => {
              navigation.closeDrawer();
              navigation.navigate(item.name);
            }}
          >
            <MaterialCommunityIcons name={item.icon} size={22} color={colors.textSecondary} />
            <Text style={[styles.drawerItemText, { color: colors.text }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Links */}
      <View style={[styles.drawerBottom, { borderTopColor: colors.divider }]}>
        {[
          { name: 'PrivacyPolicy', label: 'سياسة الخصوصية' },
          { name: 'TermsOfService', label: 'شروط الخدمة' },
          { name: 'About', label: 'عن التطبيق' },
        ].map((item) => (
          <TouchableOpacity
            key={item.name}
            onPress={() => { navigation.closeDrawer(); navigation.navigate(item.name); }}
          >
            <Text style={[styles.drawerBottomLink, { color: colors.textMuted }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
        <Text style={[styles.drawerVersion, { color: colors.textMuted }]}>BlogVerse v1.0.0</Text>
      </View>
    </View>
  );
};

// ==========================================
// MAIN APP NAVIGATOR
// ==========================================
const AppNavigator = () => {
  const dispatch = useDispatch();
  const { user, isInitialized } = useSelector((s) => s.auth);
  const { theme, isOnboarded } = useSelector((s) => s.ui);

  const navTheme = theme === 'dark' ? {
    ...DarkTheme,
    colors: { ...DarkTheme.colors, background: COLORS.dark.background, card: COLORS.dark.surface },
  } : {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: COLORS.light.background, card: COLORS.light.surface },
  };

  useEffect(() => {
    // Set default categories
    dispatch(setDefaultCategories());
    dispatch(fetchCategories());

    // تهيئة Unity Ads (تحميل كل أنواع الإعلانات مسبقاً)
    initUnityAds();

    // Auth listener
    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      if (firebaseUser) {
        dispatch(setUser(firebaseUser.toJSON()));
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          dispatch(setProfile(profile));
        } catch (e) {
          console.log('Profile fetch error:', e);
        }
      } else {
        dispatch(setUser(null));
      }
      dispatch(setInitialized());
    });

    return () => unsubscribe();
  }, []);

  if (!isInitialized) {
    return null; // Splash screen handles this
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!isOnboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !user ? (
          <Stack.Screen name="Auth" component={AuthScreen} options={{ animation: 'fade' }} />
        ) : (
          <>
            <Stack.Screen name="Main" component={DrawerNavigator} />
            <Stack.Screen
              name="PostDetail"
              component={PostDetailScreen}
              options={{ animation: 'slide_from_bottom', gestureEnabled: true }}
            />
            <Stack.Screen name="CreatePost" component={CreatePostScreen} />
            <Stack.Screen name="EditPost" component={EditPostScreen} />
            <Stack.Screen name="AuthorProfile" component={AuthorProfileScreen} />
            <Stack.Screen name="Category" component={CategoryScreen} />
            <Stack.Screen name="Tag" component={CategoryScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="Trending" component={TrendingScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  createBtnWrapper: { marginBottom: 8 },
  createBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.lg,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  drawerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerAvatarText: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  drawerName: { fontSize: 16, fontWeight: '800' },
  drawerEmail: { fontSize: 12 },
  drawerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  drawerStat: { alignItems: 'center' },
  drawerStatNum: { fontSize: 18, fontWeight: '800' },
  drawerStatLabel: { fontSize: 11 },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 13,
  },
  drawerItemText: { fontSize: 15, fontWeight: '600' },
  drawerBottom: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  drawerBottomLink: { fontSize: 13 },
  drawerVersion: { fontSize: 11, marginTop: 4 },
});

export default AppNavigator;
