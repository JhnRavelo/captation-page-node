const SibApiV3Sdk = require("@sendinblue/client");
require("dotenv").config();

module.exports = async (name, to, subject, content) => {
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
  sendSmtpEmail.htmlContent = `<html><body>${content}</body></html>`;
  sendSmtpEmail.trackClicks = true;
  sendSmtpEmail.trackOpens = true;

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email envoyé à " + to + " and " + data.body.messageId);
    return data.body.messageId;
  } catch (error) {
    console.error("ERROR SEND EMAIL", error);
    throw error;
  }
};
