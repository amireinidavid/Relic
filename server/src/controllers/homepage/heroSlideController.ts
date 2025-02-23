import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import { prisma } from "../../server";
import cloudinary from "../../config/cloudinary";

export const createHeroSlide = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, subtitle, description, ctaText, ctaLink, order } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      res.status(400).json({
        success: false,
        error: "Image is required",
      });
      return;
    }

    // Upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path);

    const heroSlide = await prisma.heroSlide.create({
      data: {
        title,
        subtitle,
        description,
        image: imageUpload.secure_url,
        ctaText,
        ctaLink,
        order: parseInt(order),
      },
    });

    res.status(201).json({
      success: true,
      data: heroSlide,
    });
  } catch (error) {
    console.error("Error creating hero slide:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create hero slide",
    });
  }
};

export const getHeroSlides = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const heroSlides = await prisma.heroSlide.findMany({
      orderBy: {
        order: "asc",
      },
      where: {
        isActive: true,
      },
    });

    res.json({
      success: true,
      data: heroSlides,
    });
  } catch (error) {
    console.error("Error fetching hero slides:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch hero slides",
    });
  }
};

export const updateHeroSlide = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, ctaText, ctaLink, order, isActive } =
      req.body;
    const imageFile = req.file;

    let imageUrl;
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path);
      imageUrl = imageUpload.secure_url;
    }

    const heroSlide = await prisma.heroSlide.update({
      where: { id },
      data: {
        title,
        subtitle,
        description,
        ...(imageUrl && { image: imageUrl }),
        ctaText,
        ctaLink,
        order: parseInt(order),
        isActive,
      },
    });

    res.json({
      success: true,
      data: heroSlide,
    });
  } catch (error) {
    console.error("Error updating hero slide:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update hero slide",
    });
  }
};

export const deleteHeroSlide = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.heroSlide.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Hero slide deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting hero slide:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete hero slide",
    });
  }
};

export const getAdminHeroSlides = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const heroSlides = await prisma.heroSlide.findMany({
      orderBy: {
        order: "asc",
      },
      // No filter for isActive since admin needs to see all slides
    });

    res.json({
      success: true,
      data: heroSlides,
    });
  } catch (error) {
    console.error("Error fetching admin hero slides:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch hero slides",
    });
  }
};

export const updateHeroSlideOrder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { updates } = req.body;

    // Use transaction to ensure all updates succeed or none do
    await prisma.$transaction(
      updates.map((update: { id: string; order: number }) =>
        prisma.heroSlide.update({
          where: { id: update.id },
          data: { order: update.order },
        })
      )
    );

    const updatedSlides = await prisma.heroSlide.findMany({
      orderBy: { order: "asc" },
    });

    res.json({
      success: true,
      data: updatedSlides,
    });
  } catch (error) {
    console.error("Error updating hero slide order:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update hero slide order",
    });
  }
};

export const toggleHeroSlideStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const heroSlide = await prisma.heroSlide.update({
      where: { id },
      data: { isActive },
    });

    res.json({
      success: true,
      data: heroSlide,
    });
  } catch (error) {
    console.error("Error toggling hero slide status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to toggle hero slide status",
    });
  }
};
