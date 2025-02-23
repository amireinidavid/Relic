import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import { prisma } from "../../server";
import cloudinary from "../../config/cloudinary";

export const createPromotionalBanner = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, subtitle, description, buttonText, href, position, order } =
      req.body;
    const imageFile = req.file;

    if (!imageFile) {
      res.status(400).json({
        success: false,
        error: "Image is required",
      });
      return;
    }

    const imageUpload = await cloudinary.uploader.upload(imageFile.path);

    const promotionalBanner = await prisma.promotionalBanner.create({
      data: {
        title,
        subtitle,
        description,
        buttonText,
        href,
        image: imageUpload.secure_url,
        position,
        order: parseInt(order),
      },
    });

    res.status(201).json({
      success: true,
      data: promotionalBanner,
    });
  } catch (error) {
    console.error("Error creating promotional banner:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create promotional banner",
    });
  }
};

export const getPromotionalBanners = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const promotionalBanners = await prisma.promotionalBanner.findMany({
      orderBy: {
        order: "asc",
      },
      where: {
        isActive: true,
      },
    });

    res.json({
      success: true,
      data: promotionalBanners,
    });
  } catch (error) {
    console.error("Error fetching promotional banners:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch promotional banners",
    });
  }
};

export const updatePromotionalBanner = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle,
      description,
      buttonText,
      href,
      position,
      order,
      isActive,
    } = req.body;
    const imageFile = req.file;

    let imageUrl;
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path);
      imageUrl = imageUpload.secure_url;
    }

    const promotionalBanner = await prisma.promotionalBanner.update({
      where: { id },
      data: {
        title,
        subtitle,
        description,
        buttonText,
        href,
        ...(imageUrl && { image: imageUrl }),
        position,
        order: parseInt(order),
        isActive,
      },
    });

    res.json({
      success: true,
      data: promotionalBanner,
    });
  } catch (error) {
    console.error("Error updating promotional banner:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update promotional banner",
    });
  }
};

export const deletePromotionalBanner = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.promotionalBanner.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Promotional banner deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting promotional banner:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete promotional banner",
    });
  }
};
