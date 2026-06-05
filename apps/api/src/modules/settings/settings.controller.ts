import type { Response } from "express";
import { prisma } from "../../db";
import type { AuthRequest } from "../../middlewares/auth";
import { sendSuccess } from "../../utils/response";

export async function getSettings(_req: AuthRequest, res: Response) {
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({ data: {} });
  }
  return sendSuccess(res, settings);
}

export async function updateSettings(req: AuthRequest, res: Response) {
  const existing = await prisma.settings.findFirst();
  const settings = existing
    ? await prisma.settings.update({
        where: { id: existing.id },
        data: req.body,
      })
    : await prisma.settings.create({ data: req.body });
  return sendSuccess(res, settings);
}
