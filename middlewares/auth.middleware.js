  import jwt from "jsonwebtoken";
  import User from "../models/User.model.js";

  // protect function
  export async function protect(req, res, next) {
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
      const verifiedJwt = jwt.verify(token, process.env.JWT_SECRET);
      const subId = await User.findById(verifiedJwt.sub);
      if (!subId) {
        return res.status(401).json({ message: "User not found" });
      }
      req.user = subId;
      next();
    } catch (error) {
      // 3- Errors handle
      const TokenExpiredError = jwt.TokenExpiredError;
      const JsonWebTokenError = jwt.JsonWebTokenError;
      if (
        error instanceof TokenExpiredError ||
        error instanceof JsonWebTokenError
      ) {
        return res.status(401).json({ message: "Invalid or expired token" });
      } else {
        return res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }
  // adminOnly function
  export function adminOnly(req, res, next) {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "HTTP 403 Forbidden" });
    }
    next();
  }
