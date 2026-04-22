# BlogVerse 📖✨
## تطبيق تدوين احترافي متكامل | Professional Arabic Blogging App

<div align="center">

![BlogVerse Banner](https://via.placeholder.com/800x200/6C63FF/FFFFFF?text=BlogVerse+%F0%9F%93%96)

[![Build APK](https://github.com/YOUR_USERNAME/blogverse-app/actions/workflows/build-apk.yml/badge.svg)](https://github.com/YOUR_USERNAME/blogverse-app/actions)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Version](https://img.shields.io/badge/Version-1.0.0-purple)

</div>

---

## 🌟 المميزات الرئيسية

### 📱 تجربة المستخدم
- ✅ واجهة عربية RTL احترافية بالكامل
- ✅ وضع مظلم/فاتح مع حفظ التفضيل
- ✅ خطوط Cairo الجميلة مُدمجة
- ✅ رسوم متحركة سلسة وجذابة
- ✅ دعم أحجام خطوط متعددة

### 📝 نشر المحتوى
- ✅ محرر Markdown احترافي كامل
- ✅ شريط أدوات تنسيق ذكي
- ✅ رفع صور الغلاف مع ضغط تلقائي
- ✅ الوسوم والتصنيفات
- ✅ حفظ المسودات تلقائياً
- ✅ وقت القراءة المُحسوب تلقائياً

### 👥 المجتمع
- ✅ متابعة الكتّاب
- ✅ الإعجاب والتعليق
- ✅ حفظ المقالات للقراءة لاحقاً
- ✅ مشاركة المقالات
- ✅ إشعارات فورية

### 💰 الإعلانات (جاهزة للنشر)
- ✅ Google AdMob مدمج بالكامل
- ✅ إعلانات بانر
- ✅ إعلانات بينية (Interstitial)
- ✅ إعلانات مكافأة (Rewarded)
- ✅ التحميل المسبق للإعلانات
- ✅ وضع الاختبار تلقائياً في DEV

### 📋 القانوني
- ✅ سياسة خصوصية كاملة بالعربية
- ✅ شروط خدمة مفصلة بالعربية
- ✅ متوافق مع GDPR
- ✅ DMCA support
- ✅ حماية خصوصية الأطفال (COPPA)

---

## 🚀 بناء APK عبر GitHub Actions (بدون كمبيوتر)

### الخطوة 1: إنشاء مستودع GitHub
1. اذهب إلى [github.com](https://github.com) وأنشئ حساباً
2. اضغط **New Repository**
3. اكتب اسم المستودع: `blogverse-app`
4. اضغط **Create repository**

### الخطوة 2: رفع الكود
1. في صفحة المستودع، اضغط **uploading an existing file**
2. ارفع جميع الملفات (يمكنك ضغطهم في ZIP أولاً)
3. اضغط **Commit changes**

### الخطوة 3: إنشاء حساب Expo (مجاني)
1. اذهب إلى [expo.dev](https://expo.dev) وأنشئ حساباً
2. اذهب إلى **Account Settings > Access Tokens**
3. اضغط **Create Token** وانسخ التوكن

### الخطوة 4: إعداد Firebase
1. اذهب إلى [console.firebase.google.com](https://console.firebase.google.com)
2. أنشئ مشروعاً جديداً
3. فعّل: **Authentication** > Email/Password + Google
4. فعّل **Firestore Database** (Production mode)
5. فعّل **Storage**
6. من إعدادات المشروع، احصل على:
   - `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`
7. احصل على ملف `google-services.json` من إعدادات Android

### الخطوة 5: إعداد Secrets في GitHub
1. في مستودعك، اذهب إلى **Settings > Secrets and variables > Actions**
2. أضف هذه الـ Secrets:

```
EXPO_TOKEN            → التوكن من expo.dev
FIREBASE_API_KEY      → من Firebase Console
FIREBASE_AUTH_DOMAIN  → yourproject.firebaseapp.com
FIREBASE_PROJECT_ID   → معرف المشروع
FIREBASE_STORAGE_BUCKET → yourproject.appspot.com
FIREBASE_MESSAGING_SENDER_ID → الرقم
FIREBASE_APP_ID       → المعرف الكامل
GOOGLE_SERVICES_JSON  → محتوى ملف google-services.json كاملاً (نص JSON)
```

### الخطوة 6: تشغيل البناء
1. اذهب إلى **Actions** في مستودعك
2. اختر **Build & Deploy BlogVerse APK**
3. اضغط **Run workflow > Run workflow**
4. انتظر 10-20 دقيقة ☕
5. انتظر حتى يتم الإشعار عبر البريد

### الخطوة 7: تنزيل APK
**الطريقة 1: عبر Expo Dashboard**
- اذهب إلى [expo.dev](https://expo.dev) → مشروعك → Builds
- اضغط على البناء الأخير → Download

**الطريقة 2: إنشاء Release تلقائي**
```bash
# أنشئ Tag جديد لتفعيل النشر التلقائي
# في GitHub: Releases > Create a new release > v1.0.0
```

---

## ⚙️ إعداد AdMob للإعلانات

1. اذهب إلى [admob.google.com](https://admob.google.com)
2. أنشئ تطبيقاً جديداً
3. أنشئ وحدات إعلانية (Ad Units):
   - **Banner** للإعلانات الصغيرة
   - **Interstitial** للإعلانات الكاملة
   - **Rewarded** لإعلانات المكافأة
4. أضف معرفات الإعلانات في `app.json` وفي GitHub Secrets:
```
ADMOB_ANDROID_BANNER_ID
ADMOB_ANDROID_INTERSTITIAL_ID
ADMOB_ANDROID_REWARDED_ID
```

---

## 🏪 النشر على Google Play Store

### المتطلبات
- حساب Google Play Developer ($25 مرة واحدة)
- APK موقع رقمياً (EAS يفعل ذلك تلقائياً)

### الخطوات
1. ادفع رسوم التسجيل في [play.google.com/console](https://play.google.com/console)
2. أنشئ تطبيقاً جديداً
3. أكمل جميع المعلومات المطلوبة
4. ارفع APK/AAB
5. أضف السياسات المطلوبة (موجودة في التطبيق)
6. انشر!

### معلومات مطلوبة
- ✅ وصف التطبيق (بالعربية والإنجليزية)
- ✅ لقطات شاشة (4 على الأقل)
- ✅ أيقونة 512×512
- ✅ رابط سياسة الخصوصية: `https://blogverse.app/privacy`
- ✅ تصنيف عمري

---

## 📊 قابلية التوسع (Scalability)

التطبيق مصمم لاستيعاب **آلاف المستخدمين المتزامنين**:

| الميزة | التقنية |
|--------|---------|
| قاعدة البيانات | Firebase Firestore (NoSQL، مُوزَّع) |
| التخزين المؤقت | Persistent Cache + مزامنة فورية |
| الصور | Firebase Storage + CDN |
| الأداء | Pagination (10 مقالات لكل صفحة) |
| الأمان | Firestore Rules صارمة |
| المصادقة | Firebase Auth (OAuth2) |
| الإشعارات | Firebase Cloud Messaging |
| التحليلات | Firebase Analytics |
| المراقبة | Firebase Performance |

**حدود الطبقة المجانية (Firebase Spark):**
- قراءات Firestore: 50,000/يوم
- كتابات: 20,000/يوم
- تخزين: 1 GB
- نقل بيانات: 10 GB/شهر

**للإنتاج الحقيقي:** انتقل إلى **Firebase Blaze** (Pay as you go)

---

## 🔧 البنية التقنية

```
BlogVerse/
├── App.js                    # نقطة الدخول الرئيسية
├── app.json                  # إعدادات Expo + Plugins
├── eas.json                  # إعدادات بناء EAS
├── firestore.rules           # قواعد أمان Firestore
├── storage.rules             # قواعد أمان Storage
├── .github/workflows/        # GitHub Actions CI/CD
│   └── build-apk.yml
└── src/
    ├── screens/              # جميع الشاشات
    │   ├── HomeScreen.js
    │   ├── PostDetailScreen.js
    │   ├── CreatePostScreen.js
    │   ├── AuthScreen.js
    │   ├── ProfileScreen.js
    │   ├── SearchScreen.js
    │   ├── SettingsScreen.js
    │   ├── OnboardingScreen.js
    │   ├── PrivacyPolicyScreen.js  ← قانوني
    │   └── TermsOfServiceScreen.js ← قانوني
    ├── components/           # مكونات قابلة لإعادة الاستخدام
    │   ├── PostCard.js       ← بطاقات المقالات (3 أنواع)
    │   └── AdBanner.js       ← إعلانات AdMob
    ├── navigation/
    │   └── AppNavigator.js   ← Stack + Tab + Drawer
    ├── store/                ← Redux Toolkit
    │   ├── index.js
    │   └── slices/
    │       ├── authSlice.js
    │       ├── postsSlice.js
    │       ├── categoriesSlice.js
    │       ├── uiSlice.js
    │       └── notificationsSlice.js
    ├── services/             ← Firebase Services
    │   ├── firebase.js
    │   ├── authService.js
    │   └── postsService.js
    ├── constants/
    │   └── theme.js          ← Design System
    └── utils/
        └── imageUtils.js
```

---

## 📱 إعدادات iOS (Apple)

لنشر على App Store:
1. تحتاج Mac أو استخدام EAS Build (السحابة)
2. حساب Apple Developer ($99/سنة)
3. أضف `EXPO_APPLE_ID` و `EXPO_APPLE_APP_SPECIFIC_PASSWORD` في Secrets

---

## 🐛 استكشاف الأخطاء الشائعة

| المشكلة | الحل |
|---------|------|
| Build fails: "EXPO_TOKEN invalid" | تأكد من صحة التوكن في Secrets |
| Firebase connection failed | تحقق من google-services.json في Secrets |
| Build timeout | طبيعي - قد يستغرق 20-30 دقيقة |
| APK لا يُثبَّت | فعّل "تثبيت من مصادر مجهولة" في الهاتف |

---

## 📄 الترخيص

MIT License - يمكنك الاستخدام التجاري بشرط الإشارة للمصدر

---

<div align="center">
صُنع بـ ❤️ للمجتمع العربي | BlogVerse 2025
</div>
