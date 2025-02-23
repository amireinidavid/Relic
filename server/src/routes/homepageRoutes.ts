import express from "express";
import { authenticateJwt, isSuperAdmin } from "../middleware/auth";
import { upload } from "../middleware/uploadMiddleware";
import {
  // Hero Slides
  createHeroSlide,
  getHeroSlides,
  updateHeroSlide,
  deleteHeroSlide,
  getAdminHeroSlides,
  updateHeroSlideOrder,
  toggleHeroSlideStatus,

  // Trust Signals
  createTrustSignal,
  getTrustSignals,
  updateTrustSignal,
  deleteTrustSignal,

  // Featured Categories
  getAllProducts,
  updateFeaturedProducts,
  getFeaturedProducts,
  // Promotional Banners
  createPromotionalBanner,
  getPromotionalBanners,
  updatePromotionalBanner,
  deletePromotionalBanner,

  // Flash Sale Config
  createFlashSaleConfig,
  getFlashSaleConfigs,
  updateFlashSaleConfig,
  deleteFlashSaleConfig,

  // Blog Posts
  createBlogPost,
  getBlogPosts,
  updateBlogPost,
  deleteBlogPost,

  // Homepage Config
  getHomePageConfig,
  updateHomePageConfig,
} from "../controllers/homepage";
import {
  getTrendingProducts,
  updateTrendingProducts,
} from "../controllers/homepage/trendingProductController";

const router = express.Router();

// Hero Slides Routes
router.get(
  "/admin/hero-slides",
  authenticateJwt,
  isSuperAdmin,
  getAdminHeroSlides
);
router.put(
  "/admin/hero-slides/order",
  authenticateJwt,
  isSuperAdmin,
  updateHeroSlideOrder
);
router.patch(
  "/admin/hero-slides/:id/status",
  authenticateJwt,
  isSuperAdmin,
  toggleHeroSlideStatus
);
router.post(
  "/hero-slides",
  authenticateJwt,
  isSuperAdmin,
  upload.single("image"),
  createHeroSlide
);
router.get("/hero-slides", getHeroSlides);
router.put(
  "/hero-slides/:id",
  authenticateJwt,
  isSuperAdmin,
  upload.single("image"),
  updateHeroSlide
);
router.delete(
  "/hero-slides/:id",
  authenticateJwt,
  isSuperAdmin,
  deleteHeroSlide
);

// Trust Signals Routes
router.post("/trust-signals", authenticateJwt, isSuperAdmin, createTrustSignal);
router.get("/trust-signals", getTrustSignals);
router.put(
  "/trust-signals/:id",
  authenticateJwt,
  isSuperAdmin,
  updateTrustSignal
);
router.delete(
  "/trust-signals/:id",
  authenticateJwt,
  isSuperAdmin,
  deleteTrustSignal
);

// Featured Categories Routes
router.get("/products", authenticateJwt, isSuperAdmin, getAllProducts);
router.post(
  "/featured-categories",
  authenticateJwt,
  isSuperAdmin,
  updateFeaturedProducts
);
router.get("/get-featured-categories", getFeaturedProducts);

router.post(
  "/trending-products",
  authenticateJwt,
  isSuperAdmin,
  updateTrendingProducts
);
router.get("/get-trending-products", getTrendingProducts);

// Promotional Banners Routes
// Promotional Banners Routes
router.post(
  "/promotional-banners",
  authenticateJwt,
  isSuperAdmin,
  upload.single("image"),
  createPromotionalBanner
);
router.get("/promotional-banners", getPromotionalBanners);
router.put(
  "/promotional-banners/:id",
  authenticateJwt,
  isSuperAdmin,
  upload.single("image"),
  updatePromotionalBanner
);
router.delete(
  "/promotional-banners/:id",
  authenticateJwt,
  isSuperAdmin,
  deletePromotionalBanner
);

// Flash Sale Config Routes
router.post(
  "/flash-sales",
  authenticateJwt,
  isSuperAdmin,
  createFlashSaleConfig
);
router.get("/flash-sales", getFlashSaleConfigs);
router.put(
  "/flash-sales/:id",
  authenticateJwt,
  isSuperAdmin,
  updateFlashSaleConfig
);
router.delete(
  "/flash-sales/:id",
  authenticateJwt,
  isSuperAdmin,
  deleteFlashSaleConfig
);

// Blog Posts Routes
router.post(
  "/blog-posts",
  authenticateJwt,
  isSuperAdmin,
  upload.single("image"),
  createBlogPost
);
router.get("/blog-posts", getBlogPosts);
router.put(
  "/blog-posts/:id",
  authenticateJwt,
  isSuperAdmin,
  upload.single("image"),
  updateBlogPost
);
router.delete("/blog-posts/:id", authenticateJwt, isSuperAdmin, deleteBlogPost);

// Homepage Config Routes
router.get("/config", authenticateJwt, isSuperAdmin, getHomePageConfig);
router.put("/config", authenticateJwt, isSuperAdmin, updateHomePageConfig);

export default router;
