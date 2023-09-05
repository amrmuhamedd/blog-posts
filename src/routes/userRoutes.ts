import express from "express";
import { registrationDto } from "../validation/register.dto";
import { loginUser, registerUser } from "../controllers/userController";
import { loginDto } from "../validation/login.dto";

const router = express.Router();

router.post("/register", registrationDto, registerUser);
router.post("/login", loginDto, loginUser);

export default router;
