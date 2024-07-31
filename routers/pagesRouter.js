const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const {
  pageAdd,
  pageGetAll,
  pageUpdate,
} = require("../controllers/pagesController");
const router = express.Router();
const multer = require("multer");

const memoryStorage = multer({ storage: multer.memoryStorage() });

router
  .route("/")
  .post(memoryStorage.any(), verifyJWT, pageAdd)
  .get(pageGetAll)
  .put(memoryStorage.any(), verifyJWT, pageUpdate);

module.exports = router;
