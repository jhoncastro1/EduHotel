import { ReservationRecordsForm } from '@/app/components/reservation-records/reservation-records-form'
import { getReservationRecords } from '@/actions/reservation-records/reservation-records'
import { getUser } from '@/actions/auth/get-user'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ReservationRecordsPage() {
    const session = await getUser();
    if (!session) redirect("/");

    const reservation = await getReservationRecords()

    return (
        <div className="min-h-screen bg-zinc-50/50 p-4 sm:p-8">
            <div className="mx-auto max-w-5xl">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-[#7623d5] transition-colors mb-4"
                >
                    <ArrowLeft size={16} />
                    Volver al Dashboard
                </Link>
                <ReservationRecordsForm
                    defaultValues={reservation || undefined}
                    isReadOnly={!!reservation}
                />
            </div>
        </div>
    )
}
