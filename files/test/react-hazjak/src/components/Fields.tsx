import React, { useState, useEffect } from 'react';
import { Star, MapPin, Clock } from 'lucide-react';
import { useBooking } from '../contexts/BookingContext';
import { useAuth } from '../contexts/AuthContext';

const Fields: React.FC = () => {
  const { fields, setSelectedField, setBookingModalOpen, setAuthModalOpen } = useBooking();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleBookClick = (field: any) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
    } else {
      setSelectedField(field);
      setBookingModalOpen(true);
    }
  };

  if (loading) {
    return (
      <section id="fields" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              أفضل الملاعب الخماسية في حلب
            </h2>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="fields" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            أفضل الملاعب الخماسية في حلب
          </h2>
          <p className="text-xl text-gray-600">
            اختر الملعب المناسب لك من بين أفضل الملاعب في المدينة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {fields.map((field) => (
            <div
              key={field.id}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 group flex flex-col h-full"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={field.image}
                  alt={field.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7Yp9mF2KfZhSDYp9mF2KfZhTwvdGV4dD48L3N2Zz4=';
                  }}
                />

                {/* Rating */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-bold shadow-sm">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span>{field.rating}</span>
                  <span className="text-gray-400 text-xs">({field.reviews})</span>
                </div>

                {/* Status */}
                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1.5 backdrop-blur-sm ${
                  field.available ? 'bg-green-500/90' : 'bg-orange-500/90'
                }`}>
                  <Clock size={14} />
                  {field.statusTag}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary transition">
                  {field.name}
                </h3>

                <div className="flex items-center gap-2 text-gray-500 mb-6 text-sm">
                  <MapPin size={16} />
                  {field.location}
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="font-bold text-lg text-primary">
                    {field.price.toLocaleString()} ل.س / ساعة
                  </div>
                  <button
                    onClick={() => handleBookClick(field)}
                    className="px-5 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl font-bold transition-colors"
                  >
                    احجز الآن
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Fields;