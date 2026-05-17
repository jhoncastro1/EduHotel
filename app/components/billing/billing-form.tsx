"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, User, Receipt, ShoppingCart, CreditCard, DollarSign, Loader2, ChevronRight, CheckCircle2, FileDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

import { createBilling } from "@/actions/billing/billing"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export interface BillingFormData {
    iva: number | undefined
    descuentos: number | undefined
    nombre_huesped: string
    numero: string
    fecha: Date | undefined
    habitacion: string
    personas: number | undefined
    cambio: number | undefined
    balance: number | undefined
    seguro_hotelero: number | undefined
    aporte_tmo: number | undefined
    restaurante: number | undefined
    importe_consumo: number | undefined
    mini_bar: number | undefined
    gastos_telefono: number | undefined
    miscelaneos: number | undefined
    lavanderia: number | undefined
    total_cargos: number | undefined
    abonos: number | undefined
    recibo_caja: string
    total_pagar: number | undefined
    observaciones: string
    cc_huesped: string
    valor_iva?: number | undefined
}

interface BillingFormProps {
    onSubmit?: (data: BillingFormData) => void
    defaultValues?: Partial<BillingFormData>
    isLoading?: boolean
    isReadOnly?: boolean
}

export function BillingForm({ onSubmit, defaultValues, isLoading: initialLoading = false, isReadOnly = false }: BillingFormProps) {
    const [formData, setFormData] = React.useState<BillingFormData>({
        iva: defaultValues?.iva,
        descuentos: defaultValues?.descuentos,
        nombre_huesped: defaultValues?.nombre_huesped ?? "",
        numero: defaultValues?.numero ?? "",
        fecha: defaultValues?.fecha ? new Date(defaultValues.fecha) : undefined,
        habitacion: defaultValues?.habitacion ?? "",
        personas: defaultValues?.personas,
        cambio: defaultValues?.cambio,
        balance: defaultValues?.balance,
        seguro_hotelero: defaultValues?.seguro_hotelero,
        aporte_tmo: defaultValues?.aporte_tmo,
        restaurante: defaultValues?.restaurante,
        importe_consumo: defaultValues?.importe_consumo,
        mini_bar: defaultValues?.mini_bar,
        gastos_telefono: defaultValues?.gastos_telefono,
        miscelaneos: defaultValues?.miscelaneos,
        lavanderia: defaultValues?.lavanderia,
        total_cargos: defaultValues?.total_cargos,
        abonos: defaultValues?.abonos,
        recibo_caja: defaultValues?.recibo_caja ?? "",
        total_pagar: defaultValues?.total_pagar,
        observaciones: defaultValues?.observaciones ?? "",
        cc_huesped: defaultValues?.cc_huesped ?? "",
        valor_iva: defaultValues?.valor_iva,
    })

    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(initialLoading)
    const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false)

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

            const teal: [number, number, number] = [22, 107, 107]
            const dark: [number, number, number] = [24, 24, 27]
            const gray: [number, number, number] = [113, 113, 122]
            const green: [number, number, number] = [6, 95, 70]
            const pageW = 210
            const margin = 18
            const col = pageW - margin * 2
            let y = 18

            const fechaStr = formData.fecha
                ? format(formData.fecha, "dd/MM/yyyy", { locale: es })
                : "N/A"

            const charges = [
                { label: "Seguro Hotelero", val: formData.seguro_hotelero },
                { label: "Aporte TMO", val: formData.aporte_tmo },
                { label: "Restaurante", val: formData.restaurante },
                { label: "Importe de Consumo", val: formData.importe_consumo },
                { label: "Mini Bar", val: formData.mini_bar },
                { label: "Gastos de Telefono", val: formData.gastos_telefono },
                { label: "Miscelaneos", val: formData.miscelaneos },
                { label: "Lavanderia", val: formData.lavanderia },
            ].filter((c) => typeof c.val === "number" && (c.val as number) > 0)

            // ── HEADER ──────────────────────────────────────────
            doc.setFontSize(26)
            doc.setTextColor(...teal)
            doc.setFont("helvetica", "bold")
            doc.text("EDUHOTEL", margin, y)

            doc.setFontSize(8)
            doc.setTextColor(...gray)
            doc.setFont("helvetica", "normal")
            doc.text("Practicas Profesionales de Gestion Hotelera", margin, y + 6)

            // Badge derecha
            doc.setFillColor(209, 250, 229)
            doc.roundedRect(pageW - margin - 38, y - 6, 38, 8, 2, 2, "F")
            doc.setFontSize(7)
            doc.setTextColor(...green)
            doc.setFont("helvetica", "bold")
            doc.text("FACTURA REGISTRADA", pageW - margin - 19, y - 1.5, { align: "center" })

            doc.setFontSize(10)
            doc.setTextColor(...dark)
            doc.setFont("helvetica", "bold")
            doc.text(`FACTURA: ${formData.numero || "FAC-N/A"}`, pageW - margin, y + 5, { align: "right" })
            doc.setFont("helvetica", "normal")
            doc.setTextColor(...gray)
            doc.setFontSize(8)
            doc.text(`Fecha: ${fechaStr}`, pageW - margin, y + 10, { align: "right" })

            y += 15
            doc.setDrawColor(...teal)
            doc.setLineWidth(0.6)
            doc.line(margin, y, pageW - margin, y)
            y += 8

            // Título central
            doc.setFontSize(12)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...dark)
            doc.text("FACTURA DE SERVICIOS HOTELEROS", pageW / 2, y, { align: "center" })
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
                doc.text(val2 || "—", margin + half + 36, y)
                y += 6.5
            }

            // ── 1. DATOS DEL HUÉSPED ─────────────────────────────
            drawSection("Informacion del Huesped")
            drawTwoCol("Nombre:", formData.nombre_huesped, "CC / Identificacion:", formData.cc_huesped)
            drawTwoCol("Habitacion:", formData.habitacion || "N/A", "Personas:", String(formData.personas || 1))
            drawTwoCol("Numero de Factura:", formData.numero || "FAC-N/A", "Fecha:", fechaStr)
            y += 3

            // ── 2. DETALLE DE CARGOS ─────────────────────────────
            drawSection("Detalle de Cargos de Servicios")

            // Encabezado tabla
            doc.setFillColor(244, 244, 245)
            doc.rect(margin, y - 1, col, 8, "F")
            doc.setFontSize(8)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(39, 39, 42)
            doc.text("Concepto / Servicio", margin + 3, y + 4.5)
            doc.text("Valor", pageW - margin - 3, y + 4.5, { align: "right" })
            y += 10

            if (charges.length > 0) {
                charges.forEach((c, i) => {
                    if (i % 2 === 0) {
                        doc.setFillColor(250, 250, 250)
                        doc.rect(margin, y - 1, col, 7, "F")
                    }
                    doc.setFontSize(8.5)
                    doc.setFont("helvetica", "normal")
                    doc.setTextColor(82, 82, 91)
                    doc.text(c.label, margin + 3, y + 4)
                    doc.setFont("helvetica", "bold")
                    doc.setTextColor(...dark)
                    doc.text(`$${(c.val as number).toLocaleString("es-CO")}`, pageW - margin - 3, y + 4, { align: "right" })
                    y += 7
                })
            } else {
                doc.setFontSize(8.5)
                doc.setFont("helvetica", "italic")
                doc.setTextColor(...gray)
                doc.text("No se registraron cargos de servicios.", pageW / 2, y + 4, { align: "center" })
                y += 8
            }

            // Fila total cargos
            doc.setFillColor(240, 253, 250)
            doc.rect(margin, y, col, 9, "F")
            doc.setDrawColor(...teal)
            doc.setLineWidth(0.3)
            doc.line(margin, y, pageW - margin, y)
            doc.setFontSize(9)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...teal)
            doc.text("TOTAL CARGOS", margin + 3, y + 6)
            doc.text(`$${(formData.total_cargos ?? 0).toLocaleString("es-CO")}`, pageW - margin - 3, y + 6, { align: "right" })
            y += 14

            // ── 3. RESUMEN FINANCIERO ────────────────────────────
            drawSection("Resumen Financiero")

            const drawFinRow = (label: string, value: string, color: [number, number, number] = dark) => {
                doc.setFontSize(8.5)
                doc.setFont("helvetica", "normal")
                doc.setTextColor(...gray)
                doc.text(label, margin + 3, y)
                doc.setFont("helvetica", "bold")
                doc.setTextColor(...color)
                doc.text(value, pageW - margin - 3, y, { align: "right" })
                y += 6.5
            }

            drawFinRow("Subtotal Cargos:", `$${(formData.total_cargos ?? 0).toLocaleString("es-CO")}`)
            drawFinRow(`IVA (${((formData.iva ?? 0) * 100).toFixed(0)}%):`, `$${(formData.valor_iva ?? 0).toLocaleString("es-CO")}`)
            drawFinRow("Descuentos aplicados:", `-$${(formData.descuentos ?? 0).toLocaleString("es-CO")}`, [220, 38, 38])
            drawFinRow("Abonos registrados:", `-$${(formData.abonos ?? 0).toLocaleString("es-CO")}`, [2, 132, 199])

            if (formData.cambio !== undefined) {
                drawFinRow("Cambio:", `$${(formData.cambio ?? 0).toLocaleString("es-CO")}`)
            }
            if (formData.balance !== undefined) {
                drawFinRow("Balance:", `$${(formData.balance ?? 0).toLocaleString("es-CO")}`)
            }

            // Total destacado
            y += 2
            doc.setFillColor(240, 253, 250)
            doc.setDrawColor(...teal)
            doc.setLineWidth(0.4)
            doc.roundedRect(margin, y, col, 12, 2, 2, "FD")
            doc.setFontSize(10)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...teal)
            doc.text("TOTAL NETO A PAGAR:", margin + 4, y + 8)
            doc.setFontSize(13)
            doc.text(`$${(formData.total_pagar ?? 0).toLocaleString("es-CO", { minimumFractionDigits: 2 })}`, pageW - margin - 4, y + 8, { align: "right" })
            y += 18

            // ── 4. PAGO Y OBSERVACIONES ──────────────────────────
            drawSection("Pago y Observaciones")
            drawRow("Recibo de Caja:", formData.recibo_caja || "No registrado")
            if (formData.observaciones) {
                doc.setFontSize(8.5)
                doc.setFont("helvetica", "bold")
                doc.setTextColor(...gray)
                doc.text("Observaciones:", margin, y)
                y += 5
                doc.setFont("helvetica", "italic")
                doc.setTextColor(82, 82, 91)
                const obsLines = doc.splitTextToSize(`"${formData.observaciones}"`, col - 6)
                doc.text(obsLines, margin + 3, y)
                y += obsLines.length * 5 + 3
            }
            y += 3

            // ── FIRMAS ───────────────────────────────────────────
            const sigY = y + 15
            doc.setDrawColor(161, 161, 170)
            doc.setLineWidth(0.4)
            doc.line(margin, sigY, margin + 65, sigY)
            doc.line(pageW - margin - 65, sigY, pageW - margin, sigY)

            doc.setFontSize(9)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...dark)
            doc.text(formData.nombre_huesped || "Huesped", margin + 32, sigY - 3, { align: "center" })
            doc.setFont("helvetica", "normal")
            doc.setFontSize(7.5)
            doc.setTextColor(...gray)
            doc.text("Firma del Huesped", margin + 32, sigY + 5, { align: "center" })
            doc.text("Recepcionista de Turno", pageW - margin - 32, sigY - 3, { align: "center" })
            doc.text("Firma Autorizada", pageW - margin - 32, sigY + 5, { align: "center" })
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
                "Documento academico emitido por la plataforma EduHotel para el entrenamiento de operaciones hoteleras.",
                pageW / 2, y, { align: "center" }
            )
            doc.text(
                `(c) ${new Date().getFullYear()} EduHotel. Todos los derechos reservados.`,
                pageW / 2, y + 4.5, { align: "center" }
            )

            doc.save(`factura_${formData.nombre_huesped.replace(/\s+/g, "_")}_${formData.numero || "FAC"}.pdf`)
            toast.success("Factura descargada en PDF exitosamente")
        } catch (error) {
            console.error("Error generating PDF:", error)
            toast.error("Error al generar el PDF de la factura")
        } finally {
            setIsGeneratingPDF(false)
        }
    }

    const updateField = <K extends keyof BillingFormData>(
        field: K,
        value: BillingFormData[K]
    ) => {
        if (isReadOnly) return
        setFormData((prev) => {
            const newData = { ...prev, [field]: value }

            const cargoFields: (keyof BillingFormData)[] = [
                "seguro_hotelero",
                "aporte_tmo",
                "restaurante",
                "importe_consumo",
                "mini_bar",
                "gastos_telefono",
                "miscelaneos",
                "lavanderia",
            ]

            if (
                cargoFields.includes(field) ||
                field === "abonos" ||
                field === "iva" ||
                field === "descuentos"
            ) {
                const totalCargos = cargoFields.reduce((sum, key) => {
                    const val = key === field
                        ? (value as number | undefined)
                        : prev[key]
                    return sum + (typeof val === "number" ? val : 0)
                }, 0)

                newData.total_cargos = totalCargos

                const ivaPorcentaje =
                    field === "iva"
                        ? (value as number | undefined) ?? 0
                        : prev.iva ?? 0

                const descuentos =
                    field === "descuentos"
                        ? (value as number | undefined) ?? 0
                        : prev.descuentos ?? 0

                const abonos =
                    field === "abonos"
                        ? (value as number | undefined) ?? 0
                        : prev.abonos ?? 0

                const ivaCalculado = totalCargos * ivaPorcentaje
                newData.valor_iva = ivaCalculado
                newData.total_pagar = totalCargos + ivaCalculado - descuentos - abonos
            }
            return newData
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isReadOnly) return

        setIsLoading(true)
        try {
            const result = await createBilling(formData)
            if (result.success) {
                router.push("/dashboard")
                router.refresh()
                toast.success("Factura guardada exitosamente")
            } else {
                toast.error(result.error || "Error al crear la factura")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error inesperado al guardar el registro")
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
            {/* Datos del Huésped */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-purple-50 text-purple-600 shadow-sm shadow-purple-100/50">
                            <User className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Datos del Huésped</CardTitle>
                            <CardDescription className="text-zinc-500">Información general y detalles de la factura</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 p-8 sm:grid-cols-3">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="nombre_huesped" className="text-sm font-bold text-zinc-700 ml-1">Nombre del Huésped</Label>
                        <Input
                            id="nombre_huesped"
                            placeholder="Ingrese el nombre completo"
                            value={formData.nombre_huesped}
                            onChange={(e) => updateField("nombre_huesped", e.target.value)}
                            required
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cc_huesped" className="text-sm font-bold text-zinc-700 ml-1">CC / Identificación</Label>
                        <Input
                            id="cc_huesped"
                            placeholder="Número de documento"
                            value={formData.cc_huesped}
                            onChange={(e) => updateField("cc_huesped", e.target.value)}
                            required
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="numero" className="text-sm font-bold text-zinc-700 ml-1">Número de Factura</Label>
                        <Input
                            id="numero"
                            placeholder="Ej: FAC-2024-001"
                            value={formData.numero}
                            onChange={(e) => updateField("numero", e.target.value)}
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-zinc-700 ml-1">Fecha</Label>
                        <Popover>
                            <PopoverTrigger asChild disabled={isReadOnly}>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-11 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all",
                                        !formData.fecha && "text-muted-foreground",
                                        isReadOnly && "bg-zinc-50 opacity-100"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 size-4 text-purple-600" />
                                    {formData.fecha ? (
                                        format(formData.fecha, "PPP", { locale: es })
                                    ) : (
                                        <span>Seleccione fecha</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-2xl border-zinc-200 shadow-2xl overflow-hidden bg-white" align="start">
                                <Calendar
                                    mode="single"
                                    selected={formData.fecha}
                                    onSelect={(date) => updateField("fecha", date)}
                                    className="p-4"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="habitacion" className="text-sm font-bold text-zinc-700 ml-1">Habitación</Label>
                        <Input
                            id="habitacion"
                            placeholder="Ej: 301"
                            value={formData.habitacion}
                            onChange={(e) => updateField("habitacion", e.target.value)}
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="personas" className="text-sm font-bold text-zinc-700 ml-1">Personas</Label>
                        <Input
                            id="personas"
                            type="number"
                            min={1}
                            placeholder="1"
                            value={formData.personas ?? ""}
                            onChange={(e) =>
                                updateField("personas", e.target.value ? parseInt(e.target.value) : undefined)
                            }
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Cargos de Servicios */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50">
                            <ShoppingCart className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Cargos de Servicios</CardTitle>
                            <CardDescription className="text-zinc-500">Detalle de consumos y servicios adicionales durante la estadía</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 p-8 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { id: "seguro_hotelero", label: "Seguro Hotelero" },
                        { id: "aporte_tmo", label: "Aporte TMO" },
                        { id: "restaurante", label: "Restaurante" },
                        { id: "importe_consumo", label: "Importe de Consumo" },
                        { id: "mini_bar", label: "Mini Bar" },
                        { id: "gastos_telefono", label: "Gastos de Teléfono" },
                        { id: "miscelaneos", label: "Misceláneos" },
                        { id: "lavanderia", label: "Lavandería" },
                    ].map(({ id, label }) => (
                        <div key={id} className="space-y-2">
                            <Label htmlFor={id} className="text-sm font-bold text-zinc-700 ml-1">{label}</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                                <Input
                                    id={id}
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    placeholder="0.00"
                                    value={(formData[id as keyof BillingFormData] as number | undefined) ?? ""}
                                    onChange={(e) =>
                                        updateField(id as keyof BillingFormData, e.target.value ? parseFloat(e.target.value) : undefined as any)
                                    }
                                    readOnly={isReadOnly}
                                    className={cn(inputClasses, "pl-9")}
                                />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Resumen de Facturación */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100/50">
                            <Receipt className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Resumen de Facturación</CardTitle>
                            <CardDescription className="text-zinc-500">Totales calculados, cargos adicionales, descuentos y balance final</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="total_cargos" className="text-sm font-bold text-zinc-700 ml-1">Total Cargos</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#166b6b] font-bold" />
                                <Input
                                    id="total_cargos"
                                    type="number"
                                    step="0.01"
                                    value={formData.total_cargos ?? "0.00"}
                                    readOnly
                                    className={cn(inputClasses, "pl-9 bg-zinc-50 font-bold text-[#166b6b] border-dashed border-[#166b6b]/30")}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="iva" className="text-sm font-bold text-zinc-700 ml-1">IVA (Porcentaje)</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                                <Input
                                    id="iva"
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    placeholder="0.19"
                                    value={formData.iva ?? ""}
                                    onChange={(e) =>
                                        updateField("iva", e.target.value ? parseFloat(e.target.value) : undefined)
                                    }
                                    readOnly={isReadOnly}
                                    className={cn(inputClasses, "pl-9")}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descuentos" className="text-sm font-bold text-zinc-700 ml-1">Descuentos</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                                <Input
                                    id="descuentos"
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    placeholder="0.00"
                                    value={formData.descuentos ?? ""}
                                    onChange={(e) =>
                                        updateField("descuentos", e.target.value ? parseFloat(e.target.value) : undefined)
                                    }
                                    readOnly={isReadOnly}
                                    className={cn(inputClasses, "pl-9")}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="abonos" className="text-sm font-bold text-zinc-700 ml-1">Abonos</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                                <Input
                                    id="abonos"
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    placeholder="0.00"
                                    value={formData.abonos ?? ""}
                                    onChange={(e) =>
                                        updateField("abonos", e.target.value ? parseFloat(e.target.value) : undefined)
                                    }
                                    readOnly={isReadOnly}
                                    className={cn(inputClasses, "pl-9")}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-zinc-100" />

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="cambio" className="text-sm font-bold text-zinc-700 ml-1">Cambio</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                                <Input
                                    id="cambio"
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    placeholder="0.00"
                                    value={formData.cambio ?? ""}
                                    onChange={(e) =>
                                        updateField("cambio", e.target.value ? parseFloat(e.target.value) : undefined)
                                    }
                                    readOnly={isReadOnly}
                                    className={cn(inputClasses, "pl-9")}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="balance" className="text-sm font-bold text-zinc-700 ml-1">Balance</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                                <Input
                                    id="balance"
                                    type="number"
                                    step="0.01"
                                    min={0}
                                    placeholder="0.00"
                                    value={formData.balance ?? ""}
                                    onChange={(e) =>
                                        updateField("balance", e.target.value ? parseFloat(e.target.value) : undefined)
                                    }
                                    readOnly={isReadOnly}
                                    className={cn(inputClasses, "pl-9")}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator className="bg-zinc-100" />

                    <div className="rounded-[24px] bg-[#166b6b]/5 border border-[#166b6b]/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm shadow-[#166b6b]/5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#166b6b] text-white shadow-md shadow-[#166b6b]/20">
                                <DollarSign className="size-5" />
                            </div>
                            <div className="text-center sm:text-left">
                                <span className="text-base font-bold text-zinc-800">Total Neto a Pagar</span>
                                <p className="text-xs text-zinc-500">Calculado automáticamente con cargos, IVA, descuentos y abonos.</p>
                            </div>
                        </div>
                        <span className="text-3xl font-black tracking-tight text-[#166b6b]">
                            ${(formData.total_pagar ?? 0).toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* Pago y Observaciones */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-amber-50 text-amber-600 shadow-sm shadow-amber-100/50">
                            <CreditCard className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Pago y Observaciones</CardTitle>
                            <CardDescription className="text-zinc-500">Información del recibo de caja y notas especiales de facturación</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 p-8 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="recibo_caja" className="text-sm font-bold text-zinc-700 ml-1">Recibo de Caja</Label>
                        <Input
                            id="recibo_caja"
                            placeholder="Número de recibo de caja"
                            value={formData.recibo_caja}
                            onChange={(e) => updateField("recibo_caja", e.target.value)}
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="observaciones" className="text-sm font-bold text-zinc-700 ml-1">Observaciones</Label>
                        <Textarea
                            id="observaciones"
                            placeholder="Notas adicionales sobre la facturación, convenios o aclaraciones..."
                            value={formData.observaciones}
                            onChange={(e) => updateField("observaciones", e.target.value)}
                            readOnly={isReadOnly}
                            className={cn("min-h-[120px] resize-none rounded-2xl", inputClasses)}
                        />
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
                                    Generar Factura
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