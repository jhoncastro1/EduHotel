"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, User, Key, ShieldCheck, FileDown, CheckCircle2, Loader2, ChevronRight, Hash, Users, Award } from "lucide-react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { createExitPass } from "@/actions/exit-pass/exit-pass"
import toast from "react-hot-toast"

export interface ExitPassFormData {
    client_name: string
    departure_date: Date | undefined
    room_number: string
    guest_count: number
    left_key: boolean
    cashier_name: string
    cashier_stamp: string
}

interface ExitPassFormProps {
    onSubmit?: (data: ExitPassFormData) => void
    defaultValues?: Partial<ExitPassFormData>
    isLoading?: boolean
    isReadOnly?: boolean
}

export function ExitPassForm({ onSubmit, defaultValues, isLoading: initialLoading = false, isReadOnly = false }: ExitPassFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(initialLoading)
    const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false)
    const [formData, setFormData] = React.useState<ExitPassFormData>({
        client_name: defaultValues?.client_name ?? "",
        departure_date: defaultValues?.departure_date ? new Date(defaultValues.departure_date) : undefined,
        room_number: defaultValues?.room_number ?? "",
        guest_count: defaultValues?.guest_count ?? 1,
        left_key: defaultValues?.left_key ?? false,
        cashier_name: defaultValues?.cashier_name ?? "",
        cashier_stamp: defaultValues?.cashier_stamp ?? "",
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

            const teal: [number, number, number] = [22, 107, 107]
            const dark: [number, number, number] = [24, 24, 27]
            const gray: [number, number, number] = [113, 113, 122]
            const emeraldDark: [number, number, number] = [4, 120, 87]
            const pageW = 210
            const margin = 18
            const col = pageW - margin * 2
            let y = 18

            const departureStr = formData.departure_date
                ? format(formData.departure_date, "dd/MM/yyyy", { locale: es })
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
            doc.setFillColor(209, 250, 229)
            doc.roundedRect(pageW - margin - 38, y - 6, 38, 8, 2, 2, "F")
            doc.setFontSize(7)
            doc.setTextColor(...emeraldDark)
            doc.setFont("helvetica", "bold")
            doc.text("PASE DE SALIDA OK", pageW - margin - 19, y - 1.5, { align: "center" })

            doc.setFontSize(9)
            doc.setTextColor(...dark)
            doc.setFont("helvetica", "bold")
            doc.text(`HABITACIÓN: ${formData.room_number || "N/A"}`, pageW - margin, y + 5, { align: "right" })
            doc.setFont("helvetica", "normal")
            doc.setTextColor(...gray)
            doc.setFontSize(8)
            doc.text(`Fecha Emisión: ${new Date().toLocaleDateString("es-CO")}`, pageW - margin, y + 10, { align: "right" })

            y += 15
            doc.setDrawColor(...teal)
            doc.setLineWidth(0.6)
            doc.line(margin, y, pageW - margin, y)
            y += 8

            // Título central
            doc.setFontSize(14)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...dark)
            doc.text("PASE DE SALIDA / EXIT PASS", pageW / 2, y, { align: "center" })
            y += 10

            // ── Helpers ──────────────────────────────────────────
            const drawSection = (title: string) => {
                doc.setFontSize(8.5)
                doc.setFont("helvetica", "bold")
                doc.setTextColor(...teal)
                doc.text(title.toUpperCase(), margin, y)
                doc.setDrawColor(...teal)
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
                y += 8
            }

            // ── 1. DETALLES DEL CLIENTE Y HABITACIÓN ──────────────
            drawSection("1. Información del Cliente y Habitación")
            drawTwoCol("Nombre del Cliente:", formData.client_name, "Habitación:", formData.room_number)
            drawTwoCol("Fecha de Salida:", departureStr, "Huéspedes:", String(formData.guest_count))
            y += 4

            // ── 2. CONTROL DE LLAVES ──────────────────────────────
            drawSection("2. Control de Entrega y Llaves")
            doc.setFontSize(9)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...gray)
            doc.text("Estado Entrega Llave:", margin, y)
            doc.setFont("helvetica", "bold")
            if (formData.left_key) {
                doc.setTextColor(...emeraldDark)
                doc.text("ENTREGADA / COMPLETA", margin + 38, y)
            } else {
                doc.setTextColor(185, 28, 28) // Red
                doc.text("PENDIENTE / NO ENTREGADA", margin + 38, y)
            }
            y += 10

            // ── 3. DETALLE DE AUTORIZACIÓN ────────────────────────
            drawSection("3. Autorización de Caja y Facturación")
            drawTwoCol("Cajero Responsable:", formData.cashier_name, "Código de Sello:", formData.cashier_stamp || "N/A")
            y += 2

            // Recuadro del Sello Digital Académico
            if (formData.cashier_stamp) {
                doc.setFillColor(240, 253, 250)
                doc.setDrawColor(187, 247, 208)
                doc.roundedRect(margin, y, col, 22, 3, 3, "FD")

                doc.setFontSize(8.5)
                doc.setFont("helvetica", "bold")
                doc.setTextColor(...emeraldDark)
                doc.text("VALIDACIÓN DE PASE DE SALIDA DIGITAL", margin + 6, y + 6)

                doc.setFont("helvetica", "normal")
                doc.setFontSize(7.5)
                doc.setTextColor(55, 65, 81)
                doc.text(`Certificado emitido digitalmente bajo la validación del Cajero/a: ${formData.cashier_name}.`, margin + 6, y + 11)
                doc.text(`Sello de Transacción: ${formData.cashier_stamp} - Sin Cargos Pendientes en Recepción.`, margin + 6, y + 16)
                y += 28
            } else {
                y += 4
            }

            // ── FIRMAS ───────────────────────────────────────────
            const sigY = y + 20
            doc.setDrawColor(161, 161, 170)
            doc.setLineWidth(0.4)
            doc.line(margin, sigY, margin + 65, sigY)
            doc.line(pageW - margin - 65, sigY, pageW - margin, sigY)

            doc.setFontSize(9)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(...dark)
            doc.text(formData.client_name || "Cliente / Huésped", margin + 32, sigY - 3, { align: "center" })
            doc.setFont("helvetica", "normal")
            doc.setFontSize(7.5)
            doc.setTextColor(...gray)
            doc.text("Firma del Cliente", margin + 32, sigY + 5, { align: "center" })
            doc.text(formData.cashier_name || "Cajero de Recepción", pageW - margin - 32, sigY - 3, { align: "center" })
            doc.text("Firma y Sello de Autorización", pageW - margin - 32, sigY + 5, { align: "center" })
            y = sigY + 20

            // ── FOOTER ───────────────────────────────────────────
            doc.setDrawColor(228, 228, 231)
            doc.setLineWidth(0.3)
            doc.line(margin, y, pageW - margin, y)
            y += 5
            doc.setFontSize(7)
            doc.setTextColor(161, 161, 170)
            doc.setFont("helvetica", "normal")
            doc.text(
                "Documento académico emitido por la plataforma EduHotel para el entrenamiento de operaciones hoteleras de salida.",
                pageW / 2, y, { align: "center" }
            )
            doc.text(
                `(c) ${new Date().getFullYear()} EduHotel. Todos los derechos reservados.`,
                pageW / 2, y + 4.5, { align: "center" }
            )

            doc.save(`pase_salida_${formData.room_number || "hab"}_${formData.client_name.replace(/\s+/g, "_")}.pdf`)
            toast.success("Pase de Salida descargado en PDF exitosamente")
        } catch (error) {
            console.error("Error generating PDF:", error)
            toast.error("Error al generar el PDF del Pase de Salida")
        } finally {
            setIsGeneratingPDF(false)
        }
    }

    const updateField = <K extends keyof ExitPassFormData>(
        field: K,
        value: ExitPassFormData[K]
    ) => {
        if (isReadOnly) return
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isReadOnly) return

        setIsLoading(true)
        try {
            const result = await createExitPass(formData)
            if (result.success) {
                router.push("/dashboard")
                router.refresh()
                toast.success("Pase de Salida registrado exitosamente")
            } else {
                toast.error(result.error || "Error al registrar el Pase de Salida")
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
            {/* Header / Intro */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Pase de Salida (Exit Pass)</h1>
                <p className="text-zinc-500 max-w-2xl">
                    Registre el control de salida del huésped, entrega de llaves y confirmación de caja para liberar la habitación.
                </p>
            </div>

            {/* Datos de Salida */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-teal-50 text-[#166b6b] shadow-sm shadow-[#166b6b]/10">
                            <User className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Datos de la Habitación y Cliente</CardTitle>
                            <CardDescription className="text-zinc-500">Información general del huésped que realiza Check-Out</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 p-8 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="client_name" className="text-sm font-bold text-zinc-700 ml-1">Nombre del Cliente</Label>
                        <Input
                            id="client_name"
                            placeholder="Nombre completo del huésped"
                            value={formData.client_name}
                            onChange={(e) => updateField("client_name", e.target.value)}
                            required
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="room_number" className="text-sm font-bold text-zinc-700 ml-1">Habitación</Label>
                        <div className="relative">
                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                            <Input
                                id="room_number"
                                placeholder="Ej: 405"
                                value={formData.room_number}
                                onChange={(e) => updateField("room_number", e.target.value)}
                                required
                                readOnly={isReadOnly}
                                className={cn(inputClasses, "pl-9")}
                            />
                        </div>
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
                    <div className="space-y-2 sm:col-span-2 lg:col-span-2">
                        <Label className="text-sm font-bold text-zinc-700 ml-1">Fecha de Salida</Label>
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
                                    <CalendarIcon className="mr-2 size-4 text-[#166b6b]" />
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
                                    className="p-4"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardContent>
            </Card>

            {/* Control de llaves */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100/50">
                            <Key className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Control de Llaves</CardTitle>
                            <CardDescription className="text-zinc-500">Verifique la recepción física de las llaves de la habitación</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <div className={cn(
                        "flex items-start gap-4 p-6 rounded-[24px] transition-all duration-300",
                        formData.left_key ? "bg-emerald-50/50 border border-emerald-100 shadow-inner" : "bg-zinc-50 border border-zinc-100"
                    )}>
                        <Checkbox
                            id="left_key"
                            disabled={isReadOnly}
                            checked={formData.left_key}
                            onCheckedChange={(checked) => updateField("left_key", checked === true)}
                            className="mt-1 size-5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 rounded-md"
                        />
                        <div className="grid gap-2 leading-none">
                            <Label htmlFor="left_key" className="cursor-pointer text-base font-bold text-zinc-800">
                                ¿El huésped entregó todas las llaves?
                            </Label>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                Marque esta opción únicamente si la llave física o tarjeta electrónica fue devuelta en el mostrador.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sello de Recepción */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-amber-50 text-amber-600 shadow-sm shadow-amber-100/50">
                            <ShieldCheck className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Validación y Autorización de Caja</CardTitle>
                            <CardDescription className="text-zinc-500">Datos del recepcionista/cajero de turno y firma digital</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 p-8 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="cashier_name" className="text-sm font-bold text-zinc-700 ml-1">Nombre del Cajero/a</Label>
                        <Input
                            id="cashier_name"
                            placeholder="Nombre del recepcionista responsable"
                            value={formData.cashier_name}
                            onChange={(e) => updateField("cashier_name", e.target.value)}
                            required
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cashier_stamp" className="text-sm font-bold text-zinc-700 ml-1">Código de Sello / Firma Digital</Label>
                        <Input
                            id="cashier_stamp"
                            placeholder="Ej: SEAL-9204-EDUHOTEL"
                            value={formData.cashier_stamp}
                            onChange={(e) => updateField("cashier_stamp", e.target.value)}
                            required
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>

                    {formData.cashier_stamp && (
                        <div className="sm:col-span-2 p-6 rounded-[24px] border border-dashed border-[#166b6b]/30 bg-[#166b6b]/5 flex flex-col sm:flex-row items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-[#166b6b] text-white flex items-center justify-center shadow-md">
                                <Award className="size-6" />
                            </div>
                            <div>
                                <span className="text-sm font-black text-zinc-800 uppercase tracking-wider block">Vista Previa de Sello Académico</span>
                                <span className="text-xs text-zinc-500 block mt-0.5">
                                    [SELLO EMITIDO] CAJERO: <b className="text-zinc-700">{formData.cashier_name || "—"}</b> - REF: <span className="font-mono text-zinc-700 bg-zinc-200/60 px-1.5 py-0.5 rounded">{formData.cashier_stamp}</span>
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
                            className="rounded-[16px] px-10 h-12 font-bold bg-[#166b6b] hover:bg-[#124f4f] text-white shadow-xl shadow-[#166b6b]/30 transition-all active:scale-95 hover:translate-y-[-2px]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    Completar Pase de Salida
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
                                    Descargar Pase PDF
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            onClick={() => router.push("/dashboard")}
                            className="rounded-[16px] px-10 h-12 font-bold bg-[#166b6b] hover:bg-[#124f4f] text-white shadow-xl shadow-[#166b6b]/30 transition-all active:scale-95 hover:translate-y-[-2px]"
                        >
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            Pase Autorizado
                        </Button>
                    </>
                )}
            </div>
        </form>
    )
}
