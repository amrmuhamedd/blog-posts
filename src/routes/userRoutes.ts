import express from "express";
import { registrationDto } from "../validation/register.dto";
import { registerUser } from "../controllers/userController";

const router = express.Router();

router.post("/register", registrationDto, registerUser);

export default router;
