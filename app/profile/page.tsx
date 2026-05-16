"use client"

import UserProfile from "./components/UserProfile"

export default function ProfilePage() {
    return (
        <div
            className="
                min-h-screen
                bg-[#f8fafc]
                flex
                flex-col
                items-center
                justify-center
                p-4
                sm:p-8
                relative
                overflow-hidden
            "
        >
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-64 bg-[#166b6b] -skew-y-3 origin-top-left -z-10 shadow-lg" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#d7eadb] rounded-full blur-3xl opacity-50 -z-10" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#d8eceb] rounded-full blur-3xl opacity-50 -z-10" />

            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                <UserProfile />
            </div>
        </div>
    )
}