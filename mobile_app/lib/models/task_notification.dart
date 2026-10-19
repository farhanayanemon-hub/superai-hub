class TaskNotification {
  final String id;
  final String agentCode;
  final String agentName;
  final String taskSummary;
  final String status; // 'completed', 'running', 'pending'
  final String timestamp;
  final String? resultPreview;

  const TaskNotification({
    required this.id,
    required this.agentCode,
    required this.agentName,
    required this.taskSummary,
    required this.status,
    required this.timestamp,
    this.resultPreview,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'agentCode': agentCode,
    'agentName': agentName,
    'taskSummary': taskSummary,
    'status': status,
    'timestamp': timestamp,
    'resultPreview': resultPreview,
  };

  factory TaskNotification.fromJson(Map<String, dynamic> json) => TaskNotification(
    id: json['id'] as String? ?? '',
    agentCode: json['agentCode'] as String? ?? '#01',
    agentName: json['agentName'] as String? ?? 'Specialist Agent',
    taskSummary: json['taskSummary'] as String? ?? 'Task execution',
    status: json['status'] as String? ?? 'completed',
    timestamp: json['timestamp'] as String? ?? '',
    resultPreview: json['resultPreview'] as String?,
  );
}

final List<TaskNotification> kStarterNotifications = [
  TaskNotification(
    id: 'task-init-1',
    agentCode: '#01',
    agentName: 'Facebook & Instagram Ads Generator',
    taskSummary: 'Generated 3 Meta Ad variations with AIDA framework for Eid campaign.',
    status: 'completed',
    timestamp: '10m ago',
    resultPreview: 'Headline: Transform Your Digital Presence Today.\nHook: Stop losing 60% of potential leads on static copy...',
  ),
  TaskNotification(
    id: 'task-init-2',
    agentCode: '#34',
    agentName: 'AI Commercial Image Generator',
    taskSummary: 'Synthesized photorealistic product studio mockup in 4K resolution.',
    status: 'completed',
    timestamp: '25m ago',
    resultPreview: 'Prompt: Professional studio photoshoot of luxury timepiece on dark slate marble.',
  ),
  TaskNotification(
    id: 'task-init-3',
    agentCode: '#45',
    agentName: 'SEO Keyword Strategist',
    taskSummary: 'Analyzed competitive high-intent search volumes and ranking keywords.',
    status: 'completed',
    timestamp: '1h ago',
    resultPreview: 'Target keywords: AI automation Bangladesh (KD 24), business chat agent setup (KD 18).',
  ),
  TaskNotification(
    id: 'task-init-4',
    agentCode: '#70',
    agentName: 'Business Automation Architect',
    taskSummary: 'Mapped multi-branch customer inquiry routing webhook logic.',
    status: 'completed',
    timestamp: '3h ago',
    resultPreview: 'Workflow: Webhook Trigger -> Lead Qualifier Node -> WhatsApp Confirmation Dispatch.',
  ),
];
