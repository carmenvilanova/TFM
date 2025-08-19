import React from 'react';
import { CheckCircle, XCircle, EyeOff } from 'lucide-react';

interface StatusBadgeProps {
  status: 'abierta' | 'cerrada' | 'cerrada-no-publica';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'abierta':
        return {
          icon: CheckCircle,
          text: 'Abierta',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
          hoverBg: 'hover:bg-green-200'
        };
      case 'cerrada':
        return {
          icon: XCircle,
          text: 'Cerrada',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          hoverBg: 'hover:bg-red-200'
        };
      case 'cerrada-no-publica':
        return {
          icon: EyeOff,
          text: 'Cerrada (No pública)',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          hoverBg: 'hover:bg-gray-200'
        };
      default:
        return {
          icon: XCircle,
          text: status,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
          hoverBg: 'hover:bg-gray-200'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all-smooth ${config.bgColor} ${config.textColor} ${config.hoverBg}`}>
      <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
      {config.text}
    </div>
  );
};
