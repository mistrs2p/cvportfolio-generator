import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { slides } = await req.json();

  // آپدیت همه به صورت موازی
  await Promise.all(
    slides.map(({ id: slideId, order }: { id: string; order: number }) =>
      prisma.slide.update({
        where: { id: slideId },
        data: { order },
      }),
    ),
  );

  return NextResponse.json({ success: true });
}
