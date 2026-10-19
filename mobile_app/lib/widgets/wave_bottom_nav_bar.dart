import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/ezbo_theme.dart';

class WaveBottomNavBar extends StatefulWidget {
  final int selectedIndex;
  final ValueChanged<int> onTabSelected;

  const WaveBottomNavBar({
    super.key,
    required this.selectedIndex,
    required this.onTabSelected,
  });

  @override
  State<WaveBottomNavBar> createState() => _WaveBottomNavBarState();
}

class _WaveBottomNavBarState extends State<WaveBottomNavBar> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _positionAnimation;
  double _currentNormalizedX = 0.5; // 0.0: left, 0.5: middle, 1.0: right

  @override
  void initState() {
    super.initState();
    _currentNormalizedX = _normalizedXForIndex(widget.selectedIndex);
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 320),
    );
    _positionAnimation = Tween<double>(
      begin: _currentNormalizedX,
      end: _currentNormalizedX,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic,
    ));
  }

  @override
  void didUpdateWidget(covariant WaveBottomNavBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.selectedIndex != widget.selectedIndex) {
      final targetNormalizedX = _normalizedXForIndex(widget.selectedIndex);
      _positionAnimation = Tween<double>(
        begin: _positionAnimation.value,
        end: targetNormalizedX,
      ).animate(CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOutCubic,
      ));
      _controller.forward(from: 0.0);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  double _normalizedXForIndex(int index) {
    if (index == 0) return 1.0 / 6.0;
    if (index == 1) return 0.5;
    return 5.0 / 6.0;
  }

  void _handleTap(int index) {
    if (index == widget.selectedIndex) return;
    HapticFeedback.lightImpact();
    widget.onTabSelected(index);
  }

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;
    const barHeight = 68.0;

    return SizedBox(
      height: barHeight + bottomPadding,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Background Canvas with Animated Fluid Wave Notch
          Positioned.fill(
            child: AnimatedBuilder(
              animation: _positionAnimation,
              builder: (context, child) {
                return CustomPaint(
                  painter: _WaveBarPainter(
                    normalizedNotchX: _positionAnimation.value,
                    color: Colors.white,
                    borderColor: EzboColors.borderBlue.withValues(alpha: 0.6),
                  ),
                );
              },
            ),
          ),

          // Elevated Floating Active Orb Indicator
          AnimatedBuilder(
            animation: _positionAnimation,
            builder: (context, child) {
              final screenWidth = MediaQuery.of(context).size.width;
              final orbX = screenWidth * _positionAnimation.value - 28.0;

              return Positioned(
                left: orbX,
                top: -14.0,
                child: GestureDetector(
                  onTap: () => HapticFeedback.selectionClick(),
                  child: Container(
                    width: 56.0,
                    height: 56.0,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const LinearGradient(
                        colors: [EzboColors.primary, EzboColors.sky],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: EzboColors.primary.withValues(alpha: 0.40),
                          blurRadius: 18,
                          spreadRadius: 2,
                          offset: const Offset(0, 7),
                        ),
                      ],
                      border: Border.all(color: Colors.white, width: 3.5),
                    ),
                    child: Center(
                      child: _buildActiveIcon(widget.selectedIndex),
                    ),
                  ),
                ),
              );
            },
          ),

          // Interactive Nav Buttons Row
          Positioned(
            left: 0,
            right: 0,
            top: 0,
            height: barHeight,
            child: Row(
              children: [
                // 1. Left: My Agents
                Expanded(
                  child: _NavItem(
                    icon: Icons.grid_view_rounded,
                    label: 'My Agents',
                    isSelected: widget.selectedIndex == 0,
                    onTap: () => _handleTap(0),
                  ),
                ),

                // 2. Middle: Ezbo AI CEO Chat
                Expanded(
                  child: _NavItem(
                    icon: Icons.chat_bubble_rounded,
                    label: 'Ezbo',
                    isSelected: widget.selectedIndex == 1,
                    onTap: () => _handleTap(1),
                  ),
                ),

                // 3. Right: Task Notifications
                Expanded(
                  child: _NavItem(
                    icon: Icons.notifications_active_rounded,
                    label: 'Activity',
                    isSelected: widget.selectedIndex == 2,
                    onTap: () => _handleTap(2),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActiveIcon(int index) {
    IconData icon;
    if (index == 0) {
      icon = Icons.grid_view_rounded;
    } else if (index == 1) {
      icon = Icons.auto_awesome_rounded;
    } else {
      icon = Icons.notifications_active_rounded;
    }
    return Icon(icon, color: Colors.white, size: 26.0);
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      splashColor: Colors.transparent,
      highlightColor: Colors.transparent,
      child: Center(
        child: AnimatedOpacity(
          duration: const Duration(milliseconds: 200),
          opacity: isSelected ? 0.0 : 1.0,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 24,
                color: EzboColors.textSecondary,
              ),
              const SizedBox(height: 3),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: EzboColors.textSecondary,
                  letterSpacing: -0.2,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _WaveBarPainter extends CustomPainter {
  final double normalizedNotchX;
  final Color color;
  final Color borderColor;

  _WaveBarPainter({
    required this.normalizedNotchX,
    required this.color,
    required this.borderColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final borderPaint = Paint()
      ..color = borderColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    final shadowPaint = Paint()
      ..color = Colors.black.withValues(alpha: 0.05)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 10);

    final path = Path();
    final centerX = size.width * normalizedNotchX;
    const notchRadius = 36.0;

    path.moveTo(0, 0);

    // Left flat line leading to wave dip
    final waveStartX = (centerX - notchRadius * 1.8).clamp(0.0, size.width);
    path.lineTo(waveStartX, 0);

    // Smooth cubic Bézier wave dip & curve
    path.cubicTo(
      centerX - notchRadius * 1.05,
      0,
      centerX - notchRadius * 0.9,
      notchRadius * 0.95,
      centerX,
      notchRadius * 0.95,
    );

    path.cubicTo(
      centerX + notchRadius * 0.9,
      notchRadius * 0.95,
      centerX + notchRadius * 1.05,
      0,
      (centerX + notchRadius * 1.8).clamp(0.0, size.width),
      0,
    );

    // Right flat line
    path.lineTo(size.width, 0);
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();

    // Draw shadow first
    canvas.drawPath(path, shadowPaint);
    // Draw fill
    canvas.drawPath(path, paint);
    // Draw top hairline
    canvas.drawPath(path, borderPaint);
  }

  @override
  bool shouldRepaint(covariant _WaveBarPainter oldDelegate) {
    return oldDelegate.normalizedNotchX != normalizedNotchX ||
        oldDelegate.color != color ||
        oldDelegate.borderColor != borderColor;
  }
}
