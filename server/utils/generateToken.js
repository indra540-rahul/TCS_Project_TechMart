import jwt from "jsonwebtoken";

const generateToken = (userId, tokenType = "user") =>
  jwt.sign({ userId, tokenType }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });

export default generateToken;
