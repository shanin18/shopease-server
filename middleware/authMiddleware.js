const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET || "My_jwt_secret_key";

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
