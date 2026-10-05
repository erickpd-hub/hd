"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck, ArrowRight, Headphones, CheckCircle2, Lock } from "lucide-react";
import { clearAuthSession } from "../utils/auth";
import SystemTransitionOverlay from "../components/SystemTransitionOverlay";

export default function LogoutPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [exitInfo, setExitInfo] = useState<{ title: string; subtitle: string; badge: string } | null>(null);

  useEffect(() => {
    clearAuthSession();
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = (destination: string, title: string, subtitle: string, badge: string) => {
    if (isExiting) return;
    setExitInfo({ title, subtitle, badge });
    setIsExiting(true);
    setTimeout(() => {
      router.push(destination);
    }, 520);
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-sans flex flex-col justify-between items-center p-4 sm:p-6 select-none overflow-hidden">
      {/* Top Bar Minimalista */}
      <header
        className={`w-full max-w-5xl flex items-center justify-between py-2 transition-all duration-500 ${
          !isMounted || isExiting ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white font-mono text-xs font-bold">
            [=]
          </div>
          <span className="font-semibold text-sm text-white tracking-tight">
            Plataforma SaaS Multi-Tenant L1
          </span>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 rounded">
          SISTEMA SEGURO
        </span>
      </header>

      {/* Main Card con animación fluida de entrada y salida */}
      <main className="w-full max-w-md my-auto">
        <div
          className={`bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center transform transition-all duration-500 ${
            !isMounted
              ? "opacity-0 scale-[0.97] translate-y-6 blur-md"
              : isExiting
              ? "opacity-0 scale-[0.97] -translate-y-4 blur-md pointer-events-none"
              : "opacity-100 scale-100 translate-y-0 blur-0"
          }`}
          style={{
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="mx-auto w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shadow-inner">
            <LogOut className="w-6 h-6 text-neutral-300" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-lg font-semibold text-white tracking-tight">
              Sesión Finalizada
            </h1>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Has cerrado tu sesión de forma segura. El contexto de inquilino y los tokens temporales han sido purgados del entorno local.
            </p>
          </div>

          <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-xl text-left space-y-2 text-xs">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-300" />
                <span>Aislamiento RLS</span>
              </span>
              <span className="text-white font-mono">Liberado</span>
            </div>

            <div className="flex items-center justify-between text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-neutral-300" />
                <span>Tokens en Memoria</span>
              </span>
              <span className="text-white font-mono">Purgados</span>
            </div>

            <div className="flex items-center justify-between text-neutral-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-neutral-300" />
                <span>Estado de Turno</span>
              </span>
              <span className="text-white font-mono">Pausado</span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() =>
                handleNavigate(
                  "/login",
                  "Iniciando Módulo de Acceso",
                  "Cargando interfaz de autenticación corporativa...",
                  "AUTENTICACIÓN • SISTEMA CENTRAL"
                )
              }
              className="w-full py-2.5 px-4 rounded-lg bg-white text-black hover:bg-neutral-200 transition text-xs font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span>Iniciar Sesión Nuevamente</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() =>
                handleNavigate(
                  "/",
                  "Conectando al Portal",
                  "Accediendo al canal de soporte técnico L1...",
                  "PORTAL DE ASISTENCIA • ENTORNO SEGURO"
                )
              }
              className="w-full py-2.5 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition text-xs font-medium flex items-center justify-center gap-2 cursor-pointer"
            >
              <Headphones className="w-3.5 h-3.5 text-neutral-400" />
              <span>Ir al Portal de Soporte L1 (Usuario)</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`w-full max-w-5xl text-center py-3 text-[11px] text-neutral-600 font-mono transition-all duration-500 ${
          !isMounted || isExiting ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        }`}
      >
        Autenticación segura multi-tenant • Cumplimiento SOC2 Tipo II
      </footer>

      {/* Transición fluida al navegar fuera */}
      <SystemTransitionOverlay
        isOpen={isExiting}
        mode="entering"
        title={exitInfo?.title}
        subtitle={exitInfo?.subtitle}
        badgeText={exitInfo?.badge}
      />
    </div>
  );
}
