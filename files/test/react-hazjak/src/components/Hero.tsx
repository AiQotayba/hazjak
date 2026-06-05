import React from 'react';
import { Calendar, MapPin, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';

const Hero: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { setAuthModalOpen } = useBooking();

  const handleBookingClick = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
    } else {
      document.getElementById('fields')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            احجز ملعبك في حلب
            <br />
            <span className="text-blue-200">بسهولة وسرعة</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100">
            أفضل الملاعب الخماسية في حلب تحت تصرفك
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <div className="bg-white/10 rounded-full p-4 mb-4">
                <MapPin size={32} />
              </div>
              <div className="text-2xl font-bold">8</div>
              <div className="text-blue-200">ملاعب متاحة</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/10 rounded-full p-4 mb-4">
                <Calendar size={32} />
              </div>
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-blue-200">حجز متواصل</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/10 rounded-full p-4 mb-4">
                <Star size={32} />
              </div>
              <div className="text-2xl font-bold">4.7</div>
              <div className="text-blue-200">تقييم العملاء</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleBookingClick}
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-lg text-lg transition-colors flex items-center justify-center gap-2"
            >
              <Calendar size={20} />
              ابدأ الحجز الآن
            </button>
            <a
              href="#fields"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              تصفح الملاعب
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;