import { Router } from "express";
import { prisma } from "../../prisma/client";
import { authMiddleware } from "../../middleware/authMiddleware";
import { requireRole } from "../../middleware/roleMiddleware";

export const adminRouter = Router();

adminRouter.use(authMiddleware, requireRole(["ADMIN"]));

adminRouter.get("/users", async (req, res, next) => {
  try {
    const { role } = req.query;
    const whereClause: any = {};
    if (role) whereClause.role = String(role);
    
    let users: any = await prisma.user.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { posts: true, activityLogs: true, meetingRequests: true }
        }
      }
    });

    // Calculate profile completeness heuristic
    users = users.map((u: any) => {
      let completeness = 0;
      let totalFields = 4; // fullName, institution, city, country
      if (u.fullName) completeness++;
      if (u.institution) completeness++;
      if (u.city) completeness++;
      if (u.country) completeness++;
      
      return {
        ...u,
        profileCompleteness: `${Math.round((completeness / totalFields) * 100)}%`
      }
    });

    return res.json(users);
  } catch (err) {
    return next(err);
  }
});

adminRouter.patch("/users/:id/suspend", async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: false }
    });
    return res.json({ message: "User suspended successfully", user });
  } catch (err) {
    return next(err);
  }
});

adminRouter.patch("/users/:id/activate", async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: true }
    });
    return res.json({ message: "User activated successfully", user });
  } catch (err) {
    return next(err);
  }
});

// Post Management endpoints
adminRouter.get("/posts", async (_req, res, next) => {
  try {
    const posts = await prisma.post.findMany({ include: { user: true } });
    return res.json(posts);
  } catch (err) {
    return next(err);
  }
});

adminRouter.get("/platform-stats", async (_req, res, next) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalPosts = await prisma.post.count();
    const totalMeetings = await prisma.meetingRequest.count();
    const activePosts = await prisma.post.count({ where: { status: "ACTIVE" } });
    
    return res.json({
        totalUsers,
        totalPosts,
        totalMeetings,
        activePosts
    });
  } catch (err) {
    return next(err);
  }
})

adminRouter.delete("/posts/:id", async (req, res, next) => {
  try {
    await prisma.post.delete({
      where: { id: req.params.id }
    });
    return res.json({ message: "Inappropriate post deleted" });
  } catch (err) {
    return next(err);
  }
});
