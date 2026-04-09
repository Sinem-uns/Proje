import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../../prisma/client";
import crypto from "crypto";
import rateLimit from "express-rate-limit";

export const authRouter = Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { error: "Too many requests from this IP, please try again after 15 minutes" }
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ENGINEER", "HEALTHCARE_PROFESSIONAL", "ADMIN"]).optional(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  institution: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
});

authRouter.post("/register", authLimiter, async (req, res, next) => {
  try {
    const parsed = registerSchema.parse(req.body);

    if (
      !parsed.email.endsWith(".edu") &&
      !parsed.email.endsWith(".edu.tr")
    ) {
      return res.status(400).json({
        error: "Only institutional .edu or .edu.tr emails are allowed",
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email: parsed.email },
    });

    if (existing) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        passwordHash,
        role: parsed.role ?? "ENGINEER",
        fullName: `${parsed.first_name} ${parsed.last_name}`,
        institution: parsed.institution,
        city: parsed.city,
        country: parsed.country,
        verificationToken,
        isEmailVerified: true,
      },
    });

    return res.status(201).json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      message: "Registration successful.",
    });
  } catch (err) {
    return next(err);
  }
});

const verifySchema = z.object({
  token: z.string().min(1),
});

authRouter.post("/verify", async (req, res, next) => {
  try {
    const parsed = verifySchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: { verificationToken: parsed.token },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid verification token" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
      },
    });

    return res.json({ message: "Email successfully verified" });
  } catch (err) {
    return next(err);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", authLimiter, async (req, res, next) => {
  try {
    const parsed = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Email verification requirement removed for demo ease

    const ok = await bcrypt.compare(parsed.password, user.passwordHash);

    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      secret,
      { expiresIn: "10h" } // Longer expiration for easier testing
    );

    return res.json({
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    return next(err);
  }
});