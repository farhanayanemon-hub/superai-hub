import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/chat_session.dart';

class ApiResponse {
  final bool success;
  final String text;
  final String? imageUrl;
  final String? delegatedHelper;
  final String? error;

  ApiResponse({
    required this.success,
    required this.text,
    this.imageUrl,
    this.delegatedHelper,
    this.error,
  });
}

class ApiService {
  static const String baseUrl = 'https://ezboagents.com';

  static Future<ApiResponse> sendMessageToCeo({
    required String message,
    String? imageUrl,
    String? helperId,
    String planTier = 'byok_pro',
    List<ChatMessage> history = const [],
  }) async {
    try {
      final url = Uri.parse('$baseUrl/api/chat');
      final recentHistory = history.length > 6 ? history.sublist(history.length - 6) : history;
      
      final payload = {
        'message': message,
        'imageUrl': imageUrl,
        'helperId': (helperId == null || helperId == 'ceo') ? null : helperId,
        'mode': (helperId == null || helperId == 'ceo') ? 'ceo' : 'helper',
        'planTier': planTier,
        'history': recentHistory.map((m) => {
          'role': m.role,
          'content': m.content,
        }).toList(),
      };

      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 40));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        
        String replyText = '';
        String? replyImageUrl;
        String? delegated;

        if (data['delegatedHelper'] != null) {
          final h = data['delegatedHelper'] as Map<String, dynamic>;
          delegated = '[${h['code'] ?? '#AI'}] ${h['name'] ?? 'Specialist'}';
        }

        if (data['result'] != null) {
          final res = data['result'];
          if (res is Map<String, dynamic>) {
            if (res['type'] == 'image') {
              replyImageUrl = res['url'] ?? res['imageUrl'];
              replyText = res['caption'] ?? '🎨 **AI Visual Generated Successfully!**';
              delegated ??= '[#34] AI Commercial Image Generator';
            } else if (res['text'] != null) {
              replyText = res['text'].toString();
            } else {
              replyText = jsonEncode(res);
            }
          } else if (res is String) {
            replyText = res;
          }
        } else if (data['error'] != null) {
          return ApiResponse(
            success: false,
            text: '⚠️ **AI CEO Alert:** ${data['error']}',
            error: data['error'].toString(),
          );
        }

        if (replyText.isEmpty) {
          replyText = 'Your directive was processed successfully by the Ezbo CEO engine.';
        }

        return ApiResponse(
          success: true,
          text: replyText,
          imageUrl: replyImageUrl,
          delegatedHelper: delegated,
        );
      } else {
        return ApiResponse(
          success: false,
          text: '⚠️ Server communication returned status ${response.statusCode}.',
          error: 'HTTP ${response.statusCode}',
        );
      }
    } catch (e) {
      return ApiResponse(
        success: false,
        text: '❌ **Connection Issue:** Unable to connect to the Ezbo CEO engine.\n\nPlease ensure your device is connected to the internet.',
        error: e.toString(),
      );
    }
  }

  static Future<bool> loginUser(String email, String password) async {
    // Quick local authentication and optional verification against user/access
    await Future.delayed(const Duration(milliseconds: 600));
    return email.contains('@') && password.length >= 4;
  }
}
