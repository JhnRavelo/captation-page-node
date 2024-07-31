const FileHandler = require("../class/FileHandler");
const { pages, entreprises } = require("../database/models");
const path = require("path");
const getAllPages = require("../utils/getAllPages");

const pagePath = path.join(__dirname, "..", "public", "img");

const pageAdd = async (req, res) => {
  try {
    const {
      sloganCampagne,
      titleColor,
      titleBackgroundColor,
      campagnes,
      entreprise,
    } = await req.body;

    if (
      !sloganCampagne ||
      !titleColor ||
      !titleBackgroundColor ||
      !campagnes ||
      !entreprise
    )
      return res.json({ success: false, message: "Erreur ajout de page" });
    if (
      !req.files &&
      req.files.length > 0 &&
      req.files[0].mimetype.split("/")[0] == "image"
    )
      return res.json({ success: false, message: "Pas d'image campagne reçu" });
    const isPage = await pages.findOne({ where: { campagneId: campagnes } });
    const isEntreprise = await entreprises.findOne({
      where: { entreprise: entreprise },
    });

    if (isPage || !isEntreprise)
      return res.json({
        success: false,
        message: "Erreur ce campagne a déjà une page",
      });
    const fileHandler = new FileHandler();
    const location = await fileHandler.createImage(req, pagePath, "webp");
    const result = await pages.create({
      slogan: sloganCampagne,
      img: location,
      titleColor,
      titleBackgroundColor,
      entrepriseId: isEntreprise.id,
      campagneId: campagnes,
    });

    if (!result)
      return res.json({
        success: false,
        message: "Erreur ajout de page dans la base de données",
      });
    const datas = await getAllPages();
    res.json({ datas, success: true });
  } catch (error) {
    console.log("ERROR ADD PAGE", error);
    res.json({ success: false, message: "Erreur serveur sur l'ajout de page" });
  }
};

const pageGetAll = async (req, res) => {
  try {
    const datas = await getAllPages();

    if (!datas)
      return res.json({
        success: false,
        message: "Erreur données des pages non récupéré du base de données",
      });
    res.json({ success: true, datas });
  } catch (error) {
    res.json({
      success: false,
      message: "Erreur données des pages non récupéré",
    });
    console.log("ERROR PAGE GET ALL", error);
  }
};

module.exports = { pageAdd, pageGetAll };
