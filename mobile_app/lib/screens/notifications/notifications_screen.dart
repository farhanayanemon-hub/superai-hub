import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../models/task_notification.dart';
import '../../services/storage_service.dart';
import '../../theme/ezbo_theme.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<TaskNotification> _notifications = [];
  String _filter = 'all'; // 'all', 'completed', 'running'

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  void _loadNotifications() {
    setState(() {
      _notifications = StorageService.loadNotifications();
    });
  }

  void _clearNotifications() async {
    await StorageService.saveNotifications([]);
    setState(() {
      _notifications = [];
    });
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _notifications.where((n) {
      if (_filter == 'all') return true;
      return n.status.toLowerCase() == _filter;
    }).toList();

    return Scaffold(
      backgroundColor: EzboColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: EzboColors.primaryLight,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.notifications_active_rounded, size: 18, color: EzboColors.primary),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Task Activity',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: EzboColors.navy,
                    letterSpacing: -0.3,
                  ),
                ),
                Text(
                  'Agent Execution Stream',
                  style: TextStyle(
                    fontSize: 10,
                    color: EzboColors.textSecondary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          if (_notifications.isNotEmpty)
            IconButton(
              icon: const Icon(Icons.delete_sweep_outlined, size: 20, color: EzboColors.textSecondary),
              tooltip: 'Clear Log',
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (ctx) => AlertDialog(
                    title: const Text('Clear Task Activity?', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                    content: const Text('This will clear all logged task executions from your device.', style: TextStyle(fontSize: 12)),
                    actions: [
                      TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Cancel')),
                      TextButton(
                        onPressed: () {
                          Navigator.of(ctx).pop();
                          _clearNotifications();
                        },
                        child: const Text('Clear', style: TextStyle(color: EzboColors.rose)),
                      ),
                    ],
                  ),
                );
              },
            ),
        ],
      ),
      body: Column(
        children: [
          // Filter Chips
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            child: Row(
              children: [
                _buildFilterChip('all', 'All (${_notifications.length})'),
                const SizedBox(width: 8),
                _buildFilterChip('completed', 'Completed'),
                const SizedBox(width: 8),
                _buildFilterChip('running', 'Running'),
              ],
            ),
          ),

          // Stream Feed
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.assignment_outlined, size: 40, color: EzboColors.textMuted),
                        const SizedBox(height: 8),
                        const Text(
                          'No recent agent tasks logged',
                          style: TextStyle(fontSize: 13, color: EzboColors.textSecondary),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Instruct Ezbo in the Chat to run automated agent tasks',
                          style: TextStyle(fontSize: 11, color: EzboColors.textMuted),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    itemCount: filtered.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final item = filtered[index];
                      return _buildNotificationCard(item);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String filterId, String label) {
    final isSelected = _filter == filterId;
    return ChoiceChip(
      label: Text(label),
      labelStyle: TextStyle(
        fontSize: 11,
        fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
        color: isSelected ? Colors.white : EzboColors.textSecondary,
      ),
      selected: isSelected,
      selectedColor: EzboColors.primary,
      backgroundColor: EzboColors.background,
      side: BorderSide(color: isSelected ? EzboColors.primary : EzboColors.borderBlue),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      padding: const EdgeInsets.symmetric(horizontal: 6),
      onSelected: (selected) {
        if (selected) setState(() => _filter = filterId);
      },
    );
  }

  Widget _buildNotificationCard(TaskNotification item) {
    final isCompleted = item.status.toLowerCase() == 'completed';

    return InkWell(
      onTap: () => _showTaskDetails(item),
      borderRadius: BorderRadius.circular(18),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: EzboColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Agent Code Badge
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: isCompleted ? EzboColors.emeraldLight : EzboColors.primaryLight,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: isCompleted ? EzboColors.emerald.withValues(alpha: 0.3) : EzboColors.borderBlue),
              ),
              child: Center(
                child: Text(
                  item.agentCode,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w900,
                    color: isCompleted ? EzboColors.emerald : EzboColors.primary,
                    fontFamily: 'monospace',
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          item.agentName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: EzboColors.navy,
                            letterSpacing: -0.2,
                          ),
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: isCompleted ? EzboColors.emeraldLight : EzboColors.primaryLight,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isCompleted ? EzboColors.emerald.withValues(alpha: 0.3) : EzboColors.borderBlue,
                          ),
                        ),
                        child: Text(
                          isCompleted ? 'Done' : 'Active',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                            color: isCompleted ? EzboColors.emerald : EzboColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item.taskSummary,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 11,
                      color: EzboColors.textSecondary,
                      height: 1.35,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        item.timestamp,
                        style: const TextStyle(fontSize: 10, color: EzboColors.textMuted),
                      ),
                      const Row(
                        children: [
                          Text('View Output', style: TextStyle(fontSize: 10, color: EzboColors.primary, fontWeight: FontWeight.w700)),
                          SizedBox(width: 2),
                          Icon(Icons.chevron_right_rounded, size: 14, color: EzboColors.primary),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showTaskDetails(TaskNotification item) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: EzboColors.primaryLight,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        item.agentCode,
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: EzboColors.primary, fontFamily: 'monospace'),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.agentName,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: EzboColors.navy),
                          ),
                          Text(
                            item.timestamp,
                            style: const TextStyle(fontSize: 10, color: EzboColors.textMuted),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, size: 20, color: EzboColors.textSecondary),
                      onPressed: () => Navigator.of(context).pop(),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                const Text(
                  'TASK DIRECTIVE',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: EzboColors.textMuted, letterSpacing: 0.5),
                ),
                const SizedBox(height: 4),
                Text(
                  item.taskSummary,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: EzboColors.navy),
                ),
                if (item.resultPreview != null && item.resultPreview!.isNotEmpty) ...[
                  const SizedBox(height: 14),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'EXECUTION OUTPUT PREVIEW',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: EzboColors.textMuted, letterSpacing: 0.5),
                      ),
                      GestureDetector(
                        onTap: () {
                          Clipboard.setData(ClipboardData(text: item.resultPreview!));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Copied output to clipboard'), backgroundColor: EzboColors.navy),
                          );
                        },
                        child: const Row(
                          children: [
                            Icon(Icons.copy_rounded, size: 12, color: EzboColors.primary),
                            SizedBox(width: 4),
                            Text('Copy', style: TextStyle(fontSize: 11, color: EzboColors.primary, fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: EzboColors.background,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: EzboColors.borderBlue),
                    ),
                    child: Text(
                      item.resultPreview!,
                      style: const TextStyle(fontSize: 11, color: EzboColors.textPrimary, height: 1.4),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }
}
