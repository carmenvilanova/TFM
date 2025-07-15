import React from 'react';
import { Search, FileText } from 'lucide-react';

interface PhaseSelectorProps {
  currentPhase: 'search' | 'document';
  onPhaseChange: (phase: 'search' | 'document') => void;
}

export const PhaseSelector: React.FC<PhaseSelectorProps> = ({ currentPhase, onPhaseChange }) => {
  return (
    <div className="flex gap-1 p-1 bg-amber-100 rounded-lg shadow-inner">
      <button
        onClick={() => onPhaseChange('search')}
        className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          currentPhase === 'search'
            ? 'bg-white text-red-600 shadow-md'
            : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
        }`}
      >
        <Search className="w-4 h-4" />
        Búsqueda de Ayudas
      </button>
      <button
        onClick={() => onPhaseChange('document')}
        className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          currentPhase === 'document'
            ? 'bg-white text-red-600 shadow-md'
            : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
        }`}
      >
        <FileText className="w-4 h-4" />
        Consulta de Documentos
      </button>
    </div>
  );
};