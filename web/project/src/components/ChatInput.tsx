import React, { useState, useRef } from 'react';
import { Send, Mic, Paperclip, MicOff, Upload, X } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  onFileUpload?: (files: File[]) => void;
  allowFileUpload?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading = false, 
  placeholder = "Pregunta sobre ayudas...",
  onFileUpload,
  allowFileUpload = true
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showTextRequiredError, setShowTextRequiredError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If there are uploaded files but no text, show error
    if (uploadedFiles.length > 0 && !message.trim()) {
      setShowTextRequiredError(true);
      return;
    }
    
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      setShowTextRequiredError(false);
      // Clear uploaded files after sending
      setUploadedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadedFiles(files);
      if (onFileUpload) {
        onFileUpload(files);
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAllFiles = () => {
    setUploadedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        // Aquí puedes enviar el audio a tu API de speech-to-text
        convertSpeechToText(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('No se pudo acceder al micrófono. Verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const convertSpeechToText = async (audioBlob: Blob) => {
    // Simulación de conversión de voz a texto
    // Aquí deberíamos integrar con el API de speech-to-text! :)
    try {
      // Simulamos una respuesta de la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      const transcribedText = "Texto transcrito desde el audio"; // Reemplazar con respuesta real de la API
      setMessage(prev => prev + (prev ? ' ' : '') + transcribedText);
    } catch (error) {
      console.error('Error converting speech to text:', error);
      alert('Error al convertir el audio a texto');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bg-white border-t border-amber-200">
      {allowFileUpload && uploadedFiles.length > 0 && (
        <div className="px-4 pt-3 pb-2 border-b border-amber-100 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {uploadedFiles.length} archivo{uploadedFiles.length > 1 ? 's' : ''} seleccionado{uploadedFiles.length > 1 ? 's' : ''}
            </span>
            {uploadedFiles.length > 1 && (
              <button
                type="button"
                onClick={removeAllFiles}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
              >
                Quitar todos
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {uploadedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg transition-all-smooth hover:bg-amber-100">
                <Upload className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 flex-1 truncate" title={file.name}>
                  {file.name}
                </span>
                <span className="text-xs text-gray-500 flex-shrink-0">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 text-red-500 hover:text-red-700 transition-all-smooth hover:scale-110 hover:bg-red-50 rounded flex-shrink-0"
                >
                  <X className="w-4 h-4 transition-transform-smooth hover:rotate-90" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Error message for missing text */}
      {showTextRequiredError && (
        <div className="px-4 pt-2 pb-1 animate-fade-in">
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
            <span className="text-sm text-red-700 font-medium">
              El texto es obligatorio cuando se suben archivos
            </span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex gap-3 p-4">
        {allowFileUpload && (
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.txt"
            multiple
            className="hidden"
          />
        )}
        
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              // Clear error when user starts typing
              if (showTextRequiredError) {
                setShowTextRequiredError(false);
              }
            }}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            className={`w-full px-4 py-3 ${allowFileUpload ? 'pr-12' : 'pr-4'} bg-amber-50 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none min-h-[52px] max-h-32 text-gray-800`}
            rows={1}
          />
          {allowFileUpload && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-2 top-2 p-2 text-amber-400 hover:text-amber-600 transition-all-smooth hover:scale-110 hover:bg-amber-50 rounded"
              disabled={isLoading}
              title="Adjuntar documento"
            >
              <Paperclip className="w-4 h-4 transition-transform-smooth hover:rotate-12" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`p-3 transition-all-smooth hover:scale-110 rounded-lg ${
              isRecording 
                ? 'text-red-500 hover:text-red-700 bg-red-50 animate-pulse-gentle' 
                : 'text-amber-400 hover:text-amber-600 hover:bg-amber-50'
            }`}
            disabled={isLoading}
            title={isRecording ? "Detener grabación" : "Grabar mensaje de voz"}
          >
            {isRecording ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all-smooth flex items-center gap-2 font-medium shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <Send className={`w-4 h-4 transition-transform-smooth ${isLoading ? 'animate-pulse' : 'group-hover:translate-x-1'}`} />
            {isLoading ? (
              <span className="loading-dots">Enviando</span>
            ) : (
              'Enviar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};