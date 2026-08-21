"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  ListTodo,
  CheckCheck,
  Clock,
  AlertCircle,
  Server,
  Database,
  RefreshCw,
  Search,
  Tag,
} from "lucide-react";

interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "high">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [showDescInput, setShowDescInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch("/api/todos");
      if (!res.ok) throw new Error("Failed to load todos from database");
      const data = await res.json();
      setTodos(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to connect to database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSubmitting(true);
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          priority,
        }),
      });

      if (!res.ok) throw new Error("Gagal menambahkan todo");
      const newTodo = await res.json();
      setTodos((prev) => [newTodo, ...prev]);
      setTitle("");
      setDescription("");
      setPriority("medium");
      setShowDescInput(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleTodo = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !currentStatus } : t))
      );

      const res = await fetch(`/api/todos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus }),
      });

      if (!res.ok) {
        // Rollback
        fetchTodos();
      }
    } catch (err) {
      fetchTodos();
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });
    } catch (err) {
      fetchTodos();
    }
  };

  // Filtered Todos
  const filteredTodos = todos.filter((todo) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "active"
        ? !todo.completed
        : filter === "completed"
        ? todo.completed
        : todo.priority === "high";

    const matchesSearch =
      todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const totalTodos = todos.length;
  const completedTodos = todos.filter((t) => t.completed).length;
  const activeTodos = totalTodos - completedTodos;
  const highPriorityCount = todos.filter((t) => t.priority === "high" && !t.completed).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Database className="w-3.5 h-3.5" />
                  PostgreSQL Docker
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Server className="w-3.5 h-3.5" />
                  fafnirserver (SSH MCP)
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl flex items-center gap-3">
                <ListTodo className="w-9 h-9 text-blue-500" />
                Fafnir Todo List
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Next.js App Router • Prisma ORM • PostgreSQL on Remote Docker Host
              </p>
            </div>
            <button
              onClick={fetchTodos}
              disabled={loading}
              className="self-start sm:self-center inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-400" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-blue-400" /> Total
              </div>
              <div className="text-2xl font-bold text-white mt-1">{totalTodos}</div>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Pending
              </div>
              <div className="text-2xl font-bold text-amber-400 mt-1">{activeTodos}</div>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> Done
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">{completedTodos}</div>
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> High Priority
              </div>
              <div className="text-2xl font-bold text-rose-400 mt-1">{highPriorityCount}</div>
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <div className="text-sm">{errorMsg}</div>
          </div>
        )}

        {/* Add Todo Input Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <form onSubmit={handleAddTodo} className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Tulis tugas baru di sini..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition"
              />
              <div className="flex items-center gap-2">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
                <button
                  type="submit"
                  disabled={submitting || !title.trim()}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-3 rounded-xl text-sm transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-blue-600/20"
                >
                  <Plus className="w-4 h-4" />
                  Tambah
                </button>
              </div>
            </div>

            {showDescInput ? (
              <textarea
                placeholder="Deskripsi tambahan (opsional)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition"
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowDescInput(true)}
                className="text-xs text-slate-400 hover:text-slate-200 transition inline-flex items-center gap-1 font-medium"
              >
                + Tambah catatan / deskripsi
              </button>
            )}
          </form>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            {(["all", "active", "completed", "high"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  filter === tab
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                {tab === "all" ? "Semua" : tab === "active" ? "Aktif" : tab === "completed" ? "Selesai" : "Prioritas Tinggi"}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari tugas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
            />
          </div>
        </div>

        {/* Todo Items List */}
        <div className="space-y-2.5">
          {loading ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-3" />
              <p className="text-sm">Memuat data dari PostgreSQL Docker...</p>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500">
              <ListTodo className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <p className="text-sm font-medium text-slate-400">Belum ada tugas di kategori ini.</p>
              <p className="text-xs mt-1">Buat tugas baru menggunakan form di atas.</p>
            </div>
          ) : (
            filteredTodos.map((todo) => {
              const isHigh = todo.priority === "high";
              const isLow = todo.priority === "low";

              return (
                <div
                  key={todo.id}
                  className={`group bg-slate-900 border rounded-2xl p-4 transition-all duration-200 flex items-start justify-between gap-4 ${
                    todo.completed
                      ? "border-slate-800/50 bg-slate-950/40 opacity-70"
                      : "border-slate-800 hover:border-slate-700 hover:bg-slate-900/90 shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleTodo(todo.id, todo.completed)}
                      className="mt-0.5 text-slate-400 hover:text-blue-400 transition flex-shrink-0"
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-medium transition ${
                            todo.completed
                              ? "line-through text-slate-500"
                              : "text-slate-100"
                          }`}
                        >
                          {todo.title}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isHigh
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : isLow
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {todo.priority}
                        </span>
                      </div>

                      {todo.description && (
                        <p
                          className={`text-xs mt-1 transition ${
                            todo.completed ? "line-through text-slate-600" : "text-slate-400"
                          }`}
                        >
                          {todo.description}
                        </p>
                      )}

                      <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(todo.createdAt).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition flex-shrink-0"
                    title="Hapus Todo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
