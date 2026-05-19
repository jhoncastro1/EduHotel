import { getReservationRecords, deleteReservationRecords } from '@/actions/reservation-records/reservation-records'
import { getReservationRacks, deleteReservationRacks } from '@/actions/reservation-racks/reservation-racks'
import Link from 'next/link'
import { Eye, Trash2, FileCheck, CalendarCheck, Layers } from 'lucide-react'

export default async function GroupReservationPage() {
    const reservation = await getReservationRecords()
    const rack = await getReservationRacks()

    const handleDeleteReservationRecords = async (formData: FormData) => {
        'use server'
        const id = formData.get('id') as string
        await deleteReservationRecords(id)
    }

    const handleDeleteReservationRacks = async (formData: FormData) => {
        'use server'
        const id = formData.get('id') as string
        await deleteReservationRacks(id)
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* RESERVATION RECORDS CARD */}
            {reservation ? (
                <div className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm flex flex-col">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                        <FileCheck size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Reserva Confirmada</h3>
                            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                                Completado
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-500">
                            Ficha de reserva registrada para <b>{reservation.reservation_name}</b>. Saldo y firma del funcionario validados.
                        </p>
                    </div>
                    <div className="mt-6 flex gap-3 pt-4 border-t border-zinc-100">
                        <Link
                            href="/dashboard/reservation-records"
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#166b6b] py-2.5 text-sm font-semibold text-white transition hover:bg-[#124f4f]"
                        >
                            <Eye size={16} />
                            Visualizar
                        </Link>
                        <form action={handleDeleteReservationRecords}>
                            <input type="hidden" name="id" value={reservation.id} />
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
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                        <CalendarCheck size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Ficha de Reservación</h3>
                            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700">
                                Pendiente
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-500">
                            Cree la ficha de reserva general, registre tarifas, depósitos de garantía y asigne habitaciones.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/reservation-records"
                        className="mt-6 flex w-full items-center justify-center rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                        Iniciar Formulario
                    </Link>
                </div>
            )}

            {/* RESERVATION RACKS CARD */}
            {rack ? (
                <div className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm flex flex-col">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                        <FileCheck size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Rack de Reservas Activo</h3>
                            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                                Completado
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-500">
                            Matriz Whitney bloqueada para <b>{rack.company_name}</b> con <b>{rack.total_rooms}</b> habitaciones reservadas.
                        </p>
                    </div>
                    <div className="mt-6 flex gap-3 pt-4 border-t border-zinc-100">
                        <Link
                            href="/dashboard/reservation-racks"
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#166b6b] py-2.5 text-sm font-semibold text-white transition hover:bg-[#124f4f]"
                        >
                            <Eye size={16} />
                            Visualizar
                        </Link>
                        <form action={handleDeleteReservationRacks}>
                            <input type="hidden" name="id" value={rack.id} />
                            <button
                                type="submit"
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-100"
                                title="Eliminar rack"
                            >
                                <Trash2 size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="rounded-[24px] border border-zinc-200 bg-white p-6 shadow-sm flex flex-col">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                        <Layers size={24} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold">Rack de Reservaciones</h3>
                            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700">
                                Pendiente
                            </span>
                        </div>
                        <p className="mt-2 text-sm text-zinc-500">
                            Bloquee habitaciones día a día para convenios y delegaciones con la cuadrícula de ocupación Whitney.
                        </p>
                    </div>
                    <Link
                        href="/dashboard/reservation-racks"
                        className="mt-6 flex w-full items-center justify-center rounded-xl bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                        Iniciar Formulario
                    </Link>
                </div>
            )}
        </div>
    )
}
