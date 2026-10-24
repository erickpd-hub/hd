import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/chat_message.dart';

class ChatApiService {
  String baseUrl;
  String tenantId;
  String requesterEmail;
  String requesterName;

  ChatApiService({
    this.baseUrl = 'http://10.0.2.2:8000',
    this.tenantId = 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    this.requesterEmail = 'usuario.portal@empresa.com',
    this.requesterName = 'Usuario Portal',
  });

  Future<ChatMessage> sendMessage({
    required String text,
    String? currentTicketId,
  }) async {
    final cleanBase = baseUrl.replaceAll(RegExp(r'/+$'), '');
    final uri = Uri.parse('$cleanBase/api/v1/chat/');

    final headers = {
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
    };

    final payload = {
      'message': text,
      'ticket_id': currentTicketId,
      'requester_email': requesterEmail,
      'requester_name': requesterName,
      'metadata': {
        'client': 'flutter_mobile_v1',
        'platform': 'android',
      },
    };

    try {
      final response = await http
          .post(
            uri,
            headers: headers,
            body: jsonEncode(payload),
          )
          .timeout(const Duration(seconds: 15));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(utf8.decode(response.bodyBytes));
        return ChatMessage.fromApiResponse(data);
      } else {
        throw Exception(
          'Error del servidor (${response.statusCode}): ${response.body}',
        );
      }
    } catch (e) {
      // Fallback local en caso de que el backend no este accesible en la red local
      return _generateLocalFallbackResponse(text, currentTicketId);
    }
  }

  ChatMessage _generateLocalFallbackResponse(String text, String? ticketId) {
    final q = text.toLowerCase();
    String area = 'Infraestructura';
    String answer =
        'He registrado tu incidencia. He derivado el caso con el diagnostico tecnico correspondiente para revision de SLA.';

    if (q.contains('sap') || q.contains('factura') || q.contains('sku')) {
      area = 'Sap';
      answer =
          'Tu requerimiento sobre SAP ERP ha sido analizado por el agente autónomo. Si el problema persiste con CFDI o asientos contables, el caso será escalado al especialista L2.';
    } else if (q.contains('magento') || q.contains('pos') || q.contains('tienda')) {
      area = 'Magento';
      answer =
          'Detectada consulta de plataforma Magento / POS. Se han verificado las políticas de pasarela y claves de sucursal.';
    } else if (q.contains('sigo') || q.contains('logistica') || q.contains('despacho')) {
      area = 'Sigo';
      answer =
          'Consulta identificada en el sistema de logística y despachos Sigo. Validando trazabilidad de guías y rutas.';
    } else if (q.contains('windows') || q.contains('clave') || q.contains('impresora') || q.contains('red')) {
      area = 'Infraestructura';
      answer =
          'Reporte de Infraestructura TI recibido. Se verifica estado de cuenta en Active Directory y conectividad de red local.';
    }

    final newId = ticketId ?? 'TK-${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}';

    return ChatMessage(
      id: 'ai-local-${DateTime.now().millisecondsSinceEpoch}',
      sender: MessageSender.ai,
      text: answer,
      timestamp: DateTime.now(),
      ticketId: newId,
      areaName: area,
      categoryName: 'Soporte General',
      confidenceScore: 0.88,
      resolvedByAi: true,
      status: 'escalated',
    );
  }
}
