const express = require("express");
const { statAdd, statAddEmail } = require("../controllers/statsController");
const router = express.Router();

router.route("/").post(statAdd);
router.post("/add-email", statAddEmail);

module.exports = router;
