import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../prisma/client";
import { authMiddleware } from "../../middleware/authMiddleware";

export const meetingRouter = Router();

const createMeetingSchema = z.object({
  proposed_time: z.string().datetime().optional(),
  message: z.string().optional(),
  nda_accepted: z.boolean().refine((val) => val === true, {
    message: "NDA must be accepted to request a meeting",
  }),
});

meetingRouter.post(
  "/posts/:postId",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const parsed = createMeetingSchema.parse(req.body);
      
      const post = await prisma.post.findUnique({
        where: { id: req.params.postId },
      });
      
      if (!post || post.status !== "ACTIVE") {
        return res.status(400).json({ error: "Post not available for meetings" });
      }
      
      if (post.userId === req.user.id) {
        return res
          .status(400)
          .json({ error: "Owner cannot request meeting on own post" });
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

      await prisma.notification.create({
        data: {
          userId: post.userId,
          type: "MEETING_REQUEST",
          message: `You have a new meeting request for your post: ${post.title}`
        }
      });

      await prisma.notification.create({
        data: {
          userId: req.user.id,
          type: "SYSTEM",
          message: `Successfully sent a meeting request for post: "${post.title}".`
        }
      });

      return res.status(201).json(meeting);
    } catch (err) {
      return next(err);
    }
  }
);

const respondSchema = z.object({
  action: z.enum(["ACCEPT", "REJECT", "PROPOSE_NEW_TIME"]),
  new_time: z.string().datetime().optional(),
});

meetingRouter.patch(
  "/:id/respond",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const parsed = respondSchema.parse(req.body);
      
      const meeting = await prisma.meetingRequest.findUnique({
        where: { id: req.params.id },
        include: { post: true }
      });
      
      if (!meeting) {
        return res.status(404).json({ error: "Meeting request not found" });
      }
      
      if (meeting.post.userId !== req.user.id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      let newStatus = meeting.status;
      let newTime = meeting.proposedTime;

      if (parsed.action === "ACCEPT") {
        newStatus = "ACCEPTED";
      } else if (parsed.action === "REJECT") {
        newStatus = "REJECTED";
      } else if (parsed.action === "PROPOSE_NEW_TIME" && parsed.new_time) {
        newStatus = "PENDING"; // Stays pending
        newTime = new Date(parsed.new_time);
      }

      const updated = await prisma.meetingRequest.update({
        where: { id: meeting.id },
        data: {
          status: newStatus,
          proposedTime: newTime,
        },
      });

      if (parsed.action === "ACCEPT") {
        await prisma.post.update({
          where: { id: meeting.postId },
          data: { status: "MEETING_SCHEDULED" },
        });
      }

      return res.json(updated);
    } catch (err) {
      return next(err);
    }
  }
);

const updateMeetingSchema = z.object({
  proposed_time: z.string().datetime().optional(),
  message: z.string().optional(),
});

meetingRouter.put(
  "/:id",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const parsed = updateMeetingSchema.parse(req.body);
      
      const meeting = await prisma.meetingRequest.findUnique({
        where: { id: req.params.id },
      });
      
      if (!meeting) return res.status(404).json({ error: "Not found" });
      if (meeting.requesterId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
      if (meeting.status !== "PENDING") return res.status(400).json({ error: "Only PENDING requests can be edited." });

      const updated = await prisma.meetingRequest.update({
        where: { id: meeting.id },
        data: {
          ...(parsed.proposed_time && { proposedTime: new Date(parsed.proposed_time) }),
          ...(parsed.message !== undefined && { message: parsed.message })
        }
      });
      return res.json(updated);
    } catch (err) {
      return next(err);
    }
  }
);

meetingRouter.delete(
  "/:id",
  authMiddleware,
  async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Unauthorized" });
      const meeting = await prisma.meetingRequest.findUnique({ where: { id: req.params.id } });
      if (!meeting) return res.status(404).json({ error: "Not found" });
      if (meeting.requesterId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
      
      await prisma.meetingRequest.delete({ where: { id: meeting.id } });
      return res.json({ message: "Deleted successfully" });
    } catch (err) {
      return next(err);
    }
  }
);
