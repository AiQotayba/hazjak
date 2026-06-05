import React, { useState } from 'react';
import { Menu, X, User, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBooking } from '../contexts/BookingContext';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { setAuthModalOpen, setBookingModalOpen } = useBooking();

  const handleAuthClick = () => {
    if (isAuthenticated) {
      alert(`مرحباً ${user?.name}!`);
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleBookingClick = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
    } else {
      // Scroll to fields section
      document.getElementById('fields')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">حزجك</h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
            <a href="#home" className="text-gray-700 hover:text-primary transition-colors">الرئيسية</a>
            <a href="#fields" className="text-gray-700 hover:text-primary transition-colors">الملاعب</a>
            <a href="#about" className="text-gray-700 hover:text-primary transition-colors">عن الموقع</a>
            <a href="#contact" className="text-gray-700 hover:text-primary transition-colors">اتصل بنا</a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4 space-x-reverse">
            <button
              onClick={handleBookingClick}
              className="btn-primary flex items-center gap-2"
            >
              <Calendar size={18} />
              احجز الآن
            </button>
            <button
              onClick={handleAuthClick}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary transition-colors"
            >
              <User size={18} />
              {isAuthenticated ? 'حسابي' : 'التسجيل'}
            </button>
            {isAuthenticated && (
              <button
                onClick={logout}
                className="text-red-600 hover:text-red-800 transition-colors"
              >
                تسجيل خروج
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-primary"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <a href="#home" className="text-gray-700 hover:text-primary transition-colors">الرئيسية</a>
              <a href="#fields" className="text-gray-700 hover:text-primary transition-colors">الملاعب</a>
              <a href="#about" className="text-gray-700 hover:text-primary transition-colors">عن الموقع</a>
              <a href="#contact" className="text-gray-700 hover:text-primary transition-colors">اتصل بنا</a>
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <button
                  onClick={handleBookingClick}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Calendar size={18} />
                  احجز الآن
                </button>
                <button
                  onClick={handleAuthClick}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 hover:text-primary transition-colors"
                >
                  <User size={18} />
                  {isAuthenticated ? 'حسابي' : 'التسجيل'}
                </button>
                {isAuthenticated && (
                  <button
                    onClick={logout}
                    className="w-full text-red-600 hover:text-red-800 transition-colors"
                  >
                    تسجيل خروج
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;