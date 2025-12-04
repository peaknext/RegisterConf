---
description: Create a new page with proper structure
---

Create a new page at: $ARGUMENTS

Follow these conventions:
1. Create `page.tsx` in the appropriate route folder under `src/app/`
2. Use Server Components by default
3. Add `"use client"` only if interactivity is needed
4. Use Thai language for UI text
5. Use shadcn/ui components from `@/components/ui`
6. Import utilities from `@/lib/utils`

Example structure:
```tsx
import { Button } from "@/components/ui/button";

export default function PageName() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold">หัวข้อหน้า</h1>
      {/* Content */}
    </div>
  );
}
```

Route groups:
- `(public)` - Public pages
- `(auth)` - Authentication pages
- `(portal)` - Hospital representative portal
- `(admin)` - Admin portal
