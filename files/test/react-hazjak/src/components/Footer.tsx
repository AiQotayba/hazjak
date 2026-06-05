import React from 'react';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-primary mb-4">حزجك</h3>
            <p className="text-gray-300 mb-6">
              منصة الحجز الأولى للملاعب الخماسية في حلب. نوفر لك أفضل الملاعب
              بأسعار تنافسية وجودة عالية.
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter size={24} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              <li><a href="#home" className="text-gray-300 hover:text-primary transition-colors">الرئيسية</a></li>
              <li><a href="#fields" className="text-gray-300 hover:text-primary transition-colors">الملاعب</a></li>
              <li><a href="#about" className="text-gray-300 hover:text-primary transition-colors">عن الموقع</a></li>
              <li><a href="#contact" className="text-gray-300 hover:text-primary transition-colors">اتصل بنا</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4">اتصل بنا</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-primary" />
                <span className="text-gray-300">حلب، سوريا</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-primary" />
                <span className="text-gray-300">+963 123 456 789</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-primary" />
                <span className="text-gray-300">info@hazjak.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2026 حزجك. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;