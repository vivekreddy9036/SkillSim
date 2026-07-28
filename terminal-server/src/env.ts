import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4100),
  sandboxJwtSecret: required("SANDBOX_JWT_SECRET"),
  internalServiceSecret: required("INTERNAL_SERVICE_SECRET"),
  appBackendUrl: process.env.APP_BACKEND_URL ?? "http://localhost:4000",
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean),
  containerNanoCpus: Number(process.env.CONTAINER_NANO_CPUS ?? 500_000_000),
  containerMemoryBytes: Number(process.env.CONTAINER_MEMORY_BYTES ?? 536_870_912),
  containerPidsLimit: Number(process.env.CONTAINER_PIDS_LIMIT ?? 128),
  idleTimeoutSeconds: Number(process.env.IDLE_TIMEOUT_SECONDS ?? 900),
  idleSweepIntervalSeconds: Number(process.env.IDLE_SWEEP_INTERVAL_SECONDS ?? 60),
};
