import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import { prisma } from "../../server";
import cloudinary from "../../config/cloudinary";
import slugify from "slugify";

export const createBlogPost = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, excerpt, content, category, author, isFeatured } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      res.status(400).json({
        success: false,
        error: "Image is required",
      });
      return;
    }

    const imageUpload = await cloudinary.uploader.upload(imageFile.path);
    const slug = slugify(title, { lower: true });

    const blogPost = await prisma.blogPost.create({
      data: {
        title,
        excerpt,
        content,
        image: imageUpload.secure_url,
        category,
        author,
        slug,
        isFeatured: Boolean(isFeatured),
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      data: blogPost,
    });
  } catch (error) {
    console.error("Error creating blog post:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create blog post",
    });
  }
};

export const getBlogPosts = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { featured, published } = req.query;

    const where = {
      ...(featured === "true" && { isFeatured: true }),
      ...(published === "true" && { isPublished: true }),
    };

    const blogPosts = await prisma.blogPost.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      success: true,
      data: blogPosts,
    });
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch blog posts",
    });
  }
};

export const updateBlogPost = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      excerpt,
      content,
      category,
      author,
      isFeatured,
      isPublished,
    } = req.body;
    const imageFile = req.file;

    let imageUrl;
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path);
      imageUrl = imageUpload.secure_url;
    }

    const slug = slugify(title, { lower: true });

    const blogPost = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        excerpt,
        content,
        ...(imageUrl && { image: imageUrl }),
        category,
        author,
        slug,
        isFeatured: Boolean(isFeatured),
        isPublished: Boolean(isPublished),
        ...(isPublished && { publishedAt: new Date() }),
      },
    });

    res.json({
      success: true,
      data: blogPost,
    });
  } catch (error) {
    console.error("Error updating blog post:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update blog post",
    });
  }
};

export const deleteBlogPost = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.blogPost.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete blog post",
    });
  }
};
