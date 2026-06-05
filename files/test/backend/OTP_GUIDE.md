# دليل استخدام OTP عبر WhatsApp 📱

## سير العملية الصحيح ✅

### الخطوة 1️⃣: التسجيل أولاً (Registration)

```bash
POST http://localhost:5000/api/register
Content-Type: application/json

{
  "email": "mohammad@example.com",
  "password": "password123",
  "phone": "0963123456"
}
```

**الاستجابة:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

✅ احفظ هذا الـ **Token** - ستحتاجه للخطوات التالية!

---

### الخطوة 2️⃣: طلب إرسال OTP

```bash
POST http://localhost:5000/api/whatsapp/send
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**مثال باستخدام JavaScript:**
```javascript
const token = "YOUR_TOKEN_HERE"; // الـ token من خطوة التسجيل

fetch('http://localhost:5000/api/whatsapp/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => {
  console.log('OTP:', data.otp); // للاختبار فقط - لا تطبعه في الإنتاج
  console.log('سيتم إرسال OTP إلى رقم هاتفك عبر WhatsApp');
});
```

**الاستجابة:**
```json
{
  "success": true,
  "message": "تم إرسال رمز التحقق عبر واتساب بنجاح",
  "email": "mohammad@example.com",
  "expiresIn": "10 دقائق",
  "otp": "123456"  // للاختبار فقط (انسخ هذا الـ OTP)
}
```

✅ **في الاختبار:** انسخ الـ OTP من الاستجابة (مثل: 123456)
✅ **الصلاحية:** 10 دقائق من وقت الطلب

---

### الخطوة 3️⃣: التحقق من OTP

```bash
POST http://localhost:5000/api/whatsapp/verify
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "otp": "123456"
}
```

**مثال باستخدام JavaScript:**
```javascript
const token = "YOUR_TOKEN_HERE";
const otp = "123456"; // الـ OTP الذي استقبلته

fetch('http://localhost:5000/api/whatsapp/verify', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ otp })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('✅ تم التحقق بنجاح! يمكنك الآن حجز الملعب');
  } else {
    console.log('❌ رمز خاطئ:', data.message);
    console.log('عدد المحاولات المتبقية:', data.remainingAttempts);
  }
});
```

**الاستجابة الناجحة:**
```json
{
  "success": true,
  "message": "تم التحقق بنجاح",
  "verified": true
}
```

**الاستجابة الفاشلة:**
```json
{
  "success": false,
  "message": "رمز التحقق غير صحيح",
  "remainingAttempts": 4
}
```

---

## الأخطاء الشائعة ❌

### ❌ خطأ 1: "No token found. Please login first"

**السبب:** لم تسجل دخول بعد

**الحل:**
```bash
# أولاً: سجل (Register) أو ادخل (Login)
POST http://localhost:5000/api/register

# احصل على الـ token من الاستجابة
# ثم استخدمه في الطلبات التالية
Authorization: Bearer TOKEN_HERE
```

---

### ❌ خطأ 2: "OTP Expired"

**السبب:** انتهت صلاحية الـ OTP (بعد 10 دقائق)

**الحل:**
```bash
# اطلب OTP جديد
POST http://localhost:5000/api/whatsapp/send
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### ❌ خطأ 3: "Too many failed attempts"

**السبب:** حاولت إدخال OTP خاطئ أكثر من 5 مرات

**الحل:**
```bash
# اطلب OTP جديد
POST http://localhost:5000/api/whatsapp/send
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## مثال عملي كامل (Node.js) 🎯

```javascript
const API_URL = 'http://localhost:5000/api';

// دالة للتسجيل
async function register(email, password, phone) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, phone })
  });
  
  const data = await res.json();
  return data.token; // احفظ الـ token
}

// دالة لطلب OTP
async function requestOTP(token) {
  const res = await fetch(`${API_URL}/whatsapp/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await res.json();
  return data.otp; // للاختبار فقط
}

// دالة للتحقق من OTP
async function verifyOTP(token, otp) {
  const res = await fetch(`${API_URL}/whatsapp/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ otp })
  });
  
  const data = await res.json();
  return data.success;
}

// سير العملية الكامل
async function fullOTPFlow() {
  try {
    // 1. التسجيل
    console.log('1️⃣ جاري التسجيل...');
    const token = await register('user@example.com', 'pass123', '0963123456');
    console.log('✅ تم التسجيل، الـ Token:', token);
    
    // 2. طلب OTP
    console.log('\n2️⃣ جاري طلب OTP...');
    const otp = await requestOTP(token);
    console.log('✅ تم إرسال OTP:', otp);
    
    // 3. التحقق
    console.log('\n3️⃣ جاري التحقق من OTP...');
    const verified = await verifyOTP(token, otp);
    console.log('✅ التحقق:', verified ? 'ناجح ✅' : 'فاشل ❌');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

// تشغيل
fullOTPFlow();
```

---

## مثال عملي كامل (HTML + JavaScript) 🌐

```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <title>OTP التحقق</title>
  <style>
    body { font-family: Arial; padding: 20px; direction: rtl; }
    .form { max-width: 400px; margin: 0 auto; }
    input, button { width: 100%; padding: 10px; margin: 5px 0; }
    button { background: #007bff; color: white; border: none; cursor: pointer; }
    .message { margin-top: 20px; padding: 10px; border-radius: 5px; }
    .success { background: #d4edda; color: #155724; }
    .error { background: #f8d7da; color: #721c24; }
  </style>
</head>
<body>
  <div class="form">
    <h2>التحقق عبر OTP 📱</h2>
    
    <!-- خطوة 1: التسجيل -->
    <div id="registerStep">
      <h3>الخطوة 1: التسجيل</h3>
      <input type="email" id="email" placeholder="البريد الإلكتروني">
      <input type="password" id="password" placeholder="كلمة المرور">
      <input type="tel" id="phone" placeholder="رقم الهاتف">
      <button onclick="handleRegister()">تسجيل</button>
    </div>
    
    <!-- خطوة 2: طلب OTP -->
    <div id="otpRequestStep" style="display:none;">
      <h3>الخطوة 2: طلب OTP</h3>
      <p>لقد تم تسجيلك بنجاح! اضغط الزر أدناه لاستقبال OTP</p>
      <button onclick="handleRequestOTP()">اطلب OTP</button>
    </div>
    
    <!-- خطوة 3: التحقق من OTP -->
    <div id="otpVerifyStep" style="display:none;">
      <h3>الخطوة 3: التحقق من OTP</h3>
      <input type="text" id="otp" placeholder="أدخل رمز التحقق (6 أرقام)">
      <button onclick="handleVerifyOTP()">تحقق</button>
    </div>
    
    <div id="message"></div>
  </div>

  <script>
    let userToken = null;
    const API_URL = 'http://localhost:5000/api';
    
    function showMessage(text, isSuccess) {
      const msg = document.getElementById('message');
      msg.textContent = text;
      msg.className = 'message ' + (isSuccess ? 'success' : 'error');
    }
    
    async function handleRegister() {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const phone = document.getElementById('phone').value;
      
      if (!email || !password || !phone) {
        showMessage('يرجى ملء جميع الحقول', false);
        return;
      }
      
      try {
        const res = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, phone })
        });
        
        const data = await res.json();
        if (data.token) {
          userToken = data.token;
          showMessage('✅ تم التسجيل بنجاح!', true);
          document.getElementById('registerStep').style.display = 'none';
          document.getElementById('otpRequestStep').style.display = 'block';
        } else {
          showMessage('❌ ' + data.message, false);
        }
      } catch (error) {
        showMessage('❌ خطأ: ' + error.message, false);
      }
    }
    
    async function handleRequestOTP() {
      try {
        const res = await fetch(`${API_URL}/whatsapp/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          }
        });
        
        const data = await res.json();
        if (data.success) {
          showMessage(`✅ تم إرسال OTP! (للاختبار: ${data.otp})`, true);
          document.getElementById('otpRequestStep').style.display = 'none';
          document.getElementById('otpVerifyStep').style.display = 'block';
        } else {
          showMessage('❌ ' + data.message, false);
        }
      } catch (error) {
        showMessage('❌ خطأ: ' + error.message, false);
      }
    }
    
    async function handleVerifyOTP() {
      const otp = document.getElementById('otp').value;
      
      if (!otp) {
        showMessage('يرجى إدخال OTP', false);
        return;
      }
      
      try {
        const res = await fetch(`${API_URL}/whatsapp/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify({ otp })
        });
        
        const data = await res.json();
        if (data.success) {
          showMessage('✅ تم التحقق بنجاح! يمكنك الآن حجز الملعب', true);
          document.getElementById('otpVerifyStep').style.display = 'none';
        } else {
          showMessage(`❌ ${data.message} (محاولات متبقية: ${data.remainingAttempts})`, false);
        }
      } catch (error) {
        showMessage('❌ خطأ: ' + error.message, false);
      }
    }
  </script>
</body>
</html>
```

---

## ملخص المتطلبات ✅

| الخطوة | الـ Endpoint | الطريقة | يحتاج Token |
|-------|-----------|--------|-----------|
| 1. التسجيل | `/api/register` | POST | ❌ لا |
| 2. طلب OTP | `/api/whatsapp/send` | POST | ✅ نعم |
| 3. التحقق من OTP | `/api/whatsapp/verify` | POST | ✅ نعم |

---

## ملاحظات مهمة 📌

1. **الـ Token مطلوب**: جميع طلبات OTP تحتاج الـ Token في الـ Header
   ```
   Authorization: Bearer YOUR_TOKEN_HERE
   ```

2. **صيغة الـ Token الصحيحة**: `Bearer ` + المسافة + الـ Token
   ```javascript
   'Authorization': `Bearer ${token}`
   ```

3. **الصلاحية**: كل OTP يصلح لمدة 10 دقائق فقط

4. **المحاولات**: 5 محاولات كحد أقصى لإدخال OTP خاطئ

5. **في الإنتاج**: احذف `otp` من الاستجابة (اطبعه فقط في الـ console من الـ Backend)

