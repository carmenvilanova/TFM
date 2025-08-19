import React from 'react';
import { Search, FileText } from 'lucide-react';
import { SearchResultsResponse } from '../types/chat';
import { SearchResultCard } from './SearchResultCard';

interface SearchResultsListProps {
  data: SearchResultsResponse;
}

export const SearchResultsList: React.FC<SearchResultsListProps> = ({ data }) => {
  const { resultados } = data;

  if (!resultados || resultados.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
        <Search className="w-8 h-8 text-amber-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-amber-800 mb-2">
          No se encontraron resultados
        </h3>
        <p className="text-amber-700">
          Intenta con diferentes términos de búsqueda o revisa los filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <FileText className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-bold text-gray-800">
          Resultados de búsqueda ({resultados.length})
        </h3>
      </div>

      {/* Results grid */}
      <div className="grid gap-4">
        {resultados.map((result, index) => (
          <SearchResultCard 
            key={result.numeroConvocatoria || index} 
            result={result} 
          />
        ))}
      </div>

      {/* Footer info */}
      {resultados.length > 5 && (
        <div className="text-center mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Se encontraron {resultados.length} convocatorias que coinciden con tu búsqueda
          </p>
        </div>
      )}
    </div>
  );
};
