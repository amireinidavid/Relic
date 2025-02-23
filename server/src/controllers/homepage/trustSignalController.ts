import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middleware/auth";
import { prisma } from "../../server";

export const createTrustSignal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { icon, title, description, order } = req.body;

    const trustSignal = await prisma.trustSignal.create({
      data: {
        icon,
        title,
        description,
        order: parseInt(order),
      },
    });

    res.status(201).json({
      success: true,
      data: trustSignal,
    });
  } catch (error) {
    console.error("Error creating trust signal:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create trust signal",
    });
  }
};

export const getTrustSignals = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const trustSignals = await prisma.trustSignal.findMany({
      orderBy: {
        order: "asc",
      },
      where: {
        isActive: true,
      },
    });

    res.json({
      success: true,
      data: trustSignals,
    });
  } catch (error) {
    console.error("Error fetching trust signals:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch trust signals",
    });
  }
};

export const updateTrustSignal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { icon, title, description, order, isActive } = req.body;

    const trustSignal = await prisma.trustSignal.update({
      where: { id },
      data: {
        icon,
        title,
        description,
        order: parseInt(order),
        isActive,
      },
    });

    res.json({
      success: true,
      data: trustSignal,
    });
  } catch (error) {
    console.error("Error updating trust signal:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update trust signal",
    });
  }
};

export const deleteTrustSignal = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.trustSignal.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Trust signal deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting trust signal:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete trust signal",
    });
  }
};
