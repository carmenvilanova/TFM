import React from 'react';
import { Calendar, DollarSign, Tag } from 'lucide-react';
import { GrantCall } from '../types/chat';

interface GrantCardProps {
  grant: GrantCall;
  onSelect: (grant: GrantCall) => void;
}

export const GrantCard: React.FC<GrantCardProps> = ({ grant, onSelect }) => {
  return (
    <div className="bg-white border border-amber-200 rounded-lg p-5 hover-lift cursor-pointer hover:border-red-300 animate-fade-in transition-all-smooth">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-800 text-lg line-clamp-2">{grant.title}</h3>
        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium transition-all-smooth hover:bg-red-200">
          {grant.category}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">{grant.description}</p>
      
      <div className="flex items-center gap-6 text-sm text-gray-500 mb-5">
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-amber-600" />
          <span>{grant.amount}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-red-600" />
          <span>{grant.deadline}</span>
        </div>
      </div>
      
      <button
        onClick={() => onSelect(grant)}
        className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all-smooth text-sm font-medium shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
      >
        Consultar Esta Ayuda
      </button>
    </div>
  );
};