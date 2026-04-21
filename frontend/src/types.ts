export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface SpecsResponse {
  files: string[];
}

export interface ChatResponse {
  reply: string;
}
