import { createProjectAsset } from "@/lib/repositories/assetRepository";
import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: projectId } = await params;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE)
      return NextResponse.json(
        { error: "File too large (max 5MB)" },
        { status: 400 },
      );

    const buffer = await file.arrayBuffer();
    const base64 = `data:${file.type};base64,${Buffer.from(buffer).toString("base64")}`;

    const asset = await createProjectAsset({
      projectId,
      userId: session.user.id,
      type: "image",
      url: base64,
      filename: file.name,
      size: file.size,
    });

    return NextResponse.json({ data: asset }, { status: 201 });
  } catch (error) {
    console.error("[ASSET_UPLOAD]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
