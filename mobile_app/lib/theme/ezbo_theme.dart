import 'package:flutter/material.dart';

class EzboColors {
  static const Color primary = Color(0xFF1677FF);
  static const Color primaryDark = Color(0xFF0F5CD1);
  static const Color primaryLight = Color(0xFFE4F0FF);
  static const Color sky = Color(0xFF38CFFF);
  static const Color navy = Color(0xFF102A56);
  static const Color navyDark = Color(0xFF0B1F42);
  static const Color navyLight = Color(0xFF1A3D75);
  static const Color background = Color(0xFFF3F8FF);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceMuted = Color(0xFFF8FAFC);
  static const Color border = Color(0xFFE3ECF7);
  static const Color borderBlue = Color(0xFFCFE2FA);
  static const Color textPrimary = Color(0xFF102A56);
  static const Color textSecondary = Color(0xFF5E7694);
  static const Color textMuted = Color(0xFF889DB5);
  static const Color emerald = Color(0xFF10B981);
  static const Color emeraldLight = Color(0xFFECFDF5);
  static const Color rose = Color(0xFFF43F5E);
  static const Color amber = Color(0xFFF59E0B);
  static const Color amberLight = Color(0xFFFEF3C7);
}

class EzboTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: EzboColors.primary,
      scaffoldBackgroundColor: EzboColors.background,
      fontFamily: 'Segoe UI',
      colorScheme: const ColorScheme.light(
        primary: EzboColors.primary,
        onPrimary: Colors.white,
        secondary: EzboColors.sky,
        surface: EzboColors.surface,
        onSurface: EzboColors.textPrimary,
        error: EzboColors.rose,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        iconTheme: IconThemeData(color: EzboColors.navy),
        titleTextStyle: TextStyle(
          color: EzboColors.navy,
          fontSize: 18,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.3,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: EzboColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          shadowColor: EzboColors.primary.withValues(alpha: 0.3),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w700,
            letterSpacing: -0.2,
          ),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: EzboColors.surfaceMuted,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: EzboColors.borderBlue, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: EzboColors.borderBlue, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: EzboColors.primary, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(color: EzboColors.rose, width: 1),
        ),
        hintStyle: const TextStyle(
          color: EzboColors.textMuted,
          fontSize: 13,
          fontWeight: FontWeight.w400,
        ),
      ),
    );
  }
}
