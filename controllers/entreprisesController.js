const { entreprises } = require("../database/models");

const entrepriseGetAll = async (req, res) => {
  try {
    const allEntreprises = await entreprises.findAll();

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

module.exports = { entrepriseGetAll };