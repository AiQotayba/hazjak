import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import {
  createBookingSchema,
  updateBookingStatusSchema,
  ownerManualBookingSchema,
  bookingListQuerySchema,
} from "@hazjak/validation";
import * as ctrl from "./bookings.controller";

const router = Router();

router.use(authenticate);

router.get("/", validate(bookingListQuerySchema, "query"), ctrl.listBookings);
router.get("/upcoming", ctrl.upcoming);
router.get("/history", ctrl.history);
router.post(
  "/manual",
  authorize("STADIUM_OWNER", "ADMIN"),
  validate(ownerManualBookingSchema),
  ctrl.createOwnerManualBooking
);
router.get("/:id", ctrl.getBooking);
router.post("/", validate(createBookingSchema), ctrl.createBooking);
router.post("/:id/rebook", ctrl.rebook);
router.post("/:id/confirm-deposit", ctrl.confirmDeposit);
router.patch(
  "/:id/status",
  validate(updateBookingStatusSchema),
  ctrl.updateStatus
);

export default router;
