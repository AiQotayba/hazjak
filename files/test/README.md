# حجزك | Hazjak - منصة حجز الملاعب الخماسية

منصة حجز الملاعب الخماسية في مدينة حلب، مبنية بتقنيات حديثة لتسهيل عملية الحجز والإدارة.

## 🚀 المميزات

- **حجز سريع وسهل**: واجهة مستخدم بسيطة ومتجاوبة
- **جدول زمني تفاعلي**: عرض الأوقات المتاحة والمحجوزة
- **إدارة الحجوزات**: نظام متكامل لإدارة الحجوزات والمستخدمين
- **دعم متعدد اللغات**: دعم كامل للغة العربية
- **تصميم احترافي**: تصميم عصري باستخدام Tailwind CSS

## 🛠️ التقنيات المستخدمة

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Fonts**: Google Fonts (Cairo, Tajawal)
- **Architecture**: Modular JavaScript with API separation

## 📁 هيكل المشروع

```
hazjak/
├── index.html              # الصفحة الرئيسية
├── README.md               # ملف التوثيق
├── package.json            # إعدادات المشروع
├── api/
│   └── api.js              # واجهة برمجة التطبيقات
├── assets/
│   ├── css/
│   │   └── style.css       # ملفات التنسيق
│   ├── js/
│   │   └── script.js       # منطق التطبيق
│   └── images/             # الصور والأيقونات
└── artillery.yml           # إعدادات اختبار التحمل
```

## 🚀 التثبيت والتشغيل

### الطريقة التقليدية

1. **استنساخ المشروع**:
   ```bash
   git clone https://github.com/yourusername/hazjak.git
   cd hazjak
   ```

2. **تثبيت التبعيات**:
   ```bash
   npm install
   ```

3. **تشغيل الخادم المحلي**:
   ```bash
   npm start
   ```

4. **فتح المتصفح**:
   انتقل إلى `http://localhost:3000`

### باستخدام Docker

```bash
# بناء وتشغيل الحاويات
docker-compose up --build

# أو للتشغيل في الخلفية
docker-compose up -d --build
```

ثم افتح `http://localhost:8080`

### إيقاف Docker

```bash
docker-compose down
```

## 🔧 التطوير

### إعداد البيئة
- Node.js v16+
- npm أو yarn

### الأوامر المتاحة
```bash
npm start          # تشغيل الخادم المحلي
npm run build      # بناء المشروع للإنتاج
npm test           # تشغيل الاختبارات
npm run lint       # فحص الكود
npm run load-test  # اختبار التحمل
```

## 📡 API الخلفية

المشروع يستخدم API mock حاليًا. للربط بـ backend حقيقي:

1. استبدل الدوال في `api/api.js` باستدعاءات `fetch` أو `axios`
2. حدث `API_BASE_URL` في `api/api.js`
3. أضف معالجة الأخطاء المناسبة

### نقاط النهاية المطلوبة

```javascript
GET    /api/fields              # جلب قائمة الملاعب
GET    /api/fields/:id/bookings # جلب حجوزات ملعب معين
POST   /api/bookings            # إنشاء حجز جديد
POST   /api/users/register      # تسجيل مستخدم جديد
POST   /api/notifications/whatsapp # إرسال إشعار WhatsApp
```

## 🧪 اختبار التحمل

لاختبار قدرة الموقع على تحمل الضغط:

```bash
npm run load-test
```

هذا الأمر يشغل اختبار تحمل باستخدام Artillery، يرسل 100 طلب في الدقيقة لمدة 5 دقائق.

## 📱 المميزات المستقبلية

- [ ] تطبيق جوال (React Native)
- [ ] لوحة تحكم للمدراء
- [ ] نظام دفع متكامل
- [ ] إشعارات فورية
- [ ] تقييم الملاعب والمستخدمين

## 🤝 المساهمة

نرحب بالمساهمات! يرجى قراءة [دليل المساهمة](CONTRIBUTING.md) للمزيد من التفاصيل.

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 📞 التواصل

- **الموقع**: [hazjak.com](https://hazjak.com)
- **البريد الإلكتروني**: support@hazjak.com
- **الهاتف**: +963 999 000 000

---

**صنع بحب ❤️ من أجل الرياضة في حلب**