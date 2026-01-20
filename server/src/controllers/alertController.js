import { prisma } from '../app.js';
import { AppError } from '../middleware/errorHandler.js';

export const createAlert = async (req, res, next) => {
  try {
    const { filters } = req.body;

    // Validate filters
    const validFilterKeys = ['type', 'region', 'gender', 'birthYearFrom', 'birthYearTo', 'search'];
    const providedKeys = Object.keys(filters || {});
    const hasValidFilters = providedKeys.some(key => validFilterKeys.includes(key));

    if (!hasValidFilters) {
      throw new AppError('At least one filter criteria is required', 400);
    }

    // Check existing alerts count (limit to 5 per user)
    const existingCount = await prisma.searchAlert.count({
      where: { userId: req.user.id }
    });

    if (existingCount >= 5) {
      throw new AppError('Maximum number of alerts reached (5)', 400);
    }

    const alert = await prisma.searchAlert.create({
      data: {
        userId: req.user.id,
        filters
      }
    });

    res.status(201).json({ alert });
  } catch (error) {
    next(error);
  }
};

export const getMyAlerts = async (req, res, next) => {
  try {
    const alerts = await prisma.searchAlert.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ alerts });
  } catch (error) {
    next(error);
  }
};

export const updateAlert = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { filters, isActive } = req.body;

    const alert = await prisma.searchAlert.findUnique({
      where: { id }
    });

    if (!alert) {
      throw new AppError('Alert not found', 404);
    }

    if (alert.userId !== req.user.id) {
      throw new AppError('Not authorized', 403);
    }

    const updatedAlert = await prisma.searchAlert.update({
      where: { id },
      data: {
        ...(filters && { filters }),
        ...(isActive !== undefined && { isActive })
      }
    });

    res.json({ alert: updatedAlert });
  } catch (error) {
    next(error);
  }
};

export const deleteAlert = async (req, res, next) => {
  try {
    const { id } = req.params;

    const alert = await prisma.searchAlert.findUnique({
      where: { id }
    });

    if (!alert) {
      throw new AppError('Alert not found', 404);
    }

    if (alert.userId !== req.user.id) {
      throw new AppError('Not authorized', 403);
    }

    await prisma.searchAlert.delete({ where: { id } });

    res.json({ message: 'Alert deleted' });
  } catch (error) {
    next(error);
  }
};
