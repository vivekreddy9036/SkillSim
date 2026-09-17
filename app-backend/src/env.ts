import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  authJwtSecret: required("AUTH_JWT_SECRET"),
  sandboxJwtSecret: required("SANDBOX_JWT_SECRET"),
  sandboxJwtTtlSeconds: Number(process.env.SANDBOX_JWT_TTL_SECONDS ?? 300),
  internalServiceSecret: required("INTERNAL_SERVICE_SECRET"),
  // Comma-separated list of allowed browser origins — mirrors terminal-server's
  // ALLOWED_ORIGINS so both services reject cross-origin requests the same way.
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean),
};
