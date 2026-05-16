import React from 'react'

export default function NavBar() {
    return (
        <>
            <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl bg-[#b9d6bf] px-6 py-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5b8f68] text-white font-bold text-lg">
                        S
                    </div>

                    <div>
                        <h1 className="text-lg font-bold">SENA</h1>
                        <p className="text-xs text-zinc-700">
                            Sistema Hotelero Educativo
                        </p>
                    </div>
                </div>

                {/* <div className="hidden gap-8 font-medium md:flex">
                    <a href="#" className="transition hover:text-[#3e6c49]">
                        Inicio
                    </a>

                    <a href="#" className="transition hover:text-[#3e6c49]">
                        Conoce Más
                    </a>

                    <a href="#" className="transition hover:text-[#3e6c49]">
                        Hotelería
                    </a>
                </div> */}
            </nav>
        </>
    )
}
