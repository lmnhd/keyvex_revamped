import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

// Model identifiers (could be moved to env vars)
export const MODELS = {
  PRIMARY: anthropic.chat('claude-3-5-sonnet-20250514'), // Claude Sonnet 4 - Latest model
  FALLBACK: openai.chat('gpt-4o'),
};

export const DEFAULT_GENERATION_OPTS = {
  temperature: 0.3,
  maxTokens: 1500,
};

// Extended options for Code Generation Agent (needs more tokens for complete components)
export const CODE_GENERATION_OPTS = {
  temperature: 0.3,
  maxTokens: 8000, // Increased for complete React component generation
};
