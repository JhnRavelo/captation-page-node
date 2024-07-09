module.exports = (sequelize, DataTypes) => {
  const qrcodes = sequelize.define("qrcodes", {
    id: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
    qrcode: {
      allowNull: true,
      type: DataTypes.STRING,
    },
  });

  qrcodes.associate = (models) => {
    qrcodes.belongsTo(models.campagnes, {foreignKey: "campagneId"});
  }

  return qrcodes;
};
