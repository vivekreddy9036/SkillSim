import { Router } from "express";
import { prisma } from "../db.js";

export const catalogRouter = Router();

// GET /tracks — catalog landing: all tracks with lab counts (KodeKloud-style track grid)
catalogRouter.get("/tracks", async (_req, res) => {
  const tracks = await prisma.track.findMany({
    include: { _count: { select: { labs: true } } },
  });
  res.json(
    tracks.map((t) => ({
      slug: t.slug,
      name: t.name,
      description: t.description,
      icon: t.icon,
      labCount: t._count.labs,
    })),
  );
});

// GET /tracks/:slug — track detail + its lab cards (title, difficulty, duration, tags)
catalogRouter.get("/tracks/:slug", async (req, res) => {
  const track = await prisma.track.findUnique({
    where: { slug: req.params.slug },
    include: { labs: { orderBy: { orderInTrack: "asc" } } },
  });
  if (!track) {
    res.status(404).json({ error: "track not found" });
    return;
  }
  res.json({
    slug: track.slug,
    name: track.name,
    description: track.description,
    icon: track.icon,
    labs: track.labs.map((l) => ({
      slug: l.slug,
      title: l.title,
      description: l.description,
      difficulty: l.difficulty,
      durationMinutes: l.durationMinutes,
      tags: l.tags,
    })),
  });
});

// GET /labs/:slug — full lab detail including ordered steps (content revealed progressively client-side)
catalogRouter.get("/labs/:slug", async (req, res) => {
  const lab = await prisma.lab.findUnique({
    where: { slug: req.params.slug },
    include: { steps: { orderBy: { stepNumber: "asc" } }, track: true },
  });
  if (!lab) {
    res.status(404).json({ error: "lab not found" });
    return;
  }
  res.json({
    slug: lab.slug,
    title: lab.title,
    description: lab.description,
    difficulty: lab.difficulty,
    durationMinutes: lab.durationMinutes,
    tags: lab.tags,
    track: { slug: lab.track.slug, name: lab.track.name },
    steps: lab.steps.map((s) => ({
      id: s.id,
      stepNumber: s.stepNumber,
      title: s.title,
      contentMarkdown: s.contentMarkdown,
    })),
  });
});
