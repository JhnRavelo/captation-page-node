const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const { exportData, importData } = require("../controllers/datasController");
const router = express.Router();
const multer = require("multer");

const memoryStorage = multer({ storage: multer.memoryStorage() });

router.get("/export", verifyJWT, exportData);
router.put("/import", verifyJWT, memoryStorage.any(), importData);

module.exports = router;
