/**
 * اختبار كامل لـ OTP Authentication
 * شغله: node otp-test.js
 */

const API_URL = 'http://localhost:5000/api';

// الألوان للطباعة
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========================================
// الاختبارات
// ========================================

async function testOTPFlow() {
  log('\n╔════════════════════════════════════════════╗', 'blue');
  log('║   اختبار كامل لـ OTP Authentication      ║', 'blue');
  log('╚════════════════════════════════════════════╝\n', 'blue');
  
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'TestPass123',
    phone: '0963123456'
  };
  
  try {
    // 1️⃣ التسجيل
    log('\n1️⃣  اختبار التسجيل (Registration)', 'cyan');
    log('─────────────────────────────────────', 'cyan');
    
    const registerRes = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const registerData = await registerRes.json();
    
    if (!registerData.token) {
      log('❌ فشل التسجيل', 'red');
      log(`السبب: ${registerData.message}`, 'red');
      return;
    }
    
    const token = registerData.token;
    log('✅ تم التسجيل بنجاح', 'green');
    log(`البريد: ${testUser.email}`, 'yellow');
    log(`الـ Token: ${token.substring(0, 30)}...`, 'yellow');
    
    // 2️⃣ طلب OTP
    log('\n2️⃣  اختبار طلب OTP (Request OTP)', 'cyan');
    log('─────────────────────────────────────', 'cyan');
    
    const otpRequestRes = await fetch(`${API_URL}/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const otpRequestData = await otpRequestRes.json();
    
    if (!otpRequestData.success) {
      log('❌ فشل طلب OTP', 'red');
      log(`السبب: ${otpRequestData.message}`, 'red');
      return;
    }
    
    const otp = otpRequestData.otp;
    log('✅ تم إرسال OTP بنجاح', 'green');
    log(`OTP: ${otp}`, 'yellow');
    log(`الصلاحية: ${otpRequestData.expiresIn}`, 'yellow');
    
    // 3️⃣ التحقق من OTP (صحيح)
    log('\n3️⃣  اختبار التحقق من OTP الصحيح (Verify Correct OTP)', 'cyan');
    log('─────────────────────────────────────', 'cyan');
    
    const verifyRes = await fetch(`${API_URL}/whatsapp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ otp })
    });
    
    const verifyData = await verifyRes.json();
    
    if (!verifyData.success) {
      log('❌ فشل التحقق', 'red');
      log(`السبب: ${verifyData.message}`, 'red');
      return;
    }
    
    log('✅ تم التحقق بنجاح', 'green');
    log('يمكنك الآن حجز الملعب', 'green');
    
    // 4️⃣ اختبار OTP خاطئ
    log('\n4️⃣  اختبار OTP خاطئ (Verify Wrong OTP)', 'cyan');
    log('─────────────────────────────────────', 'cyan');
    
    // اطلب OTP جديد أولاً
    const newOtpRes = await fetch(`${API_URL}/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const newOtpData = await newOtpRes.json();
    const wrongOtp = '000000'; // OTP خاطئ
    
    const wrongVerifyRes = await fetch(`${API_URL}/whatsapp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ otp: wrongOtp })
    });
    
    const wrongVerifyData = await wrongVerifyRes.json();
    
    if (wrongVerifyData.success) {
      log('⚠️  لم يتم اكتشاف OTP خاطئ (غير متوقع)', 'yellow');
    } else {
      log('✅ تم اكتشاف OTP خاطئ كما هو متوقع', 'green');
      log(`الرسالة: ${wrongVerifyData.message}`, 'yellow');
      log(`المحاولات المتبقية: ${wrongVerifyData.remainingAttempts}`, 'yellow');
    }
    
    // 5️⃣ اختبار بدون Token
    log('\n5️⃣  اختبار بدون Token (No Token)', 'cyan');
    log('─────────────────────────────────────', 'cyan');
    
    const noTokenRes = await fetch(`${API_URL}/whatsapp/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
      // بدون Authorization header
    });
    
    const noTokenData = await noTokenRes.json();
    
    if (!noTokenRes.ok) {
      log('✅ تم رفض الطلب (كما هو متوقع)', 'green');
      log(`الرسالة: ${noTokenData.message}`, 'yellow');
    } else {
      log('⚠️  تم قبول الطلب بدون Token (غير متوقع)', 'yellow');
    }
    
    // ملخص النتائج
    log('\n╔════════════════════════════════════════════╗', 'blue');
    log('║           ✅ اكتملت جميع الاختبارات      ║', 'blue');
    log('╚════════════════════════════════════════════╝\n', 'blue');
    
  } catch (error) {
    log(`\n❌ حدث خطأ: ${error.message}`, 'red');
  }
}

// تشغيل الاختبارات
testOTPFlow();
