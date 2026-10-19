import 'package:flutter/material.dart';
import '../../models/agent_tool.dart';
import '../../models/agent_tools_data.dart';
import '../../theme/ezbo_theme.dart';

class AgentsCatalogScreen extends StatefulWidget {
  final ValueChanged<AgentTool> onLaunchAgent;

  const AgentsCatalogScreen({
    super.key,
    required this.onLaunchAgent,
  });

  @override
  State<AgentsCatalogScreen> createState() => _AgentsCatalogScreenState();
}

class _AgentsCatalogScreenState extends State<AgentsCatalogScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'all';
  String _searchQuery = '';

  static const List<Map<String, String>> _categories = [
    {'id': 'all', 'label': 'All 75'},
    {'id': 'ads_marketing', 'label': 'Ads & Marketing'},
    {'id': 'social_media', 'label': 'Social Media'},
    {'id': 'writing_content', 'label': 'Writing'},
    {'id': 'image_video', 'label': 'Image & Logo'},
    {'id': 'seo_web', 'label': 'SEO'},
    {'id': 'personal_growth', 'label': 'Personal Growth'},
    {'id': 'business_automation', 'label': 'Automation'},
  ];

  @override
  Widget build(BuildContext context) {
    final filtered = kAllAgents.where((agent) {
      if (_selectedCategory != 'all' && agent.category != _selectedCategory) {
        return false;
      }
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final match = agent.code.toLowerCase().contains(q) ||
            agent.name.toLowerCase().contains(q) ||
            agent.agentName.toLowerCase().contains(q) ||
            agent.description.toLowerCase().contains(q);
        if (!match) return false;
      }
      return true;
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
              child: const Icon(Icons.grid_view_rounded, size: 18, color: EzboColors.primary),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'My Agents',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                    color: EzboColors.navy,
                    letterSpacing: -0.3,
                  ),
                ),
                Text(
                  '75 Specialized AI Specialists',
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
      ),
      body: Column(
        children: [
          // Search & Filter Header
          Container(
            color: Colors.white,
            padding: const EdgeInsets.only(left: 14, right: 14, bottom: 10, top: 4),
            child: Column(
              children: [
                // Search Field
                Container(
                  height: 42,
                  decoration: BoxDecoration(
                    color: EzboColors.surfaceMuted,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: EzboColors.borderBlue),
                  ),
                  child: TextField(
                    controller: _searchController,
                    onChanged: (val) => setState(() => _searchQuery = val.trim()),
                    style: const TextStyle(fontSize: 13, color: EzboColors.navy),
                    decoration: InputDecoration(
                      hintText: 'Search 75 agents (e.g. #01, Ads, SEO)...',
                      hintStyle: const TextStyle(fontSize: 12, color: EzboColors.textMuted),
                      prefixIcon: const Icon(Icons.search_rounded, size: 18, color: EzboColors.textSecondary),
                      suffixIcon: _searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, size: 16, color: EzboColors.textSecondary),
                              onPressed: () {
                                _searchController.clear();
                                setState(() => _searchQuery = '');
                              },
                            )
                          : null,
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      contentPadding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                  ),
                ),
                const SizedBox(height: 10),

                // Category Chips
                SizedBox(
                  height: 32,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: _categories.length,
                    separatorBuilder: (context, index) => const SizedBox(width: 8),
                    itemBuilder: (context, index) {
                      final cat = _categories[index];
                      final isSelected = cat['id'] == _selectedCategory;

                      return ChoiceChip(
                        label: Text(cat['label']!),
                        labelStyle: TextStyle(
                          fontSize: 11,
                          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                          color: isSelected ? Colors.white : EzboColors.textSecondary,
                        ),
                        selected: isSelected,
                        selectedColor: EzboColors.primary,
                        backgroundColor: EzboColors.background,
                        side: BorderSide(
                          color: isSelected ? EzboColors.primary : EzboColors.borderBlue,
                        ),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        padding: const EdgeInsets.symmetric(horizontal: 6),
                        onSelected: (selected) {
                          if (selected) {
                            setState(() => _selectedCategory = cat['id']!);
                          }
                        },
                      );
                    },
                  ),
                ),
              ],
            ),
          ),

          // Agents List Grid
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.search_off_rounded, size: 40, color: EzboColors.textMuted),
                        const SizedBox(height: 8),
                        Text(
                          'No agents found matching "$_searchQuery"',
                          style: const TextStyle(fontSize: 13, color: EzboColors.textSecondary),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    itemCount: filtered.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final agent = filtered[index];
                      return _buildAgentCard(agent);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildAgentCard(AgentTool agent) {
    return InkWell(
      onTap: () => _showAgentDetails(agent),
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
            // Code & Icon Pod
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: EzboColors.primaryLight,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: EzboColors.borderBlue),
              ),
              child: Center(
                child: Text(
                  agent.code,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                    color: EzboColors.primary,
                    fontFamily: 'monospace',
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),

            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          agent.name,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: EzboColors.navy,
                            letterSpacing: -0.2,
                          ),
                        ),
                      ),
                      if (agent.badge.isNotEmpty)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: EzboColors.background,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: EzboColors.borderBlue),
                          ),
                          child: Text(
                            agent.badge,
                            style: const TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              color: EzboColors.primary,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    '${agent.agentName} • ${agent.agentRole}',
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                      color: EzboColors.primaryDark,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    agent.description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 11,
                      color: EzboColors.textSecondary,
                      height: 1.35,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAgentDetails(AgentTool agent) {
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
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: EzboColors.primaryLight,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: EzboColors.borderBlue),
                      ),
                      child: Center(
                        child: Text(
                          agent.code,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w900,
                            color: EzboColors.primary,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            agent.name,
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w900,
                              color: EzboColors.navy,
                              letterSpacing: -0.3,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${agent.agentName} • ${agent.agentRole}',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: EzboColors.primary,
                            ),
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
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: EzboColors.background,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: EzboColors.borderBlue),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'CAPABILITIES & DELIVERABLES',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: EzboColors.textMuted,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        agent.description,
                        style: const TextStyle(
                          fontSize: 12,
                          color: EzboColors.navy,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: EzboColors.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 0,
                    ),
                    icon: const Icon(Icons.chat_bubble_rounded, size: 18, color: Colors.white),
                    label: const Text(
                      'Chat with Agent',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Colors.white),
                    ),
                    onPressed: () {
                      Navigator.of(context).pop();
                      widget.onLaunchAgent(agent);
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
