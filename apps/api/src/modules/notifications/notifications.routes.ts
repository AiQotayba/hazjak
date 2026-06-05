import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import * as ctrl from "./notifications.controller";

const router = Router();
router.use(authenticate);
router.get("/admin/all", authorize("ADMIN"), ctrl.adminListNotifications);
router.get("/", ctrl.listNotifications);
router.patch("/:id/read", ctrl.markRead);
router.patch("/read-all", ctrl.markAllRead);
export default router;
