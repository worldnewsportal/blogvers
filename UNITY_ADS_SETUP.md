# 🎮 دليل Unity Ads الكامل — BlogVerse
## إعداد كل أنواع الإعلانات لأقصى أرباح

---

## 📊 أنواع الإعلانات المُدمجة

| النوع | الوصف | CPM المتوقع | أين يظهر |
|-------|-------|------------|----------|
| **Banner** | شريط إعلاني ثابت | $0.5–$2 | الرئيسية، أسفل المقالات |
| **Large Banner** | شريط كبير | $1–$3 | بين المقالات |
| **Medium Rectangle** | مستطيل 300×250 | $2–$5 | منتصف المقال |
| **Interstitial** | كامل الشاشة | $5–$15 | عند التنقل (كل 4 تنقلات) |
| **Rewarded Video** | فيديو مكافأة | $10–$30 | فتح محتوى مميز |
| **Rewarded Interstitial** | بيني + مكافأة | $15–$40 | نهاية المقال (عند 70%) |

> **⚡ أعلى CPM:** Rewarded Interstitial لأنه يجمع تفاعل المستخدم + مساحة الشاشة الكاملة

---

## 🚀 الخطوات الكاملة للإعداد

### 1. إنشاء حساب Unity Ads

1. اذهب إلى **[unity.com/solutions/unity-ads](https://unity.com/solutions/unity-ads)**
2. اضغط **Get Started** → أنشئ حساباً مجانياً
3. أنشئ **Organization** جديدة

### 2. إنشاء مشروع في Unity Dashboard

1. اذهب إلى **[dashboard.unity3d.com](https://dashboard.unity3d.com)**
2. اضغط **Create Project**
3. اختر **Monetization** كنوع المشروع
4. **لا تحتاج لرفع أي كود Unity** — فقط مشروع إعلانات

### 3. إعداد التطبيق

1. في Dashboard: **Monetize → Unity Ads → Setup**
2. أضف تطبيقك:
   - **Android:** أدخل Package ID: `com.blogverse.app`
   - **iOS:** أدخل Bundle ID: `com.blogverse.app`
3. ستحصل على **Game ID** لكل منصة

### 4. إنشاء Ad Placements (أماكن الإعلانات)

في **Monetize → Ad Units → Create Ad Unit**:

| الاسم المطلوب | النوع | الإعداد |
|--------------|-------|---------|
| `Banner_Android` | Banner | Size: Adaptive |
| `Interstitial_Android` | Interstitial | Allow skip: 5s |
| `Rewarded_Android` | Rewarded Video | Reward: 1 unit |
| `RewardedInterstitial_Android` | Rewarded Interstitial | Allow skip: No |

> كرّر نفس الشيء لـ iOS مع استبدال `Android` بـ `iOS`

### 5. إضافة Secrets في GitHub

في مستودعك: **Settings → Secrets → Actions → New secret**

```
UNITY_GAME_ID_ANDROID         → الرقم من Unity Dashboard (مثال: 5139735)
UNITY_GAME_ID_IOS             → الرقم من Unity Dashboard (مثال: 5139732)
UNITY_BANNER_PLACEMENT        → Banner_Android
UNITY_INTERSTITIAL_PLACEMENT  → Interstitial_Android
UNITY_REWARDED_PLACEMENT      → Rewarded_Android
UNITY_REWARDED_INTERSTITIAL_PLACEMENT → RewardedInterstitial_Android
```

### 6. تحديث app.json

```json
"extra": {
  "unityGameIdAndroid": "YOUR_ANDROID_GAME_ID",
  "unityGameIdIos": "YOUR_IOS_GAME_ID",
  "unityTestMode": false,
  "unityBannerPlacementId": "Banner_Android",
  "unityInterstitialPlacementId": "Interstitial_Android",
  "unityRewardedPlacementId": "Rewarded_Android",
  "unityRewardedInterstitialPlacementId": "RewardedInterstitial_Android"
}
```

---

## 💰 استراتيجيات زيادة الأرباح

### 🎯 استراتيجية الترتيب الذكي

```
الرئيسية:
├── بانر أسفل البحث               (Banner)
├── InFeedAd كل 3 مقالات          (Rewarded Video)
└── MediumRectangle كل 6 مقالات  (Medium Rectangle)

تفاصيل المقال:
├── MediumRectangle منتصف المقال  (أعلى CTR)
├── زر مكافأة "افتح المحتوى"      (Rewarded Video)
├── بطاقة RI عند 70% قراءة        (Rewarded Interstitial ← أعلى CPM)
└── Banner أسفل المقال            (Banner)

التنقل بين الصفحات:
└── Interstitial كل 4 تنقلات     (Interstitial)
```

### 📈 نصائح لأعلى Fill Rate

1. **فعّل كل الدول** في Unity Dashboard — لا تحدد مناطق
2. **استخدم Mediation** عبر Unity LevelPlay (مجاني) لإضافة شبكات أخرى
3. **أضف شبكة ironSource** عبر LevelPlay لرفع Fill Rate 40%+
4. **فعّل COPPA compliance** إذا توقعت مستخدمين صغاراً

### 🔧 إعداد Unity LevelPlay (Mediation) للحد الأقصى

1. في Dashboard: **Monetize → LevelPlay → Set up mediation**
2. أضف شبكات:
   - ✅ **Meta Audience Network** (أعلى eCPM)
   - ✅ **AppLovin**
   - ✅ **Vungle**
   - ✅ **AdColony**
   - ✅ **Chartboost**
3. هذا يرفع الأرباح **30–70%** تلقائياً بدون تغيير الكود

---

## 🧪 وضع الاختبار

في وضع التطوير (`__DEV__ = true`) يستخدم التطبيق تلقائياً:
- **Android Test Game ID:** `5139735`  
- **iOS Test Game ID:** `5139732`

لاختبار إعلانات حقيقية في Production:
```javascript
// في src/services/unityAdsService.js
const IS_TEST = false; // غيّر إلى false
```

---

## 📋 قائمة التحقق قبل النشر

- [ ] Game IDs حقيقية في `app.json`
- [ ] `unityTestMode: false` في `app.json`
- [ ] Placement IDs تطابق Unity Dashboard
- [ ] تم اختبار كل نوع إعلان على جهاز حقيقي
- [ ] LevelPlay Mediation مُفعَّل
- [ ] GDPR Consent مُعدّ (مطلوب لمستخدمي أوروبا)
- [ ] Payment info مُضاف في Unity Dashboard

---

## ❓ استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| الإعلانات لا تظهر | تأكد من `IS_TEST = true` في DEV، `false` في Production |
| Fill Rate منخفض | فعّل LevelPlay Mediation |
| Banner لا يُحمَّل | تأكد من صحة Placement ID في Dashboard |
| Rewarded لا يظهر | انتظر تحميل الإعلان (يظهر مؤشر تحميل تلقائياً) |
| إعلانات بطيئة | الإعلانات تُحمَّل مسبقاً — تأكد من اتصال الإنترنت |

---

## 💵 تقدير الأرباح الشهرية

| عدد المستخدمين النشطين | الأرباح المتوقعة |
|----------------------|----------------|
| 1,000 مستخدم/يوم | $50–$200/شهر |
| 10,000 مستخدم/يوم | $500–$2,000/شهر |
| 100,000 مستخدم/يوم | $5,000–$20,000/شهر |

> الأرقام تعتمد على: المنطقة الجغرافية، معدل التفاعل، نوع المحتوى
> المستخدمون من USA/EU/UK يحققون أعلى eCPM بفارق كبير

---

*البيانات في وضع الاختبار لا تُحتسب في أرباح حقيقية*
