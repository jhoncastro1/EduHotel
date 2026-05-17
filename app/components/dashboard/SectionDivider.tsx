import React from 'react'
import { LucideIcon } from 'lucide-react'

interface SectionDividerProps {
    title: string
    icon: LucideIcon
    color?: string
    lineColor?: string
}

export const SectionDivider: React.FC<SectionDividerProps> = ({
    title,
    icon: Icon,
    color = '#f97316',
    lineColor = '#fdba74',
}) => {
    return (
        <div className="mb-8 mt-8 flex items-center gap-3">
            <div
                className="flex items-center gap-2 whitespace-nowrap"
                style={{ color }}
            >
                <Icon size={20} />

                <h2 className="text-2xl font-bold tracking-tight">
                    {title}
                </h2>
            </div>

            <div
                className="h-px w-full rounded-full"
                style={{ backgroundColor: lineColor }}
            />
        </div>
    )
}