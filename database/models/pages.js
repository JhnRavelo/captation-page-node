module.exports = (sequelize, DataTypes) => {
  const pages = sequelize.define("pages", {
    id: {
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      type: DataTypes.INTEGER,
    },
    slogan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    img: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    titleColor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    titleBackgroundColor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  pages.associate = (models) => {
    pages.belongsTo(models.campagnes, { foreignKey: "campagneId" });
    pages.belongsTo(models.entreprises, { foreignKey: "entrepriseId" });
  };

  return pages;
};
