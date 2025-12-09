
import React from 'react';
import {
  BackArrowIcon,
  UsersIcon,
} from './Icons';

interface GestionEquipeProps {
  onNavigateBack: () => void;
}

const GestionEquipe: React.FC<GestionEquipeProps> = ({ onNavigateBack }) => {
  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="bg-[#0d2d53] text-white rounded-xl p-6 flex items-center shadow-lg">
        <UsersIcon className="h-10 w-10 mr-4" />
        <div>
          <h2 className="text-3xl font-bold">Gestion de l'Équipe</h2>
          <p className="text-blue-200">Administration des membres de l'équipe du laboratoire</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border text-center h-64 flex flex-col justify-center items-center">
        <h3 className="text-2xl font-bold text-gray-800">Fonctionnalité à venir</h3>
        <p className="text-gray-500 mt-2">Cet écran permettra de gérer les utilisateurs et leurs rôles au sein du laboratoire.</p>
      </div>
      
      <div className="mt-8">
        <button onClick={onNavigateBack} className="flex items-center space-x-2 bg-[#0d2d53] hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-colors">
          <BackArrowIcon className="h-5 w-5" />
          <span>Retour</span>
        </button>
      </div>
    </div>
  );
};

export default GestionEquipe;
