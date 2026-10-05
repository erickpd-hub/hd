"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  User,
  Shield,
  Sliders,
  Mail,
  Phone,
  Building2,
  Copy,
  Check,
  Plus,
  X,
  Radio,
  Clock,
  Laptop,
  KeyRound,
  Save,
  CheckCircle2,
  Lock,
  Layers,
  ChevronDown
} from "lucide-react";

export default function ProfilePage() {
  const pathname = usePathname();

  // Form states
  const [fullName, setFullName] = useState("Carlos Mendoza");
  const [displayName, setDisplayName] = useState("Carlos M. • Soporte L2");
  const [email, setEmail] = useState("carlos.mendoza@empresa.com");
  const [phone, setPhone] = useState("+52 55 1234 5678");
  const [department, setDepartment] = useState("Infraestructura");
  const [isDeptMenuOpen, setIsDeptMenuOpen] = useState(false);
  const deptMenuRef = useRef<HTMLDivElement>(null);
  const [statusMessage, setStatusMessage] = useState("En guardia activa supervisando incidencias críticas de redes.");
  const [autoAcceptTickets, setAutoAcceptTickets] = useState(true);
  const [backupFallback, setBackupFallback] = useState(true);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (deptMenuRef.current && !deptMenuRef.current.contains(event.target as Node)) {
        setIsDeptMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDeptMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Technical specialty tags
  const [tags, setTags] = useState<string[]>([
    "Redes Corporativas",
    "Windows Server 2022",
    "Switches Cisco & VLANs",
    "Firewalls Fortinet",
    "Impresoras de Red & Spooler"
  ]);
  const [newTagInput, setNewTagInput] = useState("");

  const [copiedId, setCopiedId] = useState(false);
  const [isSavedToast, setIsSavedToast] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard?.writeText("usr_live_01j8k49c81b942");
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (("key" in e && e.key === "Enter") || e.type === "click") {
      e.preventDefault();
      const val = newTagInput.trim();
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setNewTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  return (
    <div className="min-h-screen w-full bg-black text-white font-sans flex flex-col">
      {/* Top Header & Navigation Tabs (Mobbin / Linear style) */}
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
              <span className="text-white font-medium">Cuenta & Operador</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 rounded">
              TENANT: CORP-DEMO
            </span>
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs font-semibold flex items-center justify-center font-mono">
              CM
            </div>
          </div>
        </div>

        {/* Unified Settings Navigation Bar */}
        <div className="px-4 sm:px-6 flex items-center gap-1 border-t border-neutral-800/80 overflow-x-auto text-xs">
          <Link
            href="/profile"
            className="flex items-center gap-2 py-2.5 px-3 border-b-2 font-medium text-white border-white transition"
          >
            <User className="w-3.5 h-3.5 text-white" />
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
            className="flex items-center gap-2 py-2.5 px-3 border-b-2 font-medium text-neutral-400 hover:text-white border-transparent hover:border-neutral-700 transition"
          >
            <Sliders className="w-3.5 h-3.5 text-neutral-500" />
            <span>Preferencias de Consola</span>
          </Link>
        </div>
      </header>

      {/* Main Form Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-24">
        {/* User Identity Banner (Linear Style) */}
        <div className="border border-neutral-800 rounded-xl bg-neutral-950 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-lg font-mono font-bold flex items-center justify-center shadow-inner">
                CM
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-neutral-950" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold text-white tracking-tight">{fullName}</h1>
                <span className="px-2 py-0.5 text-[10px] font-mono text-neutral-300 bg-neutral-900 border border-neutral-800 rounded font-medium">
                  ESPECIALISTA L2
                </span>
              </div>
              <p className="text-xs text-neutral-400">{displayName}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyId}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 text-neutral-300 text-xs font-mono transition cursor-pointer"
            title="Copiar UUID de Operador"
          >
            {copiedId ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3 text-neutral-400" />}
            <span>usr_live_01j8k49c81b942</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Información Pública y Datos de Contacto */}
          <div className="border border-neutral-800 rounded-xl bg-neutral-950 divide-y divide-neutral-800/80">
            <div className="p-5">
              <h2 className="text-sm font-semibold text-white">Identificación y Contacto</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Datos visibles en las notas de tickets escalados y auditorías del equipo L2/L3.
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">Nombre Oficial Completo</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">Firma Pública en Respuestas</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600 transition"
                  />
                  <span className="text-[10px] text-neutral-500">Nombre que visualiza el cliente al atender un chat.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">Correo Electrónico Corporativo</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600 transition font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">Extensión Telefónica / Móvil</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600 transition font-mono"
                  />
                </div>
              </div>

              {/* Custom Animated Department Dropdown */}
              <div className="space-y-1.5 pt-2 relative" ref={deptMenuRef}>
                <label className="text-xs font-medium text-neutral-300">Área de Cobertura Primaria</label>
                <button
                  type="button"
                  onClick={() => setIsDeptMenuOpen(!isDeptMenuOpen)}
                  aria-expanded={isDeptMenuOpen}
                  className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg px-3 py-2 text-xs text-white flex items-center justify-between transition cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                    <span>
                      {department === "Infraestructura"
                        ? "Infraestructura & Redes Corporativas"
                        : department === "Sap"
                        ? "SAP ERP & Facturación"
                        : department === "Magento"
                        ? "Magento POS & Ecommerce"
                        : department === "Sigo"
                        ? "Sigo Software Logístico"
                        : "Supervisión Cross-Department (General)"}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${
                      isDeptMenuOpen ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Panel with Top-to-Bottom Smooth Deployment */}
                <div
                  className={`absolute left-0 mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-1.5 z-40 transform transition-all duration-200 ease-out origin-top ${
                    isDeptMenuOpen
                      ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
                  }`}
                >
                  {[
                    { val: "Infraestructura", label: "Infraestructura & Redes Corporativas", desc: "Switches, VPNs, servidores y periféricos" },
                    { val: "Sap", label: "SAP ERP & Facturación", desc: "SAP Business One, CFDI 4.0 y asientos contables" },
                    { val: "Magento", label: "Magento POS & Ecommerce", desc: "Cajas registradoras, catálogo SKU y pasarelas" },
                    { val: "Sigo", label: "Sigo Software Logístico", desc: "Despachos, hojas de ruta y bodegas" },
                    { val: "General", label: "Supervisión Cross-Department (General)", desc: "Supervisión global y auditoría L3" }
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => {
                        setDepartment(item.val);
                        setIsDeptMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                        department === item.val
                          ? "bg-neutral-900 text-white font-medium border border-neutral-800"
                          : "text-neutral-300 hover:bg-neutral-900/60 hover:text-white"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-medium text-white">{item.label}</div>
                        <div className="text-[10px] text-neutral-500">{item.desc}</div>
                      </div>
                      {department === item.val && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-neutral-300">
                  Etiquetas de Especialidad Técnica (Tags para Asignación Inteligente)
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-mono"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-neutral-500 hover:text-white transition cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Escribe una tecnología (ej: VPN IPsec) y presiona Enter..."
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 font-mono transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Tag</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Turno de Guardia y Asignación Automatizada */}
          <div className="border border-neutral-800 rounded-xl bg-neutral-950 divide-y divide-neutral-800/80">
            <div className="p-5">
              <h2 className="text-sm font-semibold text-white">Disponibilidad de Guardia & Turno</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Reglas del despachador autónomo para derivación de tickets en vivo.
              </p>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-white">
                    Aceptar derivaciones automáticas del DAG LangGraph
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Asigna tickets cuando el TriageNode detecte fallas de nivel crítico en {department}.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoAcceptTickets}
                  onChange={(e) => setAutoAcceptTickets(e.target.checked)}
                  className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-neutral-200 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-t border-neutral-800/60 pt-3">
                <div className="space-y-0.5">
                  <div className="text-xs font-medium text-white">
                    Reasignación preventiva por inactividad (&gt; 5 min)
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Transfiere el ticket al siguiente especialista de respaldo si no hay lectura del briefing.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={backupFallback}
                  onChange={(e) => setBackupFallback(e.target.checked)}
                  className="w-4 h-4 rounded bg-neutral-900 border-neutral-700 accent-neutral-200 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 border-t border-neutral-800/60 pt-3">
                <label className="text-xs font-medium text-neutral-300">Mensaje de Estado Público</label>
                <input
                  type="text"
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600 transition"
                />
                <span className="text-[10px] text-neutral-500 font-mono">
                  Horario de cobertura asignado: Lunes a Viernes • 08:00 - 18:00 (UTC-06:00)
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Hardware Asignado & Sesión de Terminal */}
          <div className="border border-neutral-800 rounded-xl bg-neutral-950 divide-y divide-neutral-800/80">
            <div className="p-5">
              <h2 className="text-sm font-semibold text-white">Equipo de Cómputo & Llave de Seguridad</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Dispositivos autorizados para el acceso a la consola de soporte de misión crítica.
              </p>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-start gap-3">
                <Laptop className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-medium text-white">ThinkPad P1 Gen 6 (NOC Assigned)</div>
                  <div className="text-[10px] text-neutral-500 font-mono">Serial: 20Y5-CTO1WW • Windows 11 Enterprise</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-start gap-3">
                <KeyRound className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-medium text-white">Token FIDO2 / YubiKey 5C NFC</div>
                  <div className="text-[10px] text-neutral-500 font-mono">ID: YK-994012 • Autenticación Criptográfica</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="sticky bottom-4 z-20 flex items-center justify-between p-3.5 bg-neutral-950/95 backdrop-blur-md border border-neutral-800 rounded-xl shadow-2xl">
            <span className="text-[11px] text-neutral-400 font-mono">
              Los cambios se propagan de inmediato al despachador de guardia.
            </span>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </main>

      {/* Toast Notification */}
      {isSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-2xl backdrop-blur-md bg-neutral-900 border-neutral-800 text-white text-xs font-mono animate-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-neutral-300" />
          <span>Perfil y preferencias de operador actualizados.</span>
        </div>
      )}
    </div>
  );
}
