import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true, // Crucial para Vercel/Production
  providers: [
    Credentials({
      async authorize(credentials) {
        console.log("Authorize attempt for:", credentials?.email);
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await prisma.user.findUnique({ where: { email } });
          
          if (!user) {
            console.log("User not found");
            return null;
          }
          
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            console.log("Password matched, user authenticated");
            return user;
          } else {
            console.log("Invalid password");
          }
        } else {
          console.log("Invalid credentials format");
        }
        return null;
      },
    }),
  ],
})
