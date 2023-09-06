import express from "express";
import {
  ListPosts,
  createPost,
  deletePost,
  updatePost,
} from "../controllers/postController";
import { createPostDto } from "../validation/createpost.dto";
import ensureAuthenticatedUser from "../middlewares/ensureAuthenticatedUser";
import { updatePostDto } from "../validation/updatepost.dto";

const router = express.Router();

router.get("/", ListPosts);
router.post("/create", createPostDto, ensureAuthenticatedUser, createPost);
router.put("/:postId", updatePostDto, ensureAuthenticatedUser, updatePost);
router.delete("/delete/:postId", ensureAuthenticatedUser, deletePost);

export default router;
