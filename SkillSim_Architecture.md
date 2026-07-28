# SkillSim — Unified Platform Architecture

*Synthesized from: real-time developer sandbox patterns (Docker + WebSocket terminals), browser-terminal-over-Docker-attach implementations, Flatiron School's Learn IDE engineering approach, and JupyterHub-based multi-user workshop terminals.*

---

## 1. System overview

```
+------------+        wss://        +------------------+     /var/run/docker.sock
|  Browser   | <-------------------> |  Node + Express  | <------------------------+
|  xterm.js  |     WebSocket (TLS)   |  ws + Dockerode  |                          |
+------------+                       +------------------+                          |
                                             |                                 +---v-----+
                                             | REST API                        | Docker  |
                                             v                                 | Engine  |
                                    +------------------+                       +---------+
                                    |  App Backend     |
                                    |  Auth, Users,    |
                                    |  Challenges,     |
                                    |  Grading, DB     |
                                    +------------------+
```

Two servers, one host (for the MVP):
- **Terminal server**: owns the WebSocket, talks to Docker directly. Keep it on the same machine as the Docker daemon — every extra network hop between the WebSocket and the Docker socket adds latency jitter.
- **App backend**: normal REST API for auth, challenge catalog, progress, leaderboard. Separate concern from the terminal server so a container crash never takes down login/dashboard.

---

## 2. Core design decisions (from the research)

| Decision | Why |
|---|---|
| One ephemeral container per lab session | Isolation between users; clean state every attempt |
| Binary WebSocket frames, not base64 | Base64 inflates payload ~33% and adds CPU cost on every keystroke |
| Allocate a real PTY (`Tty: true`) in the container | Line buffering, ctrl-C, arrow keys, job control all behave like a real shell |
| Disable per-message deflate | Compression adds latency for a stream of many tiny frames — bad trade for interactivity |
| Backpressure via `ws.bufferedAmount` | Pause the Docker stream when the browser/network can't keep up, resume when it drains |
| Idle-reap timer per session | Kills forgotten sessions automatically; keeps host resources bounded |
| Docker labels on every sandbox container (`sandbox=true`, `user=<id>`) | Lets a periodic janitor script clean up orphaned/zombie containers after crashes |

---

## 3. Security hardening checklist (non-negotiable for a multi-tenant code-exec service)

Every lab container should run with:
- Non-root user inside the container (never `root`)
- `--cap-drop=ALL` (add back only what a specific lab genuinely needs)
- `--security-opt no-new-privileges`
- Resource limits: CPU (`NanoCpus`), memory, `PidsLimit`, `ulimit nofile`
- Read-only root filesystem where possible + `tmpfs` for `/tmp`
- Default-deny or restricted egress networking — labs should not be able to reach the public internet or your own infra
- The Docker socket itself is only ever touched by your trusted backend — never expose it to a container

Stretch goal (mention in your report as "future work" even if you don't implement it): stronger isolation via **gVisor** or **Kata Containers**, which sandbox at the syscall level below the container runtime — relevant because plain Docker containers share the host kernel, which matters when your lab content is intentionally vulnerable/exploitable.

---

## 4. Session lifecycle

1. **Start** — user clicks "Start Lab" → backend issues a short-lived token (2–5 min JWT) scoped to `sandbox:attach` → browser opens `wss://.../term?token=...`
2. **Spawn** — terminal server verifies the token and Origin header on the WebSocket upgrade, then creates + starts a labeled, resource-capped container from the lab's pre-built image
3. **Attach** — server attaches to the container's stdin/stdout/stderr (TTY mode) and bridges it to the WebSocket as binary frames
4. **Interact** — keystrokes flow browser → WS → container; output flows back the same path; a JSON control message (not binary) handles terminal resize events
5. **Grade** — user submits a flag/answer through the normal REST API (not the terminal channel) → backend checks it against the lab's stored answer
6. **Teardown** — on WebSocket close, idle timeout, or a periodic janitor sweep, the container is killed and auto-removed

---

## 5. Recommended stack for a few-week team build

| Layer | Choice | Why |
|---|---|---|
| Frontend app | React + Tailwind | Fast to build a clean dashboard/catalog UI |
| Terminal UI | `xterm.js` + `xterm-addon-fit` | Industry-standard in-browser terminal, used by VS Code, GitHub Codespaces, etc. |
| Terminal server | Node.js + Express + `ws` + `dockerode` | Matches the reference implementation almost exactly; smallest team learning curve if you're already using Node for the app backend |
| App backend | Node/Express or Django REST | Auth, challenge CRUD, progress, leaderboard |
| Database | PostgreSQL | Users, challenges, submissions, progress |
| Auth | JWT (short-lived, scope-limited for terminal attach) | Matches the reference pattern; simple to reason about |
| Container host | Single cloud VM (DigitalOcean/Lightsail/EC2) with Docker installed | Avoids Kubernetes complexity for a class deadline |
| Reverse proxy | NGINX (if deployed) | Must disable proxy buffering on the WS path (`proxy_buffering off`) or the terminal will feel laggy |

---

## 6. Build order (matches a 5-week team split)

**Week 1** — SRS, ER diagram, architecture diagram (this doc), wireframes, assign modules.

**Week 2** — Auth + challenge CRUD (app backend team) run in parallel with a bare-bones terminal server: one hardcoded image, no auth yet, just prove browser ↔ container works end to end.

**Week 3** — Wire terminal server auth (JWT), add resource limits + capability drops, add idle-reap. Backend team builds the flag-submission/grading endpoint.

**Week 4** — Dashboard, leaderboard, badges. Polish the lab catalog UI. Add Docker labels + a janitor cron job.

**Week 5** — Testing (document test cases), deploy to the single cloud VM, write the security-hardening section of your report using the checklist above, record demo.

---

## 7. What to cite in your literature review

- Docker-attach-based browser terminal pattern (WebSocket bridging keystrokes/output to a container's TTY)
- Flatiron School's Learn IDE — real production case study of "one container per student, per lab"
- JupyterHub-based multi-user workshop terminals — the classroom/instructor-led variant, useful if you add an "assign lab to class" feature later
- Docker's own security hardening documentation (capabilities, seccomp, AppArmor) for your security-design section

---

## 8. Honest scope note for your report

This design uses **containers, not full VMs**. That's a legitimate, citable engineering trade-off (faster boot, lower cost, simpler ops) rather than a shortcut you need to hide — real platforms like this reference architecture make the same choice for exactly the same reasons. State it explicitly in your design document as a deliberate decision, not a limitation you're hoping nobody notices.
