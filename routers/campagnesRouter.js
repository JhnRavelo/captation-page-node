const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const {
  campagneAdd,
  campagneGetAll,
} = require("../controllers/campagnesController");

router.post("/", verifyJWT, campagneAdd);
router.get("/", verifyJWT, campagneGetAll);

module.exports = router;