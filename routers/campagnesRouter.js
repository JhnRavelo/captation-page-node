const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const {
  campagneAdd,
  campagneGetAll,
  campagneUpdate,
  campagneUpdateMail,
  campagneDelete,
} = require("../controllers/campagnesController");

router
  .route("/")
  .post(verifyJWT, campagneAdd)
  .get(verifyJWT, campagneGetAll)
  .put(verifyJWT, campagneUpdate);

router.put("/mail", verifyJWT, campagneUpdateMail);
router.delete("/delete/:id", verifyJWT, campagneDelete);

module.exports = router;
