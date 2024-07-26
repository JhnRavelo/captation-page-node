const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const router = express.Router();
const multer = require("multer");
const { qrCodeAdd, qrCodeGetAll } = require("../controllers/qrcodesController");

const memoryStorage = multer({ storage: multer.memoryStorage() });

router
  .route("/")
  .post(verifyJWT, memoryStorage.any(), qrCodeAdd)
  .get(verifyJWT, qrCodeGetAll);

module.exports = router;