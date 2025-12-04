import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      memberType: number;
      hospitalCode: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    memberType?: number;
    hospitalCode?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    memberType?: number;
    hospitalCode?: string | null;
  }
}
