'use client'

import { useState, useEffect } from 'react'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CircleUserRound, Loader2, LoaderCircle, Pencil } from "lucide-react"
import toast from 'react-hot-toast'

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Label } from "@/components/ui/label"
import Image from 'next/image'
import PhoneInput from '@/components/ui/PhoneInput'



import { getImageUrl } from '@/lib/utils'
import { updateAvatar } from '@/actions/auth/update-avatar'
import { updateProfile } from '@/actions/auth/update-profile'
import { Input } from '@/components/ui/input'



const profileSchema = z.object({
    name: z.string().min(2, {
        message: "El nombre debe tener al menos 2 caracteres.",
    }),
    email: z.email().optional(),
    avatar_url: z.string().nullable().optional(),
    phone: z.string().optional().nullable(),
    country_code: z.string().optional().nullable(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function AccountForm({
    user,
    onSuccess
}: {
    user: any;
    onSuccess?: () => void
}) {

    const [loading, setLoading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || null)
    const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            avatar_url: user?.avatar_url || null,
            phone: user?.phone || '',
            country_code: user?.country_code || 'CO',
        },
    })

    useEffect(() => {
        if (user) {
            form.reset({
                name: user.name || '',
                email: user.email || '',
                avatar_url: user.avatar_url || null,
                phone: user.phone || '',
                country_code: user.country_code || 'VE',
            })
            setAvatarUrl(user.avatar_url || null)
        }
    }, [user, form])

    async function onSubmit(values: ProfileFormValues) {
        try {
            setLoading(true)

            const res = await updateProfile({
                id: user.id,
                name: values.name,
                phone: values.phone || '',
                country_code: values.country_code || 'CO',
            })

            if (res.error) {
                toast.error(res.error)
                return
            }

            toast.success('Perfil actualizado correctamente')

            if (onSuccess) onSuccess()
        } catch (error) {
            toast.error('Hubo un error al actualizar el perfil.')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // ======== Choose a profile image ========
    const chooseImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]

        if (!file) return

        // Validar tipo de archivo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (!validTypes.includes(file.type)) {
            toast.error('Formato no válido. Use JPG, PNG o WebP.')
            return
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('La imagen es muy grande. Máximo 5MB.')
            return
        }
        setIsLoadingImage(true)

        try {

            const formData = new FormData()
            formData.append('avatar', file)
            formData.append('userId', user.id)

            const response = await updateAvatar(formData)

            if (response.publicUrl) {
                setAvatarUrl(response.publicUrl)
                toast.success('Avatar actualizado correctamente')
                if (onSuccess) onSuccess()
            }

        } catch (error: any) {
            console.error('Error al actualizar avatar:', error)
            toast.error(error.message || 'Error al actualizar el avatar', { duration: 2500 })
        } finally {
            setIsLoadingImage(false)
            // Limpiar el input file
            event.target.value = ''
        }
    }



    return (
        <div className="space-y-8">
            {/* Avatar section */}
            <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative group">
                    <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-[#166b6b]/10 shadow-inner relative bg-zinc-50">
                        {isLoadingImage ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm z-10">
                                <LoaderCircle className="w-8 h-8 animate-spin text-[#166b6b]" />
                            </div>
                        ) : null}

                        {(() => {
                            let safeAvatarUrl = avatarUrl;
                            if (safeAvatarUrl && safeAvatarUrl.startsWith('{')) {
                                try {
                                    safeAvatarUrl = JSON.parse(safeAvatarUrl).publicUrl || safeAvatarUrl;
                                } catch (e) { }
                            }

                            return safeAvatarUrl ? (
                                <Image
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    src={getImageUrl(safeAvatarUrl)}
                                    fill
                                    alt="user-img"
                                    onError={() => setAvatarUrl('')}
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-zinc-300">
                                    <CircleUserRound className="w-20 h-20" />
                                </div>
                            );
                        })()}
                    </div>

                    <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-1 right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#166b6b] text-white shadow-lg transition-all hover:scale-110 hover:bg-[#124f4f] active:scale-95"
                    >
                        <input
                            id="avatar-upload"
                            type="file"
                            className="hidden"
                            accept="image/png, image/webp, image/jpeg, image/jpg"
                            onChange={chooseImage}
                            disabled={isLoadingImage}
                        />
                        <Pencil className="h-4 w-4" />
                    </label>
                </div>
                <p className="text-xs font-medium text-zinc-400">JPG, PNG o WebP. Máximo 5MB.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid gap-5">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Correo Electrónico</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                disabled
                                                className="h-12 rounded-xl bg-zinc-50 border-zinc-200 text-zinc-500 cursor-not-allowed pr-10"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300">
                                                <CircleUserRound size={18} />
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Nombre Completo</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Tu nombre"
                                            {...field}
                                            className="h-12 rounded-xl border-zinc-200 focus:border-[#166b6b] focus:ring-[#166b6b]/10 transition-all"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Número de Teléfono</FormLabel>
                                    <FormControl>
                                        <PhoneInput
                                            defaultCountryCode={form.getValues('country_code') || 'CO'}
                                            value={field.value || ''}
                                            onChange={field.onChange}
                                            onCountryChange={(country) => {
                                                form.setValue('country_code', country.code)
                                            }}
                                            placeholder="Número de teléfono"
                                            className="h-12"
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            className="w-full h-14 rounded-2xl bg-[#166b6b] text-base font-bold shadow-lg shadow-[#166b6b]/20 transition-all hover:bg-[#124f4f] hover:shadow-xl active:scale-[0.98] disabled:opacity-70"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Guardando cambios...
                                </>
                            ) : (
                                'Actualizar Perfil'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
