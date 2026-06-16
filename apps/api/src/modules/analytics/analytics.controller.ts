import type { Response } from "express";
import { prisma } from "../../db";
import { isMorningSlot } from "@hazjak/utils";
import type { AuthRequest } from "../../middlewares/auth";
import {
  isConfirmedBooking,
  isRevenueEligible,
  sumEligibleRevenue,
  sumUpcomingRevenue,
} from "../../utils/revenue";
import { sendSuccess } from "../../utils/response";

export async function dashboard(req: AuthRequest, res: Response) {
  const ownerId = req.user!.id;
  const stadiums = await prisma.stadium.findMany({
    where: req.user!.role === "ADMIN" ? {} : { ownerId },
    select: { id: true },
  });
  const stadiumIds = stadiums.map((s) => s.id);

  const bookings = await prisma.booking.findMany({
    where: { stadiumId: { in: stadiumIds } },
    select: { status: true, totalPrice: true, startTime: true, endTime: true },
  });

  const now = new Date();
  const revenueEligible = bookings.filter((b) => isRevenueEligible(b, now));
  const revenue = sumEligibleRevenue(bookings, now);
  const upcomingRevenue = sumUpcomingRevenue(bookings, now);
  const confirmedBookings = bookings.filter((b) => isConfirmedBooking(b.status)).length;
  const morning = revenueEligible.filter((b) => isMorningSlot(b.startTime)).length;
  const evening = revenueEligible.length - morning;
  const cancelled = bookings.filter((b) => b.status === "CANCELLED").length;
  const cancellationRate =
    bookings.length > 0 ? Math.round((cancelled / bookings.length) * 100) : 0;

  const hourMap: Record<number, number> = {};
  revenueEligible.forEach((b) => {
    const h = b.startTime.getHours();
    hourMap[h] = (hourMap[h] ?? 0) + 1;
  });
  const popularHours = Object.entries(hourMap)
    .map(([hour, count]) => ({ hour: Number(hour), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const isAdmin = req.user!.role === "ADMIN";
  const [totalUsers, totalStadiums] = isAdmin
    ? await Promise.all([prisma.user.count(), prisma.stadium.count()])
    : [0, stadiumIds.length];

  return sendSuccess(res, {
    totalBookings: bookings.length,
    confirmedBookings,
    revenueBookings: revenueEligible.length,
    pendingBookings: bookings.filter((b) => b.status === "PENDING").length,
    revenue,
    upcomingRevenue,
    morningBookings: morning,
    eveningBookings: evening,
    cancellationRate,
    popularHours,
    ...(isAdmin ? { totalUsers, totalStadiums } : {}),
  });
}
