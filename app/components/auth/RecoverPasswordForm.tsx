"use client"

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LoaderCircle, ArrowLeft, Mail, Key } from "lucide-react";
import toast from "react-hot-toast";

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
import { sendRecoveryEmail } from "@/actions/auth/auth";
interface RecoverPasswordProps {
    onBack: () => void;
}

const RecoverPasswordForm = ({ onBack }: RecoverPasswordProps) => {
    const [isLoading, setisLoading] = useState<boolean>(false)
    const [isSent, setIsSent] = useState<boolean>(false)

    // ============ Form ============
    const formSchema = z.object({
        email: z.string().email('Por favor ingresa un correo válido.').min(1, {
            message: 'Este campo es requerido'
        }),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: ''
        }
    })

    const { handleSubmit, control } = form;

    // ============ Password Recovery ===========
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setisLoading(true);
        try {
            const res = await sendRecoveryEmail(values.email);
            if (res.success) {
                toast.success(res.message, { duration: 4000 });
                setIsSent(true);
            } else {
                toast.error(res.message || "Error al enviar el correo", { duration: 2500 });
            }
        } catch (e) {
            toast.error("Ocurrió un error inesperado", { duration: 2500 });
        } finally {
            setisLoading(false);
        }
    }

    if (isSent) {
        return (
            <div className="text-center py-10 animate-in fade-in zoom-in duration-300">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#d7eadb] text-[#166b6b]">
                    <Mail size={40} className="animate-bounce" />
                </div>
                <h2 className="text-3xl font-black text-zinc-900 mb-4">¡Correo Enviado!</h2>
                <p className="text-zinc-600 mb-8 leading-relaxed font-medium">
                    Hemos enviado las instrucciones para restablecer tu contraseña a tu bandeja de entrada.
                </p>
                <Button
                    onClick={onBack}
                    className="w-full h-14 rounded-2xl bg-[#166b6b] text-white font-bold transition hover:bg-[#124f4f] shadow-lg shadow-[#166b6b]/20"
                >
                    Volver al inicio
                </Button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* BACK BUTTON */}
            <button
                type="button"
                onClick={onBack}
                className="group mb-8 flex items-center gap-2 text-sm font-bold text-zinc-400 transition hover:text-zinc-900"
            >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 transition group-hover:bg-[#166b6b] group-hover:text-white">
                    <ArrowLeft size={16} />
                </div>
                Volver
            </button>

            {/* HEADER */}
            <div className="mb-10 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#166b6b] text-white shadow-lg shadow-[#166b6b]/20">
                    <Key size={30} />
                </div>
                <h1 className="text-4xl font-black tracking-tight text-zinc-900 mb-2">
                    Recuperar contraseña
                </h1>
                <p className="text-zinc-500 font-medium">
                    Ingresa tu correo electrónico y te enviaremos un enlace seguro para restablecer tu contraseña.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Correo Electrónico</FormLabel>
                                <FormControl>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-[#166b6b]">
                                            <Mail size={18} />
                                        </div>
                                        <Input
                                            {...field}
                                            id="email"
                                            placeholder="ejemplo@correo.com"
                                            type="email"
                                            autoComplete="email"
                                            disabled={isLoading}
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
                                Enviando enlace...
                            </>
                        ) : (
                            "Enviar enlace de recuperación"
                        )}
                    </Button>
                </form>
            </Form>

            <div className="mt-8 text-center">
                <button
                    onClick={onBack}
                    className="text-sm font-bold text-[#166b6b] hover:underline underline-offset-4"
                >
                    Recordé mi contraseña
                </button>
            </div>
        </div>
    );
}

export default RecoverPasswordForm;