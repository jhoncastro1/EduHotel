import { z } from "zod";

export const registerSchema = z
    .object({
        name: z
            .string()
            .min(3, "El nombre debe tener mínimo 3 caracteres"),

        email: z
            .string()
            .email("Correo electrónico inválido"),

        phone: z
            .string()
            .min(10, "Número de teléfono inválido"),

        password: z
            .string()
            .min(8, "La contraseña debe tener mínimo 8 caracteres"),

        confirmPassword: z
            .string()
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });

export type RegisterSchema = z.infer<typeof registerSchema>;