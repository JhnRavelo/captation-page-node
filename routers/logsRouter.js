const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const { logGetUserMail, logsGetAll } = require("../controllers/logsController");
const router = express.Router();

router.get("/user", verifyJWT, logGetUserMail);
router.get("/", verifyJWT, logsGetAll);

module.exports = router;
