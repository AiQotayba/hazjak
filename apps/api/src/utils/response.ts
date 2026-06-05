import type { Response } from "express";

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "تمت العملية بنجاح",
  status = 200
) {
  return res.status(status).json({ success: true, message, data });
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  meta: { page: number; limit: number; total: number; totalPages: number },
  message = "تمت العملية بنجاح"
) {
  return res.status(200).json({ success: true, message, data, meta });
}

export function sendError(
  res: Response,
  message: string,
  status = 400,
  errors?: Record<string, string[]>
) {
  return res.status(status).json({ success: false, message, errors });
}
