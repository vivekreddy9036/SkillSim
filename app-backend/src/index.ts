import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./env.js";
import { authRouter } from "./routes/auth.js";
import { catalogRouter } from "./routes/catalog.js";
import { sandboxRouter } from "./routes/sandbox.js";
import { internalRouter } from "./routes/internal.js";
import { meRouter } from "./routes/me.js";

const app = express();
app.use(helmet());
// Reject cross-origin requests outside the configured allow-list instead of
// reflecting every Origin — /internal is exempt since it's never called by a browser.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

// Auth endpoints are the credential-stuffing/brute-force surface — cap attempts per IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "too many attempts, try again later" },
});

app.use("/auth", authLimiter, authRouter);
app.use("/", catalogRouter);
app.use("/", sandboxRouter);
app.use("/me", meRouter);
app.use("/internal", internalRouter);

app.listen(env.port, () => {
  console.log(`app-backend listening on :${env.port}`);
});
