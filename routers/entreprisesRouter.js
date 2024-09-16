const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const {
  entrepriseGetAll,
  entrepriseAdd,
  entrepriseUpdate,
  entrepriseDelete,
  entrepriseGetImgs,
} = require("../controllers/entreprisesController");
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
  )
  .put(
    verifyJWT,
    memoryStorage.fields([{ name: "imgCampagne" }, { name: "logo" }]),
    entrepriseUpdate
  );

router.delete("/:id", verifyJWT, entrepriseDelete);

router.get("/logo/:idLogo", entrepriseGetImgs);
router.get("/img/:idImg", entrepriseGetImgs);

module.exports = router;
