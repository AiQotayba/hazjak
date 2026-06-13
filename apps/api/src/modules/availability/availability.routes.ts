import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { createAvailabilitySchema, createBlockedDaySchema } from "@hazjak/validation";
import * as ctrl from "./availability.controller";

const router = Router();
router.use(authenticate, authorize("ADMIN", "STADIUM_OWNER"));
router.get("/", ctrl.listSlots);
router.get("/blocked", ctrl.listBlockedDays);
router.post("/blocked", validate(createBlockedDaySchema), ctrl.createBlockedDay);
router.delete("/blocked/:id", ctrl.deleteBlockedDay);
router.post("/", validate(createAvailabilitySchema), ctrl.createSlot);
router.delete("/:id", ctrl.deleteSlot);
export default router;
