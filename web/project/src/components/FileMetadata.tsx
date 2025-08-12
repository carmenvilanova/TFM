import React from 'react';
import { Download, FileText, Calendar, HardDrive, X } from 'lucide-react';
import { UploadedFile } from '../types/chat';

interface FileMetadataProps {
  file: UploadedFile;
  onDownload: (file: UploadedFile) => void;
  onRemove: (fileId: string) => void;
}

export const FileMetadata: React.FC<FileMetadataProps> = ({ file, onDownload, onRemove }) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('text')) return '📃';
    return '📁';
  };

  return (
    <div className="bg-white border border-amber-200 rounded-lg p-4 shadow-sm hover-lift animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-lg">
            {getFileIcon(file.type)}
          </div>
          <div>
            <h4 className="font-medium text-gray-800 truncate max-w-xs">{file.name}</h4>
            <p className="text-sm text-gray-500">{file.type}</p>
          </div>
        </div>
        <button
          onClick={() => onRemove(file.id)}
          className="p-1 text-red-500 hover:text-red-700 transition-all-smooth hover:scale-110 hover:bg-red-50 rounded"
          title="Eliminar archivo"
        >
          <X className="w-4 h-4 transition-transform-smooth hover:rotate-90" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <HardDrive className="w-4 h-4 text-amber-600" />
          <span>{formatFileSize(file.size)}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4 text-amber-600" />
          <span>{formatDate(file.lastModified)}</span>
        </div>
      </div>

      <div className="bg-amber-50 rounded-lg p-3 mb-4">
        <h5 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Metadatos del Archivo
        </h5>
        <div className="space-y-1 text-sm text-amber-700">
          <div><strong>ID:</strong> {file.id}</div>
          <div><strong>Subido:</strong> {file.uploadedAt.toLocaleString('es-ES')}</div>
          <div><strong>Última modificación:</strong> {formatDate(file.lastModified)}</div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onDownload(file)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all-smooth font-medium shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
        >
          <Download className="w-4 h-4 transition-transform-smooth group-hover:translate-y-1" />
          Descargar
        </button>
        <button
          onClick={() => {
            // Aqui meteremos lo de enviar al backend el archivo! 
            console.log('Enviando archivo al backend:', {
              id: file.id,
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified
            });
            alert(`Archivo "${file.name}" enviado al backend (Aqui implementariamos nuestra funcionalidad para enviarlo al backend pero esta recuperando la info! :D)`);
          }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all-smooth font-medium shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
        >
          <FileText className="w-4 h-4 transition-transform-smooth group-hover:scale-110" />
          Enviar al Backend
        </button>
      </div>
    </div>
  );
};