import express from "express";
import { createPost } from "../controllers/postController";
import { createPostDto } from "../validation/createpost.dto";
import ensureAuthenticatedActor from "../middlewares/ensureAuthenticatedUser";

const router = express.Router();

// Create post route
router.post("/create", createPostDto, ensureAuthenticatedActor, createPost);

export default router;
