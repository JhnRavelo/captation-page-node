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
    email: `${name.replace(" ", "-").toLowerCase() + "@gmail.com"}`,
    name: name + " Madagascar",
  };
  sendSmtpEmail.to = [{ email: to, name: "Client" }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = content;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
  } catch (error) {
    console.error("ERROR SEND EMAIL", error);
    throw error;
  }
};
