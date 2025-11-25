import 'package:flutter/material.dart';
import '../models/approval_evaluation.dart';
import '../models/approval_rule.dart';
import '../models/rule_type.dart';

class ApprovalResultCard extends StatelessWidget {
  final ApprovalEvaluation evaluation;
  final List<ApprovalRule> appliedRules;
  final VoidCallback? onRetryPressed;
  final VoidCallback? onContinuePressed;

  const ApprovalResultCard({
    super.key,
    required this.evaluation,
    required this.appliedRules,
    this.onRetryPressed,
    this.onContinuePressed,
  });

  @override
  Widget build(BuildContext context) {
    final isApproved = evaluation.isApproved();
    final isPending = evaluation.isPending();
    final isRejected = evaluation.isRejected();
    
    return Card(
      elevation: 8,
      margin: const EdgeInsets.all(16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: _getGradientColors(isApproved, isPending),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildHeader(context, isApproved, isPending, isRejected),
              const SizedBox(height: 16),
              _buildScoreSection(context),
              const SizedBox(height: 16),
              _buildRulesSection(context),
              if (evaluation.feedback?.isNotEmpty == true) ...[
                const SizedBox(height: 16),
                _buildFeedbackSection(context),
              ],
              const SizedBox(height: 20),
              _buildActionButtons(context, isApproved, isRejected),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, bool isApproved, bool isPending, bool isRejected) {
    IconData icon;
    String title;
    Color iconColor;

    if (isApproved) {
      icon = Icons.check_circle;
      title = 'Chapter Approved!';
      iconColor = Colors.green;
    } else if (isPending) {
      icon = Icons.hourglass_empty;
      title = 'Evaluation Pending';
      iconColor = Colors.orange;
    } else {
      icon = Icons.cancel;
      title = 'Chapter Not Approved';
      iconColor = Colors.red;
    }

    return Row(
      children: [
        Icon(
          icon,
          size: 32,
          color: iconColor,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            title,
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildScoreSection(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildScoreItem(
            context,
            'Score',
            '${evaluation.score.toStringAsFixed(1)}%',
            Icons.star,
          ),
          _buildScoreItem(
            context,
            'Errors',
            evaluation.errorsFromPreviousAttempts.toString(),
            Icons.error_outline,
          ),
          _buildScoreItem(
            context,
            'Time',
            '${((evaluation.evaluationData?['timeSpent'] as int? ?? 0) / 60).toStringAsFixed(1)}m',
            Icons.timer,
          ),
        ],
      ),
    );
  }

  Widget _buildScoreItem(BuildContext context, String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(
          icon,
          color: Colors.white,
          size: 24,
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        Text(
          label,
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: Colors.white.withValues(alpha: 0.8),
          ),
        ),
      ],
    );
  }

  Widget _buildRulesSection(BuildContext context) {
    if (appliedRules.isEmpty) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Applied Rules',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          ...appliedRules.map((rule) => _buildRuleItem(context, rule)),
        ],
      ),
    );
  }

  Widget _buildRuleItem(BuildContext context, ApprovalRule rule) {
    final isPassed = _isRulePassed(rule);
    
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(
            isPassed ? Icons.check_circle : Icons.cancel,
            color: isPassed ? Colors.green : Colors.red,
            size: 20,
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              rule.name,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.white.withValues(alpha: 0.9),
              ),
            ),
          ),
          if (rule.ruleType == RuleType.score) ...[
            Text(
              '${rule.getThresholdPercentage()}%',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: Colors.white.withValues(alpha: 0.7),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildFeedbackSection(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Feedback',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            evaluation.feedback ?? 'No feedback available',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.white.withValues(alpha: 0.9),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context, bool isApproved, bool isRejected) {
    return Row(
      children: [
        if (isRejected && onRetryPressed != null) ...[
          Expanded(
            child: ElevatedButton.icon(
              onPressed: onRetryPressed,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry Chapter'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
        ],
        Expanded(
          child: ElevatedButton.icon(
            onPressed: onContinuePressed,
            icon: Icon(isApproved ? Icons.arrow_forward : Icons.home),
            label: Text(isApproved ? 'Continue' : 'Back to Home'),
            style: ElevatedButton.styleFrom(
              backgroundColor: isApproved ? Colors.green : Colors.blue,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          ),
        ),
      ],
    );
  }

  List<Color> _getGradientColors(bool isApproved, bool isPending) {
    if (isApproved) {
      return [Colors.green.shade400, Colors.green.shade600];
    } else if (isPending) {
      return [Colors.orange.shade400, Colors.orange.shade600];
    } else {
      return [Colors.red.shade400, Colors.red.shade600];
    }
  }

  bool _isRulePassed(ApprovalRule rule) {
    switch (rule.ruleType) {
      case RuleType.score:
        return evaluation.score >= rule.getThresholdPercentage();
      case RuleType.errors:
        return evaluation.errorsFromPreviousAttempts <= (rule.threshold?.toInt() ?? 0);
      case RuleType.time:
        // Time evaluation would need additional data from evaluationData
        final timeSpent = evaluation.evaluationData?['timeSpent'] as int? ?? 0;
        return timeSpent <= (rule.threshold?.toInt() ?? 0);
      case RuleType.attempts:
        return evaluation.attemptNumber <= (rule.threshold?.toInt() ?? 1);
    }
  }
}