import { env } from "./env.js";

export async function reportStepResult(sessionId: string, stepId: string, passed: boolean) {
  await fetch(`${env.appBackendUrl}/internal/progress`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-internal-secret": env.internalServiceSecret,
    },
    body: JSON.stringify({ sessionId, stepId, passed }),
  });
}
