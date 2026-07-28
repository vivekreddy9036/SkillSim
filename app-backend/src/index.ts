import express from "express";
import cors from "cors";
import { env } from "./env.js";
import { authRouter } from "./routes/auth.js";
import { catalogRouter } from "./routes/catalog.js";
import { sandboxRouter } from "./routes/sandbox.js";
import { internalRouter } from "./routes/internal.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/", catalogRouter);
app.use("/", sandboxRouter);
app.use("/internal", internalRouter);

app.listen(env.port, () => {
  console.log(`app-backend listening on :${env.port}`);
});
