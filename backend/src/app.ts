import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import { authRouter } from "./modules/auth/auth.controller";
import { postRouter } from "./modules/posts/post.controller";
import { meetingRouter } from "./modules/meetings/meeting.controller";
import { adminRouter } from "./modules/admin/admin.controller";
import { profileRouter } from "./modules/users/profile.controller";
import { logRouter } from "./modules/logs/log.controller";
import { notificationRouter } from "./modules/notifications/notification.controller";
import { errorHandler } from "./middleware/errorHandler";
import { activityLogger } from "./middleware/activityLogger";

dotenv.config();

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_ORIGIN || "*",
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(morgan("dev"));
  app.use(activityLogger);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/auth", authRouter);
  app.use("/posts", postRouter);
  app.use("/meetings", meetingRouter);
  app.use("/admin", adminRouter);
  app.use("/profile", profileRouter);
  app.use("/logs", logRouter);
  app.use("/notifications", notificationRouter);

  app.use(errorHandler);

  return app;
};

