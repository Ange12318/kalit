
import React from 'react';
import {
  BackArrowIcon,
  TestTubeIcon,
  MicroscopeIcon,
  ChartBarIcon,
  UserIcon,
  CalendarIcon,
} from './Icons';

interface LaboratoiresDashboardProps {
  onNavigateBack: () => void;
  onNavigateToAnalyses: () => void;
  onNavigateToResultats: () => void;
  onNavigateToEquipe: () => void;
  onNavigateToPlanning: () => void;
}

const LabCard = ({ icon, title, onClick }: { icon: React.ReactNode, title: string, onClick?: () => void }) => (
  <div onClick={onClick} className={`bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center space-x-4 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 min-h-[112px] ${onClick ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
    {icon}
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
  </div>
);

const LaboratoiresDashboard: React.FC<LaboratoiresDashboardProps> = ({ onNavigateBack, onNavigateToAnalyses, onNavigateToResultats, onNavigateToEquipe, onNavigateToPlanning }) => {
  return (
    <div className="container mx-auto p-6 lg:p-10">
      <div className="text-center mb-16 mt-8">
        <div className="flex items-center justify-center space-x-3">
          <TestTubeIcon className="h-10 w-10 text-green-500" />
          <h2 className="text-4xl font-bold text-gray-800">Module Laboratoires</h2>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <LabCard icon={<MicroscopeIcon className="h-8 w-8 text-cyan-500" />} title="Analyses en laboratoire" onClick={onNavigateToAnalyses} />
          <LabCard icon={<ChartBarIcon className="h-8 w-8 text-blue-500" />} title="Résultats d'analyses" onClick={onNavigateToResultats} />
          <LabCard icon={<UserIcon className="h-8 w-8 text-purple-500" />} title="Gestion de l'équipe" onClick={onNavigateToEquipe} />
          <LabCard icon={<CalendarIcon className="h-8 w-8 text-gray-500" />} title="Planning des analyses" onClick={onNavigateToPlanning} />
        </div>
      </div>
      
      <div className="mt-20">
        <button
          onClick={onNavigateBack}
          className="flex items-center space-x-2 bg-[#0d2d53] hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-colors"
        >
          <BackArrowIcon className="h-5 w-5" />
          <span>Retour</span>
        </button>
      </div>
    </div>
  );
};

export default LaboratoiresDashboard;
