export type AdminStadiumRecord = {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  area: string;
  morningPrice: number;
  eveningPrice: number;
  depositAmount: number | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  coverImage: string | null;
  isActive: boolean;
  isSuspended: boolean;
  owner: { id: string; firstName: string; lastName: string; email: string };
  _count: { bookings: number; reviews: number };
};
