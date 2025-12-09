
import React from 'react';
import {
  BackArrowIcon,
  MoneyBagIcon,
  DocumentIcon,
  ReceiptIcon,
  DownloadIcon,
  CreditCardIcon,
} from './Icons';

interface FacturationDashboardProps {
  onNavigateBack: () => void;
  onNavigateToEdition: () => void;
  onNavigateToRecapitulatifs: () => void;
  onNavigateToDepot: () => void;
  onNavigateToReglement: () => void;
}

const FacturationCard = ({ icon, title, onClick }: { icon: React.ReactNode, title: string, onClick?: () => void }) => (
  <div onClick={onClick} className={`bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center space-x-4 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 min-h-[112px] ${onClick ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
    {icon}
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
  </div>
);

const FacturationDashboard: React.FC<FacturationDashboardProps> = ({ onNavigateBack, onNavigateToEdition, onNavigateToRecapitulatifs, onNavigateToDepot, onNavigateToReglement }) => {
  return (
    <div className="container mx-auto p-6 lg:p-10">
      <div className="text-center mb-16 mt-8">
        <div className="flex items-center justify-center space-x-3">
          <MoneyBagIcon className="h-10 w-10 text-yellow-500" />
          <h2 className="text-4xl font-bold text-gray-800">Module Facturation</h2>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <FacturationCard icon={<DocumentIcon className="h-8 w-8 text-blue-500" />} title="Edition des factures" onClick={onNavigateToEdition} />
          <FacturationCard icon={<ReceiptIcon className="h-8 w-8 text-green-500" />} title="Gestion des récapitulatifs" onClick={onNavigateToRecapitulatifs} />
          <FacturationCard icon={<DownloadIcon className="h-8 w-8 text-red-500" />} title="Dépôt des factures" onClick={onNavigateToDepot} />
          <FacturationCard icon={<CreditCardIcon className="h-8 w-8 text-indigo-500" />} title="Règlement des factures" onClick={onNavigateToReglement} />
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

export default FacturationDashboard;
