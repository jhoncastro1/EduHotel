"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Loader2, ChevronRight, FileDown, CheckCircle2, Building2, Key, Info, HelpCircle, Layers } from "lucide-react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createReservationRacks, ReservationRacksFormData, RackItemData } from "@/actions/reservation-racks/reservation-racks"
import toast from "react-hot-toast"

interface ReservationRacksFormProps {
    onSubmit?: (data: ReservationRacksFormData) => void
    defaultValues?: Partial<ReservationRacksFormData & { items?: any[] }>
    isLoading?: boolean
    isReadOnly?: boolean
}

const meses = [
    { value: "Enero", label: "Enero" },
    { value: "Febrero", label: "Febrero" },
    { value: "Marzo", label: "Marzo" },
    { value: "Abril", label: "Abril" },
    { value: "Mayo", label: "Mayo" },
    { value: "Junio", label: "Junio" },
    { value: "Julio", label: "Julio" },
    { value: "Agosto", label: "Agosto" },
    { value: "Septiembre", label: "Septiembre" },
    { value: "Octubre", label: "Octubre" },
    { value: "Noviembre", label: "Noviembre" },
    { value: "Diciembre", label: "Diciembre" },
]

const habitacionesDefecto = [
    "Hab 101", "Hab 102", "Hab 103", "Hab 104", "Hab 105",
    "Hab 201", "Hab 202", "Hab 203", "Hab 204", "Hab 205"
]

export function ReservationRacksForm({ onSubmit, defaultValues, isLoading: initialLoading = false, isReadOnly = false }: ReservationRacksFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(initialLoading)
    const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false)

    // Datos generales
    const [companyName, setCompanyName] = React.useState(defaultValues?.company_name ?? "")
    const [selectedMonth, setSelectedMonth] = React.useState<string>(() => {
        if (defaultValues?.items && defaultValues.items.length > 0) {
            return defaultValues.items[0].month_name
        }
        const currentMonthName = format(new Date(), "MMMM", { locale: es })
        return currentMonthName.charAt(0).toUpperCase() + currentMonthName.slice(1)
    })

    // Grid de reservas cargadas
    const [reservedCells, setReservedCells] = React.useState<Set<string>>(() => {
        const set = new Set<string>()
        if (defaultValues?.items) {
            defaultValues.items.forEach((item: any) => {
                set.add(`${item.room_number}_${item.day_number}`)
            })
        }
        return set
    })

    // Cantidad de días en el mes seleccionado (1 a 30 por simplificación de grid estándar de Whitney)
    const totalDays = 30
    const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1)

    const toggleCell = (room: string, day: number) => {
        if (isReadOnly) return
        setReservedCells((prev) => {
            const next = new Set(prev)
            const key = `${room}_${day}`
            if (next.has(key)) {
                next.delete(key)
            } else {
                next.add(key)
            }
            return next
        })
    }

    const clearAllCells = () => {
        if (isReadOnly) return
        setReservedCells(new Set())
    }

    // Estadísticas calculadas en tiempo real
    const occupiedCellsCount = reservedCells.size
    const uniqueRoomsOccupied = React.useMemo(() => {
        const rooms = new Set<string>()
        reservedCells.forEach(cell => {
            const [room] = cell.split("_")
            rooms.add(room)
        })
        return rooms.size
    }, [reservedCells])

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
            const doc = new JsPDF({ unit: "mm", format: "a4", orientation: "landscape" }) // Landscape for grids!

            const purple: [number, number, number] = [118, 35, 213]
            const dark: [number, number, number] = [24, 24, 27]
            const gray: [number, number, number] = [113, 113, 122]
            const pageW = 297
            const pageH = 210
            const margin = 12
            let y = 16

            // ── HEADER ──────────────────────────────────────────
            doc.setFontSize(22)
            doc.setTextColor(...purple)
            doc.setFont("helvetica", "bold")
            doc.text("EDUHOTEL", margin, y)

            doc.setFontSize(8)
            doc.setTextColor(...gray)
            doc.setFont("helvetica", "normal")
            doc.text("Prácticas Profesionales de Gestión Hotelera", margin, y + 5)

            // Badge derecha
            doc.setFillColor(243, 232, 255)
            doc.roundedRect(pageW - margin - 50, y - 5, 50, 8, 2, 2, "F")
            doc.setFontSize(8)
            doc.setTextColor(...purple)
            doc.setFont("helvetica", "bold")
            doc.text("RACK DE HABITACIONES OK", pageW - margin - 25, y - 0.5, { align: "center" })

            doc.setFontSize(9)
            doc.setTextColor(...dark)
            doc.text(`Empresa: ${companyName || "N/A"}`, pageW - margin, y + 8, { align: "right" })
            doc.setFontSize(8)
            doc.setTextColor(...gray)
            doc.text(`Mes: ${selectedMonth} - Fecha: ${new Date().toLocaleDateString("es-CO")}`, pageW - margin, y + 13, { align: "right" })

            y += 18
            doc.setDrawColor(...purple)
            doc.setLineWidth(0.6)
            doc.line(margin, y, pageW - margin, y)
            y += 8

            // Título central
            doc.setFontSize(12)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...dark)
            doc.text(`CONTROL DE RACK DE RESERVACIONES - WHITNEY GRID (${selectedMonth.toUpperCase()})`, pageW / 2, y, { align: "center" })
            y += 8

            // Estadísticas resumidas
            doc.setFontSize(8.5)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...gray)
            doc.text(`Capacidad Total: ${habitacionesDefecto.length} habs | Habs Reservadas: ${uniqueRoomsOccupied} | Ocupación acumulada: ${occupiedCellsCount} noches`, margin, y)
            y += 6

            // ── DIBUJAR MATRIZ GRID DE WHITNEY ────────────────────
            const gridX = margin
            const gridY = y
            const cellW = 8.1 // Fits 30 cells inside 273mm printable area
            const cellH = 10
            const rowHeaderW = 20

            // Dibujar fila de cabecera de días
            doc.setFillColor(243, 232, 255)
            doc.rect(gridX, gridY, rowHeaderW, cellH, "F")
            doc.setFontSize(8)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...purple)
            doc.text("Habitación", gridX + 3, gridY + 6.5)

            // Días cabecera
            for (let d = 1; d <= 30; d++) {
                const cx = gridX + rowHeaderW + (d - 1) * cellW
                doc.rect(cx, gridY, cellW, cellH)
                doc.text(String(d), cx + 2.5, gridY + 6.5)
            }

            // Dibujar filas de habitaciones y celdas
            for (let r = 0; r < habitacionesDefecto.length; r++) {
                const ry = gridY + cellH + r * cellH
                const room = habitacionesDefecto[r]

                // Cabecera Hab
                doc.setFillColor(250, 250, 250)
                doc.rect(gridX, ry, rowHeaderW, cellH, "F")
                doc.setDrawColor(228, 228, 231)
                doc.rect(gridX, ry, rowHeaderW, cellH)
                doc.setFont("helvetica", "bold")
                doc.setTextColor(...dark)
                doc.text(room, gridX + 4, ry + 6.5)

                // Celdas ocupadas
                for (let d = 1; d <= 30; d++) {
                    const cx = gridX + rowHeaderW + (d - 1) * cellW
                    const key = `${room}_${d}`
                    const isReserved = reservedCells.has(key)

                    if (isReserved) {
                        doc.setFillColor(118, 35, 213) // Purple HSL
                        doc.rect(cx, ry, cellW, cellH, "F")
                        doc.setFont("helvetica", "bold")
                        doc.setTextColor(255, 255, 255)
                        doc.text("X", cx + 2.8, ry + 6.5)
                    } else {
                        doc.rect(cx, ry, cellW, cellH)
                    }
                }
            }

            // Leyendas y firmas
            y = gridY + cellH + habitacionesDefecto.length * cellH + 12
            doc.setFontSize(8)
            doc.setFont("helvetica", "normal")
            doc.setTextColor(...gray)
            doc.text("Simbología: [ X ] Habitación Reservada (Whitney Rack Slot Occupied) | [   ] Habitación Disponible.", margin, y)

            // Firmas
            const sigY = y + 16
            doc.setDrawColor(161, 161, 170)
            doc.setLineWidth(0.4)
            doc.line(margin, sigY, margin + 65, sigY)
            doc.line(pageW - margin - 65, sigY, pageW - margin, sigY)

            doc.setFontSize(8.5)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...dark)
            doc.text("Funcionario / Auditor Nocturno", margin + 32, sigY - 3, { align: "center" })
            doc.text("Supervisor de Recepción", pageW - margin - 32, sigY - 3, { align: "center" })

            doc.setFont("helvetica", "normal")
            doc.setFontSize(7.5)
            doc.setTextColor(...gray)
            doc.text("Firma de Conformidad", margin + 32, sigY + 4, { align: "center" })
            doc.text("Sello de Control", pageW - margin - 32, sigY + 4, { align: "center" })

            // Footer
            y = sigY + 12
            doc.setDrawColor(228, 228, 231)
            doc.line(margin, y, pageW - margin, y)
            doc.setFontSize(7)
            doc.text(
                "Documento académico emitido por la plataforma EduHotel para el entrenamiento de control de racks Whitney de reservaciones.",
                pageW / 2, y + 4, { align: "center" }
            )

            doc.save(`rack_reservas_${companyName.replace(/\s+/g, "_") || "hab"}.pdf`)
            toast.success("Rack de Reservación descargado en PDF exitosamente")
        } catch (error) {
            console.error("Error generating PDF:", error)
            toast.error("Error al generar el PDF del rack")
        } finally {
            setIsGeneratingPDF(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isReadOnly) return

        if (!companyName.trim()) {
            toast.error("Ingrese el nombre de la empresa organizadora")
            return
        }

        setIsLoading(true)
        try {
            // Convertir Set a lista de objetos RackItemData
            const items: RackItemData[] = []
            reservedCells.forEach(cell => {
                const [room, dayStr] = cell.split("_")
                items.push({
                    month_name: selectedMonth,
                    room_number: room,
                    day_number: parseInt(dayStr)
                })
            })

            const formData: ReservationRacksFormData = {
                company_name: companyName,
                total_rooms: uniqueRoomsOccupied,
                items
            }

            const result = await createReservationRacks(formData)
            if (result.success) {
                router.push("/dashboard")
                router.refresh()
                toast.success("Rack de Reservaciones guardado exitosamente")
            } else {
                toast.error(result.error || "Error al registrar el rack")
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

    return (
        <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Rack de Reservaciones (Whitney Rack)</h1>
                <p className="text-zinc-500 max-w-2xl">
                    Visualice y bloquee la ocupación de habitaciones día a día para convenios y grupos empresariales mediante cuadrícula.
                </p>
            </div>

            {/* Configuración de Rack */}
            <Card className="rounded-[32px] border border-zinc-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all">
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-purple-50 text-[#7623d5] shadow-sm">
                            <Building2 className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Configuración General</CardTitle>
                            <CardDescription className="text-zinc-500">Defina la entidad y el periodo del rack</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 p-8 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2 lg:col-span-2">
                        <Label htmlFor="company_name" className="text-sm font-bold text-zinc-700 ml-1">Nombre de la Empresa o Grupo</Label>
                        <Input
                            id="company_name"
                            placeholder="Ej: Nestlé Corp, Universidad Nacional"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="month_name" className="text-sm font-bold text-zinc-700 ml-1">Mes de Control</Label>
                        <Select
                            disabled={isReadOnly}
                            value={selectedMonth}
                            onValueChange={(val) => {
                                setSelectedMonth(val)
                                clearAllCells() // Limpiar celdas en cambio de mes académico
                            }}
                        >
                            <SelectTrigger id="month_name" className={inputClasses}>
                                <SelectValue placeholder="Seleccione mes" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-zinc-200 shadow-xl bg-white">
                                {meses.map((m) => (
                                    <SelectItem key={m.value} value={m.value} className="rounded-xl py-2 focus:bg-purple-50 focus:text-purple-700">
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Matriz interactiva de Whitney */}
            <Card className="rounded-[32px] border border-zinc-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all">
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-purple-50 text-[#7623d5] shadow-sm">
                            <Layers className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Cuadrícula Whitney de Habitaciones</CardTitle>
                            <CardDescription className="text-zinc-500">Seleccione las casillas de ocupación por habitación y día</CardDescription>
                        </div>
                    </div>
                    {!isReadOnly && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={clearAllCells}
                            className="rounded-xl border-zinc-200 text-zinc-500 font-bold hover:bg-zinc-50"
                        >
                            Limpiar Cuadrícula
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="p-8">
                    {/* Alertas */}
                    <div className="mb-6 p-5 rounded-2xl bg-[#7623d5]/5 border border-[#7623d5]/10 flex gap-3 text-[#7623d5]">
                        <Info className="size-5 shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <b className="font-bold">Instrucciones Académicas:</b> En las operaciones del rack de habitaciones, haga clic en cualquier celda para alternar el bloqueo o reserva de esa habitación por ese día específico del mes de <b className="font-bold">{selectedMonth}</b>.
                        </div>
                    </div>

                    {/* Matriz Whitney con scroll horizontal */}
                    <div className="overflow-x-auto rounded-2xl border border-zinc-200">
                        <div className="min-w-[900px] divide-y divide-zinc-200">
                            {/* Cabecera del Grid (Días) */}
                            <div className="flex bg-zinc-50 py-3.5 divide-x divide-zinc-200">
                                <div className="w-32 px-4 flex items-center shrink-0">
                                    <span className="text-xs font-black text-zinc-500 uppercase tracking-wider">Habitación</span>
                                </div>
                                <div className="flex-1 flex justify-around">
                                    {daysArray.map(day => (
                                        <div key={day} className="w-8 text-center shrink-0 text-xs font-black text-zinc-500">
                                            {day}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Filas del Grid (Habs) */}
                            <div className="divide-y divide-zinc-100 bg-white">
                                {habitacionesDefecto.map(room => (
                                    <div key={room} className="flex divide-x divide-zinc-100 items-stretch">
                                        {/* Hab Header */}
                                        <div className="w-32 px-4 flex items-center bg-zinc-50/50 shrink-0 font-bold text-zinc-700">
                                            {room}
                                        </div>
                                        {/* Celdas */}
                                        <div className="flex-1 flex justify-around py-1">
                                            {daysArray.map(day => {
                                                const key = `${room}_${day}`
                                                const isReserved = reservedCells.has(key)
                                                return (
                                                    <button
                                                        type="button"
                                                        key={day}
                                                        disabled={isReadOnly}
                                                        onClick={() => toggleCell(room, day)}
                                                        className={cn(
                                                            "w-8 h-8 rounded-lg transition-all shrink-0 flex items-center justify-center font-bold text-xs border border-transparent",
                                                            isReserved
                                                                ? "bg-[#7623d5] text-white shadow-md shadow-[#7623d5]/20 hover:bg-[#5b19aa]"
                                                                : "bg-zinc-50 text-zinc-400 hover:bg-zinc-100 hover:border-zinc-200",
                                                            isReadOnly && "cursor-default"
                                                        )}
                                                    >
                                                        {isReserved ? "X" : ""}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Resumen de Ocupación en Rack */}
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl border border-zinc-100 bg-zinc-50/50 flex flex-col justify-center">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Habitaciones Comprometidas</span>
                            <span className="text-2xl font-black text-zinc-800 mt-1">{uniqueRoomsOccupied} de {habitacionesDefecto.length}</span>
                        </div>
                        <div className="p-5 rounded-2xl border border-zinc-100 bg-zinc-50/50 flex flex-col justify-center">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Noches Totales Reservadas</span>
                            <span className="text-2xl font-black text-[#7623d5] mt-1">{occupiedCellsCount} noches</span>
                        </div>
                    </div>
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
                                    Guardar Rack de Ocupación
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
                                    Descargar Rack PDF
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => router.push("/dashboard")}
                            className="rounded-[16px] px-10 h-12 font-bold bg-[#7623d5] hover:bg-[#5b19aa] text-white shadow-xl shadow-[#7623d5]/30 transition-all active:scale-95 hover:translate-y-[-2px]"
                        >
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Rack Guardado
                        </Button>
                    </>
                )}
            </div>
        </form>
    )
}
