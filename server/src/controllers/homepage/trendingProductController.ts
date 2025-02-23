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
// export const updateTrendingProducts = async (
//   req: AuthenticatedRequest,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { productIds } = req.body;

//     if (!Array.isArray(productIds) || productIds.length > 8) {
//       res.status(400).json({
//         success: false,
//         error: "Invalid product IDs or too many products (maximum 8 allowed)",
//       });
//       return;
//     }

//     // Reset all products' trending status
//     await prisma.product.updateMany({
//       data: {
//         isTrending: false,
//       },
//     });

//     // Update selected products as trending
//     if (productIds.length > 0) {
//       await prisma.product.updateMany({
//         where: {
//           id: {
//             in: productIds,
//           },
//         },
//         data: {
//           isTrending: true,
//         },
//       });
//     }

//     // Fetch ALL products with their trending status
//     const allProducts = await prisma.product.findMany({
//       where: {
//         status: "PUBLISHED",
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
//     });

//     res.json({
//       success: true,
//       data: allProducts,
//       message: "Trending products updated successfully",
//     });
//   } catch (error) {
//     console.error("Error updating trending products:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to update trending products",
//     });
//   }
// };
export const updateTrendingProducts = async (
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
        isTrending: false,
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
        isTrending: true,
      },
    });

    // Fetch the updated featured products
    const featuredProducts = await prisma.product.findMany({
      where: {
        isTrending: true,
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
export const getTrendingProducts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const trendingProducts = await prisma.product.findMany({
      where: {
        isTrending: true,
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
      data: trendingProducts,
    });
  } catch (error) {
    console.error("Error fetching trending products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch trending products",
    });
  }
};

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
