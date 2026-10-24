class SourceCitation {
  final String documentName;
  final int chunkIndex;
  final double relevanceScore;
  final String excerpt;

  SourceCitation({
    required this.documentName,
    required this.chunkIndex,
    required this.relevanceScore,
    required this.excerpt,
  });

  factory SourceCitation.fromJson(Map<String, dynamic> json) {
    return SourceCitation(
      documentName: json['document_name'] ?? 'Documento Interno',
      chunkIndex: json['chunk_index'] ?? 0,
      relevanceScore: (json['relevance_score'] as num?)?.toDouble() ?? 0.0,
      excerpt: json['excerpt'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'document_name': documentName,
    'chunk_index': chunkIndex,
    'relevance_score': relevanceScore,
    'excerpt': excerpt,
  };
}
