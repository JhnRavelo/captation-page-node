const express = require("express");
const router = express.Router();
const verifyJWT = require("../middlewares/verifyJWT");
const { campagneAdd } = require("../controllers/campagnesController");

router.post("/", verifyJWT, campagneAdd);

module.exports = router;