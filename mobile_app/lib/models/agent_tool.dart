class AgentTool {
  final String id;
  final String code;
  final String name;
  final String agentName;
  final String category;
  final String categoryName;
  final String description;
  final String badge;
  final String agentRole;

  const AgentTool({
    required this.id,
    required this.code,
    required this.name,
    required this.agentName,
    required this.category,
    required this.categoryName,
    required this.description,
    required this.badge,
    required this.agentRole,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'code': code,
    'name': name,
    'agentName': agentName,
    'category': category,
    'categoryName': categoryName,
    'description': description,
    'badge': badge,
    'agentRole': agentRole,
  };

  factory AgentTool.fromJson(Map<String, dynamic> json) => AgentTool(
    id: json['id'] as String? ?? '',
    code: json['code'] as String? ?? '',
    name: json['name'] as String? ?? '',
    agentName: json['agentName'] as String? ?? '',
    category: json['category'] as String? ?? '',
    categoryName: json['categoryName'] as String? ?? '',
    description: json['description'] as String? ?? '',
    badge: json['badge'] as String? ?? '',
    agentRole: json['agentRole'] as String? ?? '',
  );
}
