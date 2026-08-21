import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, description, completed, priority } = body;

    const updateData: any = {};
    if (typeof title === "string") updateData.title = title.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (typeof completed === "boolean") updateData.completed = completed;
    if (typeof priority === "string") updateData.priority = priority;

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedTodo);
  } catch (error: any) {
    console.error("Error updating todo:", error);
    return NextResponse.json(
      { error: "Failed to update todo", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await prisma.todo.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Todo deleted" });
  } catch (error: any) {
    console.error("Error deleting todo:", error);
    return NextResponse.json(
      { error: "Failed to delete todo", details: error.message },
      { status: 500 }
    );
  }
}
