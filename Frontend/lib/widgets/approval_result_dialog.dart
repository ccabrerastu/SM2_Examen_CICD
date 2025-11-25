import 'package:flutter/material.dart';
import '../models/approval_evaluation.dart';
import '../models/approval_rule.dart';
import 'approval_result_card.dart';

class ApprovalResultDialog extends StatelessWidget {
  final ApprovalEvaluation evaluation;
  final List<ApprovalRule> appliedRules;
  final VoidCallback? onRetryPressed;
  final VoidCallback? onContinuePressed;
  final bool canDismiss;

  const ApprovalResultDialog({
    super.key,
    required this.evaluation,
    required this.appliedRules,
    this.onRetryPressed,
    this.onContinuePressed,
    this.canDismiss = true,
  });

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: canDismiss,
      child: Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.all(16),
        child: SingleChildScrollView(
          child: ApprovalResultCard(
            evaluation: evaluation,
            appliedRules: appliedRules,
            onRetryPressed: onRetryPressed != null
                ? () {
                    Navigator.of(context).pop();
                    onRetryPressed!();
                  }
                : null,
            onContinuePressed: onContinuePressed != null
                ? () {
                    Navigator.of(context).pop();
                    onContinuePressed!();
                  }
                : () => Navigator.of(context).pop(),
          ),
        ),
      ),
    );
  }

  /// Show the approval result dialog
  static Future<void> show({
    required BuildContext context,
    required ApprovalEvaluation evaluation,
    required List<ApprovalRule> appliedRules,
    VoidCallback? onRetryPressed,
    VoidCallback? onContinuePressed,
    bool canDismiss = true,
  }) {
    return showDialog<void>(
      context: context,
      barrierDismissible: canDismiss,
      builder: (context) => ApprovalResultDialog(
        evaluation: evaluation,
        appliedRules: appliedRules,
        onRetryPressed: onRetryPressed,
        onContinuePressed: onContinuePressed,
        canDismiss: canDismiss,
      ),
    );
  }
}

/// A simplified version for quick feedback
class QuickApprovalFeedback extends StatelessWidget {
  final ApprovalEvaluation evaluation;
  final VoidCallback? onTap;

  const QuickApprovalFeedback({
    super.key,
    required this.evaluation,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isApproved = evaluation.isApproved();
    final isPending = evaluation.isPending();
    
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.all(8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: _getBackgroundColor(isApproved, isPending),
          borderRadius: BorderRadius.circular(8),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              _getIcon(isApproved, isPending),
              color: Colors.white,
              size: 20,
            ),
            const SizedBox(width: 8),
            Text(
              _getTitle(isApproved, isPending),
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (onTap != null) ...[
              const SizedBox(width: 8),
              const Icon(
                Icons.arrow_forward_ios,
                color: Colors.white,
                size: 16,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Color _getBackgroundColor(bool isApproved, bool isPending) {
    if (isApproved) {
      return Colors.green;
    } else if (isPending) {
      return Colors.orange;
    } else {
      return Colors.red;
    }
  }

  IconData _getIcon(bool isApproved, bool isPending) {
    if (isApproved) {
      return Icons.check_circle;
    } else if (isPending) {
      return Icons.hourglass_empty;
    } else {
      return Icons.cancel;
    }
  }

  String _getTitle(bool isApproved, bool isPending) {
    if (isApproved) {
      return 'Chapter Approved!';
    } else if (isPending) {
      return 'Evaluation Pending';
    } else {
      return 'Not Approved';
    }
  }

  /// Show as a snackbar
  static void showSnackbar({
    required BuildContext context,
    required ApprovalEvaluation evaluation,
    VoidCallback? onTap,
    Duration duration = const Duration(seconds: 4),
  }) {
    final snackBar = SnackBar(
      content: QuickApprovalFeedback(
        evaluation: evaluation,
        onTap: onTap,
      ),
      backgroundColor: Colors.transparent,
      elevation: 0,
      duration: duration,
      behavior: SnackBarBehavior.floating,
    );

    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  }
}

/// Loading dialog for approval evaluation
class ApprovalEvaluationLoadingDialog extends StatelessWidget {
  final String chapterId;

  const ApprovalEvaluationLoadingDialog({
    super.key,
    required this.chapterId,
  });

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircularProgressIndicator(),
            const SizedBox(height: 16),
            Text(
              'Evaluating Chapter',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Checking approval rules...',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Show the loading dialog
  static Future<void> show({
    required BuildContext context,
    required String chapterId,
  }) {
    return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (context) => ApprovalEvaluationLoadingDialog(
        chapterId: chapterId,
      ),
    );
  }
}