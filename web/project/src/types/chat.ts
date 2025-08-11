export interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  phase?: 'search' | 'document';
  grants?: GrantCall[]; // <-- Añade esta línea
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  phase: 'search' | 'document';
  createdAt: Date;
}

export interface GrantCall {
  id: string;
  title: string;
  description: string;
  deadline: string;
  amount: string;
  category: string;
}