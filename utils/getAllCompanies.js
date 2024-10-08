const { entreprises } = require("../database/models");

module.exports = async (id) => {
  const allEntreprises = await entreprises.findAll({ where: { userId: id } });

  const datas = allEntreprises.map((entreprise) => {
    const value = entreprise.dataValues;
    return {
      id: value.entreprise,
      logo: value.logo,
      img: value.imgCampagne,
      idData: value.id,
      company: value.entreprise,
      fontFamily: value.fontFamily,
      facebook: value.facebook,
    };
  });

  return datas;
};
