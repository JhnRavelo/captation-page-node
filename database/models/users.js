const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define("users", {
    id: {
      primaryKey: true,
      allowNull: false,
      type: DataTypes.INTEGER,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  users.prototype.generateToken = (id) => {
    const accessToken = jwt.sign(
      {
        id,
      },
      process.env.ACCESS_TOKEN,
      {
        expiresIn: "3600s",
      }
    );

    return accessToken;
  };

  users.prototype.generateRefreshToken = (id) => {
    const refreshToken = jwt.sign(
      {
        id,
      },
      process.env.REFRESH_TOKEN,
      {
        expiresIn: "1d",
      }
    );

    return refreshToken;
  };

  users.associate = (models) => {
    users.hasMany(models.campagnes, { foreignKey: "userId" });
  };

  return users;
};
