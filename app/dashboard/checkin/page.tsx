import { HotelRegisterForm } from "@/app/components/checkin/hotel-register-form"
import { getCheckIn } from "@/actions/checkin/checkin"
import { redirect } from "next/navigation"
import { getUser } from "@/actions/auth/get-user"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function CheckInPage() {
    const user = await getUser()
    if (!user) redirect("/")

    const checkin = await getCheckIn()

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <Link 
                        href="/dashboard" 
                        className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-[#166b6b] transition-colors mb-2"
                    >
                        <ArrowLeft size={16} />
                        Volver al Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
                        {checkin ? "Registro de Huésped Completado" : "Registro de Huésped"}
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        {checkin 
                            ? "Visualice los datos registrados en el sistema." 
                            : "Complete el formulario para registrar un nuevo huésped en el hotel."}
                    </p>
                </div>
            </div>

            <HotelRegisterForm 
                defaultValues={checkin || undefined} 
                isReadOnly={!!checkin} 
            />
        </div>
    )
}
