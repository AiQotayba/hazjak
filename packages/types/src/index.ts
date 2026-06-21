export type Role = "ADMIN" | "STADIUM_OWNER" | "USER";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED"
  | "EXPIRED"
  | "NO_SHOW";

export type PaymentStatus =
  | "PENDING"
  | "PARTIALLY_PAID"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type NotificationType =
  | "BOOKING_PENDING"
  | "BOOKING_CONFIRMED"
  | "BOOKING_REJECTED"
  | "BOOKING_CANCELLED"
  | "MATCH_REMINDER"
  | "DEPOSIT_REMINDER";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string | null;
  role: Role;
  isPhoneVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  user: AuthUser;
}
