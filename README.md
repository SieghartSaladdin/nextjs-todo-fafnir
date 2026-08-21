# 🚀 Next.js Todo List App with Docker & PostgreSQL on Remote Server (fafnir)

Aplikasi Todo List modern dan responsif yang dibangun dengan **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, dan **Prisma ORM**, terhubung ke database **PostgreSQL** yang di-host di dalam **Docker pada remote server (SSH fafnir)**.

---

## 🛠️ Tech Stack & Architecture

- **Frontend & Backend**: Next.js 14 (App Router, Server Actions & REST API)
- **Database**: PostgreSQL (Docker container on remote VPS `fafnir`)
- **ORM**: Prisma ORM
- **Styling**: Tailwind CSS & Lucide Icons
- **Bridge & VCS**: GitHub Repository via GitHub MCP Server
- **Deployment**: Docker & Docker Compose on Remote Host

---

## ⚙️ Menjalankan Secara Lokal

1. **Clone repository:**
   ```bash
   git clone https://github.com/SieghartSaladdin/nextjs-todo-fafnir.git
   cd nextjs-todo-fafnir
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Setup Environment:**
   Salin `.env.example` ke `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Generate Prisma Client & Sync DB:**
   ```bash
   npx prisma generate
   ```

5. **Jalankan Dev Server:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

---

## 🐳 Deployment di Remote Host (Docker)

Di server remote (`fafnir`):
```bash
git clone https://github.com/SieghartSaladdin/nextjs-todo-fafnir.git /home/fafnir/apps/nextjs-todo
cd /home/fafnir/apps/nextjs-todo
docker compose up -d --build
```
Aplikasi langsung aktif di port `3000` pada host remote.
