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

// Store request context for logging (workaround for NextAuth)
let currentRequest: Request | null = null;

export function setAuthRequest(request: Request) {
  currentRequest = request;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;
        const ip = currentRequest ? getClientIp(currentRequest) : "unknown";

        // Rate limiting check
        const rateLimitKey = `login:${ip}:${email}`;
        const rateLimitResult = checkRateLimit(rateLimitKey, AUTH_RATE_LIMIT);

        if (!rateLimitResult.success) {
          if (currentRequest) {
            logRateLimited(currentRequest, email);
          }
          throw new Error("TOO_MANY_ATTEMPTS");
        }

        // Find member by email
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

        // Verify password (supports both bcrypt and legacy MD5)
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

        // Migrate MD5 password to bcrypt on successful login
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.memberType = (user as { memberType?: number }).memberType;
        token.hospitalCode = (user as { hospitalCode?: string | null })
          .hospitalCode;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.memberType = token.memberType as number;
        session.user.hospitalCode = token.hospitalCode as string | null;
      }
      return session;
    },
  },
});
