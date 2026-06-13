import type { Response } from "express";
import { prisma } from "../../db";
import { createReviewSchema, reviewReplySchema } from "@hazjak/validation";
import type { AuthRequest } from "../../middlewares/auth";
import { param } from "../../utils/params";
import { sendError, sendSuccess } from "../../utils/response";

export async function createReview(req: AuthRequest, res: Response) {
  const body = createReviewSchema.parse(req.body);
  const booking = await prisma.booking.findUnique({
    where: { id: body.bookingId },
    include: { review: true },
  });

  if (!booking || booking.userId !== req.user!.id) {
    return sendError(res, "الحجز غير موجود", 404);
  }
  if (booking.status !== "COMPLETED") {
    return sendError(res, "يمكن التقييم بعد إتمام الحجز فقط", 400);
  }
  if (booking.review) {
    return sendError(res, "تم التقييم مسبقاً", 409);
  }

  const review = await prisma.review.create({ data: { ...body, userId: req.user!.id } });
  return sendSuccess(res, review, "شكراً على تقييمك", 201);
}

export async function replyToReview(req: AuthRequest, res: Response) {
  const { ownerReply } = reviewReplySchema.parse(req.body);
  const review = await prisma.review.findUnique({
    where: { id: param(req, "id") },
    include: { stadium: true },
  });
  if (!review) return sendError(res, "التقييم غير موجود", 404);
  if (
    req.user!.role !== "ADMIN" &&
    review.stadium.ownerId !== req.user!.id
  ) {
    return sendError(res, "غير مصرح", 403);
  }

  const updated = await prisma.review.update({
    where: { id: param(req, "id") },
    data: { ownerReply },
  });
  return sendSuccess(res, updated, "تم إرسال الرد");
}

export async function deleteReview(req: AuthRequest, res: Response) {
  await prisma.review.delete({ where: { id: param(req, "id") } });
  return sendSuccess(res, null, "تم حذف التقييم");
}
