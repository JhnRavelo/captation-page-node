const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const { userLogin } = require("../controllers/usersController");

router.post("/login", userLogin);

module.exports = router;
