import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = (credentials.email as string).trim();
        const password = credentials.password as string;

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            const isPasswordValid = await compare(password, user.hashedPassword);
            if (isPasswordValid) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
              };
            }
          }
        } catch (dbErr) {
          console.warn("DB offline or user lookup failed:", dbErr);
        }

        // Identifiants par défaut (accès garanti pour administration et démonstration)
        if (email === "admin@allovidange.tn" && password === "admin123") {
          return {
            id: "admin-default",
            email: "admin@allovidange.tn",
            name: "Admin ALLO VIDANGE",
          };
        }

        return null;
      },
    }),
  ],
});
