const express = require("express");
const router = express.Router();
const {
  getAllPlanLimits,
  getPlanLimit,
  upsertPlanLimit,
  getFormattedLimits,
  initializeDefaults
} = require("../../banquetController/banquetmenuController/planLimitController");

router.get("/get", getAllPlanLimits);
router.get("/formatted", getFormattedLimits);
router.get("/:ratePlan/:foodType", getPlanLimit);
router.post("/", upsertPlanLimit);
router.put("/:id", upsertPlanLimit);
router.post("/initialize", initializeDefaults);

module.exports = router;
