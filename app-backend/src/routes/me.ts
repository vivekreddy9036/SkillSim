import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";

export const meRouter = Router();

// GET /me/dashboard — points, per-track progress, and recent sessions for the
// logged-in student. Backs FR-11 (Student Dashboard) in the SRS.
meRouter.get("/dashboard", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.userId!;

  const [user, tracks, completedSessions, recentSessions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { displayName: true, points: true } }),
    prisma.track.findMany({
      include: { labs: { select: { id: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.userLabSession.findMany({
      where: { userId, status: "completed" },
      select: { labId: true },
    }),
    prisma.userLabSession.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      take: 5,
      include: {
        lab: { include: { steps: { select: { id: true } }, track: true } },
        stepProgress: true,
      },
    }),
  ]);

  if (!user) {
    res.status(404).json({ error: "user not found" });
    return;
  }

  const completedLabIds = new Set(completedSessions.map((s) => s.labId));

  res.json({
    displayName: user.displayName,
    points: user.points,
    labsCompleted: completedLabIds.size,
    totalLabsAvailable: tracks.reduce((sum, t) => sum + t.labs.length, 0),
    tracks: tracks.map((t) => ({
      slug: t.slug,
      name: t.name,
      icon: t.icon,
      labsTotal: t.labs.length,
      labsCompleted: t.labs.filter((l) => completedLabIds.has(l.id)).length,
    })),
    recentSessions: recentSessions.map((s) => ({
      labSlug: s.lab.slug,
      labTitle: s.lab.title,
      trackSlug: s.lab.track.slug,
      trackName: s.lab.track.name,
      status: s.status,
      startedAt: s.startedAt,
      stepsCompleted: s.stepProgress.filter((p) => p.status === "completed").length,
      stepsTotal: s.lab.steps.length,
    })),
  });
});
