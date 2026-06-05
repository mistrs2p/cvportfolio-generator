import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

// GET — لیست پروژه‌های کاربر
export async function GET() {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { slides: true } } },
  });

  return NextResponse.json(projects);
}
// POST — ساخت پروژه جدید
export async function POST(req: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const project = await prisma.project.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      userId: session.user.id,
    },
    include: {
      _count: { select: { slides: true } }, // ← این را اضافه کن
    },
  });

  return NextResponse.json(project, { status: 201 });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.project.delete({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}