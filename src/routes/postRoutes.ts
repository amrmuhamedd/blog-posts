import express from "express";
import { ListPosts, createPost } from "../controllers/postController";
import { createPostDto } from "../validation/createpost.dto";
import ensureAuthenticatedUser from "../middlewares/ensureAuthenticatedUser";

const router = express.Router();

router.get("/", ListPosts);
router.post("/create", createPostDto, ensureAuthenticatedUser, createPost);

export default router;
