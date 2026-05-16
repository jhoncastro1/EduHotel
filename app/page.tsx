'use client'

import Image from "next/image";
import { useState } from "react";
import {
  BookOpen,
  UserCog,
  Hotel,
  ArrowRight,
  ShieldCheck,
  UserPlus,
} from "lucide-react";

import NavBar from "./components/NavBar";
import { SignInForm } from "./components/auth/SignInForm";
import { RegisterForm } from "./components/auth/RegisterForm";

export default function Home() {
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f7f6] text-zinc-900">
      {/* NAVBAR */}
      <header className="w-full px-6 py-4">
        <NavBar />
      </header>

      {/* HERO */}
      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-6 py-10 lg:grid-cols-2">
        {/* LEFT */}
        <section className="flex flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#d7eadb] px-4 py-2 text-sm font-medium text-[#3f6f4a]">
            <ShieldCheck size={16} />
            Plataforma académica hotelera
          </div>

          <h1 className="max-w-xl text-5xl font-black leading-tight md:text-7xl">
            Bienvenido a tu{" "}
            <span className="relative text-[#4f8f60]">
              Software
              <span className="absolute bottom-2 left-0 -z-10 h-4 w-full bg-[#ffd2e1]" />
            </span>{" "}
            de Hotelería
          </h1>

          <p className="mt-8 max-w-lg text-lg leading-8 text-zinc-600">
            Gestiona procesos hoteleros, formularios, registros académicos y
            accesos administrativos desde una plataforma moderna, intuitiva y
            diseñada para estudiantes.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={() => setOpenLogin(true)}
              className="rounded-2xl bg-[#4f8f60] px-7 py-4 font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-[#447b53]"
            >
              Ingresar
            </button>

            {/* <button className="rounded-2xl border border-zinc-300 bg-white px-7 py-4 font-semibold transition hover:bg-zinc-100">
              Explorar módulos
            </button> */}
          </div>
        </section>

        {/* RIGHT */}
        <section className="relative flex items-center justify-center">
          <div className="absolute h-[500px] w-[500px] rounded-full bg-[#c8e0ce] blur-3xl opacity-40" />

          <div className="relative grid w-full max-w-xl gap-6">
            {/* CARD APRENDIZ */}
            <div className="group rounded-[32px] bg-[#efe5d6] p-8 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#b58a42] text-white">
                <UserCog size={28} />
              </div>

              <h2 className="text-3xl font-bold">Aprendiz</h2>

              <p className="mt-3 leading-7 text-zinc-600">
                Inicia sesión como aprendiz y administra tus formularios,
                procesos y actividades hoteleras.
              </p>

              <button
                onClick={() => setOpenLogin(true)}
                className="mt-8 flex items-center gap-2 rounded-2xl bg-[#b58a42] px-6 py-3 font-semibold text-white transition hover:bg-[#9e7739]"
              >
                Entrar
                <ArrowRight size={18} />
              </button>
            </div>

            {/* SMALL CARDS */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[28px] bg-[#dce9de] p-7 shadow-lg transition hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f9d58] text-white">
                  <Hotel size={24} />
                </div>

                <h3 className="text-2xl font-bold">Hotelería</h3>

                <p className="mt-3 text-zinc-600">
                  Explora procesos hoteleros y fortalece tus habilidades.
                </p>
                {/* 
                <button className="mt-6 font-semibold text-[#0f9d58] hover:underline">
                  Leer más →
                </button> */}
              </div>

              <div className="rounded-[28px] bg-[#d8eceb] p-7 shadow-lg transition hover:-translate-y-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#166b6b] text-white">
                  <UserPlus size={24} />
                </div>

                <h3 className="text-2xl font-bold">Registrarse</h3>

                <p className="mt-3 text-zinc-600">
                  Crea una cuenta para acceder a los módulos y herramientas del
                  sistema hotelero.
                </p>

                <button className="mt-6 rounded-xl bg-[#203535] px-5 py-2 font-semibold text-white transition hover:bg-black" onClick={() => setOpenRegister(true)}>
                  Crear cuenta
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* MODAL LOGIN */}
      <SignInForm openLogin={openLogin} setOpenLogin={setOpenLogin} setOpenRegister={setOpenRegister} />

      {/* MODAL REGISTER */}
      <RegisterForm openRegister={openRegister} setOpenRegister={setOpenRegister} openLogin={openLogin} setOpenLogin={setOpenLogin} />
    </div>
  );
}