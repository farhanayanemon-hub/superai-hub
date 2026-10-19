import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'screens/auth/login_screen.dart';
import 'screens/main_shell.dart';
import 'services/storage_service.dart';
import 'theme/ezbo_theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await StorageService.init();

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const EzboApp());
}

class EzboApp extends StatefulWidget {
  const EzboApp({super.key});

  @override
  State<EzboApp> createState() => _EzboAppState();
}

class _EzboAppState extends State<EzboApp> {
  late bool _isLoggedIn;

  @override
  void initState() {
    super.initState();
    _isLoggedIn = StorageService.isLoggedIn();
  }

  void _handleLoginSuccess() {
    setState(() {
      _isLoggedIn = true;
    });
  }

  void _handleLogout() async {
    await StorageService.setLoggedIn(loggedIn: false);
    setState(() {
      _isLoggedIn = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'EzboAgents',
      debugShowCheckedModeBanner: false,
      theme: EzboTheme.lightTheme,
      home: _isLoggedIn
          ? MainShell(onLogout: _handleLogout)
          : LoginScreen(onLoginSuccess: _handleLoginSuccess),
    );
  }
}
