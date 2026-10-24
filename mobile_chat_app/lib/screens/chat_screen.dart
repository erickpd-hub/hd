import 'package:flutter/material.dart';
import '../models/chat_message.dart';
import '../services/chat_api_service.dart';
import '../widgets/chat_bubble.dart';
import '../widgets/citation_card.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({Key? key}) : super(key: key);

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final ChatApiService _apiService = ChatApiService();

  final List<ChatMessage> _messages = [];
  bool _isLoading = false;
  String? _currentTicketId;

  final List<String> _suggestedPrompts = [
    'Bloqueo de clave Windows y falla de red',
    'Rechazo de factura CFDI en SAP ERP',
    'Error en pasarela de pago y POS Magento',
    'Trazabilidad de despacho y bodega en Sigo',
  ];

  @override
  void initState() {
    super.initState();
    _messages.add(
      ChatMessage(
        id: 'init-msg',
        sender: MessageSender.ai,
        text:
            'Portal de Usuarios - Soporte L1 Autónomo.\nPuedes consultar incidencias sobre Infraestructura, SAP, Magento o Sigo.',
        timestamp: DateTime.now(),
        resolvedByAi: true,
      ),
    );
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
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
    } catch (e) {
      setState(() {
        _messages.add(
          ChatMessage(
            id: 'err-${DateTime.now().millisecondsSinceEpoch}',
            sender: MessageSender.ai,
            text:
                'Ocurrió un error de comunicación con el servicio central. Intenta nuevamente.',
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

  void _openConfigDialog() {
    final urlController = TextEditingController(text: _apiService.baseUrl);
    final tenantController = TextEditingController(text: _apiService.tenantId);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF0F0F0F),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14),
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
                fillColor: const Color(0xFF171717),
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
                fillColor: const Color(0xFF171717),
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
              backgroundColor: const Color(0xFF1F1F1F),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
                side: const BorderSide(color: Color(0xFF404040)),
              ),
            ),
            onPressed: () {
              setState(() {
                _apiService.baseUrl = urlController.text.trim();
                _apiService.tenantId = tenantController.text.trim();
              });
              Navigator.pop(ctx);
            },
            child: const Text('Guardar', style: TextStyle(fontSize: 12)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0A0A),
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(
            color: const Color(0xFF262626),
            height: 1.0,
          ),
        ),
        title: Row(
          children: [
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: const Color(0xFF171717),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: const Color(0xFF333333)),
              ),
              child: const Icon(
                Icons.support_agent_outlined,
                size: 16,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Portal de Soporte Usuario',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
                Text(
                  _currentTicketId != null
                      ? 'Ticket Activo: $_currentTicketId'
                      : 'Agente L1 Autónomo Activo',
                  style: const TextStyle(
                    fontSize: 10,
                    fontFamily: 'monospace',
                    color: Color(0xFFA3A3A3),
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings_ethernet_rounded,
                size: 18, color: Color(0xFFA3A3A3)),
            onPressed: _openConfigDialog,
            tooltip: 'Configurar Endpoint',
          ),
        ],
      ),
      body: Column(
        children: [
          // Banner de sugerencias si la conversacion apenas inicia
          if (_messages.length <= 1)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              color: const Color(0xFF0F0F0F),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Consultas Frecuentes:',
                    style: TextStyle(
                      fontSize: 11,
                      fontFamily: 'monospace',
                      color: Color(0xFF737373),
                    ),
                  ),
                  const SizedBox(height: 6),
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: _suggestedPrompts.map((prompt) {
                        return Padding(
                          padding: const EdgeInsets.only(right: 8.0),
                          child: InkWell(
                            onTap: () => _handleSendMessage(prompt),
                            borderRadius: BorderRadius.circular(6),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 10, vertical: 6),
                              decoration: BoxDecoration(
                                color: const Color(0xFF171717),
                                borderRadius: BorderRadius.circular(6),
                                border:
                                    Border.all(color: const Color(0xFF262626)),
                              ),
                              child: Text(
                                prompt,
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFFCCCCCC),
                                ),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),
            ),

          // Lista de Mensajes
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(vertical: 10),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return ChatBubble(
                  message: message,
                  onCitationsTap: () {
                    showModalBottomSheet(
                      context: context,
                      backgroundColor: Colors.transparent,
                      isScrollControlled: true,
                      builder: (ctx) => CitationsBottomSheet(
                        citations: message.citations,
                      ),
                    );
                  },
                );
              },
            ),
          ),

          // Indicador de Carga
          if (_isLoading)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
              alignment: Alignment.centerLeft,
              child: const Row(
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
                    'Agente L1 analizando RAG y clasificando...',
                    style: TextStyle(
                      fontSize: 11,
                      color: Color(0xFF737373),
                      fontFamily: 'monospace',
                    ),
                  ),
                ],
              ),
            ),

          // Input Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: const BoxDecoration(
              color: Color(0xFF0A0A0A),
              border: Border(top: BorderSide(color: Color(0xFF262626))),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF141414),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: const Color(0xFF262626)),
                      ),
                      child: TextField(
                        controller: _inputController,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                        ),
                        maxLines: null,
                        keyboardType: TextInputType.multiline,
                        textInputAction: TextInputAction.send,
                        onSubmitted: (_) => _handleSendMessage(),
                        decoration: const InputDecoration(
                          hintText: 'Describe tu incidencia o consulta...',
                          hintStyle: TextStyle(
                            color: Color(0xFF555555),
                            fontSize: 12,
                          ),
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 10,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: const Color(0xFF1F1F1F),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF333333)),
                    ),
                    child: IconButton(
                      icon: const Icon(
                        Icons.send_rounded,
                        size: 16,
                        color: Colors.white,
                      ),
                      onPressed: () => _handleSendMessage(),
                      padding: EdgeInsets.zero,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
