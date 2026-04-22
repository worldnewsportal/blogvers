// src/screens/TermsOfServiceScreen.js
// ==========================================
// Terms of Service - شروط الخدمة
// ==========================================

import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

const TERMS_SECTIONS = [
  {
    id: 1,
    icon: '🤝',
    title: 'قبول الشروط والأحكام',
    content: `باستخدامك لتطبيق BlogVerse، فإنك توافق صراحةً على الالتزام بهذه الشروط والأحكام.

**هذه الشروط تنطبق على:**
• استخدام التطبيق للقراءة والنشر
• إنشاء حساب مستخدم
• التفاعل مع المحتوى والمستخدمين الآخرين
• استخدام أي ميزة مدفوعة أو مجانية

إذا كنت لا توافق على هذه الشروط، يجب عليك التوقف فوراً عن استخدام التطبيق وحذف حسابك.

يُشترط أن يكون عمرك 13 عاماً أو أكثر لاستخدام التطبيق.`,
  },
  {
    id: 2,
    icon: '📝',
    title: 'حقوق الملكية الفكرية والمحتوى',
    content: `**محتواك:**
• تحتفظ بكامل حقوق ملكية المحتوى الذي تنشره
• بنشرك للمحتوى، تمنح BlogVerse ترخيصاً غير حصري لعرضه وتوزيعه
• هذا الترخيص يتيح لنا عرض محتواك للمستخدمين الآخرين

**محتوى BlogVerse:**
• جميع حقوق الملكية الفكرية للتطبيق محفوظة لـ BlogVerse
• يُحظر نسخ أو إعادة توزيع واجهة التطبيق أو كوده
• يُحظر استخدام اسم أو شعار BlogVerse دون إذن

**DMCA - الإبلاغ عن انتهاكات حقوق النشر:**
إذا اعتقدت أن محتواك نُشر دون إذنك، أرسل بلاغاً إلى:
dmca@blogverse.app`,
  },
  {
    id: 3,
    icon: '🚫',
    title: 'السياسات الصارمة - المحظورات',
    content: `**محتوى محظور تماماً (قد يؤدي للحذف الفوري):**
• المحتوى الإباحي أو الجنسي الصريح
• محتوى يمس الأطفال بأي شكل
• خطاب الكراهية والتمييز العنصري أو الديني
• التحريض على العنف أو الإرهاب
• المحتوى المُضلل أو الأخبار الكاذبة
• التشهير أو القذف بأشخاص حقيقيين
• انتهاك حقوق النشر أو الملكية الفكرية

**سلوك محظور:**
• مضايقة أو تهديد المستخدمين الآخرين
• إنشاء حسابات وهمية متعددة
• نشر سبام أو إعلانات غير مرخصة
• استخدام بوتات أو أدوات آلية
• محاولة اختراق النظام

**العقوبات:**
تحذير → تعليق مؤقت → حذف نهائي`,
  },
  {
    id: 4,
    icon: '👤',
    title: 'مسؤوليات المستخدم',
    content: `**أنت مسؤول عن:**

**أمان حسابك:**
• الحفاظ على سرية كلمة المرور
• عدم مشاركة حسابك مع الآخرين
• إبلاغنا فوراً عن أي اختراق مشتبه به
• استخدام كلمة مرور قوية وفريدة

**دقة بياناتك:**
• توفير معلومات صحيحة وحديثة
• عدم انتحال هوية شخص آخر أو كيان
• الإفصاح إذا كنت تمثل شركة أو مؤسسة

**محتواك:**
• التحقق من دقة المعلومات قبل نشرها
• احترام خصوصية الآخرين
• الإشارة للمصادر عند الاقتباس

**عند البلوغ:** إذا لم تبلغ 18 عاماً، يجب أن تحصل على موافقة والديك.`,
  },
  {
    id: 5,
    icon: '💎',
    title: 'الاشتراكات والمدفوعات',
    content: `**الخطط المتاحة:**

🆓 **المجاني:** الوصول الأساسي، قراءة ونشر محدود
⭐ **BlogVerse Pro:** نشر غير محدود، بدون إعلانات، ميزات متقدمة

**سياسة الدفع:**
• تُجدَّد الاشتراكات تلقائياً في نهاية كل فترة
• يمكنك إلغاء الاشتراك في أي وقت
• إلغاء الاشتراك يُوقف التجديد التلقائي دون استرداد المبلغ

**سياسة الاسترداد:**
• يمكن استرداد المبلغ خلال 7 أيام من الدفع الأول فقط
• لا يُسترد المبلغ في حالات انتهاك الشروط
• طلبات الاسترداد: refund@blogverse.app

**الأسعار:**
الأسعار قابلة للتغيير مع إشعار مسبق 30 يوماً`,
  },
  {
    id: 6,
    icon: '🛡️',
    title: 'إخلاء المسؤولية وحدود المسؤولية',
    content: `**إخلاء المسؤولية:**
• BlogVerse منصة وسيطة - نحن لسنا مسؤولين عن محتوى المستخدمين
• آراء الكتّاب لا تعبر بالضرورة عن آراء BlogVerse
• نحن لا نضمن دقة أو اكتمال المحتوى المنشور

**حدود المسؤولية:**
• لا تتجاوز مسؤوليتنا المبلغ المدفوع خلال 12 شهراً
• لسنا مسؤولين عن الأضرار غير المباشرة أو التبعية
• لسنا مسؤولين عن انقطاع الخدمة أو فقدان البيانات

**استمرارية الخدمة:**
• نسعى لتوفير الخدمة 99.9% من الوقت
• نحتفظ بالحق في إيقاف أو تعديل الخدمة مؤقتاً للصيانة`,
  },
  {
    id: 7,
    icon: '📊',
    title: 'الإعلانات والرعاية',
    content: `**الإعلانات في التطبيق:**
• نستخدم Google AdMob لعرض الإعلانات
• الإعلانات تساعد في إبقاء الخدمة مجانية للجميع
• لا نتحكم في محتوى الإعلانات المحددة

**أنواع الإعلانات:**
• إعلانات بانر: تظهر أسفل الشاشة
• إعلانات بينية: تظهر بين المقالات
• إعلانات مكافأة: اختيارية مقابل محتوى مميز

**إيقاف الإعلانات:**
• الاشتراك في BlogVerse Pro يوفر تجربة خالية من الإعلانات
• يمكنك إيقاف الإعلانات الشخصية من إعدادات التطبيق

**المحتوى المموَّل:**
المحتوى المدفوع أو المُرعى يُوسَم بوضوح كـ "محتوى مُرعى"`,
  },
  {
    id: 8,
    icon: '⚖️',
    title: 'القانون المطبق والنزاعات',
    content: `**القانون المطبق:**
تخضع هذه الشروط للقانون المطبق في دولة الإمارات العربية المتحدة، مع مراعاة القوانين المحلية للمستخدم.

**حل النزاعات:**
1. **الحل الودي:** نسعى أولاً لحل أي نزاع بطريقة ودية خلال 30 يوماً
2. **الوساطة:** إذا فشل الحل الودي، نلجأ للوساطة
3. **التحكيم:** كملاذ أخير، يُحسم النزاع بالتحكيم وفق قواعد دولية معتمدة

**تقديم الشكاوى:**
legal@blogverse.app

**الولاية القضائية:**
للمستخدمين في الاتحاد الأوروبي: يحق لك رفع شكوى لدى هيئة حماية البيانات في بلدك.`,
  },
  {
    id: 9,
    icon: '🔄',
    title: 'تعديل وإنهاء الخدمة',
    content: `**حقنا في التعديل:**
• نحتفظ بالحق في تعديل الشروط مع إشعار مسبق 30 يوماً
• التغييرات الجوهرية تتطلب موافقتك الصريحة
• الاستمرار في الاستخدام يعني قبول التعديلات

**إنهاء الحساب:**
• يمكنك حذف حسابك في أي وقت من الإعدادات
• نحتفظ بالحق في تعليق أي حساب ينتهك الشروط
• عند الحذف: تُمسح بياناتك خلال 90 يوماً

**ما يبقى بعد الإنهاء:**
• تبقى المقالات المنشورة (باسم مجهول) إلا إذا طلبت حذفها
• المحادثات والتعليقات قد تبقى بشكل مجهول
• الاشتراكات المدفوعة لا تُسترد عند الإنهاء الطوعي`,
  },
  {
    id: 10,
    icon: '📞',
    title: 'التواصل والدعم',
    content: `**للتواصل معنا:**

📧 الدعم العام: support@blogverse.app
📧 المسائل القانونية: legal@blogverse.app  
📧 انتهاكات حقوق النشر: dmca@blogverse.app
📧 الاسترداد والمدفوعات: refund@blogverse.app
📧 تقارير الأمان: security@blogverse.app

**ساعات الدعم:**
الأحد - الخميس: 9 صباحاً - 10 مساءً (توقيت الإمارات)
الجمعة - السبت: 10 صباحاً - 6 مساءً

**داخل التطبيق:**
الإعدادات ← مساعدة ← تواصل مع الدعم

وقت الاستجابة المعتاد: 24-48 ساعة عمل`,
  },
];

const TermsOfServiceScreen = () => {
  const navigation = useNavigation();
  const { theme } = useSelector((s) => s.ui);
  const colors = COLORS[theme];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-right" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>شروط الخدمة</Text>
        <TouchableOpacity onPress={() => Share.share({ message: 'شروط خدمة BlogVerse\nhttps://blogverse.app/terms' })}>
          <Feather name="share-2" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: COLORS.accent + '15' }]}>
          <MaterialCommunityIcons name="file-document-outline" size={48} color={COLORS.accent} />
          <Text style={[styles.heroTitle, { color: colors.text }]}>شروط استخدام BlogVerse</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            يُرجى قراءة هذه الشروط بعناية قبل استخدام التطبيق
          </Text>
          <View style={[styles.versionBadge, { backgroundColor: COLORS.accent }]}>
            <Text style={styles.versionText}>الإصدار 1.0.0 | فعّال من: يناير 2025</Text>
          </View>
        </View>

        {/* Important Notice */}
        <View style={[styles.noticeCard, { backgroundColor: COLORS.secondary + '15', borderColor: COLORS.secondary + '40' }]}>
          <MaterialCommunityIcons name="alert-circle-outline" size={24} color={COLORS.secondary} />
          <Text style={[styles.noticeText, { color: colors.text }]}>
            باستخدام التطبيق فإنك توافق على هذه الشروط. هذا الاتفاق قانونياً ملزم.
          </Text>
        </View>

        {/* Sections */}
        {TERMS_SECTIONS.map((section) => (
          <View
            key={section.id}
            style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>{section.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionNum, { color: COLORS.accent }]}>المادة {section.id}</Text>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
              </View>
            </View>
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
              {section.content}
            </Text>
          </View>
        ))}

        {/* Acceptance */}
        <View style={[styles.acceptCard, { backgroundColor: COLORS.primary + '10', borderColor: COLORS.primary + '30' }]}>
          <Text style={[styles.acceptTitle, { color: colors.text }]}>✅ أنت وافقت على هذه الشروط</Text>
          <Text style={[styles.acceptText, { color: colors.textSecondary }]}>
            باستمرارك في استخدام BlogVerse، فأنت تقر بقراءتك وفهمك وموافقتك على هذه الشروط والأحكام.
          </Text>
          <TouchableOpacity
            style={[styles.privacyLink, { borderColor: COLORS.primary }]}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Feather name="shield" size={16} color={COLORS.primary} />
            <Text style={[styles.privacyLinkText, { color: COLORS.primary }]}>اقرأ أيضاً: سياسة الخصوصية</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.base,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  hero: {
    alignItems: 'center',
    padding: SPACING['2xl'],
    margin: SPACING.base,
    borderRadius: BORDER_RADIUS['2xl'],
    gap: SPACING.sm,
  },
  heroTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
  heroSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  versionBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.full },
  versionText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    margin: SPACING.base,
    marginTop: 0,
    padding: SPACING.base,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
  },
  noticeText: { flex: 1, fontSize: 14, lineHeight: 20, textAlign: 'right' },
  section: {
    margin: SPACING.base,
    marginTop: 0,
    padding: SPACING.base,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
  },
  sectionHeader: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.sm },
  sectionIcon: { fontSize: 24 },
  sectionNum: { fontSize: 11, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '800', textAlign: 'right' },
  sectionContent: { fontSize: 14, lineHeight: 24, textAlign: 'right' },
  acceptCard: {
    margin: SPACING.base,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  acceptTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  acceptText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  privacyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    marginTop: SPACING.sm,
  },
  privacyLinkText: { fontSize: 14, fontWeight: '700' },
});

export default TermsOfServiceScreen;
