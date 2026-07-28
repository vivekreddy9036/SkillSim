import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../db.js";
import { env } from "../env.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const sandboxRouter = Router();

// POST /labs/:slug/start — creates a session row and issues a short-lived,
// scope-limited JWT the browser hands to the terminal server on WS upgrade.
sandboxRouter.post("/labs/:slug/start", requireAuth, async (req: AuthedRequest, res) => {
  const lab = await prisma.lab.findUnique({
    where: { slug: req.params.slug },
    include: { steps: { orderBy: { stepNumber: "asc" } } },
  });
  if (!lab) {
    res.status(404).json({ error: "lab not found" });
    return;
  }

  const session = await prisma.userLabSession.create({
    data: { userId: req.userId!, labId: lab.id, status: "running" },
  });

  // Steps' validation-script paths travel inside the signed token so terminal-server
  // can trust them without needing its own DB access — it only ever touches Docker.
  const attachToken = jwt.sign(
    {
      sub: req.userId,
      scope: "sandbox:attach",
      sessionId: session.id,
      labId: lab.id,
      imageRef: lab.imageRef,
      privileged: lab.privileged,
      steps: lab.steps.map((s) => ({ stepId: s.id, validationScript: s.validationScript })),
    },
    env.sandboxJwtSecret,
    { expiresIn: env.sandboxJwtTtlSeconds },
  );

  res.status(201).json({ sessionId: session.id, attachToken, expiresIn: env.sandboxJwtTtlSeconds });
});

// GET /labs/:slug/sessions/:sessionId/progress — step-by-step status for the split-pane UI
sandboxRouter.get(
  "/labs/:slug/sessions/:sessionId/progress",
  requireAuth,
  async (req: AuthedRequest, res) => {
    const session = await prisma.userLabSession.findFirst({
      where: { id: req.params.sessionId, userId: req.userId! },
      include: { stepProgress: true },
    });
    if (!session) {
      res.status(404).json({ error: "session not found" });
      return;
    }
    res.json({
      status: session.status,
      steps: session.stepProgress.map((p) => ({ stepId: p.stepId, status: p.status })),
    });
  },
);
