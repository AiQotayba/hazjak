import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import * as ctrl from "./settings.controller";

const router = Router();
router.get("/", ctrl.getSettings);
router.patch("/", authenticate, authorize("ADMIN"), ctrl.updateSettings);
export default router;
