import { createServer } from "node:http";
import express from "express";
import { env } from "./env.js";
import { createWsServer, handleUpgrade, startIdleReaper } from "./wsServer.js";

const app = express();
app.get("/health", (_req, res) => res.json({ ok: true }));

const server = createServer(app);
const wss = createWsServer();

server.on("upgrade", (req, socket, head) => {
  if (req.url?.startsWith("/term")) {
    handleUpgrade(wss, req, socket, head);
  } else {
    socket.destroy();
  }
});

startIdleReaper();

server.listen(env.port, () => {
  console.log(`terminal-server listening on :${env.port}`);
});
