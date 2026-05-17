import { getCheckIn, deleteCheckIn } from '@/actions/checkin/checkin'
import { getGroupGuidelines, deleteGroupGuidelines } from '@/actions/group-guidelines/group-guidelines'
import { deleteBilling, getBilling } from '@/actions/billing/billing'
import Link from 'next/link'
import { Eye, Trash2, FileCheck, ClipboardList, Receipt, ClipboardPlus } from 'lucide-react'

export default async function GroupCheckinPage() {

    const checkin = await getCheckIn()
    const groupGuidelines = await getGroupGuidelines()
    const billing = await getBilling()


    const handleDeleteCheckIn = async (formData: FormData) => {
        'use server'
        const id = formData.get('id') as string
        await deleteCheckIn(id)
    }

    const handleDeleteGroupGuidelines = async (formData: FormData) => {
        'use server'
        const id = formData.get('id') as string
        await deleteGroupGuidelines(id)
    }

    const handleDeleteBilling = async (formData: FormData) => {
        'use server'
        const id = formData.get('id') as string
        await deleteBilling(id)
    }


    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* CHECK-IN CARD */}
            {checkin ? (
                <div className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm flex flex-col">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                        <FileCheck size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Check-in Realizado</h3>
                            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                                Completado
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-500">
                            Tu formulario de registro ha sido procesado correctamente.
                        </p>
                    </div>
                    <div className="mt-6 flex gap-3 pt-4 border-t border-zinc-100">
                        <Link
                            href="/dashboard/checkin"
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#166b6b] py-2.5 text-sm font-semibold text-white transition hover:bg-[#124f4f]"
                        >
                            <Eye size={16} />
                            Visualizar
                        </Link>
                        <form action={handleDeleteCheckIn}>
                            <input type="hidden" name="id" value={checkin.id} />
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
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                        <ClipboardList size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Registro de Huésped</h3>
                            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700">
                                Pendiente
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-500">
                            Completa el formulario de registro para iniciar tus prácticas.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/checkin"
                        className="mt-6 flex w-full items-center justify-center rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                        Iniciar Formulario
                    </Link>
                </div>
            )}

            {/* GROUP GUIDELINES CARD */}
            {groupGuidelines ? (
                <div className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm flex flex-col">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                        <FileCheck size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Instructivo Grupal</h3>
                            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                                Completado
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-500">
                            El instructivo de grupo ha sido registrado satisfactoriamente.
                        </p>
                    </div>
                    <div className="mt-6 flex gap-3 pt-4 border-t border-zinc-100">
                        <Link
                            href="/dashboard/group-guidelines"
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#166b6b] py-2.5 text-sm font-semibold text-white transition hover:bg-[#124f4f]"
                        >
                            <Eye size={16} />
                            Visualizar
                        </Link>
                        <form action={handleDeleteGroupGuidelines}>
                            <input type="hidden" name="id" value={groupGuidelines.id} />
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
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                        <ClipboardPlus size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Instructivo Grupal</h3>
                            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700">
                                Pendiente
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-500">
                            Completa el formulario de pautas de grupo para tus prácticas.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/group-guidelines"
                        className="mt-6 flex w-full items-center justify-center rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                        Iniciar Formulario
                    </Link>
                </div>
            )}

            {/* billing */}
            {billing ? (
                <div className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm flex flex-col">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                        <FileCheck size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Factura</h3>
                            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                                Completado
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-500">
                            La factura ha sido registrada satisfactoriamente.
                        </p>
                    </div>
                    <div className="mt-6 flex gap-3 pt-4 border-t border-zinc-100">
                        <Link
                            href="/dashboard/billing"
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#166b6b] py-2.5 text-sm font-semibold text-white transition hover:bg-[#124f4f]"
                        >
                            <Eye size={16} />
                            Visualizar
                        </Link>
                        <form action={handleDeleteBilling}>
                            <input type="hidden" name="id" value={billing.id} />
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
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                        <Receipt size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Factura</h3>
                            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700">
                                Pendiente
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-500">
                            Completa el formulario de factura para tus prácticas.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/billing"
                        className="mt-6 flex w-full items-center justify-center rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                        Iniciar Formulario
                    </Link>
                </div>
            )}

        </div>
    )
}
