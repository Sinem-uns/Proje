import { Router } from "express";
import { prisma } from "../../prisma/client";
import { authMiddleware } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/roleMiddleware";

export const logRouter = Router();
logRouter.use(authMiddleware, requireRole(["ADMIN"]));

logRouter.get("/", async (req, res, next) => {
  try {
    const { userId, actionType, resultStatus, dateFrom, dateTo, search, limit } = req.query;

    const whereClause: any = {};

    if (userId)       whereClause.userId     = String(userId);
    if (actionType)   whereClause.actionType = String(actionType);
    if (resultStatus) whereClause.resultStatus = String(resultStatus);

    // date range filter
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        const d = new Date(String(dateFrom));
        d.setHours(0, 0, 0, 0);
        whereClause.createdAt.gte = d;
      }
      if (dateTo) {
        const d = new Date(String(dateTo));
        d.setHours(23, 59, 59, 999);
        whereClause.createdAt.lte = d;
      }
    }

    // free-text search on targetEntity
    if (search) {
      whereClause.targetEntity = { contains: String(search), mode: "insensitive" };
    }

    const take = Math.min(Number(limit) || 200, 500);

    const logs = await prisma.activityLog.findMany({
      where: whereClause,
      include: { user: { select: { email: true, role: true, fullName: true } } },
      orderBy: { createdAt: "desc" },
      take,
    });

    return res.json(logs);
  } catch (err) { return next(err); }
});

logRouter.get("/export", async (req, res, next) => {
  try {
    const { dateFrom, dateTo, actionType, resultStatus } = req.query;
    const where: any = {};

    if (actionType)   where.actionType   = String(actionType);
    if (resultStatus) where.resultStatus = String(resultStatus);
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) { const d = new Date(String(dateFrom)); d.setHours(0,0,0,0);       where.createdAt.gte = d; }
      if (dateTo)   { const d = new Date(String(dateTo));   d.setHours(23,59,59,999);  where.createdAt.lte = d; }
    }

    const logs = await prisma.activityLog.findMany({
      where,
      include: { user: { select: { email: true, role: true } } },
      orderBy: { createdAt: "desc" },
    });

    const csvRows = [
      ["ID","Timestamp","User ID","User Email","Role","Action Type","Target Entity","Result Status","IP Address"],
    ];
    for (const log of logs) {
      csvRows.push([
        log.id,
        log.createdAt.toISOString(),
        log.userId,
        log.user?.email || "N/A",
        log.user?.role  || "SYSTEM",
        log.actionType,
        log.targetEntity,
        log.resultStatus,
        log.ipAddress || "",
      ]);
    }

    const csv = csvRows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=activity_logs.csv");
    return res.send(csv);
  } catch (err) { return next(err); }
});
