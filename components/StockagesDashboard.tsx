
import React from 'react';
import {
  BackArrowIcon,
  WarehouseIcon,
  ClipboardListIcon,
} from './Icons';

interface StockagesDashboardProps {
  onNavigateBack: () => void;
  onNavigateToGestionStockage: () => void;
}

const StockageCard = ({ icon, title, onClick }: { icon: React.ReactNode, title: string, onClick?: () => void }) => (
  <div onClick={onClick} className={`bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center space-x-4 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 cursor-pointer min-h-[112px]`}>
    {icon}
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
  </div>
);

const StockagesDashboard: React.FC<StockagesDashboardProps> = ({ onNavigateBack, onNavigateToGestionStockage }) => {
  return (
    <div className="container mx-auto p-6 lg:p-10">
      <div className="text-center mb-16 mt-8">
        <div className="flex items-center justify-center space-x-3">
          <WarehouseIcon className="h-10 w-10 text-amber-600" />
          <h2 className="text-4xl font-bold text-gray-800">Module Stockages</h2>
        </div>
      </div>

      <div className="w-full max-w-xl mx-auto">
        <StockageCard icon={<ClipboardListIcon className="h-8 w-8 text-indigo-500" />} title="Gestion des Stocks" onClick={onNavigateToGestionStockage} />
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

export default StockagesDashboard;
