"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validations/auth";
import { createVerificationToken } from "@/lib/tokens";
import {
  sendEmail,
  getVerificationEmailHtml,
} from "@/lib/email";

type ActionResponse = {
  success: boolean;
  error?: string;
  message?: string;
};

export const registerUser = async (
  data: z.infer<typeof registerSchema>
): Promise<ActionResponse> => {
  try {
    // Validate input
    const validatedData = registerSchema.parse(data);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        phone: validatedData.phone || null,
        city: validatedData.city || null,
        province: validatedData.province || null,
        password: hashedPassword,
        role: "BUYER", // Default role
      },
    });

    // Generate verification token
    const token = await createVerificationToken(user.id);

    // Create verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;

    // Send verification email
    try {
      await sendEmail({
        to: user.email,
        subject: "Verify Your Email - Second-Hand Marketplace",
        html: getVerificationEmailHtml(verificationUrl, user.name),
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails
      // User can request a new verification email later
    }

    return {
      success: true,
      message:
        "Account created successfully! Please check your email to verify your account.",
    };
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || "Validation error",
      };
    }

    return {
      success: false,
      error: "An error occurred during registration. Please try again.",
    };
  }
};
