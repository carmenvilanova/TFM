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
  messages: Message[]; // Deprecated - keeping for backward compatibility
  searchMessages: Message[];
  documentMessages: Message[];
  phase: 'search' | 'document'; // Deprecated - keeping for backward compatibility
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

export interface SearchResult {
  numeroConvocatoria: string;
  descripcion: string;
  fechaRecepcion: string;
  nivel1: string;
  nivel2: string;
  presupuesto_total: string;
  inicio: string;
  final: string;
  bases: string;
  estado: 'abierta' | 'cerrada' | 'cerrada-no-publica';
}

export interface SearchResultsResponse {
  resultados: SearchResult[];
}