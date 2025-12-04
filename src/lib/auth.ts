import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import { createHash } from "crypto";

// MD5 hash function for legacy password comparison
function md5(str: string): string {
  return createHash("md5").update(str).digest("hex");
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
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

        // Find member by email
        const member = await prisma.member.findUnique({
          where: { email },
          include: {
            hospital: true,
          },
        });

        if (!member) {
          return null;
        }

        // Check password using MD5 hash (legacy data format)
        const hashedPassword = md5(password);
        if (member.password !== hashedPassword) {
          return null;
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
        token.hospitalCode = (user as { hospitalCode?: string | null }).hospitalCode;
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
