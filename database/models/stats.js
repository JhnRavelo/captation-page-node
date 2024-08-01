module.exports = (sequelize, DataTypes) => {
  const stats = sequelize.define("stats", {
    id: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
    mail: {
      allowNull: true,
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  stats.associate = (models) => {
    stats.belongsTo(models.campagnes, { foreignKey: "campagneId" });
    stats.belongsTo(models.medias, { foreignKey: "mediaId" });
  };

  return stats;
};
