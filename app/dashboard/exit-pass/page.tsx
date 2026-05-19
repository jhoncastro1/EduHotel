import { ExitPassForm } from '@/app/components/exit-pass/exit-pass-form'
import { getExitPass } from '@/actions/exit-pass/exit-pass'
import { getUser } from '@/actions/auth/get-user'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ExitPassPage() {
    const session = await getUser();
    if (!session) redirect("/");

    const exitPass = await getExitPass()

    return (
        <div className="min-h-screen bg-zinc-50/50 p-4 sm:p-8">
            <div className="mx-auto max-w-5xl">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-[#166b6b] transition-colors mb-4"
                >
                    <ArrowLeft size={16} />
                    Volver al Dashboard
                </Link>
                <ExitPassForm
                    defaultValues={exitPass || undefined}
                    isReadOnly={!!exitPass}
                />
            </div>
        </div>
    )
}