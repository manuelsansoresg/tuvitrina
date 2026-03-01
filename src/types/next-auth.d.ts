import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface User {
    role?: "ADMIN" | "USER"
  }
  
  interface Session {
    user: {
      role?: "ADMIN" | "USER"
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "USER"
  }
}
