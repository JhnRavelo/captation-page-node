const { users } = require("../database/models");
const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res) => {
  try {
    const cookie = await req.cookies;

    if (!cookie?.link_generator_token) return res.sendStatus(401);
    const refreshToken = cookie.link_generator_token;
    res.clearCookie("link_generator_token", {
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });
    const user = await users.findOne({
      where: {
        refreshToken: refreshToken,
      },
    });

    if (!user) {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN,
        async (err, decoded) => {
          if (err) {
            console.log("ERROR HACKED USER", err);
          }

          if (decoded?.id) {
            const hackedUser = await users.findOne({
              where: {
                id: decoded.id,
              },
            });

            hackedUser.refreshToken = "";
            await hackedUser.save();
          }
        }
      );
      return res.sendStatus(403);
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN,
      async (err, decoded) => {
        
        if (err) {
          user.refreshToken = "";
          await user.save();
        }

        if (err || user.id !== decoded?.id) return res.sendStatus(403);
        const id = user.id,
          role = user.role,
          newRefreshToken = users.prototype.generateRefreshToken(id),
          accessToken = users.prototype.generateToken(id, role);
        user.refreshToken = newRefreshToken;
        await user.save();
        res.cookie("link_generator_token", newRefreshToken, {
          httpOnly: true,
          sameSite: "None",
          secure: true,
          maxAge: 24 * 60 * 60 * 1000,
        });
        res.json({
          success: true,
          user: {
            role,
            accessToken,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
          },
        });
      }
    );
  } catch (error) {
    console.log("ERROR REFRESH TOKEN", error);
  }
};

module.exports = handleRefreshToken;
