/**
 * أمثلة على استخدام نموذج الحجوزات (Booking Model Examples)
 * يمكن استخدام هذه الأمثلة للاختبار والتطوير
 */

const Booking = require('./Booking');

// ============================================
// مثال 1: إنشاء حجز بسيط
// ============================================
console.log('=== مثال 1: إنشاء حجز بسيط ===');

try {
  const booking1 = new Booking({
    playgroundId: 1,
    playgroundName: 'ملعب الأولمبي الخماسي',
    userName: 'محمد',
    userFatherName: 'علي',
    userEmail: 'mohammad@example.com',
    userPhone: '0963123456',
    date: '2026-05-15',
    startTime: '20:00',
    endTime: '21:00'
  });

  console.log('✓ تم إنشاء الحجز بنجاح');
  console.log('معرف الحجز:', booking1.bookingId);
  console.log('الحالة:', booking1.status);
  console.log('المدة:', booking1.getDurationMinutes(), 'دقيقة');
  console.log(JSON.stringify(booking1.toJSON(), null, 2));
} catch (error) {
  console.error('✗ خطأ:', error.message);
}

// ============================================
// مثال 2: إنشاء حجز مع حالة مؤكدة
// ============================================
console.log('\n=== مثال 2: إنشاء حجز مع حالة مؤكدة ===');

try {
  const booking2 = new Booking({
    playgroundId: 2,
    playgroundName: 'أكاديمية النجوم',
    userName: 'علي',
    userFatherName: 'محمد',
    userEmail: 'ali@example.com',
    userPhone: '0963654321',
    date: '2026-05-16',
    startTime: '18:30',
    endTime: '19:30',
    status: 'confirmed'
  });

  console.log('✓ تم إنشاء الحجز مع حالة مؤكدة');
  console.log('الحالة:', booking2.status);
} catch (error) {
  console.error('✗ خطأ:', error.message);
}

// ============================================
// مثال 3: خطأ - تاريخ غير صحيح
// ============================================
console.log('\n=== مثال 3: خطأ - تاريخ غير صحيح ===');

try {
  const bookingBad1 = new Booking({
    playgroundId: 1,
    playgroundName: 'ملعب الأولمبي الخماسي',
    userName: 'محمد',
    userFatherName: 'علي',
    userEmail: 'mohammad@example.com',
    userPhone: '0963123456',
    date: '15-05-2026', // صيغة خاطئة
    startTime: '20:00',
    endTime: '21:00'
  });
} catch (error) {
  console.error('✓ تم اكتشاف الخطأ كما متوقع:', error.message);
}

// ============================================
// مثال 4: خطأ - وقت غير صحيح
// ============================================
console.log('\n=== مثال 4: خطأ - وقت غير صحيح ===');

try {
  const bookingBad2 = new Booking({
    playgroundId: 1,
    playgroundName: 'ملعب الأولمبي الخماسي',
    userName: 'محمد',
    userFatherName: 'علي',
    userEmail: 'mohammad@example.com',
    userPhone: '0963123456',
    date: '2026-05-15',
    startTime: '25:00', // وقت غير صحيح
    endTime: '26:00'
  });
} catch (error) {
  console.error('✓ تم اكتشاف الخطأ كما متوقع:', error.message);
}

// ============================================
// مثال 5: خطأ - حالة غير صحيحة
// ============================================
console.log('\n=== مثال 5: خطأ - حالة غير صحيحة ===');

try {
  const bookingBad3 = new Booking({
    playgroundId: 1,
    playgroundName: 'ملعب الأولمبي الخماسي',
    userName: 'محمد',
    userFatherName: 'علي',
    userEmail: 'mohammad@example.com',
    userPhone: '0963123456',
    date: '2026-05-15',
    startTime: '20:00',
    endTime: '21:00',
    status: 'invalid_status' // حالة غير صحيحة
  });
} catch (error) {
  console.error('✓ تم اكتشاف الخطأ كما متوقع:', error.message);
}

// ============================================
// مثال 6: تحديث حالة الحجز
// ============================================
console.log('\n=== مثال 6: تحديث حالة الحجز ===');

try {
  const booking3 = new Booking({
    playgroundId: 3,
    playgroundName: 'ملعب القمة',
    userName: 'سارة',
    userFatherName: 'أحمد',
    userEmail: 'sarah@example.com',
    userPhone: '0963999999',
    date: '2026-05-17',
    startTime: '17:00',
    endTime: '18:00'
  });

  console.log('الحالة الأولية:', booking3.status);
  booking3.updateStatus('confirmed');
  console.log('الحالة بعد التحديث:', booking3.status);
  booking3.updateStatus('cancelled');
  console.log('الحالة بعد الإلغاء:', booking3.status);
} catch (error) {
  console.error('✗ خطأ:', error.message);
}

// ============================================
// مثال 7: كشف التضارب الزمني
// ============================================
console.log('\n=== مثال 7: كشف التضارب الزمني ===');

const booking4 = new Booking({
  playgroundId: 1,
  playgroundName: 'ملعب الأولمبي الخماسي',
  userName: 'فاطمة',
  userFatherName: 'عمر',
  userEmail: 'fatima@example.com',
  userPhone: '0963111111',
  date: '2026-05-18',
  startTime: '20:00',
  endTime: '21:00'
});

const existingBookings = [booking4];

// محاولة: 20:30 - 21:30 (متضارب)
const conflicting1 = new Booking({
  playgroundId: 1,
  playgroundName: 'ملعب الأولمبي الخماسي',
  userName: 'محمود',
  userFatherName: 'محمد',
  userEmail: 'mahmoud@example.com',
  userPhone: '0963222222',
  date: '2026-05-18',
  startTime: '20:30',
  endTime: '21:30'
});

if (Booking.hasConflict(conflicting1, existingBookings)) {
  console.log('✓ تم اكتشاف تضارب بين 20:30-21:30 و 20:00-21:00');
} else {
  console.log('✗ لم يتم اكتشاف التضارب');
}

// محاولة: 21:00 - 22:00 (متاح)
const nonConflicting = new Booking({
  playgroundId: 1,
  playgroundName: 'ملعب الأولمبي الخماسي',
  userName: 'جمال',
  userFatherName: 'سليم',
  userEmail: 'jamal@example.com',
  userPhone: '0963333333',
  date: '2026-05-18',
  startTime: '21:00',
  endTime: '22:00'
});

if (Booking.hasConflict(nonConflicting, existingBookings)) {
  console.log('✗ تم اكتشاف تضارب غير موجود');
} else {
  console.log('✓ لا يوجد تضارب بين 21:00-22:00 و 20:00-21:00 (متاح)');
}

// ============================================
// مثال 8: حسابات المدة
// ============================================
console.log('\n=== مثال 8: حسابات المدة ===');

const shortBooking = new Booking({
  playgroundId: 4,
  playgroundName: 'استاد الباسل الرياضي',
  userName: 'ناصر',
  userFatherName: 'خالد',
  userEmail: 'nasser@example.com',
  userPhone: '0963444444',
  date: '2026-05-19',
  startTime: '15:30',
  endTime: '16:45'
});

console.log('مدة الحجز: من 15:30 إلى 16:45');
console.log('المدة بالدقائق:', shortBooking.getDurationMinutes());

const longBooking = new Booking({
  playgroundId: 4,
  playgroundName: 'استاد الباسل الرياضي',
  userName: 'ياسر',
  userFatherName: 'علي',
  userEmail: 'yasser@example.com',
  userPhone: '0963555555',
  date: '2026-05-19',
  startTime: '09:00',
  endTime: '12:30'
});

console.log('مدة الحجز: من 09:00 إلى 12:30');
console.log('المدة بالدقائق:', longBooking.getDurationMinutes());

// ============================================
// مثال 9: تحويل البيانات إلى JSON
// ============================================
console.log('\n=== مثال 9: تحويل البيانات إلى JSON ===');

const booking5 = new Booking({
  playgroundId: 5,
  playgroundName: 'أرض الشجعان',
  userName: 'إبراهيم',
  userFatherName: 'حسن',
  userEmail: 'ibrahim@example.com',
  userPhone: '0963666666',
  date: '2026-05-20',
  startTime: '18:00',
  endTime: '19:30'
});

console.log('بيانات الحجز كـ JSON:');
console.log(JSON.stringify(booking5.toJSON(), null, 2));

// ============================================
// انتهاء الأمثلة
// ============================================
console.log('\n=== اكتملت جميع الأمثلة بنجاح ===');
