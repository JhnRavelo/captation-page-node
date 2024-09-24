require("dotenv").config();

module.exports = (title, img, to, id, content) => {
  const contentMail = `<html>
    <body style="margin: 0; padding: 0; font-family: 'Lato', sans-serif !important;">
      ${title}
      <table width="100%" style="margin-top: 20px; margin-bottom: 20px; padding: 0 20px;">
        <tr>
          <td align="center">
            <img
              src="${process.env.SERVER_FRONT_PATH + img}"
              alt="Image"
              style="border: 0; display: block; width: 100%;"
            />
          </td>
        </tr>
      </table>
      ${content}
      <img
        src="${
          process.env.SERVER_FRONT_PATH
        }/stat/track-open?email=${to}&id=${id}"
        alt="Tracking Pixel"
        style="display: none; width: 1px; height: 1px"
      />
      <table
        width="100%"
        style="margin-top: 30px; margin-bottom: 20px; padding: 0 20px"
      >
        <tr>
          <td align="center">
            <a
              href="mailto:europ-alu@europ-alu.com"
              style="text-decoration: none"
            >
              <button
                id="button-devis"
                style="
                  width: 280px;
                  height: auto;
                  padding: 10px;
                  background-color: rgb(232, 98, 34);
                  border: 2px solid rgba(117, 108, 108, 0.456);
                  border-radius: 5px;
                  cursor: pointer;
                "
              >
                <span
                  style="
                    font-size: 19px;
                    font-weight: 800;
                    font-family: 'Lato', sans-serif;
                    color: aliceblue;
                  "
                  >Demandez un devis</span
                >
              </button>
            </a>
          </td>
        </tr>
      </table>
    </body>
  </html>`;

  return contentMail;
};
