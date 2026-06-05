import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Field {
  id: number;
  name: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  image: string;
  available: boolean;
  statusTag: string;
}

export interface Booking {
  id: string;
  fieldId: number;
  fieldName: string;
  date: string;
  time: string;
  userId: string;
  userName: string;
  phone?: string;
  status: 'available' | 'booked' | 'deposit';
}

interface BookingContextType {
  fields: Field[];
  bookings: Booking[];
  selectedField: Field | null;
  selectedDate: string | null;
  selectedTime: string | null;
  isBookingModalOpen: boolean;
  isAuthModalOpen: boolean;
  setSelectedField: (field: Field | null) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTime: (time: string | null) => void;
  setBookingModalOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
  createBooking: (booking: Omit<Booking, 'id'>) => Promise<boolean>;
  loadBookings: (fieldId: number) => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

interface BookingProviderProps {
  children: ReactNode;
}

const mockFields: Field[] = [
  { id: 1, name: "ملعب الأولمبي الخماسي", location: "حلب - حي الموكامبو", rating: 4.9, reviews: 124, price: 60000, image: "https://images.unsplash.com/photo-1600066975952-912a81940822?q=80&w=2070&auto=format", available: true, statusTag: "متاح الآن" },
  { id: 2, name: "أكاديمية النجوم", location: "حلب - المحافظة", rating: 4.7, reviews: 89, price: 55000, image: "https://images.unsplash.com/photo-1547461056-317b672e08eb?q=80&w=2070&auto=format", available: false, statusTag: "متاح لاحقاً" },
  { id: 3, name: "ملعب القمة", location: "حلب - سيف الدولة", rating: 4.5, reviews: 210, price: 45000, image: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=2070&auto=format", available: true, statusTag: "متاح الآن" },
  { id: 4, name: "استاد الباسل الرياضي", location: "حلب - المعادي", rating: 4.8, reviews: 98, price: 70000, image: "https://images.unsplash.com/photo-1575361204036-afd975d5ecef?q=80&w=2070&auto=format", available: true, statusTag: "متاح الآن" },
  { id: 5, name: "أرض الشجعان", location: "حلب - السليمانية", rating: 4.6, reviews: 76, price: 52000, image: "https://images.unsplash.com/photo-1552667466-07770ae110d0?q=80&w=2070&auto=format", available: false, statusTag: "متاح لاحقاً" },
  { id: 6, name: "ملعب السلطان", location: "حلب - السلطان", rating: 4.4, reviews: 65, price: 48000, image: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?q=80&w=2070&auto=format", available: true, statusTag: "متاح الآن" },
  { id: 7, name: "ملعب العلي", location: "حلب - العلي", rating: 4.3, reviews: 52, price: 42000, image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=2070&auto=format", available: true, statusTag: "متاح الآن" },
  { id: 8, name: "ملعب الريشي", location: "حلب - الريشي", rating: 4.7, reviews: 88, price: 58000, image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2070&auto=format", available: false, statusTag: "متاح لاحقاً" }
];

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const [fields] = useState<Field[]>(mockFields);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const createBooking = async (bookingData: Omit<Booking, 'id'>): Promise<boolean> => {
    const newBooking: Booking = {
      ...bookingData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setBookings(prev => [...prev, newBooking]);
    return true;
  };

  const loadBookings = async (fieldId: number) => {
    // Mock bookings
    const mockBookings: Booking[] = [
      { id: '1', fieldId: 1, fieldName: 'ملعب الأولمبي الخماسي', date: '2026-05-10', time: '08:00', userId: '1', userName: 'أحمد', status: 'booked' },
      { id: '2', fieldId: 1, fieldName: 'ملعب الأولمبي الخماسي', date: '2026-05-10', time: '09:30', userId: '2', userName: 'محمد', status: 'deposit' },
    ];
    setBookings(mockBookings.filter(b => b.fieldId === fieldId));
  };

  const value: BookingContextType = {
    fields,
    bookings,
    selectedField,
    selectedDate,
    selectedTime,
    isBookingModalOpen,
    isAuthModalOpen,
    setSelectedField,
    setSelectedDate,
    setSelectedTime,
    setBookingModalOpen,
    setAuthModalOpen,
    createBooking,
    loadBookings,
  };

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};