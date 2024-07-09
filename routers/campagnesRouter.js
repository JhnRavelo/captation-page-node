const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const {
  campagneAdd,
  campagneGetAll,
  campagneUpdate,
  campagneUpdateMail,
} = require("../controllers/campagnesController");

router
  .route("/")
  .post(verifyJWT, campagneAdd)
  .get(verifyJWT, campagneGetAll)
  .put(verifyJWT, campagneUpdate);

router.put("/mail", verifyJWT, campagneUpdateMail);

module.exports = router;
