import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/models/agent_tools_data.dart';
import 'package:mobile_app/models/chat_session.dart';
import 'package:mobile_app/models/task_notification.dart';
import 'package:mobile_app/services/storage_service.dart';
import 'package:mobile_app/widgets/wave_bottom_nav_bar.dart';

void main() {
  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    await StorageService.init();
  });

  group('Ezbo Mobile Core Tests', () {
    test('All 75 AI Helpers are properly defined with required fields', () {
      expect(kAllAgents.length, equals(75));
      for (final agent in kAllAgents) {
        expect(agent.id, isNotEmpty);
        expect(agent.code, startsWith('#'));
        expect(agent.name, isNotEmpty);
        expect(agent.agentName, isNotEmpty);
        expect(agent.category, isNotEmpty);
      }
    });

    test('ChatSession and ChatMessage serialization roundtrip', () {
      final msg = ChatMessage(
        id: 'msg-test-1',
        role: 'user',
        content: 'Generate ad copy for my brand',
        timestamp: '10:30 AM',
      );

      final session = ChatSession(
        id: 'session-test',
        title: 'Ad Copy Campaign',
        createdAt: 1000,
        updatedAt: 2000,
        messages: [msg],
      );

      final json = session.toJson();
      final revived = ChatSession.fromJson(json);

      expect(revived.id, equals('session-test'));
      expect(revived.title, equals('Ad Copy Campaign'));
      expect(revived.messages.length, equals(1));
      expect(revived.messages.first.content, equals('Generate ad copy for my brand'));
    });

    test('TaskNotification serialization and defaults', () {
      expect(kStarterNotifications.length, greaterThanOrEqualTo(4));
      final notif = kStarterNotifications.first;
      final json = notif.toJson();
      final revived = TaskNotification.fromJson(json);

      expect(revived.id, equals(notif.id));
      expect(revived.agentCode, equals(notif.agentCode));
      expect(revived.status, equals('completed'));
    });

    testWidgets('WaveBottomNavBar renders all 3 tabs properly', (WidgetTester tester) async {
      int selected = 1;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            bottomNavigationBar: WaveBottomNavBar(
              selectedIndex: selected,
              onTabSelected: (idx) => selected = idx,
            ),
          ),
        ),
      );

      expect(find.text('My Agents'), findsOneWidget);
      expect(find.text('Ezbo'), findsOneWidget);
      expect(find.text('Activity'), findsOneWidget);
      expect(find.byType(WaveBottomNavBar), findsOneWidget);
    });

    testWidgets('EzboApp builds without crashing', (WidgetTester tester) async {
      await tester.pumpWidget(const EzboApp());
      expect(find.byType(MaterialApp), findsOneWidget);
    });
  });
}
