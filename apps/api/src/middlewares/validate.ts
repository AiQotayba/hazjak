import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
import { sendError } from "../utils/response";

export function validate(schema: ZodSchema, source: "body" | "query" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(source === "body" ? req.body : req.query);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      result.error.errors.forEach((e) => {
        const key = e.path.join(".") || "form";
        if (!errors[key]) errors[key] = [];
        errors[key].push(e.message);
      });
      return sendError(res, "خطأ في التحقق من البيانات", 422, errors);
    }
    if (source === "body") req.body = result.data;
    else Object.assign(req.query, result.data);
    next();
  };
}
