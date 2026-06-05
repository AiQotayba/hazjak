import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { createReviewSchema, reviewReplySchema } from "@beeplay/validation";
import * as ctrl from "./reviews.controller";

const router = Router();

router.post("/", authenticate, validate(createReviewSchema), ctrl.createReview);
router.post(
  "/:id/reply",
  authenticate,
  authorize("ADMIN", "STADIUM_OWNER"),
  validate(reviewReplySchema),
  ctrl.replyToReview
);
router.delete("/:id", authenticate, authorize("ADMIN"), ctrl.deleteReview);

export default router;
