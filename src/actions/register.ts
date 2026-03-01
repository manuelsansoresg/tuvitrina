"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { PlanType } from "@prisma/client";
import { redirect } from "next/navigation";

const RegisterSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  plan: z.string().refine((val) => Object.values(PlanType).includes(val as PlanType), {
    message: "Selecciona un plan válido",
  }),
});

export async function register(prevState: any, formData: FormData) {
  const validatedFields = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    plan: formData.get("plan"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Error en los datos del formulario.",
    };
  }

  const { name, email, password, plan } = validatedFields.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        message: "Este correo electrónico ya está registrado.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const subscriptionEnd = new Date();
    subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        plan: plan as PlanType,
        subscriptionEnd,
        // Create a default business card for the user
        businessCard: {
          create: {
            slug: name.toLowerCase().replace(/\s+/g, "-") + "-" + Math.random().toString(36).substring(2, 7),
            title: name,
            description: `Tarjeta digital de ${name}`,
            themeColor: "#000000",
            active: true,
          },
        },
      },
    });

  } catch (error) {
    console.error("Registration error:", error);
    return {
      message: "Error al crear la cuenta. Por favor intenta de nuevo.",
    };
  }

  redirect("/login?registered=true");
}
