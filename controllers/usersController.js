const bcrypt = require("bcrypt");
const { users } = require("../database/models");
const { Op } = require("sequelize");

const userLogin = async (req, res) => {
  try {
    const { email, password } = await req.body;

    if (!email || !password)
      return res.json({
        success: false,
        message: "Aucun données n'a été envoyer",
      });
    const isEmail = await users.findOne({
      where: {
        email: {
          [Op.eq]: email,
        },
      },
    });

    if (!isEmail)
      return res.json({
        success: false,
        message: "Utilisateur ou mot de passe non reconnu",
      });
    const match = await bcrypt.compare(password, isEmail.password);

    if (!match)
      return res.json({
        success: false,
        message: "Utilisateur ou mot de passe non reconnu",
      });
    const id = isEmail.id;
    const accessToken = users.prototype.generateToken(id);
    const refreshToken = users.prototype.generateRefreshToken(id);
    isEmail.refreshToken = refreshToken;
    await isEmail.save();
    res.cookie("link_generator_token", refreshToken, {
      httpOnly: true,
      sameSite: "None",
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.json({
      user: {
        id: isEmail.id,
        name: isEmail.name,
        email: isEmail.email,
        avatar: isEmail.avatar,
        accessToken,
      },
      success: true,
    });
  } catch (error) {
    res.json({ success: false, message: "Erreur du serveur" });
    console.log("USER LOGIN ERROR", error);
  }
};

const userLogout = async (req, res) => {
  const cookie = req.cookies;
  try {
    if (!cookie?.link_generator_token) return res.json({ success: false });
    const refreshToken = cookie.link_generator_token;
    const user = await users.findOne({
      where: {
        refreshToken: refreshToken,
      },
    });

    if (!user) {
      res.clearCookie("link_generator_token", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      return res.json({ success: false });
    }
    user.refreshToken = "";
    await user.save();
    res.clearCookie("link_generator_token", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false });
    console.log("ERROR LOGOUT WEB", error);
  }
};

module.exports = { userLogin, userLogout };
