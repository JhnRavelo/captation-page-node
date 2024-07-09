const { campagnes, users } = require("../database/models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const getAllCampagnes = require("../utils/getAllCampagnes");

const campagneAdd = async (req, res) => {
  try {
    let id;
    const { title, description, dateDebut, dateFin, entreprise } =
      await req.body;
    if (!title || !description || !dateDebut || !dateFin || !entreprise)
      return res.json({ success: false, message: "Données non envoyé" });
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
      entreprise,
      userId: req.user,
    });

    if (!newCampagne)
      return res.json({ success: false, message: "Campagne non ajouté" });
    const datas = await getAllCampagnes();
    res.json({
      datas,
      message: "Campagne ajouté",
      success: true,
    });
  } catch (error) {
    res.json({ success: false, message: "Erreur serveur" });
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
    res.json({ success: true, datas });
  } catch (error) {
    console.log("ERROR CAMPAGNE GET ALL", error);
  }
};

const campagneUpdate = async (req, res) => {
  try {
    const { id, title, description, dateDebut, dateFin, entreprise } =
      await req.body;

    if (!title || !description || !dateDebut || !dateFin || !id || !entreprise)
      return res.json({ success: false, message: "Données non envoyé" });
    const isCampagne = await campagnes.findOne({ where: { id: id } });

    if (!isCampagne)
      return res.json({ success: false, message: "Campagne non trouvé" });
    isCampagne.set({ title, description, dateDebut, dateFin, entreprise });
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

module.exports = {
  campagneAdd,
  campagneGetAll,
  campagneUpdate,
  campagneUpdateMail,
};
