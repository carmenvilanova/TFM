import React, { useState, useEffect } from 'react';
import {
  Calendar, DollarSign, ExternalLink, Download,
  Building2, FileText, Loader2, Archive
} from 'lucide-react';
import { SearchResult } from '../types/chat';
import { StatusBadge } from './StatusBadge';

interface SearchResultCardProps {
  result: SearchResult;
}

const API_BASE = 'https://tfm-docker.onrender.com/';

export const SearchResultCard: React.FC<SearchResultCardProps> = ({ result }) => {
  // --- NUEVO: estado de disponibilidad de documentos ---
  // null = desconocido (cargando), true = hay docs, false = no hay
  const [hasDocs, setHasDocs] = useState<boolean | null>(null);

  // Ya tenías estos si agregaste la descarga “real”:
  const [docs, setDocs] = useState<{ id: string; name: string; download: string }[]>([]);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [openDocs, setOpenDocs] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [errorDocs, setErrorDocs] = useState<string | null>(null);

  // --- CHEQUEO PREVIO: saber si hay documentos para esta convocatoria ---
  useEffect(() => {
    let cancel = false;
    async function check() {
      try {
        setHasDocs(null); // loading
        const res = await fetch(`${API_BASE}/convocatorias/${encodeURIComponent(String(result.numeroConvocatoria))}/documentos`);
        if (!res.ok) throw new Error('error');
        const data = await res.json();
        if (!cancel) setHasDocs((data?.documentos?.length ?? 0) > 0);
      } catch {
        if (!cancel) setHasDocs(false);
      }
    }
    check();
    return () => { cancel = true; };
  }, [result.numeroConvocatoria]);

  const formatDate = (dateString: string) => {
    try {
      if (dateString.includes('T')) {
        return new Date(dateString).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
      }
      return dateString;
    } catch { return dateString; }
  };

  const formatAmount = (amount: string | null | undefined): string => {
    if (!amount) return "No especificado";
    const clean = amount.replace(/,/g, "");
    const numAmount = parseFloat(clean);
    if (Number.isNaN(numAmount) || numAmount === 0) return "No especificado";
    return numAmount.toLocaleString("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const isPDF = (url?: string) => !!url && url.toLowerCase().includes('.pdf');

  const handleBasesClick = () => { if (result.bases) window.open(result.bases, '_blank', 'noopener,noreferrer'); };

  const handleDownloadBases = () => {
    if (isPDF(result.bases) && result.bases) {
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

  // Descarga/visualización de documentos reales (cuando sí hay)
  const handleVerDocs = async () => {
    if (hasDocs === false) return; // deshabilitado
    setOpenDocs(true);
    setLoadingDocs(true);
    setErrorDocs(null);
    try {
      const res = await fetch(`${API_BASE}/convocatorias/${encodeURIComponent(String(result.numeroConvocatoria))}/documentos`);
      if (!res.ok) throw new Error('No se pudieron obtener los documentos');
      const data = await res.json();
      const documentos = data.documentos ?? [];
      if (documentos.length === 0) {
        setErrorDocs('Esta convocatoria no tiene documentos.');
        setDocs([]); setZipUrl(null);
        return;
      }
      if (documentos.length === 1) {
        window.location.href = `${API_BASE}${documentos[0].download}`; // descarga directa
        setOpenDocs(false);
        return;
      }
      setDocs(documentos);
      setZipUrl(data.zip ?? null);
    } catch (e: any) {
      setErrorDocs(e.message || 'Error al obtener documentos');
      setDocs([]); setZipUrl(null);
    } finally {
      setLoadingDocs(false);
    }
  };

  // Estilos del botón según disponibilidad
  const docsBtnDisabled = hasDocs !== true;
  const docsBtnLabel =
    hasDocs === null ? 'Comprobando…' :
    docsBtnDisabled ? 'Sin documentos' :
    'Ver/Descargar documentos';

    const docsBtnClass = docsBtnDisabled
    ? 'flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed border border-gray-300'
    : 'flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all-smooth text-sm font-medium shadow-md hover:shadow-lg hover:scale-105 active:scale-95';

  return (
    <div className="bg-white border border-amber-200 rounded-lg p-6 hover-lift hover:border-red-300 animate-fade-in transition-all-smooth">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-500">N° {result.numeroConvocatoria}</span>
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
              <div className="text-sm font-medium text-gray-800">{formatAmount(result.presupuesto_total)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-600 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-500">Fecha de recepción</div>
              <div className="text-sm font-medium text-gray-800">{formatDate(result.fechaRecepcion)}</div>
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
            onClick={handleDownloadBases}
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

        {/* Botón documentos reales (gris si no hay) */}
      <button
        onClick={docsBtnDisabled ? undefined : handleVerDocs}
        disabled={docsBtnDisabled}
        className={docsBtnClass}
        title={docsBtnDisabled ? 'No hay documentos disponibles' : 'Descargar documentos'}
      >
        {hasDocs === null ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
        {hasDocs === null ? 'Comprobando…' : hasDocs ? 'Ver/Descargar documentos' : 'Sin documentos'}
      </button>

      </div>

      {/* Panel de documentos */}
      {openDocs && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          {errorDocs ? (
            <p className="text-sm text-red-600">{errorDocs}</p>
          ) : loadingDocs ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" /> Cargando documentos...
            </div>
          ) : (
            <>
              <ul className="space-y-2">
                {docs.map((d) => (
                  <li key={d.id}>
                    <a className="text-indigo-700 hover:underline font-medium" href={`${API_BASE}${d.download}`}>
                      Descargar: {d.name}
                    </a>
                  </li>
                ))}
              </ul>
              {zipUrl && (
                <a className="mt-3 inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border border-gray-300 hover:bg-white" href={`${API_BASE}${zipUrl}`}>
                  <Archive className="w-4 h-4" />
                  Descargar todos (ZIP)
                </a>
              )}
            </>
          )}
          <div className="mt-3">
            <button className="text-sm text-gray-600 hover:underline" onClick={() => setOpenDocs(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
