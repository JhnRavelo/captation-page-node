const SibApiV3Sdk = require("@sendinblue/client");
require("dotenv").config();

module.exports = async (name, to, subject, content, id, title, img, index) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  apiInstance.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    process.env.MAIL_API
  );

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.sender = {
    email: `${name.replace(" ", "-").toLowerCase() + "@gmail.com"}`,
    name: name + " Madagascar",
  };
  sendSmtpEmail.to = [{ email: to, name: "Client" }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = 
  `<html>
    <body style="margin: 0; padding: 0; font-family: 'Lato', sans-serif !important;">
      ${title}
      <table width="100%" style="margin-top: 20px; margin-bottom: 20px; padding: 0 20px;">
        <tr>
          <td align="center">
            <img
              src="http://europ-alu.com/wp-content/uploads/2024/07/MG_1935.jpg"
              alt="Image"
              style="border: 0; display: block; width: 100%;"
            />
          </td>
        </tr>
      </table>
      ${content}
      <img
        src="http://192.168.123.210:4000/stat/track-open?email=${to}&id=${id}"
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

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(
      "Email envoyé à " + to + " campagne " + id + " pour l'email " + index
    );
  } catch (error) {
    console.error("ERROR SEND EMAIL", error);
    throw error;
  }
};
