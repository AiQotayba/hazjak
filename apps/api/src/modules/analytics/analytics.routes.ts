import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import * as ctrl from "./analytics.controller";

const router = Router();
router.use(authenticate, authorize("ADMIN", "STADIUM_OWNER"));
router.get("/dashboard", ctrl.dashboard);
export default router;
