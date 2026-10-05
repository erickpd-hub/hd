"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Shield,
  Sliders,
  Key,
  Lock,
  Smartphone,
  Laptop,
  Terminal,
  Check,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  CheckCircle2,
  Database,
  Layers,
  History,
  AlertTriangle,
  Play,
  Download,
  KeyRound
} from "lucide-react";

export default function SecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // RLS Live Audit Simulator
  const [isRunningRlsAudit, setIsRunningRlsAudit] = useState(false);
  const [rlsAuditResults, setRlsAuditResults] = useState<
    { table: string; status: "passed" | "testing" | "pending"; count: number }[]
  >([
    { table: "tickets", status: "passed", count: 184 },
    { table: "ticket_messages", status: "passed", count: 942 },
    { table: "document_chunks (vector 1536)", status: "passed", count: 320 },
    { table: "areas & agent_areas", status: "passed", count: 12 },
    { table: "users (L2/L3 RBAC)", status: "passed", count: 28 }
  ]);

  // Backup codes modal
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes] = useState<string[]>([
    "8A4F-9921-KB01",
    "3C12-8874-MD90",
    "90BB-1249-OP33",
    "55EE-7761-ZZ88",
    "12AA-4432-QQ99",
    "77FF-9901-LL44",
    "66DD-3321-VV11",
    "44CC-8812-NN55"
  ]);

  const [copiedToken, setCopiedToken] = useState(false);
  const [securityToast, setSecurityToast] = useState<string | null>(null);

  const demoApiKey = "agy_sec_live_99f82d1c7a4e63b0185f29910d";

  const triggerToast = (msg: string) => {
    setSecurityToast(msg);
    setTimeout(() => setSecurityToast(null), 3500);
  };

  const handleRunRlsAudit = () => {
    setIsRunningRlsAudit(true);
    setRlsAuditResults((prev) => prev.map((item) => ({ ...item, status: "testing" })));

    setTimeout(() => {
      setRlsAuditResults((prev) => prev.map((item) => ({ ...item, status: "passed" })));
      setIsRunningRlsAudit(false);
      triggerToast("Auditoría RLS finalizada: 0 fugas de datos detectadas.");
    }, 900);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard?.writeText(demoApiKey);
    setCopiedToken(true);
    triggerToast("Clave API copiada al portapapeles.");
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      triggerToast("Completa los campos requeridos.");
      return;
    }
    if (newPassword.length < 10) {
      triggerToast("La contraseña debe tener al menos 10 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      triggerToast("Las nuevas contraseñas no coinciden.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    triggerToast("Contraseña actualizada con éxito.");
  };

  // Password requirements
  const hasMinLength = newPassword.length >= 10;
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

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
              <span className="text-white font-medium">Seguridad & RLS</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-[10px] font-mono text-neutral-300 bg-neutral-900 border border-neutral-800 rounded flex items-center gap-1.5">
              <Shield className="w-3 h-3 text-neutral-400" />
              <span>RLS ENFORCED</span>
            </span>
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
            className="flex items-center gap-2 py-2.5 px-3 border-b-2 font-medium text-white border-white transition"
          >
            <Shield className="w-3.5 h-3.5 text-white" />
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

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-24">
        {/* RLS Live Architecture Inspector (Mobbin / Supabase style) */}
        <div className="border border-neutral-800 rounded-xl bg-neutral-950 divide-y divide-neutral-800/80">
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-white" />
                <h2 className="text-sm font-semibold text-white">Inspector de Row Level Security (RLS)</h2>
                <span className="px-2 py-0.2 text-[10px] font-mono text-neutral-300 bg-neutral-900 border border-neutral-800 rounded">
                  POSTGRESQL 16
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Auditoría en tiempo real del contexto de aislamiento multi-tenant en todas las particiones de la base de datos.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRunRlsAudit}
              disabled={isRunningRlsAudit}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white text-xs font-mono font-medium flex items-center gap-2 transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
            >
              <Play className={`w-3.5 h-3.5 ${isRunningRlsAudit ? "animate-spin" : ""}`} />
              <span>{isRunningRlsAudit ? "Verificando..." : "Ejecutar Verificación RLS"}</span>
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* SQL Policy Snippet Card */}
            <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono space-y-1 text-neutral-300">
              <div className="text-[11px] text-neutral-500 font-semibold tracking-wide uppercase">
                Variable de Sesión Activa:
              </div>
              <div className="text-white">SET LOCAL app.current_tenant_id = '11111111-1111-1111-1111-111111111111';</div>
              <div className="text-[11px] text-neutral-400 pt-1">
                WHERE tenant_id = current_setting(&apos;app.current_tenant_id&apos;, true)::UUID
              </div>
            </div>

            {/* Table Checklist */}
            <div className="space-y-1.5">
              {rlsAuditResults.map((item) => (
                <div
                  key={item.table}
                  className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800/80 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2 text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>public.{item.table}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-neutral-500">{item.count} filas analizadas</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-900 border border-neutral-800 text-white">
                      {item.status === "testing" ? "EVALUANDO..." : "AISLADO (0 FUGAS)"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sección: Actualización de Contraseña */}
        <form onSubmit={handlePasswordSubmit} className="border border-neutral-800 rounded-xl bg-neutral-950 divide-y divide-neutral-800/80">
          <div className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-white">Credenciales & Contraseña de Acceso</h2>
              <p className="text-xs text-neutral-400">
                Cambia la clave utilizada para el inicio de sesión en la consola de soporte y terminales de operador.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPassword ? "Ocultar" : "Mostrar"}</span>
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">Contraseña Actual</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600 transition font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">Nueva Contraseña</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600 transition font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">Confirmar Nueva Contraseña</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-neutral-600 transition font-mono"
                />
              </div>
            </div>

            {/* Checklist interactivo de robustez */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-400 font-mono pt-1">
              <span className={`flex items-center gap-1.5 ${hasMinLength ? "text-white" : "text-neutral-500"}`}>
                <Check className={`w-3.5 h-3.5 ${hasMinLength ? "text-white" : "text-neutral-600"}`} />
                <span>Mínimo 10 caracteres</span>
              </span>

              <span className={`flex items-center gap-1.5 ${hasNumber ? "text-white" : "text-neutral-500"}`}>
                <Check className={`w-3.5 h-3.5 ${hasNumber ? "text-white" : "text-neutral-600"}`} />
                <span>Al menos un número</span>
              </span>

              <span className={`flex items-center gap-1.5 ${hasSpecial ? "text-white" : "text-neutral-500"}`}>
                <Check className={`w-3.5 h-3.5 ${hasSpecial ? "text-white" : "text-neutral-600"}`} />
                <span>Símbolo especial (!@#$)</span>
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-white text-black hover:bg-neutral-200 transition text-xs font-semibold cursor-pointer shadow-sm"
              >
                Actualizar Contraseña
              </button>
            </div>
          </div>
        </form>

        {/* Sección: Autenticación Multifactor y Códigos de Respaldo */}
        <div className="border border-neutral-800 rounded-xl bg-neutral-950 divide-y divide-neutral-800/80">
          <div className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-white">Autenticación en Dos Pasos (2FA / FIDO2)</h2>
              <p className="text-xs text-neutral-400">
                Protección criptográfica para validar cada inicio de sesión de operador.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setTwoFactorEnabled(!twoFactorEnabled);
                triggerToast(twoFactorEnabled ? "2FA desactivado temporalmente." : "2FA habilitado.");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                twoFactorEnabled
                  ? "bg-neutral-900 border border-neutral-700 text-white hover:bg-neutral-800"
                  : "bg-white text-black hover:bg-neutral-200"
              }`}
            >
              {twoFactorEnabled ? "Desactivar 2FA" : "Configurar 2FA"}
            </button>
          </div>

          <div className="p-5 space-y-3">
            <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-white" />
                <div>
                  <div className="font-medium text-white">Aplicación Autenticadora (TOTP RFC-6238)</div>
                  <div className="text-[11px] text-neutral-400">1Password, Google Authenticator o Microsoft Authenticator</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-white bg-neutral-800 border border-neutral-700">
                ACTIVO
              </span>
            </div>

            <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <KeyRound className="w-4 h-4 text-white" />
                <div>
                  <div className="font-medium text-white">Códigos de Respaldo de Emergencia</div>
                  <div className="text-[11px] text-neutral-400">Permiten recuperar el acceso si pierdes tu dispositivo de guardia</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowBackupCodes(!showBackupCodes)}
                className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white text-xs font-mono transition cursor-pointer"
              >
                {showBackupCodes ? "Ocultar Códigos" : "Ver Códigos"}
              </button>
            </div>

            {/* Backup Codes Drawer */}
            {showBackupCodes && (
              <div className="p-4 rounded-lg bg-neutral-900/90 border border-neutral-800 space-y-3">
                <div className="text-xs text-neutral-300">
                  Guarda estos códigos en un gestor seguro. Cada código solo puede ser utilizado una única vez:
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs text-white">
                  {backupCodes.map((code) => (
                    <div
                      key={code}
                      className="p-2 rounded bg-neutral-950 border border-neutral-800 text-center tracking-wider"
                    >
                      {code}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección: Claves API con Scopes Explícitos */}
        <div className="border border-neutral-800 rounded-xl bg-neutral-950 divide-y divide-neutral-800/80">
          <div className="p-5">
            <h2 className="text-sm font-semibold text-white">Clave de Acceso API para Ingestión & Workers</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Utilizada por los scripts de indexación Celery y llamadas directas al simulador del DAG.
            </p>
          </div>

          <div className="p-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-neutral-300 select-all overflow-x-auto">
                {demoApiKey}
              </div>

              <button
                type="button"
                onClick={handleCopyApiKey}
                className="px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              >
                {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedToken ? "Copiado" : "Copiar"}</span>
              </button>

              <button
                type="button"
                onClick={() => triggerToast("Clave rotada exitosamente. La anterior quedó revocada.")}
                className="px-3 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rotar</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
              <span>Permisos asignados:</span>
              <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                tickets:read
              </span>
              <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                rag:ingest
              </span>
              <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                dag:invoke
              </span>
            </div>
          </div>
        </div>

        {/* Sección: Sesiones y Dispositivos Activos */}
        <div className="border border-neutral-800 rounded-xl bg-neutral-950 divide-y divide-neutral-800/80">
          <div className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-white">Dispositivos y Sesiones Activas</h2>
              <p className="text-xs text-neutral-400">
                Terminales autorizadas con token de sesión de guardia abierto.
              </p>
            </div>

            <button
              type="button"
              onClick={() => triggerToast("Todas las sesiones secundarias han sido invalidadas.")}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs transition cursor-pointer"
            >
              Cerrar Otras Sesiones
            </button>
          </div>

          <div className="p-5 space-y-2.5">
            <div className="p-3.5 bg-neutral-900 border border-neutral-800 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Laptop className="w-4 h-4 text-white" />
                <div>
                  <div className="font-medium text-white flex items-center gap-2">
                    <span>Lenovo ThinkPad P1 • Edge / Chrome</span>
                    <span className="px-1.5 py-0.2 text-[9px] font-mono text-neutral-300 bg-neutral-800 border border-neutral-700 rounded">
                      ESTA SESIÓN
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono">
                    IP: 192.168.0.39 • Red Corporativa NOC • Activo en tiempo real
                  </div>
                </div>
              </div>
              <span className="w-2 h-2 rounded-full bg-white" />
            </div>

            <div className="p-3.5 bg-neutral-900/70 border border-neutral-800/80 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Laptop className="w-4 h-4 text-neutral-400" />
                <div>
                  <div className="font-medium text-neutral-300">Apple MacBook Pro 16 • Safari</div>
                  <div className="text-[11px] text-neutral-500 font-mono">
                    IP: 10.0.4.15 • VPN Guardia Remota • Hace 2 horas
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => triggerToast("Sesión secundaria revocada.")}
                className="text-xs text-neutral-400 hover:text-white underline cursor-pointer transition"
              >
                Revocar
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {securityToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-2xl backdrop-blur-md bg-neutral-900 border-neutral-800 text-white text-xs font-mono animate-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-neutral-300" />
          <span>{securityToast}</span>
        </div>
      )}
    </div>
  );
}
