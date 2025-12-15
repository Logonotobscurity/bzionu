import NextAuth, { DefaultSession } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import type { User } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }
}

const nextAuthConfig = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.firstName,
          role: user.role,
        };
      },
    }),
    // Google OAuth Provider
    process.env.GOOGLE_ID && process.env.GOOGLE_SECRET
      ? Google({
          clientId: process.env.GOOGLE_ID,
          clientSecret: process.env.GOOGLE_SECRET,
          allowDangerousEmailAccountLinking: false,
        })
      : null,
    // GitHub OAuth Provider
    process.env.GITHUB_ID && process.env.GITHUB_SECRET
      ? GitHub({
          clientId: process.env.GITHUB_ID,
          clientSecret: process.env.GITHUB_SECRET,
          allowDangerousEmailAccountLinking: false,
        })
      : null,
  ].filter(Boolean),
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session.user.role = token.role as any;
      }
      return session;
    },
  },
});

export const { handlers, signIn, signOut, auth: authExport } = nextAuthConfig;

// Explicitly export auth as a function for better compatibility
export const auth = authExport;
