
import React from 'react';
import FeatureCard from './FeatureCard';
import {
  ModuleIcon,
  AuthorityIcon,
  UsersIcon,
  ExportIcon,
  DocumentIcon,
  BackArrowIcon
} from './Icons';

interface TraitementsDashboardProps {
  onNavigateBack: () => void;
  onNavigateToDemandes: () => void;
  onNavigateToDemandesClients: () => void;
  onNavigateToValidationCacao: () => void;
  onNavigateToValidationCafe: () => void;
  onNavigateToExportBVCacao: () => void;
  onNavigateToExportBVCafe: () => void;
}

const traitementsFeatures = [
    {
      icon: <AuthorityIcon className="h-10 w-10 text-gray-500" />,
      title: 'Demandes Autorités Ivoirienne',
      description: 'Gestion des demandes officielles des autorités ivoiriennes',
      badgeText: '12 Nouveau',
      navigateTo: 'demandes'
    },
    {
      icon: <UsersIcon className="h-10 w-10 text-purple-500" />,
      title: 'Demandes Clients Standards',
      description: 'Traitement des demandes clients standards',
      navigateTo: 'demandesClients'
    },
    {
      icon: <DocumentIcon className="h-10 w-10 text-green-500" />,
      title: 'Validation Résultats Cacao',
      description: 'Validation des analyses qualité cacao',
      badgeText: '8 En attente',
      navigateTo: 'validationCacao'
    },
    {
      icon: <DocumentIcon className="h-10 w-10 text-green-500" />,
      title: 'Validation Résultats Café',
      description: 'Validation des analyses qualité café',
      badgeText: '5 En attente',
      navigateTo: 'validationCafe'
    },
    {
      icon: <ExportIcon className="h-10 w-10 text-blue-500" />,
      title: 'Export BV Cacao',
      description: 'Export des bulletins de vente cacao',
      navigateTo: 'exportBVCacao'
    },
    {
      icon: <ExportIcon className="h-10 w-10 text-blue-500" />,
      title: 'Export BV Café',
      description: 'Export des bulletins de vente café',
      navigateTo: 'exportBVCafe'
    },
    {
      icon: <DocumentIcon className="h-10 w-10 text-red-400" />,
      title: 'Edition BV/BA Cacao',
      description: 'Édition bulletins de vente et d’analyse cacao',
    },
    {
      icon: <DocumentIcon className="h-10 w-10 text-red-400" />,
      title: 'Edition BV/BA Café',
      description: 'Édition bulletins de vente et d’analyse café',
    },
];

const TraitementsDashboard: React.FC<TraitementsDashboardProps> = ({ onNavigateBack, onNavigateToDemandes, onNavigateToDemandesClients, onNavigateToValidationCacao, onNavigateToValidationCafe, onNavigateToExportBVCacao, onNavigateToExportBVCafe }) => {
  const handleNavigation = (target?: string) => {
    if (target === 'demandes') {
      onNavigateToDemandes();
    } else if (target === 'demandesClients') {
      onNavigateToDemandesClients();
    } else if (target === 'validationCacao') {
      onNavigateToValidationCacao();
    } else if (target === 'validationCafe') {
      onNavigateToValidationCafe();
    } else if (target === 'exportBVCacao') {
      onNavigateToExportBVCacao();
    } else if (target === 'exportBVCafe') {
      onNavigateToExportBVCafe();
    }
  };

  return (
    <div className="container mx-auto p-6 lg:p-10">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-10 text-center border border-gray-200">
        <div className="flex items-center justify-center mb-2">
          <ModuleIcon className="h-8 w-8 text-blue-800 mr-3" />
          <h2 className="text-3xl font-bold text-gray-800">Module Traitements</h2>
        </div>
        <p className="text-gray-500">Gestion complète des demandes d'analyse, validations et éditions des bulletins de qualité</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {traitementsFeatures.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            badgeText={feature.badgeText}
            onClick={feature.navigateTo ? () => handleNavigation(feature.navigateTo) : undefined}
          />
        ))}
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

export default TraitementsDashboard;
