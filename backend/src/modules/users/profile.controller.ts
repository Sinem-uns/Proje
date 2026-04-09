import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware";
import { prisma } from "../../prisma/client";

export const profileRouter = Router();

profileRouter.use(authMiddleware);

profileRouter.get("/", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          institution: true,
          city: true,
          country: true,
          createdAt: true
      }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (err) {
    return next(err);
  }
});

// GDPR: Data Export
profileRouter.get("/export", async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      const userData = await prisma.user.findUnique({
          where: { id: req.user.id },
          include: {
              posts: true,
              meetingRequests: { include: { post: true } },
              activityLogs: true
          }
      });

      if (!userData) return res.status(404).json({ error: "User not found" });

      res.setHeader("Content-Disposition", "attachment; filename=my_data.json");
      res.setHeader("Content-Type", "application/json");
      return res.send(JSON.stringify(userData, null, 2));

    } catch (err) {
      return next(err);
    }
});

// GDPR: Account Deletion
profileRouter.delete("/", async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      
      await prisma.user.delete({
          where: { id: req.user.id }
      });

      return res.json({ message: "Account deleted successfully according to GDPR regulations." });
    } catch (err) {
      return next(err);
    }
});
