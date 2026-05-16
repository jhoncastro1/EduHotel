import { getUser } from '@/actions/auth/get-user'
import { signout } from '@/actions/auth/auth'
import { redirect } from 'next/navigation'
import { LogOut, User as UserIcon, LayoutDashboard, Settings, Bell } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getImageUrl, getInitials } from '@/lib/utils'


export default async function DashboardPage() {
    const user = await getUser()

    if (!user) {
        redirect('/')
    }

    const handleSignOut = async () => {
        'use server'
        await signout()
        redirect('/')
    }

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* TOP BAR */}
            <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#166b6b] text-white">
                            <LayoutDashboard size={22} />
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-zinc-900">EduHotel</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100" href="/profile">
                            <Settings size={20} />
                        </Link>
                        <div className="h-8 w-px bg-zinc-200 mx-1" />
                        <form action={handleSignOut}>
                            <button
                                type="submit"
                                className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                            >
                                <LogOut size={16} />
                                <span className="hidden sm:inline">Cerrar sesión</span>
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* WELCOME */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-6 animate-in fade-in slide-in-from-left duration-700">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-[#166b6b] blur-md opacity-20 animate-pulse" />
                        <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-xl bg-zinc-100 flex items-center justify-center">
                            {user.avatar_url ? (
                                <Image
                                    src={getImageUrl(user.avatar_url)}
                                    alt={user.name || 'Usuario'}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <span className="text-2xl font-bold text-[#166b6b]">
                                    {getInitials(user.name)}
                                </span>
                            )}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
                            ¡Bienvenido, {user.name.split(' ')[0]}!
                        </h2>
                        <p className="mt-1 text-zinc-600 font-medium">
                            Aquí tienes un resumen de tus actividades y procesos hoteleros.
                        </p>
                    </div>
                </div>

                {/* DASHBOARD GRID */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* PROFILE CARD */}
                    <div className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <UserIcon size={24} />
                        </div>
                        <h3 className="text-lg font-bold">Mi Perfil</h3>
                        <p className="mt-2 text-sm text-zinc-500">
                            Gestiona tu información personal y preferencias del sistema.
                        </p>
                        <div className="mt-6 border-t border-zinc-100 pt-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-medium text-zinc-400 uppercase">Email</span>
                                <span className="text-sm font-semibold">{user.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* STATUS CARD */}
                    <div className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d7eadb] text-[#3f6f4a]">
                            <LayoutDashboard size={24} />
                        </div>
                        <h3 className="text-lg font-bold">Estado Académico</h3>
                        <p className="mt-2 text-sm text-zinc-500">
                            Actualmente te encuentras activo en los módulos de hotelería.
                        </p>
                        <button className="mt-6 w-full rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800">
                            Ver progresos
                        </button>
                    </div>

                    {/* PLACEHOLDER CARD */}
                    <div className="rounded-[24px] border border-dashed border-zinc-300 bg-zinc-50/50 p-6 flex flex-col items-center justify-center text-center">
                        <div className="mb-3 rounded-full bg-zinc-100 p-3">
                            <Settings size={24} className="text-zinc-400" />
                        </div>
                        <p className="text-sm font-medium text-zinc-500">Más módulos próximamente</p>
                    </div>
                </div>
            </main>
        </div>
    )
}
