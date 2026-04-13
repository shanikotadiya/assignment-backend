const jwt = require("jsonwebtoken");
const constants = require("../config/constant");

const authMiddleware = (req, res, next) => {
  // 🔥 Check token from BOTH header + cookies
  const token =
    req.headers.authorization ||
    req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, constants.JWT.SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;