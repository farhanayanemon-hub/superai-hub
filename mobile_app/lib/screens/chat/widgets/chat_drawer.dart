import 'package:flutter/material.dart';
import '../../../models/chat_session.dart';
import '../../../services/storage_service.dart';
import '../../../theme/ezbo_theme.dart';
import '../../channels/channels_webview_screen.dart';

class ChatDrawer extends StatelessWidget {
  final List<ChatSession> sessions;
  final String activeSessionId;
  final ValueChanged<String> onSelectSession;
  final VoidCallback onNewChat;
  final ValueChanged<String> onDeleteSession;
  final VoidCallback onLogout;

  const ChatDrawer({
    super.key,
    required this.sessions,
    required this.activeSessionId,
    required this.onSelectSession,
    required this.onNewChat,
    required this.onDeleteSession,
    required this.onLogout,
  });

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return Drawer(
      backgroundColor: Colors.white,
      elevation: 16,
      child: Column(
        children: [
          // Header
          Container(
            padding: EdgeInsets.only(top: topPadding + 16, left: 16, right: 16, bottom: 16),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(bottom: BorderSide(color: EzboColors.border)),
            ),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: EzboColors.background,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: EzboColors.borderBlue),
                  ),
                  child: Image.asset(
                    'assets/images/ezbo-ceo.png',
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) => const Icon(Icons.bolt, color: EzboColors.primary),
                  ),
                ),
                const SizedBox(width: 10),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Ezbo AI Console',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: EzboColors.navy,
                          letterSpacing: -0.3,
                        ),
                      ),
                      Text(
                        'History & Channels',
                        style: TextStyle(
                          fontSize: 10,
                          color: EzboColors.textSecondary,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded, size: 20, color: EzboColors.textSecondary),
                  onPressed: () => Navigator.of(context).pop(),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                ),
              ],
            ),
          ),

          // Actions: New Chat & Connect Channels
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Column(
              children: [
                // 1. New Chat Button
                InkWell(
                  onTap: () {
                    Navigator.of(context).pop();
                    onNewChat();
                  },
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 14),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [EzboColors.primary, EzboColors.primaryDark],
                      ),
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: EzboColors.primary.withValues(alpha: 0.28),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.add_rounded, color: Colors.white, size: 18),
                        SizedBox(width: 6),
                        Text(
                          'New Chat',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.2,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                // 2. Connect Channels Button
                InkWell(
                  onTap: () {
                    Navigator.of(context).pop();
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => const ChannelsWebviewScreen()),
                    );
                  },
                  borderRadius: BorderRadius.circular(14),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                    decoration: BoxDecoration(
                      color: EzboColors.background,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: EzboColors.borderBlue),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: EzboColors.emerald,
                          ),
                        ),
                        const SizedBox(width: 10),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '⚡ Connect Channels',
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w800,
                                  color: EzboColors.navy,
                                ),
                              ),
                              Text(
                                'WhatsApp & Telegram',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: EzboColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: EzboColors.primary),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Divider and Section Title
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'CONVERSATIONS',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.8,
                    color: EzboColors.textMuted,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                  decoration: BoxDecoration(
                    color: EzboColors.background,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    '${sessions.length}',
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: EzboColors.primary,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Sessions List
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              itemCount: sessions.length,
              separatorBuilder: (context, index) => const SizedBox(height: 4),
              itemBuilder: (context, index) {
                final s = sessions[index];
                final isActive = s.id == activeSessionId;

                return InkWell(
                  onTap: () {
                    Navigator.of(context).pop();
                    onSelectSession(s.id);
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: isActive ? EzboColors.primaryLight : Colors.transparent,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isActive ? EzboColors.primary.withValues(alpha: 0.3) : Colors.transparent,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.chat_bubble_outline_rounded,
                          size: 16,
                          color: isActive ? EzboColors.primary : EzboColors.textSecondary,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            s.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: isActive ? FontWeight.w800 : FontWeight.w600,
                              color: isActive ? EzboColors.primary : EzboColors.navy,
                            ),
                          ),
                        ),
                        if (sessions.length > 1)
                          IconButton(
                            icon: const Icon(Icons.delete_outline_rounded, size: 16, color: EzboColors.textMuted),
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(minWidth: 24, minHeight: 24),
                            onPressed: () => onDeleteSession(s.id),
                            tooltip: 'Delete Chat',
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // User Profile Footer
          Container(
            padding: EdgeInsets.only(left: 16, right: 16, top: 12, bottom: bottomPadding + 12),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: EzboColors.border)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 16,
                  backgroundColor: EzboColors.primaryLight,
                  child: Text(
                    StorageService.getUserName().isNotEmpty ? StorageService.getUserName()[0].toUpperCase() : 'U',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: EzboColors.primary),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        StorageService.getUserName(),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: EzboColors.navy),
                      ),
                      Text(
                        StorageService.getUserEmail(),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 10, color: EzboColors.textMuted),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.logout_rounded, size: 18, color: EzboColors.rose),
                  onPressed: onLogout,
                  tooltip: 'Sign Out',
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
