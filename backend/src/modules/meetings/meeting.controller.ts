import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../prisma/client";
import { authMiddleware } from "../../middleware/authMiddleware";

export const meetingRouter = Router();

// ─── GET incoming meetings (on my posts) ─────────────────────────────────────
meetingRouter.get("/incoming", authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const meetings = await prisma.meetingRequest.findMany({
      where: { post: { userId: req.user.id } },
      include: {
        post: { select: { id: true, title: true, status: true } },
        requester: { select: { id: true, fullName: true, role: true, institution: true, city: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(meetings);
  } catch (err) { return next(err); }
});

// ─── GET sent meeting requests (by me) ───────────────────────────────────────
meetingRouter.get("/sent", authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const meetings = await prisma.meetingRequest.findMany({
      where: { requesterId: req.user.id },
      include: {
        post: { select: { id: true, title: true, status: true, userId: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return res.json(meetings);
  } catch (err) { return next(err); }
});

// ─── POST /meetings/posts/:postId — create meeting request ───────────────────
const createMeetingSchema = z.object({
  proposed_time: z.string().datetime().optional(),
  message: z.string().optional(),
  nda_accepted: z.boolean().refine((val) => val === true, {
    message: "NDA must be accepted to request a meeting",
  }),
});

meetingRouter.post("/posts/:postId", authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const parsed = createMeetingSchema.parse(req.body);
    const post = await prisma.post.findUnique({ where: { id: req.params.postId } });
    if (!post || post.status !== "ACTIVE") {
      return res.status(400).json({ error: "Post not available for meetings" });
    }
    if (post.userId === req.user.id) {
      return res.status(400).json({ error: "Owner cannot request meeting on own post" });
    }
    const existing = await prisma.meetingRequest.findFirst({
      where: { postId: post.id, requesterId: req.user.id, status: "PENDING" },
    });
    if (existing) {
      return res.status(409).json({ error: "You already have a pending request for this post" });
    }

    const meeting = await prisma.meetingRequest.create({
      data: {
        postId: post.id,
        requesterId: req.user.id,
        proposedTime: parsed.proposed_time ? new Date(parsed.proposed_time) : null,
        message: parsed.message,
        ndaAccepted: parsed.nda_accepted,
        status: "PENDING",
      },
    });

    const timeStr = parsed.proposed_time
      ? new Date(parsed.proposed_time).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
      : "TBD";

    // Notify post owner — new request received
    await prisma.notification.create({
      data: {
        userId: post.userId,
        type: "MEETING_REQUEST",
        message: `New meeting request for: "${post.title}" — proposed time: ${timeStr}`,
      },
    });

    // Notify requester — confirmation
    await prisma.notification.create({
      data: {
        userId: req.user.id,
        type: "SYSTEM",
        message: `Your meeting request for "${post.title}" has been sent. Proposed time: ${timeStr}`,
      },
    });

    return res.status(201).json(meeting);
  } catch (err) { return next(err); }
});

// ─── PATCH /meetings/:id/respond — accept / reject / propose new time ─────────
const respondSchema = z.object({
  action: z.enum(["ACCEPT", "REJECT", "PROPOSE_NEW_TIME"]),
  new_time: z.string().datetime().optional(),
});

meetingRouter.patch("/:id/respond", authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const parsed = respondSchema.parse(req.body);

    const meeting = await prisma.meetingRequest.findUnique({
      where: { id: req.params.id },
      include: {
        post: true,
        requester: { select: { id: true, fullName: true } },
      },
    });
    if (!meeting) return res.status(404).json({ error: "Meeting request not found" });
    if (meeting.post.userId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

    let newStatus = meeting.status;
    let newTime = meeting.proposedTime;

    if (parsed.action === "ACCEPT") newStatus = "ACCEPTED";
    else if (parsed.action === "REJECT") newStatus = "REJECTED";
    else if (parsed.action === "PROPOSE_NEW_TIME" && parsed.new_time) {
      newStatus = "PENDING";
      newTime = new Date(parsed.new_time);
    }

    const updated = await prisma.meetingRequest.update({
      where: { id: meeting.id },
      data: { status: newStatus, proposedTime: newTime },
    });

    if (parsed.action === "ACCEPT") {
      // Update post status
      await prisma.post.update({
        where: { id: meeting.postId },
        data: { status: "MEETING_SCHEDULED" },
      });

      const confirmedTime = newTime
        ? newTime.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
        : "TBD";

      // Notify REQUESTER — meeting confirmed with time
      await prisma.notification.create({
        data: {
          userId: meeting.requester.id,
          type: "MEETING_REQUEST",
          message: `✅ Your meeting request for "${meeting.post.title}" was accepted! Confirmed time: ${confirmedTime}`,
        },
      });

      // Notify POST OWNER (themselves) — reminder with time
      await prisma.notification.create({
        data: {
          userId: meeting.post.userId,
          type: "MEETING_REQUEST",
          message: `✅ You accepted a meeting request for "${meeting.post.title}" with ${meeting.requester.fullName}. Confirmed time: ${confirmedTime}`,
        },
      });

    } else if (parsed.action === "REJECT") {
      await prisma.notification.create({
        data: {
          userId: meeting.requester.id,
          type: "MEETING_REQUEST",
          message: `Your meeting request for "${meeting.post.title}" was declined.`,
        },
      });

    } else if (parsed.action === "PROPOSE_NEW_TIME" && parsed.new_time) {
      const proposedStr = new Date(parsed.new_time).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });

      // Notify REQUESTER — owner proposed a new time
      await prisma.notification.create({
        data: {
          userId: meeting.requester.id,
          type: "MEETING_REQUEST",
          message: `The owner of "${meeting.post.title}" proposed a new meeting time: ${proposedStr}. Check your dashboard.`,
        },
      });
    }

    return res.json(updated);
  } catch (err) { return next(err); }
});

// ─── PUT /meetings/:id — requester updates pending request ────────────────────
const updateMeetingSchema = z.object({
  proposed_time: z.string().datetime().optional(),
  message: z.string().optional(),
});

meetingRouter.put("/:id", authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const parsed = updateMeetingSchema.parse(req.body);
    const meeting = await prisma.meetingRequest.findUnique({ where: { id: req.params.id } });
    if (!meeting) return res.status(404).json({ error: "Not found" });
    if (meeting.requesterId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    if (meeting.status !== "PENDING") return res.status(400).json({ error: "Only PENDING requests can be edited." });

    const updated = await prisma.meetingRequest.update({
      where: { id: meeting.id },
      data: {
        ...(parsed.proposed_time && { proposedTime: new Date(parsed.proposed_time) }),
        ...(parsed.message !== undefined && { message: parsed.message }),
      },
    });
    return res.json(updated);
  } catch (err) { return next(err); }
});

// ─── DELETE /meetings/:id — requester cancels ────────────────────────────────
meetingRouter.delete("/:id", authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    const meeting = await prisma.meetingRequest.findUnique({ where: { id: req.params.id } });
    if (!meeting) return res.status(404).json({ error: "Not found" });
    if (meeting.requesterId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
    await prisma.meetingRequest.delete({ where: { id: meeting.id } });
    return res.json({ message: "Deleted successfully" });
  } catch (err) { return next(err); }
});
