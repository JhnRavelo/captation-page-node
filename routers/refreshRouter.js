const express = require("express");
const handleRefreshToken = require("../controllers/refreshController");
const router = express.Router();

router.post("/", handleRefreshToken);

module.exports = router;
