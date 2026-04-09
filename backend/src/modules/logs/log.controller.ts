import { Router } from "express";
import { prisma } from "../../prisma/client";
import { authMiddleware } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/roleMiddleware";

export const logRouter = Router();

logRouter.use(authMiddleware, requireRole(["ADMIN"]));

logRouter.get("/", async (req, res, next) => {
  try {
    const { userId, date, actionType } = req.query;

    const whereClause: any = {};
    if (userId) whereClause.userId = String(userId);
    if (actionType) whereClause.actionType = String(actionType);
    if (date) {
      const d = new Date(String(date));
      whereClause.createdAt = {
        gte: new Date(d.setHours(0,0,0,0)),
        lte: new Date(d.setHours(23,59,59,999))
      };
    }

    const logs = await prisma.activityLog.findMany({
      where: whereClause,
      include: { user: { select: { email: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return res.json(logs);
  } catch (err) {
    return next(err);
  }
});

logRouter.get("/export", async (req, res, next) => {
  try {
    const logs = await prisma.activityLog.findMany({
      include: { user: { select: { email: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });

    const csvRows = [
      ["ID", "Timestamp", "User ID", "User Email", "Role", "Action Type", "Target Entity", "Result Status", "IP Address"]
    ];

    for (const log of logs) {
      csvRows.push([
        log.id,
        log.createdAt.toISOString(),
        log.userId,
        log.user?.email || "N/A",
        log.user?.role || "SYSTEM",
        log.actionType,
        log.targetEntity,
        log.resultStatus,
        log.ipAddress || ""
      ]);
    }

    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=activity_logs.csv");
    return res.send(csvContent);
  } catch(err) {
    return next(err);
  }
});
