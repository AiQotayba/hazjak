import type { Response } from "express";
import { prisma } from "../../db";
import { isMorningSlot } from "@beeplay/utils";
import type { AuthRequest } from "../../middlewares/auth";
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
    select: { status: true, totalPrice: true, startTime: true },
  });

  const confirmed = bookings.filter((b) =>
    ["CONFIRMED", "COMPLETED"].includes(b.status)
  );
  const revenue = confirmed.reduce((s, b) => s + b.totalPrice, 0);
  const morning = confirmed.filter((b) => isMorningSlot(b.startTime)).length;
  const evening = confirmed.length - morning;
  const cancelled = bookings.filter((b) => b.status === "CANCELLED").length;
  const cancellationRate =
    bookings.length > 0 ? Math.round((cancelled / bookings.length) * 100) : 0;

  const hourMap: Record<number, number> = {};
  confirmed.forEach((b) => {
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
    confirmedBookings: confirmed.length,
    pendingBookings: bookings.filter((b) => b.status === "PENDING").length,
    revenue,
    morningBookings: morning,
    eveningBookings: evening,
    cancellationRate,
    popularHours,
    ...(isAdmin ? { totalUsers, totalStadiums } : {}),
  });
}
