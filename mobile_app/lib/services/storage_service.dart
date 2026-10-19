import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/chat_session.dart';
import '../models/task_notification.dart';

class StorageService {
  static const String _keySessions = 'ezbo_mobile_sessions_v1';
  static const String _keyActiveSessionId = 'ezbo_mobile_active_session_id';
  static const String _keyNotifications = 'ezbo_mobile_notifications_v1';
  static const String _keyIsLoggedIn = 'ezbo_mobile_is_logged_in';
  static const String _keyUserEmail = 'ezbo_mobile_user_email';
  static const String _keyUserName = 'ezbo_mobile_user_name';
  static const String _keyUserTier = 'ezbo_mobile_user_tier';

  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  // Auth
  static bool isLoggedIn() {
    return _prefs?.getBool(_keyIsLoggedIn) ?? false;
  }

  static Future<void> setLoggedIn({
    required bool loggedIn,
    String? email,
    String? name,
    String? tier,
  }) async {
    await _prefs?.setBool(_keyIsLoggedIn, loggedIn);
    if (email != null) await _prefs?.setString(_keyUserEmail, email);
    if (name != null) await _prefs?.setString(_keyUserName, name);
    if (tier != null) await _prefs?.setString(_keyUserTier, tier);
  }

  static String getUserEmail() {
    return _prefs?.getString(_keyUserEmail) ?? 'user@ezboagents.com';
  }

  static String getUserName() {
    return _prefs?.getString(_keyUserName) ?? 'Member';
  }

  static String getUserTier() {
    return _prefs?.getString(_keyUserTier) ?? 'byok_pro';
  }

  // Sessions
  static List<ChatSession> loadSessions() {
    final raw = _prefs?.getString(_keySessions);
    if (raw != null && raw.isNotEmpty) {
      try {
        final List<dynamic> list = jsonDecode(raw) as List<dynamic>;
        return list.map((item) => ChatSession.fromJson(item as Map<String, dynamic>)).toList();
      } catch (_) {
        // fallback to default
      }
    }
    return [
      ChatSession(
        id: 'session-default',
        title: 'New Conversation',
        createdAt: DateTime.now().millisecondsSinceEpoch,
        updatedAt: DateTime.now().millisecondsSinceEpoch,
        messages: [
          ChatMessage(
            id: 'welcome-1',
            role: 'assistant',
            content: 'Hello! I am **Ezbo**, your Master AI CEO.\n\nI control all 75 specialized Business & Freelancer AI Helpers. How can I accelerate your business or workflow today?',
            timestamp: _formatTime(DateTime.now()),
          )
        ],
      )
    ];
  }

  static Future<void> saveSessions(List<ChatSession> sessions) async {
    final jsonStr = jsonEncode(sessions.map((s) => s.toJson()).toList());
    await _prefs?.setString(_keySessions, jsonStr);
  }

  static String loadActiveSessionId() {
    return _prefs?.getString(_keyActiveSessionId) ?? 'session-default';
  }

  static Future<void> saveActiveSessionId(String id) async {
    await _prefs?.setString(_keyActiveSessionId, id);
  }

  // Notifications
  static List<TaskNotification> loadNotifications() {
    final raw = _prefs?.getString(_keyNotifications);
    if (raw != null && raw.isNotEmpty) {
      try {
        final List<dynamic> list = jsonDecode(raw) as List<dynamic>;
        return list.map((item) => TaskNotification.fromJson(item as Map<String, dynamic>)).toList();
      } catch (_) {
        // fallback
      }
    }
    return List.from(kStarterNotifications);
  }

  static Future<void> saveNotifications(List<TaskNotification> list) async {
    final jsonStr = jsonEncode(list.map((n) => n.toJson()).toList());
    await _prefs?.setString(_keyNotifications, jsonStr);
  }

  static Future<void> addNotification(TaskNotification notification) async {
    final current = loadNotifications();
    current.insert(0, notification);
    await saveNotifications(current);
  }

  static String _formatTime(DateTime dt) {
    final h = dt.hour > 12 ? dt.hour - 12 : (dt.hour == 0 ? 12 : dt.hour);
    final m = dt.minute.toString().padLeft(2, '0');
    final ampm = dt.hour >= 12 ? 'PM' : 'AM';
    return '$h:$m $ampm';
  }
}
