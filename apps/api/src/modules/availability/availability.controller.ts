import type { Response } from "express";
import { prisma } from "../../db";
import { createAvailabilitySchema, createBlockedDaySchema } from "@beeplay/validation";
import type { AuthRequest } from "../../middlewares/auth";
import { param } from "../../utils/params";
import { sendError, sendSuccess } from "../../utils/response";

async function assertOwner(stadiumId: string, userId: string, role: string) {
  const stadium = await prisma.stadium.findUnique({ where: { id: stadiumId } });
  if (!stadium) return { error: "الملعب غير موجود", status: 404 as const };
  if (role !== "ADMIN" && stadium.ownerId !== userId) {
    return { error: "غير مصرح", status: 403 as const };
  }
  return { stadium };
}

export async function createSlot(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user) return sendError(res, "غير مصرح", 401);
  const body = createAvailabilitySchema.parse(req.body);
  const check = await assertOwner(body.stadiumId, user.id, user.role);
  if ("error" in check) return sendError(res, check.error ?? "خطأ", check.status);

  const slot = await prisma.availabilitySlot.create({
    data: {
      stadiumId: body.stadiumId,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
    },
  });
  return sendSuccess(res, slot, "تم إضافة الموعد", 201);
}

export async function deleteSlot(req: AuthRequest, res: Response) {
  const slot = await prisma.availabilitySlot.findUnique({
    where: { id: param(req, "id") },
  });
  if (!slot) return sendError(res, "الموعد غير موجود", 404);
  const user = req.user;
  if (!user) return sendError(res, "غير مصرح", 401);
  const check = await assertOwner(slot.stadiumId, user.id, user.role);
  if ("error" in check) return sendError(res, check.error ?? "خطأ", check.status);

  await prisma.availabilitySlot.delete({ where: { id: param(req, "id") } });
  return sendSuccess(res, null, "تم حذف الموعد");
}

export async function listSlots(req: AuthRequest, res: Response) {
  const stadiumId = req.query.stadiumId as string;
  if (!stadiumId) return sendError(res, "معرف الملعب مطلوب", 400);

  const slots = await prisma.availabilitySlot.findMany({
    where: { stadiumId },
    orderBy: { startTime: "asc" },
  });
  return sendSuccess(res, slots);
}

function parseDayDate(dateStr: string) {
  return new Date(`${dateStr}T12:00:00.000Z`);
}

export async function listBlockedDays(req: AuthRequest, res: Response) {
  const stadiumId = req.query.stadiumId as string;
  if (!stadiumId) return sendError(res, "معرف الملعب مطلوب", 400);

  const days = await prisma.stadiumBlockedDay.findMany({
    where: { stadiumId },
    orderBy: { date: "asc" },
  });
  return sendSuccess(res, days);
}

export async function createBlockedDay(req: AuthRequest, res: Response) {
  const user = req.user;
  if (!user) return sendError(res, "غير مصرح", 401);
  const body = createBlockedDaySchema.parse(req.body);
  const check = await assertOwner(body.stadiumId, user.id, user.role);
  if ("error" in check) return sendError(res, check.error ?? "خطأ", check.status);

  const day = await prisma.stadiumBlockedDay.upsert({
    where: {
      stadiumId_date: {
        stadiumId: body.stadiumId,
        date: parseDayDate(body.date),
      },
    },
    create: {
      stadiumId: body.stadiumId,
      date: parseDayDate(body.date),
      reason: body.reason,
    },
    update: { reason: body.reason },
  });
  return sendSuccess(res, day, "تم تسجيل يوم العطلة", 201);
}

export async function deleteBlockedDay(req: AuthRequest, res: Response) {
  const row = await prisma.stadiumBlockedDay.findUnique({
    where: { id: param(req, "id") },
  });
  if (!row) return sendError(res, "اليوم غير موجود", 404);
  const user = req.user;
  if (!user) return sendError(res, "غير مصرح", 401);
  const check = await assertOwner(row.stadiumId, user.id, user.role);
  if ("error" in check) return sendError(res, check.error ?? "خطأ", check.status);

  await prisma.stadiumBlockedDay.delete({ where: { id: row.id } });
  return sendSuccess(res, null, "تم إلغاء العطلة");
}
