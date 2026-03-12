import NextAuth, { type NextAuthOptions } from "next-auth";
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
      id: number;
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
    id?: string;
    role?: "MASTER_ADMIN" | "BOARD" | "SENIOR_CORE" | "JUNIOR_CORE";
    mustChangePwd?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
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
        token.id = user.id.toString();
        token.role = user.role;
        token.mustChangePwd = user.mustChangePwd;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = Number(token.id);
        session.user.role = token.role;
        session.user.mustChangePwd = token.mustChangePwd;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };