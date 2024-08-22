module.exports = (sequelize, DataTypes) => {
  const campagnes = sequelize.define("campagnes", {
    id: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.STRING,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateDebut: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dateFin: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  campagnes.associate = (models) => {
    campagnes.belongsTo(models.users, {
      foreignKey: "userId",
    });
    campagnes.belongsTo(models.entreprises, {
      foreignKey: "entrepriseId",
    });
    campagnes.hasMany(models.qrcodes, { foreignKey: "campagneId" });
    campagnes.hasOne(models.pages, { foreignKey: "campagneId" });
    campagnes.hasMany(models.logs, { foreignKey: "campagneId" });
    campagnes.hasMany(models.stats, { foreignKey: "campagneId" });
    campagnes.hasMany(models.mails, { foreignKey: "campagneId" });
  };

  return campagnes;
};
