// src/app/api/projects/[id]/slides/[slideId]/duplicate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/generated/prisma"; // ✅ مسیر صحیح

type Params = { params: Promise<{ id: string; slideId: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id, slideId } = await params;

  const original = await prisma.slide.findUnique({
    where: { id: slideId },
  });

  if (!original) {
    return NextResponse.json({ error: "Slide not found" }, { status: 404 });
  }

  const slides = await prisma.slide.findMany({
    where: { projectId: id },
    orderBy: { order: "asc" },
  });

  const newSlide = await prisma.slide.create({
    data: {
      projectId: id,
      title: original.title ? `${original.title} (Copy)` : null,
      order: slides.length,
      // ✅ cast به InputJsonValue تا خطای null برطرف شود
      nodes: (original.nodes as Prisma.InputJsonValue) ?? Prisma.JsonNull,
    },
  });

  return NextResponse.json(newSlide, { status: 201 });
}
