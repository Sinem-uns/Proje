import { Router } from "express";
import { prisma } from "../../prisma/client";
import { authMiddleware } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/roleMiddleware";

export const adminRouter = Router();
adminRouter.use(authMiddleware, requireRole(["ADMIN"]));

// ── Users ─────────────────────────────────────────────────────────────────────
adminRouter.get("/users", async (req, res, next) => {
  try {
    const { role, isActive, dateFrom, dateTo } = req.query;
    const where: any = {};

    if (role)     where.role     = String(role);
    if (isActive !== undefined) where.isActive = isActive === "true";

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) { const d = new Date(String(dateFrom)); d.setHours(0,0,0,0);       where.createdAt.gte = d; }
      if (dateTo)   { const d = new Date(String(dateTo));   d.setHours(23,59,59,999);  where.createdAt.lte = d; }
    }

    let users: any = await prisma.user.findMany({
      where,
      select: {
        id: true, email: true, fullName: true, role: true, institution: true,
        city: true, country: true, isActive: true, isEmailVerified: true, createdAt: true,
        _count: { select: { posts: true, activityLogs: true, meetingRequests: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    users = users.map((u: any) => {
      let c = 0;
      if (u.fullName)    c++;
      if (u.institution) c++;
      if (u.city)        c++;
      if (u.country)     c++;
      return { ...u, profileCompleteness: `${Math.round((c / 4) * 100)}%` };
    });

    return res.json(users);
  } catch (err) { return next(err); }
});

adminRouter.patch("/users/:id/suspend", async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id }, data: { isActive: false },
      select: { id: true, email: true, fullName: true, isActive: true },
    });
    return res.json({ message: "User suspended", user });
  } catch (err) { return next(err); }
});

adminRouter.patch("/users/:id/activate", async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id }, data: { isActive: true },
      select: { id: true, email: true, fullName: true, isActive: true },
    });
    return res.json({ message: "User activated", user });
  } catch (err) { return next(err); }
});

// ── Posts ─────────────────────────────────────────────────────────────────────
adminRouter.get("/posts", async (req, res, next) => {
  try {
    const { status, domain, dateFrom, dateTo } = req.query;
    const where: any = {};

    if (status) where.status = String(status);
    if (domain) where.workingDomain = { contains: String(domain), mode: "insensitive" };

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) { const d = new Date(String(dateFrom)); d.setHours(0,0,0,0);       where.createdAt.gte = d; }
      if (dateTo)   { const d = new Date(String(dateTo));   d.setHours(23,59,59,999);  where.createdAt.lte = d; }
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, role: true } },
        meetingRequests: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(posts);
  } catch (err) { return next(err); }
});

adminRouter.delete("/posts/:id", async (req, res, next) => {
  try {
    await prisma.post.delete({ where: { id: req.params.id } });
    return res.json({ message: "Post deleted" });
  } catch (err) { return next(err); }
});

// ── Stats ─────────────────────────────────────────────────────────────────────
adminRouter.get("/platform-stats", async (_req, res, next) => {
  try {
    const [totalUsers, totalPosts, totalMeetings, activePosts, engineers, healthcare, partnerFound] =
      await Promise.all([
        prisma.user.count(),
        prisma.post.count(),
        prisma.meetingRequest.count(),
        prisma.post.count({ where: { status: "ACTIVE" } }),
        prisma.user.count({ where: { role: "ENGINEER" } }),
        prisma.user.count({ where: { role: "HEALTHCARE_PROFESSIONAL" } }),
        prisma.post.count({ where: { status: "PARTNER_FOUND" } }),
      ]);
    return res.json({
      totalUsers, totalPosts, totalMeetings, activePosts,
      partnerFoundPosts: partnerFound,
      userBreakdown: { engineers, healthcareProfessionals: healthcare },
    });
  } catch (err) { return next(err); }
});
