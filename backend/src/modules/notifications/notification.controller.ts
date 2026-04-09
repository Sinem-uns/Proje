import { Router } from "express";
import { prisma } from "../../prisma/client";
import { authMiddleware } from "../../middleware/authMiddleware";

export const notificationRouter = Router();

notificationRouter.use(authMiddleware);

notificationRouter.get("/", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return res.json(notifications);
  } catch (err) {
    return next(err);
  }
});

notificationRouter.patch("/:id/read", async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.id },
      data: { isRead: true }
    });

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});
