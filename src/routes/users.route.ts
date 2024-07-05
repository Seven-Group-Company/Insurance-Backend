import { Router } from "express";
import { UserService } from "../services/userService";
import { Permissions } from "../middlewares/authorization";
const permission = new Permissions();

export const usersRouter = Router();

const userService = new UserService();

usersRouter.post("/create-user", userService.createUser);
usersRouter.post("/update-user", userService.updateUser);
usersRouter.post("/login", userService.loginUser);
usersRouter.post("/verify-otp", userService.verifyOTP);
usersRouter.get("/get-user", [permission.protect], userService.getUser);
