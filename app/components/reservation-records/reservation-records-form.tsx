"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, User, ShieldCheck, FileDown, CheckCircle2, Loader2, ChevronRight, Phone, Home, Receipt, DollarSign, Users, Award, ClipboardCheck } from "lucide-react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createReservationRecords } from "@/actions/reservation-records/reservation-records"
import toast from "react-hot-toast"

export interface ReservationRecordsFormData {
    full_name: string
    arrival_date: Date | undefined
    address: string
    phone: string
    reservation_name: string
    departure_date: Date | undefined
    room_type: string
    guest_count: number
    deposit: number | undefined
    limit_date: Date | undefined
    amount: number | undefined
    receipt_number: string
    rate: number | undefined
    observations: string
    signed_by: string
    signed_date: Date | undefined
}

interface ReservationRecordsFormProps {
    onSubmit?: (data: ReservationRecordsFormData) => void
    defaultValues?: Partial<ReservationRecordsFormData>
    isLoading?: boolean
    isReadOnly?: boolean
}

const tiposHabitacion = [
    { value: "sencilla", label: "Sencilla (Single Room)" },
    { value: "doble", label: "Doble (Double Room)" },
    { value: "twin", label: "Twin (Dos Camas)" },
    { value: "suite", label: "Suite Presidencial" },
]

export function ReservationRecordsForm({ onSubmit, defaultValues, isLoading: initialLoading = false, isReadOnly = false }: ReservationRecordsFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(initialLoading)
    const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false)
    const [formData, setFormData] = React.useState<ReservationRecordsFormData>({
        full_name: defaultValues?.full_name ?? "",
        arrival_date: defaultValues?.arrival_date ? new Date(defaultValues.arrival_date) : undefined,
        address: defaultValues?.address ?? "",
        phone: defaultValues?.phone ?? "",
        reservation_name: defaultValues?.reservation_name ?? "",
        departure_date: defaultValues?.departure_date ? new Date(defaultValues.departure_date) : undefined,
        room_type: defaultValues?.room_type ?? "",
        guest_count: defaultValues?.guest_count ?? 1,
        deposit: defaultValues?.deposit ? Number(defaultValues.deposit) : undefined,
        limit_date: defaultValues?.limit_date ? new Date(defaultValues.limit_date) : undefined,
        amount: defaultValues?.amount ? Number(defaultValues.amount) : undefined,
        receipt_number: defaultValues?.receipt_number ?? "",
        rate: defaultValues?.rate ? Number(defaultValues.rate) : undefined,
        observations: defaultValues?.observations ?? "",
        signed_by: defaultValues?.signed_by ?? "",
        signed_date: defaultValues?.signed_date ? new Date(defaultValues.signed_date) : undefined,
    })

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true)
        try {
            const loadJsPDF = (): Promise<any> => {
                return new Promise((resolve) => {
                    if ((window as any).jspdf) {
                        resolve((window as any).jspdf.jsPDF)
                        return
                    }
                    const script = document.createElement("script")
                    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
                    script.onload = () => resolve((window as any).jspdf.jsPDF)
                    document.body.appendChild(script)
                })
            }

            const JsPDF = await loadJsPDF()
            const doc = new JsPDF({ unit: "mm", format: "a4", orientation: "portrait" })

            const purple: [number, number, number] = [118, 35, 213] // Matches #7623d5
            const dark: [number, number, number] = [24, 24, 27]
            const gray: [number, number, number] = [113, 113, 122]
            const pageW = 210
            const margin = 18
            const col = pageW - margin * 2
            let y = 18

            const arrivalStr = formData.arrival_date
                ? format(formData.arrival_date, "dd/MM/yyyy", { locale: es })
                : "N/A"
            const departureStr = formData.departure_date
                ? format(formData.departure_date, "dd/MM/yyyy", { locale: es })
                : "N/A"
            const limitStr = formData.limit_date
                ? format(formData.limit_date, "dd/MM/yyyy", { locale: es })
                : "N/A"
            const signedStr = formData.signed_date
                ? format(formData.signed_date, "dd/MM/yyyy", { locale: es })
                : "N/A"

            const roomTypeLabel = tiposHabitacion.find(r => r.value === formData.room_type)?.label || formData.room_type || "N/A"

            // ── HEADER ──────────────────────────────────────────
            doc.setFontSize(26)
            doc.setTextColor(...purple)
            doc.setFont("helvetica", "bold")
            doc.text("EDUHOTEL", margin, y)

            doc.setFontSize(8)
            doc.setTextColor(...gray)
            doc.setFont("helvetica", "normal")
            doc.text("Prácticas Profesionales de Gestión Hotelera", margin, y + 6)

            // Badge derecha
            doc.setFillColor(243, 232, 255)
            doc.roundedRect(pageW - margin - 46, y - 6, 46, 8, 2, 2, "F")
            doc.setFontSize(7)
            doc.setTextColor(...purple)
            doc.setFont("helvetica", "bold")
            doc.text("RESERVA CONFIRMADA", pageW - margin - 23, y - 1.5, { align: "center" })

            doc.setFontSize(9)
            doc.setTextColor(...dark)
            doc.setFont("helvetica", "bold")
            doc.text(`CÓDIGO: ${formData.receipt_number || "S/N"}`, pageW - margin, y + 5, { align: "right" })
            doc.setFont("helvetica", "normal")
            doc.setTextColor(...gray)
            doc.setFontSize(8)
            doc.text(`Fecha Emisión: ${new Date().toLocaleDateString("es-CO")}`, pageW - margin, y + 10, { align: "right" })

            y += 15
            doc.setDrawColor(...purple)
            doc.setLineWidth(0.6)
            doc.line(margin, y, pageW - margin, y)
            y += 8

            // Título central
            doc.setFontSize(13)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...dark)
            doc.text("REGISTRO DE RESERVACIÓN / RESERVATION RECORD", pageW / 2, y, { align: "center" })
            y += 10

            // ── Helpers ──────────────────────────────────────────
            const drawSection = (title: string) => {
                doc.setFontSize(8.5)
                doc.setFont("helvetica", "bold")
                doc.setTextColor(...purple)
                doc.text(title.toUpperCase(), margin, y)
                doc.setDrawColor(...purple)
                doc.setLineWidth(0.3)
                doc.line(margin, y + 1.5, pageW - margin, y + 1.5)
                y += 7
            }

            const drawTwoCol = (
                label1: string, val1: string,
                label2: string, val2: string
            ) => {
                const half = col / 2
                doc.setFontSize(9)
                doc.setFont("helvetica", "bold")
                doc.setTextColor(...gray)
                doc.text(label1, margin, y)
                doc.setFont("helvetica", "normal")
                doc.setTextColor(...dark)
                doc.text(val1 || "—", margin + 38, y)

                doc.setFont("helvetica", "bold")
                doc.setTextColor(...gray)
                doc.text(label2, margin + half + 4, y)
                doc.setFont("helvetica", "normal")
                doc.setTextColor(...dark)
                doc.text(val2 || "—", margin + half + 42, y)
                y += 7.5
            }

            // ── 1. GUEST INFO ────────────────────────────────────
            drawSection("1. Información del Huésped")
            drawTwoCol("Nombre completo:", formData.full_name, "Teléfono:", formData.phone)
            drawTwoCol("Dirección:", formData.address, "Nombre de Reserva:", formData.reservation_name)
            y += 3

            // ── 2. RESERVATION DETAILS ───────────────────────────
            drawSection("2. Detalles de Reservación y Estadía")
            drawTwoCol("Fecha Llegada:", arrivalStr, "Fecha Salida:", departureStr)
            drawTwoCol("Tipo Habitación:", roomTypeLabel, "Cantidad Huéspedes:", String(formData.guest_count))
            y += 3

            // ── 3. BILLING AND DEPOSITS ──────────────────────────
            drawSection("3. Depósitos, Tarifas y Garantías")
            drawTwoCol("Tarifa por Noche:", formData.rate ? `$${formData.rate.toLocaleString("es-CO")} COP` : "No asignada", "Depósito Registrado:", formData.deposit ? `$${formData.deposit.toLocaleString("es-CO")} COP` : "$0 COP")
            drawTwoCol("Fecha Límite Pago:", limitStr, "Número de Recibo:", formData.receipt_number || "N/A")
            drawTwoCol("Total Saldo / Monto:", formData.amount ? `$${formData.amount.toLocaleString("es-CO")} COP` : "$0 COP", "Firma Autorizante:", formData.signed_by || "Pendiente")
            y += 3

            // ── 4. OBSERVATIONS ──────────────────────────────────
            drawSection("4. Observaciones del Registro")
            doc.setFillColor(250, 250, 250)
            doc.setDrawColor(228, 228, 231)
            doc.roundedRect(margin, y, col, 24, 3, 3, "FD")
            doc.setFontSize(8)
            doc.setFont("helvetica", "italic")
            doc.setTextColor(82, 82, 91)
            const obsText = doc.splitTextToSize(formData.observations || "Sin observaciones registradas para esta reserva.", col - 8)
            doc.text(obsText, margin + 4, y + 6)
            y += 30

            // ── FIRMAS ───────────────────────────────────────────
            const sigY = y + 16
            doc.setDrawColor(161, 161, 170)
            doc.setLineWidth(0.4)
            doc.line(margin, sigY, margin + 65, sigY)
            doc.line(pageW - margin - 65, sigY, pageW - margin, sigY)

            doc.setFontSize(9)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...dark)
            doc.text(formData.full_name || "Cliente / Titular", margin + 32, sigY - 3, { align: "center" })
            doc.setFont("helvetica", "normal")
            doc.setFontSize(7.5)
            doc.setTextColor(...gray)
            doc.text("Firma del Titular", margin + 32, sigY + 5, { align: "center" })
            doc.text(formData.signed_by || "Funcionario Autorizado", pageW - margin - 32, sigY - 3, { align: "center" })
            doc.text(`Firma Autorizada (${signedStr})`, pageW - margin - 32, sigY + 5, { align: "center" })
            y = sigY + 16

            // ── FOOTER ───────────────────────────────────────────
            doc.setDrawColor(228, 228, 231)
            doc.setLineWidth(0.3)
            doc.line(margin, y, pageW - margin, y)
            y += 5
            doc.setFontSize(7)
            doc.setTextColor(161, 161, 170)
            doc.setFont("helvetica", "normal")
            doc.text(
                "Documento académico emitido por la plataforma EduHotel para el entrenamiento de procesos de reservación de hotel.",
                pageW / 2, y, { align: "center" }
            )
            doc.text(
                `(c) ${new Date().getFullYear()} EduHotel. Todos los derechos reservados.`,
                pageW / 2, y + 4.5, { align: "center" }
            )

            doc.save(`registro_reserva_${formData.reservation_name.replace(/\s+/g, "_") || "hab"}.pdf`)
            toast.success("Registro de Reservación descargado en PDF exitosamente")
        } catch (error) {
            console.error("Error generating PDF:", error)
            toast.error("Error al generar el PDF de la reservación")
        } finally {
            setIsGeneratingPDF(false)
        }
    }

    const updateField = <K extends keyof ReservationRecordsFormData>(
        field: K,
        value: ReservationRecordsFormData[K]
    ) => {
        if (isReadOnly) return
        setFormData((prev) => {
            const newData = { ...prev, [field]: value }

            // Recalcular saldo total si cambian fechas, tarifas o depósito
            if (
                field === "arrival_date" ||
                field === "departure_date" ||
                field === "rate" ||
                field === "deposit"
            ) {
                const arrival = field === "arrival_date" ? (value as Date | undefined) : prev.arrival_date
                const departure = field === "departure_date" ? (value as Date | undefined) : prev.departure_date
                const rate = field === "rate" ? (value as number | undefined) : prev.rate
                const deposit = field === "deposit" ? (value as number | undefined) : prev.deposit

                if (arrival && departure && rate !== undefined) {
                    const diffTime = departure.getTime() - arrival.getTime()
                    const nights = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
                    const subtotal = rate * nights
                    newData.amount = subtotal - (deposit ?? 0)
                }
            }

            return newData
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isReadOnly) return

        setIsLoading(true)
        try {
            const result = await createReservationRecords(formData)
            if (result.success) {
                router.push("/dashboard")
                router.refresh()
                toast.success("Reservación registrada exitosamente")
            } else {
                toast.error(result.error || "Error al guardar el registro")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error inesperado al guardar el registro")
        } finally {
            setIsLoading(false)
        }
    }

    const inputClasses = cn(
        "transition-all duration-200 focus:ring-2 focus:ring-[#7623d5]/20 focus:border-[#7623d5] h-11 rounded-xl",
        isReadOnly && "bg-zinc-50 border-zinc-200 text-zinc-600 cursor-default opacity-80"
    )

    const sectionCardClasses = "rounded-[32px] border border-zinc-200 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"

    return (
        <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-10">
            {/* Header / Intro */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Registro de Reservación</h1>
                <p className="text-zinc-500 max-w-2xl">
                    Administre la creación de fichas de reservas, montos por estadía, depósitos de garantía y asignación de habitaciones.
                </p>
            </div>

            {/* Información del Huésped */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-purple-50 text-[#7623d5] shadow-sm shadow-[#7623d5]/10">
                            <User className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Información del Huésped</CardTitle>
                            <CardDescription className="text-zinc-500">Datos personales del titular de la reserva</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 p-8 sm:grid-cols-3">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="full_name" className="text-sm font-bold text-zinc-700 ml-1">Nombre Completo</Label>
                        <Input
                            id="full_name"
                            placeholder="Nombre del huésped principal"
                            value={formData.full_name}
                            onChange={(e) => updateField("full_name", e.target.value)}
                            required
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-bold text-zinc-700 ml-1">Teléfono</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                            <Input
                                id="phone"
                                placeholder="+57 300 123 4567"
                                value={formData.phone}
                                onChange={(e) => updateField("phone", e.target.value)}
                                required
                                readOnly={isReadOnly}
                                className={cn(inputClasses, "pl-9")}
                            />
                        </div>
                    </div>
                    <div className="space-y-2 sm:col-span-3">
                        <Label htmlFor="address" className="text-sm font-bold text-zinc-700 ml-1">Dirección de Residencia</Label>
                        <div className="relative">
                            <Home className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                            <Input
                                id="address"
                                placeholder="Calle, número, ciudad, país"
                                value={formData.address}
                                onChange={(e) => updateField("address", e.target.value)}
                                required
                                readOnly={isReadOnly}
                                className={cn(inputClasses, "pl-9")}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Detalles de Reserva */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50">
                            <ClipboardCheck className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Detalles de Reservación</CardTitle>
                            <CardDescription className="text-zinc-500">Asignaciones de habitación y fechas de estadía</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 p-8 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="reservation_name" className="text-sm font-bold text-zinc-700 ml-1">Nombre de la Reserva / Grupo</Label>
                        <Input
                            id="reservation_name"
                            placeholder="Ej: Familia Gómez, Convención Tech"
                            value={formData.reservation_name}
                            onChange={(e) => updateField("reservation_name", e.target.value)}
                            required
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="room_type" className="text-sm font-bold text-zinc-700 ml-1">Tipo de Habitación</Label>
                        <Select
                            disabled={isReadOnly}
                            value={formData.room_type}
                            onValueChange={(value) => updateField("room_type", value)}
                        >
                            <SelectTrigger id="room_type" className={inputClasses}>
                                <SelectValue placeholder="Seleccione Tipo" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-zinc-200 shadow-xl bg-white">
                                {tiposHabitacion.map((tipo) => (
                                    <SelectItem key={tipo.value} value={tipo.value} className="rounded-xl py-2.5 focus:bg-purple-50 focus:text-purple-700">
                                        {tipo.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="guest_count" className="text-sm font-bold text-zinc-700 ml-1">Cantidad de Huéspedes</Label>
                        <div className="relative">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                            <Input
                                id="guest_count"
                                type="number"
                                min={1}
                                value={formData.guest_count}
                                onChange={(e) => updateField("guest_count", parseInt(e.target.value) || 1)}
                                required
                                readOnly={isReadOnly}
                                className={cn(inputClasses, "pl-9")}
                            />
                        </div>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label className="text-sm font-bold text-zinc-700 ml-1">Fecha de Llegada (Arrival Date)</Label>
                        <Popover>
                            <PopoverTrigger asChild disabled={isReadOnly}>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-11 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all",
                                        !formData.arrival_date && "text-muted-foreground",
                                        isReadOnly && "bg-zinc-50 opacity-100"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 size-4 text-[#7623d5]" />
                                    {formData.arrival_date ? (
                                        format(formData.arrival_date, "PPP", { locale: es })
                                    ) : (
                                        <span>Seleccione fecha de entrada</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-2xl border-zinc-200 shadow-2xl overflow-hidden bg-white" align="start">
                                <Calendar
                                    mode="single"
                                    selected={formData.arrival_date}
                                    onSelect={(date) => updateField("arrival_date", date)}
                                    className="p-4"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label className="text-sm font-bold text-zinc-700 ml-1">Fecha de Salida (Departure Date)</Label>
                        <Popover>
                            <PopoverTrigger asChild disabled={isReadOnly}>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-11 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all",
                                        !formData.departure_date && "text-muted-foreground",
                                        isReadOnly && "bg-zinc-50 opacity-100"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 size-4 text-[#7623d5]" />
                                    {formData.departure_date ? (
                                        format(formData.departure_date, "PPP", { locale: es })
                                    ) : (
                                        <span>Seleccione fecha de salida</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-2xl border-zinc-200 shadow-2xl overflow-hidden bg-white" align="start">
                                <Calendar
                                    mode="single"
                                    selected={formData.departure_date}
                                    onSelect={(date) => updateField("departure_date", date)}
                                    disabled={(date) =>
                                        formData.arrival_date ? date < formData.arrival_date : false
                                    }
                                    className="p-4"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>
            </Card>

            {/* Depósitos y Tarifas */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100/50">
                            <DollarSign className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Depósitos, Garantías y Tarifas</CardTitle>
                            <CardDescription className="text-zinc-500">Manejo de tarifas de habitación y abonos realizados</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 p-8 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="rate" className="text-sm font-bold text-zinc-700 ml-1">Tarifa Diaria (por Noche)</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                            <Input
                                id="rate"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.rate ?? ""}
                                onChange={(e) => updateField("rate", e.target.value ? parseFloat(e.target.value) : undefined)}
                                required
                                readOnly={isReadOnly}
                                className={cn(inputClasses, "pl-9")}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="deposit" className="text-sm font-bold text-zinc-700 ml-1">Depósito Realizado (Garantía)</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                            <Input
                                id="deposit"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.deposit ?? ""}
                                onChange={(e) => updateField("deposit", e.target.value ? parseFloat(e.target.value) : undefined)}
                                readOnly={isReadOnly}
                                className={cn(inputClasses, "pl-9")}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="receipt_number" className="text-sm font-bold text-zinc-700 ml-1">Número de Recibo (Depósito)</Label>
                        <div className="relative">
                            <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                            <Input
                                id="receipt_number"
                                placeholder="Ej: REC-49204"
                                value={formData.receipt_number}
                                onChange={(e) => updateField("receipt_number", e.target.value)}
                                readOnly={isReadOnly}
                                className={cn(inputClasses, "pl-9")}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-zinc-700 ml-1">Fecha Límite de Depósito</Label>
                        <Popover>
                            <PopoverTrigger asChild disabled={isReadOnly}>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-11 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all",
                                        !formData.limit_date && "text-muted-foreground",
                                        isReadOnly && "bg-zinc-50 opacity-100"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 size-4 text-[#7623d5]" />
                                    {formData.limit_date ? (
                                        format(formData.limit_date, "PPP", { locale: es })
                                    ) : (
                                        <span>Seleccione fecha limite</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-2xl border-zinc-200 shadow-2xl overflow-hidden bg-white" align="start">
                                <Calendar
                                    mode="single"
                                    selected={formData.limit_date}
                                    onSelect={(date) => updateField("limit_date", date)}
                                    className="p-4"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="sm:col-span-2 rounded-[24px] bg-[#7623d5]/5 border border-[#7623d5]/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm shadow-[#7623d5]/5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#7623d5] text-white shadow-md shadow-[#7623d5]/20">
                                <DollarSign className="size-5" />
                            </div>
                            <div className="text-center sm:text-left">
                                <span className="text-base font-bold text-zinc-800">Saldo Neto a Pagar</span>
                                <p className="text-xs text-zinc-500">Calculado: (Tarifa * Noches) - Depósito.</p>
                            </div>
                        </div>
                        <span className="text-3xl font-black tracking-tight text-[#7623d5]">
                            ${(formData.amount ?? 0).toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Observaciones y firmas */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-amber-50 text-amber-600 shadow-sm shadow-amber-100/50">
                            <ShieldCheck className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Observaciones y Firmas</CardTitle>
                            <CardDescription className="text-zinc-500">Notas de reserva y control de firmas</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                    <div className="space-y-2">
                        <Label htmlFor="observations" className="text-sm font-bold text-zinc-700 ml-1">Observaciones Especiales</Label>
                        <Textarea
                            id="observations"
                            placeholder="Notas de solicitudes adicionales, alérgenos, accesibilidad..."
                            value={formData.observations}
                            onChange={(e) => updateField("observations", e.target.value)}
                            className={cn("min-h-[100px] resize-none rounded-2xl", inputClasses)}
                            readOnly={isReadOnly}
                        />
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="signed_by" className="text-sm font-bold text-zinc-700 ml-1">Firmado por (Funcionario)</Label>
                            <Input
                                id="signed_by"
                                placeholder="Nombre de quien registra/firma"
                                value={formData.signed_by}
                                onChange={(e) => updateField("signed_by", e.target.value)}
                                required
                                readOnly={isReadOnly}
                                className={inputClasses}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-zinc-700 ml-1">Fecha de Firma</Label>
                            <Popover>
                                <PopoverTrigger asChild disabled={isReadOnly}>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal h-11 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all",
                                            !formData.signed_date && "text-muted-foreground",
                                            isReadOnly && "bg-zinc-50 opacity-100"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 size-4 text-[#7623d5]" />
                                        {formData.signed_date ? (
                                            format(formData.signed_date, "PPP", { locale: es })
                                        ) : (
                                            <span>Seleccione fecha de firma</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 rounded-2xl border-zinc-200 shadow-2xl overflow-hidden bg-white" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={formData.signed_date}
                                        onSelect={(date) => updateField("signed_date", date)}
                                        className="p-4"
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {formData.signed_by && (
                        <div className="p-6 rounded-[24px] border border-dashed border-[#7623d5]/30 bg-[#7623d5]/5 flex flex-col sm:flex-row items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-[#7623d5] text-white flex items-center justify-center shadow-md">
                                <Award className="size-6" />
                            </div>
                            <div>
                                <span className="text-sm font-black text-zinc-800 uppercase tracking-wider block">Validación del Operador Recepcionista</span>
                                <span className="text-xs text-zinc-500 block mt-0.5">
                                    Esta reserva se encuentra autorizada bajo la firma digital del funcionario: <b className="text-zinc-700">{formData.signed_by || "—"}</b> en fecha <span className="font-mono text-zinc-700">{formData.signed_date ? format(formData.signed_date, "dd/MM/yyyy") : "—"}</span>.
                                </span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Acciones */}
            <div className="flex justify-end gap-4 pt-4">
                {!isReadOnly ? (
                    <>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            className="rounded-[16px] px-8 h-12 font-bold border-zinc-200 hover:bg-zinc-50 text-zinc-600 transition-all active:scale-95"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="rounded-[16px] px-10 h-12 font-bold bg-[#7623d5] hover:bg-[#5b19aa] text-white shadow-xl shadow-[#7623d5]/30 transition-all active:scale-95 hover:translate-y-[-2px]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    Confirmar Reservación
                                    <ChevronRight className="ml-2 size-4" />
                                </>
                            )}
                        </Button>
                    </>
                ) : (
                    <>
                        <Button
                            type="button"
                            onClick={handleDownloadPDF}
                            disabled={isGeneratingPDF}
                            className="rounded-[16px] px-8 h-12 font-bold border-[#7623d5] text-[#7623d5] bg-white hover:bg-zinc-50 transition-all active:scale-95 flex items-center gap-2"
                        >
                            {isGeneratingPDF ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Generando PDF...
                                </>
                            ) : (
                                <>
                                    <FileDown className="h-5 w-5" />
                                    Descargar Reserva PDF
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => router.push("/dashboard")}
                            className="rounded-[16px] px-10 h-12 font-bold bg-[#7623d5] hover:bg-[#5b19aa] text-white shadow-xl shadow-[#7623d5]/30 transition-all active:scale-95 hover:translate-y-[-2px]"
                        >
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Reserva Registrada
                        </Button>
                    </>
                )}
            </div>
        </form>
    )
}
