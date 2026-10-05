"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck, UserCheck, Crown, Headphones, Bot } from "lucide-react";
import Aurora from "../components/Aurora";
import BorderGlow from "../components/BorderGlow";
import SystemTransitionOverlay from "../components/SystemTransitionOverlay";
import { setAuthSession, AuthRole } from "../utils/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("maestro.admin@empresa.com");
  const [password, setPassword] = useState("AdminMaster2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"admin" | "l2" | "portal">("admin");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados para animación suave de entrada y salida
  const [isMounted, setIsMounted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [transitionInfo, setTransitionInfo] = useState<{ title: string; subtitle: string; badge?: string } | null>(null);

  useEffect(() => {
    // Dispara la animación de entrada suave al montar la vista
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigateAway = (destination: string) => {
    if (isExiting) return;
    setTransitionInfo({
      title: "Conectando al Portal",
      subtitle: "Accediendo al canal de asistencia técnica L1...",
      badge: "CANAL PÚBLICO • ENTORNO SEGURO",
    });
    setIsExiting(true);
    setTimeout(() => {
      router.push(destination);
    }, 520);
  };

  const handleRoleSelect = (role: "admin" | "l2" | "portal") => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === "admin") {
      setEmail("maestro.admin@empresa.com");
      setPassword("AdminMaster2026!");
    } else if (role === "l2") {
      setEmail("carlos.mendoza@empresa.com");
      setPassword("AgenteL2Secure!");
    } else {
      setEmail("juan.perez@empresa.com");
      setPassword("UsuarioCorporativo1!");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage("Por favor ingresa un correo corporativo válido.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      const roleTitle =
        selectedRole === "portal"
          ? "Usuario de Soporte L1"
          : selectedRole === "l2"
          ? "Especialista de Soporte L2"
          : "Administrador Maestro L3";

      setTransitionInfo({
        title: "Acceso Autorizado",
        subtitle: `Preparando espacio de trabajo para ${roleTitle}...`,
        badge: "AUTENTICACIÓN EXITOSA • RLS ACTIVO",
      });
      setIsExiting(true);

      const destination = selectedRole === "portal" ? "/" : "/admin";

      if (selectedRole === "portal") {
        setAuthSession({
          email: email.trim(),
          name: "Juan Pérez",
          role: "END_USER",
          tenant: "Acme Global Enterprise"
        });
      } else if (selectedRole === "l2") {
        setAuthSession({
          email: email.trim(),
          name: "Carlos Mendoza",
          role: "L2",
          tenant: "Acme Global Enterprise"
        });
      } else {
        setAuthSession({
          email: email.trim(),
          name: "Administrador Maestro",
          role: "L3",
          tenant: "Acme Global Enterprise"
        });
      }

      setTimeout(() => {
        router.push(destination);
      }, 550);
    }, 450);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-black text-white font-sans overflow-hidden select-none px-4">
      {/* ========================================================================= */}
      {/* FONDO AURORA ANIMADO (WebGL con ogl) */}
      {/* ========================================================================= */}
      <div
        className={`absolute inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-700 ease-in-out ${
          !isMounted || isExiting ? "opacity-20" : "opacity-100"
        }`}
      >
        <Aurora
          colorStops={["#7cff67", "#B497CF", "#5227FF"]}
          blend={0.5}
          amplitude={1.0}
          speed={1}
        />
        {/* Viñeta radial oscura para enmarcar el fondo */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0.92) 75%, #000000 100%)",
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* TARJETA DE LOGIN CON EFECTO GLASS FLOTANTE EN EL CENTRO Y BORDER GLOW */}
      {/* ========================================================================= */}
      <div
        className={`relative z-10 w-full max-w-md transform transition-all duration-500 ${
          !isMounted
            ? "opacity-0 scale-[0.96] translate-y-6 blur-md"
            : isExiting
            ? "opacity-0 scale-[0.97] -translate-y-4 blur-md pointer-events-none"
            : "opacity-100 scale-100 translate-y-0 blur-0"
        }`}
        style={{
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          transitionDuration: "500ms"
        }}
      >
        <BorderGlow
          edgeSensitivity={34}
          glowColor="40 80 80"
          backgroundColor="#0a0a0a"
          borderRadius={28}
          glowRadius={67}
          glowIntensity={1.4}
          coneSpread={25}
          animated={true}
          colors={['#c084fc', '#f472b6', '#38bdf8']}
          className="w-full shadow-[0_24px_80px_rgba(0,0,0,0.85)]"
        >
          <div className="p-7 sm:p-9">
          {/* Encabezado de la Tarjeta */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] backdrop-blur-md mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[11px] font-medium text-neutral-300">
                SupportL1 AI SaaS • Multi-Tenant
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white">
              Acceso al Sistema
            </h1>
            <p className="text-xs text-neutral-400 max-w-xs mx-auto leading-relaxed">
              Ingresa tus credenciales corporativas para acceder a tu panel o portal de atención.
            </p>
          </div>

          {/* Selector de Perfil Rápido */}
          <div className="mb-5 space-y-1.5">
            <label className="text-[11px] font-medium text-neutral-400 block">
              Seleccionar Perfil de Demostración:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect("admin")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs transition cursor-pointer ${
                  selectedRole === "admin"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "bg-neutral-900/60 text-neutral-400 hover:text-white hover:bg-neutral-800/80"
                }`}
              >
                <Crown className="w-3.5 h-3.5 mb-1" />
                <span className="text-[11px]">Maestro</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect("l2")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs transition cursor-pointer ${
                  selectedRole === "l2"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "bg-neutral-900/60 text-neutral-400 hover:text-white hover:bg-neutral-800/80"
                }`}
              >
                <Headphones className="w-3.5 h-3.5 mb-1" />
                <span className="text-[11px]">Agente L2</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect("portal")}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-xs transition cursor-pointer ${
                  selectedRole === "portal"
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "bg-neutral-900/60 text-neutral-400 hover:text-white hover:bg-neutral-800/80"
                }`}
              >
                <Bot className="w-3.5 h-3.5 mb-1" />
                <span className="text-[11px]">Portal L1</span>
              </button>
            </div>
          </div>

          {/* Formulario de Login */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Correo */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-neutral-300 block">
                Correo Corporativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@empresa.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-neutral-900/70 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition backdrop-blur-md"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-neutral-300">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => alert("Comunícate con el administrador para restablecer tu contraseña corporativa.")}
                  className="text-[11px] text-neutral-400 hover:text-white transition cursor-pointer"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña segura"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-neutral-900/70 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-white/20 transition backdrop-blur-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-white transition cursor-pointer"
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Mensaje de error si aplica */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-neutral-900 text-xs text-neutral-300">
                {errorMessage}
              </div>
            )}

            {/* Botón de Envío */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Validando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Pie de la tarjeta */}
          <div className="mt-6 pt-2 flex items-center justify-between text-[11px] text-neutral-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
              <span>Aislamiento RLS activo</span>
            </div>
            <button
              type="button"
              onClick={() => handleNavigateAway("/")}
              className="hover:text-white transition text-neutral-400 underline underline-offset-4 cursor-pointer"
            >
              Ir al Chat L1
            </button>
          </div>
        </div>
      </BorderGlow>

        {/* Leyenda inferior */}
        <p
          className={`text-center text-[11px] text-neutral-500 mt-4 transition-all duration-500 ${
            !isMounted || isExiting ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          }`}
        >
          SupportL1 AI • Plataforma SaaS Multi-Tenant de Grado Empresarial
        </p>
      </div>

      {/* Transición fluida de entrada al sistema */}
      <SystemTransitionOverlay
        isOpen={isExiting}
        mode="entering"
        title={transitionInfo?.title}
        subtitle={transitionInfo?.subtitle}
        badgeText={transitionInfo?.badge}
      />
    </div>
  );
}
