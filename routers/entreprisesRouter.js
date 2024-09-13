const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const {
  entrepriseGetAll,
  entrepriseAdd,
  entrepriseUpdate,
  entrepriseDelete,
  entrepriseGetLogo,
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

router.get("/logo/:idLogo", verifyJWT, entrepriseGetLogo);
router.get("/img/:idImg", verifyJWT, entrepriseGetLogo);

module.exports = router;
