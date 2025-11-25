import 'package:flutter/material.dart';

class SettingsOption extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget? leading;
  final Widget? trailing;
  final VoidCallback? onTap;
  final bool showDivider;

  const SettingsOption({
    super.key,
    required this.title,
    this.subtitle,
    this.leading,
    this.trailing,
    this.onTap,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ListTile(
          leading: leading,
          title: Text(
            title,
            style: Theme.of(context).textTheme.bodyLarge,
          ),
          subtitle: subtitle != null
              ? Text(
                  subtitle!,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurface.withValues(
                      alpha: 0.7,
                    ),
                  ),
                )
              : null,
          trailing: trailing,
          onTap: onTap,
        ),
        if (showDivider)
          const Divider(
            height: 1,
            indent: 16,
            endIndent: 16,
          ),
      ],
    );
  }
}