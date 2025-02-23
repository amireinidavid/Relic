import express from "express";
import {
  authenticateJwt,
  optionalAuthenticateJwt,
  isSuperAdmin,
} from "../middleware/auth";
import {
  createProduct,
  deleteProduct,
  fetchAllProductsForAdmin,
  getProductByID,
  updateProduct,
  getProductsForClient,
  clearProductCache,
} from "../controllers/productController";
import { upload } from "../middleware/uploadMiddleware";

const router = express.Router();

// Admin routes - require full authentication
router.post(
  "/create-new-product",
  authenticateJwt,
  isSuperAdmin,
  upload.array("images", 10),
  createProduct
);

router.get(
  "/fetch-admin-products",
  authenticateJwt,
  isSuperAdmin,
  fetchAllProductsForAdmin
);

// Public routes - optional authentication
router.get(
  "/fetch-client-products",
  optionalAuthenticateJwt,
  getProductsForClient
);
router.get("/:id", optionalAuthenticateJwt, getProductByID);

// Admin routes - require full authentication
router.put(
  "/:id",
  authenticateJwt,
  isSuperAdmin,
  upload.array("images", 10),
  updateProduct
);
router.delete("/:id", authenticateJwt, isSuperAdmin, deleteProduct);
router.post("/clear-cache", authenticateJwt, isSuperAdmin, clearProductCache);

export default router;
