const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const router = express.Router();
const multer = require("multer");
const { qrCodeAdd, qrCodeGetAll, qrCodeDelete } = require("../controllers/qrcodesController");

const memoryStorage = multer({ storage: multer.memoryStorage() });

router
  .route("/")
  .post(verifyJWT, memoryStorage.any(), qrCodeAdd)
  .get(verifyJWT, qrCodeGetAll);

router.delete("/delete/:id", verifyJWT, qrCodeDelete);

module.exports = router;