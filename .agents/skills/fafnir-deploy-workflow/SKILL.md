---
name: fafnir-deploy-workflow
description: >-
  Standard end-to-end development and deployment workflow for building apps (Next.js/Node),
  creating repositories via GitHub MCP, provisioning PostgreSQL databases, and hosting Docker
  containers on the remote server using the ssh-fafnir MCP server. Trigger this whenever
  the user asks to "pake workflow itu", "pake workflow fafnir", "host di ssh fafnir", or
  "deploy pake ssh fafnir".
---

# Fafnir End-to-End Development & Deployment Workflow

Use this workflow to build, bridge via GitHub, and host containerized applications on the user's remote server (`fafnirserver`).

---

## 🚨 Critical Server & MCP Rules

1. **Target MCP Server**: ALWAYS use MCP server **`ssh-fafnir`** (tool: `execute_command`). DO NOT use `ssh-remote` unless explicitly requested.
2. **Existing Services & Port Allocation**:
   - `3000`: `tracker-web` (Reserved)
   - `3001`: `portwindows` (Reserved)
   - `3002`: `tracker-mcp` (Reserved)
   - `3003`: `portwindows` (Reserved)
   - `5432`: `tracker-db` (PostgreSQL `postgres:15-alpine`, User: `postgres`, Pass: `postgrespassword`)
   - `5433`: `portwindows-db` (PostgreSQL)
   - `8643`: `hermes-mcp-http` (Reserved)
   - **Recommended App Ports**: Use `3005`, `3006`, `3007` or check available ports with `ss -tulpn`.

---

## 🔄 Standard 5-Step Workflow

### Step 1: GitHub Repository Bridge (GitHub MCP)
1. Call `github` MCP tool `create_repository` with:
   - `name`: `<project-name>`
   - `private`: `false` (or as requested)
2. In local workspace:
   ```bash
   git init
   git branch -M main
   git add .
   git commit -m "feat: initial commit"
   git remote add origin https://github.com/SieghartSaladdin/<project-name>.git
   git push -u origin main
   ```

### Step 2: Database Provisioning on Remote Host
1. Connect via `ssh-fafnir` (`execute_command`).
2. Create database in `tracker-db`:
   ```bash
   docker exec tracker-db psql -U postgres -c "CREATE DATABASE <db_name>;"
   ```
3. Initialize schema/tables directly or via Prisma migration.

### Step 3: Application Configuration
1. **Next.js `next.config.mjs`**:
   ```javascript
   const nextConfig = {
     output: "standalone",
     eslint: { ignoreDuringBuilds: true },
     typescript: { ignoreBuildErrors: true },
   };
   export default nextConfig;
   ```
2. **Prisma Schema (`prisma/schema.prisma`)**:
   ```prisma
   generator client {
     provider      = "prisma-client-js"
     binaryTargets = ["native", "linux-musl-openssl-3.0.x", "debian-openssl-3.0.x"]
   }
   ```
3. **Multi-stage Dockerfile**: Ensure `public/` directory exists and `openssl` is installed in `deps` and `runner` stages.
4. **`docker-compose.yml`**:
   ```yaml
   services:
     app:
       build: .
       container_name: fafnir-<app-name>
       restart: always
       ports:
         - "<free_port>:3000"
       environment:
         - NODE_ENV=production
         - DATABASE_URL=postgresql://postgres:postgrespassword@172.17.0.1:5432/<db_name>?schema=public
       extra_hosts:
         - "host.docker.internal:host-gateway"
   ```

### Step 4: Deploy & Host on Remote Docker
1. Commit & push code to GitHub.
2. On `ssh-fafnir`:
   ```bash
   rm -rf /home/fafnir/apps/<app-name> && mkdir -p /home/fafnir/apps && git clone https://github.com/SieghartSaladdin/<app-name>.git /home/fafnir/apps/<app-name> && cd /home/fafnir/apps/<app-name> && docker compose up -d --build
   ```

### Step 5: Verification
1. Run `docker ps` on `ssh-fafnir` to verify container status is `Up`.
2. Test endpoints with `curl`:
   ```bash
   curl http://localhost:<free_port>/api/health
   ```
