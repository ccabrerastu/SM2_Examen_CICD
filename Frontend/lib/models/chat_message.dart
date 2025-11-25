
class ChatMessage {
  final String content;
  final bool isUserMessage;
  final bool isTyping;
  final String timestamp;
  
  ChatMessage({
    required this.content,
    required this.isUserMessage,
    this.isTyping = false,
    String? timestamp,
  }) : timestamp = timestamp ?? _getCurrentTime();
  
  static String _getCurrentTime() {
    final now = DateTime.now();
    return '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
  }
}