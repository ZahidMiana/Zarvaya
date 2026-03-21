import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin" },
  providers: [
    Credentials({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        await connectDB();
        const user = await User.findOne({ email: parsed.data.email, isActive: true })
          .select("+passwordHash")
          .lean();

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValidPassword = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!isValidPassword) {
          return null;
        }

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        } as { id: string; name: string; email: string; role: string };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role?: string }).role ?? "customer";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; role?: string }).id = token.id as string;
        (session.user as { id?: string; role?: string }).role = (token.role as string) ?? "customer";
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
