import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

type Params = { params: Promise<{ id: string; slideId: string }> };

// PATCH — update slide nodes
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, slideId } = await params;
  const body = await req.json();

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const slide = await prisma.slide.update({
    where: { id: slideId },
    data: {
      nodes: body.nodes ?? [],
      title: body.title,
    },
  });

  return NextResponse.json(slide);
}

// DELETE — remove slide
export async function DELETE(req: Request, { params }: Params) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slideId } = await params;

  await prisma.slide.delete({ where: { id: slideId } });
  return NextResponse.json({ success: true });
}
