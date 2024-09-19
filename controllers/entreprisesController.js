const FileHandler = require("../class/FileHandler");
const { entreprises, stats, campagnes, logs } = require("../database/models");
const fileHandler = new FileHandler();
const path = require("path");
const getAllCompanies = require("../utils/getAllCompanies");
const { Op } = require("sequelize");
const deleteCampagne = require("../utils/deleteCampagne");

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
  try {

    if (!id) {
      return res.json({
        success: false,
        message: "Erreur: aucun identifiant d'entreprise reçu",
      });
    }
    const isEntreprise = await entreprises.findOne({ where: { id } });

    if (!isEntreprise) {
      return res.json({
        success: false,
        message: "Erreur: entreprise non trouvée",
      });
    }
    const isCampagnes = await campagnes.findAll({ where: { entrepriseId: id } });

    if (isCampagnes && isCampagnes.length > 0) {
      for (const campagne of isCampagnes) {
        await deleteCampagne(campagne.id, req.user); 
      }
    }
    const userPath = path.join(privatePath, `user_${req.user}`);
    const imgPath = path.join(userPath, "entreprise");
    const logoPath = path.join(userPath, "logo");

    if (isEntreprise.logo) {
      fileHandler.deleteFileFromDatabase(isEntreprise.logo, logoPath, "logo");
    }

    if (isEntreprise.imgCampagne) {
      fileHandler.deleteFileFromDatabase(isEntreprise.imgCampagne, imgPath, "entreprise");
    }
    await stats.destroy({ where: { entreprise: isEntreprise.entreprise } });
    const allStats = await stats.findAll({
      include: [{ model: campagnes, where: { entrepriseId: id } }],
    });

    if (allStats.length > 0) {
      for (const stat of allStats) {
        await stats.destroy({ where: { id: stat.dataValues.id } });
      }
    }
    await logs.destroy({ where: { entrepriseId: id } });
    const allLogs = await logs.findAll({
      include: [{ model: campagnes, where: { entrepriseId: id } }],
    });

    if (allLogs.length > 0) {
      for (const log of allLogs) {
        await logs.destroy({ where: { id: log.dataValues.id } });
      }
    }
    const result = await isEntreprise.destroy();

    if (!result) {
      return res.json({ success: false, message: "Entreprise non supprimée" });
    }
    res.json({
      success: true,
      message: `Entreprise ${isEntreprise.entreprise} supprimée`,
    });
  } catch (error) {
    console.error("ERROR ENTREPRISE DELETED", error);
    res.json({
      success: false,
      message: "Erreur: suppression entreprise au niveau du serveur",
    });
  }
};

const entrepriseGetImgs = async (req, res) => {
  try {
    const { idLogo, idImg } = await req.params;

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
