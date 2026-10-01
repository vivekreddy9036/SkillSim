# Software Requirements Specification (SRS)
## SkillSim — Browser-Based Hands-On Lab Learning Platform
**Course:** Secure Software Engineering (7th Semester)  
**Phase:** Phase 1 – Requirement Engineering  
**Deliverable:** Exercise 1 – Identify Requirements (SRS)  
**Version:** 1.0 (Impactful & Concise Specification)

---

## 1. Problem Statement & System Objectives

### 1.1 Problem Statement
Traditional computer science education and devops training rely heavily on passive instructional media (video tutorials, slides) or unmanaged, shared laboratory environments. These conventional approaches suffer from critical flaws:
1. **Lack of True Environment Isolation:** Shared machines or persistent VMs accumulate residual state, configuration drift, and file pollution across student sessions.
2. **Untrustworthy Grading via Self-Reporting:** Platforms frequently grade students based on multi-choice questions or manually submitted text answers rather than asserting the actual runtime state of the operating system.
3. **High Resource Costs & Complexity:** Heavy cloud-hosted virtual machines (VMs) incur excessive compute costs and have multi-minute provisioning delays, while Kubernetes orchestration introduces steep operational overhead for simple class labs.
4. **Security Vulnerabilities in Multi-Tenant Code Execution:** Executing arbitrary user commands in shared environments exposes the underlying host infrastructure to container breakouts, resource starvation (fork bombs, cryptominers), network intrusion, and cross-student surveillance.

### 1.2 System Objectives
* **O-01 (Rapid Ephemeral Sandboxing):** Provision an isolated, clean Linux container sandbox for each student lab session within 3 seconds, accessible entirely through a web browser with zero local software setup.
* **O-02 (Objective Runtime Validation):** Execute automated validation scripts directly inside the student's live container to assert filesystem changes, running processes, and network sockets, replacing subjective self-reporting.
* **O-03 (Defense-in-Depth Container Hardening):** Enforce strict containment—dropping all Linux capabilities, denying network egress, setting memory/CPU quotas, and preventing privilege escalation.
* **O-04 (Protected Docker Socket Isolation):** Isolate the Docker Engine API socket strictly to a trusted daemon; never expose the host socket to containers or client-facing endpoints.
* **O-05 (Declarative Content Pipeline):** Enable instructors to author complete labs (Dockerfiles, YAML manifests, markdown lessons, check scripts) via git without requiring a database CMS.
* **O-06 (Progress Persistence & Gamification):** Track completion milestones, step unlock progressions, and point tallies immutably across user accounts.

---

## 2. Stakeholders & User Classes

### 2.1 Stakeholders
* **Course Evaluators / Academic Instructors:** Require a trustworthy, tamper-proof environment to evaluate student hands-on technical competencies objectively.
* **System / Lab Administrators:** Responsible for host VM infrastructure health, resource limits, and ensuring sandbox containers do not compromise the underlying host.
* **Students / Technical Learners:** Require a zero-friction, responsive learning platform with realistic terminal mechanics, instant feedback, and clear step-by-step guidance.
* **Curriculum / Lab Authors:** Require an intuitive, file-based authoring workflow to add new tracks and challenges without touching application code.

### 2.2 User Classes & Actors

```
+-----------------------------------------------------------------------------------+
|                                  SkillSim Actors                                  |
+-----------------------------------------+-----------------------------------------+
| Human Actors                            | System Actors                           |
| 1. Student (Learner - Primary)          | 3. Terminal-Server (Bridge & Janitor)   |
| 2. Content Author (Instructor / TA)     | 4. Docker Engine (Host Runtime)         |
+-----------------------------------------+-----------------------------------------+
```

1. **Student (Primary Human Actor):** Authenticates via email/password, browses tracks and labs, interacts with the command-line shell via in-browser xterm.js, requests validation checks, and views personal dashboard progress.
2. **Content Author (Secondary Human Actor):** Formats lab exercises into git-versioned directories containing `lab.yaml`, `Dockerfile`, `steps/*.md`, and `steps/*.check.sh`, executing sync utilities to publish content.
3. **Terminal-Server (System Actor):** Non-human background service that validates JWT upgrade tokens, communicates with Docker over `/var/run/docker.sock`, spawns sandboxes, streams raw PTY I/O, runs validation execs, and reaps idle sessions.
4. **App-Backend (System Actor):** Manages relational persistence in PostgreSQL, hashes passwords, enforces API rate limits, verifies internal service signatures, and computes student points.

---

## 3. Functional Requirements (FRs)

| Req ID | Requirement Title | Description & Processing Flow | Input | Expected Output | Priority |
|---|---|---|---|---|---|
| **FR-01** | User Registration & Auth | Validate email format and uniqueness; hash password using bcrypt (cost 10); issue 7-day authentication JWT. | Email, password, display name | User account created, Auth JWT returned | **Must Have** |
| **FR-02** | Track & Lab Catalog Browsing | Browse technology tracks (e.g., Docker, Linux), view difficulty badges, estimated durations, and ordered lab cards. | HTTP GET request | Catalog JSON list with lab counts and metadata | **Must Have** |
| **FR-03** | Lab Session Initiation | Create a `UserLabSession` record in DB and generate a short-lived (300s TTL) `sandbox:attach` JWT containing session ID, image tag, privilege flag, and step check paths. | Lab slug, User Bearer token | `{ sessionId, attachToken, expiresIn }` | **Must Have** |
| **FR-04** | Ephemeral Sandbox Provisioning | Terminal-server verifies token, checks host concurrency cap, and invokes Docker Engine to create an ephemeral container with strict security profiles and auto-removal. | WS upgrade request with `token` | Container started, interactive `/bin/sh` shell spawned | **Must Have** |
| **FR-05** | Real-Time Interactive Terminal | Bridge xterm.js keystrokes and container PTY output over WebSocket using raw binary frames; handle window resizing via JSON control frames. | Raw binary keystrokes, resize dimensions | Low-latency terminal I/O rendered in browser | **Must Have** |
| **FR-06** | In-Container Step Validation | On "Check my work" trigger, execute the step's specific `.check.sh` script inside the container via non-interactive exec. Assert exit code 0. | JSON `{ type: "check_step", stepId }` | JSON `{ type: "step_result", passed, message }` | **Must Have** |
| **FR-07** | Progress & Points Synchronization | On passing check, terminal-server notifies app-backend via `/internal/progress` with a shared secret. Backend updates `UserStepProgress` and awards points (+10 step, +50 lab). | `sessionId`, `stepId`, `passed`, `x-internal-secret` | Progress persisted in PostgreSQL, next step unlocked in UI | **Must Have** |
| **FR-08** | Automated Idle Session Reaping | Periodic background sweep (every 60s) identifies sessions inactive for > 15 minutes (900s), terminates the WebSocket, and destroys the container. | Session `lastActivity` timestamp | Container killed, resources reclaimed, session marked `expired` | **Must Have** |
| **FR-09** | Student Dashboard Tracking | Render real-time progress: total points, completed labs ratio, track completion progress bars, and recent activity logs. | User Bearer token | Dashboard UI with live stats and session history | **Should Have** |
| **FR-10** | File-Based Content Sync | Sync CLI script parses `labs/<track>/<slug>/` manifests, Dockerfiles, and steps, upserting `Track`, `Lab`, and `LabStep` entities into PostgreSQL. | CLI command (`npm run sync-labs`) | Content loaded in DB without code changes | **Should Have** |

---

## 4. Non-Functional Requirements (NFRs)

### 4.1 Performance & Latency
* **NFR-01 (Keystroke Responsiveness):** Terminal I/O round-trip latency shall be under **50 ms** on standard local/LAN connections by using uncompressed binary WebSocket frames.
* **NFR-02 (Rapid Container Boot):** Ephemeral sandbox container creation and terminal attach shall complete in under **3 seconds** from the user clicking "Start Lab".
* **NFR-03 (Validation Execution):** Step validation checks (`*.check.sh`) shall return pass/fail evaluation to the UI in under **2 seconds**.

### 4.2 Reliability & Fault Isolation
* **NFR-04 (Process Decoupling):** A crash, hang, or failure in a student's sandbox container shall have zero impact on the host system, the app-backend, or other concurrent students.
* **NFR-05 (Crash Cleanup):** Containers configured with `AutoRemove: true` and labeled with metadata tags shall be automatically reclaimed upon socket drop or server restart.

### 4.3 Scalability & Resource Constraints
* **NFR-06 (Single-Host Concurrency Cap):** The terminal server shall enforce a global cap of **20 concurrent active sandbox containers** on a single VM, returning `HTTP 503` when capacity is reached.
* **NFR-07 (Per-Container Resource Quotas):** Each sandbox container is restricted to **0.5 vCPU (`NanoCpus: 500,000,000`)**, **512 MB RAM (`Memory: 536,870,912`)**, and **128 maximum process IDs (`PidsLimit: 128`)**.

### 4.4 Usability & Interface Standards
* **NFR-08 (Split-Pane UI):** The interface shall provide a 50/50 split layout combining an ANSI-capable xterm.js terminal with rich Markdown instructions and syntax highlighting.
* **NFR-09 (Responsive Status Indicators):** Clear visual cues for WebSocket connectivity (connected, connecting, disconnected), check in-progress spinners, and step milestone pills.

---

## 5. Security Requirements (Secure Software Engineering)

Because this platform executes untrusted user input inside containers, security requirements are non-negotiable.

```
+----------------------------------------------------------------------------------------------------+
|                                  SkillSim Defense-in-Depth Model                                   |
+----------------------------------------------------------------------------------------------------+
| 1. Per-Session Ephemeral Containers (Zero state retention; AutoRemove: true)                       |
| 2. Least Privilege Sandbox (CapDrop: ALL, no-new-privileges, ReadonlyRootfs, NetworkMode: none)   |
| 3. Controlled DinD Exception (Nested daemon only; host docker.sock is NEVER mounted)              |
| 4. Dual Token Architecture (Auth JWT for REST; Scoped, 300s TTL JWT for WebSocket attach)          |
| 5. Isolated Internal Channel (app-backend /internal/progress gated by x-internal-secret)          |
| 6. Input Hardening (Prisma parameterized queries, Zod schema validation, inert ReactMarkdown)      |
+----------------------------------------------------------------------------------------------------+
```

### 5.1 Authentication, Scoping & Access Control
* **SEC-01 (Password Hashing):** All passwords shall be hashed using `bcrypt` with a minimum cost factor of 10 prior to storage; plaintext passwords shall never be logged or persisted.
* **SEC-02 (Brute-Force Rate Limiting):** Authentication endpoints (`/auth/login`, `/auth/signup`) shall be rate-limited to a maximum of 20 attempts per 15 minutes per IP.
* **SEC-03 (Dual-JWT Scope Separation):** 
  - Standard user login tokens authorize REST catalog and dashboard queries.
  - Sandbox connection requires an independent, cryptographically signed token explicitly scoped to `scope: "sandbox:attach"` with a strictly enforced **300-second (5 minute) TTL**.
* **SEC-04 (Inter-Service Authorization):** The `/internal/progress` endpoint on app-backend shall strictly require the `x-internal-secret` header, rejecting any direct browser or unauthorized calls with `HTTP 403`.

### 5.2 Container Hardening & Multi-Tenant Isolation
* **SEC-05 (Capability Dropping):** Default containers shall execute with all Linux capabilities dropped (`CapDrop: ["ALL"]`) to prevent kernel and hardware manipulation.
* **SEC-06 (Privilege Escalation Prevention):** Sandboxes shall enforce `SecurityOpt: ["no-new-privileges"]` preventing setuid binaries from escalating permissions.
* **SEC-07 (Filesystem Immutability):** Sandboxes shall run with a read-only root filesystem (`ReadonlyRootfs: true`). Writable scratch space is restricted to an in-memory temporary filesystem mounted with `Tmpfs: { "/tmp": "rw,noexec,nosuid,size=64m" }`.
* **SEC-08 (Network Egress Denial):** Default sandboxes shall operate with `NetworkMode: "none"`, blocking all internet and local network egress to eliminate malware downloads, external botnet communication, or internal subnet scanning.
* **SEC-09 (Docker-in-Docker Isolation):** For labs requiring a nested Docker daemon (`Lab.privileged = true`), the container runs an isolated internal `dockerd`. **The host's `/var/run/docker.sock` is NEVER mounted or exposed to any container**.
* **SEC-10 (Docker Socket Protection):** The host Docker socket is exclusively accessed by the backend `terminal-server` process over local IPC; it is never exposed over TCP.

### 5.3 Input Sanitization & Attack Mitigations
* **SEC-11 (Cross-Site WebSocket Hijacking - CSWSH Defense):** The terminal server shall validate the HTTP `Origin` header during WebSocket upgrade against an explicit allowlist, terminating unauthorized cross-origin attempts with `HTTP 403`.
* **SEC-12 (SQL Injection Defense):** All database interactions shall use Prisma ORM parameterized queries. Handlers shall validate all payloads with Zod schemas before database processing.
* **SEC-13 (Stored XSS Defense in Markdown):** Step instructions rendered on the frontend shall use `react-markdown` without raw HTML plugins (`rehype-raw` omitted), ensuring student browsers treat markdown strictly as inert text.
* **SEC-14 (Denial of Service & Fork Bomb Defense):** Every sandbox container shall enforce `PidsLimit: 128`, neutralizing fork bombs (`:(){ :|:& };:`) and bounding CPU consumption to 0.5 cores.

---

## 6. Summary Traceability Matrix (Exercise 1 Verification)

| Requirement Category | Requirement Code | Architecture & Implementation Mapping |
|---|---|---|
| **System Objectives** | O-01 to O-06 | Multi-service architecture (`frontend`, `app-backend`, `terminal-server`, `Postgres`, `Docker Engine`). |
| **User Classes** | UC-01 to UC-04 | Role-based flows for Students, Content Authors, and System Daemons. |
| **Functional Reqs** | FR-01 to FR-10 | Express routers (`auth.ts`, `catalog.ts`, `sandbox.ts`, `internal.ts`), `wsServer.ts`, `sync-labs.ts`. |
| **Non-Functional Reqs**| NFR-01 to NFR-09 | Binary array buffers, xterm.js FitAddon, container quotas, max concurrency bounds. |
| **Security Reqs** | SEC-01 to SEC-14 | `CapDrop=ALL`, `NetworkMode=none`, `ReadonlyRootfs`, dual JWTs, `x-internal-secret`, rate limiters. |

---
*Prepared for 7th Semester Secure Software Engineering Project Evaluation.*
