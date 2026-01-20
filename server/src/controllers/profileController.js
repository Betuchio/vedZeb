import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { uploadImage, deleteImage, deleteMultipleImages } from '../services/cloudinary.js';

export const getProfiles = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      type,
      region,
      gender,
      birthYearFrom,
      birthYearTo,
      birthMonth,
      birthDay,
      maternityHospital,
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      isActive: true
    };

    if (type) {
      where.type = type;
    }

    if (region) {
      where.region = region;
    }

    if (gender) {
      where.gender = gender;
    }

    if (birthYearFrom || birthYearTo) {
      where.birthYear = {};
      if (birthYearFrom) {
        where.birthYear.gte = parseInt(birthYearFrom);
      }
      if (birthYearTo) {
        where.birthYear.lte = parseInt(birthYearTo);
      }
    }

    if (birthMonth) {
      where.birthMonth = parseInt(birthMonth);
    }

    if (birthDay) {
      where.birthDay = parseInt(birthDay);
    }

    if (maternityHospital) {
      where.maternityHospital = maternityHospital;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { birthPlace: { contains: search, mode: 'insensitive' } },
        { story: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          photos: {
            where: { isPrimary: true },
            take: 1
          }
        }
      }),
      prisma.profile.count({ where })
    ]);

    res.json({
      profiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const profile = await prisma.profile.findUnique({
      where: { id },
      include: {
        photos: true,
        user: {
          select: {
            id: true,
            createdAt: true
          }
        }
      }
    });

    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    // Check if current user is the owner
    const isOwner = req.user && req.user.id === profile.userId;

    // Remove sensitive info if not owner
    if (!isOwner) {
      delete profile.user;
    }

    res.json({ profile, isOwner });
  } catch (error) {
    next(error);
  }
};

export const createProfile = async (req, res, next) => {
  try {
    const {
      type,
      firstName,
      lastName,
      birthDate,
      birthDateApproximate,
      birthYear,
      birthMonth,
      birthDay,
      birthPlace,
      maternityHospital,
      lastKnownLocation,
      region,
      gender,
      story,
      biologicalMotherInfo,
      biologicalFatherInfo,
      medicalHistory,
      myBirthYear,
      myBirthMonth,
      myBirthDay
    } = req.body;

    const profile = await prisma.profile.create({
      data: {
        userId: req.user.id,
        type,
        firstName,
        lastName,
        birthDate: birthDate ? new Date(birthDate) : null,
        birthDateApproximate: birthDateApproximate || false,
        birthYear: birthYear ? parseInt(birthYear) : null,
        birthMonth: birthMonth ? parseInt(birthMonth) : null,
        birthDay: birthDay ? parseInt(birthDay) : null,
        birthPlace,
        maternityHospital,
        lastKnownLocation,
        region,
        gender: gender || 'unknown',
        story,
        biologicalMotherInfo,
        biologicalFatherInfo,
        medicalHistory,
        myBirthYear: myBirthYear ? parseInt(myBirthYear) : null,
        myBirthMonth: myBirthMonth ? parseInt(myBirthMonth) : null,
        myBirthDay: myBirthDay ? parseInt(myBirthDay) : null
      }
    });

    res.status(201).json({ profile });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingProfile = await prisma.profile.findUnique({
      where: { id }
    });

    if (!existingProfile) {
      throw new AppError('Profile not found', 404);
    }

    if (existingProfile.userId !== req.user.id) {
      throw new AppError('Not authorized to update this profile', 403);
    }

    const {
      type,
      firstName,
      lastName,
      birthDate,
      birthDateApproximate,
      birthYear,
      birthMonth,
      birthDay,
      birthPlace,
      maternityHospital,
      lastKnownLocation,
      region,
      gender,
      story,
      biologicalMotherInfo,
      biologicalFatherInfo,
      medicalHistory,
      myBirthYear,
      myBirthMonth,
      myBirthDay,
      isActive
    } = req.body;

    const profile = await prisma.profile.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(firstName && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(birthDate !== undefined && { birthDate: birthDate ? new Date(birthDate) : null }),
        ...(birthDateApproximate !== undefined && { birthDateApproximate }),
        ...(birthYear !== undefined && { birthYear: birthYear ? parseInt(birthYear) : null }),
        ...(birthMonth !== undefined && { birthMonth: birthMonth ? parseInt(birthMonth) : null }),
        ...(birthDay !== undefined && { birthDay: birthDay ? parseInt(birthDay) : null }),
        ...(birthPlace !== undefined && { birthPlace }),
        ...(maternityHospital !== undefined && { maternityHospital }),
        ...(lastKnownLocation !== undefined && { lastKnownLocation }),
        ...(region !== undefined && { region }),
        ...(gender && { gender }),
        ...(story !== undefined && { story }),
        ...(biologicalMotherInfo !== undefined && { biologicalMotherInfo }),
        ...(biologicalFatherInfo !== undefined && { biologicalFatherInfo }),
        ...(medicalHistory !== undefined && { medicalHistory }),
        ...(myBirthYear !== undefined && { myBirthYear: myBirthYear ? parseInt(myBirthYear) : null }),
        ...(myBirthMonth !== undefined && { myBirthMonth: myBirthMonth ? parseInt(myBirthMonth) : null }),
        ...(myBirthDay !== undefined && { myBirthDay: myBirthDay ? parseInt(myBirthDay) : null }),
        ...(isActive !== undefined && { isActive })
      },
      include: {
        photos: true
      }
    });

    res.json({ profile });
  } catch (error) {
    next(error);
  }
};

export const deleteProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const profile = await prisma.profile.findUnique({
      where: { id },
      include: { photos: true }
    });

    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    if (profile.userId !== req.user.id) {
      throw new AppError('Not authorized to delete this profile', 403);
    }

    // Delete photos from Cloudinary
    const publicIds = profile.photos
      .filter(p => p.publicId)
      .map(p => p.publicId);

    if (publicIds.length > 0) {
      await deleteMultipleImages(publicIds);
    }

    // Delete profile (cascade will delete photos)
    await prisma.profile.delete({ where: { id } });

    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const uploadPhoto = async (req, res, next) => {
  try {
    const { id } = req.params;

    const profile = await prisma.profile.findUnique({
      where: { id },
      include: { photos: true }
    });

    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    if (profile.userId !== req.user.id) {
      throw new AppError('Not authorized', 403);
    }

    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    // Upload to Cloudinary
    const { url, publicId } = await uploadImage(req.file.buffer, {
      folder: `vedzeb/profiles/${id}`
    });

    // Check if this is the first photo (make it primary)
    const isPrimary = profile.photos.length === 0;

    const photo = await prisma.photo.create({
      data: {
        profileId: id,
        url,
        publicId,
        isPrimary
      }
    });

    res.status(201).json({ photo });
  } catch (error) {
    next(error);
  }
};

export const deletePhoto = async (req, res, next) => {
  try {
    const { id, photoId } = req.params;

    const profile = await prisma.profile.findUnique({
      where: { id }
    });

    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    if (profile.userId !== req.user.id) {
      throw new AppError('Not authorized', 403);
    }

    const photo = await prisma.photo.findUnique({
      where: { id: photoId }
    });

    if (!photo || photo.profileId !== id) {
      throw new AppError('Photo not found', 404);
    }

    // Delete from Cloudinary
    if (photo.publicId) {
      await deleteImage(photo.publicId);
    }

    // Delete from database
    await prisma.photo.delete({ where: { id: photoId } });

    // If deleted photo was primary, make another photo primary
    if (photo.isPrimary) {
      const nextPhoto = await prisma.photo.findFirst({
        where: { profileId: id }
      });

      if (nextPhoto) {
        await prisma.photo.update({
          where: { id: nextPhoto.id },
          data: { isPrimary: true }
        });
      }
    }

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const setPrimaryPhoto = async (req, res, next) => {
  try {
    const { id, photoId } = req.params;

    const profile = await prisma.profile.findUnique({
      where: { id }
    });

    if (!profile) {
      throw new AppError('Profile not found', 404);
    }

    if (profile.userId !== req.user.id) {
      throw new AppError('Not authorized', 403);
    }

    const photo = await prisma.photo.findUnique({
      where: { id: photoId }
    });

    if (!photo || photo.profileId !== id) {
      throw new AppError('Photo not found', 404);
    }

    // Remove primary from all photos
    await prisma.photo.updateMany({
      where: { profileId: id },
      data: { isPrimary: false }
    });

    // Set new primary
    await prisma.photo.update({
      where: { id: photoId },
      data: { isPrimary: true }
    });

    res.json({ message: 'Primary photo updated' });
  } catch (error) {
    next(error);
  }
};

export const getMyProfiles = async (req, res, next) => {
  try {
    const profiles = await prisma.profile.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        photos: {
          where: { isPrimary: true },
          take: 1
        },
        _count: {
          select: { contactRequests: true }
        }
      }
    });

    res.json({ profiles });
  } catch (error) {
    next(error);
  }
};
