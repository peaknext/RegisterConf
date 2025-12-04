---
description: Create a new React component
---

Create a new component: $ARGUMENTS

Follow these conventions:

1. Determine the component category:
   - `src/components/ui/` - Base UI components (shadcn)
   - `src/components/landing/` - Landing page components
   - `src/components/portal/` - Portal components
   - `src/components/shared/` - Shared/reusable components

2. Use TypeScript with proper types
3. Use `cn()` for className merging
4. Follow shadcn/ui patterns

Example structure:
```tsx
import { cn } from "@/lib/utils";

interface ComponentNameProps {
  className?: string;
  children?: React.ReactNode;
}

export function ComponentName({ className, children }: ComponentNameProps) {
  return (
    <div className={cn("base-classes", className)}>
      {children}
    </div>
  );
}
```

For client components (with interactivity):
```tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// ... rest of component
```
