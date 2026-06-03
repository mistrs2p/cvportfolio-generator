import { prisma } from "@/lib/db/prisma";

interface CreateAssetInput {
  projectId: string;
  userId: string;
  type: string;
  url: string;
  filename?: string;
  size?: number;
}

export const createProjectAsset = async (input: CreateAssetInput) => {
  const project = await prisma.project.findUnique({
    where: { id: input.projectId },
  });

  if (!project || project.userId !== input.userId) {
    throw new Error("Project not found or access denied");
  }

  return prisma.projectAsset.create({
    data: {
      projectId: input.projectId,
      type: input.type,
      url: input.url,
      filename: input.filename,
      size: input.size,
    },
  });
};
