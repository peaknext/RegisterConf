/**
 * NextAuth.js v5 authentication configuration for the conference registration system.
 *
 * Features:
 * - Credentials-based authentication with email/password
 * - Rate limiting protection against brute-force attacks (5 attempts/15 min)
 * - Automatic password migration from MD5 (legacy) to bcrypt on successful login
 * - Extended session with memberType and hospitalCode for role-based access
 * - Security event logging for all authentication attempts
 *
 * @module auth
 * @see {@link ./password.ts} for password verification logic
 * @see {@link ./rate-limit.ts} for rate limiting configuration
 * @see {@link ./security-logger.ts} for security event logging
 * @see {@link ../middleware.ts} for route protection
 * @see {@link ../types/next-auth.d.ts} for extended session types
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { verifyPassword, hashPassword } from "./password";
import {
  checkRateLimit,
  resetRateLimit,
  getClientIp,
  AUTH_RATE_LIMIT,
} from "./rate-limit";
import {
  logLoginSuccess,
  logLoginFailed,
  logRateLimited,
  logPasswordMigrated,
} from "./security-logger";

/**
 * Stores the current request object for security logging within NextAuth callbacks.
 *
 * This is a workaround because NextAuth's authorize callback doesn't receive
 * the original request object, but we need it for IP-based rate limiting
 * and security event logging.
 */
let currentRequest: Request | null = null;

/**
 * Store the current request object for use in NextAuth callbacks.
 *
 * Call this function at the start of the NextAuth POST handler to make
 * the request context available for rate limiting and security logging.
 *
 * @param request - The incoming HTTP request from the login API route
 *
 * @example
 * // In /api/auth/[...nextauth]/route.ts
 * export async function POST(request: Request) {
 *   setAuthRequest(request);
 *   return handlers.POST(request);
 * }
 */
export function setAuthRequest(request: Request) {
  currentRequest = request;
}

/**
 * NextAuth configuration and exported handlers.
 *
 * Exports:
 * - handlers: HTTP handlers for /api/auth/* routes
 * - signIn: Server-side sign in function
 * - signOut: Server-side sign out function
 * - auth: Get current session (use in server components/actions)
 *
 * @example
 * // Get session in server component
 * import { auth } from "@/lib/auth";
 * const session = await auth();
 * if (session?.user.memberType === 99) {
 *   // Admin user
 * }
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),

  // Session configuration
  session: {
    strategy: "jwt", // Use JWT for stateless sessions (no database session table)
    maxAge: 8 * 60 * 60, // 8 hours - matches typical work day
  },

  // Custom pages
  pages: {
    signIn: "/login", // Custom login page instead of NextAuth default
  },

  // Authentication providers
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      /**
       * Authorize callback - validates user credentials.
       *
       * Authentication flow:
       * 1. Check rate limit (5 attempts per 15 minutes per IP+email)
       * 2. Find member by email in database
       * 3. Verify password (supports bcrypt and legacy MD5)
       * 4. Migrate MD5 passwords to bcrypt on successful login
       * 5. Log security events (success/failure)
       *
       * @param credentials - Email and password from login form
       * @returns User object on success, null on failure
       * @throws Error with "TOO_MANY_ATTEMPTS" if rate limited
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const ip = currentRequest ? getClientIp(currentRequest) : "unknown";

        // Step 1: Rate limiting check
        const rateLimitKey = `login:${ip}:${email}`;
        const rateLimitResult = checkRateLimit(rateLimitKey, AUTH_RATE_LIMIT);

        if (!rateLimitResult.success) {
          if (currentRequest) {
            logRateLimited(currentRequest, email);
          }
          throw new Error("TOO_MANY_ATTEMPTS");
        }

        // Step 2: Find member by email
        const member = await prisma.member.findUnique({
          where: { email },
          include: {
            hospital: true,
          },
        });

        if (!member) {
          if (currentRequest) {
            logLoginFailed(currentRequest, email, "User not found");
          }
          return null;
        }

        // Step 3: Verify password (supports both bcrypt and legacy MD5)
        const { valid, needsRehash } = await verifyPassword(
          password,
          member.password
        );

        if (!valid) {
          if (currentRequest) {
            logLoginFailed(currentRequest, email, "Invalid password");
          }
          return null;
        }

        // Step 4: Migrate MD5 password to bcrypt on successful login
        if (needsRehash) {
          try {
            const newHash = await hashPassword(password);
            await prisma.member.update({
              where: { id: member.id },
              data: { password: newHash },
            });
            if (currentRequest) {
              logPasswordMigrated(
                currentRequest,
                member.id.toString(),
                member.email
              );
            }
          } catch (error) {
            // Don't fail login if migration fails, just log it
            console.error("Failed to migrate password to bcrypt:", error);
          }
        }

        // Reset rate limit on successful login
        resetRateLimit(rateLimitKey);

        // Log successful login
        if (currentRequest) {
          logLoginSuccess(currentRequest, member.id.toString(), member.email);
        }

        return {
          id: member.id.toString(),
          email: member.email,
          name: member.hospital?.name || member.email,
          memberType: member.memberType,
          hospitalCode: member.hospitalCode,
        };
      },
    }),
  ],
  // Callbacks for enriching JWT and session with custom properties
  callbacks: {
    /**
     * JWT callback - enriches the JWT token with custom user properties.
     *
     * Called whenever a JWT is created (login) or updated (session access).
     * Stores memberType and hospitalCode in the token for later use.
     *
     * @param token - The JWT token being created/updated
     * @param user - The user object (only present on sign in)
     * @returns The enriched JWT token
     */
    async jwt({ token, user }) {
      // On sign in, copy custom properties from user to token
      if (user) {
        token.id = user.id;
        token.memberType = (user as { memberType?: number }).memberType;
        token.hospitalCode = (user as { hospitalCode?: string | null })
          .hospitalCode;
      }
      return token;
    },

    /**
     * Session callback - exposes JWT properties to the client session.
     *
     * Called whenever session is checked (useSession, getSession, auth()).
     * Copies custom properties from JWT to the session.user object.
     *
     * @param session - The session object
     * @param token - The JWT token containing custom properties
     * @returns The enriched session object
     */
    async session({ session, token }) {
      // Copy custom properties from token to session.user
      if (session.user) {
        session.user.id = token.id as string;
        session.user.memberType = token.memberType as number;
        session.user.hospitalCode = token.hospitalCode as string | null;
      }
      return session;
    },
  },
});
