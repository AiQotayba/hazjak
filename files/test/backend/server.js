const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

// استيراد نموذج الحجوزات
const Booking = require('./models/Booking');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your_secret_key'; // غير هذا في الإنتاج

app.use(cors());
app.use(express.json());

// مصفوفات مؤقتة في الذاكرة
let users = [];
let fields = [
  { id: 1, name: 'ملعب الأولمبي الخماسي', location: 'حلب - حي الموكامبو', rating: 4.9, reviews: 124, price: 60000, image: 'https://images.unsplash.com/photo-1600066975952-912a81940822?q=80&w=2070&auto=format', available: true, statusTag: 'متاح الآن' },
  { id: 2, name: 'أكاديمية النجوم', location: 'حلب - المحافظة', rating: 4.7, reviews: 89, price: 55000, image: 'https://images.unsplash.com/photo-1547461056-317b672e08eb?q=80&w=2070&auto=format', available: false, statusTag: 'متاح لاحقا' },
  { id: 3, name: 'ملعب القمة', location: 'حلب - سيف الدولة', rating: 4.5, reviews: 210, price: 45000, image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=2070&auto=format', available: true, statusTag: 'متاح الآن' },
  { id: 4, name: 'استاد الباسل الرياضي', location: 'حلب - المعادي', rating: 4.8, reviews: 98, price: 70000, image: 'https://images.unsplash.com/photo-1575361204036-afd975d5ecef?q=80&w=2070&auto=format', available: true, statusTag: 'متاح الآن' },
  { id: 5, name: 'أرض الشجعان', location: 'حلب - السليمانية', rating: 4.6, reviews: 76, price: 52000, image: 'https://images.unsplash.com/photo-1552667466-07770ae110d0?q=80&w=2070&auto=format', available: false, statusTag: 'متاح لاحقا' },
  { id: 6, name: 'ملعب السلطان', location: 'حلب - السلطان', rating: 4.4, reviews: 65, price: 48000, image: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?q=80&w=2070&auto=format', available: true, statusTag: 'متاح الآن' },
  { id: 7, name: 'ملعب العلي', location: 'حلب - العلي', rating: 4.3, reviews: 52, price: 42000, image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=2070&auto=format', available: true, statusTag: 'متاح الآن' },
  { id: 8, name: 'ملعب الريشي', location: 'حلب - الريشي', rating: 4.7, reviews: 88, price: 58000, image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2070&auto=format', available: false, statusTag: 'متاح لاحقا' }
];
let bookings = [];

// Middleware للتحقق من التوكن
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token found. Please login first.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// تخزين مؤقت لـ OTP (في الإنتاج استخدم قاعدة بيانات)
let otpStore = {};

// POST /api/register
app.post('/api/register', async (req, res) => {
  const { email, password, phone } = req.body;

  // التحقق من الحقول المطلوبة
  if (!email) {
    return res.status(400).json({ message: 'البريد الإلكتروني مطلوب' });
  }

  if (!phone && !password) {
    return res.status(400).json({ message: 'كلمة المرور أو رقم الهاتف مطلوب' });
  }

  // استخدام password إذا كان موجوداً، وإلا استخدم phone
  const rawPassword = password || phone;

  if (!rawPassword) {
    return res.status(400).json({ message: 'كلمة المرور أو رقم الهاتف مطلوب' });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'المستخدم موجود بالفعل' });
  }

  try {
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      phone: phone || ''
    };
    users.push(newUser);

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({
      message: 'تم التسجيل بنجاح',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        phone: newUser.phone
      }
    });
  } catch (error) {
    console.error('خطأ في التسجيل:', error);
    res.status(500).json({ message: 'خطأ داخلي في الخادم' });
  }
});

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { email, password, phone } = req.body;
  const rawPassword = password || phone;
  if (!email || !rawPassword) {
    return res.status(400).json({ message: 'Email and password or phone are required' });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const isPasswordValid = await bcrypt.compare(rawPassword, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// GET /api/fields
app.get('/api/fields', (req, res) => {
  res.json(fields);
});

// POST /api/bookings - إنشاء حجز جديد
app.post('/api/bookings', authenticateToken, (req, res) => {
  try {
    const {
      playgroundId,
      playgroundName,
      userName,
      userFatherName,
      userEmail,
      userPhone,
      date,
      startTime,
      endTime
    } = req.body;

    // التحقق من الحقول المطلوبة
    if (!playgroundId || !playgroundName || !userName || !userFatherName || !userEmail || !userPhone || !date || !startTime || !endTime) {
      return res.status(400).json({
        message: 'جميع الحقول مطلوبة',
        requiredFields: ['playgroundId', 'playgroundName', 'userName', 'userFatherName', 'userEmail', 'userPhone', 'date', 'startTime', 'endTime']
      });
    }

    // إنشاء كائن الحجز الجديد باستخدام نموذج Booking
    const newBooking = new Booking({
      playgroundId,
      playgroundName,
      userName,
      userFatherName,
      userEmail,
      userPhone,
      date,
      startTime,
      endTime,
      status: 'pending'
    });

    // التحقق من التضارب مع الحجوزات الموجودة
    if (Booking.hasConflict(newBooking, bookings)) {
      return res.status(409).json({
        message: 'توجد حجوزات متضاربة في هذا الوقت',
        conflictDetails: {
          playgroundId: playgroundId,
          date: date,
          startTime: startTime,
          endTime: endTime
        }
      });
    }

    // إضافة الحجز إلى المصفوفة
    bookings.push(newBooking);

    res.status(201).json({
      message: 'تم إنشاء الحجز بنجاح',
      booking: newBooking.toJSON(),
      bookingId: newBooking.bookingId
    });
  } catch (error) {
    res.status(400).json({
      message: 'خطأ في إنشاء الحجز',
      error: error.message
    });
  }
});

// GET /api/bookings - الحصول على جميع الحجوزات (للمسؤول)
app.get('/api/bookings', authenticateToken, (req, res) => {
  const bookingsData = bookings.map(booking => booking.toJSON ? booking.toJSON() : booking);
  res.json({
    count: bookingsData.length,
    bookings: bookingsData
  });
});

// GET /api/bookings/:bookingId - الحصول على حجز محدد بـ ID
app.get('/api/bookings/:bookingId', authenticateToken, (req, res) => {
  const { bookingId } = req.params;
  const booking = bookings.find(b => b.bookingId === bookingId);
  
  if (!booking) {
    return res.status(404).json({
      message: 'الحجز غير موجود',
      bookingId: bookingId
    });
  }

  res.json({
    booking: booking.toJSON ? booking.toJSON() : booking
  });
});

// GET /api/bookings/playground/:playgroundId - الحصول على حجوزات ملعب معين
app.get('/api/bookings/playground/:playgroundId', (req, res) => {
  const { playgroundId } = req.params;
  const playgroundBookings = bookings.filter(b => b.playgroundId === Number(playgroundId));
  
  const bookingsData = playgroundBookings.map(booking => booking.toJSON ? booking.toJSON() : booking);
  
  res.json({
    playgroundId: Number(playgroundId),
    count: bookingsData.length,
    bookings: bookingsData
  });
});

// PATCH /api/bookings/:bookingId/status - تحديث حالة الحجز
app.patch('/api/bookings/:bookingId/status', authenticateToken, (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const booking = bookings.find(b => b.bookingId === bookingId);
    
    if (!booking) {
      return res.status(404).json({
        message: 'الحجز غير موجود',
        bookingId: bookingId
      });
    }

    if (!status) {
      return res.status(400).json({
        message: 'حالة الحجز مطلوبة',
        validStatuses: ['pending', 'confirmed', 'cancelled']
      });
    }

    // تحديث الحالة
    booking.updateStatus(status);

    res.json({
      message: 'تم تحديث حالة الحجز بنجاح',
      booking: booking.toJSON ? booking.toJSON() : booking
    });
  } catch (error) {
    res.status(400).json({
      message: 'خطأ في تحديث حالة الحجز',
      error: error.message
    });
  }
});

// DELETE /api/bookings/:bookingId - حذف/إلغاء حجز
app.delete('/api/bookings/:bookingId', authenticateToken, (req, res) => {
  const { bookingId } = req.params;
  const bookingIndex = bookings.findIndex(b => b.bookingId === bookingId);
  
  if (bookingIndex === -1) {
    return res.status(404).json({
      message: 'الحجز غير موجود',
      bookingId: bookingId
    });
  }

  const deletedBooking = bookings.splice(bookingIndex, 1)[0];
  
  res.json({
    message: 'تم حذف الحجز بنجاح',
    deletedBooking: deletedBooking.toJSON ? deletedBooking.toJSON() : deletedBooking
  });
});

// POST /api/whatsapp/send - طلب إرسال OTP عبر WhatsApp
app.post('/api/whatsapp/send', authenticateToken, (req, res) => {
  try {
    const userEmail = req.user.email;
    
    // توليد OTP عشوائي (6 أرقام)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // حفظ OTP مع الـ email والوقت (ينتهي بعد 10 دقائق)
    otpStore[userEmail] = {
      otp: otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 دقائق
      attempts: 0
    };
    
    // في الإنتاج: أرسل OTP عبر WhatsApp API الحقيقي
    // للاختبار: نعيد OTP مباشرة (في الإنتاج لا تعيدها!)
    res.json({
      success: true,
      message: 'تم إرسال رمز التحقق عبر واتساب بنجاح',
      email: userEmail,
      expiresIn: '10 دقائق',
      // في الإنتاج: احذف السطر التالي
      otp: otp // للاختبار فقط
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في إرسال OTP',
      error: error.message
    });
  }
});

// POST /api/whatsapp/verify - التحقق من OTP
app.post('/api/whatsapp/verify', authenticateToken, (req, res) => {
  try {
    const { otp } = req.body;
    const userEmail = req.user.email;
    
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'رمز التحقق مطلوب'
      });
    }
    
    // التحقق من وجود OTP للمستخدم
    if (!otpStore[userEmail]) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم طلب رمز تحقق. يرجى طلب واحد أولاً'
      });
    }
    
    const storedOtpData = otpStore[userEmail];
    
    // التحقق من انتهاء صلاحية OTP
    if (Date.now() > storedOtpData.expiresAt) {
      delete otpStore[userEmail];
      return res.status(400).json({
        success: false,
        message: 'انتهت صلاحية رمز التحقق. يرجى طلب واحد جديد'
      });
    }
    
    // التحقق من محاولات فاشلة متكررة
    if (storedOtpData.attempts >= 5) {
      delete otpStore[userEmail];
      return res.status(400).json({
        success: false,
        message: 'تم تجاوز عدد محاولات التحقق. يرجى طلب رمز جديد'
      });
    }
    
    // التحقق من OTP
    if (storedOtpData.otp === otp.toString()) {
      // OTP صحيح
      delete otpStore[userEmail];
      
      res.json({
        success: true,
        message: 'تم التحقق بنجاح',
        verified: true
      });
    } else {
      // OTP خاطئ
      storedOtpData.attempts += 1;
      const remainingAttempts = 5 - storedOtpData.attempts;
      
      res.status(400).json({
        success: false,
        message: 'رمز التحقق غير صحيح',
        remainingAttempts: remainingAttempts
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من OTP',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});