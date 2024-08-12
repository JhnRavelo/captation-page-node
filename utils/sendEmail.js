const SibApiV3Sdk = require("@sendinblue/client");
require("dotenv").config();

module.exports = async (name, to, subject, content, id) => {
  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  apiInstance.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    process.env.MAIL_API
  );

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.sender = {
    email: `${
      name == "Alu"
        ? process.env.EMAIL_ALU_SENDER
        : name == "Vertec"
        ? process.env.EMAIL_VERTEC_SENDER
        : process.env.EMAIL_EUROP_SENDER
    }`,
    name: name + " Madagascar",
  };
  sendSmtpEmail.to = [{ email: to, name: "Client" }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = `<html><body>${content}
    <p id="email-client" style="display: none">${to}</p>
    <p id="campagne-entreprise" style="display: none">${id}</p>
    <img
      src="https://3d.europ-alu.com/track_open?email=${to}?id=${id}?opened=true"
      alt="Tracking Pixel"
      style="display: none; width: 1px; height: 1px"
    />
    <div
      style="
        display: flex;
        width: 100%;
        margin-top: 30px;
        justify-content: center;
      "
    >
      <a href="mailto:europ-alu@europ-alu.com" style="text-decoration: none;">
        <button
          id="button-devis"
          style="
            width: auto;
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
              >Demandez un devis</span>
        </button>
      </a>
    </div>
    </body></html>`;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email envoyé à " + to);
  } catch (error) {
    console.error("ERROR SEND EMAIL", error);
    throw error;
  }
};
