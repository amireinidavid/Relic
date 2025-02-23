import express from "express";
import { authenticateJwt } from "../middleware/auth";
import { prisma } from "../server";

const router = express.Router();

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

export default router;
