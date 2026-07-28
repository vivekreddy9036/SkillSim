import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import { WebSocketServer, type WebSocket } from "ws";
import type Docker from "dockerode";
import { isAllowedOrigin, verifyAttachToken, type AttachTokenPayload } from "./auth.js";
import {
  killContainer,
  openInteractiveShell,
  resizeShell,
  runValidationScript,
  spawnSandboxContainer,
} from "./docker.js";
import { reportStepResult } from "./progressClient.js";
import { env } from "./env.js";

type ControlMessage =
  | { type: "resize"; cols: number; rows: number }
  | { type: "check_step"; stepId: string };

interface Session {
  ws: WebSocket;
  container: Docker.Container;
  exec: Docker.Exec;
  steps: Map<string, string>; // stepId -> validationScript filename
  sessionId: string;
  lastActivity: number;
}

const sessions = new Map<string, Session>();

export function createWsServer() {
  // perMessageDeflate off: compression adds latency to a stream of many tiny
  // keystroke frames — bad trade-off for interactive terminal traffic.
  const wss = new WebSocketServer({ noServer: true, perMessageDeflate: false });

  wss.on("connection", async (ws: WebSocket, _req: IncomingMessage, payload: AttachTokenPayload) => {
    let container: Docker.Container;
    try {
      container = await spawnSandboxContainer({
        imageTag: payload.imageRef,
        userId: payload.sub,
        sessionId: payload.sessionId,
        labId: payload.labId,
        privileged: payload.privileged,
      });
    } catch (err) {
      console.error("failed to spawn sandbox container", err);
      ws.close(1011, "failed to start sandbox");
      return;
    }

    const { exec, stream: shellStream } = await openInteractiveShell(container);

    const session: Session = {
      ws,
      container,
      exec,
      steps: new Map(payload.steps.map((s) => [s.stepId, s.validationScript])),
      sessionId: payload.sessionId,
      lastActivity: Date.now(),
    };
    sessions.set(payload.sessionId, session);

    // container -> browser: raw TTY bytes as binary WS frames, no compression, no base64.
    // Backpressure: pause the Docker stream once the browser/network can't keep up,
    // resume once the WS send buffer has drained, so a slow client can't unbound memory growth here.
    const MAX_BUFFERED_BYTES = 1_000_000;
    shellStream.on("data", (chunk: Buffer) => {
      if (ws.readyState !== ws.OPEN) return;
      ws.send(chunk, { binary: true });
      if (ws.bufferedAmount > MAX_BUFFERED_BYTES) {
        shellStream.pause();
        const resume = setInterval(() => {
          if (ws.bufferedAmount <= MAX_BUFFERED_BYTES || ws.readyState !== ws.OPEN) {
            shellStream.resume();
            clearInterval(resume);
          }
        }, 50);
      }
    });
    shellStream.on("end", () => ws.close(1000, "session ended"));

    ws.on("message", async (data: Buffer, isBinary: boolean) => {
      session.lastActivity = Date.now();

      if (isBinary) {
        // browser -> container: raw keystrokes
        shellStream.write(data);
        return;
      }

      let message: ControlMessage;
      try {
        message = JSON.parse(data.toString("utf8"));
      } catch {
        return;
      }

      if (message.type === "resize") {
        await resizeShell(exec, message.cols, message.rows).catch(() => {});
        return;
      }

      if (message.type === "check_step") {
        const scriptFile = session.steps.get(message.stepId);
        if (!scriptFile) return;
        const result = await runValidationScript(container, `/skillsim/steps/${scriptFile}`);
        const passed = result.exitCode === 0;
        ws.send(
          JSON.stringify({ type: "step_result", stepId: message.stepId, passed, message: result.output }),
        );
        await reportStepResult(session.sessionId, message.stepId, passed).catch((err) =>
          console.error("failed to report step result", err),
        );
      }
    });

    ws.on("close", async () => {
      sessions.delete(payload.sessionId);
      await killContainer(container);
    });
  });

  return wss;
}

/** Verifies the JWT + Origin on WS upgrade before handing off to the WebSocketServer. */
export function handleUpgrade(wss: WebSocketServer, req: IncomingMessage, socket: Duplex, head: Buffer) {
  const url = new URL(req.url ?? "", "http://internal");
  const token = url.searchParams.get("token");

  if (!isAllowedOrigin(req.headers.origin)) {
    socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
    socket.destroy();
    return;
  }
  if (!token) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  let payload: AttachTokenPayload;
  try {
    payload = verifyAttachToken(token);
  } catch {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit("connection", ws, req, payload);
  });
}

/** Periodic sweep: closes and tears down sessions with no activity past the idle timeout. */
export function startIdleReaper() {
  setInterval(() => {
    const now = Date.now();
    for (const session of sessions.values()) {
      if (now - session.lastActivity > env.idleTimeoutSeconds * 1000) {
        session.ws.close(1000, "idle timeout");
      }
    }
  }, env.idleSweepIntervalSeconds * 1000);
}
