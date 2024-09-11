const FileHandler = require("../class/FileHandler");
const { entreprises } = require("../database/models");
const fileHandler = new FileHandler();
const path = require("path");
const getAllCompanies = require("../utils/getAllCompanies");

const imgPath = path.join(__dirname, "..", "public", "entreprise");
const logoPath = path.join(__dirname, "..", "public", "logo");

const entrepriseGetAll = async (req, res) => {
  try {
    const allEntreprises = await getAllCompanies();

    if (!allEntreprises)
      return res.json({
        success: false,
        message: "Erreur recuperation des données entreprises",
      });

    res.json({ success: true, datas: allEntreprises });
  } catch (error) {
    res.json({
      success: false,
      message: "Erreur recuperation des données entreprises",
    });
    console.log("ERROR GET ALL ENTREPRISES", error);
  }
};

const entrepriseAdd = async (req, res) => {
  try {
    const { company } = await req.body;

    if (
      req.files.length == 0 ||
      (req.files.logo.length > 0 &&
        req.files.logo[0].mimetype.split("/")[0] != "image") ||
      (req.files.imgCampagne.length > 0 &&
        req.files.imgCampagne[0].mimetype.split("/")[0] != "image") ||
      !req.user ||
      !company
    )
      return res.json({ success: false, message: "Données non trouvés" });
    const isEntreprise = await entreprises.findOne({
      where: { entreprise: company, userId: req.user },
    });

    if (isEntreprise)
      return res.json({ success: false, message: "Entreprise existe déjà" });
    const imgCampagne = await fileHandler.createImage(
      req.files.imgCampagne,
      imgPath,
      "jpg",
      "public"
    );
    const logo = await fileHandler.createImage(
      req.files.logo,
      logoPath,
      "png",
      "public"
    );
    const result = await entreprises.create({ entreprise: company, logo, imgCampagne });

    if (!result)
      return res.json({
        success: false,
        message: "Erreur ajout dans la base de données",
      });
    const allEntreprises = await getAllCompanies();

    if (!allEntreprises)
      return res.json({
        success: false,
        message: "Erreur recuperation des données entreprises",
      });
    res.json({ success: true, datas: allEntreprises });
  } catch (error) {
    res.json({
      success: false,
      message: "Erreur ajout des données entreprises",
    });
    console.log("ERROR ADD ENTREPRISE", error);
  }
};

module.exports = { entrepriseGetAll, entrepriseAdd };