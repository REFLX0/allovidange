import type { NextAuthConfig } from "next-auth";

/**
 * Auth.js configuration — Edge-compatible.
 * Ne pas importer bcryptjs, prisma, ou autres modules Node.js.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 heures
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? "";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async authorized({ auth: session, request }) {
      const isLoggedIn = !!session?.user;
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

      if (isAdminRoute && !isLoggedIn) {
        return false;
      }

      return true;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "allovidange-super-secret-key-1234567890",
  providers: [],
};
