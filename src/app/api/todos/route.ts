import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(todos);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("Error fetching todos:", error);
    return NextResponse.json(
      { error: "Failed to fetch todos", details: message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, priority } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const newTodo = await prisma.todo.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || "medium",
      },
    });

    return NextResponse.json(newTodo, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    console.error("Error creating todo:", error);
    return NextResponse.json(
      { error: "Failed to create todo", details: message },
      { status: 500 }
    );
  }
}
