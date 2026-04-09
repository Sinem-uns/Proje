import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";

export const activityLogger = (req: Request, res: Response, next: NextFunction) => {
  res.on("finish", async () => {
    try {
      // Basic heuristic to determine action type
      let actionType = "UNKNOWN";
      let targetEntity = req.path;
      
      if (req.path.includes("/auth/login")) actionType = "LOGIN";
      else if (req.path.includes("/auth/register")) actionType = "REGISTER";
      else if (req.path.includes("/auth/logout")) actionType = "LOGOUT";
      else if (req.path.includes("/posts") && req.method === "POST") actionType = "POST_CREATE";
      else if (req.path.includes("/posts") && req.method === "PUT") actionType = "POST_EDIT";
      else if (req.path.includes("/posts") && req.method === "PATCH") actionType = "POST_STATUS_CHANGE";
      else if (req.path.includes("/posts") && req.method === "DELETE") actionType = "POST_DELETE";
      else if (req.path.includes("/meetings") && req.method === "POST") actionType = "MEETING_REQUEST";
      else if (req.path.includes("/meetings") && req.method === "PATCH") actionType = "MEETING_RESPOND";
      else if (req.path.includes("/admin")) actionType = "ADMIN_ACTION";
      
      // We only care about specific loggable actions rather than every GET request
      if (actionType === "UNKNOWN" && req.method === "GET") return;

      const userId = (req as any).user?.id || "ANONYMOUS";
      
      const resultStatus = res.statusCode >= 400 ? "FAILED" : "SUCCESS";
      
      // For failed logins specifically as requested
      if (actionType === "LOGIN" && resultStatus === "FAILED") {
        actionType = "FAILED_LOGIN";
      }

      const ipAddress = req.ip || req.socket.remoteAddress || "UNKNOWN";

      await prisma.activityLog.create({
        data: {
          userId: userId === "ANONYMOUS" ? "SYSTEM" : userId, // fallback if user isn't attached
          actionType,
          targetEntity,
          resultStatus,
          ipAddress
        }
      });
    } catch (error) {
      console.error("Failed to write to activity log", error);
    }
  });

  next();
};
