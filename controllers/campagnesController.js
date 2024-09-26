const { campagnes, entreprises, logs, mails } = require("../database/models");
const { Op } = require("sequelize");
const getAllCampagnes = require("../utils/getAllCampagnes");
const FileHandler = require("../class/FileHandler");
const path = require("path");
const getAllMails = require("../utils/getAllMails");
const deleteCampagne = require("../utils/deleteCampagne");

const mailPath = path.join(__dirname, "..", "public", "mail");

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
    const nameTitle = title.trim().replace(" ", "_").slice(0, 8).toUpperCase();
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
    await logs.create({ campagneId: newCampagne.id, userId: req.user });
    const datas = await getAllCampagnes(req.user);
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
    const datas = await getAllCampagnes(req.user);

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
    const datas = await getAllCampagnes(req.user);
    res.json({ datas, message: "Campagne modifié", success: true });
  } catch (error) {
    res.json({ success: false, message: "Erreur serveur" });
    console.log("ERROR UPDATE CAMPAGNE", error);
  }
};

const campagneUpdateMail = async (req, res) => {
  try {
    const { mailText, object, id, idMail, title, delay } = await req.body;

    if (!mailText || !object || !id || !idMail)
      return res.json({ success: false, message: "Contenu mail non envoyé" });
    const isCampagne = await campagnes.findOne({ where: { id: id } });

    if (!isCampagne)
      return res.json({ success: false, message: "Campagne non trouvé" });
    const isMail = await mails.findOne({ where: { id: idMail } });

    if (
      (req.files.length == 0 && !isMail) ||
      (req.files.length > 0 &&
        req.files[0].mimetype.split("/")[0] != "image" &&
        !isMail)
    )
      return res.json({ success: false, message: "Pas d'image email reçu" });
    const fileHandler = new FileHandler();
    let result, img;

    if (
      req?.files &&
      req.files.length > 0 &&
      req.files[0].mimetype.split("/")[0] == "image"
    ) {
      img = await fileHandler.createImage(
        req.files,
        path.join(mailPath, `user_${req.user}`),
        "webp",
        "public"
      );
      if (isMail && isMail?.img) {
        fileHandler.deleteFileFromDatabase(
          isMail.img,
          path.join(mailPath, `user_${req.user}`),
          "mail"
        );
      }
    }

    if (isMail) {
      isMail.set({
        mailText,
        object,
        campagneId: id,
        img: img ? img : isMail.img,
        title,
        delay: delay ? delay : "",
      });
      result = await isMail.save();
    } else
      result = await mails.create({
        id: idMail,
        mailText,
        object,
        campagneId: id,
        img: img ? img : "",
        title,
        delay: delay ? delay : "",
      });

    if (!result)
      return res.json({
        success: false,
        message: "Campagne email non modifié",
      });
    const datas = await getAllMails(req.user);
    res.json({ datas, message: "Campagne email modifié", success: true });
  } catch (error) {
    res.json({ success: false, message: "Erreur serveur" });
    console.log("ERROR UPDATE MAIL", error);
  }
};

const campagneGetMail = async (req, res) => {
  try {
    const datas = await getAllMails(req.user);
    res.json({ success: true, datas });
  } catch (error) {
    res.json({ success: false, message: "Erreur ajout d'email campagne" });
    console.log("ERROR CAMPAGNE ADD EMAIL", error);
  }
};

const campagneDelete = async (req, res) => {
  const { id } = await req.params;
  try {
    if (!id) return res.json({ success: false, message: "Données non envoyé" });
    const result = await deleteCampagne(id, req.user);
    res.json(result);
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
  campagneGetMail,
};
