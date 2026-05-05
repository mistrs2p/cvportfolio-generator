import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string; slideId: string } },
) {
  const { id: projectId, slideId } = params;

  // پیدا کردن اسلاید اصلی
  const original = await prisma.slide.findUnique({
    where: { id: slideId },
  });

  if (!original) {
    return NextResponse.json({ error: "Slide not found" }, { status: 404 });
  }

  // آخرین order رو پیدا کن
  const last = await prisma.slide.findFirst({
    where: { projectId },
    orderBy: { order: "desc" },
  });

  // کپی بساز
  const duplicate = await prisma.slide.create({
    data: {
      projectId,
      title: `${original.title} (Copy)`,
      nodes: original.nodes,
      order: (last?.order ?? 0) + 1,
    },
  });

  return NextResponse.json(duplicate);
}
