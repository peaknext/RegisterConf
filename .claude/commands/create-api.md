---
description: Create a new API route
---

Create API route for: $ARGUMENTS

Follow these conventions:

1. Create `route.ts` in `src/app/api/[route-name]/`
2. Export functions for HTTP methods: GET, POST, PUT, DELETE
3. Use Prisma for database operations
4. Return proper JSON responses with status codes
5. Handle errors gracefully

Example structure:
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const data = await prisma.tableName.findMany();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await prisma.tableName.create({ data: body });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create data" },
      { status: 500 }
    );
  }
}
```

Response status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error
