const bcrypt = require("bcrypt");
const { users } = require("../database/models");
const { Op } = require("sequelize");
const FileHandler = require("../class/FileHandler");
const path = require("path");
const sendEmail = require("../utils/sendEmail");
require("dotenv").config();

const avatarPath = path.join(__dirname, "..", "public", "avatar");

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
      message: "Connexion Réussie",
    });
  } catch (error) {
    res.json({ success: false, message: "Erreur du serveur" });
    console.log("ERROR USER LOGIN", error);
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

const userEditProfile = async (req, res) => {
  try {
    const { name, password } = await req.body;

    if (!name || !req.user)
      return res.json({
        success: false,
        message: "Aucun données n'a été envoyer",
      });
    const isUser = await users.findOne({ where: { id: req.user } });

    if (!isUser)
      return res.json({ success: false, message: "Utilisateur non trouvé" });
    isUser.name = name;

    if (password) isUser.password = await bcrypt.hash(password, 10);
    const result = await isUser.save();

    if (!result)
      return res.json({
        success: false,
        message: "Utilisateur non mise à jour",
      });
    const accessToken = users.prototype.generateToken(isUser.id);
    res.json({
      success: true,
      user: {
        id: isUser.id,
        name: isUser.name,
        email: isUser.email,
        avatar: isUser.avatar,
        accessToken,
      },
      message: "Profile Modifier",
    });
  } catch (error) {
    res.json({ success: false, message: "Erreur du serveur" });
    console.log("ERROR USER EDIT PROFILE", error);
  }
};

const userEditAvatar = async (req, res) => {
  try {
    if (
      !req.files &&
      req.files[0].mimetype.split("/")[0] !== "image" &&
      !req.user
    )
      return res.json({ success: false, message: "Image non trouvé" });
    const isUser = await users.findOne({ where: { id: req.user } });

    if (!isUser)
      return res.json({ success: false, message: "Utilisateur non trouvé" });
    const fileHandler = new FileHandler();

    if (isUser.avatar)
      fileHandler.deleteFileFromDatabase(isUser.avatar, avatarPath, "avatar");
    const filePath = await fileHandler.createImage(req, avatarPath, "webp");
    isUser.avatar = filePath;
    const result = await isUser.save();

    if (!result)
      return res.json({
        success: false,
        message: "Image de Profile Non Modifier",
      });
    const accessToken = users.prototype.generateToken(isUser.id);
    res.json({
      success: true,
      user: {
        id: isUser.id,
        name: isUser.name,
        email: isUser.email,
        avatar: isUser.avatar,
        accessToken,
      },
      message: "Image de Profile Modifier",
    });
  } catch (error) {
    res.json({ success: false, message: "Erreur serveur" });
    console.log("ERROR USER EDIT AVATAR", error);
  }
};

const userPasswordForget = async (req, res) => {
  try {
    const { email } = await req.body;

    if (!email)
      return res.json({
        success: false,
        message: "Erreur utilisateur non envoyé",
      });
    const userMail = await users.findOne({ where: { email: email } });

    if (!userMail)
      return res.json({
        success: false,
        message: "Erreur utilisateur non trouvé",
      });
    const subject =
      "Réinitialisation de Mot de Passe : Votre Nouvel Accès Sécurisé";
    const content = `<p style="font-family: 'Lato', sans-serif;">
      Cher Utilisateur,<br /> <br />

      Nous avons reçu une demande de réinitialisation de votre mot de passe.
      Pour garantir la sécurité de votre compte, un nouveau mot de passe a été
      généré pour vous. <br /> <br />
      Veuillez trouver votre nouveau mot de passe ci-dessous : <br />

      Nouveau mot de passe temporaire : ${process.env.PASSWORD_RESET} <br /> <br />

      Il est important de noter que ce mot de passe a été généré de manière
      sécurisée et est temporaire. Pour assurer la protection continue de vos
      informations, nous vous recommandons de vous connecter dès que possible et
      de changer ce mot de passe temporaire par un mot de passe personnel et
      sécurisé. Pour ce faire, connectez-vous à votre compte avec le mot de
      passe temporaire, accédez au trois points à coter de votre photo de profils 
      et cliquez sur 'Modifier Profile', ensuite modifier votre mot de passe. <br /> <br />

      Nous vous rappelons l'importance d'utiliser un mot de passe fort,
      combinant lettres majuscules et minuscules, chiffres, afin de renforcer 
      la sécurité de votre compte. Si vous n'avez
      pas initié cette demande de réinitialisation, veuillez contacter
      immédiatement notre service d'assistance pour prendre les mesures
      nécessaires. <br /> <br />

      Merci de votre attention et de votre compréhension. Votre sécurité est
      notre priorité. <br /> <br />

      Cordialement, <br /> <br />

      L'Équipe de Support
    </p>`;
    userMail.password = await bcrypt.hash(process.env.PASSWORD_RESET, 10);
    await userMail.save();
    sendEmail("Europ'Alu", email, subject, content);
    res.json({ success: true, message: "Nous vous avons envoyer un email" });
  } catch (error) {
    res.json({ success: false, message: "Erreur serveur mot de passe" });
    console.log("ERROR PASSWORD FORGET", error);
  }
};

module.exports = {
  userLogin,
  userLogout,
  userEditProfile,
  userEditAvatar,
  userPasswordForget,
};
