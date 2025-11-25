import { Injectable } from '@nestjs/common';
import { IConversationContextRepository } from '../interfaces/repositories/conversation-context-repository.interface';
import {
  ConversationContext,
  ContextType,
  ContextStatus,
} from '../../domain/entities/conversation-context.entity';

export interface ContextManagementRequest {
  sessionToken: string;
  contextType: ContextType;
  contextData: Record<string, unknown>;
  priority?: number;
}

export interface ContextRetrievalRequest {
  sessionToken: string;
  contextKeys?: string[];
  includeHistory?: boolean;
  maxHistoryItems?: number;
}

export interface ContextUpdateRequest {
  sessionToken: string;
  updates: Record<string, unknown>;
  mergeStrategy?: 'replace' | 'merge' | 'append';
}

interface HistoryItem {
  role: string;
  content: string;
  timestamp?: string;
}

interface ConversationFlow {
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  averageMessageLength: number;
  lastMessageTime: string | null;
}

@Injectable()
export class ContextManagementService {
  constructor(private readonly contextRepository: IConversationContextRepository) {}

  async storeContext(request: ContextManagementRequest): Promise<ConversationContext> {
    const contextData = {
      sessionId: request.sessionToken,
      contextKey: this.generateContextKey(request.contextType),
      contextValue: request.contextData,
      contextType: request.contextType,
      priority: request.priority || 1,
      status: ContextStatus.ACTIVE,
    };

    return await this.contextRepository.create(contextData);
  }

  async retrieveContext(request: ContextRetrievalRequest): Promise<Record<string, unknown>> {
    const contexts = await this.contextRepository.findBySessionId(request.sessionToken);

    const contextMap: Record<string, unknown> = {};

    for (const context of contexts) {
      if (request.contextKeys && !request.contextKeys.includes(context.contextKey)) {
        continue;
      }

      try {
        contextMap[context.contextKey] = context.contextValue;
      } catch (error) {
        console.warn(`Failed to parse context value for key ${context.contextKey}:`, error);
        contextMap[context.contextKey] = context.contextValue;
      }
    }

    if (request.includeHistory) {
      const history = await this.contextRepository.findRecentContexts(
        request.sessionToken,
        24, // Last 24 hours
      );
      contextMap['_history'] = history.slice(0, request.maxHistoryItems || 10);
    }

    return contextMap;
  }

  async updateContext(request: ContextUpdateRequest): Promise<void> {
    for (const [key, value] of Object.entries(request.updates)) {
      await this.updateSingleContextKey(request, key, value);
    }
  }

  private async updateSingleContextKey(
    request: ContextUpdateRequest,
    key: string,
    value: unknown,
  ): Promise<void> {
    const existingContext = await this.contextRepository.findByKey(request.sessionToken, key);

    if (existingContext) {
      const newValue = this.mergeContextValue(
        existingContext.contextValue,
        value,
        request.mergeStrategy,
      );

      await this.contextRepository.update(existingContext.id, {
        contextValue: newValue,
      });
    } else {
      await this.storeContext({
        sessionToken: request.sessionToken,
        contextType: ContextType.SESSION_STATE,
        contextData: { [key]: value },
      });
    }
  }

  private mergeContextValue(
    existingValue: Record<string, unknown>,
    newValue: unknown,
    mergeStrategy?: string,
  ): Record<string, unknown> {
    if (mergeStrategy === 'merge' && this.isObject(newValue)) {
      if (this.isObject(existingValue)) {
        return { ...existingValue, ...newValue };
      }
    } else if (mergeStrategy === 'append' && Array.isArray(newValue)) {
      if (Array.isArray(existingValue)) {
        return [...existingValue, ...newValue] as unknown as Record<string, unknown>;
      }
    }

    return newValue as Record<string, unknown>;
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  async clearContext(sessionToken: string, contextKeys?: string[]): Promise<void> {
    if (contextKeys) {
      for (const key of contextKeys) {
        const contexts = await this.contextRepository.findBySessionId(sessionToken);
        const contextToDelete = contexts.find(ctx => ctx.contextKey === key);
        if (contextToDelete) {
          await this.contextRepository.delete(contextToDelete.id);
        }
      }
    } else {
      const contexts = await this.contextRepository.findBySessionId(sessionToken);
      for (const context of contexts) {
        await this.contextRepository.delete(context.id);
      }
    }
  }

  async buildConversationPrompt(sessionToken: string): Promise<string> {
    const context = await this.retrieveContext({
      sessionToken,
      includeHistory: true,
      maxHistoryItems: 5,
    });

    const promptParts: string[] = [];

    // Add session context
    if (context.sessionInfo) {
      promptParts.push(`Session Context: ${JSON.stringify(context.sessionInfo)}`);
    }

    // Add user preferences
    if (context.userPreferences) {
      promptParts.push(`User Preferences: ${JSON.stringify(context.userPreferences)}`);
    }

    // Add current conversation state
    if (context.conversationState) {
      promptParts.push(`Current State: ${JSON.stringify(context.conversationState)}`);
    }

    // Add recent history
    if (context._history && Array.isArray(context._history) && context._history.length > 0) {
      const historyText = (context._history as HistoryItem[])
        .map((item: HistoryItem) => `${item.role}: ${item.content}`)
        .join('\n');
      promptParts.push(`Recent History:\n${historyText}`);
    }

    return promptParts.join('\n\n');
  }

  async createContextSummary(sessionToken: string): Promise<string> {
    const context = await this.retrieveContext({
      sessionToken,
      includeHistory: true,
    });

    const summary = {
      totalContextItems: Object.keys(context).length,
      lastUpdated: new Date().toISOString(),
      keyTopics: this.extractKeyTopics(context),
      conversationFlow: this.analyzeConversationFlow(
        Array.isArray(context._history) ? (context._history as HistoryItem[]) : [],
      ),
    };

    return JSON.stringify(summary, null, 2);
  }

  private generateContextKey(contextType: ContextType): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${contextType}_${timestamp}_${random}`;
  }

  private extractKeyTopics(context: Record<string, unknown>): string[] {
    const topics: Set<string> = new Set();

    // Extract topics from context values
    for (const value of Object.values(context)) {
      if (typeof value === 'object' && value !== null && 'topics' in value) {
        const topicsValue = (value as { topics: unknown }).topics;
        if (Array.isArray(topicsValue)) {
          topicsValue.forEach((topic: unknown) => {
            if (typeof topic === 'string') {
              topics.add(topic);
            }
          });
        }
      }
    }

    return Array.from(topics);
  }

  private analyzeConversationFlow(history: HistoryItem[]): ConversationFlow {
    if (!history || history.length === 0) {
      return {
        totalMessages: 0,
        userMessages: 0,
        assistantMessages: 0,
        averageMessageLength: 0,
        lastMessageTime: null,
      };
    }

    const userMessages = history.filter(h => h.role === 'user').length;
    const assistantMessages = history.filter(h => h.role === 'assistant').length;
    const totalLength = history.reduce((sum, h) => sum + h.content.length, 0);
    const lastMessage = history[history.length - 1];

    return {
      totalMessages: history.length,
      userMessages,
      assistantMessages,
      averageMessageLength: totalLength / history.length,
      lastMessageTime: lastMessage?.timestamp || null,
    };
  }
}
