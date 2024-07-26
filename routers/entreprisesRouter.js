const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const { entrepriseGetAll } = require("../controllers/entreprisesController");
const router = express.Router();

router.route("/").get(verifyJWT, entrepriseGetAll);

module.exports = router;