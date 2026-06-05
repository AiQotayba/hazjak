import type { Response } from "express";
import { prisma } from "../../db";
import type { AuthRequest } from "../../middlewares/auth";
import { param } from "../../utils/params";
import { sendError, sendSuccess } from "../../utils/response";

export async function listNotifications(req: AuthRequest, res: Response) {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unread = notifications.filter((n) => !n.isRead).length;
  return sendSuccess(res, { notifications, unread });
}

export async function markRead(req: AuthRequest, res: Response) {
  await prisma.notification.updateMany({
    where: { id: param(req, "id"), userId: req.user!.id },
    data: { isRead: true },
  });
  return sendSuccess(res, null, "تم التعليم كمقروء");
}

export async function adminListNotifications(req: AuthRequest, res: Response) {
  if (req.user!.role !== "ADMIN") return sendError(res, "غير مصرح", 403);
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  });
  return sendSuccess(res, { notifications, unread: notifications.filter((n) => !n.isRead).length });
}

export async function markAllRead(req: AuthRequest, res: Response) {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id },
    data: { isRead: true },
  });
  return sendSuccess(res, null, "تم تعليم الكل كمقروء");
}
