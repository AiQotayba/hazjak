// ------------- MAIN APPLICATION LOGIC -------------
// This file handles UI interactions and integrates with the API module.

let currentField = null;
let selectedDate = null;
let selectedTime = null;
let currentMonthDate = new Date();
let otpCode = null;
let otpSent = false;

const TIME_SLOTS = [
  '08:00', '09:30', '11:00', '12:30', '14:00', '15:30', '17:00', '18:30', '20:00', '21:30'
];
const DAY_NAMES = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];
const MONTH_NAMES = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

function initApp() {
  renderFields();
  bindGlobalEvents();
  registerServiceWorker();
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }
}

async function renderFields() {
  try {
    const fields = await API.getFields();
    renderFieldsWithData(fields);
  } catch (error) {
    console.warn('Failed to load fields from API, using fallback.', error);
    renderFieldsFallback();
  }
}

function renderFieldsWithData(fields) {
  const container = document.getElementById('fieldsContainer');
  if (!container) return;

  container.innerHTML = fields.map(field => `
    <div class="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 group flex flex-col h-full">
      <div class="relative aspect-[4/3] overflow-hidden">
        <img src="${field.image}" alt="${field.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-bold shadow-sm">
          <svg class="w-4 h-4 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          <span>${field.rating}</span><span class="text-gray-400 text-xs">(${field.reviews})</span>
        </div>
        <div class="absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1.5 backdrop-blur-sm ${field.available ? 'bg-primary/90' : 'bg-orange-500/90'}">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${field.statusTag}
        </div>
      </div>
      <div class="p-6 flex flex-col flex-grow">
        <h3 class="text-2xl font-bold font-cairo text-gray-900 mb-2 group-hover:text-primary transition">${field.name}</h3>
        <div class="flex items-center gap-2 text-gray-500 mb-6 text-sm"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>${field.location}</div>
        <div class="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between"><div class="font-bold text-lg text-primary">${field.price.toLocaleString()} ل.س / ساعة</div><button data-id="${field.id}" class="bookFieldBtn px-5 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl font-bold transition-colors">احجز الآن</button></div>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.bookFieldBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const field = fields.find(f => f.id === id);
      if (field) openScheduleModal(field);
    });
  });
}

function renderFieldsFallback() {
  const fields = [
    { id: 1, name: "ملعب الأولمبي الخماسي", location: "حلب - حي الموكامبو", rating: 4.9, reviews: 124, price: 60000, image: "https://images.unsplash.com/photo-1600066975952-912a81940822?q=80&w=2070&auto=format", available: true, statusTag: "متاح الآن" },
    { id: 2, name: "أكاديمية النجوم", location: "حلب - المحافظة", rating: 4.7, reviews: 89, price: 55000, image: "https://images.unsplash.com/photo-1547461056-317b672e08eb?q=80&w=2070&auto=format", available: false, statusTag: "متاح لاحقا" },
    { id: 3, name: "ملعب القمة", location: "حلب - سيف الدولة", rating: 4.5, reviews: 210, price: 45000, image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=2070&auto=format", available: true, statusTag: "متاح الآن" },
    { id: 4, name: "استاد الباسل الرياضي", location: "حلب - المعادي", rating: 4.8, reviews: 98, price: 70000, image: "https://images.unsplash.com/photo-1575361204036-afd975d5ecef?q=80&w=2070&auto=format", available: true, statusTag: "متاح الآن" },
    { id: 5, name: "أرض الشجعان", location: "حلب - السليمانية", rating: 4.6, reviews: 76, price: 52000, image: "https://images.unsplash.com/photo-1552667466-07770ae110d0?q=80&w=2070&auto=format", available: false, statusTag: "متاح لاحقا" },
    { id: 6, name: "ملعب السلطان", location: "حلب - السلطان", rating: 4.4, reviews: 65, price: 48000, image: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?q=80&w=2070&auto=format", available: true, statusTag: "متاح الآن" },
    { id: 7, name: "ملعب العلي", location: "حلب - العلي", rating: 4.3, reviews: 52, price: 42000, image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=2070&auto=format", available: true, statusTag: "متاح الآن" },
    { id: 8, name: "ملعب الريشي", location: "حلب - الريشي", rating: 4.7, reviews: 88, price: 58000, image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2070&auto=format", available: false, statusTag: "متاح لاحقا" }
  ];

  renderFieldsWithData(fields);
}

async function openScheduleModal(field) {
  currentField = field;
  selectedDate = null;
  selectedTime = null;
  otpSent = false;
  otpCode = null;

  document.getElementById('scheduleFieldName').innerText = field.name;
  document.getElementById('dailySchedule').classList.add('hidden');
  document.getElementById('bookSelectedSlot').classList.add('hidden');
  document.getElementById('bookSelectedSlot').disabled = true;
  document.getElementById('bookingMessage').innerHTML = '';
  document.getElementById('bookingOtp').value = '';
  document.getElementById('otpSection').classList.add('hidden');
  document.getElementById('confirmBookingBtn').innerText = 'إرسال رمز التحقق عبر واتساب';

  document.getElementById('scheduleModal').classList.remove('hidden');
  document.getElementById('scheduleModal').style.display = 'flex';
  currentMonthDate = new Date();
  await renderScheduleCalendar();
}

function closeScheduleModal() {
  document.getElementById('scheduleModal').classList.add('hidden');
  document.getElementById('scheduleModal').style.display = 'none';
}

async function renderScheduleCalendar() {
  if (!currentField) return;
  document.getElementById('currentMonth').innerText = `${MONTH_NAMES[currentMonthDate.getMonth()]} ${currentMonthDate.getFullYear()}`;
  const bookings = await API.getBookings(currentField.id);
  buildCalendar(currentMonthDate, bookings);
}

function buildCalendar(date, bookings) {
  const grid = document.getElementById('calendarGrid');
  grid.innerHTML = '';

  DAY_NAMES.forEach(dayName => {
    const header = document.createElement('div');
    header.className = 'text-center text-sm font-bold text-gray-500 py-2';
    header.innerText = dayName;
    grid.appendChild(header);
  });

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const paddingDays = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < paddingDays; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'h-20';
    grid.appendChild(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(year, month, day);
    const isoDate = cellDate.toISOString().slice(0, 10);
    const dayBookings = bookings.filter(b => b.date === isoDate);
    const isPast = cellDate < today;
    const selectedClass = selectedDate === isoDate ? 'border-primary bg-primary/10' : 'border-gray-200 bg-white';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `flex flex-col justify-between h-24 p-3 rounded-3xl border shadow-sm text-right transition ${selectedClass} ${isPast ? 'opacity-40 cursor-not-allowed' : 'hover:border-primary hover:shadow-lg'}`;
    button.disabled = isPast;
    button.innerHTML = `
      <div>
        <div class="text-xs text-gray-500">${DAY_NAMES[cellDate.getDay()]}</div>
        <div class="text-lg font-bold mt-2">${day}</div>
      </div>
      <div class="text-xs text-gray-600 mt-2">${dayBookings.length ? `${dayBookings.length} حجز` : 'متاح'}</div>
    `;
    button.addEventListener('click', () => {
      selectedDate = isoDate;
      showDailySchedule(isoDate, bookings);
    });
    grid.appendChild(button);
  }
}

function showDailySchedule(date, bookings) {
  selectedDate = date;
  selectedTime = null;
  document.getElementById('selectedDate').innerText = `التاريخ المختار: ${formatDateArabic(date)}`;
  document.getElementById('dailySchedule').classList.remove('hidden');
  const slotsContainer = document.getElementById('timeSlots');
  slotsContainer.innerHTML = '';
  const dayBookings = bookings.filter(b => b.date === date);

  TIME_SLOTS.forEach(time => {
    const booked = dayBookings.some(b => b.time === time && b.status === 'booked');
    const deposit = dayBookings.some(b => b.time === time && b.status === 'deposit');
    const slotButton = document.createElement('button');
    slotButton.type = 'button';
    slotButton.className = `p-4 rounded-3xl border transition text-right ${booked ? 'bg-red-50 border-red-200 text-red-700 cursor-not-allowed' : deposit ? 'bg-yellow-50 border-yellow-200 text-yellow-700 cursor-not-allowed' : 'bg-white border-gray-200 hover:bg-primary/10 hover:border-primary'}`;
    slotButton.innerHTML = `
      <div class="flex justify-between items-center gap-4">
        <div>
          <div class="text-lg font-bold">${time}</div>
          <div class="text-sm text-gray-500">${booked ? 'محجوز' : deposit ? 'عربون' : 'متاح للحجز'}</div>
        </div>
        ${selectedTime === time ? '<span class="text-primary font-bold">محدد</span>' : ''}
      </div>
    `;
    slotButton.disabled = booked || deposit;
    if (!slotButton.disabled) {
      slotButton.addEventListener('click', () => {
        selectedTime = time;
        const bookButton = document.getElementById('bookSelectedSlot');
        if (bookButton) {
          bookButton.classList.remove('hidden');
          bookButton.disabled = false;
          bookButton.innerText = `احجز ${time}`;
          bookButton.dataset.date = date;
          bookButton.dataset.time = time;
          bookButton.dataset.fieldId = currentField?.id || '';
        }
        showDailySchedule(date, bookings);
      });
    }
    slotsContainer.appendChild(slotButton);
  });
}

function formatDateArabic(dateString) {
  const [year, month, day] = dateString.split('-');
  return `${day} ${MONTH_NAMES[Number(month) - 1]} ${year}`;
}

function openBookingModal(field, date = '', time = '') {
  currentField = field;
  selectedDate = date;
  selectedTime = time;
  document.getElementById('modalFieldName').innerText = field.name;
  document.getElementById('bookingSlotInfo').innerText = date && time ? `التاريخ: ${formatDateArabic(date)} | الوقت: ${time}` : 'اختر موعدا من الجدول أولا';
  document.getElementById('bookingDatetime').value = date && time ? `${date}T${time}` : '';
  const currentUser = getCurrentUser();
  document.getElementById('bookingName').value = currentUser.name || '';
  document.getElementById('bookingEmail').value = currentUser.email || '';
  document.getElementById('bookingPhone').value = currentUser.phone || '';
  document.getElementById('bookingIdPhoto').value = '';
  document.getElementById('bookingIdPreview').innerHTML = '';
  document.getElementById('bookingOtp').value = '';
  document.getElementById('otpSection').classList.add('hidden');
  document.getElementById('confirmBookingBtn').innerText = 'حجز الآن';
  document.getElementById('confirmOtpBtn').classList.add('hidden');
  document.getElementById('bookingMessage').innerHTML = '<span class="text-gray-500">بعد الضغط على حجز الآن، ستظهر واجهة لإدخال الاسم، رقم الهاتف، وتحميل صورة الهوية ثم يتم إرسال رمز التحقق.</span>';
  document.getElementById('bookingModal').classList.remove('hidden');
  document.getElementById('bookingModal').style.display = 'flex';
}

document.getElementById('confirmBookingBtn')?.addEventListener('click', async () => {
  const datetime = document.getElementById('bookingDatetime').value;
  const customerName = document.getElementById('bookingName').value.trim();
  const email = document.getElementById('bookingEmail').value.trim();
  const phone = document.getElementById('bookingPhone').value.trim();
  const idFile = document.getElementById('bookingIdPhoto').files[0];

  if (!datetime || !customerName || !email || !phone || !idFile) {
    document.getElementById('bookingMessage').innerHTML = '<span class="text-red-500">يرجى ملء الاسم والبريد الإلكتروني والرقم وتحميل صورة الهوية</span>';
    return;
  }

  if (!otpSent) {
    otpCode = '123456'; // رمز OTP ثابت للتجربة
    otpSent = true;
    document.getElementById('bookingMessage').innerHTML = '<span class="text-primary animate-pulse">يتم إرسال رمز OTP عبر واتساب...</span>';

    try {
      const result = await API.sendWhatsAppConfirmation({ phone, otp: otpCode, field: currentField.name, datetime });
      if (result.success) {
        document.getElementById('bookingMessage').innerHTML = `<span class="text-green-600">${result.message}</span>`;
        document.getElementById('otpSection').classList.remove('hidden');
        document.getElementById('confirmOtpBtn').classList.remove('hidden');
        document.getElementById('confirmBookingBtn').innerText = 'إعادة إرسال الرمز';
      } else {
        throw new Error('Failed to send OTP');
      }
    } catch (error) {
      console.error(error);
      document.getElementById('bookingMessage').innerHTML = '<span class="text-red-500">فشل إرسال OTP حاول مرة أخرى</span>';
      otpSent = false;
    }
  }
});

document.getElementById('confirmOtpBtn')?.addEventListener('click', async () => {
  const otpInput = document.getElementById('bookingOtp').value.trim();
  const datetime = document.getElementById('bookingDatetime').value;
  const customerName = document.getElementById('bookingName').value.trim();
  const email = document.getElementById('bookingEmail').value.trim();
  const phone = document.getElementById('bookingPhone').value.trim();
  const idFile = document.getElementById('bookingIdPhoto').files[0];

  if (!otpSent) {
    document.getElementById('bookingMessage').innerHTML = '<span class="text-red-500">يرجى إرسال رمز التحقق أولاً</span>';
    return;
  }

  if (!otpInput) {
    document.getElementById('bookingMessage').innerHTML = '<span class="text-red-500">يرجى إدخال رمز التحقق</span>';
    return;
  }

  if (otpInput !== otpCode) {
    document.getElementById('bookingMessage').innerHTML = '<span class="text-red-500">رمز التحقق غير صحيح. حاول مرة أخرى.</span>';
    return;
  }

  const bookingPayload = {
    fieldId: currentField.id,
    fieldName: currentField.name,
    datetime,
    customerName,
    email,
    phone,
    idPhotoName: idFile.name,
    otp: otpInput
  };

  document.getElementById('bookingMessage').innerHTML = '<span class="text-primary animate-pulse">جاري تأكيد الحجز...</span>';
  try {
    const result = await API.createBooking(bookingPayload);
    if (result.success) {
      document.getElementById('bookingMessage').innerHTML = `<span class="text-green-600">${result.message}</span>`;
      setTimeout(() => {
        document.getElementById('bookingModal').classList.add('hidden');
        document.getElementById('bookingModal').style.display = 'none';
        closeScheduleModal();
        alert(`✅ ${result.message}\nملعب: ${currentField.name}\nالتاريخ: ${formatDateArabic(selectedDate)}\nالوقت: ${selectedTime}`);
      }, 1200);
    } else {
      const errorMessage = result.error || result.message || 'حدث خطأ حاول مرة أخرى';
      document.getElementById('bookingMessage').innerHTML = `<span class="text-red-500">${errorMessage}</span>`;
    }
  } catch (e) {
    console.error(e);
    document.getElementById('bookingMessage').innerHTML = `<span class="text-red-500">${e.message || 'حدث خطأ حاول مرة أخرى'}</span>`;
  }
});

document.getElementById('closeModal')?.addEventListener('click', () => {
  document.getElementById('bookingModal').classList.add('hidden');
  document.getElementById('bookingModal').style.display = 'none';
});

document.getElementById('bookingModal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('bookingModal')) {
    document.getElementById('bookingModal').classList.add('hidden');
    document.getElementById('bookingModal').style.display = 'none';
  }
});

document.getElementById('closeScheduleModal')?.addEventListener('click', closeScheduleModal);

document.getElementById('scheduleModal')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('scheduleModal')) {
    closeScheduleModal();
  }
});

document.getElementById('bookingIdPhoto')?.addEventListener('change', (event) => {
  const preview = document.getElementById('bookingIdPreview');
  const file = event.target.files[0];
  if (!file) {
    preview.innerHTML = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    preview.innerHTML = `<img src="${reader.result}" alt="صورة الهوية" class="mx-auto max-h-44 rounded-2xl border border-gray-200" />`;
  };
  reader.readAsDataURL(file);
});

function bindGlobalEvents() {
  document.getElementById('heroBookBtn')?.addEventListener('click', () => document.querySelector('#fields')?.scrollIntoView({ behavior: 'smooth' }));
  document.getElementById('navBookBtn')?.addEventListener('click', () => document.querySelector('#fields')?.scrollIntoView({ behavior: 'smooth' }));
  document.getElementById('mobileBookBtn')?.addEventListener('click', () => {
    document.getElementById('mobileDrawer').classList.add('hidden');
    document.querySelector('#fields')?.scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('mobileMenuBtn')?.addEventListener('click', () => document.getElementById('mobileDrawer').classList.toggle('hidden'));
  document.getElementById('prevMonth')?.addEventListener('click', async () => {
    currentMonthDate.setMonth(currentMonthDate.getMonth() - 1);
    await renderScheduleCalendar();
  });
  document.getElementById('nextMonth')?.addEventListener('click', async () => {
    currentMonthDate.setMonth(currentMonthDate.getMonth() + 1);
    await renderScheduleCalendar();
  });
  document.getElementById('showAllBtn')?.addEventListener('click', () => renderFields());

  // Auth buttons
  document.getElementById('navAuthBtn')?.addEventListener('click', () => {
    if (isLoggedIn()) {
      logout();
    } else {
      openLoginModal();
    }
  });
  document.getElementById('mobileAuthBtn')?.addEventListener('click', () => {
    document.getElementById('mobileDrawer').classList.add('hidden');
    if (isLoggedIn()) {
      logout();
    } else {
      openLoginModal();
    }
  });
  document.getElementById('logoutBtn')?.addEventListener('click', logout);
  document.getElementById('mobileLogoutBtn')?.addEventListener('click', logout);
  document.getElementById('switchToRegister')?.addEventListener('click', (e) => {
    e.preventDefault();
    closeLoginModal();
    openRegisterModal();
  });

  const bookSelectedSlotBtn = document.getElementById('bookSelectedSlot');
  if (bookSelectedSlotBtn) {
    bookSelectedSlotBtn.addEventListener('click', async () => {
      const date = bookSelectedSlotBtn.dataset.date;
      const time = bookSelectedSlotBtn.dataset.time;
      const fieldId = Number(bookSelectedSlotBtn.dataset.fieldId);
      if (!date || !time || !fieldId) return;
      if (!currentField || currentField.id !== fieldId) {
        const fields = await API.getFields();
        currentField = fields.find(f => f.id === fieldId) || currentField;
      }
      if (!currentField) return;
      openBookingModal(currentField, date, time);
    });
  }

  // Close modals
  document.getElementById('closeRegisterModal')?.addEventListener('click', closeRegisterModal);
  document.getElementById('registerModal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('registerModal')) closeRegisterModal();
  });
  document.getElementById('closeLoginModal')?.addEventListener('click', closeLoginModal);
  document.getElementById('loginModal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('loginModal')) closeLoginModal();
  });
}

function isLoggedIn() {
  return localStorage.getItem('userToken') !== null;
}

function getCurrentUser() {
  return {
    name: localStorage.getItem('userName') || '',
    email: localStorage.getItem('userEmail') || '',
    phone: localStorage.getItem('userPhone') || ''
  };
}

function logout() {
  localStorage.removeItem('userToken');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userPhone');
  updateAuthUI();
  alert('تم تسجيل الخروج بنجاح');
}

function updateAuthUI() {
  const loggedIn = isLoggedIn();
  const userName = localStorage.getItem('userName') || '';
  const authBtnText = loggedIn ? `مرحبا ${userName}` : 'التسجيل';
  const mobileAuthBtnText = loggedIn ? `مرحبا ${userName}` : 'تسجيل';

  document.getElementById('authBtnText').innerText = authBtnText;
  document.getElementById('mobileAuthBtnText').innerText = mobileAuthBtnText;

  document.getElementById('logoutBtn').classList.toggle('hidden', !loggedIn);
  document.getElementById('mobileLogoutBtn').classList.toggle('hidden', !loggedIn);
  document.getElementById('navAuthBtn').classList.toggle('hidden', loggedIn);
  document.getElementById('mobileAuthBtn').classList.toggle('hidden', loggedIn);
}

function openLoginModal() {
  document.getElementById('loginModal').classList.remove('hidden');
  document.getElementById('loginModal').style.display = 'flex';
}

function closeLoginModal() {
  document.getElementById('loginModal').classList.add('hidden');
  document.getElementById('loginModal').style.display = 'none';
}

function openRegisterModal() {
  document.getElementById('registerModal').classList.remove('hidden');
  document.getElementById('registerModal').style.display = 'flex';
}

function closeRegisterModal() {
  document.getElementById('registerModal').classList.add('hidden');
  document.getElementById('registerModal').style.display = 'none';
}

async function handleRegister(e) {
  e.preventDefault();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();

  if (!email) {
    document.getElementById('registerMessage').innerHTML = '<span class="text-red-500">يرجى إدخال البريد الإلكتروني</span>';
    return;
  }

  if (!phone) {
    document.getElementById('registerMessage').innerHTML = '<span class="text-red-500">يرجى إدخال رقم الهاتف</span>';
    return;
  }

  document.getElementById('registerMessage').innerHTML = '<span class="text-primary animate-pulse">جاري التسجيل...</span>';

  try {
    const result = await API.registerUser({ email, phone });
    if (result.success) {
      localStorage.setItem('userToken', result.token);
      localStorage.setItem('token', result.token);
      localStorage.setItem('userName', result.user?.name || email.split('@')[0]);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userPhone', phone);
      updateAuthUI();
      closeRegisterModal();
      alert('تم التسجيل بنجاح! يمكنك الآن طلب OTP');
    } else {
      throw new Error(result.error || result.message);
    }
  } catch (error) {
    console.error('خطأ في التسجيل:', error);
    document.getElementById('registerMessage').innerHTML = `<span class="text-red-500">${error.message || 'فشل التسجيل. حاول مرة أخرى.'}</span>`;
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const name = document.getElementById('loginName').value.trim();
  const email = document.getElementById('loginEmail').value.trim();
  const phone = document.getElementById('loginPhone').value.trim();

  if (!name || !email || !phone) {
    document.getElementById('loginMessage').innerHTML = '<span class="text-red-500">يرجى ملء الاسم والبريد الإلكتروني ورقم الهاتف</span>';
    return;
  }

  document.getElementById('loginMessage').innerHTML = '<span class="text-primary animate-pulse">جاري تسجيل الدخول...</span>';

  const fatherName = document.getElementById('loginFatherName').value.trim();
  const favoriteField = document.getElementById('loginFavoriteField').value;

  if (!fatherName || !favoriteField) {
    document.getElementById('loginMessage').innerHTML = '<span class="text-red-500">يرجى ملء جميع الحقول المطلوبة</span>';
    return;
  }

  try {
    const result = await API.loginUser({ name, email, phone, fatherName, favoriteField });
    if (result.success) {
      localStorage.setItem('userToken', result.token || 'dummy-token');
      localStorage.setItem('token', result.token || 'dummy-token');
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', result.email || email);
      localStorage.setItem('userPhone', phone);
      localStorage.setItem('userFatherName', fatherName);
      localStorage.setItem('userFavoriteField', favoriteField);
      updateAuthUI();
      closeLoginModal();
      alert('تم تسجيل الدخول بنجاح');
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error(error);
    document.getElementById('loginMessage').innerHTML = '<span class="text-red-500">فشل تسجيل الدخول. تحقق من البيانات.</span>';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initApp();
  updateAuthUI();

  document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
});
