import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import { prisma } from "../../server";

export const getHomePageConfig = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const config = await prisma.homePageConfig.findFirst();

    if (!config) {
      // Create default config if none exists
      const defaultConfig = await prisma.homePageConfig.create({
        data: {
          updatedBy: req.user?.userId || "",
        },
      });

      res.json({
        success: true,
        data: defaultConfig,
      });
      return;
    }

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Error fetching homepage config:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch homepage config",
    });
  }
};

export const updateHomePageConfig = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      heroSectionEnabled,
      trustSignalsEnabled,
      featuredCategoriesEnabled,
      trendingProductsEnabled,
      promotionalBannersEnabled,
      personalizedRecsEnabled,
      flashSalesEnabled,
      blogSectionEnabled,
      trendingProductsTitle,
      trendingProductsSubtitle,
      featuredCategoriesTitle,
      featuredCategoriesSubtitle,
      personalizedRecsTitle,
      personalizedRecsSubtitle,
      blogSectionTitle,
      blogSectionSubtitle,
      trendingProductsLimit,
      featuredCategoriesLimit,
      flashSaleProductsLimit,
      blogPostsLimit,
    } = req.body;

    const config = await prisma.homePageConfig.upsert({
      where: {
        id: req.body.id || "default",
      },
      create: {
        heroSectionEnabled,
        trustSignalsEnabled,
        featuredCategoriesEnabled,
        trendingProductsEnabled,
        promotionalBannersEnabled,
        personalizedRecsEnabled,
        flashSalesEnabled,
        blogSectionEnabled,
        trendingProductsTitle,
        trendingProductsSubtitle,
        featuredCategoriesTitle,
        featuredCategoriesSubtitle,
        personalizedRecsTitle,
        personalizedRecsSubtitle,
        blogSectionTitle,
        blogSectionSubtitle,
        trendingProductsLimit,
        featuredCategoriesLimit,
        flashSaleProductsLimit,
        blogPostsLimit,
        updatedBy: req.user?.userId || "",
      },
      update: {
        heroSectionEnabled,
        trustSignalsEnabled,
        featuredCategoriesEnabled,
        trendingProductsEnabled,
        promotionalBannersEnabled,
        personalizedRecsEnabled,
        flashSalesEnabled,
        blogSectionEnabled,
        trendingProductsTitle,
        trendingProductsSubtitle,
        featuredCategoriesTitle,
        featuredCategoriesSubtitle,
        personalizedRecsTitle,
        personalizedRecsSubtitle,
        blogSectionTitle,
        blogSectionSubtitle,
        trendingProductsLimit,
        featuredCategoriesLimit,
        flashSaleProductsLimit,
        blogPostsLimit,
        updatedBy: req.user?.userId || "",
      },
    });

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Error updating homepage config:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update homepage config",
    });
  }
};
