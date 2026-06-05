import { Router } from "express";
import { authenticate, authorize, type AuthRequest } from "../../middlewares/auth";
import { avatarUploadMiddleware } from "../../middlewares/avatar-upload";
import { validate } from "../../middlewares/validate";
import { updateProfileSchema, userListQuerySchema } from "@beeplay/validation";
import { sendError } from "../../utils/response";
import * as ctrl from "./users.controller";

const router = Router();

router.post("/profile/avatar", authenticate, (req, res, next) => {
  avatarUploadMiddleware(req, res, (err) => {
    if (err) {
      const message = err instanceof Error ? err.message : "فشل رفع الصورة";
      return sendError(res, message, 400);
    }
    return ctrl.uploadAvatar(req as AuthRequest, res);
  });
});

router.patch("/profile", authenticate, validate(updateProfileSchema), (req, res) => {
  (req as AuthRequest).params = { ...req.params, id: (req as AuthRequest).user!.id };
  return ctrl.updateUser(req as AuthRequest, res);
});

router.get("/", authenticate, authorize("ADMIN"), validate(userListQuerySchema, "query"), ctrl.listUsers);
router.patch("/:id", authenticate, authorize("ADMIN"), validate(updateProfileSchema), ctrl.updateUser);
router.patch("/:id/ban", authenticate, authorize("ADMIN"), ctrl.banUser);
router.patch("/:id/role", authenticate, authorize("ADMIN"), ctrl.changeRole);

export default router;
