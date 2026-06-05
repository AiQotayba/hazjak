import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBooking } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { ar } from 'date-fns/locale';

const TIME_SLOTS = [
  '08:00', '09:30', '11:00', '12:30', '14:00', '15:30', '17:00', '18:30', '20:00', '21:30'
];

const BookingModal: React.FC = () => {
  const {
    selectedField,
    selectedDate,
    selectedTime,
    isBookingModalOpen,
    setBookingModalOpen,
    setSelectedDate,
    setSelectedTime,
    bookings,
    createBooking,
    loadBookings
  } = useBooking();
  const { user } = useAuth();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  useEffect(() => {
    if (selectedField && isBookingModalOpen) {
      loadBookings(selectedField.id);
    }
  }, [selectedField, isBookingModalOpen, loadBookings]);

  const handleClose = () => {
    setBookingModalOpen(false);
    setSelectedDate(null);
    setSelectedTime(null);
    setShowTimeSlots(false);
    setCurrentMonth(new Date());
    setBookingMessage('');
  };

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDate(dateStr);
    setShowTimeSlots(true);
  };

  const handleTimeClick = (time: string) => {
    const booking = bookings.find(b => b.date === selectedDate && b.time === time);
    if (booking && booking.status !== 'available') {
      return; // Can't book
    }
    setSelectedTime(time);
  };

  const handleConfirmBooking = async () => {
    if (!selectedField || !selectedDate || !selectedTime || !user) return;

    setBookingMessage('جاري تأكيد الحجز...');

    const bookingData = {
      fieldId: selectedField.id,
      fieldName: selectedField.name,
      date: selectedDate,
      time: selectedTime,
      userId: user.id,
      userName: user.name,
      phone: user.phone || '',
      status: 'booked' as const,
    };

    try {
      const success = await createBooking(bookingData);
      if (success) {
        setBookingMessage('تم الحجز بنجاح!');
        setTimeout(() => {
          alert(`✅ تم الحجز بنجاح!\nملعب: ${selectedField.name}\nالتاريخ: ${selectedDate}\nالوقت: ${selectedTime}`);
          handleClose();
        }, 1500);
      } else {
        setBookingMessage('حدث خطأ في الحجز');
      }
    } catch (error) {
      setBookingMessage('حدث خطأ في الحجز');
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getBookingStatus = (dateStr: string, time: string) => {
    const booking = bookings.find(b => b.date === dateStr && b.time === time);
    return booking?.status || 'available';
  };

  if (!isBookingModalOpen || !selectedField) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">حجز الملعب</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-primary mb-2">{selectedField.name}</h3>
            <p className="text-gray-600">{selectedField.location}</p>
          </div>

          {!showTimeSlots ? (
            /* Calendar View */
            <div>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronRight size={20} />
                </button>
                <h3 className="text-lg font-bold">
                  {format(currentMonth, 'MMMM yyyy', { locale: ar })}
                </h3>
                <button
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <ChevronLeft size={20} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
                  <div key={day} className="text-center font-bold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {monthDays.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const hasBookings = bookings.some(b => b.date === dateStr);
                  const isCurrentMonth = isSameMonth(day, currentMonth);

                  return (
                    <button
                      key={dateStr}
                      onClick={() => handleDateClick(day)}
                      disabled={!isCurrentMonth}
                      className={`aspect-square rounded-lg text-center py-2 transition-colors ${
                        !isCurrentMonth
                          ? 'text-gray-300 cursor-not-allowed'
                          : hasBookings
                          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          : isToday(day)
                          ? 'bg-primary text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Time Slots View */
            <div>
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setShowTimeSlots(false)}
                  className="flex items-center gap-2 text-primary hover:text-primary/80"
                >
                  <ChevronRight size={20} />
                  العودة للتقويم
                </button>
                <div className="flex items-center gap-2">
                  <Calendar size={20} />
                  <span className="font-bold">
                    {selectedDate && format(new Date(selectedDate), 'EEEE، d MMMM yyyy', { locale: ar })}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {TIME_SLOTS.map(time => {
                  const status = getBookingStatus(selectedDate!, time);
                  const isSelected = selectedTime === time;

                  let bgColor = 'bg-green-500';
                  let textColor = 'text-white';
                  let statusText = 'متاح';

                  if (status === 'booked') {
                    bgColor = 'bg-red-500';
                    statusText = 'محجوز';
                  } else if (status === 'deposit') {
                    bgColor = 'bg-yellow-500';
                    statusText = 'عربون';
                  }

                  if (isSelected) {
                    bgColor = 'bg-blue-500';
                  }

                  return (
                    <button
                      key={time}
                      onClick={() => handleTimeClick(time)}
                      disabled={status !== 'available'}
                      className={`p-4 rounded-lg ${bgColor} ${textColor} text-center transition-colors ${
                        status !== 'available' ? 'cursor-not-allowed opacity-50' : 'hover:opacity-80'
                      }`}
                    >
                      <div className="font-bold text-lg">{time}</div>
                      <div className="text-sm">{statusText}</div>
                    </button>
                  );
                })}
              </div>

              {selectedTime && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={20} className="text-primary" />
                    <span className="font-bold">الوقت المحدد: {selectedTime}</span>
                  </div>

                  {bookingMessage && (
                    <div className={`mb-4 p-3 rounded-lg ${
                      bookingMessage.includes('خطأ') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {bookingMessage}
                    </div>
                  )}

                  <button
                    onClick={handleConfirmBooking}
                    className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    تأكيد الحجز
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;