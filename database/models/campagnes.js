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
    mailText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    object: {
      type: DataTypes.STRING,
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
    campagnes.hasOne(models.qrcodes, { foreignKey: "campagneId" });
  };

  return campagnes;
};
