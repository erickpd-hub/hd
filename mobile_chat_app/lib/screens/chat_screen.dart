import 'package:flutter/material.dart';
import '../models/chat_message.dart';
import '../services/chat_api_service.dart';
import '../widgets/chat_bubble.dart';

class ChatSessionItem {
  final String id;
  final String title;
  final DateTime date;
  final List<ChatMessage> messages;

  ChatSessionItem({
    required this.id,
    required this.title,
    required this.date,
    required this.messages,
  });
}

class ChatScreen extends StatefulWidget {
  const ChatScreen({Key? key}) : super(key: key);

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final ChatApiService _apiService = ChatApiService();

  List<ChatMessage> _messages = [];
  bool _isLoading = false;
  String? _currentTicketId;

  // Sesiones guardadas para el drawer lateral de conversaciones
  final List<ChatSessionItem> _savedSessions = [
    ChatSessionItem(
      id: 'sess-1',
      title: 'Desbloqueo de credenciales Windows AD',
      date: DateTime.now().subtract(const Duration(hours: 3)),
      messages: [],
    ),
    ChatSessionItem(
      id: 'sess-2',
      title: 'Error de timbrado CFDI en SAP ERP',
      date: DateTime.now().subtract(const Duration(days: 1)),
      messages: [],
    ),
  ];

  final List<Map<String, String>> _departmentShortcuts = [
    {
      'title': 'Infraestructura: Clave & Impresora',
      'dept': 'Redes',
      'prompt': 'Tengo bloqueada mi clave de Windows y la impresora no responde.',
    },
    {
      'title': 'SAP: Error SKU & Facturación',
      'dept': 'Finanzas',
      'prompt':
          'El sistema SAP arroja error de SKU no encontrado al timbrar factura.',
    },
    {
      'title': 'Magento: Fallo POS & Ecommerce',
      'dept': 'Ventas',
      'prompt': 'La terminal POS de la tienda perdió conexión con Magento.',
    },
    {
      'title': 'Sigo: Rutas y Despacho',
      'dept': 'Logística',
      'prompt': 'No podemos ingresar a Sigo y los camiones están detenidos.',
    },
  ];

  @override
  void initState() {
    super.initState();
    _inputController.addListener(() {
      setState(() {});
    });
  }

  @override
  void dispose() {
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 260),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _handleNewChat() {
    if (_messages.isEmpty) return;
    setState(() {
      _savedSessions.insert(
        0,
        ChatSessionItem(
          id: 'sess-${DateTime.now().millisecondsSinceEpoch}',
          title: _messages.first.text.length > 36
              ? '${_messages.first.text.substring(0, 36)}...'
              : _messages.first.text,
          date: DateTime.now(),
          messages: List.from(_messages),
        ),
      );
      _messages = [];
      _currentTicketId = null;
    });
  }

  Future<void> _handleSendMessage([String? predefinedText]) async {
    final text = (predefinedText ?? _inputController.text).trim();
    if (text.isEmpty || _isLoading) return;

    if (predefinedText == null) {
      _inputController.clear();
    }

    final userMsg = ChatMessage(
      id: 'usr-${DateTime.now().millisecondsSinceEpoch}',
      sender: MessageSender.customer,
      text: text,
      timestamp: DateTime.now(),
    );

    setState(() {
      _messages.add(userMsg);
      _isLoading = true;
    });
    _scrollToBottom();

    try {
      final aiResponse = await _apiService.sendMessage(
        text: text,
        currentTicketId: _currentTicketId,
      );

      setState(() {
        _messages.add(aiResponse);
        if (aiResponse.ticketId != null) {
          _currentTicketId = aiResponse.ticketId;
        }
      });
    } catch (_) {
      setState(() {
        _messages.add(
          ChatMessage(
            id: 'err-${DateTime.now().millisecondsSinceEpoch}',
            sender: MessageSender.ai,
            text:
                'No se pudo establecer conexión con el servidor central. Se mantendrá el reintento automático.',
            timestamp: DateTime.now(),
          ),
        );
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
      _scrollToBottom();
    }
  }

  void _openShortcutsModal() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: Color(0xF20F0F12),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: const Color(0xFF333333),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'ATAJOS DEPARTAMENTALES',
                style: TextStyle(
                  fontSize: 10,
                  fontFamily: 'monospace',
                  color: Color(0xFFA3A3A3),
                  letterSpacing: 1.2,
                ),
              ),
              const SizedBox(height: 12),
              ..._departmentShortcuts.map((item) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 8.0),
                  child: InkWell(
                    onTap: () {
                      Navigator.pop(ctx);
                      _handleSendMessage(item['prompt']);
                    },
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0x9917171A),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              item['title']!,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Colors.white,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1F1F1F),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              item['dept']!,
                              style: const TextStyle(
                                fontSize: 10,
                                fontFamily: 'monospace',
                                color: Color(0xFFA3A3A3),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ],
          ),
        ),
      ),
    );
  }

  void _openConfigDialog() {
    final urlController = TextEditingController(text: _apiService.baseUrl);
    final tenantController = TextEditingController(text: _apiService.tenantId);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0F0F12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: Color(0xFF262626)),
        ),
        title: const Text(
          'Configuración del Servidor Central',
          style: TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'URL Base de la API Backend:',
              style: TextStyle(color: Color(0xFFA3A3A3), fontSize: 11),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: urlController,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontFamily: 'monospace',
              ),
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFF17171A),
                hintText: 'http://192.168.0.39:8000',
                hintStyle: const TextStyle(color: Color(0xFF555555)),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: Color(0xFF262626)),
                ),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Tenant ID (UUID):',
              style: TextStyle(color: Color(0xFFA3A3A3), fontSize: 11),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: tenantController,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontFamily: 'monospace',
              ),
              decoration: InputDecoration(
                filled: true,
                fillColor: const Color(0xFF17171A),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: Color(0xFF262626)),
                ),
                contentPadding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancelar',
                style: TextStyle(color: Color(0xFFA3A3A3), fontSize: 12)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.white,
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            onPressed: () {
              setState(() {
                _apiService.baseUrl = urlController.text.trim();
                _apiService.tenantId = tenantController.text.trim();
              });
              Navigator.pop(ctx);
            },
            child: const Text('Guardar',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final hasContent = _messages.isNotEmpty;

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: Colors.black,
      drawer: _buildDrawer(),
      body: Stack(
        children: [
          // =========================================================================
          // FONDO CON COLOR GRADING AZUL INDIGO NOCTURNO (IDENTICO AL PORTAL WEB)
          // =========================================================================
          Positioned.fill(
            child: Container(color: Colors.black),
          ),
          // Gradiente radial profundo con azul nocturno emergiendo en la mitad inferior
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: RadialGradient(
                  center: Alignment(0.0, 1.25),
                  radius: 1.15,
                  colors: [
                    Color(0xD1142359), // rgba(20, 35, 89, 0.82)
                    Color(0x8C0B163A), // rgba(11, 22, 58, 0.55)
                    Color(0x47050A1E), // rgba(5, 10, 30, 0.28)
                    Color(0x00000000), // transparent
                  ],
                  stops: [0.0, 0.35, 0.65, 0.95],
                ),
              ),
            ),
          ),
          // Resplandor suave inferior que abraza el area del input flotante
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            height: 380,
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  colors: [
                    Color(0x590E1A46), // rgba(14, 26, 70, 0.35)
                    Color(0x00000000),
                  ],
                ),
              ),
            ),
          ),

          // =========================================================================
          // ESTRUCTURA PRINCIPAL DE LA PANTALLA
          // =========================================================================
          SafeArea(
            child: Column(
              children: [
                // 1. HEADER RESPONSIVE (ESTILO GLASS SIN BORDES)
                _buildHeader(hasContent),

                // 2. CONTENIDO PRINCIPAL: FEED DE MENSAJES O PANTALLA DE INICIO
                Expanded(
                  child: hasContent
                      ? _buildMessageFeed()
                      : _buildEmptyStateScreen(),
                ),

                // 3. BARRA DE ENTRADA: CAPSULA FLOTANTE ESTILO GEMINI
                _buildFloatingInputCapsule(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Header superior idéntico al modo responsive de la página web
  Widget _buildHeader(bool hasContent) {
    return Container(
      height: 54,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Lado izquierdo: Botón de dos barras horizontales + Título "Soporte"
          Row(
            children: [
              InkWell(
                onTap: () => _scaffoldKey.currentState?.openDrawer(),
                borderRadius: BorderRadius.circular(8),
                child: Padding(
                  padding: const EdgeInsets.all(6.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 20,
                        height: 2,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                      const SizedBox(height: 5),
                      Container(
                        width: 20,
                        height: 2,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'Soporte',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                  letterSpacing: -0.2,
                ),
              ),
            ],
          ),

          // Lado derecho: Botón Nuevo Chat + Avatar 'A' con color de referencia #c2185b
          Row(
            children: [
              IconButton(
                onPressed: hasContent ? _handleNewChat : null,
                icon: Icon(
                  Icons.rate_review_outlined,
                  size: 20,
                  color: hasContent ? Colors.white : const Color(0x66FFFFFF),
                ),
                tooltip: 'Nueva conversación',
              ),
              const SizedBox(width: 4),
              InkWell(
                onTap: _openConfigDialog,
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: const Color(0xFFC2185B),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.4),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Text(
                      'A',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // Pantalla de inicio "Listo cuando quieras" cuando la conversación está vacía
  Widget _buildEmptyStateScreen() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo corporativo GILSA
            Image.asset(
              'assets/images/gilsa-logo.png',
              width: 170,
              height: 55,
              fit: BoxFit.contain,
              errorBuilder: (_, __, ___) => const Column(
                children: [
                  Text(
                    'GILSA',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 4,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    'CENTRO DE SOPORTE',
                    style: TextStyle(
                      fontSize: 10,
                      fontFamily: 'monospace',
                      color: Color(0xFFA3A3A3),
                      letterSpacing: 2,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Texto exacto de la pantalla responsive de referencia
            const Text(
              'Listo cuando quieras',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w400,
                color: Colors.white,
                letterSpacing: -0.4,
              ),
            ),
            const SizedBox(height: 32),

            // Accesos directos a preguntas frecuentes
            Column(
              children: _departmentShortcuts.map((item) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10.0),
                  child: InkWell(
                    onTap: () => _handleSendMessage(item['prompt']),
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0x6616171B),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Expanded(
                            child: Text(
                              item['title']!,
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFFE5E5E5),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 7, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1F1F1F),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              item['dept']!,
                              style: const TextStyle(
                                fontSize: 10,
                                fontFamily: 'monospace',
                                color: Color(0xFFA3A3A3),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  // Feed de mensajes
  Widget _buildMessageFeed() {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.only(top: 8, bottom: 12),
      itemCount: _messages.length + (_isLoading ? 1 : 0),
      itemBuilder: (context, index) {
        if (index == _messages.length && _isLoading) {
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    SizedBox(
                      width: 12,
                      height: 12,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    ),
                    SizedBox(width: 8),
                    Text(
                      'El agente está analizando la solicitud y consultando la base de conocimiento...',
                      style: TextStyle(
                        fontSize: 11,
                        color: Color(0xFFA3A3A3),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: const Color(0x73111317),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CircleAvatar(radius: 3, backgroundColor: Colors.white),
                      SizedBox(width: 5),
                      CircleAvatar(
                          radius: 3, backgroundColor: Color(0xFFD4D4D4)),
                      SizedBox(width: 5),
                      CircleAvatar(
                          radius: 3, backgroundColor: Color(0xFF737373)),
                    ],
                  ),
                ),
              ],
            ),
          );
        }

        final msg = _messages[index];
        return ChatBubble(message: msg);
      },
    );
  }

  // Cápsula flotante inferior (estilo Gemini mobile)
  Widget _buildFloatingInputCapsule() {
    final hasText = _inputController.text.trim().isNotEmpty;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xDE1E1F20),
          borderRadius: BorderRadius.circular(32),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.55),
              blurRadius: 28,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 5),
        child: Row(
          children: [
            // Botón Plus (+) para atajos departamentales
            IconButton(
              icon: const Icon(Icons.add, size: 22, color: Color(0xFFD4D4D4)),
              onPressed: _openShortcutsModal,
              tooltip: 'Atajos Departamentales',
            ),

            // Botón de adjuntos (paperclip)
            IconButton(
              icon: const Icon(Icons.attach_file_rounded,
                  size: 20, color: Color(0xFFD4D4D4)),
              onPressed: _openShortcutsModal,
              tooltip: 'Adjuntar documento',
            ),

            // Campo de texto con placeholder exacto "Pregunta a Gemini"
            Expanded(
              child: TextField(
                controller: _inputController,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                ),
                maxLines: null,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _handleSendMessage(),
                decoration: const InputDecoration(
                  hintText: 'Pregunta a Gemini',
                  hintStyle: TextStyle(
                    color: Color(0xFF9E9E9E),
                    fontSize: 13,
                  ),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(horizontal: 8),
                ),
              ),
            ),

            // Botón derecho: Flecha circular blanca para enviar o micrófono
            if (hasText)
              Container(
                width: 34,
                height: 34,
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  icon: const Icon(
                    Icons.arrow_upward_rounded,
                    size: 18,
                    color: Colors.black,
                  ),
                  onPressed: () => _handleSendMessage(),
                  padding: EdgeInsets.zero,
                ),
              )
            else
              IconButton(
                icon: const Icon(
                  Icons.mic_none_rounded,
                  size: 22,
                  color: Color(0xFFD4D4D4),
                ),
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text(
                        'Función de entrada por voz preparada.',
                        style: TextStyle(fontSize: 12),
                      ),
                      duration: Duration(seconds: 2),
                      backgroundColor: Color(0xFF17171A),
                    ),
                  );
                },
                tooltip: 'Entrada por voz',
              ),
          ],
        ),
      ),
    );
  }

  // Drawer lateral para historial de conversaciones
  Widget _buildDrawer() {
    return Drawer(
      backgroundColor: const Color(0xF20F0F12),
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Cabecera del Drawer
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Text(
                        'Conversaciones',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      SizedBox(width: 8),
                      Text(
                        'Historial',
                        style: TextStyle(
                          fontSize: 10,
                          fontFamily: 'monospace',
                          color: Color(0xFFA3A3A3),
                        ),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close,
                        size: 18, color: Color(0xFFA3A3A3)),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),

            // Botón + Nueva conversación
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: InkWell(
                onTap: () {
                  Navigator.pop(context);
                  _handleNewChat();
                },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  width: double.infinity,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
                  decoration: BoxDecoration(
                    color: const Color(0x9917171A),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.add, size: 16, color: Colors.white),
                      SizedBox(width: 8),
                      Text(
                        'Nueva conversación',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Lista de sesiones guardadas
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _savedSessions.length,
                itemBuilder: (context, index) {
                  final session = _savedSessions[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 6.0),
                    child: InkWell(
                      onTap: () {
                        Navigator.pop(context);
                        if (session.messages.isNotEmpty) {
                          setState(() {
                            _messages = List.from(session.messages);
                          });
                        }
                      },
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 10),
                        decoration: BoxDecoration(
                          color: const Color(0x4D17171A),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.chat_bubble_outline_rounded,
                              size: 14,
                              color: Color(0xFFA3A3A3),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                session.title,
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFFD4D4D4),
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),

            // Pie del Drawer: Usuario y Configuración
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: const BoxDecoration(
                border: Border(top: BorderSide(color: Color(0xFF262626))),
              ),
              child: Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: const Color(0xFFC2185B),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Center(
                      child: Text(
                        'A',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Usuario Corporativo',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          'soporte.corp@gilsa.com',
                          style: TextStyle(
                            fontSize: 10,
                            color: Color(0xFFA3A3A3),
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(
                      Icons.settings_outlined,
                      size: 18,
                      color: Color(0xFFA3A3A3),
                    ),
                    onPressed: () {
                      Navigator.pop(context);
                      _openConfigDialog();
                    },
                    tooltip: 'Configurar servidor',
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
