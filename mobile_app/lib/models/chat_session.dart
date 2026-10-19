class ChatMessage {
  final String id;
  final String role;
  final String content;
  final String? imageUrl;
  final String? toolMatched;
  final String timestamp;
  final String status;

  ChatMessage({
    required this.id,
    required this.role,
    required this.content,
    this.imageUrl,
    this.toolMatched,
    required this.timestamp,
    this.status = 'normal',
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'role': role,
    'content': content,
    'imageUrl': imageUrl,
    'toolMatched': toolMatched,
    'timestamp': timestamp,
    'status': status,
  };

  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
    id: json['id'] as String? ?? '',
    role: json['role'] as String? ?? 'assistant',
    content: json['content'] as String? ?? '',
    imageUrl: json['imageUrl'] as String?,
    toolMatched: json['toolMatched'] as String?,
    timestamp: json['timestamp'] as String? ?? '',
    status: json['status'] as String? ?? 'normal',
  );
}

class ChatSession {
  final String id;
  String title;
  final int createdAt;
  int updatedAt;
  List<ChatMessage> messages;

  ChatSession({
    required this.id,
    required this.title,
    required this.createdAt,
    required this.updatedAt,
    required this.messages,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'createdAt': createdAt,
    'updatedAt': updatedAt,
    'messages': messages.map((m) => m.toJson()).toList(),
  };

  factory ChatSession.fromJson(Map<String, dynamic> json) {
    return ChatSession(
      id: json['id'] as String? ?? 'session-default',
      title: json['title'] as String? ?? 'New Conversation',
      createdAt: json['createdAt'] as int? ?? DateTime.now().millisecondsSinceEpoch,
      updatedAt: json['updatedAt'] as int? ?? DateTime.now().millisecondsSinceEpoch,
      messages: (json['messages'] as List<dynamic>?)
              ?.map((m) => ChatMessage.fromJson(m as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }
}
