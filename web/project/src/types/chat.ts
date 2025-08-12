export interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  phase?: 'search' | 'document';
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  phase: 'search' | 'document';
  createdAt: Date;
  uploadedFiles?: UploadedFile[];
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  uploadedAt: Date;
  file: File;
}

export interface GrantCall {
  id: string;
  title: string;
  description: string;
  deadline: string;
  amount: string;
  category: string;
}