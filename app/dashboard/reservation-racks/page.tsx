import { ReservationRacksForm } from '@/app/components/reservation-racks/reservation-racks-form'
import { getReservationRacks } from '@/actions/reservation-racks/reservation-racks'
import { getUser } from '@/actions/auth/get-user'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ReservationRacksPage() {
    const session = await getUser();
    if (!session) redirect("/");

    const rackData = await getReservationRacks()

    return (
        <div className="min-h-screen bg-zinc-50/50 p-4 sm:p-8">
            <div className="mx-auto max-w-7xl">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-[#7623d5] transition-colors mb-4"
                >
                    <ArrowLeft size={16} />
                    Volver al Dashboard
                </Link>
                <ReservationRacksForm
                    defaultValues={rackData || undefined}
                    isReadOnly={!!rackData}
                />
            </div>
        </div>
    )
}
