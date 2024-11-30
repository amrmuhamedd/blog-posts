import express from "express";
import { createTag, listTags, updateTag, deleteTag } from "../controllers/tagController";
import ensureAuthenticatedUser from "../middlewares/ensureAuthenticatedUser";
import { isAdmin } from "../middleware/isAdmin";

const router = express.Router();

// Public routes
router.get("/", listTags);

// Protected routes (admin only)
router.post("/", ensureAuthenticatedUser, isAdmin, createTag);
router.put("/:id", ensureAuthenticatedUser, isAdmin, updateTag);
router.delete("/:id", ensureAuthenticatedUser, isAdmin, deleteTag);

export default router;
