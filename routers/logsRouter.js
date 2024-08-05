const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const { logGetUserMail } = require("../controllers/logsController");
const router = express.Router();

router.get("/user", verifyJWT, logGetUserMail);

module.exports = router;
