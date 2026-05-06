import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../../prisma/client";
import crypto from "crypto";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";

export const authRouter = Router();

// ─── Mailer ───────────────────────────────────────────────────────────────────
// Priority:
//   1. Real SMTP  → SMTP_HOST is set in .env
//   2. Dev bypass → EMAIL_VERIFICATION_BYPASS=true  (skips sending entirely)
//   3. Ethereal   → fallback for local dev (mail visible only at ethereal.email)

let _cachedTransporter: nodemailer.Transporter | null = null;

const getTransporter = async (): Promise<nodemailer.Transporter | null> => {
  if (process.env.EMAIL_VERIFICATION_BYPASS === "true") return null;

  if (process.env.SMTP_HOST) {
    if (!_cachedTransporter) {
      _cachedTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    }
    return _cachedTransporter;
  }

  console.warn(
    "\n⚠️  No SMTP_HOST configured. Using Ethereal — emails will NOT reach real inboxes.\n" +
    "   → Edit backend/.env: uncomment one of the SMTP option blocks.\n" +
    "   → Or set EMAIL_VERIFICATION_BYPASS=true to skip verification in development.\n"
  );
  const testAccount = await nodemailer.createTestAccount();
  console.log("📧 Ethereal credentials:", testAccount.user, testAccount.pass);
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
};

const sendVerificationEmail = async (email: string, token: string, fullName: string): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
  const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;
  const transporter = await getTransporter();

  if (!transporter) {
    console.log(`\n✅ DEV BYPASS — Email verification skipped for ${email}`);
    console.log(`   Manual verify URL: ${verifyUrl}\n`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"HEALTH AI Platform" <${process.env.SMTP_USER || "noreply@healthai.edu"}>`,
      to: email,
      subject: "Verify your HEALTH AI account",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:32px;border-radius:16px;">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="background:linear-gradient(135deg,#2563eb,#06b6d4);width:56px;height:56px;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;">
              <span style="color:white;font-weight:bold;font-size:24px;">H</span>
            </div>
            <h1 style="color:#0f172a;font-size:24px;margin:16px 0 4px;">HEALTH AI</h1>
            <p style="color:#64748b;font-size:14px;margin:0;">Co-Creation & Innovation Platform</p>
          </div>
          <div style="background:white;border-radius:12px;padding:32px;border:1px solid #e2e8f0;">
            <h2 style="color:#0f172a;font-size:20px;margin:0 0 16px;">Welcome, ${fullName}! 👋</h2>
            <p style="color:#475569;line-height:1.6;margin:0 0 24px;">Please verify your email address to activate your account and start collaborating.</p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${verifyUrl}" style="background:linear-gradient(135deg,#2563eb,#06b6d4);color:white;padding:14px 32px;border-radius:32px;text-decoration:none;font-weight:bold;font-size:15px;display:inline-block;">✓ Verify My Email</a>
            </div>
            <p style="color:#94a3b8;font-size:13px;text-align:center;margin:0;">Or copy this link:<br/><a href="${verifyUrl}" style="color:#2563eb;word-break:break-all;">${verifyUrl}</a></p>
          </div>
          <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:24px;">This link expires in 24 hours. If you did not register, you can safely ignore this email.</p>
        </div>
      `,
    });
    if (!process.env.SMTP_HOST) {
      console.log("📧 Ethereal preview URL:", nodemailer.getTestMessageUrl(info));
    } else {
      console.log(`📧 Verification email sent to ${email}`);
    }
  } catch (err: any) {
    console.error("❌ Failed to send verification email:", err.message);
    throw new Error(
      "Registration succeeded but the verification email could not be sent. " +
      "Please use 'Resend verification email' on the login page."
    );
  }
};

// ─── Rate limiter ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many requests from this IP, please try again after 15 minutes" },
});

// ─── Register ─────────────────────────────────────────────────────────────────
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

authRouter.get("/admin-exists", async (_req, res, next) => {
  try {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    return res.json({ exists: adminCount > 0 });
  } catch (err) { return next(err); }
});

authRouter.post("/register", authLimiter, async (req, res, next) => {
  try {
    const parsed = registerSchema.parse(req.body);

    if (!parsed.email.endsWith(".edu") && !parsed.email.endsWith(".edu.tr")) {
      return res.status(400).json({ error: "Only institutional .edu or .edu.tr emails are allowed" });
    }

    if (parsed.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount > 0) {
        return res.status(403).json({ error: "An admin account already exists. Contact your system administrator." });
      }
    }

    const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const fullName = `${parsed.first_name} ${parsed.last_name}`;
    const devBypass = process.env.EMAIL_VERIFICATION_BYPASS === "true";

    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        passwordHash,
        role: parsed.role ?? "ENGINEER",
        fullName,
        institution: parsed.institution,
        city: parsed.city,
        country: parsed.country,
        verificationToken: devBypass ? null : verificationToken,
        isEmailVerified: devBypass,
      },
    });

    if (!devBypass) {
      try {
        await sendVerificationEmail(parsed.email, verificationToken, fullName);
      } catch (mailErr: any) {
        return res.status(201).json({
          id: user.id, email: user.email, fullName: user.fullName, role: user.role,
          message: mailErr.message, emailSent: false,
        });
      }
    }

    return res.status(201).json({
      id: user.id, email: user.email, fullName: user.fullName, role: user.role,
      message: devBypass
        ? "Registration successful (dev mode — email verification skipped). You can log in immediately."
        : "Registration successful. Please check your email to verify your account.",
      emailSent: !devBypass,
    });
  } catch (err) { return next(err); }
});

// ─── Verify Email ─────────────────────────────────────────────────────────────
authRouter.post("/verify", async (req, res, next) => {
  try {
    const { token } = z.object({ token: z.string().min(1) }).parse(req.body);
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) return res.status(400).json({ error: "Invalid or expired verification token" });
    await prisma.user.update({ where: { id: user.id }, data: { isEmailVerified: true, verificationToken: null } });
    return res.json({ message: "Email successfully verified. You can now log in." });
  } catch (err) { return next(err); }
});

// ─── Resend Verification ──────────────────────────────────────────────────────
authRouter.post("/resend-verification", authLimiter, async (req, res, next) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "No account found with this email" });
    if (user.isEmailVerified) return res.status(400).json({ error: "Email already verified" });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({ where: { id: user.id }, data: { verificationToken } });

    try {
      await sendVerificationEmail(email, verificationToken, user.fullName || email);
      return res.json({ message: "Verification email resent. Please check your inbox (and spam folder)." });
    } catch (mailErr: any) {
      return res.status(500).json({ error: mailErr.message });
    }
  } catch (err) { return next(err); }
});

// ─── Login ────────────────────────────────────────────────────────────────────
authRouter.post("/login", authLimiter, async (req, res, next) => {
  try {
    const { email, password } = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    if (!user.isEmailVerified) {
      return res.status(403).json({
        error: "Please verify your email address before logging in.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: "Your account has been suspended. Contact support." });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not configured");

    const token = jwt.sign({ id: user.id, role: user.role }, secret, { expiresIn: "10h" });
    return res.json({
      accessToken: token,
      user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
    });
  } catch (err) { return next(err); }
});

// ─── GET /auth/me — return current user from JWT ─────────────────────────────
import { authMiddleware } from "../../middleware/authMiddleware";

authRouter.get("/me", authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, fullName: true, role: true, institution: true, city: true, country: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (err) { return next(err); }
});
