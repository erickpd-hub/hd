"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuthSession } from "../utils/auth";
import SectionSkeleton from "../components/SectionSkeleton";
import SystemTransitionOverlay from "../components/SystemTransitionOverlay";
import {
  Activity,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Upload,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Headphones,
  Search,
  Sparkles,
  Zap,
  BarChart3,
  RefreshCw,
  FileText,
  ChevronRight,
  Database,
  Ticket,
  GitBranch,
  ScrollText,
  Paperclip,
  Settings,
  ChevronDown,
  X,
  ExternalLink,
  Sliders,
  Server,
  ArrowRight,
  Cpu,
  UserCheck,
  Crown,
  Building2,
  AlertOctagon,
  MessageSquare,
  Tag,
  Filter,
  User,
  Users,
  UserPlus,
  Trash2,
  Edit3,
  Mail,
  Phone,
  Shield,
  Check,
  Lock,
  Plus,
  LogOut
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Demo tenant constant
const DEMO_TENANT_ID = "11111111-1111-1111-1111-111111111111";

interface SourceCitation {
  document_name: string;
  chunk_index: number;
  relevance_score: number;
  excerpt: string;
}

interface AgentTraceStep {
  node: string;
  action: string;
  details: Record<string, any>;
}

interface ChatMessage {
  id: string;
  sender: "customer" | "ai" | "l2";
  content: string;
  timestamp: string;
  confidence?: number;
  resolved_by_ai?: boolean;
  status?: string;
  sentiment?: string;
  priority?: string;
  area_name?: string;
  assigned_agent?: string;
  citations?: SourceCitation[];
  trace?: AgentTraceStep[];
}

export type OperatorArea = "all" | "Infraestructura" | "Sap" | "Magento" | "Sigo";

export interface DialogueMessage {
  id?: string;
  sender: "customer" | "ai" | "l2" | string;
  sender_name?: string;
  text: string;
  time: string;
}

export interface TicketItem {
  id: string;
  title: string;
  requester: string;
  requester_name?: string;
  area: string;
  priority: string;
  category?: string;
  sentiment?: string;
  status: string;
  assigned_to: string;
  manager_l3: string;
  manager_email: string;
  resolved_by_ai: boolean;
  confidence: number;
  sla_hours_left: number;
  created_at: string;
  summary: string;
  internal_notes?: string;
  ai_triage?: {
    suggestedArea: "Infraestructura" | "Sap" | "Magento" | "Sigo" | string;
    suggestedPriority: string;
    suggestedCategory: string;
    confidence: number;
    diagnosis: string;
  };
  dialogue?: DialogueMessage[];
}

export type UserRole = "L2" | "L3" | "END_USER";
export type UserDepartment = "Infraestructura" | "Sap" | "Magento" | "Sigo" | "General";

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  area: UserDepartment;
  specialty: string;
  status: "active" | "inactive";
  phone: string;
  createdAt: string;
}

export const INITIAL_MANAGED_USERS: ManagedUser[] = [
  {
    id: "usr-end-1",
    name: "Juan Pérez",
    email: "juan.perez@empresa.com",
    role: "END_USER",
    area: "General",
    specialty: "Usuario Final Corporativo • Consultas y Creación de Tickets L1 en Chat",
    status: "active",
    phone: "+52 55 5555 1234",
    createdAt: "2026-09-01"
  },
  {
    id: "usr-end-2",
    name: "Lucía Fernández",
    email: "lucia.fernandez@empresa.com",
    role: "END_USER",
    area: "Sap",
    specialty: "Usuario Final • Consultas sobre Facturación y Módulos Finanzas",
    status: "active",
    phone: "+52 55 5555 5678",
    createdAt: "2026-09-12"
  },
  {
    id: "usr-l2-1",
    name: "Carlos Mendoza",
    email: "carlos.mendoza@empresa.com",
    role: "L2",
    area: "Infraestructura",
    specialty: "Soporte Nivel 2 • Redes corporativas, Windows Server, Impresoras & Periféricos",
    status: "active",
    phone: "+52 55 1234 5678",
    createdAt: "2026-08-10"
  },
  {
    id: "usr-l3-1",
    name: "Ing. Roberto Valdez",
    email: "gerencia.infra@empresa.com",
    role: "L3",
    area: "Infraestructura",
    specialty: "Gerente de Infraestructura & Redes • Escalamiento Nivel 3 y Arquitectura",
    status: "active",
    phone: "+52 55 9876 5432",
    createdAt: "2026-07-01"
  },
  {
    id: "usr-l2-2",
    name: "Elena Rostova",
    email: "elena.rostova@empresa.com",
    role: "L2",
    area: "Sap",
    specialty: "Soporte Nivel 2 • SAP Business One, Facturación CFDI, Catálogo SKU y Finanzas",
    status: "active",
    phone: "+52 55 2345 6789",
    createdAt: "2026-08-15"
  },
  {
    id: "usr-l3-2",
    name: "Lic. Patricia Morales",
    email: "gerencia.sap@empresa.com",
    role: "L3",
    area: "Sap",
    specialty: "Gerente de Finanzas & Arquitectura SAP • Escalamiento L3 & Auditoría Fiscal",
    status: "active",
    phone: "+52 55 8765 4321",
    createdAt: "2026-06-20"
  },
  {
    id: "usr-l2-3",
    name: "Marcos Toledo",
    email: "marcos.toledo@empresa.com",
    role: "L2",
    area: "Magento",
    specialty: "Soporte Nivel 2 • Magento 2 Commerce, Terminales POS, Checkout y Claves de Acceso",
    status: "active",
    phone: "+52 55 3456 7890",
    createdAt: "2026-08-20"
  },
  {
    id: "usr-l3-3",
    name: "Ing. Gabriel Soto",
    email: "gerencia.magento@empresa.com",
    role: "L3",
    area: "Magento",
    specialty: "Gerente de Ecommerce & Soluciones Magento • Escalamiento L3 & Pasarelas de Pago",
    status: "active",
    phone: "+52 55 7654 3210",
    createdAt: "2026-07-10"
  },
  {
    id: "usr-l2-4",
    name: "Sofía Guzmán",
    email: "sofia.guzman@empresa.com",
    role: "L2",
    area: "Sigo",
    specialty: "Soporte Nivel 2 • Plataforma Sigo, Despachos de Almacén, Guías y Trazabilidad",
    status: "active",
    phone: "+52 55 4567 8901",
    createdAt: "2026-09-01"
  },
  {
    id: "usr-l3-4",
    name: "Ing. Fernando Castro",
    email: "gerencia.sigo@empresa.com",
    role: "L3",
    area: "Sigo",
    specialty: "Gerente de Logística, Rutas & Sigo • Escalamiento L3 & Cadena de Suministro",
    status: "active",
    phone: "+52 55 6543 2109",
    createdAt: "2026-07-15"
  },
  {
    id: "usr-l3-5",
    name: "Dra. Mariana Solís",
    email: "auditoria.l3@empresa.com",
    role: "L3",
    area: "General",
    specialty: "Auditora Global de Calidad & SLA Nivel 3 • Supervisión Cross-Department",
    status: "active",
    phone: "+52 55 5678 9012",
    createdAt: "2026-05-10"
  }
];

export interface OperatorProfile {
  id: string;
  name: string;
  area: OperatorArea;
  roleLabel: string;
  isMaster: boolean;
  managerName: string;
  managerEmail: string;
}

export const OPERATORS: OperatorProfile[] = [
  {
    id: "master",
    name: "Administrador Maestro",
    area: "all",
    roleLabel: "Super Admin (Visión Global & Métricas de Todas las Áreas)",
    isMaster: true,
    managerName: "Dirección General de TI",
    managerEmail: "direccion.ti@empresa.com"
  },
  {
    id: "l2-infra",
    name: "Carlos Mendoza",
    area: "Infraestructura",
    roleLabel: "Especialista L2 • Redes, Windows, Impresoras & Móviles",
    isMaster: false,
    managerName: "Ing. Roberto Valdez (Gerente de Infraestructura)",
    managerEmail: "gerencia.infra@empresa.com"
  },
  {
    id: "l2-sap",
    name: "Elena Rostova",
    area: "Sap",
    roleLabel: "Especialista L2 • SAP ERP, SKU, Facturas & Finanzas",
    isMaster: false,
    managerName: "Lic. Patricia Morales (Gerente de Finanzas & SAP)",
    managerEmail: "gerencia.sap@empresa.com"
  },
  {
    id: "l2-magento",
    name: "Marcos Toledo",
    area: "Magento",
    roleLabel: "Especialista L2 • Magento, POS, Ecommerce & Claves",
    isMaster: false,
    managerName: "Ing. Gabriel Soto (Gerente de Ecommerce & Magento)",
    managerEmail: "gerencia.magento@empresa.com"
  },
  {
    id: "l2-sigo",
    name: "Sofía Guzmán",
    area: "Sigo",
    roleLabel: "Especialista L2 • Sigo, Software Logístico & Despachos",
    isMaster: false,
    managerName: "Ing. Fernando Castro (Gerente de Logística & Sigo)",
    managerEmail: "gerencia.sigo@empresa.com"
  }
];

export function detectDepartment(text: string): "Infraestructura" | "Sap" | "Magento" | "Sigo" {
  const q = text.toLowerCase();
  if (
    q.includes("sap") ||
    q.includes("sku") ||
    q.includes("factura") ||
    q.includes("finanza") ||
    q.includes("pago") ||
    q.includes("asiento") ||
    q.includes("contab") ||
    q.includes("cfdi")
  ) {
    return "Sap";
  }
  if (
    q.includes("magento") ||
    q.includes("pos") ||
    q.includes("ecommerce") ||
    q.includes("tienda") ||
    q.includes("checkout") ||
    q.includes("carrito")
  ) {
    return "Magento";
  }
  if (
    q.includes("sigo") ||
    q.includes("logistica") ||
    q.includes("logística") ||
    q.includes("despacho") ||
    q.includes("ruta") ||
    q.includes("bodega") ||
    q.includes("almacen") ||
    q.includes("almacén") ||
    q.includes("guia") ||
    q.includes("guía")
  ) {
    return "Sigo";
  }
  return "Infraestructura";
}

export default function L1SaaSDashboard() {
  const router = useRouter();

  // RBAC: Los usuarios finales (END_USER) no pueden acceder al panel administrativo
  useEffect(() => {
    const session = getAuthSession();
    if (session?.role === "END_USER") {
      router.replace("/");
    }
  }, [router]);

  // Default to tickets tab as requested: "en el panel izquierdo lo primero que se debe de ver son los chats asignados"
  const [activeTab, setActiveTab] = useState<
    "tickets" | "ticket_registry" | "simulator" | "analytics" | "documents" | "topology" | "ingestion_logs" | "models_cost" | "users"
  >("tickets");

  // Estado de Skeleton Loading para transiciones de sección
  const [isTabLoading, setIsTabLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTabLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, []);

  const handleSwitchTab = (tab: typeof activeTab) => {
    if (tab === activeTab) return;
    setIsTabLoading(true);
    setActiveTab(tab);
    setTimeout(() => {
      setIsTabLoading(false);
    }, 280);
  };

  const [selectedOperator, setSelectedOperator] = useState<OperatorProfile>(OPERATORS[0]);
  const [isOperatorMenuOpen, setIsOperatorMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isTenantMenuOpen, setIsTenantMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const tenantMenuRef = useRef<HTMLDivElement>(null);
  const operatorMenuRef = useRef<HTMLDivElement>(null);
  const [isRoleFilterOpen, setIsRoleFilterOpen] = useState(false);
  const [isAreaFilterOpen, setIsAreaFilterOpen] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const roleFilterRef = useRef<HTMLDivElement>(null);
  const areaFilterRef = useRef<HTMLDivElement>(null);
  const statusFilterRef = useRef<HTMLDivElement>(null);
  const [areaTabFilter, setAreaTabFilter] = useState<OperatorArea>("all");

  // Estados para el módulo dedicado "Registro de Tickets"
  const [registrySearchQuery, setRegistrySearchQuery] = useState("");
  const [registryAreaFilter, setRegistryAreaFilter] = useState<OperatorArea>("all");
  const [registryStatusFilter, setRegistryStatusFilter] = useState<"all" | "escalated" | "escalated_to_l3" | "closed">("all");
  const [registryPriorityFilter, setRegistryPriorityFilter] = useState<"all" | "critical" | "high" | "medium" | "low">("all");
  const [registryDetailTicket, setRegistryDetailTicket] = useState<TicketItem | null>(null);

  // Custom dropdown states for triage selects
  const [isTriageAreaOpen, setIsTriageAreaOpen] = useState(false);
  const [isTriagePriorityOpen, setIsTriagePriorityOpen] = useState(false);
  const triageAreaRef = useRef<HTMLDivElement>(null);
  const triagePriorityRef = useRef<HTMLDivElement>(null);

  // Custom dropdown states for RAG category select
  const [isRagCategoryOpen, setIsRagCategoryOpen] = useState(false);
  const [ragCategory, setRagCategory] = useState("Technical Support");
  const ragCategoryRef = useRef<HTMLDivElement>(null);

  // Custom dropdown states for user form modal
  const [isUserFormAreaOpen, setIsUserFormAreaOpen] = useState(false);
  const [isUserFormStatusOpen, setIsUserFormStatusOpen] = useState(false);
  const userFormAreaDropdownRef = useRef<HTMLDivElement>(null);
  const userFormStatusDropdownRef = useRef<HTMLDivElement>(null);

  const [showL3Modal, setShowL3Modal] = useState(false);
  const [l3Reason, setL3Reason] = useState("");
  const [targetTicketForL3, setTargetTicketForL3] = useState<any | null>(null);
  const [l2ReplyText, setL2ReplyText] = useState("");

  // Control de clic fuera y tecla Escape para todos los menús desplegables
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
      if (tenantMenuRef.current && !tenantMenuRef.current.contains(target)) {
        setIsTenantMenuOpen(false);
      }
      if (operatorMenuRef.current && !operatorMenuRef.current.contains(target)) {
        setIsOperatorMenuOpen(false);
      }
      if (roleFilterRef.current && !roleFilterRef.current.contains(target)) {
        setIsRoleFilterOpen(false);
      }
      if (areaFilterRef.current && !areaFilterRef.current.contains(target)) {
        setIsAreaFilterOpen(false);
      }
      if (statusFilterRef.current && !statusFilterRef.current.contains(target)) {
        setIsStatusFilterOpen(false);
      }
      if (triageAreaRef.current && !triageAreaRef.current.contains(target)) {
        setIsTriageAreaOpen(false);
      }
      if (triagePriorityRef.current && !triagePriorityRef.current.contains(target)) {
        setIsTriagePriorityOpen(false);
      }
      if (ragCategoryRef.current && !ragCategoryRef.current.contains(target)) {
        setIsRagCategoryOpen(false);
      }
      if (userFormAreaDropdownRef.current && !userFormAreaDropdownRef.current.contains(target)) {
        setIsUserFormAreaOpen(false);
      }
      if (userFormStatusDropdownRef.current && !userFormStatusDropdownRef.current.contains(target)) {
        setIsUserFormStatusOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
        setIsTenantMenuOpen(false);
        setIsOperatorMenuOpen(false);
        setIsRoleFilterOpen(false);
        setIsAreaFilterOpen(false);
        setIsStatusFilterOpen(false);
        setIsTriageAreaOpen(false);
        setIsTriagePriorityOpen(false);
        setIsRagCategoryOpen(false);
        setIsUserFormAreaOpen(false);
        setIsUserFormStatusOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // =========================================================================
  // GESTIÓN DE USUARIOS L2 / L3 (ADMIN MASTER EXCLUSIVO)
  // =========================================================================
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(INITIAL_MANAGED_USERS);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "L2" | "L3" | "END_USER">("all");
  const [userAreaFilter, setUserAreaFilter] = useState<string>("all");
  const [userStatusFilter, setUserStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modales de usuario
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<ManagedUser | null>(null);

  // Formulario de usuario
  const [userFormName, setUserFormName] = useState("");
  const [userFormEmail, setUserFormEmail] = useState("");
  const [userFormRole, setUserFormRole] = useState<UserRole>("L2");
  const [userFormArea, setUserFormArea] = useState<UserDepartment>("Infraestructura");
  const [userFormSpecialty, setUserFormSpecialty] = useState("");
  const [userFormPhone, setUserFormPhone] = useState("");
  const [userFormStatus, setUserFormStatus] = useState<"active" | "inactive">("active");
  const [userFormError, setUserFormError] = useState("");
  const [userToast, setUserToast] = useState<{ message: string; type: "success" | "danger" | "info" } | null>(null);

  // Redirección de seguridad: Si no es Admin Master y está en tab de usuarios, expulsar a tickets
  useEffect(() => {
    if (activeTab === "users" && !selectedOperator.isMaster) {
      setActiveTab("tickets");
    }
  }, [activeTab, selectedOperator]);

  const triggerToast = (message: string, type: "success" | "danger" | "info" = "success") => {
    setUserToast({ message, type });
    setTimeout(() => {
      setUserToast((curr) => (curr?.message === message ? null : curr));
    }, 3500);
  };

  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserFormName("");
    setUserFormEmail("");
    setUserFormRole("L2");
    setUserFormArea("Infraestructura");
    setUserFormSpecialty("");
    setUserFormPhone("");
    setUserFormStatus("active");
    setUserFormError("");
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: ManagedUser) => {
    setEditingUser(user);
    setUserFormName(user.name);
    setUserFormEmail(user.email);
    setUserFormRole(user.role);
    setUserFormArea(user.area);
    setUserFormSpecialty(user.specialty);
    setUserFormPhone(user.phone || "");
    setUserFormStatus(user.status);
    setUserFormError("");
    setIsUserModalOpen(true);
  };

  const handleSaveUser = () => {
    if (!userFormName.trim() || userFormName.trim().length < 3) {
      setUserFormError("Por favor ingresa un nombre completo válido (mínimo 3 caracteres).");
      return;
    }
    if (!userFormEmail.trim() || !userFormEmail.includes("@")) {
      setUserFormError("Por favor ingresa una dirección de correo electrónico corporativo válida.");
      return;
    }
    if (!userFormSpecialty.trim()) {
      setUserFormError("Por favor especifica las funciones o especialidad técnica del usuario.");
      return;
    }

    if (editingUser) {
      setManagedUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: userFormName.trim(),
                email: userFormEmail.trim().toLowerCase(),
                role: userFormRole,
                area: userFormArea,
                specialty: userFormSpecialty.trim(),
                phone: userFormPhone.trim() || "N/A",
                status: userFormStatus
              }
            : u
        )
      );
      triggerToast(`Usuario ${userFormName.trim()} actualizado correctamente.`, "success");
    } else {
      const newUser: ManagedUser = {
        id: `usr-${Date.now().toString(36)}`,
        name: userFormName.trim(),
        email: userFormEmail.trim().toLowerCase(),
        role: userFormRole,
        area: userFormArea,
        specialty: userFormSpecialty.trim(),
        phone: userFormPhone.trim() || "N/A",
        status: userFormStatus,
        createdAt: new Date().toISOString().split("T")[0]
      };
      setManagedUsers((prev) => [newUser, ...prev]);
      triggerToast(`Nuevo usuario ${userFormName.trim()} (${userFormRole}) creado con éxito.`, "success");
    }

    setIsUserModalOpen(false);
  };

  const handleConfirmDeleteUser = () => {
    if (!userToDelete) return;
    const name = userToDelete.name;
    setManagedUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    setUserToDelete(null);
    triggerToast(`Usuario ${name} eliminado del sistema.`, "danger");
  };

  const handleToggleUserStatus = (userId: string) => {
    setManagedUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === "active" ? "inactive" : "active";
          triggerToast(
            `Estado de ${u.name} cambiado a ${newStatus === "active" ? "Activo" : "Inactivo"}.`,
            "info"
          );
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  // Initial messages matching the design reference
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-msg",
      sender: "ai",
      content:
        "¡Hola! Soy el Agente L1 Autónomo con RAG y clasificación automática en tiempo real.\n\n¿En qué puedo asistirte hoy con respecto a Infraestructura, SAP, Magento o Sigo?",
      timestamp: "10:00 AM",
      confidence: 1.0,
      resolved_by_ai: true,
      status: "resolved_by_ai"
    },
    {
      id: "user-msg-1",
      sender: "customer",
      content:
        "Tenemos bloqueada la clave de Windows y la impresora de red no imprime en el área de almacén.",
      timestamp: "10:01 AM"
    }
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [showTraceModal, setShowTraceModal] = useState(false);
  const [currentTenant, setCurrentTenant] = useState("Acme Global Enterprise");

  // Live L2 Assigned Chat Workspace State
  const [selectedChatId, setSelectedChatId] = useState<string>("TK-201");
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [chatStatusFilter, setChatStatusFilter] = useState<"all" | "active" | "escalated_to_l3" | "closed">("all");
  const [l2DirectMessage, setL2DirectMessage] = useState("");
  const [isAiTriaging, setIsAiTriaging] = useState(false);
  const [aiTriageNotification, setAiTriageNotification] = useState<string | null>(null);

  // Manual triage temporary edit state
  const [manualArea, setManualArea] = useState<"Infraestructura" | "Sap" | "Magento" | "Sigo">("Infraestructura");
  const [manualPriority, setManualPriority] = useState<"critical" | "high" | "medium" | "low">("critical");
  const [manualCategory, setManualCategory] = useState("Hardware & Redes");
  const [manualStatus, setManualStatus] = useState<"escalated" | "escalated_to_l3" | "closed">("escalated");
  const [manualNotes, setManualNotes] = useState("");

  // Tickets list officially configured for the 4 production areas:
  // Infraestructura, Sap, Magento, Sigo
  const [ticketsList, setTicketsList] = useState<TicketItem[]>([
    {
      id: "TK-201",
      title: "Bloqueo de clave Windows y falla de red en impresora Zebra de almacén",
      requester: "juan.perez@empresa.com",
      requester_name: "Juan Pérez",
      area: "Infraestructura",
      priority: "critical",
      category: "Hardware & Redes",
      sentiment: "frustrated",
      status: "escalated",
      assigned_to: "Carlos Mendoza (L2 Infra)",
      manager_l3: "Ing. Roberto Valdez (Gerente de Infraestructura)",
      manager_email: "gerencia.infra@empresa.com",
      resolved_by_ai: false,
      confidence: 0.42,
      sla_hours_left: 1.5,
      created_at: "Hace 15 min",
      summary:
        "Usuario reporta que su clave de dominio Windows fue bloqueada tras 3 intentos. La impresora Zebra en red local de etiquetas no responde. Requiere desbloqueo Active Directory y reinicio de spooler.",
      internal_notes: "Verificada cuenta en AD: estado LockedOut. Pendiente reset y validación de ping a 192.168.4.15.",
      ai_triage: {
        suggestedArea: "Infraestructura" as const,
        suggestedPriority: "critical" as const,
        suggestedCategory: "Hardware & Redes",
        confidence: 0.94,
        diagnosis: "Bloqueo de clave de red en Active Directory y fallo de conectividad en periférico térmico Zebra."
      },
      dialogue: [
        {
          id: "d-101",
          sender: "customer" as const,
          sender_name: "Juan Pérez",
          text: "No puedo entrar a Windows con mi clave y la impresora térmica no imprime las etiquetas de los pedidos urgentes.",
          time: "10:15 AM"
        },
        {
          id: "d-102",
          sender: "ai" as const,
          sender_name: "IA Soporte L1",
          text: "Caso de Infraestructura clasificado (Confianza 42%). Transferido de inmediato al especialista L2 con briefing técnico: Desbloqueo AD + Spooler Zebra.",
          time: "10:16 AM"
        }
      ]
    },
    {
      id: "TK-202",
      title: "Discrepancia contable en SKU #8812 y rechazo de factura CFDI en SAP",
      requester: "claudia.finanzas@empresa.com",
      requester_name: "Claudia Méndez",
      area: "Sap",
      priority: "high",
      category: "Facturación & Contabilidad",
      sentiment: "urgent",
      status: "escalated",
      assigned_to: "Elena Rostova (L2 Sap)",
      manager_l3: "Lic. Patricia Morales (Gerente de Finanzas & SAP)",
      manager_email: "gerencia.sap@empresa.com",
      resolved_by_ai: false,
      confidence: 0.38,
      sla_hours_left: 2.0,
      created_at: "Hace 35 min",
      summary:
        "Fallo de contabilización en SAP ERP. El SKU 8812 tiene asignada una cuenta de mayor inactiva y bloquea la emisión de 45 facturas fiscales a clientes corporativos.",
      internal_notes: "Verificando tabla BSEG en mandante productivo. Pendiente validación de cuenta de mayor.",
      ai_triage: {
        suggestedArea: "Sap" as const,
        suggestedPriority: "high" as const,
        suggestedCategory: "Facturación & Contabilidad",
        confidence: 0.95,
        diagnosis: "Rechazo de timbrado CFDI por asignación errónea de cuenta de mayor en maestro de materiales SAP."
      },
      dialogue: [
        {
          id: "d-201",
          sender: "customer" as const,
          sender_name: "Claudia Méndez",
          text: "El sistema SAP marca error de SKU inexistente al timbrar facturas de fin de mes.",
          time: "09:50 AM"
        },
        {
          id: "d-202",
          sender: "ai" as const,
          sender_name: "IA Soporte L1",
          text: "Incidencia clasificada en el departamento de SAP & Finanzas. Transferido con briefing técnico a L2.",
          time: "09:51 AM"
        }
      ]
    },
    {
      id: "TK-203",
      title: "Terminal POS de tienda física sin sincronización con Magento Ecommerce",
      requester: "caja.sucursal1@empresa.com",
      requester_name: "Marcos Cárdenas",
      area: "Magento",
      priority: "critical",
      category: "POS & Checkout",
      sentiment: "frustrated",
      status: "escalated",
      assigned_to: "Marcos Toledo (L2 Magento)",
      manager_l3: "Ing. Gabriel Soto (Gerente de Ecommerce & Magento)",
      manager_email: "gerencia.magento@empresa.com",
      resolved_by_ai: false,
      confidence: 0.45,
      sla_hours_left: 1.0,
      created_at: "Hace 40 min",
      summary:
        "El POS de la sucursal norte pierde conexión con la pasarela de Magento. Los carritos y cobros presenciales no actualizan el stock central ni descargan tokens de caja.",
      internal_notes: "API endpoint de sincronización POS respondió HTTP 502 por timeout en cache Redis.",
      ai_triage: {
        suggestedArea: "Magento" as const,
        suggestedPriority: "critical" as const,
        suggestedCategory: "POS & Checkout",
        confidence: 0.96,
        diagnosis: "Desconexión de webhook de pasarela POS con catálogo Magento por error 502 en backend de pagos."
      },
      dialogue: [
        {
          id: "d-301",
          sender: "customer" as const,
          sender_name: "Marcos Cárdenas",
          text: "Se cayó el POS en caja 2, no pasan las tarjetas y no sincroniza inventario con Magento.",
          time: "09:42 AM"
        },
        {
          id: "d-302",
          sender: "ai" as const,
          sender_name: "IA Soporte L1",
          text: "Incidencia clasificada en Magento / POS & Ecommerce. Notificando a especialista L2 asignado.",
          time: "09:43 AM"
        }
      ]
    },
    {
      id: "TK-204",
      title: "Bloqueo de credenciales en software Sigo y detención de rutas de despacho",
      requester: "logistica.norte@empresa.com",
      requester_name: "Rodrigo Salazar",
      area: "Sigo",
      priority: "critical",
      category: "Rutas & Flota Logística",
      sentiment: "urgent",
      status: "escalated",
      assigned_to: "Sofía Guzmán (L2 Sigo)",
      manager_l3: "Ing. Fernando Castro (Gerente de Logística & Sigo)",
      manager_email: "gerencia.sigo@empresa.com",
      resolved_by_ai: false,
      confidence: 0.48,
      sla_hours_left: 0.8,
      created_at: "Hace 10 min",
      summary:
        "Operadores de bodega no pueden ingresar a Sigo. Las órdenes de despacho para los camiones de las 11:00 AM están detenidas sin hojas de ruta generadas.",
      internal_notes: "Sesiones concurrentes en servidor Sigo saturadas (límite 50 alcanzado). Liberando sesiones huérfanas.",
      ai_triage: {
        suggestedArea: "Sigo" as const,
        suggestedPriority: "critical" as const,
        suggestedCategory: "Rutas & Flota Logística",
        confidence: 0.97,
        diagnosis: "Bloqueo masivo de licencias concurrentes en Sigo deteniendo generación de hojas de ruta de despacho."
      },
      dialogue: [
        {
          id: "d-401",
          sender: "customer" as const,
          sender_name: "Rodrigo Salazar",
          text: "Sigo nos sacó a todos y dice 'Licencia / Clave inválida'. Los camiones están parados en bodega.",
          time: "10:20 AM"
        },
        {
          id: "d-402",
          sender: "ai" as const,
          sender_name: "IA Soporte L1",
          text: "Urgencia logística confirmada. Escalando caso prioritario a L2 de Sigo / Operaciones.",
          time: "10:21 AM"
        }
      ]
    },
    {
      id: "TK-205",
      title: "Desbloqueo de BitLocker y configuración de VPN en equipo móvil",
      requester: "ventas.campo@empresa.com",
      requester_name: "Alejandro Mora",
      area: "Infraestructura",
      priority: "medium",
      category: "Hardware & VPN",
      sentiment: "neutral",
      status: "closed",
      assigned_to: "AI L1 Bot",
      manager_l3: "Ing. Roberto Valdez (Gerente de Infraestructura)",
      manager_email: "gerencia.infra@empresa.com",
      resolved_by_ai: true,
      confidence: 0.95,
      sla_hours_left: 24,
      created_at: "Hace 2 horas",
      summary:
        "Guía de autoservicio de recuperación de clave BitLocker provista por el bot L1 con autenticación de doble factor exitosa.",
      dialogue: [
        {
          id: "d-501",
          sender: "customer" as const,
          sender_name: "Alejandro Mora",
          text: "Necesito desbloquear el BitLocker de mi equipo para entrar a una junta con cliente.",
          time: "08:10 AM"
        },
        {
          id: "d-502",
          sender: "ai" as const,
          sender_name: "IA L1",
          text: "Identidad validada con MFA corporativo. Se entregó token BitLocker de 48 dígitos.",
          time: "08:11 AM"
        }
      ]
    },
    {
      id: "TK-206",
      title: "Consulta sobre asiento contable de retenciones en SAP",
      requester: "asistente.contable@empresa.com",
      requester_name: "Mariana Vega",
      area: "Sap",
      priority: "low",
      category: "Consultas & Documentación",
      sentiment: "neutral",
      status: "closed",
      assigned_to: "AI L1 Bot",
      manager_l3: "Lic. Patricia Morales (Gerente de Finanzas & SAP)",
      manager_email: "gerencia.sap@empresa.com",
      resolved_by_ai: true,
      confidence: 0.92,
      sla_hours_left: 24,
      created_at: "Hace 3 horas",
      summary:
        "Explicación de códigos de transacción FB60 y FB70 provista por RAG desde el manual interno de finanzas.",
      dialogue: [
        {
          id: "d-601",
          sender: "customer" as const,
          sender_name: "Mariana Vega",
          text: "¿Dónde consulto los asientos de retención fiscal en SAP ERP?",
          time: "07:30 AM"
        },
        {
          id: "d-602",
          sender: "ai" as const,
          sender_name: "IA L1",
          text: "Consulta resuelta con documentación oficial de transacciones contables.",
          time: "07:31 AM"
        }
      ]
    }
  ]);

  // Analytics Chart Data (Monochrome pure black & white)
  const analyticsData = [
    { day: "Lun", ai: 142, human: 28 },
    { day: "Mar", ai: 189, human: 32 },
    { day: "Mié", ai: 230, human: 41 },
    { day: "Jue", ai: 215, human: 35 },
    { day: "Vie", ai: 278, human: 49 },
    { day: "Sáb", ai: 95, human: 12 },
    { day: "Dom", ai: 84, human: 10 }
  ];

  // Ingestion logs mock
  const ingestionLogs = [
    {
      id: "ING-1092",
      doc: "manual_conectividad_vpn_redes.pdf",
      area: "Infraestructura",
      chunks: 34,
      duration: "1.4s",
      status: "Completado",
      date: "Hace 12 min"
    },
    {
      id: "ING-1091",
      doc: "politica_cfdi_facturacion_sap.md",
      area: "Sap",
      chunks: 12,
      duration: "0.8s",
      status: "Completado",
      date: "Hace 45 min"
    },
    {
      id: "ING-1090",
      doc: "guia_pasarelas_pos_magento.txt",
      area: "Magento",
      chunks: 8,
      duration: "0.5s",
      status: "Completado",
      date: "Hace 2 horas"
    },
    {
      id: "ING-1089",
      doc: "protocolo_despachos_rutas_sigo.md",
      area: "Sigo",
      chunks: 16,
      duration: "1.1s",
      status: "Completado",
      date: "Hace 3 horas"
    }
  ];

  const modelsData = [
    {
      id: "gpt-4o-mini",
      name: "GPT-4o Mini",
      provider: "OpenAI",
      role: "Triage semántico, clasificación de intención y sentimiento",
      node: "TriageNode",
      tokensInput: "6.2M",
      tokensOutput: "2.2M",
      tokensTotal: "8.4M",
      costTotal: 2.18,
      costPercentage: "5.3%",
      requestsCount: "24,150",
      avgLatency: "110 ms",
      costPer1kInput: "$0.00015",
      costPer1kOutput: "$0.00060",
      status: "Activo"
    },
    {
      id: "gpt-4o",
      name: "GPT-4o",
      provider: "OpenAI",
      role: "Auditoría anti-alucinaciones y cálculo de grounding score",
      node: "GuardrailNode",
      tokensInput: "2.4M",
      tokensOutput: "0.7M",
      tokensTotal: "3.1M",
      costTotal: 22.65,
      costPercentage: "55.2%",
      requestsCount: "3,820",
      avgLatency: "480 ms",
      costPer1kInput: "$0.00500",
      costPer1kOutput: "$0.01500",
      status: "Activo"
    },
    {
      id: "claude-3-5-sonnet",
      name: "Claude 3.5 Sonnet",
      provider: "Anthropic",
      role: "Generación de briefing contextual para traspaso a soporte L2",
      node: "EscalationNode",
      tokensInput: "1.5M",
      tokensOutput: "0.3M",
      tokensTotal: "1.8M",
      costTotal: 16.20,
      costPercentage: "39.4%",
      requestsCount: "1,450",
      avgLatency: "620 ms",
      costPer1kInput: "$0.00300",
      costPer1kOutput: "$0.01500",
      status: "Activo"
    },
    {
      id: "text-embedding-3-small",
      name: "Text Embedding 3 Small",
      provider: "OpenAI",
      role: "Vectorización de documentos e indexación HNSW pgvector",
      node: "RAGResolverNode",
      tokensInput: "1.5M",
      tokensOutput: "0",
      tokensTotal: "1.5M",
      costTotal: 0.03,
      costPercentage: "0.1%",
      requestsCount: "9,000",
      avgLatency: "45 ms",
      costPer1kInput: "$0.00002",
      costPer1kOutput: "$0.00000",
      status: "Activo"
    }
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim() || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "customer",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsProcessing(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Tenant-ID": DEMO_TENANT_ID
        },
        body: JSON.stringify({
          message: query,
          requester_email: "demo.client@acme.com",
          requester_name: "Demo Customer"
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
          sentiment: data.sentiment,
          priority: data.priority,
          area_name: data.area_name,
          assigned_agent: data.assigned_agent,
          citations: data.citations,
          trace: data.agent_trace
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error("Backend offline or error");
      }
    } catch {
      // Local fallback simulator with realistic DAG trace
      setTimeout(() => {
        const detectedArea = detectDepartment(query);
        const isEscalation =
          query.toLowerCase().includes("humano") ||
          query.toLowerCase().includes("persona") ||
          query.toLowerCase().includes("urgente") ||
          query.toLowerCase().includes("bloque") ||
          query.toLowerCase().includes("caida") ||
          query.toLowerCase().includes("caída") ||
          query.toLowerCase().includes("error") ||
          query.toLowerCase().includes("falla") ||
          query.toLowerCase().includes("lentitud");

        const specialistMap = {
          Infraestructura: {
            agent: "Carlos Mendoza (L2 Infra)",
            manager: "Ing. Roberto Valdez (Gerente de Infraestructura)",
            email: "gerencia.infra@empresa.com"
          },
          Sap: {
            agent: "Elena Rostova (L2 Sap)",
            manager: "Lic. Patricia Morales (Gerente de Finanzas & SAP)",
            email: "gerencia.sap@empresa.com"
          },
          Magento: {
            agent: "Marcos Toledo (L2 Magento)",
            manager: "Ing. Gabriel Soto (Gerente de Ecommerce & Magento)",
            email: "gerencia.magento@empresa.com"
          },
          Sigo: {
            agent: "Sofía Guzmán (L2 Sigo)",
            manager: "Ing. Fernando Castro (Gerente de Logística & Sigo)",
            email: "gerencia.sigo@empresa.com"
          }
        };

        const targetTeam = specialistMap[detectedArea];

        const simulatedTrace: AgentTraceStep[] = [
          {
            node: "TriageNode",
            action: "Análisis semántico de intención y tipificación por departamento",
            details: {
              sentiment: isEscalation ? "frustrated" : "neutral",
              priority: isEscalation ? "high" : "medium",
              area_detected: detectedArea,
              needs_escalation: isEscalation
            }
          },
          {
            node: "RAGResolverNode",
            action: `Búsqueda vectorial en pgvector para documentación de ${detectedArea}`,
            details: {
              chunks_matched: isEscalation ? 1 : 4,
              tool_invoked: `search_${detectedArea.toLowerCase()}_knowledge`
            }
          },
          {
            node: "GuardrailNode",
            action: "Auditoría de groundedness y validación de confianza (> 0.75)",
            details: {
              confidence_score: isEscalation ? 0.48 : 0.91,
              passed: !isEscalation
            }
          }
        ];

        if (isEscalation) {
          simulatedTrace.push({
            node: "EscalationNode",
            action: `Derivación a especialista L2 de ${detectedArea}`,
            details: {
              assigned_agent: targetTeam.agent,
              area: detectedArea,
              manager_l3_escalation_ready: targetTeam.manager,
              sla_target: "2 horas"
            }
          });

          // Auto add to tickets list
          const newGeneratedTicket = {
            id: `TK-${Math.floor(300 + Math.random() * 600)}`,
            title: query,
            requester: "usuario.corporativo@empresa.com",
            requester_name: "Usuario Corporativo",
            area: detectedArea,
            priority: "high",
            sentiment: "urgent",
            status: "escalated",
            assigned_to: targetTeam.agent,
            manager_l3: targetTeam.manager,
            manager_email: targetTeam.email,
            resolved_by_ai: false,
            confidence: 0.48,
            sla_hours_left: 2.0,
            created_at: "Hace un momento",
            summary: `Incidencia en ${detectedArea}: "${query}". Clasificada por el agente L1 y transferida a ${targetTeam.agent}. Escalamiento a L3 disponible para gerencia si no se subsana en L2.`,
            dialogue: [
              { sender: "Usuario", text: query, time: "Ahora" },
              { sender: "IA L1", text: `Caso clasificado en ${detectedArea}. Derivado a especialista L2 (${targetTeam.agent}).`, time: "Ahora" }
            ]
          };
          setTicketsList((prev) => [newGeneratedTicket, ...prev]);
        }

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: isEscalation ? "l2" : "ai",
          content: isEscalation
            ? `He analizado tu solicitud y la he catalogado en el departamento de **${detectedArea}**.\n\nEspecialista asignado: **${targetTeam.agent}**.\nTu caso está registrado en la cola de Chats Asignados L2. Si el caso presenta bloqueo crítico de negocio, el especialista L2 podrá elevarlo a **${targetTeam.manager} (L3)**.`
            : `Consulta procesada para el área de **${detectedArea}**.\n\nHemos validado los procedimientos estándar en la base de conocimientos:\n- Verifica las credenciales activas del usuario.\n- Revisa el estado de conexión del servicio correspondiente.\n\nSi necesitas asistencia humana especializada, solicita 'escalar con soporte' y te transferiré con el equipo L2 de ${detectedArea}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          confidence: isEscalation ? 0.48 : 0.92,
          resolved_by_ai: !isEscalation,
          status: isEscalation ? "escalated" : "closed",
          sentiment: isEscalation ? "frustrated" : "positive",
          priority: isEscalation ? "high" : "low",
          area_name: detectedArea,
          assigned_agent: isEscalation ? targetTeam.agent : undefined,
          citations: isEscalation
            ? []
            : [
                {
                  document_name: `manual_operativo_${detectedArea.toLowerCase()}.pdf`,
                  chunk_index: 2,
                  relevance_score: 0.93,
                  excerpt: `Procedimientos oficiales y guías de soporte para incidencias en ${detectedArea}.`
                }
              ],
          trace: simulatedTrace
        };

        setMessages((prev) => [...prev, aiMsg]);
        setIsProcessing(false);
      }, 700);
      return;
    }

    setIsProcessing(false);
  };

  return (
    <div
      className={`h-screen w-screen flex flex-col bg-black text-white font-sans select-none overflow-hidden transition-all duration-500 ease-out ${
        !isPageMounted
          ? "opacity-0 scale-[0.99] blur-[3px]"
          : isSystemExiting
          ? "opacity-0 scale-[0.985] blur-sm pointer-events-none"
          : "opacity-100 scale-100 blur-0"
      }`}
    >
      {/* ========================================================================= */}
      {/* TOP NAVIGATION BAR */}
      {/* ========================================================================= */}
      <header className="h-14 flex-shrink-0 bg-neutral-950 border-b border-neutral-800 px-4 flex items-center justify-between z-30">
        {/* Left: Logo & Multi-Tenant Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shadow-sm font-mono text-xs font-bold">
            <span>[=]</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-white tracking-tight">SupportL1 AI</span>
          </div>

          {/* Tenant Selector Dropdown */}
          <div className="relative ml-4" ref={tenantMenuRef}>
            <button
              onClick={() => {
                setIsTenantMenuOpen(!isTenantMenuOpen);
                setIsOperatorMenuOpen(false);
                setIsProfileMenuOpen(false);
              }}
              aria-expanded={isTenantMenuOpen}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:border-neutral-700 hover:text-white transition cursor-pointer select-none"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="text-neutral-500 font-medium">Tenant:</span>
              <span className="text-white font-medium">{currentTenant}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${
                  isTenantMenuOpen ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            <div
              className={`absolute left-0 mt-2 w-64 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-1.5 z-50 transform transition-all duration-200 ease-out origin-top ${
                isTenantMenuOpen
                  ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
              }`}
            >
              <div className="px-2.5 py-1 text-[10px] uppercase font-semibold text-neutral-500 tracking-wider font-mono">
                Inquilinos Multi-Tenant
              </div>
              {[
                { name: "Acme Global Enterprise", badge: "RLS ACTIVO" },
                { name: "Globex FinTech S.A.", badge: "AISLADO" },
                { name: "Initech Cloud Ops", badge: "AISLADO" }
              ].map((tenant) => (
                <button
                  key={tenant.name}
                  onClick={() => {
                    setCurrentTenant(tenant.name);
                    setIsTenantMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                    currentTenant === tenant.name
                      ? "bg-neutral-900 text-white border border-neutral-800 font-medium"
                      : "text-neutral-400 hover:bg-neutral-900/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {currentTenant === tenant.name ? (
                      <Check className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <span className="w-3.5 h-3.5" />
                    )}
                    <span>{tenant.name}</span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">{tenant.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Operator / Role Selector (L2 Area vs Maestro) */}
          <div className="relative ml-2" ref={operatorMenuRef}>
            <button
              onClick={() => {
                setIsOperatorMenuOpen(!isOperatorMenuOpen);
                setIsTenantMenuOpen(false);
                setIsProfileMenuOpen(false);
              }}
              aria-expanded={isOperatorMenuOpen}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-300 hover:border-neutral-700 hover:text-white transition cursor-pointer select-none"
              title="Cambiar operador L2 o rol Super Admin Maestro"
            >
              <div className="flex items-center gap-1.5">
                {selectedOperator.isMaster ? (
                  <Crown className="w-3.5 h-3.5 text-white" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-neutral-400" />
                )}
                <span className="text-neutral-500 font-medium">Operador:</span>
                <span className="text-white font-medium">{selectedOperator.name}</span>
              </div>
              <span className="text-[10px] font-mono font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded">
                {selectedOperator.area === "all" ? "MAESTRO" : selectedOperator.area.toUpperCase()}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${
                  isOperatorMenuOpen ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            <div
              className={`absolute left-0 mt-2 w-80 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-1.5 z-50 transform transition-all duration-200 ease-out origin-top ${
                isOperatorMenuOpen
                  ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
              }`}
            >
              <div className="px-2.5 py-1 text-[10px] uppercase font-semibold text-neutral-500 tracking-wider font-mono">
                Seleccionar Operador / Área L2
              </div>
              {OPERATORS.map((op) => (
                <button
                  key={op.id}
                  onClick={() => {
                    setSelectedOperator(op);
                    if (!op.isMaster) {
                      setAreaTabFilter(op.area);
                    }
                    setIsOperatorMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                    selectedOperator.id === op.id
                      ? "bg-neutral-900 text-white border border-neutral-800"
                      : "text-neutral-300 hover:bg-neutral-900/60 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedOperator.id === op.id ? (
                      <Check className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <span className="w-3.5 h-3.5" />
                    )}
                    <div>
                      <div className="font-semibold flex items-center gap-1.5 text-white">
                        {op.isMaster ? (
                          <Crown className="w-3 h-3 text-white" />
                        ) : (
                          <Building2 className="w-3 h-3 text-neutral-400" />
                        )}
                        <span>{op.name}</span>
                        {op.isMaster && (
                          <span className="text-[10px] text-neutral-400 font-mono">
                            GLOBAL
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-500">{op.roleLabel}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-300 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded">
                    {op.area === "all" ? "Todas" : op.area}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Latency, User Avatar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-neutral-300 font-mono bg-neutral-900 border border-neutral-800 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span>38ms</span>
          </div>

          {/* Menú de Perfil de Usuario con Despliegue Suave */}
          <div className="relative" ref={profileMenuRef}>
            <button
              id="admin-profile-menu-trigger"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="true"
              className="relative w-8 h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-white text-xs font-semibold flex items-center justify-center transition focus:outline-none focus:ring-1 focus:ring-neutral-700 cursor-pointer select-none"
              title={`Perfil: ${selectedOperator.name}`}
            >
              <span>
                {selectedOperator.isMaster
                  ? "AG"
                  : selectedOperator.name
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")
                      .toUpperCase()}
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-white border border-neutral-950" />
            </button>

            {/* Panel de Opciones con Animación Suave de Arriba hacia Abajo */}
            <div
              className={`absolute right-0 mt-2 w-72 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-2 z-50 transform transition-all duration-200 ease-out origin-top ${
                isProfileMenuOpen
                  ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
              }`}
            >
              {/* Encabezado del Perfil */}
              <div className="p-2 border-b border-neutral-800/80 mb-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 text-white text-xs font-semibold flex items-center justify-center font-mono flex-shrink-0">
                    {selectedOperator.isMaster
                      ? "AG"
                      : selectedOperator.name
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((p) => p[0])
                          .join("")
                          .toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-white truncate">
                      {selectedOperator.name}
                    </div>
                    <div className="text-[11px] text-neutral-400 truncate">
                      {selectedOperator.isMaster ? "admin.master@empresa.com" : selectedOperator.managerEmail}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 text-[10px] font-mono text-neutral-300 bg-neutral-900 border border-neutral-800 rounded">
                    {selectedOperator.isMaster ? "SUPER ADMIN" : `AGENTE L2 • ${selectedOperator.area.toUpperCase()}`}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    ID: {selectedOperator.id}
                  </span>
                </div>
              </div>

              {/* Opciones del Menú */}
              <div className="space-y-0.5 py-1">
                <Link
                  href="/profile"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-neutral-900 transition text-left cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-neutral-400" />
                  <div className="flex-1">
                    <div className="font-medium">Mi Perfil</div>
                    <div className="text-[10px] text-neutral-500">Datos y credenciales del operador</div>
                  </div>
                </Link>

                <Link
                  href="/security"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-neutral-900 transition text-left cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5 text-neutral-400" />
                  <div className="flex-1">
                    <div className="font-medium">Seguridad y Políticas RLS</div>
                    <div className="text-[10px] text-neutral-500">Aislamiento por tenant activo</div>
                  </div>
                </Link>

                <Link
                  href="/preferences"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-neutral-900 transition text-left cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5 text-neutral-400" />
                  <div className="flex-1">
                    <div className="font-medium">Preferencias de Consola</div>
                    <div className="text-[10px] text-neutral-500">Tema monocromático de alta fidelidad</div>
                  </div>
                </Link>
              </div>

              {/* Separador sutil */}
              <div className="border-t border-neutral-800/80 my-1" />

              {/* Opción de Cerrar Sesión (Logout) */}
              <button
                type="button"
                id="admin-logout-button"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setShowLogoutModal(true);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-800 transition text-left cursor-pointer group"
              >
                <LogOut className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition" />
                <div className="flex-1">
                  <div className="font-medium text-white">Cerrar Sesión</div>
                  <div className="text-[10px] text-neutral-500">Finalizar turno y bloquear acceso</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* WORKSPACE BODY: SIDEBAR + CONTENT AREA */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden bg-black">
        {/* ========================================================================= */}
        {/* LEFT SIDEBAR (PLATAFORMA & ORQUESTACIÓN) */}
        {/* ========================================================================= */}
        <aside className="w-60 flex-shrink-0 flex flex-col justify-between border-r border-neutral-800 bg-black p-3 text-xs">
          <div className="space-y-6">
            {/* PLATAFORMA */}
            <div>
              <div className="text-[10px] font-semibold text-neutral-500 tracking-wider uppercase mb-2 px-2.5">
                Plataforma
              </div>
              <nav className="space-y-1">
                {/* 1. CHATS ASIGNADOS L2 - PRIMER LUGAR */}
                <button
                  onClick={() => handleSwitchTab("tickets")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                    activeTab === "tickets"
                      ? "bg-neutral-900 text-white border border-neutral-700 shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Headphones className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Chats Asignados (L2)</span>
                  </div>
                  <span className="text-[11px] font-mono text-amber-400 font-semibold">
                    {
                      ticketsList.filter((t) =>
                        selectedOperator.isMaster
                          ? t.status !== "closed"
                          : t.area.toLowerCase() === selectedOperator.area.toLowerCase() && t.status !== "closed"
                      ).length
                    }
                  </span>
                </button>

                {/* 2. SIMULADOR MULTI-AGENTE */}
                <button
                  onClick={() => handleSwitchTab("simulator")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    activeTab === "simulator"
                      ? "bg-neutral-900 text-white border border-neutral-700 shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-neutral-300" />
                  <span>Simulador Multi-Agente</span>
                </button>

                {/* 3. ANALÍTICA OPERATIVA */}
                <button
                  onClick={() => handleSwitchTab("analytics")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    activeTab === "analytics"
                      ? "bg-neutral-900 text-white border border-neutral-700 shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Analítica Operativa</span>
                </button>

                {/* 4. REGISTRO DE TICKETS */}
                <button
                  onClick={() => handleSwitchTab("ticket_registry")}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                    activeTab === "ticket_registry"
                      ? "bg-neutral-900 text-white border border-neutral-700 shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Ticket className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Registro de Tickets</span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400 font-semibold">
                    {ticketsList.length}
                  </span>
                </button>

                {/* 4. RAG & DOCUMENTOS */}
                <button
                  onClick={() => handleSwitchTab("documents")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    activeTab === "documents"
                      ? "bg-neutral-900 text-white border border-neutral-700 shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-neutral-400" />
                  <span>RAG & Documentos</span>
                </button>

                {/* 5. GESTIÓN DE USUARIOS (L2 / L3) - EXCLUSIVO ADMIN MASTER */}
                {selectedOperator.isMaster && (
                  <button
                    onClick={() => handleSwitchTab("users")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
                      activeTab === "users"
                        ? "bg-neutral-900 text-white border border-neutral-700 shadow-sm"
                        : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Usuarios L2 / L3</span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 font-medium flex items-center gap-1">
                      <Crown className="w-2.5 h-2.5 text-neutral-400" />
                      MASTER
                    </span>
                  </button>
                )}
              </nav>
            </div>

            {/* ORQUESTACIÓN */}
            <div>
              <div className="text-[10px] font-semibold text-neutral-500 tracking-wider uppercase mb-2 px-2.5">
                Orquestación
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => handleSwitchTab("topology")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    activeTab === "topology"
                      ? "bg-neutral-900 text-white border border-neutral-700 shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                  }`}
                >
                  <GitBranch className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Topología LangGraph</span>
                </button>

                <button
                  onClick={() => handleSwitchTab("ingestion_logs")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    activeTab === "ingestion_logs"
                      ? "bg-neutral-900 text-white border border-neutral-700 shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                  }`}
                >
                  <ScrollText className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Registros de Ingesta</span>
                </button>

                <button
                  onClick={() => handleSwitchTab("models_cost")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                    activeTab === "models_cost"
                      ? "bg-neutral-900 text-white border border-neutral-700 shadow-sm"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Modelos & Costos LLM</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Cluster Status Footer Card */}
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400 text-[11px]">Cluster Estado</span>
              <span className="flex items-center gap-1.5 text-neutral-300 font-medium text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span>Online</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-neutral-500 text-[11px] font-mono">
              <span>Región:</span>
              <span className="text-neutral-300">us-east-1</span>
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* MAIN PANEL */}
        {/* ========================================================================= */}
        <main className="flex-1 flex overflow-hidden bg-black">
          {isTabLoading ? (
            <SectionSkeleton tab={activeTab} />
          ) : (
            <>
              {/* ======================================================================= */}
              {/* VIEW: SIMULADOR MULTI-AGENTE (2-COLUMN REFERENCE LAYOUT) */}
              {/* ======================================================================= */}
              {activeTab === "simulator" && (
            <div className="flex-1 flex overflow-hidden">
              {/* CENTER COLUMN: CANAL DE CHAT L1 */}
              <div className="flex-1 flex flex-col border-r border-neutral-800 bg-black overflow-hidden">
                {/* Chat Column Header */}
                <div className="h-14 flex-shrink-0 px-5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        Canal de Chat L1 <span className="text-neutral-400 font-normal">(End-User Interface)</span>
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        Atención contextual e inteligente impulsada por Grafos Autónomos
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-300 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>LangGraph DAG Activo</span>
                  </div>
                </div>

                {/* Chat Messages Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex flex-col ${
                        m.sender === "customer" ? "items-end" : "items-start"
                      }`}
                    >
                      {/* Meta header above message */}
                      <div className="flex items-center gap-2 mb-1.5 text-[11px] text-neutral-400">
                        <span>
                          {m.sender === "customer"
                            ? "Usuario (Admin)"
                            : m.sender === "ai"
                            ? "IA Soporte L1"
                            : "Escalado L2"}
                        </span>
                        <span>•</span>
                        <span>{m.timestamp}</span>
                        {m.confidence !== undefined && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-neutral-900 text-neutral-300 border border-neutral-800">
                            Conf: {(m.confidence * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                          m.sender === "customer"
                            ? "bg-neutral-900 text-white"
                            : m.sender === "ai"
                            ? "bg-neutral-950 text-neutral-200"
                            : "bg-neutral-900 text-neutral-200"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{m.content}</div>

                        {/* Citations if available */}
                        {m.citations && m.citations.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-neutral-800">
                            <div className="text-[10px] font-medium text-neutral-400 flex items-center gap-1 mb-1.5">
                              <Sparkles className="w-3 h-3 text-white" /> Fuentes consultadas (pgvector):
                            </div>
                            <div className="space-y-1">
                              {m.citations.map((c, idx) => (
                                <div
                                  key={idx}
                                  className="text-[11px] bg-neutral-900 p-2 rounded-lg border border-neutral-800 text-neutral-300 flex items-center justify-between"
                                >
                                  <span className="font-mono text-neutral-200 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-neutral-400" />
                                    <span>{c.document_name}</span>
                                  </span>
                                  <span className="text-[10px] text-emerald-400 font-mono">
                                    Match: {(c.relevance_score * 100).toFixed(1)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Processing indicator */}
                  {isProcessing && (
                    <div className="flex items-center gap-2 text-xs text-neutral-400 pt-1">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span>DAG evaluando: RAG pgvector + Guardrails...</span>
                    </div>
                  )}
                </div>

                {/* Chat Quick Action Chips & Input Footer */}
                <div className="border-t border-neutral-800 bg-neutral-950 p-3 space-y-2.5">
                  {/* Prompt Chips */}
                  <div className="flex items-center gap-2 overflow-x-auto text-[11px]">
                    <button
                      onClick={() =>
                        handleSendMessage(
                          "Tenemos lentitud al conectar con la instancia de base de datos dedicada en la región us-east-1."
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition whitespace-nowrap"
                    >
                      # Pregunta Técnica L1 (RAG)
                    </button>
                    <button
                      onClick={() =>
                        handleSendMessage(
                          "¡La base de datos se cayó y necesito escalamiento humano urgente a L2 ahora!"
                        )
                      }
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition whitespace-nowrap"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      <span>Escalamiento Urgente a L2</span>
                    </button>
                    <button
                      onClick={() =>
                        handleSendMessage(
                          "¿Dónde puedo descargar las facturas con desglose de impuestos de este periodo?"
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition whitespace-nowrap"
                    >
                      $ Facturación & Cobros
                    </button>
                  </div>

                  {/* Input bar */}
                  <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 focus-within:border-neutral-700 transition">
                    <button
                      className="text-neutral-500 hover:text-neutral-300 p-1"
                      title="Adjuntar archivo"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Escribe tu consulta de soporte L1..."
                      className="flex-1 bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={isProcessing || !inputQuery.trim()}
                      className="px-3.5 py-1.5 bg-white hover:bg-neutral-200 text-black rounded-lg text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 transition"
                    >
                      <span>Enviar</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ===================================================================== */}
              {/* RIGHT COLUMN: OBSERVABILIDAD DEL DAG (LANGGRAPH RUNTIME) */}
              {/* ===================================================================== */}
              <div className="w-[450px] flex-shrink-0 flex flex-col bg-black overflow-hidden">
                {/* Column Header */}
                <div className="h-14 flex-shrink-0 px-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Observabilidad del DAG</div>
                      <div className="text-[11px] text-neutral-500">
                        Ejecución secuencial de nodos de decisión & RAG
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>LangGraph Runtime</span>
                  </div>
                </div>

                {/* Sequential DAG Flow Cards */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {/* CARD 1: Triage & Clasificación */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-neutral-900 text-neutral-300 flex items-center justify-center font-bold text-[10px]">
                          1
                        </span>
                        <div>
                          <div className="font-semibold text-white text-xs">Triage & Clasificación</div>
                          <div className="text-[10px] text-neutral-500 font-mono">
                            Input: prompt_sentiment + intent_detector
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-300 font-mono">
                        gpt-4o-mini
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Evalúa sentimiento (positivo/neutral/frustrado), severidad, área departamental y decide si requiere
                      escalación humana inmediata.
                    </p>

                    <div className="pt-2 flex items-center justify-between text-[10px] text-neutral-400">
                      <span>Clasificado: <span className="text-neutral-200 font-medium">Soporte Técnico</span></span>
                      <span className="font-mono text-neutral-500">112ms</span>
                    </div>
                  </div>

                  {/* CARD 2: RAG Engine & Tool Calling */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-neutral-900 text-neutral-300 flex items-center justify-center font-bold text-[10px]">
                          2
                        </span>
                        <div>
                          <div className="font-semibold text-white text-xs">RAG Engine & Tool Calling</div>
                          <div className="text-[10px] text-neutral-500 font-mono">
                            Similarity search + Cosine TopK=4
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-300 font-mono">
                        pgvector (HNSW)
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Busca chunks vectoriales aislados por <code className="text-neutral-200 bg-neutral-900 px-1 rounded">tenant_id</code> y{" "}
                      <code className="text-neutral-200 bg-neutral-900 px-1 rounded">area_id</code> con cosine similarity. Ejecuta webhooks de validación.
                    </p>

                    <div className="pt-2 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                      <span>Index: <span className="text-neutral-300">hnsw_cosine_v3</span></span>
                      <span>Match: <span className="text-white">0.92 cosine</span></span>
                    </div>
                  </div>

                  {/* CARD 3: Guardrails & Grounding */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-neutral-900 text-neutral-300 flex items-center justify-center font-bold text-[10px]">
                          3
                        </span>
                        <div>
                          <div className="font-semibold text-white text-xs">Guardrails & Grounding</div>
                          <div className="text-[10px] text-neutral-500 font-mono">
                            Anti-Hallucination & Policy Auditor
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-300 font-mono">
                        Threshold &gt; 0.75
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Audita la respuesta frente a alucinaciones. Si la confianza es alta, resuelve el ticket automáticamente en L1.
                    </p>

                    <div className="pt-2 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                      <span>Grounding Score: <span className="text-white">0.89</span></span>
                      <span>Auto-resolve: <span className="text-neutral-200">On</span></span>
                    </div>
                  </div>

                  {/* CARD 4: Escalamiento Humano L2 */}
                  <div className="p-3.5 rounded-xl bg-neutral-950 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-neutral-900 text-neutral-300 flex items-center justify-center font-bold text-[10px]">
                          4
                        </span>
                        <div>
                          <div className="font-semibold text-white text-xs">Escalamiento Humano L2</div>
                          <div className="text-[10px] text-neutral-500 font-mono">
                            Human-in-the-Loop Fallback
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-900 text-neutral-300 font-mono">
                        agent_areas N:M
                      </span>
                    </div>

                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Si la confianza es baja o el cliente está frustrado, asigna al especialista L2 adecuado y genera el briefing de traspaso.
                    </p>

                    <div className="pt-2 flex items-center justify-between text-[10px] text-neutral-400">
                      <span>Standby / Asignación</span>
                      <span className="font-mono text-neutral-400">Cola: Nivel 2</span>
                    </div>
                  </div>
                </div>

                {/* Column Footer */}
                <div className="h-12 flex-shrink-0 px-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-[11px]">
                  <div className="text-neutral-400">
                    DAG: <span className="text-white font-medium">Optimizado</span> • Nodos: 4 Activos
                  </div>
                  <button
                    onClick={() => setShowTraceModal(true)}
                    className="text-neutral-300 hover:text-white flex items-center gap-1 font-medium transition"
                  >
                    <span>Ver JSON Trace</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* VIEW: ANALÍTICA OPERATIVA (MONOCHROME B&W) + DEPARTMENT OVERVIEW + TICKET TABLE */}
          {/* ======================================================================= */}
          {activeTab === "analytics" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span>Tasa Auto-Resolución L1</span>
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">78.4%</div>
                  <div className="text-[11px] text-neutral-300 flex items-center gap-1 mt-1">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +4.2% vs semana previa
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span>Tasa Escalamiento L2</span>
                    <Headphones className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">21.6%</div>
                  <div className="text-[11px] text-neutral-500 mt-1">Derivados por complejidad o SLA</div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span>Confianza Guardrail</span>
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">0.91</div>
                  <div className="text-[11px] text-neutral-400 mt-1">Groundedness estricto verificado</div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span>Cumplimiento SLA</span>
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">97.8%</div>
                  <div className="text-[11px] text-neutral-500 mt-1">Tiempo de primera respuesta &lt; 3s</div>
                </div>
              </div>

              {/* 4 Production Departments Overview Cards */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Departamentos en Producción</h3>
                  <span className="text-[11px] text-neutral-500 font-mono">Total: {ticketsList.length} casos registrados</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sky-400">Infraestructura</span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        L2: Carlos M.
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-tight">
                      Internet, claves de Windows, desbloqueos, impresoras, móviles y hardware.
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                      <span>Gerente L3: Ing. R. Valdez</span>
                      <span className="text-white font-medium">
                        {ticketsList.filter((t) => t.area === "Infraestructura" && t.status !== "closed").length}{" "}
                        activos
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-indigo-400">SAP</span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        L2: Elena R.
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-tight">
                      SKU, facturación CFDI, compras, finanzas y contabilidad empresarial.
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                      <span>Gerente L3: Lic. P. Morales</span>
                      <span className="text-white font-medium">
                        {ticketsList.filter((t) => t.area === "Sap" && t.status !== "closed").length} activos
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-orange-400">Magento</span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        L2: Marcos T.
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-tight">
                      Puntos de venta (POS), ecommerce, pasarelas de pago, tienda y claves.
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                      <span>Gerente L3: Ing. G. Soto</span>
                      <span className="text-white font-medium">
                        {ticketsList.filter((t) => t.area === "Magento" && t.status !== "closed").length} activos
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-400">Sigo</span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        L2: Sofía G.
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-tight">
                      Software principal de logística, despachos, bodegas, rutas y claves.
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                      <span>Gerente L3: Ing. F. Castro</span>
                      <span className="text-white font-medium">
                        {ticketsList.filter((t) => t.area === "Sigo" && t.status !== "closed").length} activos
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart & Breakdowns */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 p-5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-sm text-white">Volumen de Tickets (Semanal)</h3>
                      <p className="text-xs text-neutral-500">Resueltos por IA vs Escalados a Nivel 2</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <span className="flex items-center gap-1.5 text-white">
                        <span className="w-2.5 h-2.5 rounded-full bg-white" /> IA L1
                      </span>
                      <span className="flex items-center gap-1.5 text-neutral-400">
                        <span className="w-2.5 h-2.5 rounded-full bg-neutral-500" /> L2 Humano
                      </span>
                    </div>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData}>
                        <defs>
                          <linearGradient id="aiGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ffffff" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="humanGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#737373" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#737373" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                        <XAxis dataKey="day" stroke="#737373" fontSize={11} />
                        <YAxis stroke="#737373" fontSize={11} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#171717",
                            borderColor: "#262626",
                            borderRadius: "0.5rem",
                            fontSize: "12px",
                            color: "#ffffff"
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="ai"
                          stroke="#ffffff"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#aiGrad)"
                          name="Resueltos por IA"
                        />
                        <Area
                          type="monotone"
                          dataKey="human"
                          stroke="#737373"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#humanGrad)"
                          name="Escalados a L2"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-4">
                  <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800">
                    <h3 className="font-semibold text-xs text-white mb-3 uppercase tracking-wider">
                      Sentimiento del Cliente
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-neutral-300 font-medium">Positivo</span>
                          <span className="text-neutral-400 font-mono">58%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                          <div className="h-full bg-white rounded-full" style={{ width: "58%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-neutral-300 font-medium">Neutral</span>
                          <span className="text-neutral-400 font-mono">31%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                          <div className="h-full bg-neutral-400 rounded-full" style={{ width: "31%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-neutral-300 font-medium">Frustrado</span>
                          <span className="text-neutral-400 font-mono">11%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                          <div className="h-full bg-neutral-600 rounded-full" style={{ width: "11%" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800">
                    <h3 className="font-semibold text-xs text-white mb-3 uppercase tracking-wider">
                      Distribución por Departamentos
                    </h3>
                    <div className="space-y-2 text-xs">
                      {(["Infraestructura", "Sap", "Magento", "Sigo"] as const).map((area) => {
                        const total = ticketsList.length;
                        const areaCount = ticketsList.filter((t) => t.area === area).length;
                        const pct = total > 0 ? Math.round((areaCount / total) * 100) : 0;
                        const textColor =
                          area === "Infraestructura"
                            ? "text-sky-400"
                            : area === "Sap"
                            ? "text-indigo-400"
                            : area === "Magento"
                            ? "text-orange-400"
                            : "text-emerald-400";
                        return (
                          <div key={area} className="flex items-center justify-between p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                            <span className={`font-medium ${textColor}`}>{area}</span>
                            <span className="font-mono text-white font-medium">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* VIEW: REGISTRO DE TICKETS (MÓDULO DEDICADO - TODOS LOS DEPARTAMENTOS) */}
          {/* ======================================================================= */}
          {activeTab === "ticket_registry" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black">
              {/* Header del Módulo */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                      Plataforma / Auditoría
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-white" />
                    <span>Registro de Tickets</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Historial consolidado, estados operativos y trazabilidad de incidencias en todos los departamentos.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>Total: {ticketsList.length} incidencias</span>
                  </div>
                </div>
              </div>

              {/* Stat Cards Monocromáticas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span>Total Registrados</span>
                    <Ticket className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="text-2xl font-bold text-white font-mono">{ticketsList.length}</div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    En 4 departamentos activos
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span>En Atención (L2)</span>
                    <Zap className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="text-2xl font-bold text-white font-mono">
                    {ticketsList.filter((t) => t.status === "escalated").length}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    Atención directa por especialistas
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span>Escalados a L3</span>
                    <AlertOctagon className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="text-2xl font-bold text-white font-mono">
                    {ticketsList.filter((t) => t.status === "escalated_to_l3").length}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    Supervisión gerencial requerida
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span>Resueltos</span>
                    <CheckCircle2 className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="text-2xl font-bold text-white font-mono">
                    {ticketsList.filter((t) => t.status === "closed").length}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-1">
                    Ciclo de atención completado
                  </div>
                </div>
              </div>

              {/* Filtros y Búsqueda */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
                  {/* Búsqueda */}
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por ID, asunto, solicitante, categoría o responsable..."
                      value={registrySearchQuery}
                      onChange={(e) => setRegistrySearchQuery(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                    />
                    {registrySearchQuery && (
                      <button
                        onClick={() => setRegistrySearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Filtro por Estado */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-neutral-500 font-mono">Estado:</span>
                    <select
                      value={registryStatusFilter}
                      onChange={(e) => setRegistryStatusFilter(e.target.value as any)}
                      aria-label="Filtrar por estado del ticket"
                      className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-neutral-700 font-mono"
                    >
                      <option value="all">Todos</option>
                      <option value="escalated">L2 Activo</option>
                      <option value="escalated_to_l3">L3 Gerencia</option>
                      <option value="closed">Resuelto</option>
                    </select>
                  </div>

                  {/* Filtro por Prioridad */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-neutral-500 font-mono">Prioridad:</span>
                    <select
                      value={registryPriorityFilter}
                      onChange={(e) => setRegistryPriorityFilter(e.target.value as any)}
                      aria-label="Filtrar por prioridad del ticket"
                      className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-neutral-700 font-mono"
                    >
                      <option value="all">Todas</option>
                      <option value="critical">Crítica</option>
                      <option value="high">Alta</option>
                      <option value="medium">Media</option>
                      <option value="low">Baja</option>
                    </select>
                  </div>
                </div>

                {/* Filtro por Departamentos con pestañas */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-neutral-900 overflow-x-auto text-xs">
                  <span className="text-[11px] text-neutral-500 font-mono mr-1">Área:</span>
                  {(["all", "Infraestructura", "Sap", "Magento", "Sigo"] as OperatorArea[]).map((area) => {
                    const count = ticketsList.filter((t) =>
                      area === "all" ? true : t.area.toLowerCase() === area.toLowerCase()
                    ).length;
                    return (
                      <button
                        key={area}
                        onClick={() => setRegistryAreaFilter(area)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                          registryAreaFilter === area
                            ? "bg-neutral-800 text-white shadow-sm border border-neutral-700"
                            : "text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent"
                        }`}
                      >
                        <span>{area === "all" ? "Todas las Áreas" : area}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300">
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tabla de Registros de Tickets */}
              {(() => {
                const filteredTickets = ticketsList.filter((t) => {
                  const matchArea =
                    registryAreaFilter === "all"
                      ? true
                      : t.area.toLowerCase() === registryAreaFilter.toLowerCase();
                  const matchStatus =
                    registryStatusFilter === "all" ? true : t.status === registryStatusFilter;
                  const matchPriority =
                    registryPriorityFilter === "all" ? true : t.priority === registryPriorityFilter;
                  const q = registrySearchQuery.trim().toLowerCase();
                  const matchSearch =
                    q === ""
                      ? true
                      : t.id.toLowerCase().includes(q) ||
                        t.title.toLowerCase().includes(q) ||
                        t.requester.toLowerCase().includes(q) ||
                        (t.requester_name && t.requester_name.toLowerCase().includes(q)) ||
                        (t.category && t.category.toLowerCase().includes(q)) ||
                        t.assigned_to.toLowerCase().includes(q) ||
                        t.area.toLowerCase().includes(q);
                  return matchArea && matchStatus && matchPriority && matchSearch;
                });

                return (
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
                    <div className="p-3 border-b border-neutral-800 bg-neutral-900/60 flex items-center justify-between text-xs">
                      <span className="font-semibold text-white uppercase tracking-wider text-[11px]">
                        Listado de Registros
                      </span>
                      <span className="font-mono text-neutral-400 text-[11px]">
                        Mostrando {filteredTickets.length} de {ticketsList.length} tickets
                      </span>
                    </div>

                    {filteredTickets.length === 0 ? (
                      <div className="p-12 text-center space-y-2">
                        <Ticket className="w-8 h-8 text-neutral-600 mx-auto" />
                        <div className="text-sm font-medium text-neutral-300">
                          No se encontraron registros con los filtros aplicados
                        </div>
                        <p className="text-xs text-neutral-500">
                          Prueba ajustando los criterios de búsqueda o seleccionando otra área.
                        </p>
                        <button
                          onClick={() => {
                            setRegistrySearchQuery("");
                            setRegistryAreaFilter("all");
                            setRegistryStatusFilter("all");
                            setRegistryPriorityFilter("all");
                          }}
                          className="mt-3 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 transition"
                        >
                          Limpiar todos los filtros
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800 font-medium">
                            <tr>
                              <th className="px-4 py-3 font-mono">ID</th>
                              <th className="px-4 py-3">Asunto / Solicitante</th>
                              <th className="px-4 py-3">Departamento</th>
                              <th className="px-4 py-3">Categoría</th>
                              <th className="px-4 py-3">Prioridad</th>
                              <th className="px-4 py-3">Estado</th>
                              <th className="px-4 py-3">Responsable</th>
                              <th className="px-4 py-3 font-mono">SLA</th>
                              <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-800 text-neutral-300">
                            {filteredTickets.map((t) => (
                              <tr
                                key={t.id}
                                onClick={() => setRegistryDetailTicket(t)}
                                className="hover:bg-neutral-900/60 transition cursor-pointer"
                              >
                                <td className="px-4 py-3 font-mono text-neutral-300 font-semibold whitespace-nowrap">
                                  {t.id}
                                </td>
                                <td className="px-4 py-3 max-w-xs">
                                  <div className="font-medium text-white truncate">{t.title}</div>
                                  <div className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                                    <span>{t.requester_name || t.requester}</span>
                                    {t.created_at && (
                                      <>
                                        <span>•</span>
                                        <span>{t.created_at}</span>
                                      </>
                                    )}
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                                    {t.area}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="text-[11px] text-neutral-400">{t.category || "—"}</span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 uppercase">
                                    {t.priority}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  {t.status === "escalated_to_l3" ? (
                                    <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5 w-max px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                                      <AlertOctagon className="w-3.5 h-3.5 text-neutral-400" />
                                      <span>L3 Gerencia</span>
                                    </span>
                                  ) : t.status === "closed" ? (
                                    <span className="text-xs font-medium text-neutral-300 flex items-center gap-1.5 w-max px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />
                                      <span>Resuelto</span>
                                    </span>
                                  ) : (
                                    <span className="text-xs font-medium text-neutral-300 flex items-center gap-1.5 w-max px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800">
                                      <Zap className="w-3.5 h-3.5 text-neutral-400" />
                                      <span>L2 Activo</span>
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-white font-medium text-[11px] whitespace-nowrap">
                                  {t.assigned_to}
                                </td>
                                <td className="px-4 py-3 font-mono text-[11px] text-neutral-400 whitespace-nowrap">
                                  {t.sla_hours_left}h
                                </td>
                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={() => setRegistryDetailTicket(t)}
                                      className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-[11px] text-neutral-300 hover:text-white transition"
                                      title="Ver detalle del ticket"
                                    >
                                      Detalle
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedChatId(t.id);
                                        handleSwitchTab("tickets");
                                      }}
                                      className="px-2.5 py-1 rounded bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-[11px] text-white transition flex items-center gap-1"
                                      title="Abrir en espacio de chat L2"
                                    >
                                      <span>Atender</span>
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Modal de Detalle de Ticket */}
              {registryDetailTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
                  <div
                    className="w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-white">
                            {registryDetailTicket.id}
                          </span>
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                            {registryDetailTicket.area}
                          </span>
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 uppercase">
                            Prioridad: {registryDetailTicket.priority}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-white">
                          {registryDetailTicket.title}
                        </h3>
                      </div>
                      <button
                        onClick={() => setRegistryDetailTicket(null)}
                        className="p-1 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-900 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Metadatos */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                        <div className="text-[10px] text-neutral-500 font-mono">Solicitante</div>
                        <div className="font-medium text-white truncate mt-0.5">
                          {registryDetailTicket.requester_name || registryDetailTicket.requester}
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate">
                          {registryDetailTicket.requester}
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                        <div className="text-[10px] text-neutral-500 font-mono">Responsable L2</div>
                        <div className="font-medium text-white truncate mt-0.5">
                          {registryDetailTicket.assigned_to}
                        </div>
                        <div className="text-[10px] text-neutral-400">Especialista L2</div>
                      </div>

                      <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                        <div className="text-[10px] text-neutral-500 font-mono">Gerente L3</div>
                        <div className="font-medium text-white truncate mt-0.5">
                          {registryDetailTicket.manager_l3}
                        </div>
                        <div className="text-[10px] text-neutral-400 truncate">
                          {registryDetailTicket.manager_email}
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                        <div className="text-[10px] text-neutral-500 font-mono">SLA Restante</div>
                        <div className="font-mono text-white text-sm font-semibold mt-0.5">
                          {registryDetailTicket.sla_hours_left} horas
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {registryDetailTicket.status === "closed" ? "Completado" : "En curso"}
                        </div>
                      </div>
                    </div>

                    {/* Resumen y Diagnóstico IA */}
                    <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Bot className="w-3.5 h-3.5 text-neutral-300" />
                          <span>Diagnóstico y Resumen Técnico</span>
                        </span>
                        {registryDetailTicket.confidence && (
                          <span className="font-mono text-[10px] text-neutral-400">
                            Confianza IA: {Math.round(registryDetailTicket.confidence * 100)}%
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-300 leading-relaxed">
                        {registryDetailTicket.summary || "Sin resumen registrado."}
                      </p>
                      {registryDetailTicket.internal_notes && (
                        <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 font-mono">
                          <span className="text-neutral-500">Notas internas: </span>
                          {registryDetailTicket.internal_notes}
                        </div>
                      )}
                    </div>

                    {/* Diálogo registrado */}
                    {registryDetailTicket.dialogue && registryDetailTicket.dialogue.length > 0 && (
                      <div className="space-y-2 text-xs">
                        <div className="text-[11px] font-semibold text-white uppercase tracking-wider">
                          Transcripción de Conversación
                        </div>
                        <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3 max-h-48 overflow-y-auto">
                          {registryDetailTicket.dialogue.map((d, idx) => (
                            <div key={d.id || idx} className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500">
                                <span className="font-semibold text-neutral-300">
                                  {d.sender_name || (d.sender === "customer" ? "Solicitante" : d.sender === "ai" ? "IA L1" : "Operador L2")}
                                </span>
                                <span>{d.time}</span>
                              </div>
                              <p className="text-neutral-300 text-xs bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80">
                                {d.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Botones del Modal */}
                    <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                      <button
                        onClick={() => setRegistryDetailTicket(null)}
                        className="px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 hover:text-white transition"
                      >
                        Cerrar
                      </button>

                      <button
                        onClick={() => {
                          const ticketId = registryDetailTicket.id;
                          setRegistryDetailTicket(null);
                          setSelectedChatId(ticketId);
                          handleSwitchTab("tickets");
                        }}
                        className="px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-700 hover:border-neutral-500 text-xs text-white font-medium transition flex items-center gap-1.5"
                      >
                        <span>Atender en Chats Asignados</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================================= */}
          {/* VIEW: CHATS ASIGNADOS — LIVE L2 CHAT WORKSPACE */}
          {/* ======================================================================= */}
          {activeTab === "tickets" && (() => {
            // Filter tickets visible to this operator
            const visibleTickets = ticketsList.filter((t) => {
              const matchArea = selectedOperator.isMaster
                ? true
                : t.area.toLowerCase() === selectedOperator.area.toLowerCase();
              const matchStatus =
                chatStatusFilter === "all"
                  ? true
                  : chatStatusFilter === "active"
                  ? t.status === "escalated"
                  : t.status === chatStatusFilter;
              const matchSearch =
                chatSearchQuery.trim() === ""
                  ? true
                  : t.title.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
                    t.requester.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
                    t.id.toLowerCase().includes(chatSearchQuery.toLowerCase());
              return matchArea && matchStatus && matchSearch;
            });

            const activeChat = ticketsList.find((t) => t.id === selectedChatId) || visibleTickets[0];

            return (
              <div className="flex-1 flex overflow-hidden">
                {/* LEFT: Chat History Sidebar */}
                <div className="w-80 flex-shrink-0 flex flex-col border-r border-neutral-800 bg-black overflow-hidden">
                  {/* Sidebar Header */}
                  <div className="p-3 border-b border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-white">Chats Asignados</h3>
                      <span className="px-1.5 py-0.5 text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300 rounded">
                        {visibleTickets.length}
                      </span>
                    </div>
                    {/* Search */}
                    <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5">
                      <Search className="w-3.5 h-3.5 text-neutral-500" />
                      <input
                        type="text"
                        value={chatSearchQuery}
                        onChange={(e) => setChatSearchQuery(e.target.value)}
                        placeholder="Buscar ticket, email..."
                        className="flex-1 bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
                      />
                    </div>
                    {/* Status Filters */}
                    <div className="flex items-center gap-1 text-[10px]">
                      {([
                        { key: "all", label: "Todos" },
                        { key: "active", label: "Activos" },
                        { key: "escalated_to_l3", label: "L3" },
                        { key: "closed", label: "Cerrados" }
                      ] as const).map((f) => (
                        <button
                          key={f.key}
                          onClick={() => setChatStatusFilter(f.key)}
                          className={`px-2 py-1 rounded-md font-medium transition ${
                            chatStatusFilter === f.key
                              ? "bg-neutral-800 text-white"
                              : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900"
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chat List */}
                  <div className="flex-1 overflow-y-auto">
                    {visibleTickets.map((t) => {
                      const isActive = activeChat?.id === t.id;
                      const lastMsg = t.dialogue?.[t.dialogue.length - 1];
                      return (
                        <button
                          key={t.id}
                          onClick={() => { setSelectedChatId(t.id); setAiTriageNotification(null); }}
                          className={`w-full text-left px-3 py-3 border-b border-neutral-900 transition ${
                            isActive
                              ? "bg-neutral-900"
                              : "hover:bg-neutral-950"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                                t.status === "closed" ? "bg-neutral-900 text-neutral-500" : "bg-neutral-800 text-white"
                              }`}>
                                {(t.requester_name || "U")[0]}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-medium text-white truncate">{t.requester_name || t.requester}</span>
                                  {t.status !== "closed" && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-white flex-shrink-0" />
                                  )}
                                </div>
                                <div className="text-[10px] text-neutral-500 truncate">{t.title}</div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              <span className="text-[9px] text-neutral-500 font-mono">{t.created_at}</span>
                              <div className="flex items-center gap-1">
                                <span className={`text-[10px] font-mono font-medium ${
                                  t.area === "Infraestructura"
                                    ? "text-sky-400"
                                    : t.area === "Sap"
                                    ? "text-indigo-400"
                                    : t.area === "Magento"
                                    ? "text-orange-400"
                                    : "text-emerald-400"
                                }`}>
                                  {t.area}
                                </span>
                                {t.status === "escalated_to_l3" && (
                                  <span className="text-[9px] font-mono font-semibold text-rose-400 flex items-center gap-0.5">
                                    <AlertOctagon className="w-2.5 h-2.5 text-rose-400" />
                                    <span>L3</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          {lastMsg && (
                            <p className="text-[10px] text-neutral-500 mt-1 truncate pl-9">
                              {lastMsg.sender_name || lastMsg.sender}: {lastMsg.text}
                            </p>
                          )}
                        </button>
                      );
                    })}
                    {visibleTickets.length === 0 && (
                      <div className="p-6 text-center text-xs text-neutral-500">
                        No hay chats que coincidan con el filtro.
                      </div>
                    )}
                  </div>
                </div>

                {/* CENTER: Live Chat Conversation */}
                {activeChat ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Chat Header */}
                    <div className="h-14 flex-shrink-0 px-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-white font-bold text-xs">
                          {(activeChat.requester_name || "U")[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">{activeChat.requester_name || activeChat.requester}</span>
                            <span className="px-1.5 py-0.5 text-[9px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300 rounded">
                              {activeChat.id}
                            </span>
                            <span className={`text-[11px] font-mono font-medium ${
                              activeChat.area === "Infraestructura"
                                ? "text-sky-400"
                                : activeChat.area === "Sap"
                                ? "text-indigo-400"
                                : activeChat.area === "Magento"
                                ? "text-orange-400"
                                : "text-emerald-400"
                            }`}>
                              {activeChat.area}
                            </span>
                          </div>
                          <div className="text-[11px] text-neutral-500">{activeChat.requester} • {activeChat.created_at}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {activeChat.status !== "closed" && activeChat.status !== "escalated_to_l3" && (
                          <button
                            onClick={() => {
                              setTargetTicketForL3(activeChat);
                              setShowL3Modal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-rose-400 text-[10px] font-medium flex items-center gap-1 transition"
                          >
                            <AlertOctagon className="w-3 h-3 text-rose-400" />
                            <span>Escalar L3</span>
                          </button>
                        )}
                        {activeChat.status !== "closed" && (
                          <button
                            onClick={() => {
                              setTicketsList((prev) =>
                                prev.map((t) => (t.id === activeChat.id ? { ...t, status: "closed" } : t))
                              );
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-neutral-200 text-black text-[10px] font-semibold flex items-center gap-1.5 transition"
                          >
                            <CheckCircle2 className="w-3 h-3 text-black" />
                            <span>Resolver & Cerrar</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Messages Feed */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {/* AI Summary Card */}
                      <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-1.5">
                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 uppercase font-semibold tracking-wider">
                          <Bot className="w-3 h-3 text-white" />
                          <span>Resumen del Agente L1</span>
                        </div>
                        <p className="text-neutral-300 leading-relaxed">{activeChat.summary}</p>
                        <div className="flex items-center gap-3 text-[10px] text-neutral-500 font-mono pt-1">
                          <span>Confianza: {((activeChat.confidence || 0) * 100).toFixed(0)}%</span>
                          <span>Prioridad: {activeChat.priority}</span>
                          <span>SLA: {activeChat.sla_hours_left}h</span>
                        </div>
                      </div>

                      {/* Notification banner */}
                      {aiTriageNotification && activeChat.id === selectedChatId && (
                        <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-[11px] text-neutral-300 flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-white flex-shrink-0" />
                          <span>{aiTriageNotification}</span>
                          <button onClick={() => setAiTriageNotification(null)} className="ml-auto text-neutral-500 hover:text-white">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {/* Chat Messages */}
                      {(activeChat.dialogue || []).map((msg: any) => {
                        const isCustomer = msg.sender === "customer";
                        const isL2 = msg.sender === "l2";
                        return (
                          <div key={msg.id || msg.time} className={`flex flex-col ${isCustomer ? "items-start" : "items-end"}`}>
                            <div className="flex items-center gap-1.5 mb-1 text-[10px] text-neutral-500">
                              {isCustomer ? (
                                <User className="w-3 h-3 text-neutral-400" />
                              ) : isL2 ? (
                                <Headphones className="w-3 h-3 text-white" />
                              ) : (
                                <Bot className="w-3 h-3 text-neutral-400" />
                              )}
                              <span className="font-medium text-neutral-300">{msg.sender_name || msg.sender}</span>
                              <span>•</span>
                              <span>{msg.time}</span>
                            </div>
                            <div
                              className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                                isCustomer
                                  ? "bg-neutral-900 text-white"
                                  : isL2
                                  ? "bg-neutral-800 text-white"
                                  : "bg-neutral-950 text-neutral-300"
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* L2 Direct Reply Input */}
                    {activeChat.status !== "closed" && (
                      <div className="border-t border-neutral-800 bg-neutral-950 p-3">
                        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-1.5 focus-within:border-neutral-700 transition">
                          <Paperclip className="w-4 h-4 text-neutral-500" />
                          <input
                            type="text"
                            value={l2DirectMessage}
                            onChange={(e) => setL2DirectMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && l2DirectMessage.trim()) {
                                const newMsg = {
                                  id: `l2-${Date.now()}`,
                                  sender: "l2" as const,
                                  sender_name: selectedOperator.name,
                                  text: l2DirectMessage,
                                  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                };
                                setTicketsList((prev) =>
                                  prev.map((t) =>
                                    t.id === activeChat.id
                                      ? { ...t, dialogue: [...(t.dialogue || []), newMsg] }
                                      : t
                                  )
                                );
                                setL2DirectMessage("");
                              }
                            }}
                            placeholder={`Responder como ${selectedOperator.name} (L2)...`}
                            className="flex-1 bg-transparent text-xs text-white placeholder-neutral-500 focus:outline-none"
                          />
                          <button
                            onClick={() => {
                              if (!l2DirectMessage.trim()) return;
                              const newMsg = {
                                id: `l2-${Date.now()}`,
                                sender: "l2" as const,
                                sender_name: selectedOperator.name,
                                text: l2DirectMessage,
                                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              };
                              setTicketsList((prev) =>
                                prev.map((t) =>
                                  t.id === activeChat.id
                                    ? { ...t, dialogue: [...(t.dialogue || []), newMsg] }
                                    : t
                                )
                              );
                              setL2DirectMessage("");
                            }}
                            className="px-3 py-1.5 bg-white hover:bg-neutral-200 text-black rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <Send className="w-3 h-3" />
                            <span>Enviar</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-neutral-500 text-xs">
                    Selecciona un chat de la lista para comenzar.
                  </div>
                )}

                {/* RIGHT: Tipificación & Triage Panel */}
                {activeChat && (
                  <div className="w-80 flex-shrink-0 flex flex-col border-l border-neutral-800 bg-black overflow-y-auto">
                    {/* Panel Header */}
                    <div className="p-3 border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-neutral-400" />
                        <h3 className="text-xs font-semibold text-white">Tipificación & Triage</h3>
                      </div>
                      <p className="text-[10px] text-neutral-500 mt-0.5">Clasificación manual o automática por IA</p>
                    </div>

                    <div className="p-3 space-y-4 text-xs">
                      {/* AI Triage Suggestion */}
                      {(activeChat as any).ai_triage && (
                        <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 uppercase font-semibold tracking-wider">
                              <Sparkles className="w-3 h-3 text-white" />
                              <span>Sugerencia IA</span>
                            </div>
                            <span className="text-[10px] font-mono text-neutral-400">
                              Conf: {(((activeChat as any).ai_triage.confidence || 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="space-y-1.5 text-[11px]">
                            <div className="flex justify-between">
                              <span className="text-neutral-500">Área:</span>
                              <span className="text-white font-medium">{(activeChat as any).ai_triage.suggestedArea}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-500">Prioridad:</span>
                              <span className="text-white font-medium">{(activeChat as any).ai_triage.suggestedPriority}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-500">Categoría:</span>
                              <span className="text-white font-medium">{(activeChat as any).ai_triage.suggestedCategory}</span>
                            </div>
                            <p className="text-neutral-400 text-[10px] pt-1 border-t border-neutral-800">
                              {(activeChat as any).ai_triage.diagnosis}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              const triage = (activeChat as any).ai_triage;
                              setTicketsList((prev) =>
                                prev.map((t) =>
                                  t.id === activeChat.id
                                    ? {
                                        ...t,
                                        area: triage.suggestedArea,
                                        priority: triage.suggestedPriority,
                                        category: triage.suggestedCategory
                                      }
                                    : t
                                )
                              );
                              setAiTriageNotification(`Tipificación IA aplicada: ${triage.suggestedArea} / ${triage.suggestedCategory} / ${triage.suggestedPriority}`);
                            }}
                            className="w-full px-3 py-1.5 rounded-lg bg-white text-black text-[11px] font-semibold hover:bg-neutral-200 transition flex items-center justify-center gap-1.5"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Aplicar Tipificación IA</span>
                          </button>
                        </div>
                      )}

                      {/* Manual Triage Form */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 uppercase font-semibold tracking-wider">
                          <Sliders className="w-3 h-3 text-neutral-500" />
                          <span>Tipificación Manual</span>
                        </div>

                        {/* Area */}
                        <div className="relative" ref={triageAreaRef}>
                          <label className="block text-[10px] text-neutral-500 mb-1">Departamento</label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsTriageAreaOpen(!isTriageAreaOpen);
                              setIsTriagePriorityOpen(false);
                            }}
                            aria-expanded={isTriageAreaOpen}
                            className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white rounded-lg px-2.5 py-1.5 text-xs flex items-center justify-between transition cursor-pointer select-none"
                          >
                            <span>{activeChat.area}</span>
                            <ChevronDown
                              className={`w-3 h-3 text-neutral-500 transition-transform duration-200 ${
                                isTriageAreaOpen ? "rotate-180 text-white" : ""
                              }`}
                            />
                          </button>
                          <div
                            className={`absolute left-0 mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-1 z-40 transform transition-all duration-200 ease-out origin-top ${
                              isTriageAreaOpen
                                ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                                : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
                            }`}
                          >
                            {[
                              { val: "Infraestructura", label: "Infraestructura" },
                              { val: "Sap", label: "SAP" },
                              { val: "Magento", label: "Magento" },
                              { val: "Sigo", label: "Sigo" }
                            ].map((item) => (
                              <button
                                key={item.val}
                                type="button"
                                onClick={() => {
                                  setTicketsList((prev) =>
                                    prev.map((t) => (t.id === activeChat.id ? { ...t, area: item.val } : t))
                                  );
                                  setIsTriageAreaOpen(false);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                                  activeChat.area === item.val
                                    ? "bg-neutral-900 text-white font-medium"
                                    : "text-neutral-400 hover:bg-neutral-900/60 hover:text-white"
                                }`}
                              >
                                <span>{item.label}</span>
                                {activeChat.area === item.val && <Check className="w-3 h-3 text-white" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Priority */}
                        <div className="relative" ref={triagePriorityRef}>
                          <label className="block text-[10px] text-neutral-500 mb-1">Prioridad</label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsTriagePriorityOpen(!isTriagePriorityOpen);
                              setIsTriageAreaOpen(false);
                            }}
                            aria-expanded={isTriagePriorityOpen}
                            className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white rounded-lg px-2.5 py-1.5 text-xs flex items-center justify-between transition cursor-pointer select-none"
                          >
                            <span>
                              {activeChat.priority === "critical" ? "Crítica"
                                : activeChat.priority === "high" ? "Alta"
                                : activeChat.priority === "medium" ? "Media"
                                : "Baja"}
                            </span>
                            <ChevronDown
                              className={`w-3 h-3 text-neutral-500 transition-transform duration-200 ${
                                isTriagePriorityOpen ? "rotate-180 text-white" : ""
                              }`}
                            />
                          </button>
                          <div
                            className={`absolute left-0 mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-1 z-40 transform transition-all duration-200 ease-out origin-top ${
                              isTriagePriorityOpen
                                ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                                : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
                            }`}
                          >
                            {[
                              { val: "critical", label: "Crítica" },
                              { val: "high", label: "Alta" },
                              { val: "medium", label: "Media" },
                              { val: "low", label: "Baja" }
                            ].map((item) => (
                              <button
                                key={item.val}
                                type="button"
                                onClick={() => {
                                  setTicketsList((prev) =>
                                    prev.map((t) => (t.id === activeChat.id ? { ...t, priority: item.val } : t))
                                  );
                                  setIsTriagePriorityOpen(false);
                                }}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                                  activeChat.priority === item.val
                                    ? "bg-neutral-900 text-white font-medium"
                                    : "text-neutral-400 hover:bg-neutral-900/60 hover:text-white"
                                }`}
                              >
                                <span>{item.label}</span>
                                {activeChat.priority === item.val && <Check className="w-3 h-3 text-white" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block text-[10px] text-neutral-500 mb-1">Categoría</label>
                          <input
                            type="text"
                            value={activeChat.category || ""}
                            onChange={(e) => {
                              const newCat = e.target.value;
                              setTicketsList((prev) =>
                                prev.map((t) => (t.id === activeChat.id ? { ...t, category: newCat } : t))
                              );
                            }}
                            placeholder="Ej: Hardware & Redes"
                            className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg px-2.5 py-1.5 text-xs placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                          />
                        </div>

                        {/* Internal Notes */}
                        <div>
                          <label className="block text-[10px] text-neutral-500 mb-1">Notas Internas (L2)</label>
                          <textarea
                            rows={3}
                            value={(activeChat as any).internal_notes || ""}
                            onChange={(e) => {
                              const newNotes = e.target.value;
                              setTicketsList((prev) =>
                                prev.map((t) => (t.id === activeChat.id ? { ...t, internal_notes: newNotes } : t))
                              );
                            }}
                            placeholder="Agregar notas internas para el equipo..."
                            className="w-full bg-neutral-900 border border-neutral-800 text-white rounded-lg p-2.5 text-xs placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                          />
                        </div>
                      </div>

                      {/* Ticket Metadata */}
                      <div className="space-y-2 pt-2 border-t border-neutral-800">
                        <div className="text-[10px] text-neutral-500 uppercase font-semibold tracking-wider">Detalles del Caso</div>
                        <div className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Ticket:</span>
                            <span className="text-white font-mono">{activeChat.id}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-500">Estado:</span>
                            {activeChat.status === "escalated" ? (
                              <span className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-amber-400" />
                                <span>L2 Activo</span>
                              </span>
                            ) : activeChat.status === "escalated_to_l3" ? (
                              <span className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                                <AlertOctagon className="w-3 h-3 text-rose-400" />
                                <span>L3 Gerencia</span>
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Cerrado</span>
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Asignado a:</span>
                            <span className="text-white text-right">{activeChat.assigned_to}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">Gerente L3:</span>
                            <span className="text-neutral-300 text-right text-[10px]">{activeChat.manager_l3}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-500">SLA Restante:</span>
                            <span className="text-white font-mono">{activeChat.sla_hours_left}h</span>
                          </div>
                        </div>
                      </div>

                      {/* Re-run AI Triage Button */}
                      <button
                        disabled={isAiTriaging}
                        onClick={() => {
                          setIsAiTriaging(true);
                          setTimeout(() => {
                            const detectedArea = detectDepartment(activeChat.title + " " + activeChat.summary);
                            const categoryMap: Record<string, string> = {
                              Infraestructura: "Hardware & Redes",
                              Sap: "Facturación & Contabilidad",
                              Magento: "POS & Checkout",
                              Sigo: "Rutas & Flota Logística"
                            };
                            setTicketsList((prev) =>
                              prev.map((t) =>
                                t.id === activeChat.id
                                  ? {
                                      ...t,
                                      ai_triage: {
                                        suggestedArea: detectedArea,
                                        suggestedPriority: t.priority as any,
                                        suggestedCategory: categoryMap[detectedArea] || "General",
                                        confidence: 0.92 + Math.random() * 0.07,
                                        diagnosis: `Re-análisis: Clasificado como ${detectedArea} con categoría ${categoryMap[detectedArea] || "General"} basado en contenido actualizado.`
                                      }
                                    }
                                  : t
                              )
                            );
                            setIsAiTriaging(false);
                            setAiTriageNotification("Triage IA re-ejecutado. Revisa la nueva sugerencia.");
                          }, 800);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white text-[11px] font-medium flex items-center justify-center gap-1.5 transition disabled:opacity-40"
                      >
                        <RefreshCw className={`w-3 h-3 ${isAiTriaging ? "animate-spin" : ""}`} />
                        <span>{isAiTriaging ? "Analizando..." : "Re-ejecutar Triage IA"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ======================================================================= */}
          {/* VIEW: RAG & DOCUMENTOS */}
          {/* ======================================================================= */}
          {activeTab === "documents" && (
            <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-6 bg-black">
              <div className="p-6 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">Pipeline de Ingestión RAG (pgvector)</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Chunking jerárquico estructurado con breadcrumbs y generación de embeddings (1536 dim)
                  </p>
                </div>

                <div className="border border-dashed border-neutral-700 hover:border-neutral-500 rounded-xl p-8 flex flex-col items-center justify-center bg-black text-center cursor-pointer transition">
                  <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-semibold text-white">Arrastra tus archivos de documentación aquí</div>
                  <div className="text-[11px] text-neutral-500 mb-4">Soporta PDF, Markdown (.md) y Texto (.txt)</div>
                  <div className="flex items-center gap-2">
                    <div className="relative" ref={ragCategoryRef}>
                      <button
                        type="button"
                        onClick={() => setIsRagCategoryOpen(!isRagCategoryOpen)}
                        aria-expanded={isRagCategoryOpen}
                        className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 rounded-lg px-2.5 py-1.5 flex items-center gap-2 transition cursor-pointer select-none"
                      >
                        <span className="text-white">{ragCategory}</span>
                        <ChevronDown
                          className={`w-3 h-3 text-neutral-500 transition-transform duration-200 ${
                            isRagCategoryOpen ? "rotate-180 text-white" : ""
                          }`}
                        />
                      </button>
                      <div
                        className={`absolute left-0 mt-1.5 w-56 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-1 z-40 transform transition-all duration-200 ease-out origin-top ${
                          isRagCategoryOpen
                            ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                            : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
                        }`}
                      >
                        {[
                          { val: "Technical Support", label: "Technical Support" },
                          { val: "Billing & Subscriptions", label: "Billing & Subscriptions" },
                          { val: "Security & Compliance", label: "Security & Compliance" }
                        ].map((item) => (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => {
                              setRagCategory(item.val);
                              setIsRagCategoryOpen(false);
                            }}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                              ragCategory === item.val
                                ? "bg-neutral-900 text-white font-medium"
                                : "text-neutral-400 hover:bg-neutral-900/60 hover:text-white"
                            }`}
                          >
                            <span>{item.label}</span>
                            {ragCategory === item.val && <Check className="w-3 h-3 text-white" />}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button className="px-3.5 py-1.5 bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-lg transition">
                      Examinar
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Documentos Indexados en este Tenant</span>
                  <span className="text-neutral-500 font-mono">HNSW Cosine Index</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">guia_desarrolladores_api_v1.pdf</div>
                      <div className="text-[11px] text-neutral-500">Área: Technical Support • 34 chunks</div>
                    </div>
                    <span className="text-[10px] font-mono text-white">1536 dim • Listo</span>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">politica_facturacion_reembolsos.md</div>
                      <div className="text-[11px] text-neutral-500">Área: Billing & Subscriptions • 12 chunks</div>
                    </div>
                    <span className="text-[10px] font-mono text-white">1536 dim • Listo</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* VIEW: TOPOLOGÍA LANGGRAPH */}
          {/* ======================================================================= */}
          {activeTab === "topology" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black">
              <div>
                <h2 className="text-sm font-semibold text-white">Topología del Grafo Dirigido (DAG)</h2>
                <p className="text-xs text-neutral-500">
                  Estructura de decisión y fallback con LangGraph y puntos de corte (Guardrails)
                </p>
              </div>

              <div className="p-8 rounded-xl bg-neutral-950 border border-neutral-800 flex flex-col items-center">
                <div className="max-w-xl w-full space-y-4">
                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 text-center">
                    <span className="text-xs font-mono text-neutral-400 block mb-1">Punto de Entrada</span>
                    <span className="text-sm font-semibold text-white">Client Chat Request + X-Tenant-ID</span>
                  </div>

                  <div className="flex justify-center text-neutral-600">↓</div>

                  <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700 text-center">
                    <div className="text-xs font-semibold text-white">Nodo 1: TriageNode</div>
                    <p className="text-xs text-neutral-400 mt-1">
                      Clasificación de intención, cálculo de sentimiento y detección de urgencia
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center">
                      <span className="text-[11px] text-neutral-500 mb-1">Caso Normal</span>
                      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700 w-full text-center">
                        <div className="text-xs font-semibold text-white">Nodo 2: RAGResolverNode</div>
                        <p className="text-[11px] text-neutral-400 mt-1">Vector search en pgvector + tools</p>
                      </div>
                      <span className="text-neutral-600 my-2">↓</span>
                      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700 w-full text-center">
                        <div className="text-xs font-semibold text-white">Nodo 3: GuardrailNode</div>
                        <p className="text-[11px] text-neutral-400 mt-1">Auditoría anti-alucinación (&gt; 0.75)</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <span className="text-[11px] text-neutral-400 mb-1">Escalamiento / Baja Confianza</span>
                      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700 w-full text-center h-full flex flex-col justify-center">
                        <div className="text-xs font-semibold text-white">Nodo 4: EscalationNode</div>
                        <p className="text-[11px] text-neutral-400 mt-1">
                          Asignación a especialista L2 según agent_areas y SLA deadline
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* VIEW: REGISTROS DE INGESTA */}
          {/* ======================================================================= */}
          {activeTab === "ingestion_logs" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black">
              <div>
                <h2 className="text-sm font-semibold text-white">Registros de Tareas Asíncronas (Celery Worker)</h2>
                <p className="text-xs text-neutral-500">Historial de tareas de sanitización, chunking y vectorización</p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-900 text-neutral-400 border-b border-neutral-800 font-medium">
                    <tr>
                      <th className="px-4 py-3">Task ID</th>
                      <th className="px-4 py-3">Documento</th>
                      <th className="px-4 py-3">Área</th>
                      <th className="px-4 py-3">Chunks Generados</th>
                      <th className="px-4 py-3">Duración</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3 text-right">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800 text-neutral-300">
                    {ingestionLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-900 transition">
                        <td className="px-4 py-3 font-mono text-neutral-400">{log.id}</td>
                        <td className="px-4 py-3 font-medium text-white">{log.doc}</td>
                        <td className="px-4 py-3">
                          <span className={`font-mono text-xs font-medium ${
                            log.area === "Infraestructura"
                              ? "text-sky-400"
                              : log.area === "Sap"
                              ? "text-indigo-400"
                              : log.area === "Magento"
                              ? "text-orange-400"
                              : log.area === "Sigo"
                              ? "text-emerald-400"
                              : "text-neutral-400"
                          }`}>
                            {log.area}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono">{log.chunks}</td>
                        <td className="px-4 py-3 font-mono text-neutral-400">{log.duration}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{log.status}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-neutral-500">{log.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* VIEW: MODELOS & COSTOS LLM */}
          {/* ======================================================================= */}
          {activeTab === "models_cost" && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white">Modelos LLM & Desglose de Gastos</h2>
                  <p className="text-xs text-neutral-500">
                    Monitoreo en tiempo real de consumo de tokens, gastos acumulados y latencia por modelo en el grafo
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-[11px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300 rounded-lg">
                    Período: Mes en curso (Septiembre)
                  </span>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <span className="text-[11px] text-neutral-500">Gasto Total Acumulado</span>
                  <div className="text-2xl font-bold tracking-tight text-white">$41.06 <span className="text-xs text-neutral-400 font-normal">USD</span></div>
                  <div className="text-[10px] text-neutral-400">Presupuesto: $100.00 (41.1% usado)</div>
                  <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-white h-full rounded-full" style={{ width: "41.1%" }} />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <span className="text-[11px] text-neutral-500">Tokens Totales Procesados</span>
                  <div className="text-2xl font-bold tracking-tight text-white">14.8M</div>
                  <div className="text-[10px] text-neutral-400">11.6M Prompt • 3.2M Completion</div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <span className="text-[11px] text-neutral-500">Invocaciones Totales (Requests)</span>
                  <div className="text-2xl font-bold tracking-tight text-white">38,420</div>
                  <div className="text-[10px] text-neutral-400">99.98% llamadas exitosas</div>
                </div>

                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <span className="text-[11px] text-neutral-500">Costo Promedio / Ticket</span>
                  <div className="text-2xl font-bold tracking-tight text-white">$0.0012 <span className="text-xs text-neutral-400 font-normal">USD</span></div>
                  <div className="text-[10px] text-neutral-400">Ahorro vs N2 humano: 98.4%</div>
                </div>
              </div>

              {/* Model Cards Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-white tracking-wide uppercase">
                    Modelos Activos en Producción
                  </h3>
                  <span className="text-[11px] text-neutral-500 font-mono">4 modelos conectados</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modelsData.map((m) => (
                    <div
                      key={m.id}
                      className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4 hover:border-neutral-700 transition"
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white font-mono">{m.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300">
                              {m.provider}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-neutral-900 text-neutral-400">
                              Nodo: {m.node}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 leading-relaxed">{m.role}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold font-mono text-white">${m.costTotal.toFixed(2)}</div>
                          <div className="text-[10px] text-neutral-500 font-mono">{m.costPercentage} del total</div>
                        </div>
                      </div>

                      {/* Metrics Row */}
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-xs">
                        <div>
                          <span className="text-[10px] text-neutral-500 block">Tokens Usados</span>
                          <span className="font-mono text-white font-medium">{m.tokensTotal}</span>
                          <span className="text-[9px] text-neutral-500 block">In: {m.tokensInput} / Out: {m.tokensOutput}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-500 block">Invocaciones</span>
                          <span className="font-mono text-white font-medium">{m.requestsCount}</span>
                          <span className="text-[9px] text-neutral-500 block">requests</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-500 block">Latencia Media</span>
                          <span className="font-mono text-white font-medium">{m.avgLatency}</span>
                          <span className="text-[9px] text-neutral-500 block">p95 response</span>
                        </div>
                      </div>

                      {/* Pricing Footer */}
                      <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono pt-1">
                        <span>Precios: {m.costPer1kInput} in / {m.costPer1kOutput} out (1k tokens)</span>
                        <span className="flex items-center gap-1.5 text-neutral-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          <span>{m.status}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget & Cost Optimization Section */}
              <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-xs font-semibold text-white">Controles de Presupuesto y Enrutamiento Inteligente</h3>
                    <p className="text-[11px] text-neutral-500">
                      Reglas automáticas de fallback para mitigar picos de consumo y proteger costos operativos
                    </p>
                  </div>
                  <button
                    onClick={() => alert("Configuración de alertas de consumo guardada.")}
                    className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-neutral-200 transition"
                  >
                    Guardar Parámetros
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">Límite Mensual (Cap)</span>
                      <span className="font-mono text-white font-bold">$100.00 USD</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Corte automático o degradación a modelos locales cuando se alcance el 100% de la cuota.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">Fallback a Modelo Local</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">Ollama (Llama 3.1)</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Enruta automáticamente consultas de baja severidad a servidores on-premise si el presupuesto supera el 80%.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">Alerta de Anomalías</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">Activo (&gt; $5/hr)</span>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Notifica de inmediato a los administradores vía webhook si se detecta un bucle o ráfaga de consultas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================================= */}
          {/* VIEW: GESTIÓN DE USUARIOS L2 / L3 (EXCLUSIVO ADMIN MASTER) */}
          {/* ======================================================================= */}
          {activeTab === "users" && (
            selectedOperator.isMaster ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-neutral-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-medium bg-neutral-900 border border-neutral-800 text-neutral-300">
                        <Crown className="w-3 h-3 text-neutral-400" />
                        MODULO EXCLUSIVO • ADMIN MASTER
                      </span>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        Control de Accesos, Operadores L2 y Gerencia L3
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      <Users className="w-5 h-5 text-white" />
                      Gestión de Usuarios (Nivel L2 & L3)
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Administra y configura los especialistas técnicos asignados a la resolución de incidentes (Nivel 2) y gerencias de escalamiento (Nivel 3).
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handleOpenCreateUser}
                      className="px-3.5 py-2 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-2 transition active:scale-95 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-black" />
                      <span>Crear Nuevo Usuario</span>
                    </button>
                  </div>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-neutral-400">Total Registrados</span>
                      <Users className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight text-white">
                      {managedUsers.length}
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      Cuentas totales en el tenant
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-neutral-400">Usuarios Finales</span>
                      <Bot className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight text-white">
                      {managedUsers.filter((u) => u.role === "END_USER").length}
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      Consultas y tickets en Chat L1
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-neutral-400">Especialistas L2</span>
                      <Headphones className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight text-white">
                      {managedUsers.filter((u) => u.role === "L2").length}
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      Resolución humana directa
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-neutral-400">Gerentes / L3</span>
                      <Crown className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight text-white">
                      {managedUsers.filter((u) => u.role === "L3").length}
                    </div>
                    <div className="text-[10px] text-neutral-500">
                      Escalamiento crítico y auditoría
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-neutral-400">Disponibilidad Activa</span>
                      <ShieldCheck className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div className="text-2xl font-bold tracking-tight text-white">
                      {managedUsers.filter((u) => u.status === "active").length} / {managedUsers.length}
                    </div>
                    <div className="text-[10px] text-neutral-400 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-300" />
                      {(
                        (managedUsers.filter((u) => u.status === "active").length /
                          (managedUsers.length || 1)) *
                        100
                      ).toFixed(0)}% cuentas activas
                    </div>
                  </div>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        placeholder="Buscar por nombre, correo, área o especialidad técnica..."
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition font-sans"
                      />
                      {userSearchQuery && (
                        <button
                          onClick={() => setUserSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Filter Pills / Custom Smooth Dropdowns */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Role Filter Custom Dropdown */}
                      <div className="relative" ref={roleFilterRef}>
                        <button
                          type="button"
                          onClick={() => {
                            setIsRoleFilterOpen(!isRoleFilterOpen);
                            setIsAreaFilterOpen(false);
                            setIsStatusFilterOpen(false);
                          }}
                          className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 font-mono transition cursor-pointer"
                        >
                          <span className="text-neutral-500">Rol:</span>
                          <span className="text-white">
                            {userRoleFilter === "all"
                              ? "Todos los roles"
                              : userRoleFilter === "END_USER"
                              ? "Usuarios Finales"
                              : `Solo ${userRoleFilter}`}
                          </span>
                          <ChevronDown
                            className={`w-3 h-3 text-neutral-500 transition-transform duration-200 ${
                              isRoleFilterOpen ? "rotate-180 text-white" : ""
                            }`}
                          />
                        </button>

                        <div
                          className={`absolute left-0 mt-1.5 w-52 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-1 z-40 transform transition-all duration-200 ease-out origin-top ${
                            isRoleFilterOpen
                              ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                              : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
                          }`}
                        >
                          {[
                            { val: "all", label: "Todos los roles" },
                            { val: "END_USER", label: "Solo Usuarios Finales" },
                            { val: "L2", label: "Solo Especialistas L2" },
                            { val: "L3", label: "Solo Gerentes L3" }
                          ].map((item) => (
                            <button
                              key={item.val}
                              type="button"
                              onClick={() => {
                                setUserRoleFilter(item.val as any);
                                setIsRoleFilterOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition flex items-center justify-between cursor-pointer ${
                                userRoleFilter === item.val
                                  ? "bg-neutral-900 text-white font-medium"
                                  : "text-neutral-400 hover:bg-neutral-900/60 hover:text-white"
                              }`}
                            >
                              <span>{item.label}</span>
                              {userRoleFilter === item.val && <Check className="w-3 h-3 text-white" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Area Filter Custom Dropdown */}
                      <div className="relative" ref={areaFilterRef}>
                        <button
                          type="button"
                          onClick={() => {
                            setIsAreaFilterOpen(!isAreaFilterOpen);
                            setIsRoleFilterOpen(false);
                            setIsStatusFilterOpen(false);
                          }}
                          className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 font-mono transition cursor-pointer"
                        >
                          <span className="text-neutral-500">Área:</span>
                          <span className="text-white">
                            {userAreaFilter === "all" ? "Todas" : userAreaFilter}
                          </span>
                          <ChevronDown
                            className={`w-3 h-3 text-neutral-500 transition-transform duration-200 ${
                              isAreaFilterOpen ? "rotate-180 text-white" : ""
                            }`}
                          />
                        </button>

                        <div
                          className={`absolute left-0 mt-1.5 w-48 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-1 z-40 transform transition-all duration-200 ease-out origin-top ${
                            isAreaFilterOpen
                              ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                              : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
                          }`}
                        >
                          {[
                            { val: "all", label: "Todas las áreas" },
                            { val: "Infraestructura", label: "Infraestructura" },
                            { val: "Sap", label: "SAP" },
                            { val: "Magento", label: "Magento" },
                            { val: "Sigo", label: "Sigo" },
                            { val: "General", label: "General / TI" }
                          ].map((item) => (
                            <button
                              key={item.val}
                              type="button"
                              onClick={() => {
                                setUserAreaFilter(item.val);
                                setIsAreaFilterOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition flex items-center justify-between cursor-pointer ${
                                userAreaFilter === item.val
                                  ? "bg-neutral-900 text-white font-medium"
                                  : "text-neutral-400 hover:bg-neutral-900/60 hover:text-white"
                              }`}
                            >
                              <span>{item.label}</span>
                              {userAreaFilter === item.val && <Check className="w-3 h-3 text-white" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Status Filter Custom Dropdown */}
                      <div className="relative" ref={statusFilterRef}>
                        <button
                          type="button"
                          onClick={() => {
                            setIsStatusFilterOpen(!isStatusFilterOpen);
                            setIsRoleFilterOpen(false);
                            setIsAreaFilterOpen(false);
                          }}
                          className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 font-mono transition cursor-pointer"
                        >
                          <span className="text-neutral-500">Estado:</span>
                          <span className="text-white">
                            {userStatusFilter === "all" ? "Todos" : userStatusFilter === "active" ? "Activos" : "Inactivos"}
                          </span>
                          <ChevronDown
                            className={`w-3 h-3 text-neutral-500 transition-transform duration-200 ${
                              isStatusFilterOpen ? "rotate-180 text-white" : ""
                            }`}
                          />
                        </button>

                        <div
                          className={`absolute left-0 mt-1.5 w-40 bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-1 z-40 transform transition-all duration-200 ease-out origin-top ${
                            isStatusFilterOpen
                              ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                              : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
                          }`}
                        >
                          {[
                            { val: "all", label: "Todos los estados" },
                            { val: "active", label: "Solo Activos" },
                            { val: "inactive", label: "Solo Inactivos" }
                          ].map((item) => (
                            <button
                              key={item.val}
                              type="button"
                              onClick={() => {
                                setUserStatusFilter(item.val as any);
                                setIsStatusFilterOpen(false);
                              }}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition flex items-center justify-between cursor-pointer ${
                                userStatusFilter === item.val
                                  ? "bg-neutral-900 text-white font-medium"
                                  : "text-neutral-400 hover:bg-neutral-900/60 hover:text-white"
                              }`}
                            >
                              <span>{item.label}</span>
                              {userStatusFilter === item.val && <Check className="w-3 h-3 text-white" />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {(userSearchQuery || userRoleFilter !== "all" || userAreaFilter !== "all" || userStatusFilter !== "all") && (
                        <button
                          onClick={() => {
                            setUserSearchQuery("");
                            setUserRoleFilter("all");
                            setUserAreaFilter("all");
                            setUserStatusFilter("all");
                          }}
                          className="px-2.5 py-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded-lg transition cursor-pointer font-mono"
                          title="Restablecer filtros"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Table of Users */}
                {(() => {
                  const filtered = managedUsers.filter((u) => {
                    if (userRoleFilter !== "all" && u.role !== userRoleFilter) return false;
                    if (userAreaFilter !== "all" && u.area !== userAreaFilter) return false;
                    if (userStatusFilter !== "all" && u.status !== userStatusFilter) return false;
                    if (userSearchQuery.trim()) {
                      const q = userSearchQuery.toLowerCase();
                      const matchName = u.name.toLowerCase().includes(q);
                      const matchEmail = u.email.toLowerCase().includes(q);
                      const matchSpec = u.specialty.toLowerCase().includes(q);
                      const matchArea = u.area.toLowerCase().includes(q);
                      if (!matchName && !matchEmail && !matchSpec && !matchArea) return false;
                    }
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-12 text-center rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                        <Users className="w-10 h-10 text-neutral-600 mx-auto" />
                        <h3 className="text-sm font-semibold text-white">No se encontraron usuarios coincidentes</h3>
                        <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                          No hay usuarios registrados con los criterios o filtros de búsqueda seleccionados.
                        </p>
                        <button
                          onClick={() => {
                            setUserSearchQuery("");
                            setUserRoleFilter("all");
                            setUserAreaFilter("all");
                            setUserStatusFilter("all");
                          }}
                          className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white hover:bg-neutral-800 transition cursor-pointer"
                        >
                          Restablecer Filtros
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-neutral-800 bg-neutral-900/60 text-[11px] font-medium text-neutral-400 uppercase tracking-wider font-mono">
                              <th className="px-4 py-3">Usuario & Contacto</th>
                              <th className="px-4 py-3">Nivel / Rol</th>
                              <th className="px-4 py-3">Área / Departamento</th>
                              <th className="px-4 py-3">Especialidad & Funciones</th>
                              <th className="px-4 py-3 text-center">Estado</th>
                              <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-900">
                            {filtered.map((u) => {
                              const isL2 = u.role === "L2";
                              return (
                                <tr key={u.id} className="hover:bg-neutral-900/40 transition">
                                  {/* Usuario & Contacto */}
                                  <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono">
                                        {u.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .slice(0, 2)
                                          .join("")
                                          .toUpperCase()}
                                      </div>
                                      <div>
                                        <div className="font-medium text-white flex items-center gap-1.5">
                                          <span>{u.name}</span>
                                          <span className="text-[9px] px-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono">
                                            {u.role}
                                          </span>
                                        </div>
                                        <div className="text-[11px] text-neutral-400 font-mono flex items-center gap-2 mt-0.5">
                                          <span className="flex items-center gap-1">
                                            <Mail className="w-3 h-3 text-neutral-500" />
                                            {u.email}
                                          </span>
                                          {u.phone && (
                                            <span className="text-neutral-500">• {u.phone}</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Rol */}
                                  <td className="px-4 py-3.5 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-medium bg-neutral-900 border border-neutral-800 text-neutral-300">
                                      {u.role === "END_USER" ? (
                                        <>
                                          <Bot className="w-3 h-3 text-neutral-400" />
                                          Usuario Final
                                        </>
                                      ) : u.role === "L2" ? (
                                        <>
                                          <Headphones className="w-3 h-3 text-neutral-400" />
                                          Especialista L2
                                        </>
                                      ) : (
                                        <>
                                          <Crown className="w-3 h-3 text-neutral-400" />
                                          Gerente L3
                                        </>
                                      )}
                                    </span>
                                  </td>

                                  {/* Área */}
                                  <td className="px-4 py-3.5 whitespace-nowrap">
                                    <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-neutral-900 border border-neutral-800 text-neutral-300">
                                      {u.area}
                                    </span>
                                  </td>

                                  {/* Especialidad */}
                                  <td className="px-4 py-3.5 max-w-xs">
                                    <p className="text-neutral-300 text-xs truncate" title={u.specialty}>
                                      {u.specialty}
                                    </p>
                                    <span className="text-[10px] text-neutral-500 font-mono">
                                      Registrado: {u.createdAt}
                                    </span>
                                  </td>

                                  {/* Estado */}
                                  <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                    <button
                                      onClick={() => handleToggleUserStatus(u.id)}
                                      title="Haz clic para alternar estado (Activo / Inactivo)"
                                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-medium transition cursor-pointer bg-neutral-900 border border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          u.status === "active" ? "bg-white" : "bg-neutral-600"
                                        }`}
                                      />
                                      {u.status === "active" ? "Activo" : "Inactivo"}
                                    </button>
                                  </td>

                                  {/* Acciones */}
                                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button
                                        onClick={() => handleOpenEditUser(u)}
                                        className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition cursor-pointer"
                                        title="Editar usuario"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => setUserToDelete(u)}
                                        className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition cursor-pointer"
                                        title="Eliminar usuario"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="px-4 py-2.5 bg-neutral-900/30 border-t border-neutral-800 text-[11px] text-neutral-500 flex items-center justify-between font-mono">
                        <span>Mostrando {filtered.length} de {managedUsers.length} usuarios</span>
                        <span className="text-neutral-400">Total L2: {managedUsers.filter(x => x.role === "L2").length} • Total L3: {managedUsers.filter(x => x.role === "L3").length}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* Access Denied View */
              <div className="flex-1 flex items-center justify-center p-6 bg-black">
                <div className="max-w-md w-full p-8 rounded-2xl bg-neutral-950 border border-neutral-800 text-center space-y-4 shadow-2xl">
                  <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Acceso Denegado</h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      El módulo de Gestión de Usuarios L2/L3 está restringido únicamente al perfil de <span className="text-white font-medium">Administrador Maestro</span>.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400 text-left space-y-1">
                    <div className="text-neutral-500 font-mono uppercase text-[10px]">Operador Actual:</div>
                    <div className="text-white font-medium">{selectedOperator.name}</div>
                    <div className="text-neutral-500">{selectedOperator.roleLabel}</div>
                  </div>
                  <button
                    onClick={() => setActiveTab("tickets")}
                    className="w-full py-2 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition cursor-pointer"
                  >
                    Volver a Chats Asignados
                  </button>
                </div>
              </div>
            )
          )}
            </>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* TICKET DETAILS & L2 MANAGEMENT MODAL */}
      {/* ========================================================================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-semibold text-white">{selectedTicket.id}</span>
                  <span className={`font-mono text-xs font-medium ${
                    selectedTicket.area === "Infraestructura"
                      ? "text-sky-400"
                      : selectedTicket.area === "Sap"
                      ? "text-indigo-400"
                      : selectedTicket.area === "Magento"
                      ? "text-orange-400"
                      : "text-emerald-400"
                  }`}>
                    {selectedTicket.area}
                  </span>
                  <span className="font-mono text-xs font-semibold flex items-center gap-1.5">
                    {selectedTicket.status === "escalated_to_l3" ? (
                      <span className="text-rose-400 flex items-center gap-1.5">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                        <span>ESCALADO A L3 (GERENCIA)</span>
                      </span>
                    ) : selectedTicket.status === "closed" ? (
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>RESUELTO L1</span>
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>ESCALADO L2</span>
                      </span>
                    )}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-white">{selectedTicket.title}</h3>
                <span className="text-[11px] text-neutral-500">Solicitante: {selectedTicket.requester}</span>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-neutral-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="space-y-3.5 text-xs overflow-y-auto flex-1 pr-1">
              {/* AI Diagnostic Briefing */}
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 block font-semibold uppercase text-[10px] tracking-wider">
                    Briefing de Traspaso del Agente L1:
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">Confianza: {(selectedTicket.confidence * 100).toFixed(0)}%</span>
                </div>
                <p className="text-neutral-200 leading-relaxed text-[11px]">{selectedTicket.summary}</p>
              </div>

              {/* Assignment Meta */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-850">
                  <span className="text-neutral-500 block text-[10px] mb-0.5">Especialista L2 Asignado</span>
                  <span className="font-medium text-white">{selectedTicket.assigned_to}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-850">
                  <span className="text-neutral-500 block text-[10px] mb-0.5">Gerente de Área (L3)</span>
                  <span className="font-medium text-white truncate block">{selectedTicket.manager_l3}</span>
                </div>
              </div>

              {/* Dialogue Transcript */}
              {selectedTicket.dialogue && selectedTicket.dialogue.length > 0 && (
                <div className="space-y-2">
                  <span className="text-neutral-400 block font-semibold uppercase text-[10px] tracking-wider">
                    Historial de Conversación con el Usuario:
                  </span>
                  <div className="space-y-1.5 p-3 rounded-lg bg-black border border-neutral-850 max-h-48 overflow-y-auto">
                    {selectedTicket.dialogue.map((d: any, idx: number) => (
                      <div key={idx} className="text-[11px] space-y-0.5">
                        <div className="flex items-center justify-between text-neutral-500 text-[10px]">
                          <span className="font-medium text-neutral-300">{d.sender}</span>
                          <span>{d.time}</span>
                        </div>
                        <p className="text-neutral-200 bg-neutral-900/60 p-2 rounded">{d.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* L2 Reply Input */}
              {selectedTicket.status !== "closed" && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-neutral-400 block text-[10px] font-semibold uppercase">
                    Intervenir en el Chat (Respuesta L2 al Usuario):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={l2ReplyText}
                      onChange={(e) => setL2ReplyText(e.target.value)}
                      placeholder="Escribe la respuesta técnica de L2 para el cliente..."
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700"
                    />
                    <button
                      onClick={() => {
                        if (!l2ReplyText.trim()) return;
                        setTicketsList((prev) =>
                          prev.map((t) =>
                            t.id === selectedTicket.id
                              ? {
                                  ...t,
                                  dialogue: [
                                    ...(t.dialogue || []),
                                    {
                                      id: `l2-${Date.now()}`,
                                      sender: "l2",
                                      sender_name: `${selectedOperator.name} (L2)`,
                                      text: l2ReplyText,
                                      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                    }
                                  ]
                                }
                              : t
                          )
                        );
                        setSelectedTicket((prev: any) =>
                          prev
                            ? {
                                ...prev,
                                dialogue: [
                                  ...(prev.dialogue || []),
                                  {
                                    id: `l2-${Date.now()}`,
                                    sender: "l2",
                                    sender_name: `${selectedOperator.name} (L2)`,
                                    text: l2ReplyText,
                                    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                  }
                                ]
                              }
                            : null
                        );
                        setL2ReplyText("");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium transition"
                    >
                      Enviar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white text-xs transition"
              >
                Cerrar
              </button>

              <div className="flex items-center gap-2">
                {/* L3 Escalation Button (Only for L2/Master on unclosed tickets) */}
                {selectedTicket.status !== "closed" && selectedTicket.status !== "escalated_to_l3" && (
                  <button
                    onClick={() => {
                      setTargetTicketForL3(selectedTicket);
                      setShowL3Modal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white text-xs font-medium flex items-center gap-1.5 transition"
                    title="Escalar al Gerente respondiente del área"
                  >
                    <AlertOctagon className="w-3.5 h-3.5 text-white" />
                    <span>Escalar a L3 (Gerencia de {selectedTicket.area})</span>
                  </button>
                )}

                {selectedTicket.status !== "closed" ? (
                  <button
                    onClick={() => {
                      setTicketsList((prev) =>
                        prev.map((t) => (t.id === selectedTicket.id ? { ...t, status: "closed" } : t))
                      );
                      setSelectedTicket(null);
                      alert(`Ticket ${selectedTicket.id} resuelto y cerrado exitosamente.`);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition"
                  >
                    Resolver & Cerrar Caso
                  </button>
                ) : (
                  <span className="text-xs text-neutral-500 font-mono">Caso cerrado en L1</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* L3 ESCALATION CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {showL3Modal && targetTicketForL3 && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white">Escalamiento a Nivel 3 (L3) — Gerencia</h3>
                  <span className="text-[11px] font-mono text-neutral-400">
                    Ticket #{targetTicketForL3.id} • Área: {targetTicketForL3.area}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowL3Modal(false);
                  setL3Reason("");
                }}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-neutral-400">Gerente Responsable (L3):</span>
                  <span className="font-semibold text-white font-mono">{targetTicketForL3.manager_l3}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-neutral-400">Correo Electrónico:</span>
                  <span className="font-mono text-neutral-300">{targetTicketForL3.manager_email}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-neutral-400">SLA de Atención Gerencial:</span>
                  <span className="font-bold text-white font-mono">1 Hora (Prioridad Máxima)</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-300 mb-1">
                  Justificación Técnica para la Gerencia de {targetTicketForL3.area} (Obligatorio):
                </label>
                <textarea
                  rows={3}
                  value={l3Reason}
                  onChange={(e) => setL3Reason(e.target.value)}
                  placeholder="Detalla por qué este incidente no puede subsanarse en L2 (ej: Bloqueo crítico de producción, necesidad de liberación de presupuesto o excepción de seguridad)..."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
              <button
                onClick={() => {
                  setShowL3Modal(false);
                  setL3Reason("");
                }}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!l3Reason.trim()) {
                    alert("Por favor ingresa la justificación técnica para la gerencia.");
                    return;
                  }
                  // Update tickets list
                  setTicketsList((prev) =>
                    prev.map((t) =>
                      t.id === targetTicketForL3.id
                        ? {
                            ...t,
                            status: "escalated_to_l3",
                            assigned_to: targetTicketForL3.manager_l3,
                            summary: `${t.summary} [ESCALADO A L3]: ${l3Reason}`
                          }
                        : t
                    )
                  );
                  setSelectedTicket((prev: any) =>
                    prev
                      ? {
                          ...prev,
                          status: "escalated_to_l3",
                          assigned_to: prev.manager_l3,
                          summary: `${prev.summary} [ESCALADO A L3]: ${l3Reason}`
                        }
                      : null
                  );
                  setShowL3Modal(false);
                  setL3Reason("");
                  alert(`Ticket ${targetTicketForL3.id} escalado formalmente a ${targetTicketForL3.manager_l3} (Nivel 3).`);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <AlertOctagon className="w-3.5 h-3.5 text-black" />
                <span>Confirmar Escalamiento a L3</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* JSON TRACE MODAL */}
      {/* ========================================================================= */}
      {showTraceModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <span className="text-xs font-mono text-neutral-400">Runtime Observability</span>
                <h3 className="font-semibold text-sm text-white">Traza JSON de Ejecución del Grafo</h3>
              </div>
              <button
                onClick={() => setShowTraceModal(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-black p-4 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-300 max-h-96 overflow-y-auto">
              <pre>
                {JSON.stringify(
                  {
                    dag_run_id: "dag_run_9401",
                    tenant_id: DEMO_TENANT_ID,
                    pipeline_status: "SUCCESS",
                    nodes_executed: [
                      {
                        node: "TriageNode",
                        duration_ms: 112,
                        output: { sentiment: "frustrated", severity: "high", area: "Technical Support" }
                      },
                      {
                        node: "RAGResolverNode",
                        duration_ms: 145,
                        output: { index: "hnsw_cosine_v3", top_k: 4, best_match: 0.92 }
                      },
                      {
                        node: "GuardrailNode",
                        duration_ms: 45,
                        output: { grounding_score: 0.89, passed: true }
                      },
                      {
                        node: "EscalationNode",
                        duration_ms: 60,
                        output: { status: "standby_fallback", assigned_queue: "L2_Level" }
                      }
                    ]
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="flex justify-end pt-2 border-t border-neutral-800">
              <button
                onClick={() => setShowTraceModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* USER CREATE / EDIT MODAL (ADMIN MASTER) */}
      {/* ========================================================================= */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-neutral-800 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-medium flex items-center gap-1">
                    <Crown className="w-3 h-3 text-neutral-400" />
                    ADMIN MASTER
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">
                    {editingUser ? "Edición de Perfil" : "Alta de Nuevo Usuario"}
                  </span>
                </div>
                <h3 className="font-bold text-base text-white">
                  {editingUser ? `Editar Usuario: ${editingUser.name}` : "Crear Nuevo Usuario (Final, L2 o L3)"}
                </h3>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error banner if any */}
            {userFormError && (
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                <span>{userFormError}</span>
              </div>
            )}

            {/* Role Selection Segmented Cards */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider font-mono">
                Nivel / Rol Operativo
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setUserFormRole("END_USER")}
                  className={`p-3 rounded-lg border text-left transition flex flex-col justify-between cursor-pointer ${
                    userFormRole === "END_USER"
                      ? "bg-neutral-900 border-neutral-500 text-white"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-neutral-400" />
                      Usuario Final
                    </span>
                    {userFormRole === "END_USER" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-tight">
                    Usuario final del portal para formular preguntas e interactuar con el chat IA.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setUserFormRole("L2")}
                  className={`p-3 rounded-lg border text-left transition flex flex-col justify-between cursor-pointer ${
                    userFormRole === "L2"
                      ? "bg-neutral-900 border-neutral-500 text-white"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                      <Headphones className="w-3.5 h-3.5 text-neutral-400" />
                      Especialista L2
                    </span>
                    {userFormRole === "L2" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-tight">
                    Atención de soporte en primera línea humana, chats y diagnóstico de incidencias.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setUserFormRole("L3")}
                  className={`p-3 rounded-lg border text-left transition flex flex-col justify-between cursor-pointer ${
                    userFormRole === "L3"
                      ? "bg-neutral-900 border-neutral-500 text-white"
                      : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-neutral-400" />
                      Gerente / L3
                    </span>
                    {userFormRole === "L3" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <p className="text-[10px] text-neutral-400 leading-tight">
                    Nivel superior de escalamiento, gerencia de área, decisiones de arquitectura y SLA.
                  </p>
                </button>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">
                  Nombre Completo <span className="text-neutral-500">*</span>
                </label>
                <input
                  type="text"
                  value={userFormName}
                  onChange={(e) => {
                    setUserFormName(e.target.value);
                    if (userFormError) setUserFormError("");
                  }}
                  placeholder="Ej: Ing. Mauricio Salgado"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">
                    Correo Electrónico <span className="text-neutral-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={userFormEmail}
                    onChange={(e) => {
                      setUserFormEmail(e.target.value);
                      if (userFormError) setUserFormError("");
                    }}
                    placeholder="usuario@empresa.com"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">
                    Teléfono / Extensión
                  </label>
                  <input
                    type="text"
                    value={userFormPhone}
                    onChange={(e) => setUserFormPhone(e.target.value)}
                    placeholder="+52 55 1234 5678"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="relative" ref={userFormAreaDropdownRef}>
                  <label className="block text-neutral-400 mb-1 font-medium">
                    Departamento / Área <span className="text-neutral-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserFormAreaOpen(!isUserFormAreaOpen);
                      setIsUserFormStatusOpen(false);
                    }}
                    aria-expanded={isUserFormAreaOpen}
                    className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white rounded-lg px-3 py-2 text-xs md:text-sm font-mono flex items-center justify-between transition cursor-pointer select-none"
                  >
                    <span>
                      {userFormArea === "Sap"
                        ? "SAP"
                        : userFormArea === "General"
                        ? "General / TI"
                        : userFormArea}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
                        isUserFormAreaOpen ? "rotate-180 text-white" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`absolute left-0 mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-1 z-50 transform transition-all duration-200 ease-out origin-top ${
                      isUserFormAreaOpen
                        ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
                    }`}
                  >
                    {[
                      { val: "Infraestructura", label: "Infraestructura" },
                      { val: "Sap", label: "SAP" },
                      { val: "Magento", label: "Magento" },
                      { val: "Sigo", label: "Sigo" },
                      { val: "General", label: "General / TI" },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => {
                          setUserFormArea(item.val as any);
                          setIsUserFormAreaOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs md:text-sm font-mono transition flex items-center justify-between cursor-pointer ${
                          userFormArea === item.val
                            ? "bg-neutral-900 text-white font-medium"
                            : "text-neutral-400 hover:bg-neutral-900/60 hover:text-white"
                        }`}
                      >
                        <span>{item.label}</span>
                        {userFormArea === item.val && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative" ref={userFormStatusDropdownRef}>
                  <label className="block text-neutral-400 mb-1 font-medium">
                    Estado de la Cuenta
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserFormStatusOpen(!isUserFormStatusOpen);
                      setIsUserFormAreaOpen(false);
                    }}
                    aria-expanded={isUserFormStatusOpen}
                    className="w-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-white rounded-lg px-3 py-2 text-xs md:text-sm font-mono flex items-center justify-between transition cursor-pointer select-none"
                  >
                    <span>
                      {userFormStatus === "active"
                        ? "Activo (Habilitado para asignación)"
                        : "Inactivo (Suspender temporalmente)"}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
                        isUserFormStatusOpen ? "rotate-180 text-white" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`absolute left-0 mt-1.5 w-full bg-neutral-950 border border-neutral-800 rounded-xl shadow-2xl p-1 z-50 transform transition-all duration-200 ease-out origin-top ${
                      isUserFormStatusOpen
                        ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
                    }`}
                  >
                    {[
                      { val: "active", label: "Activo (Habilitado para asignación)" },
                      { val: "inactive", label: "Inactivo (Suspender temporalmente)" },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => {
                          setUserFormStatus(item.val as any);
                          setIsUserFormStatusOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs md:text-sm font-mono transition flex items-center justify-between cursor-pointer ${
                          userFormStatus === item.val
                            ? "bg-neutral-900 text-white font-medium"
                            : "text-neutral-400 hover:bg-neutral-900/60 hover:text-white"
                        }`}
                      >
                        <span>{item.label}</span>
                        {userFormStatus === item.val && <Check className="w-4 h-4 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">
                  Especialidad Técnica / Descripción de Funciones <span className="text-neutral-500">*</span>
                </label>
                <textarea
                  value={userFormSpecialty}
                  onChange={(e) => {
                    setUserFormSpecialty(e.target.value);
                    if (userFormError) setUserFormError("");
                  }}
                  rows={2}
                  placeholder="Ej: Especialista en redes Cisco, VPN corporativa, Active Directory e impresoras térmicas de almacén."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 font-sans resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveUser}
                className="px-4 py-2 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-black" />
                <span>{editingUser ? "Guardar Cambios" : "Crear Usuario"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE USER CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-white">¿Eliminar usuario definitivamente?</h3>
                <p className="text-xs text-neutral-400">
                  Estás a punto de eliminar al usuario <span className="text-white font-medium">{userToDelete.name}</span> ({userToDelete.role} • {userToDelete.area}).
                </p>
                <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400 mt-2 font-mono">
                  Esta acción revocará sus permisos en el sistema y desasignará su bandeja de soporte.
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-800">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteUser}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-neutral-700 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar Eliminación</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE CONFIRMACIÓN DE CERRAR SESIÓN (LOGOUT) */}
      {/* ========================================================================= */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl w-full max-w-sm p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 flex-shrink-0">
                <LogOut className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Cerrar Sesión de Agente</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  ¿Deseas finalizar la sesión de <span className="text-white font-medium">{selectedOperator.name}</span>?
                </p>
              </div>
            </div>

            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-400 space-y-1">
              <div className="flex justify-between">
                <span>Operador:</span>
                <span className="text-white font-mono">{selectedOperator.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Rol:</span>
                <span className="text-neutral-300">{selectedOperator.isMaster ? "Super Admin" : "Agente L2"}</span>
              </div>
              <div className="flex justify-between">
                <span>Área:</span>
                <span className="text-neutral-300">{selectedOperator.area}</span>
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

      {/* ========================================================================= */}
      {/* USER MANAGEMENT TOAST NOTIFICATION */}
      {/* ========================================================================= */}
      {userToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200 bg-neutral-900 border-neutral-800 text-white text-xs font-mono">
          <Check className="w-4 h-4 text-neutral-300 flex-shrink-0" />
          <span>{userToast.message}</span>
        </div>
      )}
      {/* Transición de Salida Suave del Sistema */}
      <SystemTransitionOverlay
        isOpen={isSystemExiting}
        mode="exiting"
        title="Cerrando Sesión de Consola"
        subtitle="Liberando asignaciones L2/L3 y purgando credenciales de forma segura..."
      />
    </div>
  );
}
