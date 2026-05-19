import { getExitPass, deleteExitPass } from '@/actions/exit-pass/exit-pass'
import Link from 'next/link'
import { Eye, Trash2, FileCheck, ClipboardList, LogOut, Key } from 'lucide-react'

export default async function GroupCheckoutPage() {
    const exitPass = await getExitPass()

    const handleDeleteExitPass = async (formData: FormData) => {
        'use server'
        const id = formData.get('id') as string
        await deleteExitPass(id)
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* PASE DE SALIDA CARD */}
            {exitPass ? (
                <div className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm flex flex-col">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                        <FileCheck size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Pase de Salida Emitido</h3>
                            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                                Completado
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-500">
                            Pase de Salida registrado para la habitación <b>{exitPass.room_number}</b>. Llaves recibidas y caja cerrada.
                        </p>
                    </div>
                    <div className="mt-6 flex gap-3 pt-4 border-t border-zinc-100">
                        <Link
                            href="/dashboard/exit-pass"
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#166b6b] py-2.5 text-sm font-semibold text-white transition hover:bg-[#124f4f]"
                        >
                            <Eye size={16} />
                            Visualizar
                        </Link>
                        <form action={handleDeleteExitPass}>
                            <input type="hidden" name="id" value={exitPass.id} />
                            <button
                                type="submit"
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                                title="Eliminar registro"
                            >
                                <Trash2 size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm flex flex-col">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                        <Key size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Control de Pase de Salida</h3>
                            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700">
                                Pendiente
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-500">
                            Complete el control de entrega de llaves y validación de caja del huésped para su salida.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/exit-pass"
                        className="mt-6 flex w-full items-center justify-center rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                        Iniciar Formulario
                    </Link>
                </div>
            )}
        </div>
    )
}
