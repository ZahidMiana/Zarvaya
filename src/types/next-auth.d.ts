import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email?: string | null;
      phone?: string;
      role: "customer" | "admin";
      avatar?: string;
    };
  }

  interface User {
    role: "customer" | "admin";
    avatar?: string;
    phone?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "customer" | "admin";
    avatar?: string;
    phone?: string;
    authProvider?: string;
  }
}
