const jwt = require("jsonwebtoken");
const User = require("../models/user.model"); //optional

const auth = (req, res, next) => {
  const token =
    req.header("Authorization")?.replace("Bearer", " ") ||
    req?.cookies?.token ||
    req?.body?.token;

  if (!token) res.status(403).send("Token is missing");

  try {
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decode;
    //bring more info from db
  } catch (error) {
    res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = { auth };
