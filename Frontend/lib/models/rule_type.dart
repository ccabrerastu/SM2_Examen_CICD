enum RuleType {
  score('score'),
  errors('errors'),
  time('time'),
  attempts('attempts');

  const RuleType(this.value);
  final String value;

  static RuleType fromString(String value) {
    return RuleType.values.firstWhere(
      (type) => type.value == value,
      orElse: () => RuleType.score,
    );
  }

  @override
  String toString() => value;
}