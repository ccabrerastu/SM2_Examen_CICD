import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/approval_provider.dart';
import '../models/approval_rule.dart';
import '../models/rule_type.dart';

class ApprovalProgressIndicator extends StatelessWidget {
  final String chapterId;
  final double currentScore;
  final int currentErrors;
  final int currentTimeSpent;
  final bool showDetails;

  const ApprovalProgressIndicator({
    super.key,
    required this.chapterId,
    required this.currentScore,
    required this.currentErrors,
    required this.currentTimeSpent,
    this.showDetails = true,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<ApprovalProvider>(
      builder: (context, approvalProvider, child) {
        return FutureBuilder<List<ApprovalRule>>(
          future: approvalProvider.getChapterApprovalRules(chapterId),
          builder: (context, snapshot) {
            if (!snapshot.hasData || snapshot.data!.isEmpty) {
              return const SizedBox.shrink();
            }

            final rules = snapshot.data!;
            final applicableRules = rules.where((rule) => rule.isApplicableToChapter(chapterId)).toList();

            if (applicableRules.isEmpty) {
              return const SizedBox.shrink();
            }

            return Container(
              margin: const EdgeInsets.all(8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildHeader(context),
                  const SizedBox(height: 8),
                  if (showDetails) ...[
                    ...applicableRules.map((rule) => _buildRuleProgress(context, rule)),
                  ] else ...[
                    _buildOverallProgress(context, applicableRules),
                  ],
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Row(
      children: [
        Icon(
          Icons.rule,
          size: 20,
          color: Theme.of(context).primaryColor,
        ),
        const SizedBox(width: 8),
        Text(
          'Approval Progress',
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildRuleProgress(BuildContext context, ApprovalRule rule) {
    final progress = _calculateRuleProgress(rule);
    final isPassing = progress >= 1.0;
    final progressColor = isPassing ? Colors.green : Colors.orange;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                isPassing ? Icons.check_circle : Icons.radio_button_unchecked,
                size: 16,
                color: progressColor,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  rule.name,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ),
              Text(
                _getRuleProgressText(rule),
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: progressColor,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          LinearProgressIndicator(
            value: progress.clamp(0.0, 1.0),
            backgroundColor: Colors.grey.shade300,
            valueColor: AlwaysStoppedAnimation<Color>(progressColor),
            minHeight: 4,
          ),
        ],
      ),
    );
  }

  Widget _buildOverallProgress(BuildContext context, List<ApprovalRule> rules) {
    final passingRules = rules.where((rule) => _calculateRuleProgress(rule) >= 1.0).length;
    final totalRules = rules.length;
    final overallProgress = totalRules > 0 ? passingRules / totalRules : 0.0;
    final progressColor = overallProgress >= 1.0 ? Colors.green : Colors.orange;

    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Rules Passed',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            Text(
              '$passingRules / $totalRules',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: progressColor,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        LinearProgressIndicator(
          value: overallProgress,
          backgroundColor: Colors.grey.shade300,
          valueColor: AlwaysStoppedAnimation<Color>(progressColor),
          minHeight: 6,
        ),
      ],
    );
  }

  double _calculateRuleProgress(ApprovalRule rule) {
    switch (rule.ruleType) {
      case RuleType.score:
        final threshold = rule.getThresholdPercentage();
        return threshold > 0 ? currentScore / threshold : 0.0;
      
      case RuleType.errors:
        final maxErrors = rule.threshold?.toInt() ?? 0;
        if (maxErrors <= 0) return 1.0; // No error limit means always passing
        return currentErrors <= maxErrors ? 1.0 : 0.0;
      
      case RuleType.time:
        final maxTime = rule.threshold?.toInt() ?? 0;
        if (maxTime <= 0) return 1.0; // No time limit means always passing
        return currentTimeSpent <= maxTime ? 1.0 : 0.0;
      
      case RuleType.attempts:
        // For attempts, we can't calculate progress during the chapter
        // This would be evaluated after completion
        return 1.0;
    }
  }

  String _getRuleProgressText(ApprovalRule rule) {
    switch (rule.ruleType) {
      case RuleType.score:
        final threshold = rule.getThresholdPercentage();
        return '${currentScore.toStringAsFixed(1)}% / ${threshold.toStringAsFixed(1)}%';
      
      case RuleType.errors:
        final maxErrors = rule.threshold?.toInt() ?? 0;
        return '$currentErrors / $maxErrors errors';
      
      case RuleType.time:
        final maxTime = rule.threshold?.toInt() ?? 0;
        final currentMinutes = (currentTimeSpent / 60).toStringAsFixed(1);
        final maxMinutes = (maxTime / 60).toStringAsFixed(1);
        return '${currentMinutes}m / ${maxMinutes}m';
      
      case RuleType.attempts:
        return 'On completion';
    }
  }
}

/// Compact version for use in app bars or small spaces
class CompactApprovalIndicator extends StatelessWidget {
  final String chapterId;
  final double currentScore;
  final int currentErrors;
  final int currentTimeSpent;

  const CompactApprovalIndicator({
    super.key,
    required this.chapterId,
    required this.currentScore,
    required this.currentErrors,
    required this.currentTimeSpent,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<ApprovalProvider>(
      builder: (context, approvalProvider, child) {
        return FutureBuilder<List<ApprovalRule>>(
          future: approvalProvider.getChapterApprovalRules(chapterId),
          builder: (context, snapshot) {
            if (!snapshot.hasData || snapshot.data!.isEmpty) {
              return const SizedBox.shrink();
            }

            final rules = snapshot.data!;
            final applicableRules = rules.where((rule) => rule.isApplicableToChapter(chapterId)).toList();

            if (applicableRules.isEmpty) {
              return const SizedBox.shrink();
            }

            final passingRules = applicableRules.where((rule) => _calculateRuleProgress(rule) >= 1.0).length;
            final totalRules = applicableRules.length;
            final overallProgress = totalRules > 0 ? passingRules / totalRules : 0.0;
            final progressColor = overallProgress >= 1.0 ? Colors.green : Colors.orange;

            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: progressColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: progressColor.withValues(alpha: 0.3)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.rule,
                    size: 16,
                    color: progressColor,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    '$passingRules/$totalRules',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: progressColor,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  double _calculateRuleProgress(ApprovalRule rule) {
    switch (rule.ruleType) {
      case RuleType.score:
        final threshold = rule.getThresholdPercentage();
        return threshold > 0 ? currentScore / threshold : 0.0;
      
      case RuleType.errors:
        final maxErrors = rule.threshold?.toInt() ?? 0;
        if (maxErrors <= 0) return 1.0;
        return currentErrors <= maxErrors ? 1.0 : 0.0;
      
      case RuleType.time:
        final maxTime = rule.threshold?.toInt() ?? 0;
        if (maxTime <= 0) return 1.0;
        return currentTimeSpent <= maxTime ? 1.0 : 0.0;
      
      case RuleType.attempts:
        return 1.0;
    }
  }
}