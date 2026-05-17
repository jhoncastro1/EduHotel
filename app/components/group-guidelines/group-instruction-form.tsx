"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, Users, Clock, BedDouble, DollarSign, FileText, CheckCircle2, Loader2, ChevronRight, FileDown } from "lucide-react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { createGroupGuidelines } from "@/actions/group-guidelines/group-guidelines"
import toast from "react-hot-toast"

export interface GroupInstructionFormData {
    nombre_grupo: string
    llegada: Date | undefined
    hora_llegada: string
    salida: Date | undefined
    hora_salida: string
    conductor_grupo: string
    paga: string
    observaciones: string
    plan_alimentos: string
    adultos: number
    menores: number
    total_personas: number
    habitaciones_sencillas: number
    habitaciones_dobles: number
    habitaciones_twin: number
    tarifa_sencilla: number | undefined
    tarifa_doble: number | undefined
    tarifa_twin: number | undefined
    cuenta_extras: boolean
    cuenta_maestra: boolean
}

interface GroupInstructionFormProps {
    onSubmit?: (data: GroupInstructionFormData) => void
    defaultValues?: Partial<GroupInstructionFormData>
    isLoading?: boolean
    isReadOnly?: boolean
}

export function GroupInstructionForm({ onSubmit, defaultValues, isLoading: initialLoading = false, isReadOnly = false }: GroupInstructionFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(initialLoading)
    const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false)
    const [formData, setFormData] = React.useState<GroupInstructionFormData>({
        nombre_grupo: defaultValues?.nombre_grupo ?? "",
        llegada: defaultValues?.llegada ? new Date(defaultValues.llegada) : undefined,
        hora_llegada: defaultValues?.hora_llegada ?? "",
        salida: defaultValues?.salida ? new Date(defaultValues.salida) : undefined,
        hora_salida: defaultValues?.hora_salida ?? "",
        conductor_grupo: defaultValues?.conductor_grupo ?? "",
        paga: defaultValues?.paga ?? "",
        observaciones: defaultValues?.observaciones ?? "",
        plan_alimentos: defaultValues?.plan_alimentos ?? "",
        adultos: defaultValues?.adultos ?? 0,
        menores: defaultValues?.menores ?? 0,
        total_personas: defaultValues?.total_personas ?? 0,
        habitaciones_sencillas: defaultValues?.habitaciones_sencillas ?? 0,
        habitaciones_dobles: defaultValues?.habitaciones_dobles ?? 0,
        habitaciones_twin: defaultValues?.habitaciones_twin ?? 0,
        tarifa_sencilla: defaultValues?.tarifa_sencilla,
        tarifa_doble: defaultValues?.tarifa_doble,
        tarifa_twin: defaultValues?.tarifa_twin,
        cuenta_extras: defaultValues?.cuenta_extras ?? false,
        cuenta_maestra: defaultValues?.cuenta_maestra ?? false,
    })

    const handleDownloadPDF = async () => {
        setIsGeneratingPDF(true)
        try {
            // Cargar jsPDF directamente (sin html2canvas)
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

            const teal: [number, number, number] = [22, 107, 107]
            const dark: [number, number, number] = [24, 24, 27]
            const gray: [number, number, number] = [113, 113, 122]
            const greenDark: [number, number, number] = [22, 101, 52]
            const amberDark: [number, number, number] = [217, 119, 6]
            const pageW = 210
            const margin = 18
            const col = pageW - margin * 2
            let y = 18

            const llegadaStr = formData.llegada
                ? format(formData.llegada, "dd/MM/yyyy", { locale: es })
                : "N/A"
            const salidaStr = formData.salida
                ? format(formData.salida, "dd/MM/yyyy", { locale: es })
                : "N/A"

            // ── HEADER ──────────────────────────────────────────
            doc.setFontSize(26)
            doc.setTextColor(...teal)
            doc.setFont("helvetica", "bold")
            doc.text("EDUHOTEL", margin, y)

            doc.setFontSize(8)
            doc.setTextColor(...gray)
            doc.setFont("helvetica", "normal")
            doc.text("Prácticas Profesionales de Gestión Hotelera", margin, y + 6)

            // Badge derecha
            doc.setFillColor(254, 243, 199)
            doc.roundedRect(pageW - margin - 46, y - 6, 46, 8, 2, 2, "F")
            doc.setFontSize(7)
            doc.setTextColor(...amberDark)
            doc.setFont("helvetica", "bold")
            doc.text("INSTRUCTIVO GRUPO", pageW - margin - 23, y - 1.5, { align: "center" })

            doc.setFontSize(9)
            doc.setTextColor(...dark)
            doc.setFont("helvetica", "bold")
            doc.text(`GRUPO: ${formData.nombre_grupo || "N/A"}`, pageW - margin, y + 5, { align: "right" })
            doc.setFont("helvetica", "normal")
            doc.setTextColor(...gray)
            doc.setFontSize(8)
            doc.text(`Fecha: ${new Date().toLocaleDateString("es-CO")}`, pageW - margin, y + 10, { align: "right" })

            y += 15
            doc.setDrawColor(...teal)
            doc.setLineWidth(0.6)
            doc.line(margin, y, pageW - margin, y)
            y += 8

            // Título central
            doc.setFontSize(12)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...dark)
            doc.text("PAUTAS E INSTRUCTIVO DE RESERVA GRUPAL", pageW / 2, y, { align: "center" })
            y += 10

            // ── Helpers ──────────────────────────────────────────
            const drawSection = (title: string) => {
                doc.setFontSize(8)
                doc.setFont("helvetica", "bold")
                doc.setTextColor(...teal)
                doc.text(title.toUpperCase(), margin, y)
                doc.setDrawColor(...teal)
                doc.setLineWidth(0.3)
                doc.line(margin, y + 1.5, pageW - margin, y + 1.5)
                y += 7
            }

            const drawRow = (label: string, value: string) => {
                doc.setFontSize(8.5)
                doc.setFont("helvetica", "bold")
                doc.setTextColor(...gray)
                doc.text(label, margin, y)
                doc.setFont("helvetica", "normal")
                doc.setTextColor(...dark)
                const lines = doc.splitTextToSize(value || "—", col - 48)
                doc.text(lines, margin + 48, y)
                y += lines.length * 5.5 + 1
            }

            const drawTwoCol = (
                label1: string, val1: string,
                label2: string, val2: string
            ) => {
                const half = col / 2
                doc.setFontSize(8.5)
                doc.setFont("helvetica", "bold")
                doc.setTextColor(...gray)
                doc.text(label1, margin, y)
                doc.setFont("helvetica", "normal")
                doc.setTextColor(...dark)
                doc.text(val1 || "—", margin + 36, y)

                doc.setFont("helvetica", "bold")
                doc.setTextColor(...gray)
                doc.text(label2, margin + half + 4, y)
                doc.setFont("helvetica", "normal")
                doc.setTextColor(...dark)
                doc.text(val2 || "—", margin + half + 40, y)
                y += 6.5
            }

            // ── 1. GENERAL DEL GRUPO ──────────────────────────────
            drawSection("1. Información General del Grupo")
            drawRow("Nombre del Grupo:", formData.nombre_grupo)
            drawRow("Conductor / Líder:", formData.conductor_grupo || "No especificado")
            drawRow("Plan Alimentario:", formData.plan_alimentos || "No especificado")
            drawRow("Método de Pago:", formData.paga || "No especificado")
            y += 3

            // ── 2. ITINERARIO Y HORARIOS ─────────────────────────
            drawSection("2. Itinerario y Horarios")
            drawTwoCol("Fecha Llegada:", llegadaStr, "Hora Llegada:", formData.hora_llegada || "No especificada")
            drawTwoCol("Fecha Salida:", salidaStr, "Hora Salida:", formData.hora_salida || "No especificada")
            y += 3

            // ── 3. DISTRIBUCIÓN DE PERSONAS ──────────────────────
            drawSection("3. Distribución de Personas")

            // Recuadro de distribución
            const startY = y
            const boxHeight = 24
            const boxWidth = (col - 8) / 3

            // Fondo claro
            doc.setFillColor(240, 253, 244)
            doc.setDrawColor(220, 252, 231)
            doc.roundedRect(margin, y, col, boxHeight, 3, 3, "FD")

            // Adultos
            doc.setFontSize(8)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(22, 101, 52)
            doc.text("Adultos", margin + boxWidth / 2, y + 7, { align: "center" })
            doc.setFontSize(16)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(22, 101, 52)
            doc.text(formData.adultos.toString(), margin + boxWidth / 2, y + 18, { align: "center" })

            // Línea separadora
            doc.setDrawColor(220, 252, 231)
            doc.setLineWidth(0.3)
            doc.line(margin + boxWidth, y + 4, margin + boxWidth, y + boxHeight - 4)

            // Menores
            doc.setFontSize(8)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(22, 101, 52)
            doc.text("Menores", margin + boxWidth + boxWidth / 2, y + 7, { align: "center" })
            doc.setFontSize(16)
            doc.setFont("helvetica", "bold")
            doc.text(formData.menores.toString(), margin + boxWidth + boxWidth / 2, y + 18, { align: "center" })

            // Línea separadora
            doc.line(margin + boxWidth * 2, y + 4, margin + boxWidth * 2, y + boxHeight - 4)

            // Total
            doc.setFontSize(8)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...teal)
            doc.text("Total Personas", margin + boxWidth * 2 + boxWidth / 2, y + 7, { align: "center" })
            doc.setFontSize(16)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...teal)
            doc.text(formData.total_personas.toString(), margin + boxWidth * 2 + boxWidth / 2, y + 18, { align: "center" })

            y += boxHeight + 8

            // ── 4. HABITACIONES Y TARIFAS ────────────────────────
            drawSection("4. Distribución y Tarifas de Habitaciones")

            // Encabezados de tabla
            const col1 = margin
            const col2 = margin + 70
            const col3 = pageW - margin - 35
            const rowY = y
            doc.setFillColor(244, 244, 245)
            doc.rect(col1, y, col, 8, "F")
            doc.setFontSize(7.5)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(39, 39, 42)
            doc.text("Tipo de Habitación", col1 + 4, y + 5.5)
            doc.text("Cantidad", col2 + 4, y + 5.5)
            doc.text("Tarifa por Noche (COP)", col3 - 4, y + 5.5, { align: "right" })
            y += 8

            // Fila Sencillas
            doc.setFontSize(8)
            doc.setFont("helvetica", "normal")
            doc.setTextColor(39, 39, 42)
            doc.text("Sencilla (Single Room)", col1 + 4, y + 4.5)
            doc.setFont("helvetica", "bold")
            doc.text(formData.habitaciones_sencillas.toString(), col2 + 4, y + 4.5)
            doc.setFont("helvetica", "normal")
            doc.text(`$${formData.tarifa_sencilla?.toLocaleString("es-CO") || "0"}`, col3 - 4, y + 4.5, { align: "right" })
            y += 7

            // Fila Dobles
            doc.text("Doble (Double Room)", col1 + 4, y + 4.5)
            doc.setFont("helvetica", "bold")
            doc.text(formData.habitaciones_dobles.toString(), col2 + 4, y + 4.5)
            doc.setFont("helvetica", "normal")
            doc.text(`$${formData.tarifa_doble?.toLocaleString("es-CO") || "0"}`, col3 - 4, y + 4.5, { align: "right" })
            y += 7

            // Fila Twin
            doc.text("Twin (Dos Camas)", col1 + 4, y + 4.5)
            doc.setFont("helvetica", "bold")
            doc.text(formData.habitaciones_twin.toString(), col2 + 4, y + 4.5)
            doc.setFont("helvetica", "normal")
            doc.text(`$${formData.tarifa_twin?.toLocaleString("es-CO") || "0"}`, col3 - 4, y + 4.5, { align: "right" })
            y += 7

            // Línea separadora
            doc.setDrawColor(228, 228, 231)
            doc.line(col1, y, pageW - margin, y)
            y += 3

            // Total habitaciones
            const totalHabs = formData.habitaciones_sencillas + formData.habitaciones_dobles + formData.habitaciones_twin
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...teal)
            doc.text("TOTAL HABITACIONES", col1 + 4, y + 4.5)
            doc.text(totalHabs.toString(), col2 + 4, y + 4.5)
            y += 10

            // ── 5. FACTURACIÓN ───────────────────────────────────
            drawSection("5. Parámetros de Facturación")

            const checkY = y
            doc.setFontSize(8.5)
            doc.setFont("helvetica", "normal")
            doc.setTextColor(...dark)

            // Cuenta Maestra
            doc.text(formData.cuenta_maestra ? "☑" : "☐", margin, checkY)
            doc.setFont("helvetica", "bold")
            doc.text("¿Consolidar en Cuenta Maestra?", margin + 6, checkY)

            // Cuenta Extras
            doc.setFont("helvetica", "normal")
            doc.text(formData.cuenta_extras ? "☑" : "☐", margin + 85, checkY)
            doc.setFont("helvetica", "bold")
            doc.text("¿Huéspedes pagan sus extras?", margin + 91, checkY)
            y += 10

            // ── 6. OBSERVACIONES ─────────────────────────────────
            drawSection("6. Observaciones y Comentarios Especiales")

            doc.setFillColor(250, 250, 250)
            doc.setDrawColor(228, 228, 231)
            doc.roundedRect(margin, y, col, 28, 3, 3, "FD")
            doc.setFontSize(8)
            doc.setFont("helvetica", "italic")
            doc.setTextColor(82, 82, 91)
            const obsText = doc.splitTextToSize(formData.observaciones || "Sin observaciones registradas.", col - 8)
            doc.text(obsText, margin + 4, y + 6)
            y += 34

            // ── FIRMAS ───────────────────────────────────────────
            const sigY = y + 15
            doc.setDrawColor(161, 161, 170)
            doc.setLineWidth(0.4)
            doc.line(margin, sigY, margin + 65, sigY)
            doc.line(pageW - margin - 65, sigY, pageW - margin, sigY)

            doc.setFontSize(9)
            doc.setFont("helvetica", "bolditalic")
            doc.setTextColor(...dark)
            doc.text(formData.conductor_grupo || "Representante", margin + 32, sigY - 3, { align: "center" })
            doc.setFont("helvetica", "normal")
            doc.setFontSize(7.5)
            doc.setTextColor(...gray)
            doc.text("Firma de Conductor de Grupo", margin + 32, sigY + 5, { align: "center" })
            doc.text("Coordinador de Eventos", pageW - margin - 32, sigY - 3, { align: "center" })
            doc.text("Firma Autorizada Hotel", pageW - margin - 32, sigY + 5, { align: "center" })
            y = sigY + 15

            // ── FOOTER ───────────────────────────────────────────
            doc.setDrawColor(228, 228, 231)
            doc.setLineWidth(0.3)
            doc.line(margin, y, pageW - margin, y)
            y += 5
            doc.setFontSize(7)
            doc.setTextColor(161, 161, 170)
            doc.setFont("helvetica", "normal")
            doc.text(
                "Este documento es un simulador académico emitido por la plataforma EduHotel para el entrenamiento de operaciones hoteleras.",
                pageW / 2, y, { align: "center" }
            )
            doc.text(
                `© ${new Date().getFullYear()} EduHotel. Todos los derechos reservados.`,
                pageW / 2, y + 4.5, { align: "center" }
            )

            doc.save(`instructivo_grupo_${formData.nombre_grupo.replace(/\s+/g, "_")}.pdf`)
            toast.success("Instructivo de Grupo descargado en PDF exitosamente")
        } catch (error) {
            console.error("Error generating PDF:", error)
            toast.error("Error al generar el PDF del instructivo")
        } finally {
            setIsGeneratingPDF(false)
        }
    }

    const updateField = <K extends keyof GroupInstructionFormData>(
        field: K,
        value: GroupInstructionFormData[K]
    ) => {
        if (isReadOnly) return
        setFormData((prev) => {
            const newData = { ...prev, [field]: value }
            if (field === "adultos" || field === "menores") {
                const adultos = field === "adultos" ? (value as number) : prev.adultos
                const menores = field === "menores" ? (value as number) : prev.menores
                newData.total_personas = adultos + menores
            }
            return newData
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (isReadOnly) return
        setIsLoading(true)
        try {
            const result = await createGroupGuidelines(formData);
            if (result.success) {
                router.push("/dashboard");
                router.refresh();
            } else {
                alert("Error al guardar las pautas de grupo: " + result.error);
            }
        } catch (error) {
            console.error(error);
            alert("Error inesperado al guardar las pautas de grupo");
        } finally {
            setIsLoading(false)
        }
    }

    const inputClasses = cn(
        "transition-all duration-200 focus:ring-2 focus:ring-[#166b6b]/20 focus:border-[#166b6b] h-11 rounded-xl",
        isReadOnly && "bg-zinc-50 border-zinc-200 text-zinc-600 cursor-default opacity-80"
    )

    const sectionCardClasses = "rounded-[32px] border border-zinc-200 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"

    return (
        <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-10">
            {/* Header / Intro */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Pautas de Grupo</h1>
                <p className="text-zinc-500 max-w-2xl">
                    Registre las instrucciones y requerimientos específicos para el manejo de grupos y eventos.
                </p>
            </div>

            {/* Información del Grupo */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-purple-50 text-purple-600 shadow-sm shadow-purple-100/50">
                            <Users className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Información del Grupo</CardTitle>
                            <CardDescription className="text-zinc-500">Datos generales del grupo y responsable</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 p-8 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="nombre_grupo" className="text-sm font-bold text-zinc-700 ml-1">Nombre del Grupo</Label>
                        <Input
                            id="nombre_grupo"
                            placeholder="Ej: Tour Aventura Colombia 2024"
                            value={formData.nombre_grupo}
                            onChange={(e) => updateField("nombre_grupo", e.target.value)}
                            required
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="conductor_grupo" className="text-sm font-bold text-zinc-700 ml-1">Conductor / Líder del Grupo</Label>
                        <Input
                            id="conductor_grupo"
                            placeholder="Nombre del guía o responsable"
                            value={formData.conductor_grupo}
                            onChange={(e) => updateField("conductor_grupo", e.target.value)}
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Fechas y Horarios */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/50">
                            <Clock className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Fechas y Horarios</CardTitle>
                            <CardDescription className="text-zinc-500">Programación de llegada y salida</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 p-8 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-zinc-700 ml-1">Fecha de Llegada</Label>
                        <Popover>
                            <PopoverTrigger asChild disabled={isReadOnly}>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-11 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all",
                                        !formData.llegada && "text-muted-foreground",
                                        isReadOnly && "bg-zinc-50 opacity-100"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 size-4 text-blue-600" />
                                    {formData.llegada ? (
                                        format(formData.llegada, "PPP", { locale: es })
                                    ) : (
                                        <span>Seleccione fecha de llegada</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-2xl border-zinc-200 shadow-2xl overflow-hidden bg-white" align="start">
                                <Calendar
                                    mode="single"
                                    selected={formData.llegada}
                                    onSelect={(date) => updateField("llegada", date)}
                                    className="p-4"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="hora_llegada" className="text-sm font-bold text-zinc-700 ml-1">Hora Estimada de Llegada</Label>
                        <Input
                            id="hora_llegada"
                            type="time"
                            value={formData.hora_llegada}
                            onChange={(e) => updateField("hora_llegada", e.target.value)}
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-zinc-700 ml-1">Fecha de Salida</Label>
                        <Popover>
                            <PopoverTrigger asChild disabled={isReadOnly}>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-11 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all",
                                        !formData.salida && "text-muted-foreground",
                                        isReadOnly && "bg-zinc-50 opacity-100"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 size-4 text-blue-600" />
                                    {formData.salida ? (
                                        format(formData.salida, "PPP", { locale: es })
                                    ) : (
                                        <span>Seleccione fecha de salida</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-2xl border-zinc-200 shadow-2xl overflow-hidden bg-white" align="start">
                                <Calendar
                                    mode="single"
                                    selected={formData.salida}
                                    onSelect={(date) => updateField("salida", date)}
                                    disabled={(date) =>
                                        formData.llegada ? date < formData.llegada : false
                                    }
                                    className="p-4"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="hora_salida" className="text-sm font-bold text-zinc-700 ml-1">Hora Estimada de Salida</Label>
                        <Input
                            id="hora_salida"
                            type="time"
                            value={formData.hora_salida}
                            onChange={(e) => updateField("hora_salida", e.target.value)}
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Cantidad de Personas */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100/50">
                            <Users className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Cantidad de Personas</CardTitle>
                            <CardDescription className="text-zinc-500">Detalle de huéspedes del grupo</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 p-8 sm:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="adultos" className="text-sm font-bold text-zinc-700 ml-1">Adultos</Label>
                        <Input
                            id="adultos"
                            type="number"
                            min={0}
                            value={formData.adultos}
                            onChange={(e) => updateField("adultos", parseInt(e.target.value) || 0)}
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="menores" className="text-sm font-bold text-zinc-700 ml-1">Menores</Label>
                        <Input
                            id="menores"
                            type="number"
                            min={0}
                            value={formData.menores}
                            onChange={(e) => updateField("menores", parseInt(e.target.value) || 0)}
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="total_personas" className="text-sm font-bold text-zinc-700 ml-1">Total Huéspedes</Label>
                        <div className="relative">
                            <Input
                                id="total_personas"
                                type="number"
                                min={0}
                                value={formData.total_personas}
                                readOnly
                                className={cn(inputClasses, "bg-zinc-50 font-bold text-[#166b6b] border-dashed")}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Habitaciones y Tarifas */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50">
                            <BedDouble className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Habitaciones y Tarifas</CardTitle>
                            <CardDescription className="text-zinc-500">Distribución y precios por tipo</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="grid gap-6 sm:grid-cols-3">
                        <div className="space-y-4 p-4 rounded-2xl bg-zinc-50/50 border border-zinc-100">
                            <Label className="text-xs font-black uppercase tracking-wider text-zinc-400">Sencillas</Label>
                            <div className="space-y-2">
                                <Label htmlFor="habitaciones_sencillas" className="text-xs font-bold text-zinc-500">Cantidad</Label>
                                <Input
                                    id="habitaciones_sencillas"
                                    type="number"
                                    min={0}
                                    value={formData.habitaciones_sencillas}
                                    onChange={(e) => updateField("habitaciones_sencillas", parseInt(e.target.value) || 0)}
                                    readOnly={isReadOnly}
                                    className={inputClasses}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tarifa_sencilla" className="text-xs font-bold text-zinc-500">Tarifa</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                                    <Input
                                        id="tarifa_sencilla"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.tarifa_sencilla ?? ""}
                                        onChange={(e) => updateField("tarifa_sencilla", e.target.value ? parseFloat(e.target.value) : undefined)}
                                        readOnly={isReadOnly}
                                        className={cn(inputClasses, "pl-9")}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 rounded-2xl bg-zinc-50/50 border border-zinc-100">
                            <Label className="text-xs font-black uppercase tracking-wider text-zinc-400">Dobles</Label>
                            <div className="space-y-2">
                                <Label htmlFor="habitaciones_dobles" className="text-xs font-bold text-zinc-500">Cantidad</Label>
                                <Input
                                    id="habitaciones_dobles"
                                    type="number"
                                    min={0}
                                    value={formData.habitaciones_dobles}
                                    onChange={(e) => updateField("habitaciones_dobles", parseInt(e.target.value) || 0)}
                                    readOnly={isReadOnly}
                                    className={inputClasses}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tarifa_doble" className="text-xs font-bold text-zinc-500">Tarifa</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                                    <Input
                                        id="tarifa_doble"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.tarifa_doble ?? ""}
                                        onChange={(e) => updateField("tarifa_doble", e.target.value ? parseFloat(e.target.value) : undefined)}
                                        readOnly={isReadOnly}
                                        className={cn(inputClasses, "pl-9")}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 rounded-2xl bg-zinc-50/50 border border-zinc-100">
                            <Label className="text-xs font-black uppercase tracking-wider text-zinc-400">Twin</Label>
                            <div className="space-y-2">
                                <Label htmlFor="habitaciones_twin" className="text-xs font-bold text-zinc-500">Cantidad</Label>
                                <Input
                                    id="habitaciones_twin"
                                    type="number"
                                    min={0}
                                    value={formData.habitaciones_twin}
                                    onChange={(e) => updateField("habitaciones_twin", parseInt(e.target.value) || 0)}
                                    readOnly={isReadOnly}
                                    className={inputClasses}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tarifa_twin" className="text-xs font-bold text-zinc-500">Tarifa</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                                    <Input
                                        id="tarifa_twin"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.tarifa_twin ?? ""}
                                        onChange={(e) => updateField("tarifa_twin", e.target.value ? parseFloat(e.target.value) : undefined)}
                                        readOnly={isReadOnly}
                                        className={cn(inputClasses, "pl-9")}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Detalles Adicionales */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-amber-50 text-amber-600 shadow-sm shadow-amber-100/50">
                            <FileText className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Detalles Adicionales</CardTitle>
                            <CardDescription className="text-zinc-500">Plan de alimentación y notas especiales</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8 p-8">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="plan_alimentos" className="text-sm font-bold text-zinc-700 ml-1">Plan de Alimentos</Label>
                            <Input
                                id="plan_alimentos"
                                placeholder="Ej: Desayuno incluido, Pensión completa"
                                value={formData.plan_alimentos}
                                onChange={(e) => updateField("plan_alimentos", e.target.value)}
                                readOnly={isReadOnly}
                                className={inputClasses}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="paga" className="text-sm font-bold text-zinc-700 ml-1">Método de Pago / Garantía</Label>
                            <Input
                                id="paga"
                                placeholder="Ej: Transferencia, Crédito Empresa"
                                value={formData.paga}
                                onChange={(e) => updateField("paga", e.target.value)}
                                readOnly={isReadOnly}
                                className={inputClasses}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observaciones" className="text-sm font-bold text-zinc-700 ml-1">Observaciones Especiales</Label>
                        <Textarea
                            id="observaciones"
                            placeholder="Notas sobre alergias, requerimientos de accesibilidad, etc."
                            value={formData.observaciones}
                            onChange={(e) => updateField("observaciones", e.target.value)}
                            className={cn("min-h-[120px] resize-none rounded-2xl", inputClasses)}
                            readOnly={isReadOnly}
                        />
                    </div>

                    <Separator className="bg-zinc-100" />

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className={cn(
                            "flex items-start gap-4 p-6 rounded-[24px] transition-all duration-300",
                            formData.cuenta_extras ? "bg-amber-50/50 border border-amber-100 shadow-inner" : "bg-zinc-50 border border-zinc-100"
                        )}>
                            <Checkbox
                                id="cuenta_extras"
                                disabled={isReadOnly}
                                checked={formData.cuenta_extras}
                                onCheckedChange={(checked) => updateField("cuenta_extras", checked === true)}
                                className="mt-1 size-5 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600 rounded-md"
                            />
                            <div className="grid gap-2 leading-none">
                                <Label htmlFor="cuenta_extras" className="cursor-pointer text-base font-bold text-zinc-800">Cuenta de Extras</Label>
                                <p className="text-sm text-zinc-500 leading-relaxed">Habilitar facturación separada para consumos adicionales.</p>
                            </div>
                        </div>

                        <div className={cn(
                            "flex items-start gap-4 p-6 rounded-[24px] transition-all duration-300",
                            formData.cuenta_maestra ? "bg-blue-50/50 border border-blue-100 shadow-inner" : "bg-zinc-50 border border-zinc-100"
                        )}>
                            <Checkbox
                                id="cuenta_maestra"
                                disabled={isReadOnly}
                                checked={formData.cuenta_maestra}
                                onCheckedChange={(checked) => updateField("cuenta_maestra", checked === true)}
                                className="mt-1 size-5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded-md"
                            />
                            <div className="grid gap-2 leading-none">
                                <Label htmlFor="cuenta_maestra" className="cursor-pointer text-base font-bold text-zinc-800">Cuenta Maestra</Label>
                                <p className="text-sm text-zinc-500 leading-relaxed">Consolidar todos los cargos del grupo en una sola factura.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                            className="rounded-[16px] px-10 h-12 font-bold bg-[#166b6b] hover:bg-[#124f4f] text-white shadow-xl shadow-[#166b6b]/30 transition-all active:scale-95 hover:translate-y-[-2px]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    Registrar Grupo
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
                            className="rounded-[16px] px-8 h-12 font-bold border-[#166b6b] text-[#166b6b] bg-white hover:bg-zinc-50 transition-all active:scale-95 flex items-center gap-2"
                        >
                            {isGeneratingPDF ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Generando PDF...
                                </>
                            ) : (
                                <>
                                    <FileDown className="h-5 w-5" />
                                    Descargar PDF
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => router.push("/dashboard")}
                            className="rounded-[16px] px-10 h-12 font-bold bg-[#166b6b] hover:bg-[#124f4f] text-white shadow-xl shadow-[#166b6b]/30 transition-all active:scale-95 hover:translate-y-[-2px]"
                        >
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Registro Completado
                        </Button>
                    </>
                )}
            </div>
        </form>
    )
}