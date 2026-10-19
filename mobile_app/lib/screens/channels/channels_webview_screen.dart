import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../theme/ezbo_theme.dart';

class ChannelsWebviewScreen extends StatefulWidget {
  const ChannelsWebviewScreen({super.key});

  @override
  State<ChannelsWebviewScreen> createState() => _ChannelsWebviewScreenState();
}

class _ChannelsWebviewScreenState extends State<ChannelsWebviewScreen> {
  late final WebViewController _controller;
  int _loadingProgress = 0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(EzboColors.background)
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            setState(() {
              _loadingProgress = progress;
            });
          },
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
          },
        ),
      )
      ..loadRequest(Uri.parse('https://ezboagents.com/dashboard?tab=channels'));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: EzboColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: EzboColors.navy),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: EzboColors.background,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: EzboColors.borderBlue),
              ),
              child: Image.asset(
                'assets/images/ezbo-ceo.png',
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) => const Icon(Icons.electric_bolt_rounded, size: 18, color: EzboColors.primary),
              ),
            ),
            const SizedBox(width: 10),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Connect Channels',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: EzboColors.navy,
                    letterSpacing: -0.3,
                  ),
                ),
                Text(
                  'WhatsApp & Telegram Sync',
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
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: EzboColors.navy),
            onPressed: () => _controller.reload(),
            tooltip: 'Reload',
          ),
          IconButton(
            icon: const Icon(Icons.close_rounded, color: EzboColors.navy),
            onPressed: () => Navigator.of(context).pop(),
            tooltip: 'Close',
          ),
        ],
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            LinearProgressIndicator(
              value: _loadingProgress / 100.0,
              backgroundColor: EzboColors.borderBlue,
              color: EzboColors.primary,
              minHeight: 3,
            ),
        ],
      ),
    );
  }
}
