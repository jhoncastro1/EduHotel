'use client'
import { Button } from '@/components/ui/button';
import PhoneInput from '@/components/ui/PhoneInput';
import {
    X,
    UserPlus,
    Mail,
    Lock,
    User,
    Phone,
} from 'lucide-react'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    registerSchema,
    RegisterSchema
} from "@/schemas/register-schemas";
import { signup } from '@/actions/auth/auth';
import toast from 'react-hot-toast';

interface Props {
    openRegister: boolean;
    setOpenRegister: (open: boolean) => void;

    openLogin: boolean;
    setOpenLogin: (open: boolean) => void;
}

export const RegisterForm: React.FC<Props> = ({
    openRegister,
    setOpenRegister,
    setOpenLogin
}) => {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),

        defaultValues: {
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
        }
    });

    const onSubmit = async (data: RegisterSchema) => {
        try {
            const res = await signup(data);
            if (res.success) {
                toast.success(`Hola ${data.name}, te hemos enviado un correo para poder validar tu cuenta `, { duration: 4000, icon: '📧' });
                setOpenRegister(false);
            }
        } catch (error) {
            const errorAuth = error as Error;
            if (errorAuth.message.includes('User already registered')) {
                toast.error('Este correo electrónico ya está registrado', { duration: 4000 });
            } else if (errorAuth.message.includes('Password should be at least 6 characters')) {
                toast.error('La contraseña debe tener al menos 6 caracteres', { duration: 4000 });
            } else if (errorAuth.message.includes('Invalid email')) {
                toast.error('Por favor ingresa un correo electrónico válido', { duration: 4000 });
            } else {
                toast.error(errorAuth.message || 'Error al registrar el usuario', { duration: 4000 });
            }
        }
    };
    return (
        <>
            {openRegister && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">

                    {/* CONTAINER */}
                    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6">

                        {/* MODAL */}
                        <div
                            className="
        relative
        w-full
        max-w-md
        rounded-[28px]

        bg-white/95
        backdrop-blur-xl

        shadow-[0_20px_60px_rgba(0,0,0,0.15)]

        animate-in
        fade-in
        zoom-in
        duration-300

        max-h-[95vh]
        overflow-y-auto

        border
        border-white/40

        scrollbar-thin
        scrollbar-thumb-[#166b6b]
        scrollbar-track-transparent

        hover:scrollbar-thumb-[#124f4f]

        scroll-smooth
    "
                        >

                            {/* CLOSE */}
                            <button
                                onClick={() => setOpenRegister(false)}
                                className="
                                    absolute
                                    right-4
                                    top-4
                                    z-10
                                    rounded-full
                                    p-2
                                    transition
                                    hover:bg-zinc-100
                                "
                            >
                                <X size={20} />
                            </button>

                            {/* CONTENT */}
                            <div className="p-5 sm:p-8">

                                {/* HEADER */}
                                <div className="mb-6 sm:mb-8">
                                    <div className="
                                        mb-4
                                        flex
                                        h-14
                                        w-14
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        bg-[#166b6b]
                                        text-white
                                        sm:h-16
                                        sm:w-16
                                    ">
                                        <UserPlus size={28} />
                                    </div>

                                    <h2 className="text-2xl font-bold sm:text-3xl">
                                        Crear Cuenta
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-zinc-500 sm:text-base">
                                        Regístrate para acceder al sistema hotelero
                                        y administrar tus procesos académicos.
                                    </p>
                                </div>

                                {/* FORM */}
                                <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit(onSubmit)}>

                                    {/* NOMBRE */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold">
                                            Nombre completo
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
                                            <User
                                                size={18}
                                                className="shrink-0 text-zinc-400"
                                            />

                                            <input
                                                {...register("name")}
                                                type="text"
                                                placeholder="Ingrese su nombre completo"
                                                className="
                                                    w-full
                                                    bg-transparent
                                                    text-sm
                                                    outline-none
                                                    sm:text-base
                                                "
                                            />{errors.name && (
                                                <p className="mt-2 text-sm text-red-500">
                                                    {errors.name.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

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
                                                    sm:text-base
                                                "
                                            />
                                            {
                                                errors.email && (
                                                    <p className="mt-2 text-sm text-red-500">
                                                        {errors.email.message}
                                                    </p>
                                                )
                                            }
                                        </div>
                                    </div>

                                    {/* TELEFONO */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold">
                                            Número de teléfono
                                        </label>
                                        <PhoneInput
                                            defaultCountryCode="CO"
                                            onChange={(value) =>
                                                setValue("phone", value, {
                                                    shouldValidate: true,
                                                })
                                            }
                                        />
                                        {
                                            errors.phone && (
                                                <p className="mt-2 text-sm text-red-500">
                                                    {errors.phone.message}
                                                </p>
                                            )
                                        }
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
                                                    sm:text-base
                                                "
                                            />
                                            {
                                                errors.password && (
                                                    <p className="mt-2 text-sm text-red-500">
                                                        {errors.password.message}
                                                    </p>
                                                )
                                            }
                                        </div>
                                    </div>

                                    {/* CONFIRM PASSWORD */}
                                    <div>
                                        <label className="mb-2 block text-sm font-semibold">
                                            Confirmar contraseña
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
                                                {...register("confirmPassword")}
                                                type="password"
                                                placeholder="••••••••"
                                                className="
                                                    w-full
                                                    bg-transparent
                                                    text-sm
                                                    outline-none
                                                    sm:text-base
                                                "
                                            />
                                            {
                                                errors.confirmPassword && (
                                                    <p className="mt-2 text-sm text-red-500">
                                                        {errors.confirmPassword.message}
                                                    </p>
                                                )
                                            }
                                        </div>
                                    </div>

                                    {/* BUTTON */}
                                    <Button
                                        type="submit"
                                        className="
                                            w-full
                                            rounded-2xl
                                            bg-[#166b6b]
                                            py-3.5
                                            text-sm
                                            font-semibold
                                            text-white
                                            transition
                                            hover:bg-[#124f4f]
                                            sm:py-4
                                            sm:text-base
                                        "
                                    >
                                        Crear Cuenta
                                    </Button>
                                </form>

                                {/* FOOTER */}
                                <p className="
                                    mt-6
                                    text-center
                                    text-sm
                                    leading-6
                                    text-zinc-500
                                ">
                                    ¿Ya tienes cuenta?{" "}

                                    <button
                                        onClick={() => {
                                            setOpenRegister(false);
                                            setOpenLogin(true);
                                        }}
                                        className="
                                        font-semibold
                                        text-[#166b6b]
                                        hover:underline
                                    ">
                                        Iniciar sesión
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}