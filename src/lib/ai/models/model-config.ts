import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

// Model identifiers (could be moved to env vars)
export const MODELS = {
  PRIMARY: anthropic.chat('claude-3-5-sonnet-20241022'),
  FALLBACK: openai.chat('gpt-4o'),
};

export const DEFAULT_GENERATION_OPTS = {
  temperature: 0.3,
  maxTokens: 1500,
};
