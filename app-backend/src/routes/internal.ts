import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireInternalService } from "../middleware/auth.js";

export const internalRouter = Router();

const POINTS_PER_STEP = 10;
const POINTS_PER_LAB_COMPLETE = 50;

const progressSchema = z.object({
  sessionId: z.string().uuid(),
  stepId: z.string().uuid(),
  passed: z.boolean(),
});

// POST /internal/progress — called only by terminal-server after it execs a step's
// validation script. Terminal server owns the Docker socket and never touches the DB
// directly; this is the one seam where it hands verified results back to app-backend.
internalRouter.post("/progress", requireInternalService, async (req, res) => {
  const parsed = progressSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { sessionId, stepId, passed } = parsed.data;

  if (!passed) {
    res.json({ recorded: false });
    return;
  }

  const session = await prisma.userLabSession.findUnique({
    where: { id: sessionId },
    include: { lab: { include: { steps: true } } },
  });
  if (!session) {
    res.status(404).json({ error: "session not found" });
    return;
  }

  await prisma.userStepProgress.upsert({
    where: { sessionId_stepId: { sessionId, stepId } },
    create: { sessionId, stepId, status: "completed", completedAt: new Date() },
    update: { status: "completed", completedAt: new Date() },
  });

  const completedCount = await prisma.userStepProgress.count({
    where: { sessionId, status: "completed" },
  });
  const labComplete = completedCount >= session.lab.steps.length;

  const pointsAwarded = POINTS_PER_STEP + (labComplete ? POINTS_PER_LAB_COMPLETE : 0);
  await prisma.user.update({
    where: { id: session.userId },
    data: { points: { increment: pointsAwarded } },
  });

  if (labComplete && session.status !== "completed") {
    await prisma.userLabSession.update({
      where: { id: sessionId },
      data: { status: "completed", endedAt: new Date() },
    });
  }

  res.json({ recorded: true, labComplete, pointsAwarded });
});
