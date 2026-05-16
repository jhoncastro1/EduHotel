import z from "zod";

const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const loginSchema = z.object({
    email: z
        .string()
        .email({
            message: "El correo electrónico no es válido.",
        })
        .regex(emailRegex, "El correo electrónico no es válido."),

    password: z
        .string()
        .min(8, "La contraseña debe tener mínimo 8 caracteres"),
});

export type LoginSchema = z.infer<typeof loginSchema>;