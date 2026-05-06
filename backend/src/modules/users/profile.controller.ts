import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../../middleware/authMiddleware";
import { prisma } from "../../prisma/client";

export const profileRouter = Router();
profileRouter.use(authMiddleware);

profileRouter.get("/", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, fullName: true, role: true, institution: true, city: true, country: true, createdAt: true, isEmailVerified: true, isActive: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (err) { return next(err); }
});

// Section 6.1 - Edit profile
const updateProfileSchema = z.object({
  fullName: z.string().min(1).optional(),
  institution: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
});

profileRouter.put("/", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const parsed = updateProfileSchema.parse(req.body);
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(parsed.fullName && { fullName: parsed.fullName }),
        ...(parsed.institution && { institution: parsed.institution }),
        ...(parsed.city && { city: parsed.city }),
        ...(parsed.country && { country: parsed.country }),
      },
      select: { id: true, email: true, fullName: true, role: true, institution: true, city: true, country: true, createdAt: true },
    });
    return res.json(updated);
  } catch (err) { return next(err); }
});

// Section 6.3 - GDPR Data Export
profileRouter.get("/export", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const userData = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { posts: true, meetingRequests: { include: { post: true } }, activityLogs: true },
    });
    if (!userData) return res.status(404).json({ error: "User not found" });
    res.setHeader("Content-Disposition", "attachment; filename=my_data.json");
    res.setHeader("Content-Type", "application/json");
    return res.send(JSON.stringify(userData, null, 2));
  } catch (err) { return next(err); }
});

// Section 6.2 - GDPR Account Deletion
profileRouter.delete("/", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    await prisma.user.delete({ where: { id: req.user.id } });
    return res.json({ message: "Account deleted successfully according to GDPR regulations." });
  } catch (err) { return next(err); }
});
