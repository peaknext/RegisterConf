/**
 * NextAuth.js type augmentation for extended session properties.
 *
 * This file extends the default NextAuth types to include custom properties
 * that are specific to the conference registration system:
 *
 * - `memberType`: Distinguishes between hospital representatives (1) and admins (99)
 * - `hospitalCode`: Links the user to their hospital for scoped data access
 *
 * These properties flow through the authentication pipeline:
 * 1. Set in authorize() callback when user logs in (from database)
 * 2. Stored in JWT via jwt() callback
 * 3. Available in session via session() callback
 * 4. Accessed via useSession() hook or auth() function in components
 *
 * @module next-auth.d
 * @see {@link ../lib/auth.ts} for implementation details
 * @see {@link https://next-auth.js.org/getting-started/typescript} for NextAuth TypeScript guide
 *
 * @example
 * // Server component
 * import { auth } from "@/lib/auth";
 * const session = await auth();
 * if (session?.user.memberType === 99) {
 *   // Admin user - can access all data
 * } else {
 *   // Hospital user - scoped to session.user.hospitalCode
 * }
 *
 * @example
 * // Client component
 * import { useSession } from "next-auth/react";
 * const { data: session } = useSession();
 * console.log(session?.user.hospitalCode); // "H001" or null for admin
 */
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extended Session interface with custom user properties.
   * Available via useSession() hook or auth() function.
   */
  interface Session {
    user: {
      /**
       * Database ID of the member (from members.id).
       * Stored as string for consistency with NextAuth.
       */
      id: string;

      /**
       * Member type determining access level and permissions.
       * - 1: Hospital representative (scoped to their hospital)
       * - 99: Admin (full system access to all hospitals)
       */
      memberType: number;

      /**
       * Hospital code for scoping data access.
       * - For hospital reps: The code of their assigned hospital (e.g., "H001")
       * - For admins: null (can access all hospitals)
       */
      hospitalCode: string | null;
    } & DefaultSession["user"];
  }

  /**
   * Extended User interface returned from authorize() callback.
   * Used during the sign-in process before JWT is created.
   */
  interface User {
    /**
     * Member type (1 = hospital representative, 99 = admin).
     * Optional because it's only set during credentials login.
     */
    memberType?: number;

    /**
     * Hospital code for hospital representatives.
     * Optional because admins have null hospitalCode.
     */
    hospitalCode?: string | null;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extended JWT interface with custom token properties.
   * These properties are encoded in the session cookie/token.
   */
  interface JWT {
    /**
     * User's database ID (from members.id).
     * Stored in token for session callback access.
     */
    id?: string;

    /**
     * Member type for authorization checks.
     * Used in middleware and API routes to verify permissions.
     */
    memberType?: number;

    /**
     * Hospital code for data scoping in queries.
     * Hospital reps can only access data with matching hospitalCode.
     */
    hospitalCode?: string | null;
  }
}
