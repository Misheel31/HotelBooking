const crypto = require("crypto");
const algorithm = "aes-256-cbc";

if (!process.env.ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY is not set in environment variables");
}

const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  let cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(text) {
  let parts = text.split(":");
  let iv = Buffer.from(parts.shift(), "hex");
  let encryptedText = parts.join(":");
  let decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

module.exports = {
  encrypt,
  decrypt,
};
