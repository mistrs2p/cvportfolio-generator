---
name: api-database
description: Expert in Portfolio Studio's API and database layer. Covers Repository Pattern with Prisma, NextAuth session handling, REST API route patterns, input validation, error handling, and data flow from client to server.
---

## Layer Responsibilities
- `src/lib/repositories/` → ALL Prisma queries live here, nowhere else
- `src/lib/services/`     → cross-entity business logic
- `src/app/api/`          → thin orchestration: auth → validate → call service/repo → respond

## API Route Template
```ts
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) 
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    // validate with zod or manual checks
    if (!body.title) 
      return NextResponse.json({ error: "title is required" }, { status: 400 });

    const data = await someRepository.create({ ...body, userId: session.user.id });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("[ROUTE_NAME]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

## Repository Pattern (mandatory)
```ts
// ✅ src/lib/repositories/projectRepository.ts
export const findProjectById = (id: string, userId: string) =>
  prisma.project.findUnique({ where: { id, userId } });

// ❌ NEVER — direct Prisma inside API route
```

## Rules
- Never expose Prisma error messages to the client
- Always scope queries to `userId` — never trust client-sent userId
- Response shape is always `{ data?: T, error?: string }`
- `src/lib/db/prisma.ts` singleton — never `new PrismaClient()` elsewhere