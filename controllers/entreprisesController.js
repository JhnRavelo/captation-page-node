const FileHandler = require("../class/FileHandler");
const { entreprises, stats } = require("../database/models");
const fileHandler = new FileHandler();
const path = require("path");
const getAllCompanies = require("../utils/getAllCompanies");
const { Op } = require("sequelize");

const privatePath = path.join(__dirname, "..", "private");

const entrepriseGetAll = async (req, res) => {
  try {
    const allEntreprises = await getAllCompanies(req.user);

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
    const { company, fontFamily } = await req.body;

    if (
      req.files.length == 0 ||
      (req.files.logo.length > 0 &&
        req.files.logo[0].mimetype.split("/")[0] != "image") ||
      (req.files.imgCampagne.length > 0 &&
        req.files.imgCampagne[0].mimetype.split("/")[0] != "image") ||
      !req.user ||
      !company ||
      !fontFamily
    )
      return res.json({ success: false, message: "Données non trouvés" });
    const isEntreprise = await entreprises.findOne({
      where: { [Op.and]: [{ entreprise: company }, { userId: req.user }] },
    });

    if (isEntreprise)
      return res.json({ success: false, message: "Entreprise existe déjà" });
    const userPath = path.join(privatePath, `user_${req.user}`);
    const imgPath = path.join(userPath, "entreprise");
    const logoPath = path.join(userPath, "logo");
    const imgCampagne = await fileHandler.createImage(
      req.files.imgCampagne,
      imgPath,
      "jpg",
      "private"
    );
    const logo = await fileHandler.createImage(
      req.files.logo,
      logoPath,
      "png",
      "private"
    );
    const result = await entreprises.create({
      entreprise: company,
      logo,
      imgCampagne,
      fontFamily,
    });

    if (!result)
      return res.json({
        success: false,
        message: "Erreur ajout dans la base de données",
      });
    const allEntreprises = await getAllCompanies(req.user);

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

const entrepriseUpdate = async (req, res) => {
  try {
    const { company, fontFamily, id } = await req.body;
    let logo, imgCampagne;

    if (!company || !fontFamily || !id)
      return res.json({
        success: false,
        message: "Erreur non données envoyés pour mettre à jour entreprise",
      });
    const isEntreprise = await entreprises.findOne({ where: { id: id } });

    if (!isEntreprise)
      return res.json({
        success: false,
        message: "Erreur entreprise non trouvé",
      });
    const userPath = path.join(privatePath, `user_${req.user}`);
    const imgPath = path.join(userPath, "entreprise");
    const logoPath = path.join(userPath, "logo");

    if (
      req.files?.logo &&
      req.files.logo?.length > 0 &&
      req.files.logo[0].mimetype.split("/")[0] === "image"
    ) {
      fileHandler.deleteFileFromDatabase(isEntreprise.logo, logoPath, "logo");
      logo = await fileHandler.createImage(
        req.files.logo,
        logoPath,
        "png",
        "private"
      );
      isEntreprise.logo = logo;
    }

    if (
      req.files?.imgCampagne &&
      req.files.imgCampagne?.length > 0 &&
      req.files.imgCampagne[0].mimetype.split("/")[0] === "image"
    ) {
      fileHandler.deleteFileFromDatabase(
        isEntreprise.imgCampagne,
        imgPath,
        "entreprise"
      );
      imgCampagne = await fileHandler.createImage(
        req.files.imgCampagne,
        imgPath,
        "jpg",
        "private"
      );
      isEntreprise.imgCampagne = imgCampagne;
    }
    await stats.update(
      { entreprise: company },
      { where: { entreprise: isEntreprise.entreprise } }
    );
    isEntreprise.set({ entreprise: company, fontFamily: fontFamily });
    const result = await isEntreprise.save();

    if (!result)
      return res.json({
        success: false,
        message: "Erreur mise à jour entreprise dans la base de données",
      });
    const datas = await getAllCompanies(req.user);
    res.json({ success: true, datas });
  } catch (error) {
    res.json({ success: false, message: "Erreur mise à jour entreprise" });
    console.log("ERROR ENTREPRISE UPDATE", error);
  }
};

const entrepriseDelete = async (req, res) => {
  const { id } = await req.params;
};

const entrepriseGetImgs = async (req, res) => {
  try {
    const { idLogo, idImg } = req.params;

    if (!idImg && !idLogo) return res.sendStatus(401);

    if (idLogo) {
      const isEntreprise = await entreprises.findOne({
        where: { id: idLogo },
      });

      if (!isEntreprise) return res.sendStatus(401);
      res.sendFile(isEntreprise.logo, { root: "." });
    } else if (idImg) {
      const isEntreprise = await entreprises.findOne({
        where: { id: idImg },
      });

      if (!isEntreprise) return res.sendStatus(401);
      res.sendFile(isEntreprise.imgCampagne, { root: "." });
    }
  } catch (error) {
    res.sendStatus(401);
    console.log("ERROR ENTREPRISE GET LOGO", error);
  }
};

module.exports = {
  entrepriseGetAll,
  entrepriseAdd,
  entrepriseUpdate,
  entrepriseDelete,
  entrepriseGetImgs,
  privatePath,
};
