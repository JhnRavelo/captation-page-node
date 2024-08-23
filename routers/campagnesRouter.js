const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const {
  campagneAdd,
  campagneGetAll,
  campagneUpdate,
  campagneUpdateMail,
  campagneDelete,
  campagneGetMail,
} = require("../controllers/campagnesController");
const multer = require("multer");

const memoryStorage = multer({ storage: multer.memoryStorage() });

router
  .route("/")
  .post(verifyJWT, campagneAdd)
  .get(verifyJWT, campagneGetAll)
  .put(verifyJWT, campagneUpdate);

router.put("/mail", verifyJWT, memoryStorage.any(), campagneUpdateMail);
router.get("/mail", verifyJWT, campagneGetMail);
router.delete("/delete/:id", verifyJWT, campagneDelete);

module.exports = router;
