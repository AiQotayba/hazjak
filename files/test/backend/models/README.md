# ملخص نموذج البيانات للحجوزات

## تم إنجازه ✓

### 1. نموذج البيانات (Data Model)
**الملف**: `backend/models/Booking.js`

تم إنشاء فئة `Booking` شاملة تتضمن:

#### الحقول المطلوبة:
- ✓ `bookingId` - معرف عشوائي فريد (صيغة: BK-{timestamp}-{random})
- ✓ `playgroundId` - معرف الملعب
- ✓ `playgroundName` - اسم الملعب
- ✓ `userName` - اسم المستخدم
- ✓ `userFatherName` - اسم الأب
- ✓ `userEmail` - البريد الإلكتروني
- ✓ `userPhone` - رقم الهاتف
- ✓ `date` - التاريخ (صيغة YYYY-MM-DD)
- ✓ `startTime` - وقت البدء (صيغة HH:MM مثل 20:00)
- ✓ `endTime` - وقت الانتهاء (صيغة HH:MM مثل 21:00)
- ✓ `status` - حالة الحجز (pending, confirmed, cancelled)
- ✓ `createdAt` - وقت الإنشاء (ISO 8601)

#### الميزات الإضافية:
- ✓ التحقق من صحة البيانات (Validation)
  - تنسيق التاريخ والوقت
  - قيم الحالة المسموحة
  
- ✓ كشف التضارب الزمني (Conflict Detection)
  - تحديد الحجوزات المتضاربة تلقائياً
  - دعم منطق التحقق من الأوقات
  
- ✓ طرق مساعدة:
  - `getDurationMinutes()` - حساب مدة الحجز
  - `updateStatus()` - تحديث حالة الحجز
  - `toJSON()` - تحويل البيانات إلى JSON

---

### 2. API Endpoints المحدثة
**الملف**: `backend/server.js`

#### Endpoints الجديدة والمحدثة:

1. **POST /api/bookings** - إنشاء حجز جديد
   - الحقول المطلوبة: جميع حقول الحجز
   - التحقق: صحة البيانات والتضارب الزمني
   - الاستجابة: تفاصيل الحجز الكامل مع bookingId

2. **GET /api/bookings** - الحصول على جميع الحجوزات
   - المصادقة: مطلوبة (Bearer Token)
   - الاستجابة: قائمة بجميع الحجوزات مع العدد

3. **GET /api/bookings/:bookingId** - الحصول على حجز محدد
   - المصادقة: مطلوبة
   - الاستجابة: تفاصيل الحجز

4. **GET /api/bookings/playground/:playgroundId** - حجوزات ملعب معين
   - بدون مصادقة
   - الاستجابة: قائمة حجوزات الملعب

5. **PATCH /api/bookings/:bookingId/status** - تحديث حالة الحجز
   - المصادقة: مطلوبة
   - الحقل المطلوب: status (pending/confirmed/cancelled)

6. **DELETE /api/bookings/:bookingId** - حذف/إلغاء حجز
   - المصادقة: مطلوبة
   - الاستجابة: تفاصيل الحجز المحذوف

---

### 3. التوثيق (Documentation)
**الملف**: `backend/models/BOOKING_DOCUMENTATION.md`

يتضمن:
- ✓ شرح جميع الحقول والأنواع
- ✓ توثيق جميع الـ Endpoints مع أمثلة
- ✓ أمثلة عملية على الاستخدام
- ✓ شرح التحقق من البيانات
- ✓ شرح كشف التضارب الزمني

---

### 4. أمثلة عملية (Examples)
**الملف**: `backend/models/BookingExamples.js`

يحتوي على 9 أمثلة عملية:
1. ✓ إنشاء حجز بسيط
2. ✓ إنشاء حجز مع حالة مؤكدة
3. ✓ معالجة خطأ - تاريخ غير صحيح
4. ✓ معالجة خطأ - وقت غير صحيح
5. ✓ معالجة خطأ - حالة غير صحيحة
6. ✓ تحديث حالة الحجز
7. ✓ كشف التضارب الزمني
8. ✓ حسابات المدة
9. ✓ تحويل إلى JSON

---

## هيكل الملفات الجديد

```
backend/
├── server.js                 # الـ Server الرئيسي (محدث)
└── models/
    ├── Booking.js            # نموذج البيانات للحجوزات
    ├── BookingExamples.js   # أمثلة عملية
    └── BOOKING_DOCUMENTATION.md  # التوثيق الشامل
```

---

## كيفية الاستخدام

### 1. تشغيل الـ Server
```bash
cd backend
npm install  # إذا لم تكن المكتبات مثبتة
node server.js
```

### 2. اختبار الأمثلة
```bash
node models/BookingExamples.js
```

### 3. استخدام API في التطبيق
```javascript
// إنشاء حجز
const response = await fetch('http://localhost:5000/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    playgroundId: 1,
    playgroundName: 'ملعب الأولمبي الخماسي',
    userName: 'محمد',
    userFatherName: 'علي',
    userEmail: 'mohammad@example.com',
    userPhone: '0963123456',
    date: '2026-05-15',
    startTime: '20:00',
    endTime: '21:00'
  })
});

const data = await response.json();
console.log('معرف الحجز:', data.bookingId);
```

---

## ملاحظات مهمة

1. **التحقق التلقائي**: جميع البيانات يتم التحقق منها تلقائياً عند الإنشاء
2. **الأمان**: استخدم توكن JWT لجميع الطلبات المحمية
3. **التضارب**: النظام يكتشف تلقائياً الحجوزات المتضاربة
4. **المدة**: يتم حسابها تلقائياً بناءً على الأوقات
5. **معرف الحجز**: فريد وعشوائي لكل حجز جديد

---

## الخطوات التالية المقترحة

- [ ] إضافة قاعدة بيانات (MongoDB, PostgreSQL, etc.)
- [ ] إضافة التحقق من بيانات البريد الإلكتروني
- [ ] إضافة إشعارات (Email, SMS, WhatsApp)
- [ ] إضافة نموذج Payment/Deposit
- [ ] إضافة System Logs والـ Audit Trail
- [ ] اختبار شامل (Unit Tests, Integration Tests)

