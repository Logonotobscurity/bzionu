
import NextAuth, { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Email from "next-auth/providers/email";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import type { JWT } from "next-auth/jwt";
import * as bcrypt from "bcryptjs";
import { Adapter } from "next-auth/adapters";

// Define custom properties on the session and user objects
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      firstName: string | null;
      lastName: string | null;
      companyName: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    firstName: string | null;
    lastName: string | null;
    companyName: string | null;
  }
}

// Define custom properties on the JWT
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
    companyName: string | null;
  }
}

const nextAuthConfig = NextAuth({
  adapter: PrismaAdapter(prisma) as Adapter,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  providers: [
    Email({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      maxAge: 10 * 60, // Magic links expire in 10 minutes
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (user && (user as any).password && (await bcrypt.compare(credentials.password, (user as any).password))) {
          const { password, ...userWithoutPassword } = user as any;
          return { ...userWithoutPassword, id: user.id.toString() };
        }
        
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // When the user signs in, the `user` object from the database is passed.
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.companyName = user.companyName;
      }
      return token;
    },
    async session({ session, token }) {
      // The `session` callback is called after the `jwt` callback.
      // We can transfer the custom properties from the token to the session.
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.companyName = token.companyName;

        // Combine firstName and lastName for the default `name` property
        session.user.name = [token.firstName, token.lastName]
          .filter(Boolean)
          .join(" ");
      }
      return session;
    },
  },
});

export const { handlers, signIn, signOut, auth: authExport } = nextAuthConfig;

// Explicitly export auth as a function for better compatibility
export const auth = authExport;
