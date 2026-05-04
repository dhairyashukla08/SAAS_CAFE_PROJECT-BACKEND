import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Client from "../models/Client.js";

export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password").lean();
      if (!req.user)
        return res.status(401).json({ message: "User no longer exists" });

      if (req.user.role === "admin" && req.user.tenantId) {
        const client = await Client.findById(req.user.tenantId).lean();
        if (!client) {
          return res.status(403).json({
            message: "Cafe not found. Please contact support.",
            suspended: true,
          });
        }

        if (client.subscriptionStatus === "suspended") {
          return res.status(403).json({
            message: "Your cafe has been suspended. Please contact support.",
            suspended: true,
          });
        }

        if (client.expiryDate && new Date(client.expiryDate) < new Date()) {
          return res.status(403).json({
            message:
              "Your subscription has expired. Please contact support to renew.",
            suspended: true, 
            expired: true,
          });
        }
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role (${req.user.role}) is not authorized to access this resource`,
      });
    }
    next();
  };
};

export const isSuperAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.role === "superadmin") {
      next();
    } else {
      return res.status(403).json({
        message: "Access Denied: Requires SuperAdmin Privileges",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
