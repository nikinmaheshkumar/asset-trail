import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface User {
    role?: "MASTER_ADMIN" | "BOARD" | "SENIOR_CORE" | "JUNIOR_CORE";
    mustChangePwd?: boolean;
  }

  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "MASTER_ADMIN" | "BOARD" | "SENIOR_CORE" | "JUNIOR_CORE";
      mustChangePwd?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "MASTER_ADMIN" | "BOARD" | "SENIOR_CORE" | "JUNIOR_CORE";
    mustChangePwd?: boolean;
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const user = await prisma.member.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("User not found");
        }

        const valid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!valid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          mustChangePwd: user.mustChangePwd,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.mustChangePwd = user.mustChangePwd;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.mustChangePwd = token.mustChangePwd;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };