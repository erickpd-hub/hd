"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuthSession, AuthSession } from "./utils/auth";
import SystemTransitionOverlay from "./components/SystemTransitionOverlay";
import {
  Send,
  Paperclip,
  Bot,
  User,
  Headphones,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  LogOut,
  Shield,
  Sliders,
  Check,
  Plus,
  Mic,
  X,
  MessageSquare,
  Trash2,
  Download,
  Image as ImageIcon
} from "lucide-react";

interface SourceCitation {
  document_name: string;
  chunk_index: number;
  relevance_score: number;
  excerpt: string;
}

interface ChatAttachment {
  id: string;
  name: string;
  size: number;
  type: "image" | "pdf";
  url: string;
}

interface ChatMessage {
  id: string;
  sender: "customer" | "ai" | "l2";
  content: string;
  timestamp: string;
  confidence?: number;
  resolved_by_ai?: boolean;
  status?: string;
  citations?: SourceCitation[];
  ticket_id?: string;
  assigned_agent?: string;
  attachments?: ChatAttachment[];
}

const DEMO_TENANT_ID = "11111111-1111-1111-1111-111111111111";
const STORAGE_KEY = "gilsa_chat_history_v1";

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export default function UserChatPortal() {
  const router = useRouter();
  const [authSession, setAuthSessionState] = useState<AuthSession | null>(null);

  // RBAC: Si la cuenta pertenece a un especialista L2 o gerente L3, redirigir a /admin
  useEffect(() => {
    const session = getAuthSession();
    setAuthSessionState(session);
    if (session?.role === "L2" || session?.role === "L3") {
      router.replace("/admin");
    }
  }, [router]);

  const [isChatLoading, setIsChatLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChatLoading(false);
    }, 320);
    return () => clearTimeout(timer);
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState<Record<string, boolean>>({});
  
  // Historial de sesiones de chat
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: "session-init",
      title: "Nueva consulta",
      createdAt: "Hoy",
      updatedAt: new Date().toISOString(),
      messages: []
    }
  ]);
  const [activeChatId, setActiveChatId] = useState<string>("session-init");
  const activeChatIdRef = useRef<string>("session-init");

  // Modales y menús
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [portalToast, setPortalToast] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<"Gemini" | "Gilsa">("Gemini");

  // Animaciones de Entrada y Salida del Sistema
  const [isPageMounted, setIsPageMounted] = useState(false);
  const [isSystemExiting, setIsSystemExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    setIsSystemExiting(true);
    setTimeout(() => {
      router.push("/logout");
    }, 520);
  };

  // Adjuntos (fotos y PDF)
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const desktopAttachMenuRef = useRef<HTMLDivElement>(null);
  const mobileAttachMenuRef = useRef<HTMLDivElement>(null);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentChatHasContent = messages.length > 0;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

      if (!isImage && !isPdf) {
        triggerToast("Formato no compatible. Solo se admiten imágenes y PDF.");
        return;
      }

      if (file.size > 15 * 1024 * 1024) {
        triggerToast(`El archivo ${file.name} supera el límite de 15 MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const newAtt: ChatAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          size: file.size,
          type: isImage ? "image" : "pdf",
          url: result
        };
        setPendingAttachments((prev) => [...prev, newAtt]);
        triggerToast(`${isImage ? "Foto" : "PDF"} adjuntado: ${file.name}`);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePendingAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // Carga inicial de historial desde localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: ChatSession[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveChatId(parsed[0].id);
          activeChatIdRef.current = parsed[0].id;
          setMessages(parsed[0].messages || []);
        }
      }
    } catch {
      // Ignorar error de parsing
    }
  }, []);

  const triggerToast = (msg: string) => {
    setPortalToast(msg);
    setTimeout(() => {
      setPortalToast((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(target)) {
        setIsModelDropdownOpen(false);
      }
      if (plusMenuRef.current && !plusMenuRef.current.contains(target)) {
        setIsPlusMenuOpen(false);
      }
      if (
        (desktopAttachMenuRef.current && !desktopAttachMenuRef.current.contains(target)) &&
        (mobileAttachMenuRef.current && !mobileAttachMenuRef.current.contains(target))
      ) {
        setIsAttachMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
        setIsModelDropdownOpen(false);
        setIsPlusMenuOpen(false);
        setIsMobileDrawerOpen(false);
        setIsAttachMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const toggleCitations = (msgId: string) => {
    setExpandedCitations((prev) => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  // Helper para añadir mensaje y persistir en la sesión activa
  const appendMessageToActiveChat = (newMsg: ChatMessage) => {
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, newMsg];

      setSessions((prevSessions) => {
        const currentActiveId = activeChatIdRef.current;
        const activeIdx = prevSessions.findIndex((s) => s.id === currentActiveId);

        if (activeIdx === -1) {
          const newSession: ChatSession = {
            id: currentActiveId,
            title:
              newMsg.sender === "customer"
                ? newMsg.content.trim().slice(0, 32) + (newMsg.content.length > 32 ? "..." : "")
                : "Consulta de Soporte",
            createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            updatedAt: new Date().toISOString(),
            messages: updatedMessages
          };
          const next = [newSession, ...prevSessions];
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {}
          return next;
        }

        const activeSession = prevSessions[activeIdx];
        let title = activeSession.title;
        if (title === "Nueva consulta" || title === "Nueva conversación") {
          const firstUser = updatedMessages.find((m) => m.sender === "customer");
          if (firstUser) {
            title =
              firstUser.content.trim().slice(0, 32) +
              (firstUser.content.length > 32 ? "..." : "");
          }
        }

        const updatedSession: ChatSession = {
          ...activeSession,
          title,
          updatedAt: new Date().toISOString(),
          messages: updatedMessages
        };

        const next = [
          updatedSession,
          ...prevSessions.filter((_, idx) => idx !== activeIdx)
        ];
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });

      return updatedMessages;
    });
  };

  // Crear nuevo chat validando que el actual tenga contenido
  const handleNewChat = () => {
    if (!currentChatHasContent) {
      triggerToast("El chat actual no tiene contenido");
      return;
    }

    const newSessionId = `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: "Nueva consulta",
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      updatedAt: new Date().toISOString(),
      messages: []
    };

    setSessions((prev) => {
      const nextSessions = [newSession, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSessions));
      } catch {}
      return nextSessions;
    });

    setActiveChatId(newSessionId);
    activeChatIdRef.current = newSessionId;
    setMessages([]);
    setInputQuery("");
    setIsPlusMenuOpen(false);
    setIsMobileDrawerOpen(false);
    triggerToast("Nueva conversación iniciada");
  };

  // Cambiar a otra conversación del historial
  const handleSelectChat = (sessionId: string) => {
    if (sessionId === activeChatIdRef.current) {
      setIsMobileDrawerOpen(false);
      return;
    }
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setIsChatLoading(true);
      setActiveChatId(sessionId);
      activeChatIdRef.current = sessionId;
      setMessages(session.messages || []);
      setInputQuery("");
      setIsMobileDrawerOpen(false);
      setTimeout(() => {
        setIsChatLoading(false);
      }, 250);
    }
  };

  // Eliminar un chat del historial
  const handleDeleteChat = (e: React.MouseEvent, sessionIdToDelete: string) => {
    e.stopPropagation();

    setSessions((prevSessions) => {
      const remaining = prevSessions.filter((s) => s.id !== sessionIdToDelete);

      if (sessionIdToDelete === activeChatIdRef.current) {
        if (remaining.length > 0) {
          const nextActive = remaining[0];
          setActiveChatId(nextActive.id);
          activeChatIdRef.current = nextActive.id;
          setMessages(nextActive.messages || []);
        } else {
          const freshId = `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
          const freshSession: ChatSession = {
            id: freshId,
            title: "Nueva consulta",
            createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            updatedAt: new Date().toISOString(),
            messages: []
          };
          setActiveChatId(freshId);
          activeChatIdRef.current = freshId;
          setMessages([]);
          const next = [freshSession];
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          } catch {}
          return next;
        }
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
      } catch {}
      return remaining;
    });

    triggerToast("Conversación eliminada");
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend !== undefined ? textToSend : inputQuery;
    const hasAttachments = pendingAttachments.length > 0;
    if ((!query.trim() && !hasAttachments) || isProcessing) return;

    const attachmentsToSend = [...pendingAttachments];
    const finalContent = query.trim()
      ? query
      : attachmentsToSend
          .map((a) => (a.type === "image" ? `[Imagen adjunta: ${a.name}]` : `[Documento PDF: ${a.name}]`))
          .join("\n");

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "customer",
      content: finalContent,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      attachments: attachmentsToSend.length > 0 ? attachmentsToSend : undefined
    };

    appendMessageToActiveChat(userMsg);
    setInputQuery("");
    setPendingAttachments([]);
    setIsProcessing(true);
    setIsPlusMenuOpen(false);

    try {
      const res = await fetch("http://localhost:8000/api/v1/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-ID": DEMO_TENANT_ID
        },
        body: JSON.stringify({
          message: finalContent,
          requester_email: "cliente@empresa.com",
          requester_name: "Usuario Final",
          metadata: {
            attachments: attachmentsToSend.map((a) => ({
              name: a.name,
              size: a.size,
              type: a.type
            }))
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: data.resolved_by_ai ? "ai" : "l2",
          content: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          confidence: data.confidence_score,
          resolved_by_ai: data.resolved_by_ai,
          status: data.status,
          citations: data.citations,
          ticket_id: data.ticket_id,
          assigned_agent: data.assigned_agent
        };
        appendMessageToActiveChat(aiMsg);
      } else {
        throw new Error("Backend no disponible");
      }
    } catch {
      // Fallback local simulado en tiempo real con enrutamiento departamental
      setTimeout(() => {
        const lower = finalContent.toLowerCase();

        // Detección automática del departamento según requerimientos de producción:
        let detectedArea: "Infraestructura" | "Sap" | "Magento" | "Sigo" = "Infraestructura";
        if (
          lower.includes("sap") ||
          lower.includes("sku") ||
          lower.includes("factura") ||
          lower.includes("finanza") ||
          lower.includes("pago") ||
          lower.includes("asiento") ||
          lower.includes("contab") ||
          lower.includes("cfdi")
        ) {
          detectedArea = "Sap";
        } else if (
          lower.includes("magento") ||
          lower.includes("pos") ||
          lower.includes("ecommerce") ||
          lower.includes("tienda") ||
          lower.includes("checkout") ||
          lower.includes("carrito")
        ) {
          detectedArea = "Magento";
        } else if (
          lower.includes("sigo") ||
          lower.includes("logistica") ||
          lower.includes("logística") ||
          lower.includes("despacho") ||
          lower.includes("ruta") ||
          lower.includes("bodega") ||
          lower.includes("almacen") ||
          lower.includes("almacén") ||
          lower.includes("guia") ||
          lower.includes("guía")
        ) {
          detectedArea = "Sigo";
        } else {
          detectedArea = "Infraestructura";
        }

        const specialistDirectory = {
          Infraestructura: {
            agent: "Carlos Mendoza (L2 Infraestructura)",
            manager: "Ing. Roberto Valdez (Gerente de Infraestructura)",
            manual: "manual_infraestructura_redes_win.pdf"
          },
          Sap: {
            agent: "Elena Rostova (L2 SAP & Finanzas)",
            manager: "Lic. Patricia Morales (Gerente de Finanzas & SAP)",
            manual: "guia_sap_erp_sku_facturacion.pdf"
          },
          Magento: {
            agent: "Marcos Toledo (L2 Magento & Ecommerce)",
            manager: "Ing. Gabriel Soto (Gerente de Ecommerce & Magento)",
            manual: "manual_magento_pos_checkout.pdf"
          },
          Sigo: {
            agent: "Sofía Guzmán (L2 Sigo & Logística)",
            manager: "Ing. Fernando Castro (Gerente de Logística & Sigo)",
            manual: "manual_operativo_sigo_despachos.pdf"
          }
        };

        const targetTeam = specialistDirectory[detectedArea];

        const isEscalation =
          lower.includes("humano") ||
          lower.includes("persona") ||
          lower.includes("urgente") ||
          lower.includes("bloque") ||
          lower.includes("falla") ||
          lower.includes("error") ||
          lower.includes("no puedo") ||
          lower.includes("caído") ||
          lower.includes("caido") ||
          lower.includes("clave");

        const ticketNum = `TK-${Math.floor(2000 + Math.random() * 8000)}`;

        let aiContent = "";
        if (attachmentsToSend.length > 0) {
          const filesSummary = attachmentsToSend.map((a) => a.name).join(", ");
          aiContent = isEscalation
            ? `Se han adjuntado los archivos (${filesSummary}) al ticket #${ticketNum} y se han derivado de inmediato a ${detectedArea}.\n\nEl especialista ${targetTeam.agent} ha recibido las evidencias y ya se encuentra analizando tu caso.`
            : `Hemos procesado los archivos adjuntos (${filesSummary}) para el departamento de ${detectedArea}:\n\n1. Las evidencias han sido vinculadas a tu consulta técnica.\n2. Verificando los manuales y registros para resolver tu solicitud con la mayor precisión.`;
        } else {
          aiContent = isEscalation
            ? `Comprendo la criticidad del problema. He generado el ticket #${ticketNum} y lo he derivado de inmediato al departamento de ${detectedArea}.\n\nEl especialista ${targetTeam.agent} ha recibido el caso con todo el historial de la conversación y ya se encuentra revisando tu incidencia. En caso de requerir autorización ejecutiva, el especialista cuenta con canal directo a ${targetTeam.manager}.`
            : `Hemos verificado la documentación oficial del departamento de ${detectedArea} para resolver tu consulta:\n\n1. Comprueba la configuración de credenciales y el estado del servicio de ${detectedArea}.\n2. Si el problema persiste o requieres asistencia de un operador humano, indícanos 'requiero hablar con un agente' para transferirte con ${targetTeam.agent}.`;
        }

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: isEscalation ? "l2" : "ai",
          content: aiContent,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          confidence: isEscalation ? 0.42 : 0.94,
          resolved_by_ai: !isEscalation,
          status: isEscalation ? "escalated" : "resolved_by_ai",
          ticket_id: isEscalation ? ticketNum : undefined,
          assigned_agent: isEscalation ? targetTeam.agent : undefined,
          citations: isEscalation
            ? []
            : [
                {
                  document_name: targetTeam.manual,
                  chunk_index: 1,
                  relevance_score: 0.94,
                  excerpt: `Procedimiento de soporte estándar para resolución de incidencias en la plataforma ${detectedArea}.`
                }
              ]
        };

        appendMessageToActiveChat(aiMsg);
        setIsProcessing(false);
      }, 700);
      return;
    }

    setIsProcessing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className={`h-screen w-screen flex flex-col bg-black text-white font-sans overflow-hidden select-none relative transition-all duration-500 ease-out ${
        !isPageMounted
          ? "opacity-0 scale-[0.99] blur-[3px]"
          : isSystemExiting
          ? "opacity-0 scale-[0.985] blur-sm pointer-events-none"
          : "opacity-100 scale-100 blur-0"
      }`}
    >
      {/* ========================================================================= */}
      {/* FONDO CON COLOR GRADING DE LA IMAGEN DE INSPIRACIÓN (AZUL ÍNDIGO NOCTURNO) */}
      {/* ========================================================================= */}
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        {/* Gradiente radial profundo con azul nocturno emergiendo en la mitad inferior */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 135% 72% at 50% 100%, rgba(20, 35, 89, 0.82) 0%, rgba(11, 22, 58, 0.55) 34%, rgba(5, 10, 30, 0.28) 62%, rgba(0, 0, 0, 0) 90%)"
          }}
        />
        {/* Resplandor suave inferior que abraza el área del input flotante */}
        <div
          className="absolute bottom-0 left-0 right-0 h-96"
          style={{
            background:
              "linear-gradient(to top, rgba(14, 26, 70, 0.35) 0%, rgba(0, 0, 0, 0) 100%)"
          }}
        />
      </div>
       {/* ========================================================================= */}
      {/* 1. HEADER RESPONSIVE (MOBILE - ESTILO GLASS CON ALTO BLUR SIN BORDES) */}
      {/* ========================================================================= */}
      <header className="glass-navbar fixed top-0 left-0 right-0 h-14 flex md:hidden items-center justify-between px-4 z-30 transition-all duration-300">
        {/* Lado Izquierdo: Icono 2 barras horizontales + Selector de Modelo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="mobile-drawer-trigger"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="p-1 -ml-1 text-white hover:text-neutral-300 transition cursor-pointer"
            aria-label="Abrir menú de navegación"
          >
            <div className="w-5 flex flex-col justify-center gap-1.5">
              <span className="block h-[2px] w-5 bg-white rounded-full"></span>
              <span className="block h-[2px] w-5 bg-white rounded-full"></span>
            </div>
          </button>

          {/* Título de Cabecera Móvil: Soporte */}
          <span className="font-semibold text-white text-base tracking-tight select-none">
            Soporte
          </span>
        </div>

        {/* Lado Derecho: Icono Nuevo Chat (Pluma/Brillo) + Avatar 'A' con color de referencia */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="mobile-new-chat-btn"
            disabled={!currentChatHasContent}
            onClick={handleNewChat}
            className={`p-1.5 transition ${
              currentChatHasContent
                ? "text-neutral-300 hover:text-white cursor-pointer"
                : "text-neutral-600 cursor-not-allowed opacity-40"
            }`}
            title={
              currentChatHasContent
                ? "Nueva conversación"
                : "El chat actual aún no tiene contenido"
            }
            aria-label="Nueva conversación"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
            </svg>
          </button>

          {/* Avatar A con color de la imagen de inspiración */}
          <button
            type="button"
            id="mobile-profile-avatar-btn"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="w-8 h-8 rounded-full bg-[#c2185b] text-white font-semibold text-xs flex items-center justify-center hover:opacity-90 transition cursor-pointer shadow-md"
            title="Perfil de Usuario"
            aria-label="Perfil de Usuario"
          >
            A
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HEADER DESKTOP (ESTILO GLASS CON ALTO BLUR SIN BORDES) */}
      {/* ========================================================================= */}
      <header className="glass-navbar fixed top-0 left-0 right-0 h-14 hidden md:flex px-6 items-center justify-between z-30 transition-all duration-300">
        <div className="flex items-center gap-3">
          {/* Botón Historial de Chats Desktop (Estilo 2 barras sin bordes) */}
          <button
            type="button"
            id="desktop-drawer-trigger"
            onClick={() => setIsMobileDrawerOpen((prev) => !prev)}
            className="p-1.5 -ml-1 text-white hover:text-neutral-300 transition cursor-pointer flex items-center gap-2 rounded-xl hover:bg-neutral-900/60"
            title="Historial de conversaciones"
            aria-label="Abrir historial de conversaciones"
          >
            <div className="w-5 flex flex-col justify-center gap-1.5">
              <span className="block h-[2px] w-5 bg-white rounded-full"></span>
              <span className="block h-[2px] w-5 bg-white rounded-full"></span>
            </div>
            <span className="text-xs font-medium text-neutral-300">
              Historial
            </span>
          </button>

          <button
            type="button"
            disabled={!currentChatHasContent}
            onClick={handleNewChat}
            className={`h-8 px-2.5 rounded-xl backdrop-blur-xl flex items-center justify-center font-mono text-xs font-bold transition shadow-md ${
              currentChatHasContent
                ? "bg-neutral-900/60 hover:bg-neutral-850/80 text-white cursor-pointer"
                : "bg-neutral-950/40 text-neutral-600 cursor-not-allowed opacity-50"
            }`}
            title={
              currentChatHasContent
                ? "Iniciar nueva conversación"
                : "El chat actual aún no tiene contenido"
            }
          >
            GILSA L1
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-white tracking-tight">
                Centro de Ayuda y Reportes
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono text-neutral-300 bg-neutral-900/50 backdrop-blur-md rounded font-medium">
                Soporte L1
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>Agente Autónomo activo en tiempo real</span>
            </div>
          </div>
        </div>

        {/* Acceso a Admin / Agentes L2 y Perfil */}
        <div className="flex items-center gap-3">
          {authSession?.role !== "END_USER" && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-900/60 hover:bg-neutral-800/80 backdrop-blur-xl rounded-xl transition shadow-md cursor-pointer"
              title="Consola de Administración y Agentes L2"
            >
              <Headphones className="w-3.5 h-3.5 text-neutral-400" />
              <span>Consola Admin & L2</span>
              <ExternalLink className="w-3 h-3 text-neutral-500" />
            </Link>
          )}

          {/* Botón de Perfil Desktop */}
          <div className="relative" ref={profileMenuRef}>
            <button
              id="desktop-user-profile-menu-trigger"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="true"
              className="relative w-8 h-8 rounded-full bg-[#c2185b] hover:opacity-90 text-white text-xs font-semibold flex items-center justify-center transition focus:outline-none cursor-pointer shadow-md"
              title="Perfil de Usuario"
            >
              <span>{authSession?.name ? authSession.name.charAt(0).toUpperCase() : "A"}</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-white border border-neutral-950" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MENÚ DE PERFIL FLOTANTE (ESTILO GLASS CON ALTO BLUR SIN BORDES) */}
      {/* ========================================================================= */}
      {isProfileMenuOpen && (
        <div
          ref={profileMenuRef}
          className="fixed top-14 right-4 w-72 bg-neutral-950/75 backdrop-blur-3xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-2.5 z-50 animate-message-smooth"
        >
          <div className="p-2.5 bg-white/[0.04] backdrop-blur-md rounded-xl mb-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#c2185b] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 shadow-sm">
                {authSession?.name ? authSession.name.charAt(0).toUpperCase() : "A"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">
                  {authSession?.name || "Usuario Corporativo"}
                </div>
                <div className="text-[11px] text-neutral-400 truncate">
                  {authSession?.email || "soporte.corp@gilsa.com"}
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="px-2 py-0.5 text-[10px] font-mono text-neutral-300 bg-neutral-900/60 backdrop-blur-sm rounded">
                {authSession?.role === "END_USER"
                  ? "USUARIO FINAL • PORTAL L1"
                  : authSession?.role === "L2"
                  ? "ESPECIALISTA L2 • SOPORTE"
                  : authSession?.role === "L3"
                  ? "GERENTE L3 • MASTER"
                  : "PORTAL CLIENTE • GILSA"}
              </span>
            </div>
          </div>

          <div className="space-y-0.5 py-1">
            <Link
              href="/profile"
              onClick={() => setIsProfileMenuOpen(false)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-neutral-900/60 backdrop-blur-md transition text-left cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-neutral-400" />
              <div className="flex-1">
                <div className="font-medium">Mi Cuenta</div>
                <div className="text-[10px] text-neutral-500">Datos del solicitante</div>
              </div>
            </Link>

            <Link
              href="/security"
              onClick={() => setIsProfileMenuOpen(false)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-neutral-900/60 backdrop-blur-md transition text-left cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-neutral-400" />
              <div className="flex-1">
                <div className="font-medium">Privacidad y Políticas</div>
                <div className="text-[10px] text-neutral-500">Aislamiento de datos corporativos</div>
              </div>
            </Link>

            <Link
              href="/preferences"
              onClick={() => setIsProfileMenuOpen(false)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-neutral-900/60 backdrop-blur-md transition text-left cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-neutral-400" />
              <div className="flex-1">
                <div className="font-medium">Preferencias</div>
                <div className="text-[10px] text-neutral-500">Tema minimalista</div>
              </div>
            </Link>
          </div>

          <div className="h-px bg-white/5 my-1.5" />

          <button
            type="button"
            id="user-logout-button"
            onClick={() => {
              setIsProfileMenuOpen(false);
              setShowLogoutModal(true);
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs text-neutral-300 hover:text-white hover:bg-neutral-900/60 backdrop-blur-md transition text-left cursor-pointer group"
          >
            <LogOut className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition" />
            <div className="flex-1">
              <div className="font-medium text-white">Cerrar Sesión</div>
              <div className="text-[10px] text-neutral-500">Finalizar sesión activa</div>
            </div>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CONTENIDO CENTRAL: FEED DE CHAT O VISTA HERO CON LOGO DE GILSA */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col w-full max-w-4xl mx-auto overflow-hidden px-4 sm:px-6 relative z-10 h-full">
        {isChatLoading ? (
          <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full p-6 space-y-6 animate-pulse select-none">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-800" />
              <div className="space-y-2 flex-1">
                <div className="w-36 h-3.5 bg-neutral-800 rounded" />
                <div className="w-48 h-2.5 bg-neutral-850 rounded" />
              </div>
            </div>
            <div className="space-y-3 p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800/80">
              <div className="w-3/4 h-3 bg-neutral-800 rounded" />
              <div className="w-full h-3 bg-neutral-800/70 rounded" />
              <div className="w-5/6 h-3 bg-neutral-800/70 rounded" />
            </div>
            <div className="flex items-start gap-3 max-w-md ml-auto flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-neutral-800" />
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800/80 w-64 space-y-2">
                <div className="w-full h-2.5 bg-neutral-700 rounded" />
                <div className="w-2/3 h-2.5 bg-neutral-700 rounded" />
              </div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          /* =================================================================== */
          /* ESTADO INICIAL HERO: EXACTO A LA REFERENCIA CON LOGO GILSA */
          /* =================================================================== */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-14 animate-message-smooth select-none">
            {/* Logo de Gilsa en el centro */}
            <div className="w-44 sm:w-52 max-w-[220px] flex items-center justify-center transition-transform duration-500 hover:scale-[1.02]">
              <img
                src="/gilsa-logo.png"
                alt="GILSA Logo"
                className="w-full h-auto object-contain filter invert-0 drop-shadow-[0_12px_24px_rgba(0,0,0,0.8)]"
              />
            </div>

            {/* Texto exacto de la imagen de referencia */}
            <h1 className="text-2xl sm:text-3xl font-normal text-white tracking-tight mt-6">
              Listo cuando quieras
            </h1>
          </div>
        ) : (
          /* =================================================================== */
          /* FEED DE MENSAJES CONVERSACIONALES (CON ANIMACIÓN SUAVE Y BLUR) */
          /* =================================================================== */
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 pt-16 pb-4">
            {messages.map((msg) => {
              const isUser = msg.sender === "customer";
              const isEscalated = msg.sender === "l2";

              return (
                <div
                  key={msg.id}
                  className={`animate-message-smooth flex flex-col ${isUser ? "items-end" : "items-start"} transition-all duration-300 ease-out`}
                >
                  {/* Cabecera del Mensaje */}
                  <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-neutral-400">
                    {isUser ? (
                      <>
                        <span>{msg.timestamp}</span>
                        <span className="font-medium text-neutral-300">Tú</span>
                        <div className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center">
                          <User className="w-2.5 h-2.5 text-neutral-400" />
                        </div>
                      </>
                    ) : isEscalated ? (
                      <>
                        <div className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center">
                          <Headphones className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="font-medium text-white">{msg.assigned_agent || "Soporte Nivel 2"}</span>
                        <span className="px-1.5 py-0.2 text-[9px] font-mono bg-neutral-900 border border-neutral-700 text-white rounded">
                          HUMANO L2
                        </span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 rounded-full bg-neutral-800 flex items-center justify-center">
                          <Bot className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className="font-medium text-white">Agente L1 Autónomo</span>
                        <span className="px-1.5 py-0.2 text-[9px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300 rounded">
                          IA RAG
                        </span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </>
                    )}
                  </div>

                  {/* Burbuja del Mensaje con estilo glass y blur sin bordes */}
                  <div
                    className={`max-w-[88%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed transition-all duration-300 shadow-xl ${
                      isUser
                        ? "bg-neutral-850/60 backdrop-blur-2xl text-white"
                        : "bg-neutral-950/45 backdrop-blur-2xl text-neutral-200"
                    }`}
                  >
                    {/* Adjuntos en el Mensaje (Fotos y PDFs) */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mb-2.5 space-y-2">
                        {/* Galería de fotos adjuntas */}
                        {msg.attachments.filter((a) => a.type === "image").length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {msg.attachments
                              .filter((a) => a.type === "image")
                              .map((att) => (
                                <div
                                  key={att.id}
                                  onClick={() => setPreviewModalImage(att.url)}
                                  className="relative group rounded-xl overflow-hidden bg-neutral-900/60 cursor-pointer shadow-md transition-transform hover:scale-[1.01]"
                                  title="Ver imagen en tamaño completo"
                                >
                                  <img
                                    src={att.url}
                                    alt={att.name}
                                    className="max-h-56 max-w-full rounded-xl object-contain bg-black/40"
                                  />
                                  <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-neutral-300">
                                    {(att.size / 1024).toFixed(0)} KB
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}

                        {/* Documentos PDF adjuntos */}
                        {msg.attachments.filter((a) => a.type === "pdf").length > 0 && (
                          <div className="space-y-1.5">
                            {msg.attachments
                              .filter((a) => a.type === "pdf")
                              .map((att) => (
                                <div
                                  key={att.id}
                                  className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/70 backdrop-blur-md text-xs shadow-md"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                    <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0 text-white font-mono text-[10px] font-bold">
                                      PDF
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-medium text-white truncate text-xs">
                                        {att.name}
                                      </p>
                                      <p className="text-[10px] text-neutral-400 font-mono">
                                        {(att.size / 1024).toFixed(0)} KB
                                      </p>
                                    </div>
                                  </div>
                                  {att.url && (
                                    <a
                                      href={att.url}
                                      download={att.name}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition cursor-pointer"
                                      title="Descargar documento"
                                    >
                                      <Download className="w-4 h-4" />
                                    </a>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    )}

                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* Badge de ticket si fue escalado */}
                    {msg.ticket_id && isEscalated && (
                      <div className="mt-3 p-2.5 rounded-xl bg-white/[0.04] backdrop-blur-md flex items-center justify-between text-[11px] text-neutral-400">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-white" />
                          <span>Ticket derivado a cola humana:</span>
                          <span className="font-mono text-white font-semibold">{msg.ticket_id}</span>
                        </div>
                        <span className="text-[10px] text-neutral-500">Prioridad Alta</span>
                      </div>
                    )}

                    {/* Citas y Fuentes RAG */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-1.5">
                        <button
                          onClick={() => toggleCitations(msg.id)}
                          className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-white transition cursor-pointer"
                        >
                          <FileText className="w-3 h-3 text-neutral-400" />
                          <span>{msg.citations.length} Fuente consultada en la Base de Conocimiento</span>
                          {expandedCitations[msg.id] ? (
                            <ChevronUp className="w-3 h-3 ml-0.5" />
                          ) : (
                            <ChevronDown className="w-3 h-3 ml-0.5" />
                          )}
                        </button>

                        {expandedCitations[msg.id] && (
                          <div className="mt-2 space-y-1.5 animate-message-smooth">
                            {msg.citations.map((cite, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 rounded-xl bg-neutral-900/50 backdrop-blur-xl text-[11px] space-y-1 shadow-md"
                              >
                                <div className="flex items-center justify-between font-mono text-[10px] text-neutral-300">
                                  <span className="font-semibold text-white truncate max-w-[200px]">
                                    {cite.document_name}
                                  </span>
                                  <span>Relevancia: {(cite.relevance_score * 100).toFixed(0)}%</span>
                                </div>
                                <p className="text-neutral-400 text-[10px] italic bg-black/40 backdrop-blur-md p-2 rounded-lg">
                                  &quot;{cite.excerpt}&quot;
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Estado 'Escribiendo / Analizando' con estilo glass y blur */}
            {isProcessing && (
              <div className="animate-message-smooth flex flex-col items-start space-y-1.5 transition-all duration-300">
                <div className="flex items-center gap-2 px-1 text-[11px] text-neutral-400">
                  <Bot className="w-3 h-3 text-white animate-spin" />
                  <span>El agente está analizando la solicitud y consultando la base de conocimiento...</span>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-neutral-950/45 backdrop-blur-2xl flex items-center gap-2 shadow-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-white typing-dot-1" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 typing-dot-2" />
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 typing-dot-3" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. BARRA DE ENTRADA: DISEÑO GLASS CON BLUR SIN BORDES */}
        {/* ========================================================================= */}
        <div className="w-full pb-5 pt-2 relative z-20">
          {/* Popup Menú del Botón Plus (+) con Blur y Estilo Glass */}
          {isPlusMenuOpen && (
            <div
              ref={plusMenuRef}
              className="absolute bottom-20 left-0 right-0 max-w-lg mx-auto bg-neutral-950/80 backdrop-blur-3xl rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.85)] p-2.5 space-y-1.5 z-40 animate-message-smooth"
            >
              <div className="text-[10px] font-mono text-neutral-400 px-2 py-1 uppercase tracking-wider">
                Atajos Departamentales
              </div>
              <button
                type="button"
                onClick={() => {
                  handleSendMessage("Tengo bloqueada mi clave de Windows y la impresora no responde.");
                  setIsPlusMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white bg-neutral-900/60 hover:bg-neutral-850/80 backdrop-blur-md rounded-xl transition flex items-center justify-between cursor-pointer"
              >
                <span>Infraestructura: Clave & Impresora</span>
                <span className="text-[10px] font-mono text-neutral-400">Redes</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSendMessage("El sistema SAP arroja error de SKU no encontrado al timbrar factura.");
                  setIsPlusMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white bg-neutral-900/60 hover:bg-neutral-850/80 backdrop-blur-md rounded-xl transition flex items-center justify-between cursor-pointer"
              >
                <span>SAP: Error SKU & Facturación</span>
                <span className="text-[10px] font-mono text-neutral-400">Finanzas</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSendMessage("La terminal POS de la tienda perdió conexión con Magento.");
                  setIsPlusMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white bg-neutral-900/60 hover:bg-neutral-850/80 backdrop-blur-md rounded-xl transition flex items-center justify-between cursor-pointer"
              >
                <span>Magento: Fallo POS & Ecommerce</span>
                <span className="text-[10px] font-mono text-neutral-400">Ventas</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSendMessage("No podemos ingresar a Sigo y los camiones están detenidos.");
                  setIsPlusMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-200 hover:text-white bg-neutral-900/60 hover:bg-neutral-850/80 backdrop-blur-md rounded-xl transition flex items-center justify-between cursor-pointer"
              >
                <span>Sigo: Rutas y Despacho</span>
                <span className="text-[10px] font-mono text-neutral-400">Logística</span>
              </button>
              <div className="h-px bg-white/5 my-1"></div>
              <button
                type="button"
                onClick={() => {
                  imageInputRef.current?.click();
                  setIsPlusMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:text-white bg-neutral-900/40 hover:bg-neutral-900/70 backdrop-blur-md rounded-xl transition flex items-center gap-2 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
                <span>Adjuntar Foto (PNG, JPG, WEBP)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  pdfInputRef.current?.click();
                  setIsPlusMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs text-neutral-300 hover:text-white bg-neutral-900/40 hover:bg-neutral-900/70 backdrop-blur-md rounded-xl transition flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-neutral-400" />
                <span>Adjuntar Archivo (Documento PDF)</span>
              </button>
            </div>
          )}

          {/* Previsualización de archivos adjuntos pendientes antes de enviar */}
          {pendingAttachments.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2.5 px-1 animate-message-smooth">
              {pendingAttachments.map((att) => (
                <div
                  key={att.id}
                  className="relative group flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-neutral-900/80 backdrop-blur-2xl shadow-xl flex-shrink-0"
                >
                  {att.type === "image" ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
                      <img
                        src={att.url}
                        alt={att.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0 font-mono text-[10px] text-white font-bold">
                      PDF
                    </div>
                  )}
                  <div className="max-w-[130px]">
                    <p className="text-xs text-white truncate font-medium">{att.name}</p>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      {(att.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePendingAttachment(att.id)}
                    className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer ml-1"
                    title="Eliminar adjunto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Inputs ocultos para fotos y PDFs */}
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleFileSelect}
            accept="image/*,image/png,image/jpeg,image/webp,image/gif"
            multiple
            className="hidden"
            id="chat-image-upload-input"
          />
          <input
            type="file"
            ref={pdfInputRef}
            onChange={handleFileSelect}
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            id="chat-pdf-upload-input"
          />

          {/* Versión Mobile: Pill Rounded Full estilo glass con blur sin bordes */}
          <div className="flex md:hidden items-center bg-[#1e1f20]/75 backdrop-blur-2xl rounded-full pl-2 pr-2 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.7)] focus-within:bg-[#252629]/85 transition-all duration-300 relative">
            {/* Botón Plus (+) */}
            <button
              type="button"
              id="mobile-plus-btn"
              onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-300 hover:text-white transition flex-shrink-0 cursor-pointer"
              title="Opciones adicionales"
              aria-label="Opciones adicionales"
            >
              <Plus className={`w-5 h-5 transition-transform duration-200 ${isPlusMenuOpen ? "rotate-45" : ""}`} />
            </button>

            {/* Contenedor del Botón de Adjuntos (Mobile) con Menú Flotante Superior */}
            <div className="relative" ref={mobileAttachMenuRef}>
              {/* Menú de opciones encima del botón (Mobile) */}
              {isAttachMenuOpen && (
                <div className="absolute bottom-full mb-3.5 left-0 w-48 bg-neutral-950/90 backdrop-blur-3xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-1.5 space-y-1 z-50 animate-message-smooth">
                  <button
                    type="button"
                    id="mobile-attach-photo-opt"
                    onClick={() => {
                      imageInputRef.current?.click();
                      setIsAttachMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-neutral-900/80 transition cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center text-neutral-300 group-hover:text-white transition">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white">Foto</div>
                      <div className="text-[10px] text-neutral-400 font-mono">PNG, JPG, WEBP</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    id="mobile-attach-file-opt"
                    onClick={() => {
                      pdfInputRef.current?.click();
                      setIsAttachMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-neutral-900/80 transition cursor-pointer group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center text-neutral-300 group-hover:text-white transition">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white">Archivo</div>
                      <div className="text-[10px] text-neutral-400 font-mono">Documento PDF</div>
                    </div>
                  </button>
                </div>
              )}

              <button
                type="button"
                id="mobile-attach-btn"
                onClick={() => setIsAttachMenuOpen((prev) => !prev)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition flex-shrink-0 cursor-pointer ${
                  isAttachMenuOpen ? "text-white bg-white/10" : "text-neutral-300 hover:text-white"
                }`}
                title="Adjuntar foto o archivo"
                aria-label="Adjuntar foto o archivo"
                aria-expanded={isAttachMenuOpen}
              >
                <Paperclip className="w-4 h-4" />
              </button>
            </div>

            {/* Input con placeholder exacto: 'Pregunta a Gemini' */}
            <input
              type="text"
              id="mobile-chat-input"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={pendingAttachments.length > 0 ? "Añade un mensaje o envía tus adjuntos..." : "Pregunta a Gemini"}
              disabled={isProcessing}
              className="flex-1 bg-transparent text-sm text-white placeholder-neutral-400 focus:outline-none px-2 py-1"
            />

            {/* Micrófono o botón enviar */}
            {inputQuery.trim() || pendingAttachments.length > 0 ? (
              <button
                type="button"
                id="mobile-send-btn"
                onClick={() => handleSendMessage()}
                disabled={isProcessing}
                className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-neutral-200 transition flex-shrink-0 cursor-pointer shadow-md"
                title="Enviar mensaje"
                aria-label="Enviar mensaje"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            ) : (
              <button
                type="button"
                id="mobile-mic-btn"
                onClick={() => triggerToast("Función de entrada por voz preparada.")}
                className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-300 hover:text-white transition flex-shrink-0 cursor-pointer"
                title="Entrada por voz"
                aria-label="Entrada por voz"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Versión Desktop: Caja limpia estilo glass con blur sin bordes */}
          <div className="hidden md:flex flex-col gap-2">
            <div className="flex items-center gap-2 p-2 bg-neutral-950/50 backdrop-blur-2xl rounded-2xl shadow-2xl focus-within:bg-neutral-900/60 transition-all duration-300">
              {/* Contenedor del Botón de Adjuntos (Desktop) con Menú Flotante Superior */}
              <div className="relative" ref={desktopAttachMenuRef}>
                {/* Menú de opciones encima del botón (Desktop) */}
                {isAttachMenuOpen && (
                  <div className="absolute bottom-full mb-3.5 left-0 w-52 bg-neutral-950/90 backdrop-blur-3xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-1.5 space-y-1 z-50 animate-message-smooth">
                    <button
                      type="button"
                      id="desktop-attach-photo-opt"
                      onClick={() => {
                        imageInputRef.current?.click();
                        setIsAttachMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-neutral-900/80 transition cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center text-neutral-300 group-hover:text-white transition">
                        <ImageIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white">Foto</div>
                        <div className="text-[10px] text-neutral-400 font-mono">PNG, JPG, WEBP</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      id="desktop-attach-file-opt"
                      onClick={() => {
                        pdfInputRef.current?.click();
                        setIsAttachMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-neutral-900/80 transition cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center text-neutral-300 group-hover:text-white transition">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-white">Archivo</div>
                        <div className="text-[10px] text-neutral-400 font-mono">Documento PDF</div>
                      </div>
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  id="desktop-attach-file-btn"
                  onClick={() => setIsAttachMenuOpen((prev) => !prev)}
                  className={`p-2 rounded-lg transition cursor-pointer ${
                    isAttachMenuOpen
                      ? "text-white bg-white/[0.08]"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.06]"
                  }`}
                  title="Adjuntar fotos o archivos"
                  aria-label="Adjuntar fotos o archivos"
                  aria-expanded={isAttachMenuOpen}
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>

              <input
                type="text"
                id="desktop-chat-input"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  pendingAttachments.length > 0
                    ? "Añade una descripción a tus adjuntos o presiona Enviar..."
                    : "Pregunta a Gemini o describe tu consulta de soporte..."
                }
                disabled={isProcessing}
                className="flex-1 bg-transparent px-2 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none disabled:opacity-50"
              />

              <button
                type="button"
                id="desktop-send-btn"
                onClick={() => handleSendMessage()}
                disabled={(!inputQuery.trim() && pendingAttachments.length === 0) || isProcessing}
                className="px-3.5 py-1.5 rounded-xl bg-white text-black hover:bg-neutral-200 transition font-medium text-xs flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-md"
              >
                <span>Enviar</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between px-2 text-[10px] text-neutral-500 font-mono">
              <span>Soporte automatizado L1 con fallback a humanos L2 • Admite fotos y PDF</span>
              <span>Presiona Enter para enviar</span>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 5. DRAWER LATERAL (HISTORIAL DE CHATS Y NUEVO CHAT CON BLUR SIN BORDES) */}
      {/* ========================================================================= */}
      {/* Fondo traslúcido con blur suave */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ease-out ${
          isMobileDrawerOpen
            ? "opacity-100 pointer-events-auto backdrop-blur-md bg-black/60"
            : "opacity-0 pointer-events-none backdrop-blur-none bg-black/0"
        }`}
        onClick={() => setIsMobileDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Panel lateral con despliegue suave, traslación y desenfoque (blur) sin bordes */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-80 sm:w-84 max-w-[85vw] z-50 bg-neutral-950/85 backdrop-blur-3xl flex flex-col p-4 shadow-[0_25px_60px_rgba(0,0,0,0.9)] transition-all duration-300 ease-out transform ${
          isMobileDrawerOpen
            ? "translate-x-0 opacity-100 blur-none pointer-events-auto"
            : "-translate-x-full opacity-0 blur-md pointer-events-none"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Historial de conversaciones"
      >
        {/* Cabecera del Drawer */}
        <div className="flex items-center justify-between pb-3.5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-white tracking-tight">Conversaciones</span>
            <span className="text-[10px] font-mono bg-neutral-900/80 px-2 py-0.5 rounded-md text-neutral-400">
              Historial
            </span>
          </div>
          <button
            type="button"
            id="mobile-drawer-close-btn"
            onClick={() => setIsMobileDrawerOpen(false)}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900/70 transition cursor-pointer"
            aria-label="Cerrar historial"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Botón de Nuevo Chat (Deshabilitado si el chat actual no tiene contenido) */}
        <div className="pt-3.5 pb-2 flex-shrink-0">
          <button
            type="button"
            id="mobile-drawer-new-chat-btn"
            disabled={!currentChatHasContent}
            onClick={handleNewChat}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              currentChatHasContent
                ? "bg-neutral-900/90 hover:bg-neutral-850 text-white cursor-pointer shadow-md active:scale-[0.98]"
                : "bg-neutral-900/30 text-neutral-600 cursor-not-allowed opacity-50"
            }`}
            title={
              currentChatHasContent
                ? "Iniciar nueva conversación"
                : "El chat actual aún no tiene contenido"
            }
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Nuevo chat</span>
            </div>
            {!currentChatHasContent && (
              <span className="text-[10px] font-mono text-neutral-500 bg-neutral-950/80 px-2 py-0.5 rounded-md">
                Sin contenido
              </span>
            )}
          </button>
        </div>

        {/* Encabezado de la lista de historial */}
        <div className="pt-2 pb-1.5 text-[10px] font-mono text-neutral-500 uppercase tracking-wider px-1 flex items-center justify-between flex-shrink-0">
          <span>Historial</span>
          <span>{sessions.filter((s) => s.messages.length > 0).length} guardados</span>
        </div>

        {/* Lista de Chats con Historial y Opción de Borrar */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 -mr-1">
          {sessions.filter((s) => s.messages.length > 0 || s.id === activeChatId).length === 0 ? (
            <div className="py-12 text-center px-4">
              <MessageSquare className="w-7 h-7 text-neutral-700 mx-auto mb-2" />
              <p className="text-xs text-neutral-400 font-medium">Sin historial previo</p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Las consultas que realices aparecerán registradas aquí.
              </p>
            </div>
          ) : (
            sessions
              .filter((s) => s.messages.length > 0 || s.id === activeChatId)
              .map((session) => {
                const isActive = session.id === activeChatId;
                const msgCount = session.messages.length;

                return (
                  <div
                    key={session.id}
                    onClick={() => handleSelectChat(session.id)}
                    className={`w-full group flex items-center justify-between p-2.5 rounded-xl text-left transition cursor-pointer ${
                      isActive
                        ? "bg-neutral-900/90 text-white shadow-md"
                        : "bg-neutral-900/30 hover:bg-neutral-900/60 text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                      <MessageSquare
                        className={`w-3.5 h-3.5 flex-shrink-0 ${
                          isActive ? "text-white" : "text-neutral-500 group-hover:text-neutral-300"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate leading-tight">
                          {session.title || "Consulta sin título"}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate">
                          {session.createdAt} • {msgCount} {msgCount === 1 ? "mensaje" : "mensajes"}
                        </p>
                      </div>
                    </div>

                    {/* Botón de borrar chat */}
                    <button
                      type="button"
                      onClick={(e) => handleDeleteChat(e, session.id)}
                      className="p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800/80 transition cursor-pointer flex-shrink-0"
                      title="Eliminar conversación"
                      aria-label={`Eliminar conversación ${session.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 6. MODAL DE CONFIRMACIÓN DE LOGOUT */}
      {/* ========================================================================= */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 flex-shrink-0">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Cerrar Sesión</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  ¿Deseas salir del portal de soporte corporativo?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-3.5 py-1.5 text-xs text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="px-3.5 py-1.5 text-xs text-white bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Confirmar Salida</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lightbox para ver fotos en tamaño completo */}
      {previewModalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewModalImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewModalImage(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-neutral-300 rounded-full bg-neutral-900/80 transition cursor-pointer"
              aria-label="Cerrar vista previa"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewModalImage}
              alt="Vista previa de adjunto"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TOAST DE NOTIFICACIÓN */}
      {/* ========================================================================= */}
      {portalToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-2xl backdrop-blur-md animate-message-smooth bg-neutral-900/90 border-neutral-800 text-white text-xs font-mono">
          <Check className="w-4 h-4 text-neutral-300 flex-shrink-0" />
          <span>{portalToast}</span>
        </div>
      )}
      {/* Transición de Salida Suave del Sistema */}
      <SystemTransitionOverlay
        isOpen={isSystemExiting}
        mode="exiting"
        title="Cerrando Sesión Segura"
        subtitle="Liberando canal de atención y purgando contexto de sesión..."
      />
    </div>
  );
}
