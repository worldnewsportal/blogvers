// src/screens/AuthScreen.js
import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Animated,
  Dimensions, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { loginAsync, registerAsync } from '../store/slices/authSlice';
import { resetPassword } from '../services/authService';
import { setIsOnboarded } from '../store/slices/uiSlice';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const AuthScreen = () => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((s) => s.auth);
  const { theme } = useSelector((s) => s.ui);
  const colors = COLORS[theme];

  const [mode, setMode] = useState('login'); // login | register | reset
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', displayName: '', username: '', confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const slideAnim = useRef(new Animated.Value(0)).current;

  const switchMode = (newMode) => {
    Animated.spring(slideAnim, { toValue: newMode === 'login' ? 0 : 1, useNativeDriver: true }).start();
    setMode(newMode);
    setFormErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = 'بريد إلكتروني غير صحيح';
    if (mode !== 'reset') {
      if (form.password.length < 6) errs.password = 'كلمة المرور 6 أحرف على الأقل';
    }
    if (mode === 'register') {
      if (!form.displayName.trim()) errs.displayName = 'الاسم مطلوب';
      if (!form.username.match(/^[a-zA-Z0-9_]{3,20}$/)) errs.username = 'اسم مستخدم صالح (3-20 حرف، أرقام، _)';
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'كلمات المرور لا تتطابق';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (mode === 'login') {
      const result = await dispatch(loginAsync({ email: form.email, password: form.password }));
      if (loginAsync.fulfilled.match(result)) {
        dispatch(setIsOnboarded());
      }
    } else if (mode === 'register') {
      const result = await dispatch(registerAsync({
        email: form.email, password: form.password,
        displayName: form.displayName, username: form.username,
      }));
      if (registerAsync.fulfilled.match(result)) {
        Alert.alert('🎉 مرحباً!', 'تم إنشاء حسابك. تحقق من بريدك لتفعيل الحساب.');
        dispatch(setIsOnboarded());
      }
    } else {
      await resetPassword(form.email);
      Alert.alert('📧 تم الإرسال', 'تحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور.');
      switchMode('login');
    }
  };

  const Field = ({ icon, placeholder, field, secure, keyboard = 'default' }) => (
    <View style={styles.fieldWrap}>
      <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: formErrors[field] ? COLORS.dark.error : colors.divider }]}>
        <MaterialCommunityIcons name={icon} size={20} color={formErrors[field] ? COLORS.dark.error : colors.textMuted} style={{ marginHorizontal: SPACING.sm }} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={form[field]}
          onChangeText={(v) => setForm((f) => ({ ...f, [field]: v }))}
          secureTextEntry={secure && !showPassword}
          keyboardType={keyboard}
          autoCapitalize="none"
          textAlign="right"
        />
        {secure && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: SPACING.sm }}>
            <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {formErrors[field] && <Text style={styles.fieldError}>{formErrors[field]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Background decoration */}
      <LinearGradient colors={[COLORS.primary + '20', 'transparent']} style={styles.bgGradient} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Logo */}
          <View style={styles.logoSection}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.logoCircle}>
              <MaterialCommunityIcons name="feather" size={36} color="#FFF" />
            </LinearGradient>
            <Text style={[styles.appName, { color: colors.text }]}>BlogVerse</Text>
            <Text style={[styles.appSlogan, { color: colors.textMuted }]}>
              {mode === 'login' ? 'أهلاً بعودتك 👋' : mode === 'register' ? 'انضم لمجتمع الكتّاب ✨' : 'استعادة كلمة المرور 🔐'}
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {/* Mode Tabs */}
            {mode !== 'reset' && (
              <View style={[styles.tabs, { backgroundColor: colors.inputBg }]}>
                <TouchableOpacity style={[styles.tab, mode === 'login' && { backgroundColor: COLORS.primary }]} onPress={() => switchMode('login')}>
                  <Text style={[styles.tabText, { color: mode === 'login' ? '#FFF' : colors.textMuted }]}>تسجيل الدخول</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, mode === 'register' && { backgroundColor: COLORS.primary }]} onPress={() => switchMode('register')}>
                  <Text style={[styles.tabText, { color: mode === 'register' ? '#FFF' : colors.textMuted }]}>حساب جديد</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Fields */}
            {mode === 'register' && (
              <>
                <Field icon="account-outline" placeholder="الاسم الكامل" field="displayName" />
                <Field icon="at" placeholder="اسم المستخدم (بالإنجليزية)" field="username" keyboard="email-address" />
              </>
            )}
            <Field icon="email-outline" placeholder="البريد الإلكتروني" field="email" keyboard="email-address" />
            {mode !== 'reset' && (
              <Field icon="lock-outline" placeholder="كلمة المرور" field="password" secure />
            )}
            {mode === 'register' && (
              <Field icon="lock-check-outline" placeholder="تأكيد كلمة المرور" field="confirmPassword" secure />
            )}

            {/* Error Banner */}
            {error && (
              <View style={[styles.errorBanner, { backgroundColor: COLORS.dark.error + '20' }]}>
                <MaterialCommunityIcons name="alert-circle" size={16} color={COLORS.dark.error} />
                <Text style={[styles.errorText, { color: COLORS.dark.error }]}>{error}</Text>
              </View>
            )}

            {/* Forgot Password */}
            {mode === 'login' && (
              <TouchableOpacity onPress={() => switchMode('reset')} style={styles.forgotBtn}>
                <Text style={[styles.forgotText, { color: COLORS.primary }]}>نسيت كلمة المرور؟</Text>
              </TouchableOpacity>
            )}

            {/* Submit */}
            <TouchableOpacity onPress={handleSubmit} disabled={isLoading} activeOpacity={0.85}>
              <LinearGradient
                colors={isLoading ? [colors.textMuted, colors.textMuted] : [COLORS.primary, COLORS.primaryDark]}
                style={styles.submitBtn}
              >
                {isLoading ? (
                  <MaterialCommunityIcons name="loading" size={22} color="#FFF" />
                ) : (
                  <Text style={styles.submitText}>
                    {mode === 'login' ? 'تسجيل الدخول' : mode === 'register' ? 'إنشاء الحساب' : 'إرسال رابط الاستعادة'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Back from reset */}
            {mode === 'reset' && (
              <TouchableOpacity onPress={() => switchMode('login')} style={styles.backBtn}>
                <Feather name="arrow-right" size={16} color={colors.textMuted} />
                <Text style={[styles.backText, { color: colors.textMuted }]}>العودة لتسجيل الدخول</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Terms Notice */}
          <Text style={[styles.termsNotice, { color: colors.textMuted }]}>
            باستخدامك للتطبيق توافق على{' '}
            <Text style={{ color: COLORS.primary }}>شروط الخدمة</Text>
            {' '}و{' '}
            <Text style={{ color: COLORS.primary }}>سياسة الخصوصية</Text>
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.4 },
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.base, paddingBottom: SPACING['2xl'] },
  logoSection: { alignItems: 'center', paddingTop: height * 0.06, marginBottom: SPACING['2xl'] },
  logoCircle: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', ...SHADOWS.xl, marginBottom: SPACING.base },
  appName: { fontSize: 30, fontWeight: '900', letterSpacing: 1 },
  appSlogan: { fontSize: 15, marginTop: SPACING.xs },
  formCard: { borderRadius: BORDER_RADIUS['2xl'], padding: SPACING.xl, borderWidth: 1, ...SHADOWS.md },
  tabs: { flexDirection: 'row', borderRadius: BORDER_RADIUS.xl, padding: 4, marginBottom: SPACING.xl },
  tab: { flex: 1, paddingVertical: SPACING.sm, alignItems: 'center', borderRadius: BORDER_RADIUS.lg },
  tabText: { fontSize: 14, fontWeight: '700' },
  fieldWrap: { marginBottom: SPACING.sm },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: BORDER_RADIUS.lg, borderWidth: 1.5, height: 52 },
  input: { flex: 1, fontSize: 15, paddingVertical: SPACING.sm },
  fieldError: { color: '#F44336', fontSize: 12, marginTop: 4, textAlign: 'right' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, padding: SPACING.sm, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.sm },
  errorText: { fontSize: 13, flex: 1, textAlign: 'right' },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: SPACING.base },
  forgotText: { fontSize: 13, fontWeight: '600' },
  submitBtn: { borderRadius: BORDER_RADIUS.xl, paddingVertical: SPACING.base + 2, alignItems: 'center', marginTop: SPACING.xs, ...SHADOWS.lg },
  submitText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  backBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xs, marginTop: SPACING.base },
  backText: { fontSize: 14 },
  termsNotice: { textAlign: 'center', fontSize: 12, marginTop: SPACING.xl, lineHeight: 20 },
});

export default AuthScreen;
