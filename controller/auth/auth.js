import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generate } from "randomstring";

// importing user model
import User from "../../model/user/user.js";

// importing custom error
import customError from "../../utils/error.js";

// signup controller
export const register = async (req, res, next) => {
  try {
    if (!(req.body.password === req.body.Cpassword)) {
      return next(
        customError(401, "password does not match with confirm password")
      );
    }

    const salting = await bcrypt.genSalt(12);
    const hashing = await bcrypt.hash(req.body.password, salting);

    const code_string = generate(6);

    const newUser = new User({
      ...req.body,
      password: hashing,
      code: code_string,
    });

    const alreadyExist = await User.findOne({ email: newUser.email });
    if (alreadyExist) {
      return next(customError(401, `user with ${newUser.email} already exist`));
    }

    const user = await newUser.save();
    user.password = undefined;
    user.Cpassword = undefined;
    user.code = undefined;
    user.active = undefined;
    user.isDoctor = undefined;
    
    const token = jwt.sign({ id: user._id }, process.env.super_token, {
      expiresIn: process.env.token_expires,
    });

    res
      .cookie("key", token, {
        expires: new Date(
          Date.now() + process.env.cookies_exp * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
      })
      .status(201)
      .json({
        status: "success",
        message: `User ${user.name} Account Created successfully`,
        user,
      });
  } catch (err) {
    next(err);
  }
};

// login controller
export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select(
      "+password"
    );
    if (!user) {
      return next(customError(404, "user does not exist"));
    }
    const checkPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!checkPassword) {
      return next(customError(401, "incorrect login credentials"));
    }

    user.password = undefined;
    user.isDoctor = undefined;
    user.code = undefined;
    user.active = undefined;

    const token = jwt.sign(
      {
        id: user._id,
        isDoctor: user.isDoctor,
      },
      process.env.super_token,
      {
        expiresIn: process.env.token_expires,
      }
    );

    res
      .cookie("key", token, {
        expires: new Date(
          Date.now() + process.env.cookies_exp * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
      })
      .status(201)
      .json({
        status: "success",
        message: `Welcome Back ${user.name}`,
        user,
      });
  } catch (err) {
    next(err);
  }
};

// account verification controller
export const verification = async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { code: req.body.code },
      { active: true },
      { new: true, runValidators: true }
    );
    if (!user) {
      return next(customError(401, "Unable to activate account"));
    }

    user.password = undefined;
    user.isDoctor = undefined;
    user.code = undefined;
    user.active = undefined;

    res.status(200).json({
      status: "success",
      message: `account updated successfully`,
      user,
    });
  } catch (err) {
    next(err);
  }
};
