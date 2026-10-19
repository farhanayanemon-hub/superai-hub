import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:image_picker/image_picker.dart';
import '../../models/agent_tool.dart';
import '../../models/chat_session.dart';
import '../../models/task_notification.dart';
import '../../services/api_service.dart';
import '../../services/storage_service.dart';
import '../../theme/ezbo_theme.dart';
import 'widgets/chat_drawer.dart';
import 'widgets/slash_helpers_popover.dart';

class CeoChatScreen extends StatefulWidget {
  final AgentTool? preselectedAgent;
  final VoidCallback onLogout;

  const CeoChatScreen({
    super.key,
    this.preselectedAgent,
    required this.onLogout,
  });

  @override
  State<CeoChatScreen> createState() => CeoChatScreenState();
}

class CeoChatScreenState extends State<CeoChatScreen> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final ImagePicker _imagePicker = ImagePicker();

  List<ChatSession> _sessions = [];
  String _activeSessionId = 'session-default';
  bool _isSending = false;
  bool _showSlashMenu = false;
  String _slashQuery = '';
  File? _attachedImage;
  AgentTool? _activeHelper;

  ChatSession get _activeSession {
    return _sessions.firstWhere(
      (s) => s.id == _activeSessionId,
      orElse: () => _sessions.isNotEmpty
          ? _sessions.first
          : ChatSession(
              id: 'session-default',
              title: 'New Conversation',
              createdAt: DateTime.now().millisecondsSinceEpoch,
              updatedAt: DateTime.now().millisecondsSinceEpoch,
              messages: [],
            ),
    );
  }

  @override
  void initState() {
    super.initState();
    _loadState();
    if (widget.preselectedAgent != null) {
      _activeHelper = widget.preselectedAgent;
    }
  }

  void setPreselectedAgent(AgentTool agent) {
    setState(() {
      _activeHelper = agent;
    });
  }

  Future<void> _loadState() async {
    final loaded = StorageService.loadSessions();
    final activeId = StorageService.loadActiveSessionId();
    setState(() {
      _sessions = loaded;
      _activeSessionId = activeId;
    });
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _handleNewChat() {
    final newSession = ChatSession(
      id: 'session-${DateTime.now().millisecondsSinceEpoch}',
      title: 'New Conversation',
      createdAt: DateTime.now().millisecondsSinceEpoch,
      updatedAt: DateTime.now().millisecondsSinceEpoch,
      messages: [
        ChatMessage(
          id: 'welcome-${DateTime.now().millisecondsSinceEpoch}',
          role: 'assistant',
          content: 'Hi! I am **Ezbo**, your Master AI CEO.\n\nAll 75 Business & Freelancer AI Helpers are ready. Type `/` to select a specialist or ask me anything directly.',
          timestamp: _formatTime(DateTime.now()),
        )
      ],
    );

    setState(() {
      _sessions.insert(0, newSession);
      _activeSessionId = newSession.id;
      _activeHelper = null;
      _attachedImage = null;
    });

    StorageService.saveSessions(_sessions);
    StorageService.saveActiveSessionId(newSession.id);
    _scrollToBottom();
  }

  void _switchSession(String id) {
    setState(() {
      _activeSessionId = id;
    });
    StorageService.saveActiveSessionId(id);
    _scrollToBottom();
  }

  void _deleteSession(String id) {
    if (_sessions.length <= 1) return;
    setState(() {
      _sessions.removeWhere((s) => s.id == id);
      if (_activeSessionId == id) {
        _activeSessionId = _sessions.first.id;
      }
    });
    StorageService.saveSessions(_sessions);
    StorageService.saveActiveSessionId(_activeSessionId);
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final picked = await _imagePicker.pickImage(source: source, imageQuality: 80);
      if (picked != null) {
        setState(() {
          _attachedImage = File(picked.path);
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Could not access image: $e')),
      );
    }
  }

  void _showPlusMenu() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Attach Media or Tool',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: EzboColors.navy,
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
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: EzboColors.primaryLight,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.camera_alt_rounded, color: EzboColors.primary),
                  ),
                  title: const Text('Take Photo', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: EzboColors.navy)),
                  subtitle: const Text('Use camera for instant analysis', style: TextStyle(fontSize: 11, color: EzboColors.textSecondary)),
                  onTap: () {
                    Navigator.of(context).pop();
                    _pickImage(ImageSource.camera);
                  },
                ),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: EzboColors.primaryLight,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.photo_library_rounded, color: EzboColors.primary),
                  ),
                  title: const Text('Upload Image', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13, color: EzboColors.navy)),
                  subtitle: const Text('Choose screenshot or image from gallery', style: TextStyle(fontSize: 11, color: EzboColors.textSecondary)),
                  onTap: () {
                    Navigator.of(context).pop();
                    _pickImage(ImageSource.gallery);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _onTextChanged(String text) {
    if (text.startsWith('/')) {
      setState(() {
        _showSlashMenu = true;
        _slashQuery = text;
      });
    } else if (_showSlashMenu) {
      setState(() {
        _showSlashMenu = false;
      });
    }
  }

  void _selectHelper(AgentTool tool) {
    setState(() {
      _activeHelper = tool;
      _showSlashMenu = false;
      _textController.clear();
    });
  }

  Future<void> _sendMessage() async {
    final text = _textController.text.trim();
    if (text.isEmpty && _attachedImage == null) return;

    final userMsgText = text.isNotEmpty ? text : 'Please inspect this attached image.';
    final userMsg = ChatMessage(
      id: 'usr-${DateTime.now().millisecondsSinceEpoch}',
      role: 'user',
      content: userMsgText,
      imageUrl: _attachedImage?.path,
      timestamp: _formatTime(DateTime.now()),
    );

    setState(() {
      _activeSession.messages.add(userMsg);
      if (_activeSession.title == 'New Conversation') {
        _activeSession.title = userMsgText.length > 28 ? '${userMsgText.substring(0, 28)}...' : userMsgText;
      }
      _textController.clear();
      _isSending = true;
      _showSlashMenu = false;
    });

    _scrollToBottom();
    StorageService.saveSessions(_sessions);

    final helperToUse = _activeHelper;
    final imageToSend = _attachedImage;
    setState(() {
      _attachedImage = null;
    });

    final res = await ApiService.sendMessageToCeo(
      message: userMsgText,
      imageUrl: imageToSend?.path,
      helperId: helperToUse?.id,
      planTier: StorageService.getUserTier(),
      history: _activeSession.messages,
    );

    if (!mounted) return;

    final botMsg = ChatMessage(
      id: 'bot-${DateTime.now().millisecondsSinceEpoch}',
      role: 'assistant',
      content: res.text,
      imageUrl: res.imageUrl,
      toolMatched: res.delegatedHelper ?? (helperToUse != null ? '[${helperToUse.code}] ${helperToUse.name}' : null),
      timestamp: _formatTime(DateTime.now()),
      status: res.success ? 'normal' : 'error',
    );

    setState(() {
      _activeSession.messages.add(botMsg);
      _activeSession.updatedAt = DateTime.now().millisecondsSinceEpoch;
      _isSending = false;
    });

    StorageService.saveSessions(_sessions);
    _scrollToBottom();

    // Auto-record task execution in real-time notifications
    final executedAgentCode = helperToUse?.code ?? (res.delegatedHelper != null && res.delegatedHelper!.contains('[#') ? res.delegatedHelper!.split(']')[0].replaceAll('[', '') : '#CEO');
    final executedAgentName = helperToUse?.name ?? (res.delegatedHelper != null && res.delegatedHelper!.contains(']') ? res.delegatedHelper!.split(']')[1].trim() : 'Master AI CEO');

    final taskNotif = TaskNotification(
      id: 'task-${DateTime.now().millisecondsSinceEpoch}',
      agentCode: executedAgentCode,
      agentName: executedAgentName,
      taskSummary: userMsgText,
      status: res.success ? 'completed' : 'failed',
      timestamp: 'Just now',
      resultPreview: res.text.length > 180 ? '${res.text.substring(0, 180)}...' : res.text,
    );
    await StorageService.addNotification(taskNotif);
  }

  void _copyToClipboard(String content) {
    Clipboard.setData(ClipboardData(text: content));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Message copied to clipboard'),
        duration: Duration(seconds: 2),
        backgroundColor: EzboColors.navy,
      ),
    );
  }

  String _formatTime(DateTime dt) {
    final h = dt.hour > 12 ? dt.hour - 12 : (dt.hour == 0 ? 12 : dt.hour);
    final m = dt.minute.toString().padLeft(2, '0');
    final ampm = dt.hour >= 12 ? 'PM' : 'AM';
    return '$h:$m $ampm';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: EzboColors.background,
      drawer: ChatDrawer(
        sessions: _sessions,
        activeSessionId: _activeSessionId,
        onSelectSession: _switchSession,
        onNewChat: _handleNewChat,
        onDeleteSession: _deleteSession,
        onLogout: widget.onLogout,
      ),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.menu_rounded, color: EzboColors.navy, size: 24),
          onPressed: () => _scaffoldKey.currentState?.openDrawer(),
          tooltip: 'Chat History & Channels',
        ),
        titleSpacing: 0,
        title: Row(
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: 36,
                  height: 36,
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: EzboColors.background,
                    shape: BoxShape.circle,
                    border: Border.all(color: EzboColors.sky, width: 1.5),
                  ),
                  child: Image.asset(
                    'assets/images/ezbo-ceo.png',
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) => const Icon(Icons.auto_awesome, color: EzboColors.primary, size: 18),
                  ),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: EzboColors.emerald,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Text(
                        'Ezbo',
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w900,
                          color: EzboColors.navy,
                          letterSpacing: -0.3,
                        ),
                      ),
                      SizedBox(width: 6),
                      Text(
                        'CEO',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                          color: EzboColors.primary,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    _activeSession.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 11,
                      color: EzboColors.textSecondary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_comment_outlined, color: EzboColors.primary, size: 22),
            onPressed: _handleNewChat,
            tooltip: 'New Conversation',
          ),
        ],
      ),
      body: Column(
        children: [
          // Active Messages List
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              itemCount: _activeSession.messages.length + (_isSending ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _activeSession.messages.length) {
                  return _buildThinkingIndicator();
                }
                final msg = _activeSession.messages[index];
                return _buildMessageBubble(msg);
              },
            ),
          ),

          // Slash Command Autocomplete Popover
          if (_showSlashMenu)
            SlashHelpersPopover(
              query: _slashQuery,
              onSelect: _selectHelper,
              onClose: () => setState(() => _showSlashMenu = false),
            ),

          // Active Attached Helper Chip & Media Preview
          if (_activeHelper != null || _attachedImage != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              color: Colors.white,
              child: Row(
                children: [
                  if (_activeHelper != null)
                    Chip(
                      backgroundColor: EzboColors.primaryLight,
                      side: const BorderSide(color: EzboColors.borderBlue),
                      label: Text(
                        '⚡ [${_activeHelper!.code}] ${_activeHelper!.name}',
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: EzboColors.primary),
                      ),
                      deleteIcon: const Icon(Icons.close_rounded, size: 14, color: EzboColors.primary),
                      onDeleted: () => setState(() => _activeHelper = null),
                    ),
                  if (_attachedImage != null) ...[
                    const SizedBox(width: 8),
                    Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.file(_attachedImage!, width: 44, height: 44, fit: BoxFit.cover),
                        ),
                        Positioned(
                          top: -4,
                          right: -4,
                          child: GestureDetector(
                            onTap: () => setState(() => _attachedImage = null),
                            child: const CircleAvatar(
                              radius: 8,
                              backgroundColor: EzboColors.navy,
                              child: Icon(Icons.close, size: 10, color: Colors.white),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),

          // Main Bottom Input Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: EzboColors.border)),
            ),
            child: SafeArea(
              top: false,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  // '+' Plus Button
                  InkWell(
                    onTap: _showPlusMenu,
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: EzboColors.background,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: EzboColors.borderBlue),
                      ),
                      child: const Icon(Icons.add_rounded, color: EzboColors.primary, size: 22),
                    ),
                  ),
                  const SizedBox(width: 8),

                  // Prompt Text Input
                  Expanded(
                    child: Container(
                      constraints: const BoxConstraints(maxHeight: 120),
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      decoration: BoxDecoration(
                        color: EzboColors.surfaceMuted,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: EzboColors.borderBlue),
                      ),
                      child: TextField(
                        controller: _textController,
                        onChanged: _onTextChanged,
                        minLines: 1,
                        maxLines: 5,
                        style: const TextStyle(fontSize: 13, color: EzboColors.navy),
                        decoration: const InputDecoration(
                          hintText: 'Ask Ezbo anything, or type / to invoke 75 AI Helpers...',
                          border: InputBorder.none,
                          enabledBorder: InputBorder.none,
                          focusedBorder: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(vertical: 11),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),

                  // Send Button
                  InkWell(
                    onTap: _isSending ? null : _sendMessage,
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [EzboColors.primary, EzboColors.primaryDark],
                        ),
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: EzboColors.primary.withValues(alpha: 0.3),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: Center(
                        child: _isSending
                            ? const SizedBox(
                                width: 18,
                                height: 18,
                                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                              )
                            : const Icon(Icons.arrow_upward_rounded, color: Colors.white, size: 20),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildThinkingIndicator() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 14,
            backgroundColor: EzboColors.primaryLight,
            child: Image.asset('assets/images/ezbo-ceo.png', width: 18, height: 18),
          ),
          const SizedBox(width: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: EzboColors.border),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(strokeWidth: 2, color: EzboColors.primary),
                ),
                SizedBox(width: 8),
                Text(
                  'CEO is orchestrating...',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: EzboColors.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage msg) {
    final isUser = msg.role == 'user';

    if (isUser) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.end,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Flexible(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [EzboColors.primary, EzboColors.navy],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(18),
                    topRight: Radius.circular(18),
                    bottomLeft: Radius.circular(18),
                    bottomRight: Radius.circular(4),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: EzboColors.primary.withValues(alpha: 0.18),
                      blurRadius: 8,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    if (msg.imageUrl != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.file(
                            File(msg.imageUrl!),
                            height: 180,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => const SizedBox(),
                          ),
                        ),
                      ),
                    Text(
                      msg.content,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      msg.timestamp,
                      style: TextStyle(
                        fontSize: 9,
                        color: Colors.white.withValues(alpha: 0.7),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 8),
            CircleAvatar(
              radius: 14,
              backgroundColor: EzboColors.primaryLight,
              child: Text(
                StorageService.getUserName().isNotEmpty ? StorageService.getUserName()[0].toUpperCase() : 'U',
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: EzboColors.primary),
              ),
            ),
          ],
        ),
      );
    } else {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CircleAvatar(
              radius: 14,
              backgroundColor: EzboColors.background,
              child: Image.asset(
                'assets/images/ezbo-ceo.png',
                width: 20,
                height: 20,
                errorBuilder: (context, error, stackTrace) => const Icon(Icons.bolt, color: EzboColors.primary, size: 16),
              ),
            ),
            const SizedBox(width: 8),
            Flexible(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (msg.toolMatched != null)
                    Container(
                      margin: const EdgeInsets.only(bottom: 4),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: EzboColors.primaryLight,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: EzboColors.borderBlue),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.bolt_rounded, size: 12, color: EzboColors.primary),
                          const SizedBox(width: 4),
                          Text(
                            msg.toolMatched!,
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: EzboColors.primary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: const BorderRadius.only(
                        topLeft: Radius.circular(4),
                        topRight: Radius.circular(18),
                        bottomLeft: Radius.circular(18),
                        bottomRight: Radius.circular(18),
                      ),
                      border: Border.all(color: EzboColors.border),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.03),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (msg.imageUrl != null)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.network(
                                msg.imageUrl!,
                                height: 220,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) => const SizedBox(),
                              ),
                            ),
                          ),
                        MarkdownBody(
                          data: msg.content,
                          styleSheet: MarkdownStyleSheet(
                            p: const TextStyle(fontSize: 13, height: 1.5, color: EzboColors.navy),
                            strong: const TextStyle(fontWeight: FontWeight.w800, color: EzboColors.navy),
                            code: const TextStyle(backgroundColor: EzboColors.surfaceMuted, fontFamily: 'monospace', fontSize: 11),
                            codeblockDecoration: BoxDecoration(
                              color: EzboColors.surfaceMuted,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: EzboColors.borderBlue),
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              msg.timestamp,
                              style: const TextStyle(fontSize: 9, color: EzboColors.textMuted),
                            ),
                            GestureDetector(
                              onTap: () => _copyToClipboard(msg.content),
                              child: const Row(
                                children: [
                                  Icon(Icons.copy_rounded, size: 12, color: EzboColors.textSecondary),
                                  SizedBox(width: 4),
                                  Text('Copy', style: TextStyle(fontSize: 10, color: EzboColors.textSecondary, fontWeight: FontWeight.w600)),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }
  }
}
