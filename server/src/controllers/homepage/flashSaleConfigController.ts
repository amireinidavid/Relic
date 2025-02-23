import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import { prisma } from "../../server";
import cloudinary from "../../config/cloudinary";

export const createFlashSaleConfig = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      subtitle,
      description,
      startTime,
      endTime,
      products,
      isActive,
    } = req.body;

    console.log("Received data:", req.body); // Debug log

    // Validate required fields
    if (!title || !startTime || !endTime || !products) {
      console.log("Missing fields:", { title, startTime, endTime, products });
      res.status(400).json({
        success: false,
        error: "Missing required fields",
        details: {
          title,
          startTime,
          endTime,
          productsLength: products?.length,
        },
      });
      return;
    }

    let bannerImage = null;

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "flash-sales",
      });
      bannerImage = result.secure_url;
    }

    // Parse products if it's a string
    const parsedProducts =
      typeof products === "string" ? JSON.parse(products) : products;

    const flashSaleConfig = await prisma.flashSaleConfig.create({
      data: {
        title,
        subtitle: subtitle || "",
        description: description || "",
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        bannerImage,
        isActive: isActive ?? true,
        products: {
          create: parsedProducts.map((product: any) => ({
            productId: product.id,
            discountPrice: parseFloat(product.discountPrice.toString()),
            discountPercentage: parseFloat(
              product.discountPercentage.toString()
            ),
            fixedDiscount: parseFloat(product.fixedDiscount.toString()),
            discountType: product.discountType,
            originalPrice: parseFloat(product.price.toString()),
            order: parseInt(product.order.toString()),
            stock: parseInt(product.stock.toString()),
          })),
        },
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: flashSaleConfig,
    });
  } catch (error) {
    console.error("Error creating flash sale config:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create flash sale config",
    });
  }
};

export const getFlashSaleConfigs = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const flashSaleConfigs = await prisma.flashSaleConfig.findMany({
      where: {
        isActive: true,
      },
      include: {
        products: {
          include: {
            product: {
              include: {
                productImages: true,
                category: true,
                variations: true,
                specifications: true,
                flashSale: true,
              },
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
      data: flashSaleConfigs,
    });
  } catch (error) {
    console.error("Error fetching flash sale configs:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch flash sale configs",
    });
  }
};

export const updateFlashSaleConfig = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, subtitle, startTime, endTime, products, isActive } =
      req.body;

    // First, delete existing products
    await prisma.flashSaleProduct.deleteMany({
      where: {
        flashSaleId: id,
      },
    });

    const flashSaleConfig = await prisma.flashSaleConfig.update({
      where: { id },
      data: {
        title,
        subtitle,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        isActive,
        products: {
          create: products.map((product: any) => ({
            productId: product.productId,
            discountPrice: parseFloat(product.discountPrice),
            order: parseInt(product.order),
          })),
        },
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: flashSaleConfig,
    });
  } catch (error) {
    console.error("Error updating flash sale config:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update flash sale config",
    });
  }
};

export const deleteFlashSaleConfig = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.flashSaleConfig.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Flash sale config deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting flash sale config:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete flash sale config",
    });
  }
};
