# دليل المساهمة في مشروع حجزك

شكرًا لاهتمامك بالمساهمة في مشروع حجزك! نحن نقدر مساعدتك في تطوير منصة حجز الملاعب الخماسية في حلب.

## 🚀 كيفية المساهمة

### 1. إعداد البيئة المحلية

```bash
# استنساخ المشروع
git clone https://github.com/yourusername/hazjak.git
cd hazjak

# تثبيت التبعيات
npm install

# تشغيل الخادم المحلي
npm start
```

### 2. فهم هيكل المشروع

```
hazjak/
├── index.html              # الصفحة الرئيسية
├── api/
│   └── api.js              # API المحاكي
├── assets/
│   ├── css/
│   │   └── style.css       # الأنماط المخصصة
│   ├── js/
│   │   └── script.js       # منطق التطبيق
│   └── images/             # الصور
├── artillery.yml           # اختبار التحمل
├── load-test.ps1           # سكريبت اختبار التحمل
└── package.json            # إعدادات المشروع
```

### 3. إنشاء فرع جديد

```bash
# إنشاء فرع جديد
git checkout -b feature/your-feature-name

# أو لإصلاح خطأ
git checkout -b fix/issue-description
```

### 4. إجراء التغييرات

- اتبع معايير الكود الموجودة
- استخدم أسماء متغيرات واضحة باللغة العربية أو الإنجليزية
- أضف تعليقات للكود المعقد
- اختبر التغييرات محليًا

### 5. إرسال التغييرات

```bash
# إضافة الملفات المعدلة
git add .

# إنشاء commit مع رسالة واضحة
git commit -m "Add: وصف التغيير المضاف"

# رفع التغييرات
git push origin feature/your-feature-name
```

### 6. إنشاء Pull Request

1. انتقل إلى GitHub وأنشئ Pull Request
2. وصف التغييرات بوضوح
3. ربط أي issues ذات صلة
4. انتظار المراجعة

## 📝 معايير الكود

### JavaScript
- استخدم ES6+ features
- أضف تعليقات JSDoc للوظائف المهمة
- استخدم async/await للعمليات غير المتزامنة
- فصل الاهتمامات (separation of concerns)

### CSS
- استخدم Tailwind CSS classes
- أضف custom styles في `assets/css/style.css`
- حافظ على التناسق مع التصميم العام

### HTML
- استخدم semantic HTML
- أضف ARIA attributes للوصولية
- حافظ على دعم RTL

## 🧪 الاختبار

### اختبار الوظائف
- اختبر جميع المميزات الجديدة
- تأكد من عدم كسر الوظائف الموجودة
- اختبر على مختلف المتصفحات

### اختبار التحمل
```bash
npm run load-test
```

## 📋 أنواع المساهمات

### 🐛 إصلاح الأخطاء
- إصلاح الأخطاء الموجودة
- تحسين معالجة الأخطاء
- إصلاح مشاكل الأداء

### ✨ مميزات جديدة
- إضافة وظائف جديدة
- تحسين واجهة المستخدم
- تحسين تجربة المستخدم

### 📚 التوثيق
- تحسين ملف README
- إضافة تعليقات للكود
- إنشاء دليل المستخدم

### 🎨 التصميم
- تحسين التصميم العام
- إضافة animations
- تحسين الاستجابة

## 📞 التواصل

- **Issues**: [GitHub Issues](https://github.com/yourusername/hazjak/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/hazjak/discussions)
- **Email**: support@hazjak.com

## 📜 اتفاقية الترخيص

بمساهمتك في هذا المشروع، توافق على أن مساهماتك مرخصة تحت رخصة MIT.

---

**نشكرك على مساهمتك في تطوير منصة حجزك! 🎉**