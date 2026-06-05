import { Router } from "express";
import { authenticate, authorize } from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import {
  createStadiumSchema,
  adminCreateStadiumSchema,
  stadiumFiltersSchema,
  adminStadiumListQuerySchema,
  addStadiumImageSchema,
} from "@beeplay/validation";
import * as ctrl from "./stadiums.controller";

const router = Router();

router.get("/", validate(stadiumFiltersSchema, "query"), ctrl.listStadiums);
router.get(
  "/mine",
  authenticate,
  authorize("ADMIN", "STADIUM_OWNER"),
  ctrl.myStadiums
);
router.get(
  "/admin/all",
  authenticate,
  authorize("ADMIN"),
  validate(adminStadiumListQuerySchema, "query"),
  ctrl.adminListStadiums
);
router.post(
  "/admin",
  authenticate,
  authorize("ADMIN"),
  validate(adminCreateStadiumSchema),
  ctrl.adminCreateStadium
);
router.get("/:id/availability", ctrl.getAvailability);
router.post(
  "/:id/images",
  authenticate,
  authorize("ADMIN", "STADIUM_OWNER"),
  validate(addStadiumImageSchema),
  ctrl.addStadiumImage
);
router.delete(
  "/:id/images/:imageId",
  authenticate,
  authorize("ADMIN", "STADIUM_OWNER"),
  ctrl.deleteStadiumImage
);
router.get("/:idOrSlug", ctrl.getStadium);

router.post(
  "/",
  authenticate,
  authorize("ADMIN", "STADIUM_OWNER"),
  validate(createStadiumSchema),
  ctrl.createStadium
);
router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "STADIUM_OWNER"),
  ctrl.updateStadium
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN", "STADIUM_OWNER"),
  ctrl.deleteStadium
);

export default router;
