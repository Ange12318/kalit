
import React from 'react';
import FeatureCard from './FeatureCard';
import {
  DashboardIcon,
  BoxIcon,
  TestTubeIcon,
  TagIcon,
  MicroscopeIcon,
  WarehouseIcon,
  MoneyBagIcon,
  DatabaseIcon,
  GearIcon,
  ChartBarIcon
} from './Icons';

interface DashboardProps {
  onNavigateToTraitements: () => void;
  onNavigateToEchantillons: () => void;
  onNavigateToCodification: () => void;
  onNavigateToParametrage: () => void;
  onNavigateToStatistiques: () => void;
  onNavigateToLaboratoires: () => void;
  onNavigateToBaseDeDonnees: () => void;
  onNavigateToFacturation: () => void;
  onNavigateToStockages: () => void;
}

const features = [
  {
    icon: <BoxIcon className="h-10 w-10 text-orange-500" />,
    title: 'Traitements',
    description: 'Gestion des demandes et analyses qualité',
    navTarget: 'traitements'
  },
  {
    icon: <TestTubeIcon className="h-10 w-10 text-green-500" />,
    title: 'Échantillons',
    description: 'Sondage et brassage des échantillons',
    navTarget: 'echantillons'
  },
  {
    icon: <TagIcon className="h-10 w-10 text-red-500" />,
    title: 'Codifications',
    description: 'Gestion des codes et identification',
    navTarget: 'codifications',
  },
  {
    icon: <MicroscopeIcon className="h-10 w-10 text-cyan-500" />,
    title: 'Laboratoires',
    description: 'Analyses et contrôles qualité',
    navTarget: 'laboratoires',
  },
  {
    icon: <WarehouseIcon className="h-10 w-10 text-amber-600" />,
    title: 'Stockages',
    description: 'Gestion des stocks et entreposage',
    navTarget: 'stockages',
  },
  {
    icon: <MoneyBagIcon className="h-10 w-10 text-yellow-500" />,
    title: 'Facturation',
    description: 'Factures et règlements',
    navTarget: 'facturation',
  },
  {
    icon: <DatabaseIcon className="h-10 w-10 text-indigo-500" />,
    title: 'Base de données',
    description: 'Import/Export des données',
    navTarget: 'baseDeDonnees',
  },
  {
    icon: <GearIcon className="h-10 w-10 text-gray-500" />,
    title: 'Paramétrage',
    description: 'Configuration du système',
    navTarget: 'parametrage',
  },
  {
    icon: <ChartBarIcon className="h-10 w-10 text-blue-500" />,
    title: 'Statistiques',
    description: 'Rapports et analyses statistiques',
    navTarget: 'statistiques',
  },
];

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToTraitements, onNavigateToEchantillons, onNavigateToCodification, onNavigateToParametrage, onNavigateToStatistiques, onNavigateToLaboratoires, onNavigateToBaseDeDonnees, onNavigateToFacturation, onNavigateToStockages }) => {

  const handleNavigation = (target?: string) => {
    if (target === 'traitements') {
      onNavigateToTraitements();
    } else if (target === 'echantillons') {
      onNavigateToEchantillons();
    } else if (target === 'codifications') {
      onNavigateToCodification();
    } else if (target === 'parametrage') {
      onNavigateToParametrage();
    } else if (target === 'statistiques') {
      onNavigateToStatistiques();
    } else if (target === 'laboratoires') {
      onNavigateToLaboratoires();
    } else if (target === 'baseDeDonnees') {
      onNavigateToBaseDeDonnees();
    } else if (target === 'facturation') {
      onNavigateToFacturation();
    } else if (target === 'stockages') {
      onNavigateToStockages();
    }
  };

  return (
    <div className="container mx-auto p-6 lg:p-10">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-10 text-center border border-gray-200">
        <div className="flex items-center justify-center mb-2">
          <DashboardIcon className="h-8 w-8 text-blue-800 mr-3" />
          <h2 className="text-3xl font-bold text-gray-800">Tableau de Bord</h2>
        </div>
        <p className="text-gray-500">Bienvenue dans votre espace de traitement des BV</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            onClick={feature.navTarget ? () => handleNavigation(feature.navTarget) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
