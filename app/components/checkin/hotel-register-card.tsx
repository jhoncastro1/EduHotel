import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    User,
    MapPin,
    Phone,
    Briefcase,
    Car,
    Calendar,
    FileText,
    CheckCircle,
    XCircle,
} from "lucide-react"

export interface HotelRegisterForm {
    id: string
    checkin_id?: string
    nombre?: string
    nacionalidad?: string
    tipo_identificacion?: string
    numero_identificacion?: string
    direccion?: string
    ciudad?: string
    pais?: string
    telefono?: string
    oficio?: string
    empresa?: string
    telefono_empresarial?: string
    transporte?: string
    llegada?: string
    salida?: string
    reserva?: string
    motivo_viaje?: string
    procedencia?: string
    destino?: string
    estadia?: string
    acepta_contrato?: boolean
    firma?: string
    tarifa?: number
    completed?: boolean
    deleted?: boolean
    created_at?: string
    updated_at?: string
}

interface HotelRegisterCardProps {
    data: HotelRegisterForm
}

export function HotelRegisterCard({ data }: HotelRegisterCardProps) {
    const formatDate = (date?: string) => {
        if (!date) return "—"
        return new Date(date).toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        })
    }

    const formatCurrency = (amount?: number) => {
        if (amount === undefined || amount === null) return "—"
        return new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "USD",
        }).format(amount)
    }

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl">{data.nombre || "Sin nombre"}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            {data.nacionalidad && `${data.nacionalidad}`}
                            {data.tipo_identificacion && ` · ${data.tipo_identificacion}: ${data.numero_identificacion}`}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {data.completed ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Completado
                            </Badge>
                        ) : (
                            <Badge variant="secondary">
                                <XCircle className="w-3 h-3 mr-1" />
                                Pendiente
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Información de contacto */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground">Dirección</p>
                            <p className="text-sm">
                                {data.direccion || "—"}
                                {data.ciudad && `, ${data.ciudad}`}
                                {data.pais && `, ${data.pais}`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Phone className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground">Teléfono</p>
                            <p className="text-sm">{data.telefono || "—"}</p>
                        </div>
                    </div>
                </div>

                {/* Información laboral */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground">Ocupación</p>
                            <p className="text-sm">{data.oficio || "—"}</p>
                            {data.empresa && (
                                <p className="text-xs text-muted-foreground">{data.empresa}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Car className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs text-muted-foreground">Transporte</p>
                            <p className="text-sm">{data.transporte || "—"}</p>
                        </div>
                    </div>
                </div>

                {/* Fechas de estadía */}
                <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Estadía</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1">
                            <span className="text-sm">
                                <span className="text-muted-foreground">Llegada:</span> {formatDate(data.llegada)}
                            </span>
                            <span className="text-sm">
                                <span className="text-muted-foreground">Salida:</span> {formatDate(data.salida)}
                            </span>
                            {data.estadia && (
                                <span className="text-sm">
                                    <span className="text-muted-foreground">Duración:</span> {data.estadia}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Viaje */}
                <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Detalles del viaje</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
                            {data.procedencia && (
                                <span>
                                    <span className="text-muted-foreground">Procedencia:</span> {data.procedencia}
                                </span>
                            )}
                            {data.destino && (
                                <span>
                                    <span className="text-muted-foreground">Destino:</span> {data.destino}
                                </span>
                            )}
                            {data.motivo_viaje && (
                                <span>
                                    <span className="text-muted-foreground">Motivo:</span> {data.motivo_viaje}
                                </span>
                            )}
                            {data.reserva && (
                                <span>
                                    <span className="text-muted-foreground">Reserva:</span> {data.reserva}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tarifa y contrato */}
                <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                            Contrato:{" "}
                            {data.acepta_contrato ? (
                                <span className="text-green-600 font-medium">Aceptado</span>
                            ) : (
                                <span className="text-muted-foreground">No aceptado</span>
                            )}
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">Tarifa</p>
                        <p className="text-lg font-semibold">{formatCurrency(data.tarifa)}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
