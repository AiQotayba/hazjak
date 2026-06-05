/**
 * اختبار سريع للتسجيل
 * شغله: node test-register.js
 */

const API_URL = 'http://localhost:5000/api';

async function testRegistration() {
  console.log('🧪 اختبار التسجيل...\n');

  const testData = {
    email: `test-${Date.now()}@example.com`,
    phone: '0963123456'
  };

  console.log('📤 إرسال البيانات:', testData);

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    console.log('📥 الاستجابة:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(result, null, 2));

    if (response.ok && result.token) {
      console.log('\n✅ نجح التسجيل!');
      console.log('Token:', result.token.substring(0, 30) + '...');
    } else {
      console.log('\n❌ فشل التسجيل!');
      console.log('Error:', result.message);
    }

  } catch (error) {
    console.log('\n❌ خطأ في الشبكة!');
    console.log('Error:', error.message);
  }
}

// اختبار التسجيل بدون بيانات
async function testRegistrationWithoutData() {
  console.log('\n🧪 اختبار التسجيل بدون بيانات...\n');

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });

    const result = await response.json();

    console.log('📥 الاستجابة:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(result, null, 2));

    if (response.status === 400) {
      console.log('\n✅ تم رفض البيانات الفارغة كما هو متوقع!');
    } else {
      console.log('\n❌ لم يتم التحقق من البيانات!');
    }

  } catch (error) {
    console.log('\n❌ خطأ في الشبكة!');
    console.log('Error:', error.message);
  }
}

// تشغيل الاختبارات
async function runTests() {
  console.log('🚀 بدء اختبارات التسجيل\n');

  await testRegistrationWithoutData();
  await testRegistration();

  console.log('\n✨ انتهت الاختبارات!');
}

runTests();