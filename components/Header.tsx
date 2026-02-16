
import React from 'react';
import { LogoIcon, UserIcon, LogoutIcon } from './Icons';

interface HeaderProps {
  user?: { id?: number; nom?: string; login?: string } | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-[#0d2d53] text-white shadow-md">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-white p-2 mr-4 flex items-center justify-center">
            <LogoIcon className="h-8 w-auto text-[#0d2d53]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wider">QUALITIS ACE</h1>
            <p className="text-sm text-gray-300">Application de traitement des BV</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <div className="flex items-center space-x-2 bg-blue-500/20 hover:bg-blue-500/40 text-sm px-3 py-1.5 rounded-full cursor-pointer transition-colors">
                <UserIcon className="h-4 w-4" />
                <span>{user.nom || user.login}</span>
              </div>
              <button onClick={onLogout} className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-sm font-semibold px-4 py-1.5 rounded-md transition-colors">
                <LogoutIcon className="h-4 w-4" />
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2 bg-blue-500/10 text-sm px-3 py-1.5 rounded-full">
              <UserIcon className="h-4 w-4" />
              <span>Invité</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
