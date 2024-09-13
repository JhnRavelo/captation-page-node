const { entreprises } = require("../database/models");

module.exports = async (id) => {
  const allEntreprises = await entreprises.findAll({ where: { userId: id } });

  const datas = allEntreprises.map((entreprise) => {
    const value = entreprise.dataValues;
    return {
      id: value.entreprise,
      idData: value.id,
      company: value.entreprise,
      fontFamily: value.fontFamily,
    };
  });

  return datas;
};
