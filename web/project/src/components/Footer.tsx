import React from 'react';
import { useTranslation } from 'react-i18next';
import { Building2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t border-amber-200 px-4 py-3 mt-auto">
      <div className="flex items-center justify-center text-xs text-gray-500">
        <Building2 className="w-3 h-3 text-red-600 mr-2" />
        <span className="font-bold">{t('common.dataSource')}</span>
      </div>
    </footer>
  );
};
