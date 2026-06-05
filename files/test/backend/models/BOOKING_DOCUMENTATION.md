# نموذج البيانات للحجوزات (Booking Model)

## نظرة عامة

نموذج `Booking` يوفر بنية كاملة وآمنة لإدارة حجوزات الملاعب الخماسية مع التحقق من صحة البيانات وكشف التضارب.

## بيانات الحجز (Booking Fields)

### 1. **معرف الحجز (bookingId)**
- **النوع**: String
- **التوليد**: عشوائي تلقائياً
- **الصيغة**: `BK-{timestamp}-{random}`
- **مثال**: `BK-1715600000000-a7f3c2e1`
- **الوصف**: معرف فريد لكل حجز يتم توليده تلقائياً

### 2. **بيانات الملعب**
- **playgroundId** (Number): معرف الملعب
  - مثال: `1`
- **playgroundName** (String): اسم الملعب
  - مثال: `"ملعب الأولمبي الخماسي"`

### 3. **بيانات المستخدم**
- **userName** (String): اسم المستخدم
  - مثال: `"محمد"`
- **userFatherName** (String): اسم الأب
  - مثال: `"علي"`
- **userEmail** (String): البريد الإلكتروني
  - مثال: `"mohammad@example.com"`
- **userPhone** (String): رقم الهاتف
  - مثال: `"0963123456"`

### 4. **بيانات الحجز الزمنية**
- **date** (String): التاريخ بصيغة YYYY-MM-DD
  - مثال: `"2026-05-15"`
  - التحقق: يجب أن يكون التاريخ صالحاً
  
- **startTime** (String): وقت البدء بصيغة HH:MM (24 ساعة)
  - مثال: `"20:00"` (الساعة 8 مساءً)
  - التحقق: يجب أن يكون الوقت بين 00:00 و 23:59
  
- **endTime** (String): وقت الانتهاء بصيغة HH:MM (24 ساعة)
  - مثال: `"21:00"` (الساعة 9 مساءً)
  - التحقق: يجب أن يكون الوقت بين 00:00 و 23:59

### 5. **حالة الحجز (status)**
- **النوع**: String
- **القيم المسموحة**:
  - `"pending"`: حجز قيد الانتظار (افتراضي)
  - `"confirmed"`: حجز مؤكد
  - `"cancelled"`: حجز ملغى
- **مثال**: `"pending"`

### 6. **وقت الإنشاء (createdAt)**
- **النوع**: String (ISO 8601 format)
- **التوليد**: تلقائي عند الإنشاء
- **مثال**: `"2026-05-13T14:30:45.123Z"`

---

## الـ API Endpoints

### 1. **إنشاء حجز جديد**
```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "playgroundId": 1,
  "playgroundName": "ملعب الأولمبي الخماسي",
  "userName": "محمد",
  "userFatherName": "علي",
  "userEmail": "mohammad@example.com",
  "userPhone": "0963123456",
  "date": "2026-05-15",
  "startTime": "20:00",
  "endTime": "21:00"
}
```

**الاستجابة الناجحة (201):**
```json
{
  "message": "تم إنشاء الحجز بنجاح",
  "booking": {
    "bookingId": "BK-1715600000000-a7f3c2e1",
    "playgroundId": 1,
    "playgroundName": "ملعب الأولمبي الخماسي",
    "userName": "محمد",
    "userFatherName": "علي",
    "userEmail": "mohammad@example.com",
    "userPhone": "0963123456",
    "date": "2026-05-15",
    "startTime": "20:00",
    "endTime": "21:00",
    "durationMinutes": 60,
    "status": "pending",
    "createdAt": "2026-05-13T14:30:45.123Z"
  },
  "bookingId": "BK-1715600000000-a7f3c2e1"
}
```

**الخطأ - حجوزات متضاربة (409):**
```json
{
  "message": "توجد حجوزات متضاربة في هذا الوقت",
  "conflictDetails": {
    "playgroundId": 1,
    "date": "2026-05-15",
    "startTime": "20:00",
    "endTime": "21:00"
  }
}
```

### 2. **الحصول على جميع الحجوزات**
```http
GET /api/bookings
Authorization: Bearer <token>
```

**الاستجابة:**
```json
{
  "count": 5,
  "bookings": [
    {
      "bookingId": "BK-1715600000000-a7f3c2e1",
      "playgroundId": 1,
      "playgroundName": "ملعب الأولمبي الخماسي",
      ...
    }
  ]
}
```

### 3. **الحصول على حجز محدد**
```http
GET /api/bookings/:bookingId
Authorization: Bearer <token>
```

**مثال:**
```http
GET /api/bookings/BK-1715600000000-a7f3c2e1
```

### 4. **الحصول على حجوزات ملعب معين**
```http
GET /api/bookings/playground/:playgroundId
```

**مثال:**
```http
GET /api/bookings/playground/1
```

### 5. **تحديث حالة الحجز**
```http
PATCH /api/bookings/:bookingId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"
}
```

**القيم المسموحة**: `pending`, `confirmed`, `cancelled`

### 6. **حذف/إلغاء حجز**
```http
DELETE /api/bookings/:bookingId
Authorization: Bearer <token>
```

---

## أمثلة عملية

### مثال 1: إنشاء حجز جديد

```javascript
const bookingData = {
  playgroundId: 1,
  playgroundName: "ملعب الأولمبي الخماسي",
  userName: "محمد",
  userFatherName: "علي",
  userEmail: "mohammad@example.com",
  userPhone: "0963123456",
  date: "2026-05-15",
  startTime: "20:00",
  endTime: "21:00"
};

fetch('http://localhost:5000/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify(bookingData)
})
.then(res => res.json())
.then(data => {
  if (data.booking) {
    console.log('تم إنشاء الحجز:', data.booking.bookingId);
  } else {
    console.error('خطأ:', data.message);
  }
});
```

### مثال 2: التحقق من التضارب الزمني

إذا حاولت حجز الملعب في نفس الوقت الذي يوجد فيه حجز آخر:

```javascript
// محاولة حجز من 20:00 إلى 21:00 (مشغول)
// ستحصل على خطأ: "توجد حجوزات متضاربة في هذا الوقت"

// لكن يمكنك حجز من 21:00 إلى 22:00 (متاح)
// لأنه لا يوجد تضارب زمني
```

### مثال 3: تحديث حالة الحجز

```javascript
fetch('http://localhost:5000/api/bookings/BK-1715600000000-a7f3c2e1/status', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({ status: 'confirmed' })
})
.then(res => res.json())
.then(data => console.log('تم التحديث:', data.booking));
```

---

## التحقق من البيانات

### التاريخ (Date)
- **الصيغة**: YYYY-MM-DD
- **التحقق**: يجب أن يكون التاريخ صالحاً
- **أمثلة صحيحة**: `2026-05-15`, `2026-12-31`
- **أمثلة خاطئة**: `15-05-2026`, `2026/05/15`, `invalid`

### الوقت (Time)
- **الصيغة**: HH:MM (24 ساعة)
- **النطاق**: من 00:00 إلى 23:59
- **أمثلة صحيحة**: `09:30`, `20:00`, `23:59`
- **أمثلة خاطئة**: `9:30`, `20:00:00`, `25:00`

### حالة الحجز (Status)
- **القيم المسموحة فقط**: `pending`, `confirmed`, `cancelled`
- **أمثلة خاطئة**: `booked`, `pending_confirmation`, `Confirmed`

---

## كشف التضارب الزمني

النظام يكتشف تلقائياً التضارب عندما:
- نفس الملعب (playgroundId)
- نفس التاريخ (date)
- الأوقات متداخلة (overlapping times)
- الحجز غير ملغى (status !== 'cancelled')

### أمثلة على التضارب:
```
الحجز الموجود: 20:00 - 21:00
محاولة حجز: 20:30 - 21:30  ❌ متضارب
محاولة حجز: 19:30 - 20:30  ❌ متضارب
محاولة حجز: 20:00 - 21:00  ❌ متضارب

محاولة حجز: 21:00 - 22:00  ✅ متاح
محاولة حجز: 19:00 - 20:00  ✅ متاح
```

---

## ملاحظات مهمة

1. **التوثيق**: جميع الطلبات تتطلب توكن JWT في الـ Header
   ```
   Authorization: Bearer <token>
   ```

2. **معرف الحجز**: يتم توليده تلقائياً ولا يمكن تغييره

3. **وقت الإنشاء**: يتم ضبطه تلقائياً عند الإنشاء

4. **الحالة الافتراضية**: جميع الحجوزات الجديدة تبدأ بحالة `pending`

5. **مدة الحجز**: يتم حسابها تلقائياً بناءً على startTime و endTime

