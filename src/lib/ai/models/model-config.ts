import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

// Model identifiers (could be moved to env vars)
export const MODELS = {
  PRIMARY: anthropic.chat('claude-3-7-sonnet-20250219'), // Back to working Claude 3.5 model (3.7 overloaded)
  FALLBACK: openai.chat('gpt-4o'),
};

export const DEFAULT_GENERATION_OPTS = {
  temperature: 0.2,
};

// Extended options for Code Generation Agent (needs more tokens for complete components)
export const CODE_GENERATION_OPTS = {
  temperature: 0.2,
  maxTokens: 3000,
};
