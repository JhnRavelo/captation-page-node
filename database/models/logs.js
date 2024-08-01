module.exports = (sequelize, DataTypes) => {
  const logs = sequelize.define("logs", {
    id: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
    userMail: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    unRead: {
      allowNull: false,
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });

  logs.associate = (models) => {
    logs.belongsTo(models.campagnes, { foreignKey: "campagneId" });
    logs.belongsTo(models.medias, { foreignKey: "mediaId" });
  };

  return logs;
};
