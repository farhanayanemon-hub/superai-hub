import 'package:flutter/material.dart';
import '../models/agent_tool.dart';
import '../theme/ezbo_theme.dart';
import '../widgets/wave_bottom_nav_bar.dart';
import 'agents/agents_catalog_screen.dart';
import 'chat/ceo_chat_screen.dart';
import 'notifications/notifications_screen.dart';

class MainShell extends StatefulWidget {
  final VoidCallback onLogout;

  const MainShell({
    super.key,
    required this.onLogout,
  });

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentTabIndex = 1; // Middle: Ezbo AI CEO Chat by default
  final GlobalKey<CeoChatScreenState> _chatKey = GlobalKey<CeoChatScreenState>();

  void _handleLaunchAgentFromCatalog(AgentTool agent) {
    _chatKey.currentState?.setPreselectedAgent(agent);
    setState(() {
      _currentTabIndex = 1; // Switch to Chat tab
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: EzboColors.background,
      body: IndexedStack(
        index: _currentTabIndex,
        children: [
          // 0: Left Tab — My Agents (75 AI Specialists)
          AgentsCatalogScreen(
            onLaunchAgent: _handleLaunchAgentFromCatalog,
          ),

          // 1: Middle Tab — Ezbo Master AI CEO Chat
          CeoChatScreen(
            key: _chatKey,
            onLogout: widget.onLogout,
          ),

          // 2: Right Tab — Real-time Task Activity Notifications
          const NotificationsScreen(),
        ],
      ),
      bottomNavigationBar: WaveBottomNavBar(
        selectedIndex: _currentTabIndex,
        onTabSelected: (index) {
          setState(() {
            _currentTabIndex = index;
          });
        },
      ),
    );
  }
}
