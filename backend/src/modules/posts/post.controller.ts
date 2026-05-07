import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../prisma/client";
import { authMiddleware } from "../../middleware/authMiddleware";

export const postRouter = Router();

const createPostSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  domain: z.string().min(2),
  required_expertise: z.string().min(2),
  project_stage: z.enum([
    "IDEA",
    "CONCEPT_VALIDATION",
    "PROTOTYPE_DEVELOPED",
    "PILOT_TESTING",
    "PRE_DEPLOYMENT",
  ]),
  commitment_level: z.string().min(1),
  confidentiality_level: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  target_roles: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "ACTIVE"]).optional(),
  high_level_idea: z.string().optional(),
  collaboration_type: z.string().optional(),
  expiry_date: z.string().optional(),
});

const updatePostSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  domain: z.string().min(2).optional(),
  required_expertise: z.string().min(2).optional(),
  project_stage: z
    .enum([
      "IDEA",
      "CONCEPT_VALIDATION",
      "PROTOTYPE_DEVELOPED",
      "PILOT_TESTING",
      "PRE_DEPLOYMENT",
    ])
    .optional(),
  commitment_level: z.string().min(1).optional(),
  confidentiality_level: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  status: z
    .enum(["DRAFT", "ACTIVE", "MEETING_SCHEDULED", "PARTNER_FOUND", "EXPIRED"])
    .optional(),
  high_level_idea: z.string().optional(),
  collaboration_type: z.string().optional(),
  expiry_date: z.string().optional(),
});

postRouter.get("/", async (req, res, next) => {
  try {
    const { domain, required_expertise, city, country, project_stage, status } = req.query;

    const whereClause: any = {};
    if (domain) whereClause.workingDomain = { contains: String(domain), mode: 'insensitive' };
    if (required_expertise) whereClause.requiredExpertise = { contains: String(required_expertise), mode: 'insensitive' };
    if (city) whereClause.city = { contains: String(city), mode: 'insensitive' };
    if (country) whereClause.country = { contains: String(country), mode: 'insensitive' };
    if (project_stage) whereClause.projectStage = String(project_stage);
    if (status) whereClause.status = String(status);

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: { user: { select: { id: true, fullName: true, role: true, city: true, institution: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Provide match explanation mappings as requested "match explanation gösterebilir"
    const results = posts.map(post => {
      const matchReasons = [];
      if (domain && post.workingDomain.toLowerCase().includes(String(domain).toLowerCase())) {
        matchReasons.push(`Same domain: ${post.workingDomain}`);
      }
      if (city && post.city.toLowerCase() === String(city).toLowerCase()) {
        matchReasons.push(`Same city: ${post.city}`);
      }
      return {
        ...post,
        matchExplanation: matchReasons.join(', ') || null
      }
    });

    return res.json(results);
  } catch (err) {
    return next(err);
  }
});

postRouter.get("/:id", async (req, res, next) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, fullName: true, role: true, city: true, institution: true } }, meetingRequests: true },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.json(post);
  } catch (err) {
    return next(err);
  }
});

postRouter.post("/", authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parsed = createPostSchema.parse(req.body);

    const post = await prisma.post.create({
      data: {
        userId: req.user.id,
        title: parsed.title,
        workingDomain: parsed.domain,
        shortExplanation: parsed.description,
        requiredExpertise: parsed.required_expertise,
        projectStage: parsed.project_stage,
        commitmentLevel: parsed.commitment_level,
        confidentiality: parsed.confidentiality_level,
        city: parsed.city,
        country: parsed.country,
        status: parsed.status ?? "DRAFT",
        highLevelIdea: parsed.high_level_idea,
        collaborationType: parsed.collaboration_type,
        expiryDate: parsed.expiry_date ? new Date(parsed.expiry_date) : undefined
      },
      include: { user: true },
    });

    await prisma.notification.create({
      data: {
        userId: req.user.id,
        type: "SYSTEM",
        message: `Your post "${parsed.title}" was successfully created.`
      }
    });

    return res.status(201).json(post);
  } catch (err) {
    return next(err);
  }
});

postRouter.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const parsed = updatePostSchema.parse(req.body);

    const existingPost = await prisma.post.findUnique({
      where: { id: req.params.id },
    });

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existingPost.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedPost = await prisma.post.update({
      where: { id: req.params.id },
      data: {
        ...(parsed.title && { title: parsed.title }),
        ...(parsed.description && { shortExplanation: parsed.description }),
        ...(parsed.domain && { workingDomain: parsed.domain }),
        ...(parsed.required_expertise && {
          requiredExpertise: parsed.required_expertise,
        }),
        ...(parsed.project_stage && { projectStage: parsed.project_stage }),
        ...(parsed.commitment_level && {
          commitmentLevel: parsed.commitment_level,
        }),
        ...(parsed.confidentiality_level && {
          confidentiality: parsed.confidentiality_level,
        }),
        ...(parsed.city && { city: parsed.city }),
        ...(parsed.country && { country: parsed.country }),
        ...(parsed.status && { status: parsed.status }),
        ...(parsed.high_level_idea && { highLevelIdea: parsed.high_level_idea }),
        ...(parsed.collaboration_type && { collaborationType: parsed.collaboration_type }),
        ...(parsed.expiry_date && { expiryDate: new Date(parsed.expiry_date) }),
      },
      include: { user: true },
    });

    return res.json(updatedPost);
  } catch (err) {
    return next(err);
  }
});

postRouter.patch("/:id/status", authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const statusSchema = z.object({
      status: z.enum([
        "DRAFT",
        "ACTIVE",
        "MEETING_SCHEDULED",
        "PARTNER_FOUND",
        "EXPIRED",
      ]),
    });

    const parsed = statusSchema.parse(req.body);

    const existingPost = await prisma.post.findUnique({
      where: { id: req.params.id },
    });

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existingPost.userId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updatedPost = await prisma.post.update({
      where: { id: req.params.id },
      data: { status: parsed.status },
      include: { user: true },
    });

    return res.json(updatedPost);
  } catch (err) {
    return next(err);
  }
});

postRouter.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const existingPost = await prisma.post.findUnique({
      where: { id: req.params.id },
    });

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (existingPost.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }

    await prisma.post.delete({
      where: { id: req.params.id },
    });

    return res.json({ message: "Post deleted successfully" });
  } catch (err) {
    return next(err);
  }
});