/**
 * نموذج البيانات للحجوزات (Booking Model)
 * يحتوي على جميع الحقول المتعلقة بحجز الملاعب
 */

const crypto = require('crypto');

class Booking {
  constructor({
    playgroundId,
    playgroundName,
    userName,
    userFatherName,
    userEmail,
    userPhone,
    date,
    startTime,
    endTime,
    status = 'pending'
  }) {
    // توليد معرّف عشوائي للحجز
    this.bookingId = this._generateBookingId();
    
    // بيانات الملعب
    this.playgroundId = playgroundId;
    this.playgroundName = playgroundName;
    
    // بيانات المستخدم
    this.userName = userName;
    this.userFatherName = userFatherName;
    this.userEmail = userEmail;
    this.userPhone = userPhone;
    
    // بيانات الحجز الزمنية
    this.date = this._validateDate(date); // بصيغة YYYY-MM-DD
    this.startTime = this._validateTime(startTime); // بصيغة HH:MM مثل 20:00
    this.endTime = this._validateTime(endTime); // بصيغة HH:MM مثل 21:00
    
    // حالة الحجز
    this.status = this._validateStatus(status); // pending, confirmed, cancelled
    
    // وقت الإنشاء
    this.createdAt = new Date().toISOString();
  }

  /**
   * توليد معرّف عشوائي فريد للحجز
   * صيغة: BK-{timestamp}-{random}
   * مثال: BK-1715600000000-a7f3c2e1
   */
  _generateBookingId() {
    const timestamp = Date.now();
    const randomPart = crypto.randomBytes(4).toString('hex');
    return `BK-${timestamp}-${randomPart}`;
  }

  /**
   * التحقق من صحة التاريخ
   * يجب أن يكون بصيغة YYYY-MM-DD
   */
  _validateDate(date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new Error(`التاريخ يجب أن يكون بصيغة YYYY-MM-DD، تم الحصول على: ${date}`);
    }
    
    // التحقق من أن التاريخ صالح
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      throw new Error(`التاريخ غير صالح: ${date}`);
    }
    
    return date;
  }

  /**
   * التحقق من صحة الوقت
   * يجب أن يكون بصيغة HH:MM (24 ساعة)
   * مثال: 20:00, 09:30
   */
  _validateTime(time) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      throw new Error(`الوقت يجب أن يكون بصيغة HH:MM، تم الحصول على: ${time}`);
    }
    return time;
  }

  /**
   * التحقق من حالة الحجز
   * الحالات المسموحة: pending, confirmed, cancelled
   */
  _validateStatus(status) {
    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`حالة الحجز غير صالحة. يجب أن تكون إحدى: ${validStatuses.join(', ')}`);
    }
    return status;
  }

  /**
   * تحديث حالة الحجز
   */
  updateStatus(newStatus) {
    this.status = this._validateStatus(newStatus);
    return this;
  }

  /**
   * الحصول على مدة الحجز بالدقائق
   */
  getDurationMinutes() {
    const [startHours, startMinutes] = this.startTime.split(':').map(Number);
    const [endHours, endMinutes] = this.endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    
    return endTotalMinutes - startTotalMinutes;
  }

  /**
   * تحويل البيانات إلى JSON
   */
  toJSON() {
    return {
      bookingId: this.bookingId,
      playgroundId: this.playgroundId,
      playgroundName: this.playgroundName,
      userName: this.userName,
      userFatherName: this.userFatherName,
      userEmail: this.userEmail,
      userPhone: this.userPhone,
      date: this.date,
      startTime: this.startTime,
      endTime: this.endTime,
      durationMinutes: this.getDurationMinutes(),
      status: this.status,
      createdAt: this.createdAt
    };
  }

  /**
   * التحقق من تضارب الحجوزات
   * هل هناك حجز آخر في نفس الملعب وفي نفس الوقت؟
   */
  static hasConflict(newBooking, existingBookings) {
    return existingBookings.some(existing => {
      // نفس الملعب
      if (existing.playgroundId !== newBooking.playgroundId) {
        return false;
      }
      
      // نفس التاريخ
      if (existing.date !== newBooking.date) {
        return false;
      }
      
      // حالة غير نشطة
      if (existing.status === 'cancelled') {
        return false;
      }
      
      // التحقق من التضارب الزمني
      const newStart = newBooking.startTime;
      const newEnd = newBooking.endTime;
      const existingStart = existing.startTime;
      const existingEnd = existing.endTime;
      
      // إذا كان نهاية الحجز الجديد <= بداية الحجز الموجود (لا يوجد تضارب)
      if (newEnd <= existingStart) {
        return false;
      }
      
      // إذا كانت بداية الحجز الجديد >= نهاية الحجز الموجود (لا يوجد تضارب)
      if (newStart >= existingEnd) {
        return false;
      }
      
      // في جميع الحالات الأخرى يوجد تضارب
      return true;
    });
  }
}

module.exports = Booking;
