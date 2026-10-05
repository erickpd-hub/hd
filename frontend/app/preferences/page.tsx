"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Shield,
  Sliders,
  Monitor,
  Bell,
  Bot,
  Clock,
  Globe,
  Save,
  RotateCcw,
  Check,
  Eye,
  Volume2,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  Smartphone,
  Laptop,
  ChevronDown
} from "lucide-react";

export default function PreferencesPage() {
  // Density and interface
  const [density, setDensity] = useState<"compact" | "normal">("compact");
  const [monospaceIds, setMonospaceIds] = useState(true);
  const [enableSound, setEnableSound] = useState(false);
  const [desktopBanners, setDesktopBanners] = useState(true);

  // DAG & AI Settings
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.75);
  const [groundingGuardrail, setGroundingGuardrail] = useState(true);
  const [autoBriefing, setAutoBriefing] = useState(true);
  const [l3VipEscalation, setL3VipEscalation] = useState(true);

  // Notification Matrix
  const [matrixAlerts, setMatrixAlerts] = useState({
    p1Critical: { banner: true, desktop: true, sound: true },
    slaUrgent: { banner: true, desktop: true, sound: false },
    reassigned: { banner: true, desktop: false, sound: false },
    customerReply: { banner: true, desktop: true, sound: false }
  });

  // Timezone and format
  const [timezone, setTimezone] = useState("America/Mexico_City");
  const [isTimezoneMenuOpen, setIsTimezoneMenuOpen] = useState(false);
  const timezoneMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (timezoneMenuRef.current && !timezoneMenuRef.current.contains(event.target as Node)) {
        setIsTimezoneMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsTimezoneMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  const [use24HourTime, setUse24HourTime] = useState(true);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleMatrix = (
    key: keyof typeof matrixAlerts,
    channel: "banner" | "desktop" | "sound"
  ) => {
    setMatrixAlerts((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [channel]: !prev[key][channel]
      }
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerToast("Preferencias de consola sincronizadas y guardadas.");
  };

  const handleReset = () => {
    setDensity("compact");
    setMonospaceIds(true);
    setEnableSound(false);
    setDesktopBanners(true);
    setConfidenceThreshold(0.75);
    setGroundingGuardrail(true);
    setAutoBriefing(true);
    setL3VipEscalation(true);
    setTimezone("America/Mexico_City");
    setUse24HourTime(true);
    triggerToast("Configuración restablecida a valores estándar.");
  };

  return (
    <div className="min-h-screen w-full bg-black text-white font-sans flex flex-col">
      {/* Top Header & Settings Tabs (Mobbin style) */}
      <header className="border-b border-neutral-800 bg-neutral-950 sticky top-0 z-30 flex-shrink-0">
        <div className="h-14 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Consola</span>
            </Link>

            <div className="h-4 w-px bg-neutral-800" />

            <div className="flex items-center gap-1.5 text-xs text-neutral-400">
              <span>Configuración</span>
              <span className="text-neutral-600">/</span>
              <span className="text-white font-medium">Preferencias de Consola</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restablecer</span>
            </button>
          </div>
        </div>

        {/* Unified Settings Navigation Bar */}
        <div className="px-4 sm:px-6 flex items-center gap-1 border-t border-neutral-800/80 overflow-x-auto text-xs">
          <Link
            href="/profile"
            className="flex items-center gap-2 py-2.5 px-3 border-b-2 font-medium text-neutral-400 hover:text-white border-transparent hover:border-neutral-700 transition"
          >
            <User className="w-3.5 h-3.5 text-neutral-500" />
            <span>Mi Perfil</span>
          </Link>

          <Link
            href="/security"
            className="flex items-center gap-2 py-2.5 px-3 border-b-2 font-medium text-neutral-400 hover:text-white border-transparent hover:border-neutral-700 transition"
          >
            <Shield className="w-3.5 h-3.5 text-neutral-500" />
            <span>Seguridad & RLS</span>
          </Link>

          <Link
            href="/preferences"
            className="flex items-center gap-2 py-2.5 px-3 border-b-2 font-medium text-white border-white transition"
          >
            <Sliders className="w-3.5 h-3.5 text-white" />
            <span>Preferencias de Consola</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-24">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Section 1: Selector de Densidad y Ergonomía Visual (Mobbin / Linear style) */}
          <div className="border border-neutral-800 rounded-xl bg-neutral-950 divide-y divide-neutral-800/80">
            <div className="p-5">
              <h2 className="text-sm font-semibold text-white">Densidad del Workspace & Tipografía</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Adapta el espaciado de las bandejas de tickets según tu flujo de trabajo de monitoreo.
              </p>
            </div>

            <div className="p-5 space-y-4">
              {/* Density Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDensity("compact")}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-3 ${
                    density === "compact"
                      ? "bg-neutral-900 border-neutral-600 text-white"
                      : "bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Densidad Compacta (NOC / SOC)</span>
                      {density === "compact" && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Espaciado reducido de 6px por fila. Diseñado para revisar más de 20 tickets simultáneamente en monitores panorámicos.
                    </p>
                  </div>

                  {/* Micro Visual Preview */}
                  <div className="p-2 bg-neutral-950 border border-neutral-800 rounded-md font-mono text-[10px] space-y-1">
                    <div className="flex justify-between text-neutral-300">
                      <span>#TK-4029 • Falla VPN</span>
                      <span className="text-neutral-500">1.2m</span>
                    </div>
                    <div className="flex justify-between text-neutral-300">
                      <span>#TK-4030 • Error SAP CFDI</span>
                      <span className="text-neutral-500">3.8m</span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDensity("normal")}
                  className={`p-4 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between gap-3 ${
                    density === "normal"
                      ? "bg-neutral-900 border-neutral-600 text-white"
                      : "bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">Densidad Estándar</span>
                      {density === "normal" && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Espaciado aireado de 12px con vista previa de los primeros 100 caracteres del diagnóstico de IA.
                    </p>
                  </div>

                  {/* Micro Visual Preview */}
                  <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-md font-mono text-[10px] space-y-1.5">
                    <div className="flex justify-between text-neutral-300">
                      <span>#TK-4029 • Falla VPN IPsec</span>
                      <span className="text-neutral-500">1.2m</span>
                    </div>
                    <div className="text-[9px] text-neutral-500 truncate">
                      Gateway caído en nodo Monterrey sin respuesta ICMP...
                    </div>
                  </div>
                </button>
              </div>

              {/* Monospace IDs toggle */}
              <div className="flex items-center justify-between border-t border-neutral-800/80 pt-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-white">
                    Forzar Identificadores y Marcas Temporales en Fuente Monoespaciada
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Aplica Geist Mono a UUIDs, códigos de error y latencias para facilitar lectura técnica.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={monospaceIds}
                  onChange={(e) => setMonospaceIds(e.target.checked)}
                  className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-neutral-200 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Parámetros del Motor Multi-Agente LangGraph (Mobbin style functional settings) */}
          <div className="border border-neutral-800 rounded-xl bg-neutral-950 divide-y divide-neutral-800/80">
            <div className="p-5">
              <h2 className="text-sm font-semibold text-white">Afinación del Orquestador L1 (DAG LangGraph)</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Controla la frontera entre resolución automatizada por IA y transferencia asistida a especialistas L2.
              </p>
            </div>

            <div className="p-5 space-y-5">
              {/* Threshold Slider with Live Impact Explanation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-300">
                    Umbral de Grounding Mínimo para Cierre Autónomo
                  </label>
                  <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 font-mono text-xs font-bold text-white">
                    {confidenceThreshold.toFixed(2)}
                  </span>
                </div>

                <input
                  type="range"
                  min="0.5"
                  max="0.95"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                  className="w-full accent-neutral-200 bg-neutral-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />

                <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-lg text-xs font-mono text-neutral-300 flex items-start gap-2.5">
                  <Bot className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                  <div>
                    {confidenceThreshold >= 0.85 ? (
                      <span>Modo Conservador: Solo consultas con evidencia RAG casi perfecta se resuelven en L1. Alta derivación a humanos.</span>
                    ) : confidenceThreshold >= 0.7 ? (
                      <span>Modo Equilibrado (Recomendado): ~85% de resolución autónoma de primer contacto con detección de alucinaciones activa.</span>
                    ) : (
                      <span>Modo Permisivo: Maximiza la tasa de respuesta autónoma. Puede aumentar el riesgo de respuestas incompletas.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* DAG Pipeline Toggles */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-medium text-white">
                      Validación de GuardrailNode antes de responder
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Verifica la fidelidad con los fragmentos vectoriales antes de transmitir el texto al cliente.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={groundingGuardrail}
                    onChange={(e) => setGroundingGuardrail(e.target.checked)}
                    className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-neutral-200 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-neutral-800/60 pt-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-medium text-white">
                      Generar Briefing Técnico Automatizado en Escalamientos L2
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Proporciona un diagnóstico preliminar, manuales consultados y pasos sugeridos al especialista humano.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoBriefing}
                    onChange={(e) => setAutoBriefing(e.target.checked)}
                    className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-neutral-200 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-neutral-800/60 pt-3">
                  <div className="space-y-0.5">
                    <div className="text-xs font-medium text-white">
                      Ruta Prioritaria de Escalamiento L3 ante Palabras Críticas
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Deriva automáticamente a gerencia técnica si se detectan demandas legales o auditorías fiscales.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={l3VipEscalation}
                    onChange={(e) => setL3VipEscalation(e.target.checked)}
                    className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-neutral-200 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Matriz de Notificaciones y Canales (Linear / Raycast style) */}
          <div className="border border-neutral-800 rounded-xl bg-neutral-950 divide-y divide-neutral-800/80">
            <div className="p-5">
              <h2 className="text-sm font-semibold text-white">Matriz de Alertas & Notificaciones</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Configura individualmente los canales de emisión para cada tipología de evento operativo.
              </p>
            </div>

            <div className="p-5 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 font-mono text-[11px]">
                    <th className="pb-3 font-medium">Evento Operativo</th>
                    <th className="pb-3 text-center font-medium">Banner Consola</th>
                    <th className="pb-3 text-center font-medium">Notif. Escritorio</th>
                    <th className="pb-3 text-center font-medium">Tono Sutil</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 text-xs">
                  <tr>
                    <td className="py-3">
                      <div className="font-medium text-white">Escalamiento Crítico (P1 Urgente)</div>
                      <div className="text-[10px] text-neutral-500">Tickets con tiempo de respuesta &lt; 15 min</div>
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={matrixAlerts.p1Critical.banner}
                        onChange={() => handleToggleMatrix("p1Critical", "banner")}
                        className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-neutral-200 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={matrixAlerts.p1Critical.desktop}
                        onChange={() => handleToggleMatrix("p1Critical", "desktop")}
                        className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-neutral-200 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={matrixAlerts.p1Critical.sound}
                        onChange={() => handleToggleMatrix("p1Critical", "sound")}
                        className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-neutral-200 cursor-pointer"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3">
                      <div className="font-medium text-white">SLA Próximo a Expirar (&lt; 1h)</div>
                      <div className="text-[10px] text-neutral-500">Tickets en riesgo de penalización operativa</div>
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={matrixAlerts.slaUrgent.banner}
                        onChange={() => handleToggleMatrix("slaUrgent", "banner")}
                        className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-neutral-200 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={matrixAlerts.slaUrgent.desktop}
                        onChange={() => handleToggleMatrix("slaUrgent", "desktop")}
                        className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-neutral-200 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={matrixAlerts.slaUrgent.sound}
                        onChange={() => handleToggleMatrix("slaUrgent", "sound")}
                        className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-neutral-200 cursor-pointer"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3">
                      <div className="font-medium text-white">Reasignación por Supervisor L3</div>
                      <div className="text-[10px] text-neutral-500">Casos transferidos directamente a tu cola de atención</div>
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={matrixAlerts.reassigned.banner}
                        onChange={() => handleToggleMatrix("reassigned", "banner")}
                        className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-neutral-200 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={matrixAlerts.reassigned.desktop}
                        onChange={() => handleToggleMatrix("reassigned", "desktop")}
                        className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-neutral-200 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={matrixAlerts.reassigned.sound}
                        onChange={() => handleToggleMatrix("reassigned", "sound")}
                        className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-neutral-200 cursor-pointer"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3">
                      <div className="font-medium text-white">Nueva Respuesta de Usuario en Chat</div>
                      <div className="text-[10px] text-neutral-500">Interacción recibida en tickets bajo tu custodia</div>
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={matrixAlerts.customerReply.banner}
                        onChange={() => handleToggleMatrix("customerReply", "banner")}
                        className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-neutral-200 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={matrixAlerts.customerReply.desktop}
                        onChange={() => handleToggleMatrix("customerReply", "desktop")}
                        className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-neutral-200 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 text-center">
                      <input
                        type="checkbox"
                        checked={matrixAlerts.customerReply.sound}
                        onChange={() => handleToggleMatrix("customerReply", "sound")}
                        className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-neutral-200 cursor-pointer"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Región y Formato de Horas */}
          <div className="border border-neutral-800 rounded-xl bg-neutral-950 divide-y divide-neutral-800/80">
            <div className="p-5">
              <h2 className="text-sm font-semibold text-white">Zona Horaria & Formato de Registro</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Define cómo se calculan las diferencias de tiempo de SLA en los dashboards.
              </p>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 relative" ref={timezoneMenuRef}>
                <label className="text-neutral-300 font-medium">Zona Horaria de Guardia</label>
                <button
                  type="button"
                  onClick={() => setIsTimezoneMenuOpen(!isTimezoneMenuOpen)}
                  aria-expanded={isTimezoneMenuOpen}
                  className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg px-3 py-2 text-xs text-white flex items-center justify-between transition cursor-pointer select-none font-mono"
                >
                  <span>
                    {timezone === "America/Mexico_City" ? "America/Mexico_City (UTC-06:00)"
                      : timezone === "America/Bogota" ? "America/Bogota (UTC-05:00)"
                      : timezone === "America/Santiago" ? "America/Santiago (UTC-04:00)"
                      : timezone === "America/Argentina/Buenos_Aires" ? "America/Buenos_Aires (UTC-03:00)"
                      : "UTC (Universal Coordinated Time)"}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${
                      isTimezoneMenuOpen ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>

                <div
                  className={`absolute left-0 mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-1.5 z-40 transform transition-all duration-200 ease-out origin-top ${
                    isTimezoneMenuOpen
                      ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
                  }`}
                >
                  {[
                    { val: "America/Mexico_City", label: "America/Mexico_City (UTC-06:00)" },
                    { val: "America/Bogota", label: "America/Bogota (UTC-05:00)" },
                    { val: "America/Santiago", label: "America/Santiago (UTC-04:00)" },
                    { val: "America/Argentina/Buenos_Aires", label: "America/Buenos_Aires (UTC-03:00)" },
                    { val: "UTC", label: "UTC (Universal Coordinated Time)" }
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => {
                        setTimezone(item.val);
                        setIsTimezoneMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition flex items-center justify-between cursor-pointer ${
                        timezone === item.val
                          ? "bg-neutral-900 text-white font-medium border border-neutral-800"
                          : "text-neutral-300 hover:bg-neutral-900/60 hover:text-white"
                      }`}
                    >
                      <span>{item.label}</span>
                      {timezone === item.val && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-neutral-300 font-medium">Formato de Visualización de Horas</label>
                <div className="flex items-center gap-4 pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hourFormat"
                      checked={use24HourTime}
                      onChange={() => setUse24HourTime(true)}
                      className="accent-neutral-200"
                    />
                    <span className="font-mono text-neutral-300">24 horas (23:59:00)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hourFormat"
                      checked={!use24HourTime}
                      onChange={() => setUse24HourTime(false)}
                      className="accent-neutral-200"
                    />
                    <span className="font-mono text-neutral-300">12 horas (11:59 PM)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="sticky bottom-4 z-20 flex items-center justify-between p-3.5 bg-neutral-950/95 backdrop-blur-md border border-neutral-800 rounded-xl shadow-2xl">
            <span className="text-[11px] text-neutral-400 font-mono">
              Las preferencias de consola se guardan en el perfil local del navegador y servidor.
            </span>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Preferencias</span>
            </button>
          </div>
        </form>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-2xl backdrop-blur-md bg-neutral-900 border-neutral-800 text-white text-xs font-mono animate-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-neutral-300" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
