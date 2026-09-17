// Walks labs/<track>/<lab-slug>/ and runs `docker build` for each lab's Dockerfile,
// tagging it with the imageRef declared in that lab's lab.yaml. Run this after adding
// or editing any lab so terminal-server has an image to spawn sandboxes from — see
// scripts/sync-labs.ts for the counterpart that loads lab content into Postgres.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { parse as parseYaml } from "yaml";

const labsRoot = join(import.meta.dirname, "..", "labs");

interface LabManifest {
  slug: string;
  imageRef: string;
}

function listDirs(path: string): string[] {
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function buildLab(trackDir: string, labDir: string): boolean {
  const labPath = join(labsRoot, trackDir, labDir);
  const dockerfilePath = join(labPath, "Dockerfile");
  if (!existsSync(dockerfilePath)) {
    console.log(`skipping ${labDir} — no Dockerfile`);
    return true;
  }

  const manifest = parseYaml(readFileSync(join(labPath, "lab.yaml"), "utf8")) as LabManifest;

  console.log(`\nbuilding ${manifest.slug} -> ${manifest.imageRef}`);
  const result = spawnSync("docker", ["build", "-t", manifest.imageRef, labPath], {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    console.error(`failed to build ${manifest.slug}`);
    return false;
  }
  return true;
}

async function main() {
  let failures = 0;
  for (const trackDir of listDirs(labsRoot)) {
    for (const labDir of listDirs(join(labsRoot, trackDir))) {
      if (!buildLab(trackDir, labDir)) failures++;
    }
  }
  if (failures > 0) {
    console.error(`\n${failures} lab image(s) failed to build`);
    process.exitCode = 1;
  } else {
    console.log("\nall lab images built successfully");
  }
}

main();
