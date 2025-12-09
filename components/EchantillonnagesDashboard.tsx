
import React from 'react';
import FeatureCard from './FeatureCard';
import {
  TestTubeIcon,
  BackArrowIcon,
  PinIcon,
  RegisterIcon,
  CycleIcon,
} from './Icons';

interface EchantillonnagesDashboardProps {
  onNavigateBack: () => void;
  onNavigateToSondageLots: () => void;
  onNavigateToRegistreSondages: () => void;
  onNavigateToBrassageEchantillons: () => void;
  onNavigateToRegistreBrassages: () => void;
}

const echantillonnagesFeatures = [
  {
    icon: <PinIcon className="h-8 w-8 text-red-500" />,
    title: 'Sondage des lots',
    description: '',
    navigateTo: 'sondageLots',
  },
  {
    icon: <RegisterIcon className="h-8 w-8 text-gray-500" />,
    title: 'Registre de sondage',
    description: '',
    navigateTo: 'registreSondages',
  },
  {
    icon: <CycleIcon className="h-8 w-8 text-blue-500" />,
    title: 'Brassages des échantillons',
    description: '',
    navigateTo: 'brassageEchantillons',
  },
  {
    icon: <RegisterIcon className="h-8 w-8 text-gray-500" />,
    title: 'Registre de brassages',
    description: '',
    navigateTo: 'registreBrassages',
  },
];

const EchantillonnagesDashboard: React.FC<EchantillonnagesDashboardProps> = ({ onNavigateBack, onNavigateToSondageLots, onNavigateToRegistreSondages, onNavigateToBrassageEchantillons, onNavigateToRegistreBrassages }) => {
  const handleNavigation = (target?: string) => {
    if (target === 'sondageLots') {
      onNavigateToSondageLots();
    } else if (target === 'registreSondages') {
      onNavigateToRegistreSondages();
    } else if (target === 'brassageEchantillons') {
      onNavigateToBrassageEchantillons();
    } else if (target === 'registreBrassages') {
      onNavigateToRegistreBrassages();
    }
  };
  
  return (
    <div className="container mx-auto p-6 lg:p-10">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-10 text-center border border-gray-200">
        <div className="flex items-center justify-center mb-2">
          <TestTubeIcon className="h-8 w-8 text-green-500 mr-3" />
          <h2 className="text-3xl font-bold text-gray-800">Module Échantillonnages</h2>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {echantillonnagesFeatures.map((feature, index) => (
              <div key={index}
                   onClick={() => handleNavigation(feature.navigateTo)}
                   className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-6 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 cursor-pointer">
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

export default EchantillonnagesDashboard;