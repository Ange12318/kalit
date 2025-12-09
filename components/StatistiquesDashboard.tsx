
import React from 'react';
import {
  BackArrowIcon,
  ChartBarIcon,
  PinIcon,
  ScalesIcon,
  LineChartIcon,
} from './Icons';

interface StatistiquesDashboardProps {
  onNavigateBack: () => void;
}

const StatCard = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center space-x-4 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 cursor-pointer min-h-[112px]">
    {icon}
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
  </div>
);

const StatistiquesDashboard: React.FC<StatistiquesDashboardProps> = ({ onNavigateBack }) => {
  return (
    <div className="container mx-auto p-6 lg:p-10">
       <div className="text-center mb-16 mt-8">
        <div className="flex items-center justify-center space-x-3">
          <ChartBarIcon className="h-10 w-10 text-[#0d2d53]" />
          <h2 className="text-4xl font-bold text-gray-800">Module Statistiques</h2>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <StatCard icon={<PinIcon className="h-8 w-8 text-red-500" />} title="Bilan trimestriel" />
          <StatCard icon={<ScalesIcon className="h-8 w-8 text-yellow-600" />} title="Statistiques du tonnage" />
        </div>
        <div className="flex justify-center">
          <div className="w-full sm:max-w-sm">
             <StatCard icon={<LineChartIcon className="h-8 w-8 text-green-500" />} title="Moyenne des déterminants qualité" />
          </div>
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

export default StatistiquesDashboard;
