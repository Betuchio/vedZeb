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

    // Create contact request
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

    // If message is provided, also create a message record
    if (message) {
      await prisma.message.create({
        data: {
          contactRequestId: contactRequest.id,
          senderId: req.user.id,
          content: message
        }
      });
    }

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
            },
            user: {
              select: { id: true }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
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
              lastName: true,
              userId: true
            }
          },
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { updatedAt: 'desc' }
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

// Send a message in a conversation
export const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params; // contactRequestId
    const { content } = req.body;

    if (!content || !content.trim()) {
      throw new AppError('Message content is required', 400);
    }

    // Find the contact request
    const contactRequest = await prisma.contactRequest.findUnique({
      where: { id },
      include: { toProfile: true }
    });

    if (!contactRequest) {
      throw new AppError('Conversation not found', 404);
    }

    // Check if user is part of this conversation
    const isFromUser = contactRequest.fromUserId === req.user.id;
    const isProfileOwner = contactRequest.toProfile.userId === req.user.id;

    if (!isFromUser && !isProfileOwner) {
      throw new AppError('Not authorized to send message in this conversation', 403);
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        contactRequestId: id,
        senderId: req.user.id,
        content: content.trim()
      }
    });

    // Update the contactRequest updatedAt to sort conversations by recent activity
    await prisma.contactRequest.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
};

// Get messages for a conversation
export const getMessages = async (req, res, next) => {
  try {
    const { id } = req.params; // contactRequestId

    const contactRequest = await prisma.contactRequest.findUnique({
      where: { id },
      include: { toProfile: true }
    });

    if (!contactRequest) {
      throw new AppError('Conversation not found', 404);
    }

    // Check if user is part of this conversation
    const isFromUser = contactRequest.fromUserId === req.user.id;
    const isProfileOwner = contactRequest.toProfile.userId === req.user.id;

    if (!isFromUser && !isProfileOwner) {
      throw new AppError('Not authorized to view this conversation', 403);
    }

    const messages = await prisma.message.findMany({
      where: { contactRequestId: id },
      orderBy: { createdAt: 'asc' }
    });

    // Mark messages as read if user is the recipient
    await prisma.message.updateMany({
      where: {
        contactRequestId: id,
        senderId: { not: req.user.id },
        isRead: false
      },
      data: { isRead: true }
    });

    res.json({ messages, contactRequest });
  } catch (error) {
    next(error);
  }
};
