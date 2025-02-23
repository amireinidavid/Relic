import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import { prisma } from "../../server";
import cloudinary from "../../config/cloudinary";
import { Prisma } from "@prisma/client";
import {
  Product,
  Category,
  ProductImage,
  ProductVariation,
  ProductSpec,
  FlashSaleProduct,
  User,
  ProductStatus,
} from "@prisma/client";

// Define types for the included relations
type ProductWithRelations = Product & {
  category: Category;
  productImages: ProductImage[];
  variations: ProductVariation[];
  specifications: ProductSpec[];
  flashSale: FlashSaleProduct[];
};

// New functions for featured products
export const updateFeaturedProducts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length > 8) {
      res.status(400).json({
        success: false,
        error: "Invalid product IDs or too many products (maximum 8 allowed)",
      });
      return;
    }

    // Reset all products' featured status
    await prisma.product.updateMany({
      data: {
        isFeatured: false,
      },
    });

    // Update selected products as featured
    await prisma.product.updateMany({
      where: {
        id: {
          in: productIds,
        },
      },
      data: {
        isFeatured: true,
      },
    });

    // Fetch the updated featured products
    const featuredProducts = await prisma.product.findMany({
      where: {
        isFeatured: true,
      },
      include: {
        category: true,
        productImages: true,
        variations: true,
        flashSale: true,
      },
    });

    res.json({
      success: true,
      data: featuredProducts,
      message: "Featured products updated successfully",
    });
  } catch (error) {
    console.error("Error updating featured products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update featured products",
    });
  }
};

export const getFeaturedProducts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const featuredProducts = await prisma.product.findMany({
      where: {
        isFeatured: true,
      },
      include: {
        category: true,
        productImages: {
          orderBy: {
            order: "asc",
          },
        },
        variations: true,
        flashSale: {
          where: {
            isActive: true,
            endTime: {
              gt: new Date(),
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
    });

    res.json({
      success: true,
      data: featuredProducts,
    });
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch featured products",
    });
  }
};

// // Helper function to get featured products with cache
// export const getFeaturedProductsWithCache = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const cacheKey = "featured-products";
//     const cachedData = await prisma.cache.findUnique({
//       where: { key: cacheKey },
//     });

//     if (cachedData && cachedData.expiresAt > new Date()) {
//       res.json({
//         success: true,
//         data: JSON.parse(cachedData.value),
//         fromCache: true,
//       });
//       return;
//     }

//     const featuredProducts = await prisma.product.findMany({
//       where: {
//         isFeatured: true,
//         isActive: true,
//       },
//       include: {
//         category: true,
//         productImages: {
//           orderBy: {
//             order: "asc",
//           },
//         },
//         variations: true,
//         flashSale: {
//           where: {
//             isActive: true,
//             endTime: {
//               gt: new Date(),
//             },
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//       take: 8,
//     });

//     // Cache the results for 1 hour
//     await prisma.cache.upsert({
//       where: { key: cacheKey },
//       update: {
//         value: JSON.stringify(featuredProducts),
//         expiresAt: new Date(Date.now() + 3600000), // 1 hour
//       },
//       create: {
//         key: cacheKey,
//         value: JSON.stringify(featuredProducts),
//         expiresAt: new Date(Date.now() + 3600000), // 1 hour
//       },
//     });

//     res.json({
//       success: true,
//       data: featuredProducts,
//       fromCache: false,
//     });
//   } catch (error) {
//     console.error("Error fetching featured products:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch featured products",
//     });
//   }
// };

export const getAllProducts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: "PUBLISHED",
      },
      include: {
        category: true,
        productImages: {
          orderBy: {
            order: "asc",
          },
        },
        variations: true,
        flashSale: {
          where: {
            isActive: true,
            endTime: {
              gt: new Date(),
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching all products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch all products",
    });
  }
};
