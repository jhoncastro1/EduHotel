"use client"

import * as React from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, User, Building2, Car, Plane, FileText, DollarSign, CheckCircle2, Loader2, FileDown } from "lucide-react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { createCheckIn } from "@/actions/checkin/checkin"
import toast from "react-hot-toast"

export interface HotelRegisterFormData {
    nombre: string
    nacionalidad: string
    tipo_identificacion: string
    numero_identificacion: string
    direccion: string
    ciudad: string
    pais: string
    telefono: string
    oficio: string
    empresa: string
    telefono_empresarial: string
    transporte: string
    llegada: Date | undefined
    salida: Date | undefined
    reserva: string
    motivo_viaje: string
    procedencia: string
    destino: string
    estadia: string
    acepta_contrato: boolean
    firma: string
    tarifa: number | undefined
}

interface HotelRegisterFormProps {
    onSubmit?: (data: HotelRegisterFormData) => void
    defaultValues?: Partial<HotelRegisterFormData>
    isLoading?: boolean
    isReadOnly?: boolean
}

const tiposIdentificacion = [
    { value: "cedula", label: "Cédula de Ciudadanía" },
    { value: "pasaporte", label: "Pasaporte" },
    { value: "cedula_extranjeria", label: "Cédula de Extranjería" },
    { value: "tarjeta_identidad", label: "Tarjeta de Identidad" },
]

const tiposTransporte = [
    { value: "aereo", label: "Aéreo" },
    { value: "terrestre", label: "Terrestre" },
    { value: "maritimo", label: "Marítimo" },
    { value: "propio", label: "Vehículo Propio" },
]

const motivosViaje = [
    { value: "negocios", label: "Negocios" },
    { value: "turismo", label: "Turismo" },
    { value: "trabajo", label: "Trabajo" },
    { value: "salud", label: "Salud" },
    { value: "familia", label: "Visita Familiar" },
    { value: "otro", label: "Otro" },
]

export function HotelRegisterForm({ onSubmit, defaultValues, isLoading: initialLoading = false, isReadOnly = false }: HotelRegisterFormProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState(initialLoading)
    const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false)
    const [formData, setFormData] = React.useState<HotelRegisterFormData>({
        nombre: defaultValues?.nombre ?? "",
        nacionalidad: defaultValues?.nacionalidad ?? "",
        tipo_identificacion: defaultValues?.tipo_identificacion ?? "",
        numero_identificacion: defaultValues?.numero_identificacion ?? "",
        direccion: defaultValues?.direccion ?? "",
        ciudad: defaultValues?.ciudad ?? "",
        pais: defaultValues?.pais ?? "",
        telefono: defaultValues?.telefono ?? "",
        oficio: defaultValues?.oficio ?? "",
        empresa: defaultValues?.empresa ?? "",
        telefono_empresarial: defaultValues?.telefono_empresarial ?? "",
        transporte: defaultValues?.transporte ?? "",
        llegada: defaultValues?.llegada ? new Date(defaultValues.llegada) : undefined,
        salida: defaultValues?.salida ? new Date(defaultValues.salida) : undefined,
        reserva: defaultValues?.reserva ?? "",
        motivo_viaje: defaultValues?.motivo_viaje ?? "",
        procedencia: defaultValues?.procedencia ?? "",
        destino: defaultValues?.destino ?? "",
        estadia: defaultValues?.estadia ?? "",
        acepta_contrato: defaultValues?.acepta_contrato ?? false,
        firma: defaultValues?.firma ?? "",
        tarifa: defaultValues?.tarifa,
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
            const blue: [number, number, number] = [30, 64, 175]
            const pageW = 210
            const margin = 18
            const col = pageW - margin * 2
            let y = 18

            const tipoIdMap: Record<string, string> = {
                cedula: "Cédula de Ciudadanía",
                pasaporte: "Pasaporte",
                cedula_extranjeria: "Cédula de Extranjería",
                tarjeta_identidad: "Tarjeta de Identidad",
            }
            const transporteMap: Record<string, string> = {
                aereo: "Aéreo",
                terrestre: "Terrestre",
                maritimo: "Marítimo",
                propio: "Vehículo Propio",
            }
            const motivoMap: Record<string, string> = {
                negocios: "Negocios",
                turismo: "Turismo",
                trabajo: "Trabajo",
                salud: "Salud",
                familia: "Visita Familiar",
                otro: "Otro",
            }

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
            doc.text("Practicas Profesionales de Gestion Hotelera", margin, y + 6)

            // Badge derecha
            doc.setFillColor(219, 234, 254)
            doc.roundedRect(pageW - margin - 46, y - 6, 46, 8, 2, 2, "F")
            doc.setFontSize(7)
            doc.setTextColor(...blue)
            doc.setFont("helvetica", "bold")
            doc.text("REGISTRO DE HUESPED", pageW - margin - 23, y - 1.5, { align: "center" })

            doc.setFontSize(9)
            doc.setTextColor(...dark)
            doc.setFont("helvetica", "bold")
            doc.text(`RESERVA: ${formData.reserva || "S/N"}`, pageW - margin, y + 5, { align: "right" })
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
            doc.text("TARJETA DE REGISTRO HOTELERO", pageW / 2, y, { align: "center" })
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

            // ── 1. DATOS PERSONALES ──────────────────────────────
            drawSection("1. Informacion Personal")
            drawRow("Nombre completo:", formData.nombre)
            drawRow("Nacionalidad:", formData.nacionalidad)
            drawRow("Identificacion:", `${tipoIdMap[formData.tipo_identificacion] || formData.tipo_identificacion} - ${formData.numero_identificacion}`)
            drawRow("Telefono:", formData.telefono)
            y += 3

            // ── 2. RESIDENCIA ────────────────────────────────────
            drawSection("2. Procedencia y Residencia")
            drawRow("Direccion:", formData.direccion)
            drawTwoCol("Ciudad:", formData.ciudad, "Pais:", formData.pais)
            drawTwoCol("Procedencia:", formData.procedencia || "No registrada", "Destino Final:", formData.destino || "No registrado")
            y += 3

            // ── 3. LABORAL (opcional) ────────────────────────────
            if (formData.oficio || formData.empresa) {
                drawSection("3. Informacion Laboral")
                drawTwoCol("Profesion / Oficio:", formData.oficio || "No registrado", "Empresa:", formData.empresa || "No registrada")
                drawRow("Telefono Laboral:", formData.telefono_empresarial || "No registrado")
                y += 3
            }

            // ── 4. ESTADÍA ───────────────────────────────────────
            drawSection("4. Datos del Viaje y Estadia")
            drawTwoCol("Fecha Llegada:", llegadaStr, "Fecha Salida:", salidaStr)
            drawTwoCol("Duracion:", formData.estadia || "No especificada", "Transporte:", transporteMap[formData.transporte] || formData.transporte || "No registrado")
            drawTwoCol("Motivo:", motivoMap[formData.motivo_viaje] || formData.motivo_viaje || "No registrado", "Tarifa/Noche:", formData.tarifa ? `$${formData.tarifa.toLocaleString("es-CO")} COP` : "$0 COP")
            y += 5

            // ── CONTRATO ─────────────────────────────────────────
            doc.setFillColor(245, 255, 250)
            doc.setDrawColor(187, 247, 208)
            doc.roundedRect(margin, y, col, 22, 3, 3, "FD")
            doc.setFontSize(8)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(22, 101, 52)
            doc.text("Contrato de Hospedaje y Consentimiento", margin + 4, y + 6)
            doc.setFont("helvetica", "normal")
            doc.setFontSize(7.5)
            doc.setTextColor(55, 65, 81)
            const contratoText = doc.splitTextToSize(
                "El huesped declara que los datos suministrados son verídicos. Acepta los terminos y condiciones del hotel, incluyendo politicas de cancelacion, normas de convivencia y el tratamiento de datos personales conforme a la legislacion vigente. [v] Acepto expresamente las condiciones al momento del registro.",
                col - 8
            )
            doc.text(contratoText, margin + 4, y + 12)
            y += 30

            // ── FIRMAS ───────────────────────────────────────────
            const sigY = y + 15
            doc.setDrawColor(161, 161, 170)
            doc.setLineWidth(0.4)
            doc.line(margin, sigY, margin + 65, sigY)
            doc.line(pageW - margin - 65, sigY, pageW - margin, sigY)

            doc.setFontSize(9)
            doc.setFont("helvetica", "bolditalic")
            doc.setTextColor(...dark)
            doc.text(formData.firma || formData.nombre, margin + 32, sigY - 3, { align: "center" })
            doc.setFont("helvetica", "normal")
            doc.setFontSize(7.5)
            doc.setTextColor(...gray)
            doc.text("Firma Digital del Huesped", margin + 32, sigY + 5, { align: "center" })
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

            doc.save(`registro_huesped_${formData.nombre.replace(/\s+/g, "_")}.pdf`)
            toast.success("Registro de Huésped descargado en PDF exitosamente")
        } catch (error) {
            console.error("Error generating PDF:", error)
            toast.error("Error al generar el PDF de registro")
        } finally {
            setIsGeneratingPDF(false)
        }
    }

    const updateField = <K extends keyof HotelRegisterFormData>(
        field: K,
        value: HotelRegisterFormData[K]
    ) => {
        if (isReadOnly) return
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isReadOnly) return

        setIsLoading(true)
        try {
            const result = await createCheckIn(formData)
            if (result.success) {
                router.push("/dashboard")
                router.refresh()
            } else {
                alert("Error al guardar el registro: " + result.error)
            }
        } catch (error) {
            console.error(error)
            alert("Error inesperado al guardar el registro")
        } finally {
            setIsLoading(false)
        }
    }

    const inputClasses = cn(
        "transition-all duration-200 focus:ring-2 focus:ring-[#166b6b]/20 focus:border-[#166b6b] h-11 rounded-xl",
        isReadOnly && "bg-zinc-50 border-zinc-200 text-zinc-600 cursor-default opacity-80"
    )

    const selectTriggerClasses = cn(
        inputClasses,
        "flex items-center gap-2"
    )

    const sectionCardClasses = "rounded-[32px] border border-zinc-200 bg-white shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"

    return (
        <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Datos Personales */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/50">
                            <User className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Datos Personales</CardTitle>
                            <CardDescription className="text-zinc-500">Información básica del huésped</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 p-8 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="nombre" className="text-sm font-bold text-zinc-700 ml-1">Nombre Completo</Label>
                        <Input
                            id="nombre"
                            placeholder="Ingrese su nombre completo"
                            value={formData.nombre}
                            onChange={(e) => updateField("nombre", e.target.value)}
                            required
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nacionalidad" className="text-sm font-bold text-zinc-700 ml-1">Nacionalidad</Label>
                        <Input
                            id="nacionalidad"
                            placeholder="Ej: Colombiana"
                            value={formData.nacionalidad}
                            onChange={(e) => updateField("nacionalidad", e.target.value)}
                            required
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tipo_identificacion" className="text-sm font-bold text-zinc-700 ml-1">Tipo de Identificación</Label>
                        <Select
                            disabled={isReadOnly}
                            value={formData.tipo_identificacion}
                            onValueChange={(value) => updateField("tipo_identificacion", value)}
                        >
                            <SelectTrigger id="tipo_identificacion" className={selectTriggerClasses}>
                                <FileText className="size-4 text-zinc-400 mr-1" />
                                <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-zinc-200 shadow-xl bg-white">
                                {tiposIdentificacion.map((tipo) => (
                                    <SelectItem key={tipo.value} value={tipo.value} className="rounded-xl py-2.5 focus:bg-blue-50 focus:text-blue-700">
                                        {tipo.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="numero_identificacion" className="text-sm font-bold text-zinc-700 ml-1">Número de Identificación</Label>
                        <Input
                            id="numero_identificacion"
                            placeholder="Ingrese su número de documento"
                            value={formData.numero_identificacion}
                            onChange={(e) => updateField("numero_identificacion", e.target.value)}
                            required
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="telefono" className="text-sm font-bold text-zinc-700 ml-1">Teléfono Personal</Label>
                        <div className="relative">
                            <Input
                                id="telefono"
                                type="tel"
                                placeholder="+57 300 123 4567"
                                value={formData.telefono}
                                onChange={(e) => updateField("telefono", e.target.value)}
                                required
                                readOnly={isReadOnly}
                                className={inputClasses}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dirección */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-green-50 text-green-600 shadow-sm shadow-green-100/50">
                            <Building2 className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Dirección de Residencia</CardTitle>
                            <CardDescription className="text-zinc-500">Información de contacto y ubicación</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 p-8 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="direccion" className="text-sm font-bold text-zinc-700 ml-1">Dirección</Label>
                        <Input
                            id="direccion"
                            placeholder="Calle, número, apartamento"
                            value={formData.direccion}
                            onChange={(e) => updateField("direccion", e.target.value)}
                            required
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ciudad" className="text-sm font-bold text-zinc-700 ml-1">Ciudad</Label>
                        <Input
                            id="ciudad"
                            placeholder="Ej: Bogotá"
                            value={formData.ciudad}
                            onChange={(e) => updateField("ciudad", e.target.value)}
                            required
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="pais" className="text-sm font-bold text-zinc-700 ml-1">País</Label>
                        <Input
                            id="pais"
                            placeholder="Ej: Colombia"
                            value={formData.pais}
                            onChange={(e) => updateField("pais", e.target.value)}
                            required
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Información Laboral */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-amber-50 text-amber-600 shadow-sm shadow-amber-100/50">
                            <FileText className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Información Laboral</CardTitle>
                            <CardDescription className="text-zinc-500">Datos de empleo (opcional)</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 p-8 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="oficio" className="text-sm font-bold text-zinc-700 ml-1">Oficio / Profesión</Label>
                        <Input
                            id="oficio"
                            placeholder="Ej: Ingeniero de Software"
                            value={formData.oficio}
                            onChange={(e) => updateField("oficio", e.target.value)}
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="empresa" className="text-sm font-bold text-zinc-700 ml-1">Empresa</Label>
                        <Input
                            id="empresa"
                            placeholder="Nombre de la empresa"
                            value={formData.empresa}
                            onChange={(e) => updateField("empresa", e.target.value)}
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="telefono_empresarial" className="text-sm font-bold text-zinc-700 ml-1">Teléfono Empresarial</Label>
                        <Input
                            id="telefono_empresarial"
                            type="tel"
                            placeholder="+57 1 234 5678"
                            value={formData.telefono_empresarial}
                            onChange={(e) => updateField("telefono_empresarial", e.target.value)}
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Transporte y Fechas */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100/50">
                            <Car className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Transporte y Estadía</CardTitle>
                            <CardDescription className="text-zinc-500">Información de llegada y salida</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 p-8 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="transporte" className="text-sm font-bold text-zinc-700 ml-1">Medio de Transporte</Label>
                        <Select
                            disabled={isReadOnly}
                            value={formData.transporte}
                            onValueChange={(value) => updateField("transporte", value)}
                        >
                            <SelectTrigger id="transporte" className={selectTriggerClasses}>
                                <Car className="size-4 text-zinc-400 mr-1" />
                                <SelectValue placeholder="Seleccione transporte" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-zinc-200 shadow-xl bg-white">
                                {tiposTransporte.map((tipo) => (
                                    <SelectItem key={tipo.value} value={tipo.value} className="rounded-xl py-2.5 focus:bg-indigo-50 focus:text-indigo-700">
                                        {tipo.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="estadia" className="text-sm font-bold text-zinc-700 ml-1">Duración de Estadía</Label>
                        <Input
                            id="estadia"
                            placeholder="Ej: 3 noches"
                            value={formData.estadia}
                            onChange={(e) => updateField("estadia", e.target.value)}
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-zinc-700 ml-1">Fecha de Llegada</Label>
                        <Popover>
                            <PopoverTrigger asChild disabled={isReadOnly}>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-11 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all focus:ring-2 focus:ring-[#166b6b]/20 focus:border-[#166b6b]",
                                        !formData.llegada && "text-muted-foreground",
                                        isReadOnly && "bg-zinc-50 opacity-100"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 size-4 text-[#166b6b]" />
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
                        <Label className="text-sm font-bold text-zinc-700 ml-1">Fecha de Salida</Label>
                        <Popover>
                            <PopoverTrigger asChild disabled={isReadOnly}>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal h-11 rounded-xl border border-zinc-200 hover:bg-zinc-50 transition-all focus:ring-2 focus:ring-[#166b6b]/20 focus:border-[#166b6b]",
                                        !formData.salida && "text-muted-foreground",
                                        isReadOnly && "bg-zinc-50 opacity-100"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 size-4 text-[#166b6b]" />
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
                </CardContent>
            </Card>

            {/* Detalles del Viaje */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-rose-50 text-rose-600 shadow-sm shadow-rose-100/50">
                            <Plane className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Detalles del Viaje</CardTitle>
                            <CardDescription className="text-zinc-500">Información sobre su itinerario</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="grid gap-6 p-8 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="procedencia" className="text-sm font-bold text-zinc-700 ml-1">Procedencia</Label>
                        <Input
                            id="procedencia"
                            placeholder="Ciudad de origen"
                            value={formData.procedencia}
                            onChange={(e) => updateField("procedencia", e.target.value)}
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="destino" className="text-sm font-bold text-zinc-700 ml-1">Destino Final</Label>
                        <Input
                            id="destino"
                            placeholder="Ciudad de destino"
                            value={formData.destino}
                            onChange={(e) => updateField("destino", e.target.value)}
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="motivo_viaje" className="text-sm font-bold text-zinc-700 ml-1">Motivo del Viaje</Label>
                        <Select
                            disabled={isReadOnly}
                            value={formData.motivo_viaje}
                            onValueChange={(value) => updateField("motivo_viaje", value)}
                        >
                            <SelectTrigger id="motivo_viaje" className={selectTriggerClasses}>
                                <Plane className="size-4 text-zinc-400 mr-1" />
                                <SelectValue placeholder="Seleccione motivo" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-zinc-200 shadow-xl bg-white">
                                {motivosViaje.map((motivo) => (
                                    <SelectItem key={motivo.value} value={motivo.value} className="rounded-xl py-2.5 focus:bg-rose-50 focus:text-rose-700">
                                        {motivo.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reserva" className="text-sm font-bold text-zinc-700 ml-1">Número de Reserva</Label>
                        <Input
                            id="reserva"
                            placeholder="Ej: RES-2024-001"
                            value={formData.reserva}
                            onChange={(e) => updateField("reserva", e.target.value)}
                            readOnly={isReadOnly}
                            className={inputClasses}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Tarifa y Contrato */}
            <Card className={sectionCardClasses}>
                <CardHeader className="pb-4 bg-zinc-50/30 border-b border-zinc-100/50">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-100/50">
                            <DollarSign className="size-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold tracking-tight text-zinc-900">Tarifa y Condiciones</CardTitle>
                            <CardDescription className="text-zinc-500">Información de pago y aceptación de términos</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 p-8">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="tarifa" className="text-sm font-bold text-zinc-700 ml-1">Tarifa por Noche</Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
                                <Input
                                    id="tarifa"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.tarifa ?? ""}
                                    onChange={(e) =>
                                        updateField(
                                            "tarifa",
                                            e.target.value ? parseFloat(e.target.value) : undefined
                                        )
                                    }
                                    readOnly={isReadOnly}
                                    className={cn(inputClasses, "pl-9")}
                                />
                            </div>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="firma" className="text-sm font-bold text-zinc-700 ml-1">Firma Digital</Label>
                            <Textarea
                                id="firma"
                                placeholder="Escriba su nombre completo como firma digital"
                                value={formData.firma}
                                onChange={(e) => updateField("firma", e.target.value)}
                                className={cn("resize-none rounded-2xl min-h-[100px]", inputClasses)}
                                readOnly={isReadOnly}
                            />
                        </div>
                    </div>

                    <Separator className="bg-zinc-100" />

                    <div className={cn(
                        "flex items-start gap-4 p-6 rounded-[24px] transition-all duration-300",
                        formData.acepta_contrato ? "bg-emerald-50/50 border border-emerald-100 shadow-inner" : "bg-zinc-50 border border-zinc-100"
                    )}>
                        <Checkbox
                            id="acepta_contrato"
                            disabled={isReadOnly}
                            checked={formData.acepta_contrato}
                            onCheckedChange={(checked) =>
                                updateField("acepta_contrato", checked === true)
                            }
                            className="mt-1 size-5 data-[state=checked]:bg-[#166b6b] data-[state=checked]:border-[#166b6b] rounded-md transition-all"
                        />
                        <div className="grid gap-2 leading-none">
                            <Label
                                htmlFor="acepta_contrato"
                                className="cursor-pointer text-base font-bold text-zinc-800 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Acepto los términos y condiciones
                            </Label>
                            <p className="text-sm text-zinc-500 leading-relaxed">
                                Al marcar esta casilla, acepta el contrato de hospedaje y las políticas
                                del hotel, incluyendo las normas de convivencia y los términos de
                                cancelación.
                            </p>
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
                            disabled={isLoading || !formData.acepta_contrato}
                            className="rounded-[16px] px-10 h-12 font-bold bg-[#166b6b] hover:bg-[#124f4f] text-white shadow-xl shadow-[#166b6b]/30 transition-all active:scale-95 hover:translate-y-[-2px]"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                "Registrar Huésped"
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