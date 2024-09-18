const FileHandler = require("../class/FileHandler");
const { pages, campagnes, entreprises } = require("../database/models");
const path = require("path");
const getAllPages = require("../utils/getAllPages");
const { privatePath } = require("./entreprisesController");

const pageAdd = async (req, res) => {
  try {
    const { sloganCampagne, titleColor, titleBackgroundColor, campagnes } =
      await req.body;

    if (!sloganCampagne || !titleColor || !titleBackgroundColor || !campagnes)
      return res.json({
        success: false,
        message: "Erreur données manquant pour l'ajout de page",
      });
    if (
      req.files.length == 0 ||
      (req.files.length > 0 && req.files[0].mimetype.split("/")[0] != "image")
    )
      return res.json({ success: false, message: "Pas d'image campagne reçu" });
    const isPage = await pages.findOne({ where: { campagneId: campagnes } });

    if (isPage)
      return res.json({
        success: false,
        message: "Erreur ce campagne a déjà une page",
      });
    const fileHandler = new FileHandler();
    const pagePath = path.join(privatePath, `user_${req.user}`, "page");
    const location = await fileHandler.createImage(
      req.files,
      pagePath,
      "webp",
      "private"
    );
    const result = await pages.create({
      slogan: sloganCampagne,
      img: location,
      titleColor,
      titleBackgroundColor,
      campagneId: campagnes,
    });

    if (!result)
      return res.json({
        success: false,
        message: "Erreur ajout de page dans la base de données",
      });
    const datas = await getAllPages(req.user);
    res.json({ datas, success: true });
  } catch (error) {
    console.log("ERROR ADD PAGE", error);
    res.json({ success: false, message: "Erreur serveur sur l'ajout de page" });
  }
};

const pageGetAll = async (req, res) => {
  try {
    const datas = await getAllPages(req.user);

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

const pageUpdate = async (req, res) => {
  try {
    const { sloganCampagne, titleColor, titleBackgroundColor, campagnes, id } =
      await req.body;
    if (
      !sloganCampagne ||
      !titleColor ||
      !titleBackgroundColor ||
      !campagnes ||
      !id
    )
      return res.json({
        success: false,
        message: "Erreur données manquant pour la modification de page",
      });
    const pageUpdated = await pages.findOne({ where: { id: id } });

    if (!pageUpdated)
      return res.json({
        success: false,
        message: "Erreur la page n'existe pas",
      });
    const fileHandler = new FileHandler();

    if (
      req?.files &&
      req.files.length > 0 &&
      req.files[0].mimetype.split("/")[0] == "image"
    ) {
      const pagePath = path.join(privatePath, `user_${req.user}`, "page");
      fileHandler.deleteFileFromDatabase(pageUpdated.img, pagePath, "img");
      const location = await fileHandler.createImage(
        req.files,
        pagePath,
        "webp",
        "private"
      );
      pageUpdated.img = location;
    }
    pageUpdated.set({
      titleColor,
      titleBackgroundColor,
      slogan: sloganCampagne,
      campagneId: campagnes,
    });
    const result = await pageUpdated.save();

    if (!result)
      return res.json({
        success: false,
        message: "Erreur de modification de page dans la base de données",
      });
    const datas = await getAllPages(req.user);
    res.json({ success: true, datas });
  } catch (error) {
    res.json({
      success: false,
      message: "Erreur serveur sur la modification de la page",
    });
    console.log("ERROR UPDATE PAGE", error);
  }
};

const pageDelete = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res.json({
        success: false,
        message: "Erreur données manquant pour la suppression de page",
      });
    const isPage = await pages.findOne({ where: { id: id } });

    if (!isPage)
      return res.json({ success: false, message: "Erreur page non trouvé" });
    const fileHandler = new FileHandler();
    const pagePath = path.join(privatePath, `user_${req.user}`, "page");
    fileHandler.deleteFileFromDatabase(isPage.img, pagePath, "img");
    const result = await isPage.destroy();

    if (!result)
      return res.json({ success: false, message: "Erreur page non supprimé" });
    const datas = await getAllPages(req.user);
    res.json({ datas, success: true });
  } catch (error) {
    res.json({ success: false, message: "Erreur serveur suppression page" });
    console.log("ERROR PAGE DELETE", error);
  }
};

const getSinglePage = async (req, res) => {
  try {
    const idCampagne = req.query.idCampagne;
    const isPage = await pages.findOne({
      where: { campagneId: idCampagne },
      include: [{ model: campagnes, include: [{ model: entreprises }] }],
    });

    if (!isPage) return res.json({ success: false });
    const data = {
      logo: isPage.campagne.entreprise.imgCampagne,
      titleColor: isPage.titleColor,
      titleBackgroundColor: isPage.titleBackgroundColor,
      sloganCampagne: isPage.slogan,
      description: isPage.campagne.description,
      imgCampagne: isPage.img,
      entrepriseId: isPage.campagne.entrepriseId,
      idData: isPage.id,
    };

    res.json({ success: true, data });
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR GET SINGLE PAGE", error);
  }
};

const pageGetImg = async (req, res) => {
  try {
    const { id } = await req.params;

    if (!id) return res.sendStatus(400);
    const isPage = await pages.findOne({ where: { id: id } });

    if (!isPage) return res.sendStatus(400);
    res.sendFile(isPage.img, { root: "." });
  } catch (error) {
    res.sendStatus(400);
    console.log("ERROR PAGE GET IMAGE", error);
  }
};

module.exports = {
  pageAdd,
  pageGetAll,
  pageUpdate,
  pageDelete,
  getSinglePage,
  pageGetImg,
};
