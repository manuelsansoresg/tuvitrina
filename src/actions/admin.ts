"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role, PlanType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const SUPER_ADMIN_EMAIL = "manuelsansoresg@gmail.com";

// --- Stats ---

export async function getAdminStats() {
  const session = await auth();
  console.log("getAdminStats session:", JSON.stringify(session, null, 2));
  if (session?.user?.role !== Role.ADMIN) return null;

  const totalUsers = await prisma.user.count({
    where: {
      email: { not: SUPER_ADMIN_EMAIL }
    }
  });
  
  const activeUsers = await prisma.user.count({ 
    where: { 
      active: true,
      email: { not: SUPER_ADMIN_EMAIL }
    } 
  });
  
  // Calculate total earnings from subscriptions
  // Exclude subscriptions from Super Admin
  const subscriptions = await prisma.subscription.findMany({
    where: { 
      status: "active",
      user: {
        email: { not: SUPER_ADMIN_EMAIL }
      }
    },
  });
  
  const totalEarnings = subscriptions.reduce((acc, sub) => acc + sub.amount, 0);

  // Group users by plan
  const usersByPlan = await prisma.user.groupBy({
    by: ['plan'],
    where: {
      email: { not: SUPER_ADMIN_EMAIL }
    },
    _count: {
      plan: true,
    },
  });

  return {
    totalUsers,
    activeUsers,
    totalEarnings,
    usersByPlan,
  };
}

// --- User Management ---

export async function getAdminUsers() {
  const session = await auth();
  console.log("getAdminUsers session:", JSON.stringify(session, null, 2));
  if (session?.user?.role !== Role.ADMIN) return [];

  return await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
        businessCard: {
            select: {
                slug: true
            }
        }
    }
  });
}

const CreateUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role),
  plan: z.nativeEnum(PlanType),
});

const UpdateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  role: z.nativeEnum(Role),
  plan: z.nativeEnum(PlanType),
  password: z.string().optional(),
});

export async function updateUser(prevState: any, formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== Role.ADMIN) return { message: "No autorizado", success: false };

    const rawData = Object.fromEntries(formData.entries());
    
    // Handle empty password string as undefined
    if (rawData.password === "") {
        delete rawData.password;
    }

    const validated = UpdateUserSchema.safeParse(rawData);
    if (!validated.success) {
        return { message: "Datos inválidos", success: false };
    }

    const { id, name, email, role, plan, password } = validated.data;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    
    // Security Checks
    if (targetUser?.email === SUPER_ADMIN_EMAIL && session.user.email !== SUPER_ADMIN_EMAIL) {
        return { message: "No puedes editar al Super Admin", success: false };
    }

    // Only Super Admin can assign ADMIN role
    if (role === Role.ADMIN && session.user.email !== SUPER_ADMIN_EMAIL) {
         // Allow if user was already ADMIN? 
         // Simplest: Only Super Admin can deal with ADMIN role assignment/maintenance
         if (targetUser?.role !== Role.ADMIN) {
            return { message: "Solo el Super Admin puede asignar nuevos Administradores", success: false };
         }
    }

    try {
        const updateData: any = { name, email, role, plan };
        
        if (password && password.length >= 6) {
            updateData.password = await bcrypt.hash(password, 10);
        } else if (password && password.length < 6) {
            return { message: "La contraseña debe tener al menos 6 caracteres", success: false };
        }

        await prisma.user.update({
            where: { id },
            data: updateData
        });
        revalidatePath("/admin");
        return { message: "Usuario actualizado", success: true };
    } catch (error) {
        console.error("Error updating user:", error);
        return { message: "Error al actualizar", success: false };
    }
}

export async function createAdminUser(prevState: any, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) {
    return { message: "No autorizado", success: false };
  }

  const rawData = Object.fromEntries(formData.entries());
  
  // Validate Super Admin for creating ADMINs
  if (rawData.role === Role.ADMIN && session.user.email !== SUPER_ADMIN_EMAIL) {
     return { message: "Solo el Super Admin puede crear otros Administradores.", success: false };
  }

  const validated = CreateUserSchema.safeParse(rawData);
  if (!validated.success) {
    return { message: "Datos inválidos", success: false };
  }

  const { name, email, password, role, plan } = validated.data;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { message: "El usuario ya existe", success: false };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        plan,
        active: true,
        businessCard: {
            create: {
                title: name,
                slug: name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000),
                active: true
            }
        }
      },
    });

    revalidatePath("/admin");
    return { message: "Usuario creado exitosamente", success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return { message: "Error al crear usuario", success: false };
  }
}

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  const session = await auth();
  if (session?.user?.role !== Role.ADMIN) return { message: "No autorizado" };
  
  // Prevent deactivating Super Admin
  const userToToggle = await prisma.user.findUnique({ where: { id: userId } });
  if (userToToggle?.email === SUPER_ADMIN_EMAIL) {
      return { message: "No se puede desactivar al Super Admin" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { active: !currentStatus },
  });

  revalidatePath("/admin");
  return { message: "Estado actualizado" };
}

export async function deleteUser(userId: string) {
    const session = await auth();
    if (session?.user?.role !== Role.ADMIN) return { message: "No autorizado" };

    const userToDelete = await prisma.user.findUnique({ where: { id: userId } });
    if (userToDelete?.email === SUPER_ADMIN_EMAIL) {
        return { message: "No se puede eliminar al Super Admin" };
    }

    try {
        await prisma.user.delete({ where: { id: userId } });
        revalidatePath("/admin");
        return { message: "Usuario eliminado" };
    } catch (e) {
        return { message: "Error al eliminar" };
    }
}
