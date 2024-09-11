const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const { entrepriseGetAll, entrepriseAdd } = require("../controllers/entreprisesController");
const router = express.Router();
const multer = require("multer");

const memoryStorage = multer({ storage: multer.memoryStorage() });

router
  .route("/")
  .get(verifyJWT, entrepriseGetAll)
  .post(
    verifyJWT,
    memoryStorage.fields([{ name: "imgCampagne" }, { name: "logo" }]),
    entrepriseAdd
  );

module.exports = router;
