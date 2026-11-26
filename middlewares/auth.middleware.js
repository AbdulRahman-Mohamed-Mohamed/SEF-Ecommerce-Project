import jsonwebtoken from "jsonwebtoken";
import User from "../models/User.model.js";

async function auth(req, res, next) {
  //  1- Header authorization check
  const authHeader = req.get("authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized: Token is required" });
  }
  const authParts = authHeader.trim().split(/\s+/);
  const Bearer = authParts[0]; // index[0] = "Bearer"
  const token = authParts[1]; // index[1] = token
  if (Bearer !== "Bearer" || !token) {
    return res.status(401).json({ message: "Unauthorized: Token is required" });
  }
  if (authParts.length !== 2) {
    return res.status(401).json({ message: "Unauthorized: Token is required" });
  }
  // 2- jwt verify
  try {
    const verifiedJwt = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    const subId = await User.findById(verifiedJwt.sub);
    if (!subId) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = subId;
    next();
  } catch (error) {
    // 3- Errors handle
    const TokenExpiredError = jsonwebtoken.TokenExpiredError;
    const JsonWebTokenError = jsonwebtoken.JsonWebTokenError;
    if (
      error instanceof TokenExpiredError ||
      error instanceof JsonWebTokenError
    ) {
      res.status(401).json({ message: "Invalid or expired token" });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}

export default auth;
