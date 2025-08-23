import React from 'react';
import { Calendar, DollarSign, ExternalLink, Download, Building2, FileText } from 'lucide-react';
import { SearchResult } from '../types/chat';
import { StatusBadge } from './StatusBadge';

interface SearchResultCardProps {
  result: SearchResult;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({ result }) => {
  const formatDate = (dateString: string) => {
    try {
      if (dateString.includes('T')) {
        return new Date(dateString).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  const formatAmount = (amount: string | null | undefined): string => {
    if (!amount) return "No especificado";
  
    // quitar comas de miles
    const clean = amount.replace(/,/g, "");
  
    const numAmount = parseFloat(clean);
    if (Number.isNaN(numAmount) || numAmount === 0) return "No especificado";
  
    return numAmount.toLocaleString("es-ES", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  
  

  const isPDF = (url: string) => {
    return url.toLowerCase().includes('.pdf');
  };

  const handleBasesClick = () => {
    window.open(result.bases, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = () => {
    // For PDF files, trigger download
    if (isPDF(result.bases)) {
      const link = document.createElement('a');
      link.href = result.bases;
      link.download = `convocatoria_${result.numeroConvocatoria}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      handleBasesClick();
    }
  };

  return (
    <div className="bg-white border border-amber-200 rounded-lg p-6 hover-lift hover:border-red-300 animate-fade-in transition-all-smooth">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-500">
              N° {result.numeroConvocatoria}
            </span>
            <StatusBadge status={result.estado} />
          </div>
          <h3 className="font-semibold text-gray-800 text-lg line-clamp-2 leading-relaxed">
            {result.descripcion}
          </h3>
        </div>
      </div>

      {/* Organization info */}
      <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
        <Building2 className="w-4 h-4 text-gray-600 flex-shrink-0" />
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-800 truncate">{result.nivel2}</div>
          <div className="text-xs text-gray-600 truncate">{result.nivel1}</div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-500">Presupuesto</div>
              <div className="text-sm font-medium text-gray-800">
                {formatAmount(result.presupuesto_total)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-600 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-500">Fecha de recepción</div>
              <div className="text-sm font-medium text-gray-800">
                {formatDate(result.fechaRecepcion)}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Período de solicitud</div>
            <div className="text-sm text-gray-700">
              <div className="font-medium">Inicio: {result.inicio}</div>
              <div className="font-medium">Fin: {result.final}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {isPDF(result.bases) ? (
          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-all-smooth text-sm font-medium shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <Download className="w-4 h-4" />
            Descargar Bases (PDF)
          </button>
        ) : (
          <button
            onClick={handleBasesClick}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all-smooth text-sm font-medium shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <ExternalLink className="w-4 h-4" />
            Ver Sitio Web
          </button>
        )}
        
        <button
          onClick={handleBasesClick}
          className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all-smooth text-sm font-medium border border-gray-300 hover:border-gray-400"
        >
          <FileText className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
