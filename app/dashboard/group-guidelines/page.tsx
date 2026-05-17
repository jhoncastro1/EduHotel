import { GroupInstructionForm } from '@/app/components/group-guidelines/group-instruction-form'
import { getGroupGuidelines } from '@/actions/group-guidelines/group-guidelines'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function GroupGuidelinesPage() {
    const guidelines = await getGroupGuidelines()

    return (
        <div className="min-h-screen bg-zinc-50/50 p-4 sm:p-8">

            <div className="mx-auto max-w-5xl">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-[#166b6b] transition-colors mb-2"
                >
                    <ArrowLeft size={16} />
                    Volver al Dashboard
                </Link>
                <GroupInstructionForm
                    defaultValues={guidelines || undefined}
                    isReadOnly={!!guidelines}
                />
            </div>
        </div>
    )
}
