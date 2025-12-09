import React, { useState } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TraitementsDashboard from './components/TraitementsDashboard';
import DemandesAutorites from './components/DemandesAutorites';
import NouvelleDemande from './components/NouvelleDemande';
import ModifierDemande from './components/modifierdemande'; // NOUVEAU
import ImprimerOrdreSondage from './components/ImprimerOrdreSondage'; // NOUVEAU
import ValidationCacao from './components/ValidationCacao';
import ValidationCafe from './components/ValidationCafe';
import ExportBVCacao from './components/ExportBVCacao';
import ExportBVCafe from './components/ExportBVCafe';
import EchantillonnagesDashboard from './components/EchantillonnagesDashboard';
import SondageLots from './components/SondageLots';
import RegistreSondages from './components/RegistreSondages';
import BrassageEchantillons from './components/BrassageEchantillons';
import RegistreBrassages from './components/RegistreBrassages';
import CodificationDashboard from './components/CodificationDashboard';
import LotsACodifier from './components/LotsACodifier';
import RegistreCodification from './components/RegistreCodification';
import InitialisationCodeJour from './components/InitialisationCodeJour';
import ParametrageDashboard from './components/ParametrageDashboard';
import GestionExportateurs from './components/GestionExportateurs';
import GestionUtilisateurs from './components/GestionUtilisateurs';
import ConfigurationGenerale from './components/ConfigurationGenerale';
import GestionMagasins from './components/GestionMagasins';
import StatistiquesDashboard from './components/StatistiquesDashboard';
import LaboratoiresDashboard from './components/LaboratoiresDashboard';
import BaseDeDonneesDashboard from './components/BaseDeDonneesDashboard';
import FacturationDashboard from './components/FacturationDashboard';
import StockagesDashboard from './components/StockagesDashboard';
import GestionStockage from './components/GestionStockage';
import DemandesClientsStandards from './components/DemandesClientsStandards';
import AnalysesLaboratoire from './components/AnalysesLaboratoire';
import ResultatsAnalyses from './components/ResultatsAnalyses';
import GestionEquipe from './components/GestionEquipe';
import PlanningAnalyses from './components/PlanningAnalyses';
import EditionFactures from './components/EditionFactures';
import GestionRecapitulatifs from './components/GestionRecapitulatifs';
import DepotFactures from './components/DepotFactures';
import ReglementFactures from './components/ReglementFactures';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedDemandeId, setSelectedDemandeId] = useState<number | null>(null); // NOUVEAU

  const navigateToDashboard = () => setCurrentView('dashboard');
  const navigateToTraitements = () => setCurrentView('traitements');
  const navigateToEchantillonnages = () => setCurrentView('echantillonnages');
  const navigateToCodification = () => setCurrentView('codification');
  const navigateToParametrage = () => setCurrentView('parametrage');
  const navigateToStatistiques = () => setCurrentView('statistiques');
  const navigateToLaboratoires = () => setCurrentView('laboratoires');
  const navigateToBaseDeDonnees = () => setCurrentView('baseDeDonnees');
  const navigateToFacturation = () => setCurrentView('facturation');
  const navigateToStockages = () => setCurrentView('stockages');
  
  const navigateToDemandesAutorites = () => setCurrentView('demandesAutorites');
  const navigateToDemandesClientsStandards = () => setCurrentView('demandesClientsStandards');
  const navigateToNouvelleDemande = () => setCurrentView('nouvelleDemande');
  
  // NOUVELLES FONCTIONS DE NAVIGATION
  const navigateToModifierDemande = (demandeId: number) => {
    setSelectedDemandeId(demandeId);
    setCurrentView('modifierDemande');
  };

  const navigateToImprimerOrdre = (demandeId: number) => {
    setSelectedDemandeId(demandeId);
    setCurrentView('imprimerOrdreSondage');
  };

  const navigateToValidationCacao = () => setCurrentView('validationCacao');
  const navigateToValidationCafe = () => setCurrentView('validationCafe');
  const navigateToExportBVCacao = () => setCurrentView('exportBVCacao');
  const navigateToExportBVCafe = () => setCurrentView('exportBVCafe');
  
  const navigateToSondageLots = () => setCurrentView('sondageLots');
  const navigateToRegistreSondages = () => setCurrentView('registreSondages');
  const navigateToBrassageEchantillons = () => setCurrentView('brassageEchantillons');
  const navigateToRegistreBrassages = () => setCurrentView('registreBrassages');
  
  const navigateToLotsACodifier = () => setCurrentView('lotsACodifier');
  const navigateToRegistreCodification = () => setCurrentView('registreCodification');
  const navigateToInitialisationCodeJour = () => setCurrentView('initialisationCodeJour');
  
  const navigateToGestionExportateurs = () => setCurrentView('gestionExportateurs');
  const navigateToGestionUtilisateurs = () => setCurrentView('gestionUtilisateurs');
  const navigateToConfigurationGenerale = () => setCurrentView('configurationGenerale');
  const navigateToGestionMagasins = () => setCurrentView('gestionMagasins');

  const navigateToGestionStockage = () => setCurrentView('gestionStockage');

  const navigateToAnalysesLaboratoire = () => setCurrentView('analysesLaboratoire');
  const navigateToResultatsAnalyses = () => setCurrentView('resultatsAnalyses');
  const navigateToGestionEquipe = () => setCurrentView('gestionEquipe');
  const navigateToPlanningAnalyses = () => setCurrentView('planningAnalyses');

  const navigateToEditionFactures = () => setCurrentView('editionFactures');
  const navigateToGestionRecapitulatifs = () => setCurrentView('gestionRecapitulatifs');
  const navigateToDepotFactures = () => setCurrentView('depotFactures');
  const navigateToReglementFactures = () => setCurrentView('reglementFactures');


  const renderContent = () => {
    switch (currentView) {
      case 'traitements':
        return <TraitementsDashboard 
                  onNavigateBack={navigateToDashboard} 
                  onNavigateToDemandes={navigateToDemandesAutorites}
                  onNavigateToDemandesClients={navigateToDemandesClientsStandards}
                  onNavigateToValidationCacao={navigateToValidationCacao} 
                  onNavigateToValidationCafe={navigateToValidationCafe}
                  onNavigateToExportBVCacao={navigateToExportBVCacao}
                  onNavigateToExportBVCafe={navigateToExportBVCafe}
                />;
      case 'echantillonnages':
        return <EchantillonnagesDashboard 
                  onNavigateBack={navigateToDashboard} 
                  onNavigateToSondageLots={navigateToSondageLots} 
                  onNavigateToRegistreSondages={navigateToRegistreSondages} 
                  onNavigateToBrassageEchantillons={navigateToBrassageEchantillons}
                  onNavigateToRegistreBrassages={navigateToRegistreBrassages}
                />;
      case 'codification':
        return <CodificationDashboard 
                  onNavigateBack={navigateToDashboard} 
                  onNavigateToLotsACodifier={navigateToLotsACodifier} 
                  onNavigateToRegistreCodification={navigateToRegistreCodification}
                  onNavigateToInitialisationCodeJour={navigateToInitialisationCodeJour}
                />;
      case 'parametrage':
        return <ParametrageDashboard 
                  onNavigateBack={navigateToDashboard} 
                  onNavigateToGestionExportateurs={navigateToGestionExportateurs} 
                  onNavigateToGestionUtilisateurs={navigateToGestionUtilisateurs}
                  onNavigateToConfigurationGenerale={navigateToConfigurationGenerale}
                  onNavigateToGestionMagasins={navigateToGestionMagasins}
                />;
      case 'statistiques':
        return <StatistiquesDashboard onNavigateBack={navigateToDashboard} />;
      case 'laboratoires':
        return <LaboratoiresDashboard 
                  onNavigateBack={navigateToDashboard}
                  onNavigateToAnalyses={navigateToAnalysesLaboratoire}
                  onNavigateToResultats={navigateToResultatsAnalyses}
                  onNavigateToEquipe={navigateToGestionEquipe}
                  onNavigateToPlanning={navigateToPlanningAnalyses}
                />;
      case 'baseDeDonnees':
        return <BaseDeDonneesDashboard onNavigateBack={navigateToDashboard} />;
      case 'facturation':
        return <FacturationDashboard 
                  onNavigateBack={navigateToDashboard}
                  onNavigateToEdition={navigateToEditionFactures}
                  onNavigateToRecapitulatifs={navigateToGestionRecapitulatifs}
                  onNavigateToDepot={navigateToDepotFactures}
                  onNavigateToReglement={navigateToReglementFactures}
                />;
      case 'stockages':
        return <StockagesDashboard onNavigateBack={navigateToDashboard} onNavigateToGestionStockage={navigateToGestionStockage} />;
      case 'gestionStockage':
        return <GestionStockage onNavigateBack={navigateToStockages} />;
      case 'gestionExportateurs':
        return <GestionExportateurs onNavigateBack={navigateToParametrage} />;
      case 'gestionUtilisateurs':
        return <GestionUtilisateurs onNavigateBack={navigateToParametrage} />;
      case 'configurationGenerale':
        return <ConfigurationGenerale onNavigateBack={navigateToParametrage} />;
      case 'gestionMagasins':
        return <GestionMagasins onNavigateBack={navigateToParametrage} />;
      case 'lotsACodifier':
        return <LotsACodifier onNavigateBack={navigateToCodification} />;
      case 'registreCodification':
        return <RegistreCodification onNavigateBack={navigateToCodification} />;
      case 'initialisationCodeJour':
        return <InitialisationCodeJour onNavigateBack={navigateToCodification} />;
      case 'sondageLots':
        return <SondageLots onNavigateBack={navigateToEchantillonnages} />;
      case 'registreSondages':
        return <RegistreSondages onNavigateBack={navigateToEchantillonnages} />;
      case 'brassageEchantillons':
        return <BrassageEchantillons onNavigateBack={navigateToEchantillonnages} />;
      case 'registreBrassages':
        return <RegistreBrassages onNavigateBack={navigateToEchantillonnages} />;
      case 'demandesAutorites':
        return <DemandesAutorites 
                  onNavigateBack={navigateToTraitements} 
                  onNavigateToNouvelleDemande={navigateToNouvelleDemande}
                  onNavigateToModifierDemande={navigateToModifierDemande} // NOUVEAU
                  onNavigateToImprimerOrdre={navigateToImprimerOrdre} // NOUVEAU
                />;
      case 'demandesClientsStandards':
        return <DemandesClientsStandards onNavigateBack={navigateToTraitements} />;
      case 'nouvelleDemande':
        return <NouvelleDemande onNavigateBack={navigateToDemandesAutorites} />;
      case 'modifierDemande': // NOUVEAU
        return selectedDemandeId ? (
          <ModifierDemande 
            onNavigateBack={navigateToDemandesAutorites} 
            demandeId={selectedDemandeId} 
          />
        ) : null;
      case 'imprimerOrdreSondage': // NOUVEAU
        return selectedDemandeId ? (
          <ImprimerOrdreSondage 
            onNavigateBack={navigateToDemandesAutorites} 
            demandeId={selectedDemandeId} 
          />
        ) : null;
      case 'validationCacao':
        return <ValidationCacao onNavigateBack={navigateToTraitements} />;
      case 'validationCafe':
        return <ValidationCafe onNavigateBack={navigateToTraitements} />;
      case 'exportBVCacao':
        return <ExportBVCacao onNavigateBack={navigateToTraitements} />;
      case 'exportBVCafe':
        return <ExportBVCafe onNavigateBack={navigateToTraitements} />;
      case 'analysesLaboratoire':
        return <AnalysesLaboratoire onNavigateBack={navigateToLaboratoires} />;
      case 'resultatsAnalyses':
        return <ResultatsAnalyses onNavigateBack={navigateToLaboratoires} />;
      case 'gestionEquipe':
        return <GestionEquipe onNavigateBack={navigateToLaboratoires} />;
      case 'planningAnalyses':
        return <PlanningAnalyses onNavigateBack={navigateToLaboratoires} />;
      case 'editionFactures':
        return <EditionFactures onNavigateBack={navigateToFacturation} />;
      case 'gestionRecapitulatifs':
        return <GestionRecapitulatifs onNavigateBack={navigateToFacturation} />;
      case 'depotFactures':
        return <DepotFactures onNavigateBack={navigateToFacturation} />;
      case 'reglementFactures':
        return <ReglementFactures onNavigateBack={navigateToFacturation} />;
      case 'dashboard':
      default:
        return <Dashboard 
                onNavigateToTraitements={navigateToTraitements} 
                onNavigateToEchantillons={navigateToEchantillonnages} 
                onNavigateToCodification={navigateToCodification} 
                onNavigateToParametrage={navigateToParametrage}
                onNavigateToStatistiques={navigateToStatistiques}
                onNavigateToLaboratoires={navigateToLaboratoires}
                onNavigateToBaseDeDonnees={navigateToBaseDeDonnees}
                onNavigateToFacturation={navigateToFacturation}
                onNavigateToStockages={navigateToStockages}
              />;
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;