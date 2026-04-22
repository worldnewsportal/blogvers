// src/screens/PrivacyPolicyScreen.js
// ==========================================
// Privacy Policy - Required for App Stores
// Last Updated: 2025
// ==========================================

import React, { useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Share, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';

const PRIVACY_SECTIONS = [
  {
    id: 1,
    icon: '📋',
    title: 'مقدمة وقبول الشروط',
    content: `مرحباً بك في BlogVerse. نحن ملتزمون بحماية خصوصيتك وأمان بياناتك الشخصية.

تُطبَّق سياسة الخصوصية هذه على جميع خدمات BlogVerse، بما في ذلك تطبيق الهاتف المحمول وأي خدمات مرتبطة به.

باستخدامك لتطبيقنا، فإنك توافق على جمع ومعالجة بياناتك وفقاً لهذه السياسة. إذا كنت لا توافق على أي جزء من هذه السياسة، يُرجى التوقف عن استخدام التطبيق.

آخر تحديث: يناير 2025 | الإصدار: 1.0.0`,
  },
  {
    id: 2,
    icon: '📊',
    title: 'البيانات التي نجمعها',
    content: `**أ) البيانات التي تقدمها مباشرةً:**
• الاسم وعنوان البريد الإلكتروني عند التسجيل
• صورة الملف الشخصي والسيرة الذاتية
• محتوى المقالات والتعليقات التي تنشرها
• تفضيلات الإشعارات والإعدادات

**ب) البيانات المجمَّعة تلقائياً:**
• بيانات الاستخدام (المقالات المقروءة، وقت القراءة)
• معلومات الجهاز (نوع الهاتف، نظام التشغيل، الإصدار)
• بيانات الموقع الجغرافي العام (البلد فقط)
• عنوان IP المجهول
• بيانات الأداء والأعطال (لتحسين التطبيق)

**ج) بيانات الجهات الخارجية:**
• عند تسجيل الدخول بـ Google أو Apple: الاسم والبريد والصورة فقط
• بيانات الإعلانات من Google AdMob (مجهولة الهوية)`,
  },
  {
    id: 3,
    icon: '🎯',
    title: 'كيف نستخدم بياناتك',
    content: `نستخدم البيانات المجمَّعة للأغراض التالية:

**تشغيل الخدمة:**
• إنشاء وإدارة حسابك
• عرض المحتوى المناسب لاهتماماتك
• تمكينك من نشر وقراءة المقالات

**تحسين التجربة:**
• تخصيص المحتوى بناءً على اهتماماتك
• تحسين أداء التطبيق وإصلاح الأعطال
• تطوير ميزات جديدة

**التواصل:**
• إرسال إشعارات التعليقات والمتابعات (بموافقتك)
• إعلانك بالتحديثات المهمة
• الرد على استفساراتك ودعمك

**الأمان والامتثال:**
• منع الاحتيال وحماية المستخدمين
• الامتثال للمتطلبات القانونية

**الإعلانات:**
• عرض إعلانات ملائمة عبر Google AdMob (يمكنك إيقافها)`,
  },
  {
    id: 4,
    icon: '🔒',
    title: 'حماية البيانات والأمان',
    content: `**تدابير الأمان التقنية:**
• تشفير جميع البيانات في النقل والتخزين (TLS 1.3 / AES-256)
• المصادقة الثنائية (2FA) متاحة لحسابك
• جدران حماية وفلترة متقدمة للبيانات
• مراقبة الأنشطة المشبوهة على مدار الساعة

**البنية التحتية:**
• نستخدم Google Firebase المعتمَد ISO 27001
• خوادم محمية في مراكز بيانات آمنة
• نسخ احتياطية تلقائية يومية

**التزاماتنا:**
• لن نبيع بياناتك الشخصية أبداً لأي طرف ثالث
• لن نشارك بياناتك التعريفية مع المعلنين
• نُبلغك فوراً (خلال 72 ساعة) في حالة أي خرق أمني

⚠️ ملاحظة: رغم إجراءاتنا المشددة، لا يمكن ضمان أمان 100% عبر الإنترنت.`,
  },
  {
    id: 5,
    icon: '🤝',
    title: 'مشاركة البيانات مع الأطراف الثالثة',
    content: `**الأطراف الثالثة المعتمَدة:**

| الخدمة | الغرض | البيانات المشاركة |
|--------|--------|------------------|
| Google Firebase | التخزين والمصادقة | بيانات الحساب |
| Google AdMob | الإعلانات | معرِّف مجهول |
| Google Analytics | تحليل الاستخدام | بيانات مجهولة |
| Apple Sign-In | تسجيل الدخول | الاسم والبريد |

**متى نُفصح عن البيانات:**
• بأمر قضائي أو طلب قانوني ملزم
• لمنع أذى جسيم أو نشاط إجرامي
• بموافقتك الصريحة المسبقة

**ما لن نفعله أبداً:**
• بيع بياناتك للمعلنين
• مشاركة بياناتك مع منافسين
• استخدام بياناتك لأغراض غير معلنة`,
  },
  {
    id: 6,
    icon: '⚖️',
    title: 'حقوقك القانونية (GDPR)',
    content: `وفقاً للوائح حماية البيانات العالمية، لديك الحقوق التالية:

**1. حق الوصول** 📂
طلب نسخة كاملة من بياناتك الشخصية المحفوظة لدينا.

**2. حق التصحيح** ✏️
تصحيح أي بيانات غير دقيقة أو ناقصة.

**3. حق الحذف** 🗑️
طلب حذف بياناتك ("حق النسيان") في حالات معينة.

**4. حق تقييد المعالجة** ⛔
تقييد استخدامنا لبياناتك في ظروف معينة.

**5. حق نقل البيانات** 📤
الحصول على بياناتك بصيغة قابلة للنقل.

**6. حق الاعتراض** 🚫
الاعتراض على معالجة بياناتك لأغراض التسويق.

**لممارسة حقوقك:**
تواصل معنا على: privacy@blogverse.app
سنرد خلال 30 يوماً من تاريخ استلام الطلب.`,
  },
  {
    id: 7,
    icon: '🍪',
    title: 'ملفات الارتباط والتتبع',
    content: `**التقنيات المستخدمة للتتبع:**

• **معرِّفات الجهاز:** لضمان تجربة متسقة عبر الجلسات
• **التخزين المحلي:** لحفظ تفضيلاتك وإعداداتك
• **تحليلات الاستخدام:** لفهم كيفية استخدام التطبيق (مجهول الهوية)
• **معرِّفات الإعلانات:** Google IDFA/GAID لعرض إعلانات ملائمة

**التحكم في الإعلانات الشخصية:**
يمكنك إيقاف الإعلانات الشخصية من إعدادات التطبيق > الخصوصية > تفضيلات الإعلانات

أو من إعدادات الجهاز:
• Android: الإعدادات > Google > الإعلانات
• iOS: الإعدادات > الخصوصية > الإعلانات`,
  },
  {
    id: 8,
    icon: '👶',
    title: 'خصوصية الأطفال',
    content: `BlogVerse غير مخصص للأطفال دون سن 13 عاماً.

**سياستنا:**
• لا نجمع عن قصد بيانات من أطفال دون 13 عاماً
• إذا اكتشفنا أن مستخدماً دون 13 عاماً قد أنشأ حساباً، سنحذف الحساب فوراً
• نطلب التحقق من العمر عند التسجيل

**للمراهقين (13-17):**
• يحق لنا في بعض الدول طلب موافقة الوالدين
• نطبق قيوداً إضافية على بيانات المراهقين

**للآباء والأمهات:**
إذا اكتشفت أن طفلك أنشأ حساباً، تواصل معنا فوراً:
children@blogverse.app`,
  },
  {
    id: 9,
    icon: '🌍',
    title: 'نقل البيانات الدولي',
    content: `تُخزَّن بياناتك وتُعالَج في خوادم Google Firebase المتوافقة مع:

• **GDPR** (اللائحة الأوروبية لحماية البيانات)
• **CCPA** (قانون خصوصية المستهلك في كاليفورنيا)
• **معايير ISO 27001** لأمن المعلومات
• **SOC 2 Type II** للأمن والتوفر

عند نقل البيانات خارج منطقتك الجغرافية، نضمن مستوى حماية مكافئاً وفقاً لبنود معالجة بيانات Google المعتمدة (DPA).`,
  },
  {
    id: 10,
    icon: '🔄',
    title: 'التحديثات على سياسة الخصوصية',
    content: `نحتفظ بالحق في تحديث هذه السياسة دورياً.

**إجراءاتنا عند التحديث:**
• إشعار داخل التطبيق قبل 30 يوماً من التغييرات الجوهرية
• إرسال بريد إلكتروني للمستخدمين المسجلين
• عرض ملخص التغييرات بوضوح
• طلب موافقتك على التغييرات الجوهرية

**تاريخ التحديثات:**
• يناير 2025: الإصدار الأول 1.0.0

استمرارك في استخدام التطبيق بعد نشر التحديثات يعني قبولك للتغييرات.`,
  },
  {
    id: 11,
    icon: '📞',
    title: 'تواصل معنا',
    content: `**مسؤول حماية البيانات (DPO):**
البريد الإلكتروني: privacy@blogverse.app
الرد خلال: 72 ساعة عمل

**الدعم العام:**
البريد الإلكتروني: support@blogverse.app
التطبيق: إعدادات > مساعدة > تواصل معنا

**البلاغات عن الانتهاكات:**
security@blogverse.app
الاستجابة الطارئة: خلال 4 ساعات

**العنوان القانوني:**
BlogVerse Inc.
[عنوان الشركة]
[المدينة، الدولة]

نحن ملتزمون بالرد على جميع استفساراتك المتعلقة بالخصوصية بجدية تامة.`,
  },
];

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();
  const scrollRef = useRef(null);
  const { theme } = useSelector((s) => s.ui);
  const colors = COLORS[theme];

  const handleShare = async () => {
    await Share.share({
      message: 'سياسة الخصوصية - BlogVerse\nhttps://blogverse.app/privacy',
      title: 'سياسة الخصوصية',
    });
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:privacy@blogverse.app');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-right" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>سياسة الخصوصية</Text>
        <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
          <Feather name="share-2" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: COLORS.primary + '15' }]}>
          <MaterialCommunityIcons name="shield-lock" size={48} color={COLORS.primary} />
          <Text style={[styles.heroTitle, { color: colors.text }]}>خصوصيتك تهمنا</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            نحن ملتزمون بحماية بياناتك الشخصية وضمان شفافية كاملة حول كيفية استخدامها.
          </Text>
          <View style={[styles.versionBadge, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.versionText}>الإصدار 1.0.0 | يناير 2025</Text>
          </View>
        </View>

        {/* Quick Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>ملخص سريع 📌</Text>
          {[
            { icon: '✅', text: 'لن نبيع بياناتك أبداً لأي طرف ثالث' },
            { icon: '✅', text: 'بياناتك مشفرة وآمنة تماماً' },
            { icon: '✅', text: 'يمكنك حذف حسابك وبياناتك في أي وقت' },
            { icon: '✅', text: 'نوضح بالتفصيل كيف نستخدم بياناتك' },
            { icon: '✅', text: 'الإعلانات الشخصية اختيارية ويمكن إيقافها' },
          ].map((item, index) => (
            <View key={index} style={styles.summaryItem}>
              <Text style={styles.summaryIcon}>{item.icon}</Text>
              <Text style={[styles.summaryText, { color: colors.textSecondary }]}>{item.text}</Text>
            </View>
          ))}
        </View>

        {/* Sections */}
        {PRIVACY_SECTIONS.map((section) => (
          <View
            key={section.id}
            style={[styles.section, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionIcon}>{section.icon}</Text>
              <View style={styles.sectionTitleContainer}>
                <Text style={[styles.sectionNumber, { color: COLORS.primary }]}>{String(section.id).padStart(2, '0')}</Text>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
              </View>
            </View>
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
              {section.content}
            </Text>
          </View>
        ))}

        {/* Contact CTA */}
        <View style={[styles.contactCard, { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary + '30' }]}>
          <MaterialCommunityIcons name="email-outline" size={32} color={COLORS.primary} />
          <Text style={[styles.contactTitle, { color: colors.text }]}>لديك استفسار عن خصوصيتك؟</Text>
          <Text style={[styles.contactSubtitle, { color: colors.textSecondary }]}>
            فريقنا جاهز للإجابة على جميع أسئلتك
          </Text>
          <TouchableOpacity style={[styles.contactBtn, { backgroundColor: COLORS.primary }]} onPress={handleEmailPress}>
            <Feather name="mail" size={16} color="#FFF" />
            <Text style={styles.contactBtnText}>privacy@blogverse.app</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            © 2025 BlogVerse. جميع الحقوق محفوظة.{'\n'}
            هذه السياسة خاضعة للقانون المطبق في بلد المستخدم.
          </Text>
        </View>
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
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  shareBtn: { padding: SPACING.xs },
  hero: {
    alignItems: 'center',
    padding: SPACING['2xl'],
    margin: SPACING.base,
    borderRadius: BORDER_RADIUS['2xl'],
    gap: SPACING.sm,
  },
  heroTitle: { fontSize: 24, fontWeight: '900', textAlign: 'center' },
  heroSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  versionBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: BORDER_RADIUS.full, marginTop: SPACING.xs },
  versionText: { color: '#FFF', fontSize: 11, fontWeight: '600' },
  summaryCard: {
    margin: SPACING.base,
    marginTop: 0,
    padding: SPACING.base,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  summaryTitle: { fontSize: 16, fontWeight: '800', textAlign: 'right', marginBottom: SPACING.xs },
  summaryItem: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  summaryIcon: { fontSize: 16 },
  summaryText: { fontSize: 14, lineHeight: 20, flex: 1, textAlign: 'right' },
  section: {
    margin: SPACING.base,
    marginTop: 0,
    padding: SPACING.base,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.sm },
  sectionIcon: { fontSize: 24 },
  sectionTitleContainer: { flex: 1 },
  sectionNumber: { fontSize: 11, fontWeight: '700', marginBottom: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', textAlign: 'right' },
  sectionContent: { fontSize: 14, lineHeight: 24, textAlign: 'right' },
  contactCard: {
    margin: SPACING.base,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  contactTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  contactSubtitle: { fontSize: 14, textAlign: 'center' },
  contactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginTop: SPACING.sm,
  },
  contactBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
  footer: { padding: SPACING['2xl'], alignItems: 'center' },
  footerText: { fontSize: 12, textAlign: 'center', lineHeight: 20 },
});

export default PrivacyPolicyScreen;
