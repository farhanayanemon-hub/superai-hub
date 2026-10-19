import 'package:flutter/material.dart';
import '../../../models/agent_tool.dart';
import '../../../models/agent_tools_data.dart';
import '../../../theme/ezbo_theme.dart';

class SlashHelpersPopover extends StatelessWidget {
  final String query;
  final ValueChanged<AgentTool> onSelect;
  final VoidCallback onClose;

  const SlashHelpersPopover({
    super.key,
    required this.query,
    required this.onSelect,
    required this.onClose,
  });

  @override
  Widget build(BuildContext context) {
    final cleanQuery = query.replaceAll('/', '').trim().toLowerCase();
    final filtered = kAllAgents.where((a) {
      if (cleanQuery.isEmpty) return true;
      return a.code.toLowerCase().contains(cleanQuery) ||
          a.name.toLowerCase().contains(cleanQuery) ||
          a.agentName.toLowerCase().contains(cleanQuery) ||
          a.categoryName.toLowerCase().contains(cleanQuery);
    }).toList();

    return Container(
      constraints: const BoxConstraints(maxHeight: 280),
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: EzboColors.borderBlue),
        boxShadow: [
          BoxShadow(
            color: EzboColors.navy.withValues(alpha: 0.12),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: const BoxDecoration(
              color: EzboColors.background,
              borderRadius: BorderRadius.vertical(top: Radius.circular(19)),
              border: Border(bottom: BorderSide(color: EzboColors.borderBlue)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.bolt_rounded, size: 16, color: EzboColors.primary),
                    const SizedBox(width: 6),
                    Text(
                      'Select Specialist Helper (${filtered.length})',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                        color: EzboColors.navy,
                      ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: onClose,
                  child: const Icon(Icons.close_rounded, size: 16, color: EzboColors.textSecondary),
                ),
              ],
            ),
          ),

          // List
          Flexible(
            child: ListView.separated(
              shrinkWrap: true,
              padding: const EdgeInsets.symmetric(vertical: 4),
              itemCount: filtered.length,
              separatorBuilder: (context, index) => const Divider(height: 1, color: EzboColors.border, indent: 12, endIndent: 12),
              itemBuilder: (context, index) {
                final tool = filtered[index];
                return InkWell(
                  onTap: () => onSelect(tool),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: EzboColors.primaryLight,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            tool.code,
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w900,
                              color: EzboColors.primary,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                tool.name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: EzboColors.navy,
                                ),
                              ),
                              Text(
                                '${tool.agentName} • ${tool.categoryName}',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 10,
                                  color: EzboColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        if (tool.badge.isNotEmpty)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: EzboColors.background,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: EzboColors.borderBlue),
                            ),
                            child: Text(
                              tool.badge,
                              style: const TextStyle(
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                                color: EzboColors.primary,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
