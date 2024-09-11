const QRCode = require("qrcode");
const { createCanvas, loadImage } = require("canvas");
const FileHandler = require("../class/FileHandler");

module.exports = async (url, logoPath, filePath) => {
  try {
    const fileHandler = new FileHandler();
    const qrCanvas = createCanvas(1200, 1200);
    await QRCode.toCanvas(qrCanvas, url, {
      errorCorrectionLevel: "H",
      margin: 1,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
    const logo = await loadImage(logoPath);
    const combinedCanvas = createCanvas(1200, 1200);
    const ctx = combinedCanvas.getContext("2d");
    ctx.drawImage(qrCanvas, 0, 0, 1200, 1200);
    let maxLogoSize = 400; 
    const logoRatio = logo.width / logo.height;

    if (logoRatio > 2) {
      maxLogoSize = 600;
    }
    let logoWidth = maxLogoSize;
    let logoHeight = maxLogoSize;

    if (logoRatio > 1) {
      logoHeight = maxLogoSize / logoRatio;
    } else {
      logoWidth = maxLogoSize * logoRatio;
    }
    const logoX = (combinedCanvas.width - logoWidth) / 2;
    const logoY = (combinedCanvas.height - logoHeight) / 2;
    ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight);

    const buffer = combinedCanvas.toBuffer("image/png");
    const { location } = fileHandler.createFile(
      "qr-code",
      buffer,
      "png",
      filePath,
      "public"
    );

    return location;
  } catch (error) {
    console.error("Error generating QR code with logo:", error);
  }
};
