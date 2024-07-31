const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const { pageAdd, pageGetAll } = require("../controllers/pagesController");
const router = express.Router();
const multer = require("multer");

const memoryStorage = multer({ storage: multer.memoryStorage() });

router
  .route("/")
  .post(memoryStorage.any(), verifyJWT, pageAdd)
  .get(pageGetAll);

module.exports = router;
