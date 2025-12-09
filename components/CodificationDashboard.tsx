
import React from 'react';
import {
  BackArrowIcon,
  TagIcon,
  PinIcon,
  BlindSampleIcon,
  InterLabAnalysisIcon,
  RegisterIcon,
  CalendarCodeIcon,
} from './Icons';

interface CodificationDashboardProps {
  onNavigateBack: () => void;
  onNavigateToLotsACodifier: () => void;
  onNavigateToRegistreCodification: () => void;
  onNavigateToInitialisationCodeJour: () => void;
}

const codificationFeatures = [
  {
    icon: <PinIcon className="h-8 w-8 text-red-500" />,
    title: 'Listes des lots à codifier',
    navigateTo: 'listLotsToCode',
  },
  {
    icon: <BlindSampleIcon className="h-8 w-8 text-indigo-500" />,
    title: 'Échantillons aveugles',
    navigateTo: 'blindSamples',
  },
  {
    icon: <InterLabAnalysisIcon className="h-8 w-8 text-cyan-500" />,
    title: 'Analyse inter-labo',
    navigateTo: 'interLabAnalysis',
  },
  {
    icon: <RegisterIcon className="h-8 w-8 text-gray-500" />,
    title: 'Registre des codifications',
    navigateTo: 'codificationRegister',
  },
  {
    icon: <CalendarCodeIcon className="h-8 w-8 text-blue-500" />,
    title: 'Initialiser le code du jour',
    navigateTo: 'initDailyCode',
  },
];

const CodificationDashboard: React.FC<CodificationDashboardProps> = ({ onNavigateBack, onNavigateToLotsACodifier, onNavigateToRegistreCodification, onNavigateToInitialisationCodeJour }) => {
  const handleNavigation = (target?: string) => {
    if (target === 'listLotsToCode') {
      onNavigateToLotsACodifier();
    } else if (target === 'codificationRegister') {
      onNavigateToRegistreCodification();
    } else if (target === 'initDailyCode') {
      onNavigateToInitialisationCodeJour();
    }
    // Add other navigation logic here when other pages are created
  };

  return (
    <div className="container mx-auto p-6 lg:p-10">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-10 text-center border border-gray-200">
        <div className="flex items-center justify-center mb-2">
          <TagIcon className="h-8 w-8 text-red-500 mr-3" />
          <h2 className="text-3xl font-bold text-gray-800">Module Codification</h2>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {codificationFeatures.slice(0, 4).map((feature, index) => (
              <div key={index}
                   onClick={() => handleNavigation(feature.navigateTo)}
                   className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-6 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 cursor-pointer">
                  {feature.icon}
                  <h3 className="text-lg font-semibold text-gray-700">{feature.title}</h3>
              </div>
            ))}
        </div>
        <div className="mt-8 flex justify-center">
             <div 
                onClick={() => handleNavigation(codificationFeatures[4].navigateTo)}
                className="bg-white rounded-xl shadow-md p-6 flex items-center space-x-6 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 w-full sm:w-auto cursor-pointer">
                  {codificationFeatures[4].icon}
                  <h3 className="text-lg font-semibold text-gray-700">{codificationFeatures[4].title}</h3>
              </div>
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

export default CodificationDashboard;
