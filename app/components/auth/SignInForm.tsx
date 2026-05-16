'use client'

import React from 'react'
import { X, UserCog, Mail, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, LoginSchema } from "@/schemas/login-schemas";
import { login } from '@/actions/auth/auth';
import toast from 'react-hot-toast';
import RecoverPasswordForm from './RecoverPasswordForm';

interface Props {
    openLogin: boolean;
    setOpenRegister: (open: boolean) => void;
    setOpenLogin: (open: boolean) => void;
}

export const SignInForm: React.FC<Props> = ({
    openLogin,
    setOpenRegister,
    setOpenLogin
}) => {
    const router = useRouter();
    const [showRecover, setShowRecover] = React.useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),

        defaultValues: {
            email: "",
            password: "",
        }
    });

    const onSubmit = async (data: LoginSchema) => {
        try {

            const res = await login(data);

            if (res.success) {
                toast.success(res.message || "Usuario autenticado", { duration: 2500 });
                router.push('/dashboard');
                setOpenLogin(false);
            } else {
                toast.error(res.message || "Error al iniciar sesión", { duration: 2500 });
            }

        } catch (e) {
            const error = e as Error;
            toast.error("Ocurrió un error inesperado", { duration: 2500 });
        }
    };

    return (
        <>
            {openLogin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">

                    <div className="
                        relative
                        w-full
                        max-w-md
                        rounded-[32px]
                        border
                        border-white/40
                        bg-white/95
                        p-8
                        shadow-[0_20px_60px_rgba(0,0,0,0.15)]
                        backdrop-blur-xl
                        animate-in
                        fade-in
                        zoom-in
                        duration-300
                    ">

                        {/* CLOSE */}
                        <button
                            type="button"
                            onClick={() => setOpenLogin(false)}
                            className="
                                absolute
                                right-5
                                top-5
                                rounded-full
                                p-2
                                transition
                                hover:bg-zinc-100
                            "
                        >
                            <X size={20} />
                        </button>

                        {/* FORM CONTENT */}
                        {showRecover ? (
                            <RecoverPasswordForm onBack={() => setShowRecover(false)} />
                        ) : (
                            <>
                                {/* HEADER */}
                                <div className="mb-8">
                                    <div className="
                                        mb-4
                                        flex
                                        h-16
                                        w-16
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-[#166b6b]
                                        text-white
                                    ">
                                        <UserCog size={30} />
                                    </div>

                                    <h2 className="text-3xl font-bold">
                                        Iniciar Sesión
                                    </h2>

                                    <p className="mt-2 text-zinc-500">
                                        Ingresa tus credenciales para acceder al sistema hotelero.
                                    </p>
                                </div>

                                <form
                                    onSubmit={handleSubmit(onSubmit)}
                                    className="space-y-5"
                                >

                                    {/* EMAIL */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold">
                                            Correo electrónico
                                        </label>

                                        <div className="
                                            flex
                                            items-center
                                            gap-3
                                            rounded-2xl
                                            border
                                            border-zinc-200
                                            px-4
                                            py-3
                                            transition
                                            focus-within:border-[#166b6b]
                                        ">
                                            <Mail
                                                size={18}
                                                className="shrink-0 text-zinc-400"
                                            />

                                            <input
                                                {...register("email")}
                                                type="email"
                                                placeholder="correo@example.com"
                                                className="
                                                    w-full
                                                    bg-transparent
                                                    text-sm
                                                    outline-none
                                                "
                                            />
                                        </div>

                                        {errors.email && (
                                            <p className="mt-2 text-sm text-red-500">
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* PASSWORD */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold">
                                            Contraseña
                                        </label>

                                        <div className="
                                            flex
                                            items-center
                                            gap-3
                                            rounded-2xl
                                            border
                                            border-zinc-200
                                            px-4
                                            py-3
                                            transition
                                            focus-within:border-[#166b6b]
                                        ">
                                            <Lock
                                                size={18}
                                                className="shrink-0 text-zinc-400"
                                            />

                                            <input
                                                {...register("password")}
                                                type="password"
                                                placeholder="••••••••"
                                                className="
                                                    w-full
                                                    bg-transparent
                                                    text-sm
                                                    outline-none
                                                "
                                            />
                                        </div>

                                        {errors.password && (
                                            <p className="mt-2 text-sm text-red-500">
                                                {errors.password.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* OPTIONS */}
                                    <div className="flex items-center justify-between text-sm">

                                        <button
                                            type="button"
                                            onClick={() => setShowRecover(true)}
                                            className="
                                                font-medium
                                                text-[#166b6b]
                                                hover:underline
                                            "
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    </div>

                                    {/* BUTTON */}
                                    <Button
                                        type="submit"
                                        className="
                                            w-full
                                            rounded-2xl
                                            bg-[#166b6b]
                                            py-4
                                            font-semibold
                                            text-white
                                            transition
                                            hover:bg-[#124f4f]
                                        "
                                    >
                                        Ingresar al sistema
                                    </Button>
                                </form>
                            </>
                        )}

                        {/* FOOTER */}
                        <p className="
                            mt-6
                            text-center
                            text-sm
                            text-zinc-500
                        ">
                            ¿No tienes cuenta?{" "}

                            <button
                                type="button"
                                onClick={() => {
                                    setOpenLogin(false);
                                    setOpenRegister(true);
                                }}
                                className="
                                    font-semibold
                                    text-[#166b6b]
                                    hover:underline
                                "
                            >
                                Registrarse
                            </button>
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}