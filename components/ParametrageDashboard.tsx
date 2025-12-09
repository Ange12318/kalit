
import React from 'react';
import {
  GearIcon,
  BackArrowIcon,
  WrenchIcon,
  PinIcon,
  FactoryIcon,
  UserIcon,
} from './Icons';

interface ParametrageDashboardProps {
  onNavigateBack: () => void;
  onNavigateToGestionExportateurs: () => void;
  onNavigateToGestionUtilisateurs: () => void;
  onNavigateToConfigurationGenerale: () => void;
  onNavigateToGestionMagasins: () => void;
}

const parametrageFeatures = [
  {
    icon: <WrenchIcon className="h-8 w-8 text-purple-500" />,
    title: 'Configuration générale',
    navigateTo: 'configurationGenerale',
  },
  {
    icon: <PinIcon className="h-8 w-8 text-red-500" />,
    title: 'Gestion des exportateurs',
    navigateTo: 'gestionExportateurs',
  },
  {
    icon: <FactoryIcon className="h-8 w-8 text-blue-500" />,
    title: 'Gestion des magasins/usines',
    navigateTo: 'gestionMagasins',
  },
  {
    icon: <UserIcon className="h-8 w-8 text-indigo-500" />,
    title: 'Gestion des utilisateurs',
    navigateTo: 'gestionUtilisateurs',
  },
];

const ParametrageDashboard: React.FC<ParametrageDashboardProps> = ({ onNavigateBack, onNavigateToGestionExportateurs, onNavigateToGestionUtilisateurs, onNavigateToConfigurationGenerale, onNavigateToGestionMagasins }) => {
  const handleNavigation = (target?: string) => {
    if (target === 'gestionExportateurs') {
      onNavigateToGestionExportateurs();
    } else if (target === 'gestionUtilisateurs') {
      onNavigateToGestionUtilisateurs();
    } else if (target === 'configurationGenerale') {
      onNavigateToConfigurationGenerale();
    } else if (target === 'gestionMagasins') {
      onNavigateToGestionMagasins();
    }
  };

  return (
    <div className="container mx-auto p-6 lg:p-10">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-10 text-center border border-gray-200">
        <div className="flex items-center justify-center mb-2">
          <GearIcon className="h-8 w-8 text-gray-500 mr-3" />
          <h2 className="text-3xl font-bold text-gray-800">Module Paramétrage</h2>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {parametrageFeatures.map((feature, index) => (
              <div key={index}
                   onClick={() => handleNavigation(feature.navigateTo)}
                   className={`bg-white rounded-xl shadow-md p-6 flex items-center space-x-6 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 ${feature.navigateTo ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                  {feature.icon}
                  <h3 className="text-lg font-semibold text-gray-700">{feature.title}</h3>
              </div>
            ))}
        </div>
      </div>
      
      <div className="mt-12">
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

export default ParametrageDashboard;
