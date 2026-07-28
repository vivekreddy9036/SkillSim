// Walks labs/<track>/<lab-slug>/ and upserts tracks/labs/steps into Postgres via Prisma.
// Content (lab.yaml + steps/*.md + steps/*.check.sh) is the source of truth in git;
// this script is what makes it queryable for the catalog UI. Run after editing any lab.
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { config } from "dotenv";
import { parse as parseYaml } from "yaml";
import { PrismaClient } from "@prisma/client";

config({ path: join(import.meta.dirname, "..", "app-backend", ".env") });

const prisma = new PrismaClient();
const labsRoot = join(import.meta.dirname, "..", "labs");

interface LabManifest {
  title: string;
  slug: string;
  track: string;
  trackName?: string;
  trackDescription?: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  durationMinutes: number;
  tags: string[];
  orderInTrack: number;
  imageRef: string;
  privileged?: boolean;
}

function listDirs(path: string): string[] {
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function parseStepFile(path: string): { title: string; contentMarkdown: string } {
  const raw = readFileSync(path, "utf8");
  const [titleLine, ...rest] = raw.split("\n");
  return { title: titleLine.replace(/^#\s*/, "").trim(), contentMarkdown: rest.join("\n").trim() };
}

async function syncLab(trackDir: string, labDir: string) {
  const labPath = join(labsRoot, trackDir, labDir);
  const manifest = parseYaml(readFileSync(join(labPath, "lab.yaml"), "utf8")) as LabManifest;

  const track = await prisma.track.upsert({
    where: { slug: manifest.track },
    create: {
      slug: manifest.track,
      name: manifest.trackName ?? manifest.track,
      description: manifest.trackDescription ?? "",
    },
    update: {
      ...(manifest.trackName ? { name: manifest.trackName } : {}),
      ...(manifest.trackDescription ? { description: manifest.trackDescription } : {}),
    },
  });

  const labData = {
    trackId: track.id,
    title: manifest.title,
    description: manifest.description,
    difficulty: manifest.difficulty,
    durationMinutes: manifest.durationMinutes,
    tags: manifest.tags,
    orderInTrack: manifest.orderInTrack,
    imageRef: manifest.imageRef,
    privileged: manifest.privileged ?? false,
  };

  const lab = await prisma.lab.upsert({
    where: { slug: manifest.slug },
    create: { slug: manifest.slug, ...labData },
    update: labData,
  });

  const stepsDir = join(labPath, "steps");
  const stepFiles = readdirSync(stepsDir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  for (const mdFile of stepFiles) {
    const stepNumber = Number(mdFile.split("-")[0]);
    if (Number.isNaN(stepNumber)) {
      throw new Error(`${mdFile}: step files must start with a numeric prefix, e.g. "01-title.md"`);
    }
    const checkFile = `${mdFile.replace(/\.md$/, "")}.check.sh`;
    const { title, contentMarkdown } = parseStepFile(join(stepsDir, mdFile));

    await prisma.labStep.upsert({
      where: { labId_stepNumber: { labId: lab.id, stepNumber } },
      create: { labId: lab.id, stepNumber, title, contentMarkdown, validationScript: checkFile },
      update: { title, contentMarkdown, validationScript: checkFile },
    });
  }

  console.log(`synced ${manifest.slug} (${stepFiles.length} steps)`);
}

async function main() {
  for (const trackDir of listDirs(labsRoot)) {
    for (const labDir of listDirs(join(labsRoot, trackDir))) {
      await syncLab(trackDir, labDir);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
