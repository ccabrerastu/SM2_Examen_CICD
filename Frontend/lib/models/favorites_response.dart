import 'favorite_word.dart';

class FavoritesResponse {
  final List<FavoriteWord> favorites;
  final int total;
  final String? message;

  const FavoritesResponse({
    required this.favorites,
    required this.total,
    this.message,
  });

  factory FavoritesResponse.fromJson(Map<String, dynamic> json) {
    return FavoritesResponse(
      favorites: json['favorites'] != null
          ? (json['favorites'] as List)
              .map((item) => FavoriteWord.fromJson(item as Map<String, dynamic>))
              .toList()
          : [],
      total: json['total'] ?? 0,
      message: json['message'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'favorites': favorites.map((f) => f.toJson()).toList(),
      'total': total,
      if (message != null) 'message': message,
    };
  }

  @override
  String toString() {
    return 'FavoritesResponse(favorites: ${favorites.length}, total: $total, message: $message)';
  }
}