import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import cloudinary from "../config/cloudinary";
import { prisma } from "../server";
import fs from "fs";
import { Prisma, ProductType } from "@prisma/client";
import redisClient from "../config/redis";
import { cacheUtils } from "../utils/redis";
import slugify from "slugify";

// Current strengths:
// 1. Handles multiple images ✓
// 2. Has variations system ✓
// 3. Supports flash sales ✓
// 4. Has specifications ✓

// Areas for improvement:
// 1. Add image optimization and validation

// 2. Add proper image management

const validateVariations = (variations: any[], categoryType: ProductType) => {
  return variations.every((variation) => {
    if (variation.stock < 0) return false;

    // For FASHION category, either clothes or shoes variations are valid
    if (categoryType === ProductType.FASHION) {
      // Clothes variation
      if (variation.type === "clothes") {
        return variation.size !== undefined;
      }
      // Shoes variation
      if (variation.type === "shoes") {
        return variation.size !== undefined && variation.color !== undefined;
      }
    }
    return true;
  });
};

export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    const {
      name,
      brand,
      description,
      categoryId,
      price,
      baseStock,
      isTrending,
      isNewArrival,
      variations,
      specifications,
      flashSale,
    } = req.body;

    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
      return;
    }

    // Parse variations and specifications
    const parsedVariations = variations ? JSON.parse(variations) : [];
    const parsedSpecifications = specifications
      ? JSON.parse(specifications)
      : [];

    // Add SKU to specifications if provided
    if (req.body.sku) {
      parsedSpecifications.push({
        key: "SKU",
        value: req.body.sku,
        group: "General",
        order: 0,
      });
    }

    // Validate variations if provided
    if (parsedVariations && parsedVariations.length > 0) {
      if (!validateVariations(parsedVariations, categoryId)) {
        res.status(400).json({
          success: false,
          message: "Invalid variations data for the selected category",
        });
        return;
      }
    }

    const files = req.files as Express.Multer.File[];

    // Upload images to Cloudinary
    const uploadPromises = files.map((file, index) =>
      cloudinary.uploader.upload(file.path, {
        folder: "ecommerce/products",
        transformation: [
          { width: 800, height: 800, crop: "fill" },
          { quality: "auto" },
          { fetch_format: "auto" },
        ],
      })
    );

    const uploadedImages = await Promise.all(uploadPromises);

    // Clean up uploaded files
    files.forEach((file) => {
      fs.unlink(file.path, (err) => {
        if (err) console.error("Error deleting file:", err);
      });
    });

    // Generate a unique slug by adding a timestamp
    const uniqueSlug = `${slugify(name, {
      lower: true,
      strict: true,
    })}-${Date.now()}`;

    // Parse flash sale data
    const parsedFlashSale = flashSale ? JSON.parse(flashSale) : null;

    // Create product with all its relations
    const product = await prisma.product.create({
      data: {
        name,
        brand,
        description,
        price: parseFloat(price),
        baseStock: parseInt(baseStock),
        categoryId,
        status: "DRAFT",
        isTrending: isTrending === "true",
        isNewArrival: isNewArrival === "true",
        slug: uniqueSlug,

        // Create product images
        productImages: {
          create: uploadedImages.map((image, index) => ({
            url: image.secure_url,
            publicId: image.public_id,
            width: image.width,
            height: image.height,
            format: image.format,
            size: image.bytes,
            thumbnailUrl: cloudinary.url(image.public_id, {
              width: 100,
              height: 100,
              crop: "fill",
            }),
            mediumUrl: cloudinary.url(image.public_id, {
              width: 400,
              height: 400,
              crop: "fill",
            }),
            order: index,
          })),
        },

        // Create variations with simplified structure
        variations:
          parsedVariations.length > 0
            ? {
                create: parsedVariations.map((v: any) => ({
                  type: v.type,
                  size: v.size,
                  color: v.color || null,
                  stock: parseInt(v.stock),
                })),
              }
            : undefined,

        // Create specifications with groups
        specifications:
          parsedSpecifications.length > 0
            ? {
                create: parsedSpecifications.map((spec: any) => ({
                  key: spec.key,
                  value: spec.value,
                  group: spec.group,
                  order: spec.order,
                })),
              }
            : undefined,

        // Add flash sale if enabled
        flashSale: parsedFlashSale?.enabled
          ? {
              create: {
                discount: parseFloat(parsedFlashSale.discountPercentage),
                startTime: new Date(parsedFlashSale.startTime),
                endTime: new Date(parsedFlashSale.endTime),
                isActive: true,
              },
            }
          : undefined,
      },
      include: {
        variations: true,
        specifications: true,
        productImages: true,
        flashSale: true,
      },
    });

    // Clear cache
    await cacheUtils.clear();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred!",
    });
  }
};

// Helper function to generate unique slug
async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const exists = await prisma.product.findUnique({
      where: { slug },
    });

    if (!exists) break;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// Fetch all products (admin)
export const fetchAllProductsForAdmin = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variations: true,
        specifications: true,
        flashSale: true,
        productImages: true,
      },
    });
    console.log(products, "products");
    res.status(200).json(products);
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "An error occurred!" });
  }
};

// Get product by ID with caching
export const getProductByID = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const cachedProduct = await cacheUtils.get(`product:${id}`);
    if (cachedProduct) {
      res.status(200).json(cachedProduct);
      return;
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variations: true,
        specifications: true,
        flashSale: true,
        flashSaleProducts: true,
        productImages: {
          orderBy: {
            order: 'asc'
          }
        },
      },
    });

    if (!product) {
      res.status(404).json({ success: false, message: "Product not found" });
      return;
    }

    await cacheUtils.set(`product:${id}`, product, 3600);

    res.status(200).json(product);
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "An error occurred!" });
  }
};

// Update product
export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      brand,
      description,
      categoryId,
      price,
      baseStock,

      isTrending,
      isNewArrival,
      variations,
      specifications,
    } = req.body;

    // Update the product and its relations
    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        brand,
        description,
        categoryId,
        price: parseFloat(price),
        baseStock: parseInt(baseStock),

        isTrending: Boolean(isTrending),
        isNewArrival: Boolean(isNewArrival),

        // Update variations if provided
        variations: variations
          ? {
              deleteMany: {},
              create: variations.map((v: any) => ({
                size: v.size,
                color: v.color,
                material: v.material,
                style: v.style,
                storage: v.storage,
                ram: v.ram,
                sku: v.sku,
                stock: parseInt(v.stock),
                price: v.price ? parseFloat(v.price) : undefined,
                images: v.images || [],
              })),
            }
          : undefined,

        // Update specifications if provided
        specifications: specifications
          ? {
              deleteMany: {},
              create: specifications.map((spec: any) => ({
                key: spec.key,
                value: spec.value,
              })),
            }
          : undefined,
      },
      include: {
        variations: true,
        specifications: true,
        category: true,
        flashSale: true,
      },
    });

    res.status(200).json(product);
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "An error occurred!" });
  }
};

// Delete product
export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Delete the product and all related records in a transaction
    await prisma.$transaction(async (prisma) => {
      // Delete related records first
      await prisma.productImage.deleteMany({
        where: { productId: id },
      });

      await prisma.productVariation.deleteMany({
        where: { productId: id },
      });

      await prisma.productSpec.deleteMany({
        where: { productId: id },
      });

      await prisma.flashSaleProduct.deleteMany({
        where: { productId: id },
      });

      // Finally delete the product
      await prisma.product.delete({
        where: { id },
      });
    });

    res.status(200).json({
      success: true,
      message: "Product and all related records deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred!",
    });
  }
};

// Get products for client with filtering
export const getProductsForClient = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const categoryId = req.query.categoryId as string;
    const type = req.query.type as ProductType;
    const minPrice = parseFloat(req.query.minPrice as string) || 0;
    const maxPrice =
      parseFloat(req.query.maxPrice as string) || Number.MAX_SAFE_INTEGER;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";
    const featured = req.query.featured === "true";
    const trending = req.query.trending === "true";
    const newArrival = req.query.newArrival === "true";

    // Add user-specific filtering if user is authenticated
    const userSpecificWhere = req.user
      ? {
          // Add any user-specific filters here
        }
      : {};

    const where: Prisma.ProductWhereInput = {
      AND: [
        categoryId ? { categoryId } : {},
        type ? { category: { type } } : {},
        { price: { gte: minPrice, lte: maxPrice } },
        featured ? { isFeatured: true } : {},
        trending ? { isTrending: true } : {},
        newArrival ? { isNewArrival: true } : {},
        userSpecificWhere,
      ],
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
          productImages: {
            orderBy: {
              order: "asc",
            },
          },
          variations: true,
          flashSale: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred!" });
  }
};

// Add this new controller function
export const clearProductCache = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    await cacheUtils.clear();

    res.status(200).json({
      success: true,
      message: "Product cache cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing cache:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "An error occurred while clearing cache!",
    });
  }
};
