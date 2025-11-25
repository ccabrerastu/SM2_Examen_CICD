import {
  ConversationContext,
  ConversationSummary,
  ContextRelationship,
  ContextType,
  ContextStatus,
} from '../../../domain/entities/conversation-context.entity';

export interface IConversationContextRepository {
  // Context management
  create(contextData: Partial<ConversationContext>): Promise<ConversationContext>;
  findById(id: string): Promise<ConversationContext | null>;
  findBySessionId(sessionId: string, status?: ContextStatus): Promise<ConversationContext[]>;
  findByKey(sessionId: string, contextKey: string): Promise<ConversationContext | null>;
  findByType(sessionId: string, contextType: ContextType): Promise<ConversationContext[]>;
  update(id: string, updateData: Partial<ConversationContext>): Promise<ConversationContext>;
  delete(id: string): Promise<void>;

  // Context operations
  upsertContext(
    sessionId: string,
    contextKey: string,
    contextValue: Record<string, unknown>,
    contextType: ContextType,
    priority?: number,
  ): Promise<ConversationContext>;

  mergeContext(
    sessionId: string,
    contextKey: string,
    newValue: Record<string, unknown>,
  ): Promise<ConversationContext>;

  archiveContext(id: string): Promise<ConversationContext>;
  activateContext(id: string): Promise<ConversationContext>;

  // Context queries
  findActiveContexts(sessionId: string): Promise<ConversationContext[]>;
  findContextsByPriority(
    sessionId: string,
    minPriority: number,
    maxPriority: number,
  ): Promise<ConversationContext[]>;

  findRecentContexts(sessionId: string, hours: number): Promise<ConversationContext[]>;
  findMostAccessedContexts(sessionId: string, limit: number): Promise<ConversationContext[]>;

  // Context search
  searchContexts(
    sessionId: string,
    searchQuery: string,
    contextTypes?: ContextType[],
  ): Promise<ConversationContext[]>;

  // Context cleanup
  cleanupExpiredContexts(): Promise<number>;
  archiveOldContexts(olderThanDays: number): Promise<number>;
  deleteArchivedContexts(olderThanDays: number): Promise<number>;

  // Context analytics
  getContextStats(sessionId: string): Promise<{
    totalContexts: number;
    activeContexts: number;
    contextsByType: Record<string, number>;
    averageAccessCount: number;
  }>;

  // Bulk operations
  createMany(contexts: Partial<ConversationContext>[]): Promise<ConversationContext[]>;
  deleteBySessionId(sessionId: string): Promise<void>;
  updateAccess(contextIds: string[]): Promise<void>;
}

export interface IConversationSummaryRepository {
  // Summary management
  create(summaryData: Partial<ConversationSummary>): Promise<ConversationSummary>;
  findById(id: string): Promise<ConversationSummary | null>;
  findBySessionId(sessionId: string): Promise<ConversationSummary[]>;
  findBySummaryType(sessionId: string, summaryType: string): Promise<ConversationSummary[]>;
  update(id: string, updateData: Partial<ConversationSummary>): Promise<ConversationSummary>;
  delete(id: string): Promise<void>;

  // Summary operations
  generateSummary(
    sessionId: string,
    summaryType: string,
    messageRangeStart: number,
    messageRangeEnd: number,
    summaryContent: Record<string, unknown>,
  ): Promise<ConversationSummary>;

  findLatestSummary(sessionId: string, summaryType: string): Promise<ConversationSummary | null>;
  findSummariesByRange(
    sessionId: string,
    messageRangeStart: number,
    messageRangeEnd: number,
  ): Promise<ConversationSummary[]>;

  // Summary queries
  findHighConfidenceSummaries(
    sessionId: string,
    minConfidence: number,
  ): Promise<ConversationSummary[]>;

  // Bulk operations
  createMany(summaries: Partial<ConversationSummary>[]): Promise<ConversationSummary[]>;
  deleteBySessionId(sessionId: string): Promise<void>;
  updateConfidenceScores(updates: { summaryId: string; score: number }[]): Promise<void>;
}

export interface IContextRelationshipRepository {
  // Relationship management
  create(relationshipData: Partial<ContextRelationship>): Promise<ContextRelationship>;
  findById(id: string): Promise<ContextRelationship | null>;
  findByParentContext(parentContextId: string): Promise<ContextRelationship[]>;
  findByChildContext(childContextId: string): Promise<ContextRelationship[]>;
  findByRelationshipType(
    relationshipType: string,
    contextId?: string,
  ): Promise<ContextRelationship[]>;
  update(id: string, updateData: Partial<ContextRelationship>): Promise<ContextRelationship>;
  delete(id: string): Promise<void>;

  // Relationship operations
  createRelationship(
    parentContextId: string,
    childContextId: string,
    relationshipType: string,
    strength?: number,
    metadata?: Record<string, unknown>,
  ): Promise<ContextRelationship>;

  updateStrength(id: string, newStrength: number): Promise<ContextRelationship>;

  // Relationship queries
  findStrongRelationships(contextId: string, minStrength: number): Promise<ContextRelationship[]>;

  findRelatedContexts(
    contextId: string,
    relationshipTypes?: string[],
  ): Promise<
    {
      context: ConversationContext;
      relationship: ContextRelationship;
      isParent: boolean;
    }[]
  >;

  // Graph operations
  findContextPath(
    fromContextId: string,
    toContextId: string,
    maxDepth?: number,
  ): Promise<ContextRelationship[]>;

  findContextClusters(sessionId: string): Promise<
    {
      clusterId: string;
      contexts: ConversationContext[];
      relationships: ContextRelationship[];
    }[]
  >;

  // Cleanup operations
  deleteWeakRelationships(maxStrength: number): Promise<number>;
  deleteByContextId(contextId: string): Promise<void>;
}
