// User types
export interface UserProfile {
  id: string;
  email: string;
  age: number;
  location: string;
  agreedToTerms: boolean;
  createdAt: string;
}

// Chat types
export interface ChatMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  inputTokens?: number;
  outputTokens?: number;
  cachedTokens?: number;
  modelUsed?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

// API types
export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  usage: TokenUsage;
  isCrisis: boolean;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  estimatedCost: number;
}

// Resource types
export interface Resource {
  id: string;
  name: string;
  type: "hotline" | "service" | "hospital" | "psychologist";
  description: string;
  phone?: string;
  website?: string;
  address?: string;
  region: "Victoria" | "National";
  tags: string[];
  priority: number;
  active: boolean;
}

// Crisis types
export interface CrisisDetectionResult {
  isCrisis: boolean;
  severity: "high" | "medium" | "low";
  indicators: string[];
}

// Rate limiting
export interface RateLimitStatus {
  allowed: boolean;
  reason?: string;
  resetAt?: string;
}

// NextAuth extensions
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}
