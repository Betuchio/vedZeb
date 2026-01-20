import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export const createContactRequest = async (req, res, next) => {
  try {
    const { profileId, message } = req.body;

    // Check if profile exists
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: { user: true }
    });

    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    // Can't send request to own profile
    if (profile.userId === req.user.id) {
      throw new AppError('Cannot send contact request to your own profile', 400);
    }

    // Check if request already exists
    const existingRequest = await prisma.contactRequest.findUnique({
      where: {
        fromUserId_toProfileId: {
          fromUserId: req.user.id,
          toProfileId: profileId
        }
      }
    });

    if (existingRequest) {
      throw new AppError('Contact request already sent', 409);
    }

    const contactRequest = await prisma.contactRequest.create({
      data: {
        fromUserId: req.user.id,
        toProfileId: profileId,
        message
      },
      include: {
        toProfile: {
          include: {
            photos: {
              where: { isPrimary: true },
              take: 1
            }
          }
        }
      }
    });

    res.status(201).json({ contactRequest });
  } catch (error) {
    next(error);
  }
};

export const getMyContactRequests = async (req, res, next) => {
  try {
    const { type = 'all' } = req.query;

    // Get requests I sent
    const sentRequests = type === 'received' ? [] : await prisma.contactRequest.findMany({
      where: { fromUserId: req.user.id },
      include: {
        toProfile: {
          include: {
            photos: {
              where: { isPrimary: true },
              take: 1
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get requests I received (on my profiles)
    let receivedRequests = [];
    if (type !== 'sent') {
      const myProfiles = await prisma.profile.findMany({
        where: { userId: req.user.id },
        select: { id: true }
      });

      const profileIds = myProfiles.map(p => p.id);

      receivedRequests = await prisma.contactRequest.findMany({
        where: { toProfileId: { in: profileIds } },
        include: {
          fromUser: {
            select: {
              id: true,
              phone: true,
              createdAt: true
            }
          },
          toProfile: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    res.json({
      sent: sentRequests,
      received: receivedRequests
    });
  } catch (error) {
    next(error);
  }
};

export const updateContactRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status against allowed values
    const validStatuses = ['pending', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    const contactRequest = await prisma.contactRequest.findUnique({
      where: { id },
      include: { toProfile: true }
    });

    if (!contactRequest) {
      throw new AppError('Contact request not found', 404);
    }

    // Only the profile owner can accept/reject
    if (contactRequest.toProfile.userId !== req.user.id) {
      throw new AppError('Not authorized to update this request', 403);
    }

    const updatedRequest = await prisma.contactRequest.update({
      where: { id },
      data: { status },
      include: {
        fromUser: {
          select: {
            id: true,
            phone: true
          }
        },
        toProfile: true
      }
    });

    res.json({ contactRequest: updatedRequest });
  } catch (error) {
    next(error);
  }
};

export const deleteContactRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const contactRequest = await prisma.contactRequest.findUnique({
      where: { id },
      include: { toProfile: true }
    });

    if (!contactRequest) {
      throw new AppError('Contact request not found', 404);
    }

    // Sender can delete their own request, or profile owner can delete received request
    const canDelete =
      contactRequest.fromUserId === req.user.id ||
      contactRequest.toProfile.userId === req.user.id;

    if (!canDelete) {
      throw new AppError('Not authorized to delete this request', 403);
    }

    await prisma.contactRequest.delete({ where: { id } });

    res.json({ message: 'Contact request deleted' });
  } catch (error) {
    next(error);
  }
};
