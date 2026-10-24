import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/chat_message.dart';

class ChatBubble extends StatelessWidget {
  final ChatMessage message;
  final VoidCallback? onCitationsTap;

  const ChatBubble({
    Key? key,
    required this.message,
    this.onCitationsTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isCustomer = message.sender == MessageSender.customer;
    final timeStr = DateFormat('HH:mm').format(message.timestamp);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        mainAxisAlignment:
            isCustomer ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isCustomer) ...[
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: const Color(0xFF171717),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFF262626)),
              ),
              child: const Icon(
                Icons.smart_toy_outlined,
                size: 16,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 10),
          ],
          Flexible(
            child: Container(
              constraints: const BoxConstraints(maxWidth: 320),
              decoration: BoxDecoration(
                color: isCustomer
                    ? const Color(0xFF1F1F1F)
                    : const Color(0xFF0F0F0F),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: isCustomer
                      ? const Color(0xFF333333)
                      : const Color(0xFF262626),
                ),
              ),
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Badges de Metadatos
                  if (!isCustomer &&
                      (message.areaName != null || message.ticketId != null))
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8.0),
                      child: Wrap(
                        spacing: 6,
                        runSpacing: 4,
                        children: [
                          if (message.ticketId != null)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF171717),
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(
                                    color: const Color(0xFF262626)),
                              ),
                              child: Text(
                                message.ticketId!,
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontFamily: 'monospace',
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          if (message.areaName != null)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF171717),
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(
                                    color: const Color(0xFF262626)),
                              ),
                              child: Text(
                                message.areaName!.toUpperCase(),
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontFamily: 'monospace',
                                  color: Color(0xFFA3A3A3),
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ),
                          if (message.confidenceScore != null)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFF171717),
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(
                                    color: const Color(0xFF262626)),
                              ),
                              child: Text(
                                '${(message.confidenceScore! * 100).toInt()}% CONF',
                                style: const TextStyle(
                                  fontSize: 10,
                                  fontFamily: 'monospace',
                                  color: Color(0xFF737373),
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),

                  // Texto del Mensaje
                  Text(
                    message.text,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      height: 1.4,
                    ),
                  ),

                  // Boton de Fuentes / Citas si existen
                  if (!isCustomer && message.citations.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    InkWell(
                      onTap: onCitationsTap,
                      borderRadius: BorderRadius.circular(6),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF171717),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: const Color(0xFF262626)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.description_outlined,
                              size: 13,
                              color: Color(0xFFA3A3A3),
                            ),
                            const SizedBox(width: 5),
                            Text(
                              '${message.citations.length} fuentes consultadas',
                              style: const TextStyle(
                                fontSize: 11,
                                color: Color(0xFFA3A3A3),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],

                  // Timestamp
                  const SizedBox(height: 6),
                  Align(
                    alignment: Alignment.bottomRight,
                    child: Text(
                      timeStr,
                      style: const TextStyle(
                        fontSize: 10,
                        color: Color(0xFF737373),
                        fontFamily: 'monospace',
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (isCustomer) ...[
            const SizedBox(width: 10),
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: const Color(0xFF1F1F1F),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFF333333)),
              ),
              child: const Icon(
                Icons.person_outline,
                size: 16,
                color: Colors.white,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
