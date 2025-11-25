import 'dart:convert';

class UserModel {
  final String id;
  final String name;
  final String email;
  final String? profileImage;
  
  UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.profileImage,
  });
  
  UserModel copyWith({
    String? id,
    String? name,
    String? email,
    String? profileImage,
  }) {
    return UserModel(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      profileImage: profileImage ?? this.profileImage,
    );
  }
  
  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'profileImage': profileImage,
    };
  }
  
  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      id: map['id'] ?? '',
      name: map['name'] ?? '',
      email: map['email'] ?? '',
      profileImage: map['profileImage'],
    );
  }
  
  String toJson() => json.encode(toMap());
  
  factory UserModel.fromJson(String source) => UserModel.fromMap(json.decode(source));
  
  @override
  String toString() {
    return 'UserModel(id: $id, name: $name, email: $email, profileImage: $profileImage)';
  }
  
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    
    return other is UserModel &&
        other.id == id &&
        other.name == name &&
        other.email == email &&
        other.profileImage == profileImage;
  }
  
  @override
  int get hashCode {
    return id.hashCode ^
        name.hashCode ^
        email.hashCode ^
        profileImage.hashCode;
  }
}