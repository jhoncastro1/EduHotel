import { BillingForm } from '@/app/components/billing/billing-form'
import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getUser } from '@/actions/auth/get-user';
import { redirect } from 'next/navigation';
import { getBilling } from '@/actions/billing/billing';

export default async function BillingPage() {
    const session = await getUser();
    if (!session) redirect("/");

    const billing = await getBilling();

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
                        {billing ? "Facturación Completada" : "Facturación"}
                    </h1>
                    <p className="text-zinc-500 mt-1">
                        {billing
                            ? "Visualice los datos registrados en el sistema."
                            : "Complete el formulario para registrar una nueva facturación."}
                    </p>
                </div>
            </div>

            <BillingForm
                defaultValues={billing || undefined}
                isReadOnly={!!billing}
            />
        </div>
    )
}