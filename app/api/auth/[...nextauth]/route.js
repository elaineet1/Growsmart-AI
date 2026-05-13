// app/api/auth/[...nextauth]/route.js

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const client = await db.client.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!client || !client.isActive) return null;

        const valid = await bcrypt.compare(credentials.password, client.passwordHash);
        if (!valid) return null;

        return { id: client.id, email: client.email, name: client.name, plan: client.plan };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = user.id; token.plan = user.plan; }
      return token;
    },
    async session({ session, token }) {
      if (token) { session.user.id = token.id; session.user.plan = token.plan; }
      return session;
    },
  },
  pages:   { signIn: "/login", error: "/login" },
  session: { strategy: "jwt" },
  secret:  process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
