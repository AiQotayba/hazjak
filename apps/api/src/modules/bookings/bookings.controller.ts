import type { Response } from "express";
import { prisma } from "../../db";
import { getPagination, buildMeta, buildTableOrderBy, formatDate } from "@hazjak/utils";
import {
  createBookingSchema,
  updateBookingStatusSchema,
  ownerManualBookingSchema,
  bookingListQuerySchema,
} from "@hazjak/validation";
import type { AuthRequest } from "../../middlewares/auth";
import { param } from "../../utils/params";
import { sendError, sendPaginated, sendSuccess } from "../../utils/response";
import { icontains } from "../../utils/prisma-search";
import { notifyBookingStatus, createNotification } from "../../services/notification.service";
import { activateDepositRequest } from "../../services/booking-deposit.service";
import { BOOKING_EXPIRATION_MIN } from "@hazjak/constants";
import { calculatePrice } from "../stadiums/stadiums.controller";
import {
  computeDaySlots,
  localDateKey,
  localTimeValue,
} from "../../utils/booking-slots";
import {
  assertStatusTransition,
  expireStaleDepositBookings,
  isAwaitingDeposit,
} from "../../utils/booking-lifecycle";
import {
  sendWhatsAppMessage,
} from "../../services/whatsapp/whatsapp.service";
import {
  bookingConfirmedWhatsAppMessage,
  depositPaidOwnerWhatsAppMessage,
} from "../../services/whatsapp/messages";

async function hasConflict(
  stadiumId: string,
  start: Date,
  end: Date,
  excludeId?: string
) {
  const conflict = await prisma.booking.findFirst({
    where: {
      stadiumId,
      id: excludeId ? { not: excludeId } : undefined,
      status: { in: ["PENDING", "CONFIRMED"] },
      OR: [
        { startTime: { lte: start }, endTime: { gt: start } },
        { startTime: { lt: end }, endTime: { gte: end } },
        { startTime: { gte: start }, endTime: { lte: end } },
      ],
    },
  });
  return !!conflict;
}

export async function createBooking(req: AuthRequest, res: Response) {
  const body = createBookingSchema.parse(req.body);
  const start = new Date(body.startTime);
  const end = new Date(body.endTime);

  if (end <= start) {
    return sendError(res, "وقت النهاية يجب أن يكون بعد البداية", 400);
  }

  const stadium = await prisma.stadium.findUnique({
    where: { id: body.stadiumId },
  });
  if (!stadium || !stadium.isActive || stadium.isSuspended) {
    return sendError(res, "الملعب غير متاح", 404);
  }

  if (await hasConflict(body.stadiumId, start, end)) {
    return sendError(res, "هذا الموعد محجوز مسبقاً", 409);
  }

  const dateStr = localDateKey(start);
  const blockedDay = await prisma.stadiumBlockedDay.findFirst({
    where: {
      stadiumId: body.stadiumId,
      date: new Date(`${dateStr}T12:00:00.000Z`),
    },
  });
  if (blockedDay) {
    return sendError(res, "الملعب غير متاح في هذا اليوم", 409);
  }

  const dayStart = new Date(`${dateStr}T00:00:00`);
  const dayEnd = new Date(`${dateStr}T23:59:59.999`);
  const [dayBookings, windows] = await Promise.all([
    prisma.booking.findMany({
      where: {
        stadiumId: body.stadiumId,
        status: { in: ["PENDING", "CONFIRMED"] },
        startTime: { lte: dayEnd },
        endTime: { gte: dayStart },
      },
      select: { startTime: true, endTime: true },
    }),
    prisma.availabilitySlot.findMany({
      where: {
        stadiumId: body.stadiumId,
        startTime: { lte: dayEnd },
        endTime: { gte: dayStart },
      },
    }),
  ]);

  const timeValue = localTimeValue(start);
  const slotCheck = computeDaySlots({
    dateStr,
    dayBlocked: false,
    bookedRanges: dayBookings,
    availabilityWindows: windows,
  }).find((s) => s.value === timeValue);

  if (!slotCheck?.available) {
    return sendError(res, "هذا الموعد غير متاح", 409);
  }

  const totalPrice = calculatePrice(
    stadium.morningPrice,
    stadium.eveningPrice,
    start
  );

  const hasDeposit = !!(stadium.depositAmount && stadium.depositAmount > 0);

  const booking = await prisma.booking.create({
    data: {
      userId: req.user!.id,
      stadiumId: body.stadiumId,
      startTime: start,
      endTime: end,
      totalPrice,
      depositAmount: stadium.depositAmount,
      depositReferenceCode: null,
      notes: body.notes,
      status: "PENDING",
    },
    include: {
      stadium: { select: { name: true, ownerId: true, shamCashId: true, shamCashQrImage: true } },
      user: { select: { phone: true } },
    },
  });

  await createNotification(
    booking.stadium.ownerId,
    "طلب حجز جديد",
    `وصل طلب حجز جديد لملعب ${booking.stadium.name}. راجع الطلب من لوحة الحجوزات.`,
    "BOOKING_PENDING",
    booking.id
  );

  if (hasDeposit) {
    await activateDepositRequest({
      bookingId: booking.id,
      userId: req.user!.id,
      depositAmount: stadium.depositAmount!,
      stadium: booking.stadium,
      user: booking.user,
    });
    const fresh = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        stadium: { select: { name: true, ownerId: true, shamCashId: true, shamCashQrImage: true } },
        user: { select: { phone: true } },
      },
    });
    return sendSuccess(
      res,
      fresh,
      `تم الحجز — ادفع العربون خلال ${BOOKING_EXPIRATION_MIN} دقيقة عبر شام كاش (ستصلك التعليمات على واتساب)`,
      201
    );
  }

  await notifyBookingStatus(req.user!.id, booking.stadium.name, "PENDING", booking.id);

  return sendSuccess(res, booking, "تم إرسال طلب الحجز — بانتظار رد صاحب الملعب", 201);
}

export async function createOwnerManualBooking(req: AuthRequest, res: Response) {
  const body = ownerManualBookingSchema.parse(req.body);
  const start = new Date(body.startTime);
  const end = new Date(body.endTime);
  if (end <= start) {
    return sendError(res, "وقت النهاية يجب أن يكون بعد البداية", 400);
  }

  const stadium = await prisma.stadium.findUnique({ where: { id: body.stadiumId } });
  if (!stadium) return sendError(res, "الملعب غير موجود", 404);
  if (req.user!.role !== "ADMIN" && stadium.ownerId !== req.user!.id) {
    return sendError(res, "غير مصرح", 403);
  }

  if (await hasConflict(body.stadiumId, start, end)) {
    return sendError(res, "هذا الموعد محجوز مسبقاً", 409);
  }

  const totalPrice = calculatePrice(stadium.morningPrice, stadium.eveningPrice, start);
  const guestNote = `[حجز يدوي · ${body.guestName}${body.guestPhone ? ` · ${body.guestPhone}` : ""}]`;
  const notes = body.notes ? `${guestNote} ${body.notes}` : guestNote;

  const booking = await prisma.booking.create({
    data: {
      userId: req.user!.id,
      stadiumId: body.stadiumId,
      startTime: start,
      endTime: end,
      totalPrice,
      depositAmount: stadium.depositAmount,
      notes,
      status: body.status,
    },
    include: {
      stadium: { select: { name: true } },
      user: { select: { firstName: true, lastName: true, phone: true } },
    },
  });

  return sendSuccess(res, booking, "تم إنشاء الحجز", 201);
}

const BOOKING_SORT_FIELDS = [
  "startTime",
  "endTime",
  "totalPrice",
  "status",
  "createdAt",
] as const;

export async function listBookings(req: AuthRequest, res: Response) {
  await expireStaleDepositBookings();
  const query = bookingListQuerySchema.parse(req.query);
  const { page, limit, skip } = getPagination(query.page, query.limit);
  const { status, stadiumId, search, sort_field, sort_order } = query;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (stadiumId) where.stadiumId = stadiumId;

  if (req.user!.role === "USER") {
    where.userId = req.user!.id;
  } else if (req.user!.role === "STADIUM_OWNER") {
    const owned = await prisma.stadium.findMany({
      where: { ownerId: req.user!.id },
      select: { id: true },
    });
    where.stadiumId = { in: owned.map((s) => s.id) };
  }

  if (search?.trim()) {
    const q = search.trim();
    where.OR = [
      { stadium: { name: icontains(q) } },
      { stadium: { city: icontains(q) } },
      { user: { firstName: icontains(q) } },
      { user: { lastName: icontains(q) } },
      { user: { phone: icontains(q) } },
      { notes: icontains(q) },
    ];
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      orderBy: buildTableOrderBy(sort_field, sort_order, BOOKING_SORT_FIELDS, {
        startTime: "desc",
      }),
      include: {
        stadium: {
          select: {
            id: true,
            name: true,
            slug: true,
            coverImage: true,
            city: true,
            area: true,
            contactPhone: true,
            contactWhatsapp: true,
          },
        },
        user: {
          select: { id: true, firstName: true, lastName: true, phone: true },
        },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  const data = bookings.map((b) => ({
    ...b,
    stadium: {
      ...b.stadium,
      contactPhone:
        b.status === "CONFIRMED" || b.status === "COMPLETED"
          ? b.stadium.contactPhone
          : undefined,
      contactWhatsapp:
        b.status === "CONFIRMED" || b.status === "COMPLETED"
          ? b.stadium.contactWhatsapp
          : undefined,
    },
  }));

  return sendPaginated(res, data, buildMeta(total, page, limit));
}

export async function getBooking(req: AuthRequest, res: Response) {
  await expireStaleDepositBookings();
  const id = param(req, "id");
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      stadium: true,
      user: { select: { id: true, firstName: true, lastName: true, phone: true } },
      payment: true,
      review: true,
    },
  });
  if (!booking) return sendError(res, "الحجز غير موجود", 404);

  const canView =
    req.user!.role === "ADMIN" ||
    booking.userId === req.user!.id ||
    (req.user!.role === "STADIUM_OWNER" &&
      booking.stadium.ownerId === req.user!.id);

  if (!canView) return sendError(res, "غير مصرح", 403);

  const showContact =
    booking.status === "CONFIRMED" || booking.status === "COMPLETED";

  return sendSuccess(res, {
    ...booking,
    stadium: {
      ...booking.stadium,
      contactPhone: showContact ? booking.stadium.contactPhone : undefined,
      contactWhatsapp: showContact ? booking.stadium.contactWhatsapp : undefined,
    },
  });
}

export async function confirmDeposit(req: AuthRequest, res: Response) {
  await expireStaleDepositBookings();
  const id = param(req, "id");

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      stadium: {
        select: {
          name: true,
          ownerId: true,
          contactWhatsapp: true,
          owner: { select: { phone: true, firstName: true } },
        },
      },
      user: { select: { firstName: true, lastName: true, phone: true } },
    },
  });

  if (!booking) return sendError(res, "الحجز غير موجود", 404);
  if (booking.userId !== req.user!.id) return sendError(res, "غير مصرح", 403);
  if (!isAwaitingDeposit(booking)) {
    return sendError(res, "لا يوجد عربون بانتظار التأكيد", 400);
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { depositPaidAt: new Date() },
    include: {
      stadium: true,
      user: { select: { id: true, firstName: true, lastName: true, phone: true } },
    },
  });

  const playerName = `${booking.user.firstName} ${booking.user.lastName}`;
  await createNotification(
    booking.stadium.ownerId,
    "اللاعب أكّد دفع العربون",
    `${playerName} أكّد دفع العربون لحجز ${booking.stadium.name}. راجع التحويل ثم أكّد الحجز.`,
    "DEPOSIT_REMINDER",
    booking.id
  );

  const ownerPhone =
    booking.stadium.contactWhatsapp ?? booking.stadium.owner.phone ?? null;
  if (ownerPhone && booking.depositReferenceCode) {
    const msg = depositPaidOwnerWhatsAppMessage({
      playerName,
      stadiumName: booking.stadium.name,
      referenceCode: booking.depositReferenceCode,
    });
    await sendWhatsAppMessage(ownerPhone, msg);
  }

  return sendSuccess(
    res,
    {
      ...updated,
      stadium: {
        ...updated.stadium,
        contactPhone: undefined,
        contactWhatsapp: undefined,
      },
    },
    "تم استلام إبلاغك — صاحب الملعب سيراجع التحويل ويؤكد الحجز"
  );
}

export async function updateStatus(req: AuthRequest, res: Response) {
  await expireStaleDepositBookings();
  const { status, cancelledReason, requireDeposit } = updateBookingStatusSchema.parse(req.body);
  const id = param(req, "id");
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      stadium: {
        select: {
          name: true,
          ownerId: true,
          depositAmount: true,
          shamCashId: true,
          shamCashQrImage: true,
          contactWhatsapp: true,
        },
      },
      user: { select: { phone: true, firstName: true, lastName: true } },
    },
  });
  if (!booking) return sendError(res, "الحجز غير موجود", 404);

  const isOwner = booking.stadium.ownerId === req.user!.id;
  const isAdmin = req.user!.role === "ADMIN";
  const isUser = booking.userId === req.user!.id;

  if (status === "CANCELLED" && !isUser && !isAdmin) {
    return sendError(res, "غير مصرح", 403);
  }
  if (["CONFIRMED", "REJECTED", "COMPLETED", "NO_SHOW"].includes(status) && !isOwner && !isAdmin) {
    return sendError(res, "غير مصرح", 403);
  }

  if (requireDeposit) {
    if (!isOwner && !isAdmin) return sendError(res, "غير مصرح", 403);
    try {
      assertStatusTransition(booking, status, { requireDeposit: true });
    } catch (e) {
      return sendError(res, e instanceof Error ? e.message : "انتقال غير مسموح", 400);
    }

    const depositAmount = booking.stadium.depositAmount;
    if (!depositAmount || depositAmount <= 0) {
      return sendError(res, "لا يوجد عربون مُعرّف للملعب", 400);
    }

    await activateDepositRequest({
      bookingId: booking.id,
      userId: booking.userId,
      depositAmount,
      referenceCode: booking.depositReferenceCode,
      stadium: booking.stadium,
      user: booking.user,
    });

    const updated = await prisma.booking.findUnique({
      where: { id },
      include: {
        stadium: {
          select: { name: true, shamCashId: true, shamCashQrImage: true, contactWhatsapp: true },
        },
        user: { select: { phone: true } },
      },
    });

    return sendSuccess(
      res,
      updated,
      `أُرسلت تعليمات العربون للاعب (${BOOKING_EXPIRATION_MIN} دقيقة لإتمام الدفع)`
    );
  }

  try {
    assertStatusTransition(booking, status);
  } catch (e) {
    return sendError(res, e instanceof Error ? e.message : "انتقال غير مسموح", 400);
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status, cancelledReason },
    include: {
      stadium: { select: { name: true, shamCashId: true } },
      user: { select: { phone: true } },
    },
  });

  await notifyBookingStatus(booking.userId, updated.stadium.name, status, booking.id);

  if (status === "CONFIRMED" && updated.user.phone) {
    const startLabel = formatDate(booking.startTime, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    await sendWhatsAppMessage(
      updated.user.phone,
      bookingConfirmedWhatsAppMessage({
        stadiumName: updated.stadium.name,
        startLabel,
        totalPrice: booking.totalPrice,
      })
    );
  }

  return sendSuccess(res, updated, "تم تحديث حالة الحجز");
}

export async function rebook(req: AuthRequest, res: Response) {
  const original = await prisma.booking.findUnique({
    where: { id: param(req, "id") },
    include: { stadium: true },
  });
  if (!original || original.userId !== req.user!.id) {
    return sendError(res, "الحجز غير موجود", 404);
  }

  req.body = {
    stadiumId: original.stadiumId,
    startTime: original.startTime.toISOString(),
    endTime: original.endTime.toISOString(),
    notes: original.notes,
  };
  return createBooking(req, res);
}

export async function upcoming(req: AuthRequest, res: Response) {
  req.query.status = "CONFIRMED";
  const bookings = await prisma.booking.findMany({
    where: {
      userId: req.user!.id,
      status: { in: ["PENDING", "CONFIRMED"] },
      startTime: { gte: new Date() },
    },
    orderBy: { startTime: "asc" },
    take: 10,
    include: {
      stadium: { select: { name: true, slug: true, coverImage: true, city: true } },
    },
  });
  return sendSuccess(res, bookings);
}

export async function history(req: AuthRequest, res: Response) {
  const bookings = await prisma.booking.findMany({
    where: {
      userId: req.user!.id,
      status: { in: ["COMPLETED", "CANCELLED", "REJECTED", "NO_SHOW", "EXPIRED"] },
    },
    orderBy: { startTime: "desc" },
    take: 20,
    include: {
      stadium: { select: { name: true, slug: true, coverImage: true } },
    },
  });
  return sendSuccess(res, bookings);
}
