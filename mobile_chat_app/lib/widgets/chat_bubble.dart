import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/chat_message.dart';

class ChatBubble extends StatefulWidget {
  final ChatMessage message;
  final VoidCallback? onCitationsTap;

  const ChatBubble({
    Key? key,
    required this.message,
    this.onCitationsTap,
  }) : super(key: key);

  @override
  State<ChatBubble> createState() => _ChatBubbleState();
}

class _ChatBubbleState extends State<ChatBubble> {
  bool _citationsExpanded = false;

  @override
  Widget build(BuildContext context) {
    final msg = widget.message;
    final isCustomer = msg.sender == MessageSender.customer;
    final isEscalated = msg.sender == MessageSender.l2 ||
        (msg.ticketId != null && msg.resolvedByAi == false);
    final timeStr = DateFormat('HH:mm').format(msg.timestamp);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment:
            isCustomer ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        children: [
          // Cabecera superior del mensaje con remitente, badge e icono
          Padding(
            padding: const EdgeInsets.only(left: 4, right: 4, bottom: 5),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (isCustomer) ...[
                  Text(
                    timeStr,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFFA3A3A3),
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Text(
                    'Tú',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFFE5E5E5),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    width: 18,
                    height: 18,
                    decoration: BoxDecoration(
                      color: const Color(0xFF262626),
                      borderRadius: BorderRadius.circular(9),
                    ),
                    child: const Icon(
                      Icons.person_outline,
                      size: 11,
                      color: Color(0xFFA3A3A3),
                    ),
                  ),
                ] else if (isEscalated) ...[
                  Container(
                    width: 18,
                    height: 18,
                    decoration: BoxDecoration(
                      color: const Color(0xFF262626),
                      borderRadius: BorderRadius.circular(9),
                    ),
                    child: const Icon(
                      Icons.headset_mic_outlined,
                      size: 11,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    msg.assignedAgent ?? 'Soporte Nivel 2',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                    decoration: BoxDecoration(
                      color: const Color(0xFF171717),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: const Color(0xFF404040)),
                    ),
                    child: const Text(
                      'HUMANO L2',
                      style: TextStyle(
                        fontSize: 9,
                        fontFamily: 'monospace',
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Text(
                    '•',
                    style: TextStyle(fontSize: 10, color: Color(0xFF737373)),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    timeStr,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFFA3A3A3),
                    ),
                  ),
                ] else ...[
                  Container(
                    width: 18,
                    height: 18,
                    decoration: BoxDecoration(
                      color: const Color(0xFF262626),
                      borderRadius: BorderRadius.circular(9),
                    ),
                    child: const Icon(
                      Icons.smart_toy_outlined,
                      size: 11,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Text(
                    'Agente L1 Autónomo',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                    decoration: BoxDecoration(
                      color: const Color(0xFF171717),
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: const Color(0xFF262626)),
                    ),
                    child: const Text(
                      'IA RAG',
                      style: TextStyle(
                        fontSize: 9,
                        fontFamily: 'monospace',
                        color: Color(0xFFD4D4D4),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Text(
                    '•',
                    style: TextStyle(fontSize: 10, color: Color(0xFF737373)),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    timeStr,
                    style: const TextStyle(
                      fontSize: 11,
                      color: Color(0xFFA3A3A3),
                    ),
                  ),
                ],
              ],
            ),
          ),

          // Contenedor principal de la burbuja (estilo glass translúcido sin bordes duros)
          Container(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.84,
            ),
            decoration: BoxDecoration(
              color: isCustomer
                  ? const Color(0xB32B2D31)
                  : const Color(0x8C111317),
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(20),
                topRight: const Radius.circular(20),
                bottomLeft: Radius.circular(isCustomer ? 20 : 6),
                bottomRight: Radius.circular(isCustomer ? 6 : 20),
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.35),
                  blurRadius: 16,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Texto del Mensaje
                Text(
                  msg.text,
                  style: TextStyle(
                    color: isCustomer ? Colors.white : const Color(0xFFE5E5E5),
                    fontSize: 13,
                    height: 1.45,
                    fontWeight: FontWeight.w400,
                  ),
                ),

                // Badge de Ticket Escalado a L2
                if (msg.ticketId != null && isEscalated) ...[
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(
                              Icons.warning_amber_rounded,
                              size: 14,
                              color: Colors.white,
                            ),
                            const SizedBox(width: 6),
                            const Text(
                              'Ticket derivado a cola humana: ',
                              style: TextStyle(
                                fontSize: 11,
                                color: Color(0xFFA3A3A3),
                              ),
                            ),
                            Text(
                              msg.ticketId!,
                              style: const TextStyle(
                                fontSize: 11,
                                fontFamily: 'monospace',
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        const Text(
                          'Prioridad Alta',
                          style: TextStyle(
                            fontSize: 10,
                            color: Color(0xFF737373),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                // Citas de Fuentes RAG con acordeón desplegable
                if (!isCustomer && msg.citations.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  InkWell(
                    onTap: () {
                      setState(() {
                        _citationsExpanded = !_citationsExpanded;
                      });
                    },
                    borderRadius: BorderRadius.circular(8),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.description_outlined,
                            size: 13,
                            color: Color(0xFFA3A3A3),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            '${msg.citations.length} Fuente${msg.citations.length > 1 ? "s" : ""} consultada${msg.citations.length > 1 ? "s" : ""} en la Base de Conocimiento',
                            style: const TextStyle(
                              fontSize: 11,
                              color: Color(0xFFA3A3A3),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Icon(
                            _citationsExpanded
                                ? Icons.keyboard_arrow_up_rounded
                                : Icons.keyboard_arrow_down_rounded,
                            size: 15,
                            color: const Color(0xFFA3A3A3),
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (_citationsExpanded) ...[
                    const SizedBox(height: 8),
                    Column(
                      children: msg.citations.map((cite) {
                        return Container(
                          margin: const EdgeInsets.only(bottom: 6),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: const Color(0x9917171A),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      cite.documentName,
                                      style: const TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                        fontFamily: 'monospace',
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  Text(
                                    'Relevancia: ${(cite.relevanceScore * 100).toInt()}%',
                                    style: const TextStyle(
                                      fontSize: 10,
                                      fontFamily: 'monospace',
                                      color: Color(0xFFD4D4D4),
                                    ),
                                  ),
                                ],
                              ),
                              if (cite.excerpt.isNotEmpty) ...[
                                const SizedBox(height: 6),
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withOpacity(0.4),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    '"${cite.excerpt}"',
                                    style: const TextStyle(
                                      fontSize: 10,
                                      fontStyle: FontStyle.italic,
                                      color: Color(0xFFA3A3A3),
                                      height: 1.3,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
