export type OwnerStadiumData = {
  id: string;
  slug: string;
  name: string;
  description: string;
  city: string;
  area: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  morningPrice: number;
  eveningPrice: number;
  depositAmount: number | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  shamCashId: string | null;
  shamCashQrImage: string | null;
  coverImage: string | null;
  videoUrl: string | null;
  sportType?: string;
  isActive?: boolean;
  isSuspended?: boolean;
  images?: { id: string; imageUrl: string; sortOrder?: number }[];
};

export const ownerInputClass =
  "border border-input bg-background shadow-none rounded-lg h-11";
