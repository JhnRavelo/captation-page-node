const {
  campagnes,
  entreprises,
  logs,
  qrcodes,
  pages,
} = require("../database/models");
const { Op } = require("sequelize");
const getAllCampagnes = require("../utils/getAllCampagnes");
const FileHandler = require("../class/FileHandler");
const path = require("path");

const pagePath = path.join(__dirname, "..", "public", "img");
const qrCodePath = path.join(__dirname, "..", "public", "qrcode");

const campagneAdd = async (req, res) => {
  try {
    let id;
    const { title, description, dateDebut, dateFin, entreprise } =
      await req.body;

    if (!title || !description || !dateDebut || !dateFin || !entreprise)
      return res.json({ success: false, message: "Données non envoyé" });
    const isEntreprise = await entreprises.findOne({
      where: { entreprise: entreprise },
    });

    if (!isEntreprise)
      return res.json({ success: false, message: "Entreprise non trouvé" });
    const nameTitle = title.trim().slice(0, 8).toUpperCase();
    const isCampagnes = await campagnes.findAll({
      where: {
        id: {
          [Op.like]: `%${nameTitle}%`,
        },
      },
    });

    if (isCampagnes) {
      id = nameTitle + (isCampagnes.length + 1);
    } else id = nameTitle + "1";
    const newCampagne = await campagnes.create({
      id,
      title,
      description,
      dateDebut,
      dateFin,
      userId: req.user,
      entrepriseId: isEntreprise.id,
    });

    if (!newCampagne)
      return res.json({ success: false, message: "Campagne non ajouté" });
    await logs.create({ campagneId: newCampagne.id });
    const datas = await getAllCampagnes();
    res.json({
      datas,
      message: "Campagne ajouté",
      success: true,
    });
  } catch (error) {
    res.json({ success: false, message: "Erreur serveur ajout campagne" });
    console.log("ERROR CAMPAGNE ADD", error);
  }
};

const campagneGetAll = async (req, res) => {
  try {
    const datas = await getAllCampagnes();

    if (!datas)
      return res.json({
        success: false,
        message: "Erreur recuperation des données campagnes",
      });
    let years = [];
    const resultYear = datas.map((item) => {
      const itemYear = item.dateDebut.split("-")[0];
      if (!years.includes(itemYear)) {
        years.push(itemYear);
      }
    });
    await Promise.all(resultYear);
    res.json({ success: true, datas, years });
  } catch (error) {
    res.json({
      success: false,
      message: "Erreur recuperation des données campagnes",
    });
    console.log("ERROR CAMPAGNE GET ALL", error);
  }
};

const campagneUpdate = async (req, res) => {
  try {
    const { id, title, description, dateDebut, dateFin, entreprise } =
      await req.body;

    if (!title || !description || !dateDebut || !dateFin || !id || !entreprise)
      return res.json({ success: false, message: "Données non envoyé" });
    const isEntreprise = await entreprises.findOne({
      where: { entreprise: entreprise },
    });

    if (!isEntreprise)
      return res.json({ success: false, message: "Entreprise non trouvé" });
    const isCampagne = await campagnes.findOne({ where: { id: id } });

    if (!isCampagne)
      return res.json({ success: false, message: "Campagne non trouvé" });
    isCampagne.set({
      title,
      description,
      dateDebut,
      dateFin,
      entrepriseId: isEntreprise.id,
    });
    const result = await isCampagne.save();

    if (!result)
      return res.json({ success: false, message: "Campagne non modifié" });
    const datas = await getAllCampagnes();
    res.json({ datas, message: "Campagne modifié", success: true });
  } catch (error) {
    res.json({ success: false, message: "Erreur serveur" });
    console.log("ERROR UPDATE CAMPAGNE", error);
  }
};

const campagneUpdateMail = async (req, res) => {
  try {
    const { mailText, object, id } = await req.body;

    if (!mailText || !object)
      return res.json({ success: false, message: "Contenu mail non envoyé" });
    const isCampagne = await campagnes.findOne({ where: { id: id } });

    if (!isCampagne)
      return res.json({ success: false, message: "Campagne non trouvé" });
    isCampagne.set({ mailText, object });
    const result = await isCampagne.save();

    if (!result)
      return res.json({
        success: false,
        message: "Campagne email non modifié",
      });
    const datas = await getAllCampagnes();
    res.json({ datas, message: "Campagne email modifié", success: true });
  } catch (error) {
    res.json({ success: false, message: "Erreur serveur" });
    console.log("ERROR UPDATE MAIL", error);
  }
};

const campagneDelete = async (req, res) => {
  const { id } = await req.params;
  try {
    if (!id) return res.json({ success: false, message: "Données non envoyé" });
    const isCampagne = await campagnes.findOne({ where: { id: id } });

    if (!isCampagne)
      return res.json({ success: false, message: "Campagne non trouvé" });
    const isQRCodes = await qrcodes.findAll({ where: { campagneId: id } });
    const isPage = await pages.findOne({ where: { campagneId: id } });
    const fileHandler = new FileHandler();

    if (isQRCodes) {
      isQRCodes.map((qrCode) => {
        fileHandler.deleteFileFromDatabase(qrCode.qrcode, qrCodePath, "qrcode");
      });
      await qrcodes.destroy({ where: { campagneId: id } });
    }

    if (isPage) {
      fileHandler.deleteFileFromDatabase(isPage.img, pagePath, "img");
      await isPage.destroy();
    }
    await logs.create({
      deleteId: id,
      entrepriseId: isCampagne.entrepriseId,
      title: isCampagne.title,
    });
    await logs.update(
      { title: isCampagne.title, entrepriseId: isCampagne.entrepriseId },
      { where: { campagneId: id } }
    );
    await stats.update(
      { title: isCampagne.title, entrepriseId: isCampagne.entrepriseId },
      { where: { campagneId: id } }
    );
    const result = await isCampagne.destroy();

    if (!result)
      return res.json({
        success: false,
        message: "Erreur de suppression campagne",
      });
    res.json({ success: true, message: `Campagne ${id} a été supprimer` });
  } catch (error) {
    res.json({ success: false, message: "Erreur serveur" });
    console.log("ERROR CAMPAGNE DELETE", error);
  }
};

module.exports = {
  campagneAdd,
  campagneGetAll,
  campagneUpdate,
  campagneUpdateMail,
  campagneDelete,
};
