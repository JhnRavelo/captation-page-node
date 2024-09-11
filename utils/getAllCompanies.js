const { entreprises } = require("../database/models");

module.exports = async () => {
  const allEntreprises = await entreprises.findAll();

  const datas = allEntreprises.map((entreprise) => {
    const value = entreprise.dataValues;
    return {
      id: value.entreprise,
      logo: value.logo,
      imgCampagne: value.imgCampagne,
      idData: value.id,
    };
  });

  return datas;
};