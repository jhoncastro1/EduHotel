
'use client'
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Edit,
    Key,
    LogOut,
    Mail,
    Phone,
    User,
    X,
} from 'lucide-react';

import Link from 'next/link';

import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import AccountForm from './AccountForm';
import { getImageUrl, getInitials } from '@/lib/utils';




export interface UserProfileData {
    id: string;
    updated_at: string | null;
    created_at: string | null;
    name: string | null;
    email: string | null;
    avatar_url: string | null;
    phone?: string | null;
}

interface UserProfileProps {
    onEditProfile?: () => void;
    onChangePassword?: () => void;
    onLogout?: () => void;
    className?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({
    onEditProfile,
    onChangePassword,
    onLogout,
    className = ''
}) => {

    //obtener el usuario
    const { user, isLoading, getUserData } = useAuth();

    //state para el perfil
    const [profile, setProfile] = useState<UserProfileData | null>(user as UserProfileData);

    //state para el dialog
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);



    const handleEditClick = () => {
        setIsEditDialogOpen(true);
        if (onEditProfile) onEditProfile();
    };

    //useEffect para actualizar el perfil cuando cambia el usuario
    useEffect(() => {
        setProfile(user as UserProfileData);
    }, [user]);

    if (isLoading) {
        return (
            <Card className={`w-full max-w-md ${className}`}>
                <CardHeader>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!profile) {
        return (
            <Card className={`w-full max-w-md ${className}`}>
                <CardHeader>
                    <CardTitle className="text-xl">Perfil no encontrado</CardTitle>
                    <CardDescription>
                        No se pudo cargar la información del perfil.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            El perfil de usuario no está disponible en este momento.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className={`relative w-full overflow-hidden rounded-[32px] border-none bg-white/95 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-xl ${className}`}>
                <div className="absolute top-0 left-0 w-full h-32 bg-[#166b6b]/10 -z-10" />
                
                <Link href="/dashboard" className="absolute top-6 right-6 z-10">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full bg-white/50 backdrop-blur-sm transition hover:bg-white hover:shadow-md"
                    >
                        <X className="h-5 w-5 text-zinc-600" />
                    </Button>
                </Link>


                <CardContent className="px-8 pb-10 pt-12">
                    {/* Información del usuario */}
                    <div className="flex flex-col items-center">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 rounded-full bg-[#166b6b] blur-lg opacity-20 animate-pulse" />
                            <Avatar className="h-32 w-32 border-4 border-white shadow-2xl relative">
                                {(() => {
                                    let safeAvatarUrl = profile.avatar_url;
                                    if (safeAvatarUrl && safeAvatarUrl.startsWith('{')) {
                                        try {
                                            safeAvatarUrl = JSON.parse(safeAvatarUrl).publicUrl || safeAvatarUrl;
                                        } catch (e) { }
                                    }
                                    return safeAvatarUrl && safeAvatarUrl.startsWith("http") ? (
                                        <Image
                                            src={getImageUrl(safeAvatarUrl)}
                                            alt={profile.name || 'Usuario'}
                                            className="object-cover"
                                            fill
                                            priority
                                        />
                                    ) : (
                                        <AvatarFallback className="text-3xl bg-[#166b6b] text-white">
                                            {getInitials(profile.name)}
                                        </AvatarFallback>
                                    );
                                })()}
                            </Avatar>
                        </div>

                        <div className="text-center space-y-2 mb-10">
                            <h3 className="text-2xl font-black text-zinc-900">
                                {profile.name || 'Usuario sin nombre'}
                            </h3>
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-1.5 text-zinc-600 shadow-sm">
                                    <Mail className="h-4 w-4 text-[#166b6b]" />
                                    <span className="text-sm font-medium">{profile.email || 'Sin email'}</span>
                                </div>
                                {profile.phone && (
                                    <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-1.5 text-zinc-600 shadow-sm">
                                        <Phone className="h-4 w-4 text-[#166b6b]" />
                                        <span className="text-sm font-medium">{profile.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>


                    {/* Acciones del perfil */}
                    <div className="space-y-4">
                        <h4 className="px-2 text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Configuración de Cuenta</h4>

                        <div className="grid gap-3">
                            <Button
                                variant="outline"
                                className="group relative w-full justify-start h-16 rounded-2xl border-zinc-100 bg-white shadow-sm transition-all hover:border-[#166b6b]/30 hover:bg-[#166b6b]/5 hover:shadow-md"
                                onClick={handleEditClick}
                            >
                                <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 transition-colors group-hover:bg-white group-hover:text-[#166b6b]">
                                    <Edit className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold text-zinc-900">Editar perfil</div>
                                    <div className="text-xs text-zinc-500">
                                        Personaliza tu información básica
                                    </div>
                                </div>
                            </Button>


                            <Link href="/update-password">
                                <Button
                                    variant="outline"
                                    className="group relative w-full justify-start h-16 rounded-2xl border-zinc-100 bg-white shadow-sm transition-all hover:border-[#166b6b]/30 hover:bg-[#166b6b]/5 hover:shadow-md"
                                    onClick={onChangePassword}
                                >
                                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 transition-colors group-hover:bg-white group-hover:text-[#166b6b]">
                                        <Key className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-zinc-900">Cambiar contraseña</div>
                                        <div className="text-xs text-zinc-500">
                                            Actualiza tus credenciales de acceso
                                        </div>
                                    </div>
                                </Button>
                            </Link>

                            <form action={'api/auth/signout'} method='POST' className="pt-2">
                                <Button
                                    variant="outline"
                                    className="group relative w-full justify-start h-16 rounded-2xl border-red-100 bg-red-50/30 text-red-600 transition-all hover:bg-red-50 hover:shadow-md"
                                    onClick={onLogout}
                                >
                                    <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-red-100/50 transition-colors group-hover:bg-red-100">
                                        <LogOut className="h-5 w-5" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold">Cerrar sesión</div>
                                        <div className="text-xs text-red-500/70">
                                            Finalizar sesión actual de forma segura
                                        </div>
                                    </div>
                                </Button>
                            </form>
                        </div>
                    </div>

                </CardContent>
            </Card>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-md rounded-[32px] border-none bg-white p-0 overflow-hidden shadow-2xl">
                    <div className="bg-[#166b6b] p-8 text-white relative">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">Editar Perfil</DialogTitle>
                            <DialogDescription className="text-[#d8eceb] font-medium">
                                Actualiza tus datos personales y tu foto de perfil.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="absolute -bottom-6 right-8 w-20 h-20 bg-[#124f4f] rounded-full blur-2xl opacity-50" />
                    </div>
                    <div className="p-8">
                        <AccountForm
                            user={profile}
                            onSuccess={() => { setIsEditDialogOpen(false); getUserData() }}
                        />
                    </div>
                </DialogContent>
            </Dialog>

        </>
    );
};

export default UserProfile;