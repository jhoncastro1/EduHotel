"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoaderCircle, Lock, ShieldCheck, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { updatePassword } from "@/actions/auth/auth";

const UpdatePasswordForm = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isSuccess, setIsSuccess] = useState<boolean>(false)
    const router = useRouter();

    const formSchema = z.object({
        password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
        confirmPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
    }).refine((data) => data.password === data.confirmPassword, {
        message: "Las contraseñas no coinciden",
        path: ["confirmPassword"],
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: '',
            confirmPassword: ''
        }
    })

    const { handleSubmit, control } = form;

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        setIsLoading(true);
        try {
            const res = await updatePassword({ password: data.password });
            if (res.success) {
                toast.success(res.message, { duration: 2500 });
                setIsSuccess(true);
                setTimeout(() => {
                    router.push('/dashboard');
                }, 3000);
            } else {
                toast.error(res.message || "Error al actualizar la contraseña", { duration: 2500 });
            }
        } catch (error: any) {
            toast.error("Ocurrió un error inesperado", { duration: 2500 });
        } finally {
            setIsLoading(false);
        }
    }

    if (isSuccess) {
        return (
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                <div className="relative overflow-hidden rounded-[32px] bg-white/95 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-xl text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#d7eadb] text-[#166b6b]">
                        <CheckCircle2 size={40} className="animate-bounce" />
                    </div>
                    <h2 className="text-3xl font-black text-zinc-900 mb-4">¡Éxito!</h2>
                    <p className="text-zinc-600 mb-8 leading-relaxed font-medium">
                        Tu contraseña ha sido actualizada correctamente. Te redirigiremos al dashboard en unos segundos.
                    </p>
                    <Button 
                        onClick={() => router.push('/dashboard')}
                        className="w-full h-14 rounded-2xl bg-[#166b6b] text-white font-bold transition hover:bg-[#124f4f] shadow-lg shadow-[#166b6b]/20"
                    >
                        Ir al dashboard ahora
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
            <div className="relative overflow-hidden rounded-[32px] bg-white/95 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-xl">
                <div className="mb-10 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#166b6b] text-white shadow-lg shadow-[#166b6b]/20">
                        <Lock size={30} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 mb-2">
                        Nueva Contraseña
                    </h1>
                    <p className="text-zinc-500 font-medium">
                        Establece una nueva contraseña segura para tu cuenta.
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Nueva Contraseña</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#166b6b] transition-colors">
                                                <ShieldCheck size={18} />
                                            </div>
                                            <Input
                                                {...field}
                                                id="password"
                                                type="password"
                                                autoComplete="new-password"
                                                disabled={isLoading}
                                                placeholder="••••••••"
                                                className="h-14 rounded-2xl border-zinc-200 bg-zinc-50/50 pl-12 focus:border-[#166b6b] focus:ring-[#166b6b]/10 transition-all"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Confirmar Contraseña</FormLabel>
                                    <FormControl>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-[#166b6b] transition-colors">
                                                <ShieldCheck size={18} />
                                            </div>
                                            <Input
                                                {...field}
                                                id="confirmPassword"
                                                type="password"
                                                autoComplete="new-password"
                                                disabled={isLoading}
                                                placeholder="••••••••"
                                                className="h-14 rounded-2xl border-zinc-200 bg-zinc-50/50 pl-12 focus:border-[#166b6b] focus:ring-[#166b6b]/10 transition-all"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />

                        <Button 
                            className="w-full h-14 rounded-2xl bg-[#166b6b] text-lg font-bold shadow-lg shadow-[#166b6b]/20 transition-all hover:bg-[#124f4f] hover:shadow-xl active:scale-[0.98] disabled:opacity-70" 
                            type="submit" 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                                    Actualizando...
                                </>
                            ) : (
                                "Actualizar Contraseña"
                            )}
                        </Button>

                        <div className="text-center pt-2">
                            <Link href="/profile" className="text-sm font-bold text-[#166b6b] hover:underline underline-offset-4">
                                Volver al perfil
                            </Link>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}

export default UpdatePasswordForm;