const { campagnes, users } = require("../database/models");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const getAllCampagnes = require("../utils/getAllCampagnes");

const campagneAdd = async (req, res) => {
  try {
    let id;
    const { title, description, dateDebut, dateFin, entreprise } =
      await req.body;
    if (!title && !description && !dateDebut && !dateFin && !entreprise)
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
    const datas = await getAllCampagnes(campagnes, users);
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

module.exports = { campagneAdd };
