---
description: Run database migration
---

Run Prisma database migration.

Steps:
1. Review changes in `prisma/schema.prisma`
2. Run: `npx prisma db push` to sync schema
3. Run: `npx prisma generate` to update client
4. Optionally run: `npx prisma studio` to verify

Commands:
```bash
npx prisma db push      # Push schema changes
npx prisma generate     # Generate Prisma client
npx prisma studio       # Open Prisma Studio GUI
npx prisma migrate dev  # Create migration file (for production)
```
