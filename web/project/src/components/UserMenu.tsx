import React, { useState } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { User as UserType } from '../types/auth';

interface UserMenuProps {
  user: UserType;
  onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-amber-200 rounded-lg hover:bg-amber-50 transition-all-smooth hover:scale-105 hover:shadow-md"
      >
        <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center transition-all-smooth hover:scale-110">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-800">
            {user.name}
            {user.isGuest && <span className="text-amber-600 ml-1">(Invitado)</span>}
          </div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform-smooth ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-amber-200 rounded-lg shadow-lg z-20 animate-fade-in">
            {!user.isGuest && (
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-amber-50 flex items-center gap-2 transition-all-smooth hover:scale-105">
                <Settings className="w-4 h-4 transition-transform-smooth hover:rotate-90" />
                Configuración
              </button>
            )}
            <button 
              onClick={onLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-all-smooth hover:scale-105"
            >
              <LogOut className="w-4 h-4 transition-transform-smooth hover:translate-x-1" />
              {user.isGuest ? 'Salir' : 'Cerrar Sesión'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};