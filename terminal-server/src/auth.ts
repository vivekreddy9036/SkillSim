import jwt from "jsonwebtoken";
import { env } from "./env.js";

export interface AttachTokenPayload {
  sub: string;
  scope: "sandbox:attach";
  sessionId: string;
  labId: string;
  imageRef: string;
  privileged: boolean;
  steps: { stepId: string; validationScript: string }[];
}

export function verifyAttachToken(token: string): AttachTokenPayload {
  const payload = jwt.verify(token, env.sandboxJwtSecret) as AttachTokenPayload;
  if (payload.scope !== "sandbox:attach") {
    throw new Error("token missing sandbox:attach scope");
  }
  return payload;
}

export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  return env.allowedOrigins.includes(origin);
}
