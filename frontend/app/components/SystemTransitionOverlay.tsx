"use client";

import React from "react";
import { LogOut, ShieldCheck, Lock } from "lucide-react";

interface SystemTransitionOverlayProps {
  isOpen: boolean;
  mode: "entering" | "exiting";
  title?: string;
  subtitle?: string;
  badgeText?: string;
}

export default function SystemTransitionOverlay({
  isOpen,
  mode,
  title,
  subtitle,
  badgeText,
}: SystemTransitionOverlayProps) {
  if (!isOpen) return null;

  const defaultTitle =
    mode === "entering"
      ? "Accediendo al Sistema"
      : "Cerrando Sesión";

  const defaultSubtitle =
    mode === "entering"
      ? "Validando credenciales y preparando el entorno de trabajo..."
      : "Liberando contexto de sesión y purgando tokens de memoria...";

  const defaultBadge =
    mode === "entering"
      ? "AUTENTICACIÓN SEGURA • RLS ACTIVO"
      : "PURGA CRIPTOGRÁFICA • SESIÓN TERMINADA";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-xl transition-all duration-500 select-none px-4 animate-system-enter"
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-sm bg-neutral-950 border border-neutral-800/90 rounded-2xl p-6 sm:p-7 shadow-2xl flex flex-col items-center text-center space-y-4">
        {/* Vector Icon minimalista */}
        <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shadow-inner">
          {mode === "entering" ? (
            <ShieldCheck className="w-6 h-6 text-neutral-200" />
          ) : (
            <LogOut className="w-6 h-6 text-neutral-200" />
          )}
        </div>

        {/* Textos */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-mono text-neutral-400">
              {badgeText || defaultBadge}
            </span>
          </div>
          <h2 className="text-base font-semibold text-white tracking-tight">
            {title || defaultTitle}
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
            {subtitle || defaultSubtitle}
          </p>
        </div>

        {/* Barra de progreso monochrome fluida */}
        <div className="w-full pt-1">
          <div className="h-1 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/60 relative">
            <div className="h-full w-1/2 bg-white rounded-full animate-system-progress" />
          </div>
        </div>

        {/* Pie informativo técnico */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-neutral-500 pt-1">
          <Lock className="w-3 h-3 text-neutral-500" />
          <span>SaaS Enterprise Multi-Tenant • SOC2 Tipo II</span>
        </div>
      </div>
    </div>
  );
}
