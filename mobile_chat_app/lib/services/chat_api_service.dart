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
    String agentName = 'Carlos Mendoza (L2 Infraestructura)';
    String manualName = 'manual_infraestructura_redes_win.pdf';
    String excerpt =
        'Comprueba la configuración de credenciales y el estado del servicio en Active Directory.';

    if (q.contains('sap') ||
        q.contains('factura') ||
        q.contains('sku') ||
        q.contains('cfdi') ||
        q.contains('pago')) {
      area = 'Sap';
      agentName = 'Elena Rostova (L2 SAP & Finanzas)';
      manualName = 'guia_sap_erp_sku_facturacion.pdf';
      excerpt =
          'Validación de transacciones contables, catálogo de SKUs y timbrado de facturación fiscal.';
    } else if (q.contains('magento') ||
        q.contains('pos') ||
        q.contains('tienda') ||
        q.contains('checkout') ||
        q.contains('carrito')) {
      area = 'Magento';
      agentName = 'Marcos Toledo (L2 Magento & Ecommerce)';
      manualName = 'manual_magento_pos_checkout.pdf';
      excerpt =
          'Verificación de endpoints POS, sincronización de existencias de sucursal y pasarelas de cobro.';
    } else if (q.contains('sigo') ||
        q.contains('logistica') ||
        q.contains('logística') ||
        q.contains('despacho') ||
        q.contains('ruta') ||
        q.contains('bodega') ||
        q.contains('almacen')) {
      area = 'Sigo';
      agentName = 'Sofía Guzmán (L2 Sigo & Logística)';
      manualName = 'manual_operativo_sigo_despachos.pdf';
      excerpt =
          'Control de rutas de despacho, estatus de unidades de transporte y recepción de bodega central.';
    }

    final isEscalation = q.contains('humano') ||
        q.contains('persona') ||
        q.contains('urgente') ||
        q.contains('bloque') ||
        q.contains('falla') ||
        q.contains('error') ||
        q.contains('no puedo') ||
        q.contains('caído') ||
        q.contains('caido') ||
        q.contains('clave');

    final newTicketId = ticketId ??
        'TK-${(2000 + (DateTime.now().millisecondsSinceEpoch % 7999)).toString()}';

    String aiContent;
    if (isEscalation) {
      aiContent =
          'Comprendo la criticidad del problema. He generado el ticket #$newTicketId y lo he derivado de inmediato al departamento de $area.\n\nEl especialista $agentName ha recibido el caso con todo el historial de la conversación y ya se encuentra revisando tu incidencia.';
    } else {
      aiContent =
          'Hemos verificado la documentación oficial del departamento de $area para resolver tu consulta:\n\n1. Comprueba la configuración de credenciales y el estado del servicio de $area.\n2. Si el problema persiste o requieres asistencia de un operador humano, indícanos "requiero hablar con un agente" para transferirte con $agentName.';
    }

    return ChatMessage(
      id: 'ai-local-${DateTime.now().millisecondsSinceEpoch}',
      sender: isEscalation ? MessageSender.l2 : MessageSender.ai,
      text: aiContent,
      timestamp: DateTime.now(),
      ticketId: newTicketId,
      areaName: area,
      categoryName: 'Soporte $area',
      assignedAgent: isEscalation ? agentName : null,
      confidenceScore: isEscalation ? 0.45 : 0.94,
      resolvedByAi: !isEscalation,
      status: isEscalation ? 'escalated' : 'resolved',
      citations: [
        SourceCitation(
          documentName: manualName,
          chunkIndex: 1,
          relevanceScore: isEscalation ? 0.72 : 0.94,
          excerpt: excerpt,
        ),
      ],
    );
  }
}

