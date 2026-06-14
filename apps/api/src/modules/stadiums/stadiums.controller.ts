import type { Response } from "express";
import { prisma, type Prisma } from "../../db";
import { slugify, getPagination, buildMeta, buildTableOrderBy, isMorningSlot } from "@hazjak/utils";
import {
  createStadiumSchema,
  updateStadiumSchema,
  adminCreateStadiumSchema,
  adminUpdateStadiumSchema,
  stadiumFiltersSchema,
  adminStadiumListQuerySchema,
  addStadiumImageSchema,
} from "@hazjak/validation";
import type { AuthRequest } from "../../middlewares/auth";
import { param } from "../../utils/params";
import { sendError, sendPaginated, sendSuccess } from "../../utils/response";
import { computeDaySlots } from "../../utils/booking-slots";
import { icontains } from "../../utils/prisma-search";

function redactPublicContacts<T extends { contactPhone?: string | null; contactWhatsapp?: string | null }>(
  stadium: T
) {
  const { contactPhone: _p, contactWhatsapp: _w, ...rest } = stadium;
  return { ...rest, showContact: false };
}

export async function listStadiums(req: AuthRequest, res: Response) {
  const filters = stadiumFiltersSchema.parse(req.query);
  const { page, limit, skip } = getPagination(filters.page, filters.limit);

  const where: Prisma.StadiumWhereInput = {
    isActive: true,
    isSuspended: false,
    ...(filters.city && { city: filters.city }),
    ...(filters.area && { area: filters.area }),
    ...(filters.search && {
      OR: [
        { name: icontains(filters.search) },
        { area: icontains(filters.search) },
        { city: icontains(filters.search) },
      ],
    }),
    ...(filters.minPrice && { eveningPrice: { gte: filters.minPrice } }),
    ...(filters.maxPrice && { morningPrice: { lte: filters.maxPrice } }),
  };

  const orderBy: Prisma.StadiumOrderByWithRelationInput =
    filters.sortBy === "price"
      ? { morningPrice: filters.order ?? "asc" }
      : filters.sortBy === "name"
        ? { name: filters.order ?? "asc" }
        : { createdAt: filters.order ?? "desc" };

  const [stadiums, total] = await Promise.all([
    prisma.stadium.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        images: { take: 3 },
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true } },
      },
    }),
    prisma.stadium.count({ where }),
  ]);

  const data = stadiums.map((s) => {
    const ratings = s.reviews ?? [];
    const avg =
      ratings.length > 0
        ? ratings.reduce((a: number, r: { rating: number }) => a + r.rating, 0) / ratings.length
        : 0;
    const { reviews: _r, ...rest } = s;
    return {
      ...redactPublicContacts(rest),
      averageRating: Math.round(avg * 10) / 10,
      reviewCount: s._count.reviews,
    };
  });

  return sendPaginated(res, data, buildMeta(total, page, limit));
}

export async function myStadiums(req: AuthRequest, res: Response) {
  const where =
    req.user!.role === "ADMIN"
      ? {}
      : { ownerId: req.user!.id };

  const stadiums = await prisma.stadium.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      images: true,
      _count: { select: { bookings: true, reviews: true } },
    },
  });
  return sendSuccess(res, stadiums);
}

const ADMIN_STADIUM_SORT_FIELDS = [
  "name",
  "city",
  "area",
  "morningPrice",
  "eveningPrice",
  "isActive",
  "isSuspended",
  "createdAt",
] as const;

export async function adminListStadiums(req: AuthRequest, res: Response) {
  const query = adminStadiumListQuerySchema.parse(req.query);
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const { search, sort_field, sort_order } = query;

  const where: Prisma.StadiumWhereInput = {
    ...(search && {
      OR: [
        { name: icontains(search) },
        { city: icontains(search) },
        { area: icontains(search) },
        {
          owner: {
            OR: [
              { firstName: icontains(search) },
              { lastName: icontains(search) },
              { email: icontains(search) },
            ],
          },
        },
      ],
    }),
  };

  const [stadiums, total] = await Promise.all([
    prisma.stadium.findMany({
      where,
      skip,
      take: limit,
      orderBy: buildTableOrderBy(sort_field, sort_order, ADMIN_STADIUM_SORT_FIELDS, {
        createdAt: "desc",
      }),
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { bookings: true, reviews: true } },
      },
    }),
    prisma.stadium.count({ where }),
  ]);

  return sendPaginated(res, stadiums, buildMeta(total, page, limit));
}

export async function getStadium(req: AuthRequest, res: Response) {
  const idOrSlug = param(req, "idOrSlug");
  const stadium = await prisma.stadium.findFirst({
    where: {
      OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      isActive: true,
    },
    include: {
      images: true,
      owner: { select: { id: true, firstName: true, lastName: true } },
      reviews: {
        include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      availabilitySlots: {
        where: { isAvailable: true, startTime: { gte: new Date() } },
        orderBy: { startTime: "asc" },
        take: 30,
      },
    },
  });

  if (!stadium || stadium.isSuspended) {
    return sendError(res, "الملعب غير موجود", 404);
  }

  const avg =
    stadium.reviews.length > 0
      ? stadium.reviews.reduce((a, r) => a + r.rating, 0) / stadium.reviews.length
      : 0;

  return sendSuccess(res, {
    ...redactPublicContacts(stadium),
    averageRating: Math.round(avg * 10) / 10,
  });
}

async function assertStadiumOwner(userId: string) {
  const owner = await prisma.user.findUnique({ where: { id: userId } });
  if (!owner || owner.role !== "STADIUM_OWNER") {
    return null;
  }
  return owner;
}

export async function createStadium(req: AuthRequest, res: Response) {
  const body = createStadiumSchema.parse(req.body);
  let slug = slugify(body.name);
  const existing = await prisma.stadium.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const stadium = await prisma.stadium.create({
    data: { ...body, slug, ownerId: req.user!.id },
    include: { images: true },
  });
  return sendSuccess(res, stadium, "تم إنشاء الملعب", 201);
}

export async function adminCreateStadium(req: AuthRequest, res: Response) {
  const body = adminCreateStadiumSchema.parse(req.body);
  const owner = await assertStadiumOwner(body.ownerId);
  if (!owner) return sendError(res, "صاحب الملعب غير صالح", 400);

  let slug = slugify(body.name);
  const existing = await prisma.stadium.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const { ownerId, ...rest } = body;
  const stadium = await prisma.stadium.create({
    data: { ...rest, slug, ownerId },
    include: {
      owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      _count: { select: { bookings: true, reviews: true } },
    },
  });
  return sendSuccess(res, stadium, "تم إنشاء الملعب", 201);
}

export async function updateStadium(req: AuthRequest, res: Response) {
  const id = param(req, "id");
  const stadium = await prisma.stadium.findUnique({ where: { id } });
  if (!stadium) return sendError(res, "الملعب غير موجود", 404);
  if (req.user!.role !== "ADMIN" && stadium.ownerId !== req.user!.id) {
    return sendError(res, "لا يمكنك تعديل هذا الملعب", 403);
  }

  if (req.user!.role === "ADMIN") {
    const body = adminUpdateStadiumSchema.parse(req.body);
    if (body.ownerId) {
      const owner = await assertStadiumOwner(body.ownerId);
      if (!owner) return sendError(res, "صاحب الملعب غير صالح", 400);
    }
    const { ownerId, isActive, isSuspended, ...rest } = body;
    const updated = await prisma.stadium.update({
      where: { id },
      data: {
        ...rest,
        ...(ownerId !== undefined && { ownerId }),
        ...(isActive !== undefined && { isActive }),
        ...(isSuspended !== undefined && { isSuspended }),
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        images: true,
        _count: { select: { bookings: true, reviews: true } },
      },
    });
    return sendSuccess(res, updated, "تم تحديث الملعب");
  }

  const body = updateStadiumSchema.parse(req.body);
  const updated = await prisma.stadium.update({
    where: { id },
    data: body,
    include: { images: true },
  });
  return sendSuccess(res, updated, "تم تحديث الملعب");
}

export async function deleteStadium(req: AuthRequest, res: Response) {
  const id = param(req, "id");
  const stadium = await prisma.stadium.findUnique({ where: { id } });
  if (!stadium) return sendError(res, "الملعب غير موجود", 404);
  if (req.user!.role !== "ADMIN" && stadium.ownerId !== req.user!.id) {
    return sendError(res, "لا يمكنك حذف هذا الملعب", 403);
  }
  await prisma.stadium.update({
    where: { id },
    data: { isActive: false },
  });
  return sendSuccess(res, null, "تم حذف الملعب");
}

export async function getAvailability(req: AuthRequest, res: Response) {
  const stadiumId = param(req, "id");
  const startDate = req.query.startDate
    ? new Date(req.query.startDate as string)
    : new Date();
  const endDate = req.query.endDate
    ? new Date(req.query.endDate as string)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const [slots, bookings, blockedDays] = await Promise.all([
    prisma.availabilitySlot.findMany({
      where: {
        stadiumId,
        startTime: { gte: startDate, lte: endDate },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.booking.findMany({
      where: {
        stadiumId,
        status: { in: ["PENDING", "CONFIRMED"] },
        startTime: { gte: startDate, lte: endDate },
      },
      select: { startTime: true, endTime: true },
    }),
    prisma.stadiumBlockedDay.findMany({
      where: { stadiumId },
      orderBy: { date: "asc" },
    }),
  ]);

  return sendSuccess(res, { slots, bookedRanges: bookings, blockedDays });
}

export async function getBookingSlots(req: AuthRequest, res: Response) {
  const stadiumId = param(req, "id");
  const date = req.query.date as string | undefined;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return sendError(res, "تاريخ غير صالح", 400);
  }

  const stadium = await prisma.stadium.findUnique({ where: { id: stadiumId } });
  if (!stadium || !stadium.isActive || stadium.isSuspended) {
    return sendError(res, "الملعب غير موجود", 404);
  }

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(`${date}T23:59:59.999`);

  const [bookings, windows, blockedDay] = await Promise.all([
    prisma.booking.findMany({
      where: {
        stadiumId,
        status: { in: ["PENDING", "CONFIRMED"] },
        startTime: { lte: dayEnd },
        endTime: { gte: dayStart },
      },
      select: { startTime: true, endTime: true },
    }),
    prisma.availabilitySlot.findMany({
      where: {
        stadiumId,
        startTime: { lte: dayEnd },
        endTime: { gte: dayStart },
      },
    }),
    prisma.stadiumBlockedDay.findFirst({
      where: {
        stadiumId,
        date: new Date(`${date}T12:00:00.000Z`),
      },
    }),
  ]);

  const slots = computeDaySlots({
    dateStr: date,
    dayBlocked: !!blockedDay,
    bookedRanges: bookings,
    availabilityWindows: windows,
  });

  return sendSuccess(res, {
    date,
    dayBlocked: !!blockedDay,
    slots,
  });
}

export function calculatePrice(
  morningPrice: number,
  eveningPrice: number,
  start: Date
) {
  return isMorningSlot(start) ? morningPrice : eveningPrice;
}

export async function addStadiumImage(req: AuthRequest, res: Response) {
  const id = param(req, "id");
  const { imageUrl } = addStadiumImageSchema.parse(req.body);
  const stadium = await prisma.stadium.findUnique({ where: { id } });
  if (!stadium) return sendError(res, "الملعب غير موجود", 404);
  if (req.user!.role !== "ADMIN" && stadium.ownerId !== req.user!.id) {
    return sendError(res, "غير مصرح", 403);
  }
  const image = await prisma.stadiumImage.create({
    data: { stadiumId: id, imageUrl },
  });
  return sendSuccess(res, image, "تمت إضافة الصورة", 201);
}

export async function deleteStadiumImage(req: AuthRequest, res: Response) {
  const stadiumId = param(req, "id");
  const imageId = param(req, "imageId");
  const image = await prisma.stadiumImage.findFirst({
    where: { id: imageId, stadiumId },
    include: { stadium: true },
  });
  if (!image) return sendError(res, "الصورة غير موجودة", 404);
  if (req.user!.role !== "ADMIN" && image.stadium.ownerId !== req.user!.id) {
    return sendError(res, "غير مصرح", 403);
  }
  await prisma.stadiumImage.delete({ where: { id: imageId } });
  return sendSuccess(res, null, "تم حذف الصورة");
}
