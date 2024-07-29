const {
  qrcodes,
  entreprises,
  medias,
  campagnes,
} = require("../database/models");

module.exports = async () => {
  const allQRCodes = await qrcodes.findAll({
    include: [{ model: medias }, { model: entreprises }, { model: campagnes }],
    order: [["createdAt", "DESC"]],
  });

  const datas = allQRCodes.map((qrcode) => {
    const value = qrcode.dataValues;

    return {
      media: value.media.media,
      url: value.media.url,
      img: value.qrcode,
      title: value.campagne.title,
      id: value.campagne.id,
      entreprise: value.entreprise.entreprise,
      url: value.url,
      dateDebut: value.createdAt,
      idData: value.id,
    };
  });

  return datas;
};