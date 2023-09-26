import express from "express";
const authRoute = express.Router();

// importing auth controller
import { register, login, verification } from "../../controller/auth/auth.js";

// signup route
authRoute.post("/sign-up", register);

// login route
authRoute.post("/sign-in", login);

// activate account route
authRoute.patch("/user-activate", verification);

export default authRoute;
