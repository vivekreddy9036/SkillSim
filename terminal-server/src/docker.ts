import Docker from "dockerode";
import { env } from "./env.js";

export const docker = new Docker();

export interface SpawnParams {
  imageTag: string;
  userId: string;
  sessionId: string;
  labId: string;
  /**
   * True only for labs that run their own nested Docker daemon (Docker-in-Docker),
   * e.g. the "Docker Basic Commands" lab. This is a narrow, deliberate exception to
   * the default hardening profile below — it still never touches the host's own
   * docker.sock (dockerd runs *inside* the sandbox container against its own
   * isolated storage), and stays ephemeral/resource-capped/labeled like every
   * other session. Non-DinD labs (the common case) always get the full profile.
   */
  privileged: boolean;
}

const labels = (params: SpawnParams) => ({
  sandbox: "true",
  "skillsim.user": params.userId,
  "skillsim.session": params.sessionId,
  "skillsim.lab": params.labId,
});

/**
 * Creates and starts one ephemeral container for a lab session.
 * Default hardening follows the brief's checklist: no root, no added
 * capabilities, no privilege escalation, capped resources, read-only rootfs +
 * tmpfs /tmp, and no network egress beyond the container's own loopback.
 */
export async function spawnSandboxContainer(params: SpawnParams): Promise<Docker.Container> {
  const container = await docker.createContainer({
    Image: params.imageTag,
    // No Cmd/Entrypoint override: the image's own default process runs as PID 1
    // (for DinD labs, that's the base image's own dockerd-entrypoint.sh — critical,
    // since some of its setup only works when it *is* PID 1). The interactive shell
    // the user types into is a separate `exec`, not an attach to this process — see
    // openInteractiveShell below.
    Labels: labels(params),
    HostConfig: params.privileged
      ? {
          AutoRemove: true,
          NanoCpus: env.containerNanoCpus,
          Memory: env.containerMemoryBytes,
          PidsLimit: env.containerPidsLimit,
          Privileged: true,
        }
      : {
          AutoRemove: true,
          NanoCpus: env.containerNanoCpus,
          Memory: env.containerMemoryBytes,
          PidsLimit: env.containerPidsLimit,
          CapDrop: ["ALL"],
          SecurityOpt: ["no-new-privileges"],
          ReadonlyRootfs: true,
          Tmpfs: { "/tmp": "rw,noexec,nosuid,size=64m" },
          // No published ports, no host network — sessions are reached only via
          // this server's docker.sock exec/attach, never a direct network route.
          NetworkMode: "none",
        },
  });

  await container.start();
  return container;
}

/**
 * Opens an interactive `/bin/sh` inside the running container as a separate exec —
 * not an attach to the container's PID 1. This is the standard "docker exec -it"
 * pattern and is what makes DinD labs work at all (their PID 1 must stay the base
 * image's own entrypoint); it's also just a more robust default for every lab,
 * since the shell the user types into is decoupled from whatever the container's
 * main process happens to be.
 */
export async function openInteractiveShell(container: Docker.Container) {
  const exec = await container.exec({
    Cmd: ["/bin/sh"],
    Tty: true,
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
  });
  const stream = await exec.start({ hijack: true, stdin: true, Tty: true });
  return { exec, stream };
}

export async function resizeShell(exec: Docker.Exec, cols: number, rows: number) {
  await exec.resize({ w: cols, h: rows });
}

export interface ValidationResult {
  exitCode: number;
  output: string;
}

/** Runs a step's validation script inside the session's container via a non-interactive exec. */
export async function runValidationScript(
  container: Docker.Container,
  scriptPath: string,
): Promise<ValidationResult> {
  const exec = await container.exec({
    Cmd: ["/bin/sh", scriptPath],
    AttachStdout: true,
    AttachStderr: true,
  });

  const stream = await exec.start({});
  const output: Buffer[] = await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(chunks));
    stream.on("error", reject);
  });

  const inspect = await exec.inspect();
  return { exitCode: inspect.ExitCode ?? 1, output: Buffer.concat(output).toString("utf8") };
}

export async function killContainer(container: Docker.Container) {
  try {
    await container.kill();
  } catch {
    // already stopped/removed (AutoRemove) — nothing to do
  }
}
