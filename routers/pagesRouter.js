const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const { pageAdd } = require("../controllers/pagesController");
const router = express.Router();
const multer = require("multer");

const memoryStorage = multer({ storage: multer.memoryStorage() });

router.route("/").post(memoryStorage.any(), verifyJWT, pageAdd);

module.exports = router;
