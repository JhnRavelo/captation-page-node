const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const { exportData } = require("../controllers/datasController");
const router = express.Router();

router.get("/export", verifyJWT, exportData);

module.exports = router;