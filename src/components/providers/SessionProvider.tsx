/**
 * NextAuth.js session provider wrapper for client components.
 *
 * This component wraps the application to provide session context
 * for `useSession()` hook in client components.
 *
 * Must be used in a client component ("use client") because
 * NextAuth's SessionProvider uses React context.
 *
 * @module components/providers/SessionProvider
 *
 * @example
 * // In root layout
 * import { SessionProvider } from "@/components/providers/SessionProvider";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <SessionProvider>{children}</SessionProvider>
 *       </body>
 *     </html>
 *   );
 * }
 */
"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

/**
 * Session context provider for NextAuth.js.
 *
 * @component
 * @param props - Component props
 * @param props.children - Child components that need session access
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
