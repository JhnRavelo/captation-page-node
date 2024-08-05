const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const {
  logGetUserMail,
  logsGetAll,
  logsRead,
} = require("../controllers/logsController");
const router = express.Router();

router.get("/user", verifyJWT, logGetUserMail);
router.get("/", verifyJWT, logsGetAll);
router.get("/unread", verifyJWT, logsRead);

module.exports = router;
