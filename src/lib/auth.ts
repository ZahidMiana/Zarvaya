import NextAuth, { type NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import OTP from "@/models/OTP";
import User from "@/models/User";

const emailPasswordSchema = z.object({
  identifier: z.string().trim().min(3),
  password: z.string().min(8),
});

const phoneOtpSchema = z.object({
  phone: z.string().regex(/^03\d{9}$/),
  otp: z.string().regex(/^\d{6}$/),
});

export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/",
    error: "/",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      id: "email-password",
      name: "Email & Password",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = emailPasswordSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error("INVALID_CREDENTIALS");
        }

        await connectDB();

        const identifier = parsed.data.identifier.trim();
        const user = await User.findOne({
          $or: [{ email: identifier.toLowerCase() }, { phone: identifier.replace(/\s+/g, "") }],
        })
          .select("+passwordHash")
          .exec();

        if (!user) {
          throw new Error("INVALID_CREDENTIALS");
        }

        const isValid = await user.comparePassword(parsed.data.password);
        if (!isValid) {
          throw new Error("INVALID_CREDENTIALS");
        }

        if (!user.isActive) {
          throw new Error("ACCOUNT_DISABLED");
        }

        user.lastLoginAt = new Date();
        user.lastLoginMethod = "email";
        await user.save();

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
        };
      },
    }),
    Credentials({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const parsed = phoneOtpSchema.safeParse(credentials);
        if (!parsed.success) {
          throw new Error("OTP_INVALID");
        }

        await connectDB();

        const otpRecord = await OTP.findOne({
          phone: parsed.data.phone,
          purpose: "login",
          isUsed: false,
          expiresAt: { $gt: new Date() },
        })
          .select("+otp")
          .exec();

        if (!otpRecord) {
          throw new Error("OTP_EXPIRED");
        }

        if (otpRecord.attempts >= 3) {
          throw new Error("OTP_MAX_ATTEMPTS");
        }

        const validOtp = await bcrypt.compare(parsed.data.otp, otpRecord.otp);
        if (!validOtp) {
          otpRecord.attempts += 1;
          await otpRecord.save();
          throw new Error("OTP_INVALID");
        }

        otpRecord.isUsed = true;
        await otpRecord.save();

        let user = await User.findOne({ phone: parsed.data.phone }).exec();
        if (!user) {
          user = await User.create({
            phone: parsed.data.phone,
            name: "ZARVAYA Customer",
            authProvider: "phone",
            isPhoneVerified: true,
            role: "customer",
          });
        }

        user.lastLoginAt = new Date();
        user.lastLoginMethod = "phone";
        user.isPhoneVerified = true;
        await user.save();

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = ((user as { role?: "customer" | "admin" }).role ?? "customer") as "customer" | "admin";
        token.avatar = (user as { avatar?: string }).avatar;
        token.phone = (user as { phone?: string }).phone;
        token.authProvider = account?.provider ?? "credentials";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as "customer" | "admin") ?? "customer";
        session.user.avatar = token.avatar as string | undefined;
        session.user.phone = token.phone as string | undefined;
      }

      return session;
    },
    async signIn({ account, profile }) {
      if (account?.provider !== "google") {
        return true;
      }

      await connectDB();

      const googleProfile = profile as { sub?: string; name?: string; email?: string; picture?: string };
      if (!googleProfile.sub) {
        return false;
      }

      const existing = await User.findOne({
        $or: [{ googleId: googleProfile.sub }, { email: googleProfile.email?.toLowerCase() }],
      }).exec();

      if (!existing) {
        await User.create({
          name: googleProfile.name ?? "ZARVAYA Customer",
          email: googleProfile.email?.toLowerCase(),
          avatar: googleProfile.picture,
          authProvider: "google",
          googleId: googleProfile.sub,
          isEmailVerified: true,
          role: "customer",
          lastLoginAt: new Date(),
          lastLoginMethod: "google",
        });
      } else {
        existing.googleId = googleProfile.sub;
        existing.avatar = googleProfile.picture ?? existing.avatar;
        existing.authProvider = "google";
        existing.isEmailVerified = true;
        existing.lastLoginAt = new Date();
        existing.lastLoginMethod = "google";
        await existing.save();
      }

      return true;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
