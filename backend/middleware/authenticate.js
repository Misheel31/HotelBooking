const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET || "defaultSecretIfEnvMissing";

const authenticate = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied: No token provided" });
  }

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified;
    next();
  } catch (e) {
    console.error("Token verification error:", e);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authenticate;
