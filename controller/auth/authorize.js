import jwt from "jsonwebtoken";
import customError from "../../utils/error.js";

// verify user token
export const verifyToken = (req, res, next) => {
  const token = req.cookies.key;
  if (!token) {
    return next(customError(401, "You are not Authenticated"));
  }
  jwt.verify(token, process.env.super_token, (err, user) => {
    if (err) {
      return next(customError(404, "User does not exist"));
    }
    req.user = user;
    next();
  });
};

// verify user
export const verifyUser = (req, res, next) => {
  verifyToken(req, res, next, () => {
    if (req.user.id === req.params.id || req.user.isDoctor) {
      next();
    } else {
      return next(customError(404, "User does not exist"));
    }
  });
};

// verify if user is an Admin
export const verifyDoctor = (req, res, next) => {
  verifyToken(req, res, next, () => {
    if (req.user.isDoctor) {
      next();
    } else {
      return next(customError(403, "You Are Not Authorized"));
    }
  });
};
