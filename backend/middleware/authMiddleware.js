import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const protect = async (req, res, next) => {
  //get the token from the user
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, token not found" });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "Not authorized , admin only" });
    }
  } catch (error) {
    res.status(401).json({ message: "not authorized" });
  }
};

export { protect, isAdmin };
