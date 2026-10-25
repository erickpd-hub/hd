import 'citation.dart';

enum MessageSender { customer, ai, l2 }

class ChatMessage {
  final String id;
  final MessageSender sender;
  final String text;
  final DateTime timestamp;
  final String? ticketId;
  final String? areaName;
  final String? categoryName;
  final String? assignedAgent;
  final double? confidenceScore;
  final bool resolvedByAi;
  final String? status;
  final List<SourceCitation> citations;

  ChatMessage({
    required this.id,
    required this.sender,
    required this.text,
    required this.timestamp,
    this.ticketId,
    this.areaName,
    this.categoryName,
    this.assignedAgent,
    this.confidenceScore,
    this.resolvedByAi = false,
    this.status,
    this.citations = const [],
  });

  factory ChatMessage.fromApiResponse(Map<String, dynamic> json) {
    var rawCitations = json['citations'] as List? ?? [];
    List<SourceCitation> parsedCitations = rawCitations
        .map((c) => SourceCitation.fromJson(c as Map<String, dynamic>))
        .toList();

    final isEscalated = json['status'] == 'escalated' ||
        json['resolved_by_ai'] == false ||
        (json['ticket_id'] != null && json['area_name'] != null);

    return ChatMessage(
      id: 'ai-${DateTime.now().millisecondsSinceEpoch}',
      sender: isEscalated ? MessageSender.l2 : MessageSender.ai,
      text: json['response'] ?? 'Respuesta procesada.',
      timestamp: DateTime.now(),
      ticketId: json['ticket_id']?.toString(),
      areaName: json['area_name'],
      categoryName: json['category_name'],
      assignedAgent: json['assigned_agent'] ??
          (isEscalated ? 'Soporte Especialista L2' : null),
      confidenceScore: (json['confidence_score'] as num?)?.toDouble(),
      resolvedByAi: json['resolved_by_ai'] ?? !isEscalated,
      status: json['status'],
      citations: parsedCitations,
    );
  }
}

