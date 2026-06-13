import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(2, "الاسم الأول مطلوب"),
  lastName: z.string().min(2, "اسم العائلة مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  phone: z.string().optional(),
  password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل"),
  role: z.enum(["USER", "STADIUM_OWNER"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
  otp: z.string().length(6, "رمز التحقق 6 أرقام"),
  password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل"),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "رمز التحقق 6 أرقام"),
});

export const createStadiumSchema = z.object({
  name: z.string().min(2, "اسم الملعب مطلوب"),
  description: z.string().min(10, "الوصف مطلوب"),
  city: z.string().min(2),
  area: z.string().min(2),
  address: z.string().min(5),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  morningPrice: z.number().positive("سعر الصباح مطلوب"),
  eveningPrice: z.number().positive("سعر المساء مطلوب"),
  depositAmount: z.number().nonnegative().optional(),
  contactPhone: z.string().optional(),
  contactWhatsapp: z.string().optional(),
  shamCashId: z.string().max(100).optional(),
  shamCashQrImage: z.string().optional(),
  coverImage: z
    .string()
    .optional()
    .transform((s) => (s?.trim() ? s.trim() : undefined))
    .refine((s) => !s || z.string().url().safeParse(s).success, "رابط الصورة غير صالح"),
  sportType: z
    .enum(["FOOTBALL", "FUTSAL", "BASKETBALL", "BASEBALL", "OTHER"])
    .optional(),
});

export const updateStadiumSchema = createStadiumSchema.partial();

/** Admin creates a stadium on behalf of a stadium owner */
export const adminCreateStadiumSchema = createStadiumSchema.extend({
  ownerId: z.string().uuid("اختر صاحب الملعب"),
});

export const adminUpdateStadiumSchema = createStadiumSchema.partial().extend({
  ownerId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  isSuspended: z.boolean().optional(),
});

export const createBookingSchema = z.object({
  stadiumId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  notes: z.string().max(500).optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "COMPLETED",
    "CANCELLED",
    "REJECTED",
    "EXPIRED",
    "NO_SHOW",
  ]),
  cancelledReason: z.string().optional(),
});

export const createReviewSchema = z.object({
  bookingId: z.string().uuid(),
  stadiumId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const reviewReplySchema = z.object({
  ownerReply: z.string().min(1).max(1000),
});

export const createAvailabilitySchema = z.object({
  stadiumId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
});

export const createBlockedDaySchema = z.object({
  stadiumId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ غير صالح YYYY-MM-DD"),
  reason: z.string().max(200).optional(),
});

export const addStadiumImageSchema = z.object({
  imageUrl: z.string().url("رابط الصورة غير صالح"),
});

export const ownerManualBookingSchema = z.object({
  stadiumId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  guestName: z.string().min(2, "اسم الضيف مطلوب"),
  guestPhone: z.string().optional(),
  notes: z.string().max(500).optional(),
  status: z.enum(["PENDING", "CONFIRMED"]).default("CONFIRMED"),
});

export const tableListQuerySchema = z.object({
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  search: z.string().optional(),
  sort_field: z.string().optional(),
  sort_order: z.enum(["asc", "desc"]).optional(),
});

export const bookingListQuerySchema = tableListQuerySchema.extend({
  status: z.string().optional(),
  stadiumId: z.string().uuid().optional(),
});

export const userListQuerySchema = tableListQuerySchema.extend({
  role: z.enum(["USER", "STADIUM_OWNER", "ADMIN"]).optional(),
});

export const adminStadiumListQuerySchema = tableListQuerySchema;

export const updateProfileSchema = z.object({
  firstName: z.string().min(2, "الاسم الأول حرفان على الأقل").optional(),
  lastName: z.string().min(2, "اسم العائلة حرفان على الأقل").optional(),
  phone: z.string().optional(),
  avatar: z.string().url("رابط الصورة غير صالح").nullable().optional(),
});

export const stadiumFiltersSchema = z.object({
  search: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  rating: z.coerce.number().optional(),
  available: z.coerce.boolean().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  sortBy: z.enum(["name", "price", "rating", "createdAt"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateStadiumInput = z.infer<typeof createStadiumSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
