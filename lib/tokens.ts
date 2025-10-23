import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

/**
 * Generate a secure random token
 */
export const generateSecureToken = (): string => {
  return randomBytes(32).toString("hex");
};

/**
 * Create email verification token
 */
export const createVerificationToken = async (userId: string) => {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Delete any existing tokens for this user
  await prisma.verificationToken.deleteMany({
    where: { userId },
  });

  // Create new token
  const verificationToken = await prisma.verificationToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return verificationToken.token;
};

/**
 * Verify email verification token
 */
export const verifyEmailToken = async (token: string) => {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verificationToken) {
    return { success: false, error: "Invalid verification token" };
  }

  if (verificationToken.expiresAt < new Date()) {
    await prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    });
    return { success: false, error: "Verification token has expired" };
  }

  // Update user email verified status
  await prisma.user.update({
    where: { id: verificationToken.userId },
    data: { emailVerified: new Date() },
  });

  // Delete the used token
  await prisma.verificationToken.delete({
    where: { id: verificationToken.id },
  });

  return { success: true, user: verificationToken.user };
};

/**
 * Create password reset token
 */
export const createPasswordResetToken = async (userId: string) => {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete any existing tokens for this user
  await prisma.passwordResetToken.deleteMany({
    where: { userId },
  });

  // Create new token
  const resetToken = await prisma.passwordResetToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return resetToken.token;
};

/**
 * Verify password reset token
 */
export const verifyPasswordResetToken = async (token: string) => {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!resetToken) {
    return { success: false, error: "Invalid reset token" };
  }

  if (resetToken.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });
    return { success: false, error: "Reset token has expired" };
  }

  return { success: true, token: resetToken, user: resetToken.user };
};

/**
 * Delete password reset token
 */
export const deletePasswordResetToken = async (tokenId: string) => {
  await prisma.passwordResetToken.delete({
    where: { id: tokenId },
  });
};
