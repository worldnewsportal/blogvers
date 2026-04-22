// src/screens/SettingsScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { logoutAsync } from '../store/slices/authSlice';
import { setTheme, setFontSize, setShowAds, setLanguage } from '../store/slices/uiSlice';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { profile } = useSelector((s) => s.auth);
  const { theme, fontSize, showAds, language } = useSelector((s) => s.ui);
  const colors = COLORS[theme];

  const [notifLikes, setNotifLikes] = useState(profile?.notifications?.likes ?? true);
  const [notifComments, setNotifComments] = useState(profile?.notifications?.comments ?? true);
  const [notifFollows, setNotifFollows] = useState(profile?.notifications?.follows ?? true);
  const [notifNewsletter, setNotifNewsletter] = useState(profile?.notifications?.newsletter ?? true);

  const handleLogout = () => {
    Alert.alert('تسجيل الخروج', 'هل أنت متأكد من تسجيل الخروج؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'تسجيل الخروج', style: 'destructive', onPress: () => dispatch(logoutAsync()) },
    ]);
  };

  const Section = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: COLORS.primary }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        {children}
      </View>
    </View>
  );

  const Row = ({ icon, label, value, onPress, danger, right }) => (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.divider }]}
      onPress={onPress}
      disabled={!onPress && !right}
    >
      <MaterialCommunityIcons name={icon} size={22} color={danger ? COLORS.dark.error : COLORS.primary} />
      <Text style={[styles.rowLabel, { color: danger ? COLORS.dark.error : colors.text }]}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={[styles.rowValue, { color: colors.textMuted }]}>{value}</Text>}
        {right || (onPress && <MaterialCommunityIcons name="chevron-left" size={20} color={colors.textMuted} />)}
      </View>
    </TouchableOpacity>
  );

  const NotifToggle = ({ label, value, onValueChange }) => (
    <View style={[styles.row, { borderBottomColor: colors.divider }]}>
      <MaterialCommunityIcons name="bell-outline" size={22} color={COLORS.primary} />
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.inputBg, true: COLORS.primary + '70' }}
        thumbColor={value ? COLORS.primary : colors.textMuted}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-right" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>الإعدادات</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        {profile && (
          <TouchableOpacity
            style={[styles.profileCard, { backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('Profile')}
          >
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.avatarGradient}>
              {profile.photoURL
                ? <Image source={{ uri: profile.photoURL }} style={StyleSheet.absoluteFill} />
                : <Text style={styles.avatarLetter}>{profile.displayName?.charAt(0)}</Text>
              }
            </LinearGradient>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>{profile.displayName}</Text>
              <Text style={[styles.profileEmail, { color: colors.textMuted }]}>{profile.email}</Text>
              <View style={styles.profileBadges}>
                {profile.isVerified && (
                  <View style={[styles.verifiedBadge, { backgroundColor: COLORS.primary + '20' }]}>
                    <MaterialCommunityIcons name="check-decagram" size={12} color={COLORS.primary} />
                    <Text style={[styles.verifiedText, { color: COLORS.primary }]}>موثق</Text>
                  </View>
                )}
                {profile.isPremium && (
                  <View style={[styles.premiumBadge, { backgroundColor: COLORS.gold + '20' }]}>
                    <MaterialCommunityIcons name="crown" size={12} color={COLORS.gold} />
                    <Text style={[styles.premiumText, { color: COLORS.gold }]}>Pro</Text>
                  </View>
                )}
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-left" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        {/* Appearance */}
        <Section title="🎨 المظهر">
          <View style={[styles.row, { borderBottomColor: colors.divider }]}>
            <MaterialCommunityIcons name="theme-light-dark" size={22} color={COLORS.primary} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>المظهر</Text>
            <View style={styles.segmented}>
              {[['dark', '🌙'], ['light', '☀️']].map(([t, icon]) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.segItem, theme === t && { backgroundColor: COLORS.primary }]}
                  onPress={() => dispatch(setTheme(t))}
                >
                  <Text style={styles.segIcon}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={[styles.row, { borderBottomColor: colors.divider }]}>
            <MaterialCommunityIcons name="format-size" size={22} color={COLORS.primary} />
            <Text style={[styles.rowLabel, { color: colors.text }]}>حجم الخط</Text>
            <View style={styles.segmented}>
              {[['small', 'ص'], ['medium', 'م'], ['large', 'ك'], ['xl', 'ك+']].map(([s, label]) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.segItem, fontSize === s && { backgroundColor: COLORS.primary }]}
                  onPress={() => dispatch(setFontSize(s))}
                >
                  <Text style={[styles.segLabel, { color: fontSize === s ? '#FFF' : colors.textMuted }]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Section>

        {/* Notifications */}
        <Section title="🔔 الإشعارات">
          <NotifToggle label="الإعجابات" value={notifLikes} onValueChange={setNotifLikes} />
          <NotifToggle label="التعليقات" value={notifComments} onValueChange={setNotifComments} />
          <NotifToggle label="المتابعون الجدد" value={notifFollows} onValueChange={setNotifFollows} />
          <NotifToggle label="النشرة البريدية" value={notifNewsletter} onValueChange={setNotifNewsletter} />
        </Section>

        {/* Privacy */}
        <Section title="🔒 الخصوصية والأمان">
          <Row icon="shield-account" label="إعدادات الخصوصية" onPress={() => {}} />
          <Row icon="lock-reset" label="تغيير كلمة المرور" onPress={() => navigation.navigate('ChangePassword')} />
          <Row icon="two-factor-authentication" label="المصادقة الثنائية" onPress={() => {}} />
          <Row
            icon="advertisements"
            label="إعلانات Unity Ads"
            right={<Switch value={showAds} onValueChange={(v) => dispatch(setShowAds(v))} trackColor={{ false: colors.inputBg, true: COLORS.primary + '70' }} thumbColor={showAds ? COLORS.primary : colors.textMuted} />}
          />
        </Section>

        {/* Legal */}
        <Section title="📋 قانوني">
          <Row icon="shield-lock" label="سياسة الخصوصية" onPress={() => navigation.navigate('PrivacyPolicy')} />
          <Row icon="file-document" label="شروط الخدمة" onPress={() => navigation.navigate('TermsOfService')} />
          <Row icon="cookie" label="سياسة الكوكيز" onPress={() => Linking.openURL('https://blogverse.app/cookies')} />
          <Row icon="scale-balance" label="سياسة حقوق النشر (DMCA)" onPress={() => Linking.openURL('https://blogverse.app/dmca')} />
        </Section>

        {/* Support */}
        <Section title="💬 الدعم">
          <Row icon="help-circle-outline" label="مركز المساعدة" onPress={() => Linking.openURL('https://support.blogverse.app')} />
          <Row icon="bug-outline" label="الإبلاغ عن مشكلة" onPress={() => Linking.openURL('mailto:support@blogverse.app')} />
          <Row icon="star-outline" label="تقييم التطبيق" onPress={() => Linking.openURL('market://details?id=com.blogverse.app')} />
          <Row icon="share-variant-outline" label="مشاركة التطبيق" onPress={() => {}} />
          <Row icon="information-outline" label="عن BlogVerse" onPress={() => navigation.navigate('About')} value="v1.0.0" />
        </Section>

        {/* Danger Zone */}
        <Section title="⚠️ منطقة الخطر">
          <Row icon="logout" label="تسجيل الخروج" onPress={handleLogout} danger />
          <Row icon="delete-forever" label="حذف الحساب نهائياً" onPress={() => Alert.alert('⚠️ تحذير', 'سيتم حذف حسابك وجميع بياناتك نهائياً. هذه العملية لا يمكن التراجع عنها!', [{ text: 'إلغاء', style: 'cancel' }, { text: 'حذف', style: 'destructive' }])} danger />
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, paddingVertical: SPACING.base, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  profileCard: { flexDirection: 'row', alignItems: 'center', margin: SPACING.base, padding: SPACING.base, borderRadius: BORDER_RADIUS.xl, gap: SPACING.base, ...SHADOWS.sm },
  avatarGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarLetter: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '800', textAlign: 'right' },
  profileEmail: { fontSize: 12, textAlign: 'right', marginTop: 2 },
  profileBadges: { flexDirection: 'row', gap: SPACING.xs, justifyContent: 'flex-end', marginTop: 4 },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  verifiedText: { fontSize: 10, fontWeight: '700' },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  premiumText: { fontSize: 10, fontWeight: '700' },
  section: { marginHorizontal: SPACING.base, marginBottom: SPACING.base },
  sectionTitle: { fontSize: 12, fontWeight: '800', textAlign: 'right', marginBottom: SPACING.xs, paddingHorizontal: SPACING.xs },
  sectionCard: { borderRadius: BORDER_RADIUS.xl, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.base, paddingVertical: SPACING.base, borderBottomWidth: 1, gap: SPACING.sm },
  rowLabel: { flex: 1, fontSize: 15, textAlign: 'right', fontWeight: '500' },
  rowValue: { fontSize: 13 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  segmented: { flexDirection: 'row', gap: 4 },
  segItem: { paddingHorizontal: SPACING.sm, paddingVertical: 5, borderRadius: BORDER_RADIUS.md, backgroundColor: 'transparent' },
  segIcon: { fontSize: 16 },
  segLabel: { fontSize: 12, fontWeight: '700' },
});

export default SettingsScreen;
