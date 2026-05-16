import UpdatePasswordForm from "../components/auth/UpdatePasswordForm";

export default function UpdatePasswordPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#f8fafc]">
            {/* Background elements consistent with Profile/Dashboard */}
            <div className="absolute top-0 left-0 w-full h-64 bg-[#166b6b] -skew-y-3 origin-top-left -z-10 shadow-lg" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#d7eadb] rounded-full blur-3xl opacity-50 -z-10" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#d8eceb] rounded-full blur-3xl opacity-50 -z-10" />

            <main className="z-10 w-full flex justify-center">
                <UpdatePasswordForm />
            </main>
        </div>
    )
}
