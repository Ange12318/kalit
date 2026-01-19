import React, { useState, useEffect, useRef } from 'react';
import {
  BackArrowIcon,
  ChartBarIcon,
  SearchIcon,
  CalendarIcon,
  EmptyBoxIcon,
  EditIconAlt,
  SaveIcon,
  XCircleIcon,
  FilterIcon,
  RefreshIcon,
  CheckCircleIcon,
  DocumentIcon
} from './Icons';

interface ResultatsAnalysesProps {
  onNavigateBack: () => void;
}

interface AnalyseCacao {
  ID_ANALYSE_KKO: number;
  ID_CODIFICATION: number;
  CODE_SECRET_CODIFICATION: string;
  DATE_ANALYSE_KKO: string;
  ANALYSEUR_ANALYSE_KKO: number;
  NOM_ANALYSEUR: string;
  POIDS_BRISURES: number;
  POIDS_DECHET: number;
  POIDS_CRABOT: number;
  POIDS_ETRANGERES: number;
  GRAINAGE: number;
  TAUXHUMIDITE: number;
  MOISIE_CALCULE: number;
  MITEE_CALCULE: number;
  ARDOISEE_CALCULE: number;
  PLATE_CALCULE: number;
  GERMEE_CALCULE: number;
  VIOLETTE_CALCULE: number;
  NORME_IVOIRIENNE: string;
  NORME_INTERNATIONALE: string;
  CONFORME: number;
  REMARQUE: string;
  VALIDER_ANALYSE_KKO: number;
  NUM_LOTS: string;
  RAISONSOCIALE_EXPORTATEUR: string;
  LIBELLE_PRODUIT: string;
  CAMP_DEMANDE: string;
  VILLE_DEMANDE: string;
}

interface AnalyseValidee {
  ID_ANALYSE_VALIDER: number;
  ID_ANALYSE_KKO: number;
  CODE_SECRET_CODIFICATION: string;
  DATE_VALIDATION: string;
  VALIDATEUR_ID: number;
  NOM_VALIDATEUR: string;
  ACTION: string;
  NORME_IVOIRIENNE: string;
  NORME_INTERNATIONALE: string;
  CONFORME: number;
  REMARQUE: string;
  STATUT: string;
  POIDS_BRISURES: number;
  POIDS_DECHET: number;
  POIDS_CRABOT: number;
  POIDS_ETRANGERES: number;
  GRAINAGE: number;
  TAUXHUMIDITE: number;
  MOISIE_CALCULE: number;
  MITEE_CALCULE: number;
  ARDOISEE_CALCULE: number;
  PLATE_CALCULE: number;
  GERMEE_CALCULE: number;
  VIOLETTE_CALCULE: number;
  NUM_LOTS: string;
  RAISONSOCIALE_EXPORTATEUR: string;
  LIBELLE_PRODUIT: string;
  CAMP_DEMANDE: string;
  VILLE_DEMANDE: string;
}

const ResultatsAnalyses: React.FC<ResultatsAnalysesProps> = ({ onNavigateBack }) => {
  // États pour les données
  const [analyses, setAnalyses] = useState<AnalyseCacao[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalyseCacao[]>([]);
  const [analysesValidees, setAnalysesValidees] = useState<AnalyseValidee[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingValidees, setLoadingValidees] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [info, setInfo] = useState('');
  
  // États pour les filtres
  const [codeSecret, setCodeSecret] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [produit, setProduit] = useState('all');
  const [exportateur, setExportateur] = useState('all');
  const [campagne, setCampagne] = useState('all');
  const [ville, setVille] = useState('all');
  const [conformite, setConformite] = useState('all');
  const [statutValidation, setStatutValidation] = useState('all');
  
  // États pour la sélection et validation
  const [selectedAnalyses, setSelectedAnalyses] = useState<number[]>([]);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationType, setValidationType] = useState<'validate' | 'reject'>('validate');
  const [validationRemarque, setValidationRemarque] = useState('');
  
  // États pour l'édition
  const [editingAnalysis, setEditingAnalysis] = useState<AnalyseCacao | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // États pour les données de filtres
  const [campagnes, setCampagnes] = useState<string[]>([]);
  const [villes, setVilles] = useState<string[]>([]);
  const [exportateurs, setExportateurs] = useState<{id: string, nom: string}[]>([]);
  
  // États pour la vue des analyses validées
  const [viewMode, setViewMode] = useState<'toutes' | 'validees'>('toutes');
  
  // Références pour éviter les re-rendus
  const lastSearchParams = useRef<string>('');
  
  // Charger les données des filtres au démarrage
  useEffect(() => {
    chargerDonneesFiltres();
  }, []);
  
  // Fonction pour déterminer la couleur de la ligne
  const getRowColorClass = (analyse: AnalyseCacao) => {
    if (analyse.VALIDER_ANALYSE_KKO === 1) {
      if (analyse.CONFORME === 1) {
        return 'bg-green-50 hover:bg-green-100 border-l-4 border-green-500';
      } else {
        return 'bg-orange-50 hover:bg-orange-100 border-l-4 border-orange-500';
      }
    } else {
      return 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500';
    }
  };
  
  // Fonction pour obtenir le statut de l'analyse
  const getStatutAnalyse = (analyse: AnalyseCacao): string => {
    if (analyse.VALIDER_ANALYSE_KKO === 1) {
      return analyse.CONFORME === 1 ? 'validé-conforme' : 'validé-non-conforme';
    }
    return 'non-validé';
  };
  
  // Charger les analyses
  const chargerAnalyses = async (force = false) => {
    // Ne pas charger automatiquement au démarrage
    if (initialLoad && !force) {
      setInitialLoad(false);
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    setInfo('');
    
    try {
      // Construire les paramètres de requête
      const params = new URLSearchParams();
      
      if (dateDebut) params.append('dateDebut', dateDebut);
      if (dateFin) params.append('dateFin', dateFin);
      if (campagne && campagne !== 'all') params.append('campagne', campagne);
      if (ville && ville !== 'all') params.append('ville', ville);
      if (exportateur && exportateur !== 'all') params.append('exportateur', exportateur);
      if (conformite && conformite !== 'all') params.append('conforme', conformite);
      if (codeSecret) params.append('codeSecret', codeSecret);
      
      // Ajouter le filtre de statut de validation
      if (statutValidation && statutValidation !== 'all') {
        if (statutValidation === 'validé') {
          params.append('valide', '1');
        } else if (statutValidation === 'non-validé') {
          params.append('valide', '0');
        }
      }
      
      const queryString = params.toString();
      const cacheKey = queryString;
      
      // Éviter les requêtes identiques répétées
      if (!force && cacheKey === lastSearchParams.current) {
        setLoading(false);
        return;
      }
      
      lastSearchParams.current = cacheKey;
      
      const url = `http://localhost:5000/api/analyses/cacao${queryString ? `?${queryString}` : ''}`;
      
      console.log('URL de requête analyses:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur serveur analyses:', errorText);
        throw new Error(`Erreur ${response.status}: Impossible de charger les analyses`);
      }
      
      const data = await response.json();
      console.log('Données analyses reçues:', data.length, 'analyses');
      
      // Filtrer côté client si nécessaire
      let filteredData = [...data];
      
      if (produit && produit !== 'all') {
        filteredData = filteredData.filter(a => a.LIBELLE_PRODUIT === produit);
      }
      
      // Filtrer par statut de validation côté client (pour les sous-catégories)
      if (statutValidation && statutValidation !== 'all') {
        if (statutValidation === 'validé-conforme') {
          filteredData = filteredData.filter(a => a.VALIDER_ANALYSE_KKO === 1 && a.CONFORME === 1);
        } else if (statutValidation === 'validé-non-conforme') {
          filteredData = filteredData.filter(a => a.VALIDER_ANALYSE_KKO === 1 && a.CONFORME === 0);
        }
      }
      
      setAnalyses(filteredData);
      setFilteredAnalyses(filteredData);
      
      if (filteredData.length === 0) {
        setInfo('Aucune analyse trouvée pour les critères sélectionnés');
      } else {
        const valideesCount = filteredData.filter(a => a.VALIDER_ANALYSE_KKO === 1).length;
        setInfo(`${filteredData.length} analyse(s) trouvée(s) - ${valideesCount} déjà validée(s)`);
      }
      
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError(err instanceof Error ? err.message : 'Erreur de connexion au serveur');
      setAnalyses([]);
      setFilteredAnalyses([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les analyses validées
  const chargerAnalysesValidees = async () => {
    setLoadingValidees(true);
    setError('');
    setSuccess('');
    setInfo('');
    
    try {
      const params = new URLSearchParams();
      
      if (dateDebut) params.append('dateDebut', dateDebut);
      if (dateFin) params.append('dateFin', dateFin);
      if (campagne && campagne !== 'all') params.append('campagne', campagne);
      if (ville && ville !== 'all') params.append('ville', ville);
      if (exportateur && exportateur !== 'all') params.append('exportateur', exportateur);
      if (statutValidation && statutValidation !== 'all') params.append('statut', statutValidation);
      
      const url = `http://localhost:5000/api/analyses/validees${params.toString() ? `?${params.toString()}` : ''}`;
      
      console.log('URL de requête analyses validées:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur serveur analyses validées:', errorText);
        throw new Error(`Erreur ${response.status}: Impossible de charger les analyses validées`);
      }
      
      const data = await response.json();
      const analysesValideesData = data.data || data;
      
      console.log('Données analyses validées reçues:', analysesValideesData.length, 'analyses');
      
      setAnalysesValidees(analysesValideesData);
      
      if (analysesValideesData.length === 0) {
        setInfo('Aucune analyse validée trouvée pour les critères sélectionnés');
      } else {
        setInfo(`${analysesValideesData.length} analyse(s) validée(s) trouvée(s)`);
      }
      
    } catch (err) {
      console.error('Erreur chargement analyses validées:', err);
      setError(err instanceof Error ? err.message : 'Erreur de connexion au serveur');
      setAnalysesValidees([]);
    } finally {
      setLoadingValidees(false);
    }
  };
  
  // Basculer entre les vues
  const toggleViewMode = () => {
    if (viewMode === 'toutes') {
      setViewMode('validees');
      chargerAnalysesValidees();
    } else {
      setViewMode('toutes');
      chargerAnalyses(true);
    }
  };
  
  const chargerDonneesFiltres = async () => {
    try {
      // Charger les campagnes
      const campResponse = await fetch('http://localhost:5000/api/campagnes');
      if (campResponse.ok) {
        const campData = await campResponse.json();
        setCampagnes(campData.map((c: any) => c.nom));
      }
      
      // Charger les exportateurs
      const expResponse = await fetch('http://localhost:5000/api/exportateurs');
      if (expResponse.ok) {
        const expData = await expResponse.json();
        setExportateurs(expData);
      }
      
      // Charger les villes depuis les analyses existantes
      setTimeout(async () => {
        try {
          const villeResponse = await fetch('http://localhost:5000/api/analyses/cacao?limit=50');
          if (villeResponse.ok) {
            const villeData = await villeResponse.json();
            const villesUniques = [...new Set(villeData
              .filter((a: any) => a.VILLE_DEMANDE)
              .map((a: any) => a.VILLE_DEMANDE)
              .sort())];
            setVilles(villesUniques);
          }
        } catch (err) {
          console.error('Erreur chargement villes:', err);
        }
      }, 500);
      
    } catch (err) {
      console.error('Erreur chargement filtres:', err);
    }
  };
  
  const rechercher = () => {
    if (viewMode === 'toutes') {
      chargerAnalyses(true);
    } else {
      chargerAnalysesValidees();
    }
  };
  
  const reinitialiserFiltres = () => {
    setCodeSecret('');
    setDateDebut('');
    setDateFin('');
    setProduit('all');
    setExportateur('all');
    setCampagne('all');
    setVille('all');
    setConformite('all');
    setStatutValidation('all');
    setSelectedAnalyses([]);
    setError('');
    setSuccess('');
    setInfo('');
    setAnalyses([]);
    setFilteredAnalyses([]);
    setAnalysesValidees([]);
    lastSearchParams.current = '';
  };
  
  // Gestion de la sélection
  const toggleSelectAll = () => {
    if (viewMode === 'toutes') {
      if (selectedAnalyses.length === filteredAnalyses.length) {
        setSelectedAnalyses([]);
      } else {
        // Ne sélectionner que les analyses non validées
        const nonValidees = filteredAnalyses
          .filter(a => a.VALIDER_ANALYSE_KKO === 0)
          .map(a => a.ID_ANALYSE_KKO);
        setSelectedAnalyses(nonValidees);
      }
    }
  };
  
  const toggleSelectAnalysis = (id: number, estValidee: boolean) => {
    if (estValidee) {
      setError('Cette analyse est déjà validée et ne peut pas être sélectionnée');
      return;
    }
    
    setSelectedAnalyses(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };
  
  // Validation des analyses
  const validerAnalyses = async (valider: boolean) => {
    if (selectedAnalyses.length === 0) {
      setError('Veuillez sélectionner au moins une analyse non validée');
      return;
    }
    
    // Vérifier qu'aucune analyse déjà validée n'est sélectionnée
    const analysesSelectionnees = filteredAnalyses.filter(a => 
      selectedAnalyses.includes(a.ID_ANALYSE_KKO)
    );
    
    const dejaValidees = analysesSelectionnees.filter(a => a.VALIDER_ANALYSE_KKO === 1);
    if (dejaValidees.length > 0) {
      setError(`${dejaValidees.length} analyse(s) sélectionnée(s) sont déjà validées`);
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    setInfo('');
    
    try {
      console.log('Validation des analyses:', selectedAnalyses, 'valider:', valider);
      
      const response = await fetch('http://localhost:5000/api/analyses/valider', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          analysesIds: selectedAnalyses,
          valider: valider
        })
      });
      
      console.log('Réponse validation:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erreur serveur' }));
        throw new Error(errorData.error || `Erreur ${response.status} lors de la validation`);
      }
      
      const result = await response.json();
      console.log('Résultat validation:', result);
      
      if (result.warning) {
        setSuccess(result.message);
        setInfo(result.warning);
      } else {
        setSuccess(result.message);
      }
      
      // Recharger les données
      if (viewMode === 'toutes') {
        await chargerAnalyses(true);
      } else {
        await chargerAnalysesValidees();
      }
      
      setSelectedAnalyses([]);
      setShowValidationDialog(false);
      setValidationRemarque('');
    } catch (err) {
      console.error('Erreur validation:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la validation');
    } finally {
      setLoading(false);
    }
  };
  
  // Modification d'une analyse
  const ouvrirEdition = (analyse: AnalyseCacao | AnalyseValidee) => {
    if ('ID_ANALYSE_KKO' in analyse && analyse.ID_ANALYSE_KKO === 1) {
      setError('Impossible de modifier une analyse déjà validée');
      return;
    }
    
    // Convertir AnalyseValidee en AnalyseCacao si nécessaire
    const analysePourEdition: AnalyseCacao = {
      ID_ANALYSE_KKO: analyse.ID_ANALYSE_KKO,
      ID_CODIFICATION: 0,
      CODE_SECRET_CODIFICATION: analyse.CODE_SECRET_CODIFICATION,
      DATE_ANALYSE_KKO: 'DATE_ANALYSE_KKO' in analyse ? analyse.DATE_ANALYSE_KKO : new Date().toISOString(),
      ANALYSEUR_ANALYSE_KKO: 0,
      NOM_ANALYSEUR: 'NOM_ANALYSEUR' in analyse ? analyse.NOM_ANALYSEUR : '',
      POIDS_BRISURES: analyse.POIDS_BRISURES || 0,
      POIDS_DECHET: analyse.POIDS_DECHET || 0,
      POIDS_CRABOT: analyse.POIDS_CRABOT || 0,
      POIDS_ETRANGERES: analyse.POIDS_ETRANGERES || 0,
      GRAINAGE: analyse.GRAINAGE || 0,
      TAUXHUMIDITE: analyse.TAUXHUMIDITE || 0,
      MOISIE_CALCULE: analyse.MOISIE_CALCULE || 0,
      MITEE_CALCULE: analyse.MITEE_CALCULE || 0,
      ARDOISEE_CALCULE: analyse.ARDOISEE_CALCULE || 0,
      PLATE_CALCULE: analyse.PLATE_CALCULE || 0,
      GERMEE_CALCULE: analyse.GERMEE_CALCULE || 0,
      VIOLETTE_CALCULE: analyse.VIOLETTE_CALCULE || 0,
      NORME_IVOIRIENNE: analyse.NORME_IVOIRIENNE || '',
      NORME_INTERNATIONALE: analyse.NORME_INTERNATIONALE || '',
      CONFORME: analyse.CONFORME || 0,
      REMARQUE: analyse.REMARQUE || '',
      VALIDER_ANALYSE_KKO: 'VALIDER_ANALYSE_KKO' in analyse ? analyse.VALIDER_ANALYSE_KKO : 1,
      NUM_LOTS: analyse.NUM_LOTS || '',
      RAISONSOCIALE_EXPORTATEUR: analyse.RAISONSOCIALE_EXPORTATEUR || '',
      LIBELLE_PRODUIT: analyse.LIBELLE_PRODUIT || '',
      CAMP_DEMANDE: analyse.CAMP_DEMANDE || '',
      VILLE_DEMANDE: analyse.VILLE_DEMANDE || ''
    };
    
    setEditingAnalysis(analysePourEdition);
    setShowEditDialog(true);
  };
  
  const enregistrerModification = async () => {
    if (!editingAnalysis) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    setInfo('');
    
    try {
      const response = await fetch(`http://localhost:5000/api/analyses/${editingAnalysis.ID_ANALYSE_KKO}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAnalysis)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la modification');
      }
      
      setSuccess('Analyse modifiée avec succès');
      
      // Recharger les données
      if (viewMode === 'toutes') {
        await chargerAnalyses(true);
      } else {
        await chargerAnalysesValidees();
      }
      
      setShowEditDialog(false);
      setEditingAnalysis(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };
  
  // Calcul du total des défauts
  const calculerTotalDefectueuses = (analyse: AnalyseCacao | AnalyseValidee) => {
    return (
      (analyse.GERMEE_CALCULE || 0) +
      (analyse.PLATE_CALCULE || 0) +
      (analyse.MITEE_CALCULE || 0)
    ).toFixed(2);
  };

  // Fonction pour ouvrir le calendrier
  const ouvrirCalendrier = (type: 'debut' | 'fin') => {
    const inputId = type === 'debut' ? 'dateDebutInput' : 'dateFinInput';
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.showPicker();
    }
  };
  
  // Afficher le statut de validation
  const getBadgeStatut = (analyse: AnalyseCacao | AnalyseValidee) => {
    const estValidee = 'VALIDER_ANALYSE_KKO' in analyse 
      ? analyse.VALIDER_ANALYSE_KKO === 1 
      : true; // Si c'est une AnalyseValidee, elle est forcément validée
    
    if (estValidee) {
      if (analyse.CONFORME === 1) {
        return (
          <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-300 flex items-center">
            <CheckCircleIcon className="h-3 w-3 inline mr-1" />
            Validé & Conforme
          </span>
        );
      } else {
        return (
          <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 border border-orange-300 flex items-center">
            <CheckCircleIcon className="h-3 w-3 inline mr-1" />
            Validé & Non Conforme
          </span>
        );
      }
    } else {
      return (
        <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-300 flex items-center">
          <XCircleIcon className="h-3 w-3 inline mr-1" />
          Non Validé
        </span>
      );
    }
  };
  
  // Formater la date
  const formaterDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="bg-[#0d2d53] text-white rounded-t-xl p-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center">
          <ChartBarIcon className="h-10 w-10 mr-4" />
          <div>
            <h2 className="text-3xl font-bold">Validation des résultats d'analyse Cacao</h2>
            <p className="text-blue-200">Consultation, validation et modification des analyses</p>
          </div>
        </div>
        <button
          onClick={toggleViewMode}
          className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2"
        >
          <DocumentIcon className="h-5 w-5" />
          {viewMode === 'toutes' ? 'Voir les analyses validées' : 'Voir toutes les analyses'}
        </button>
      </div>

      <div className="bg-white p-6 rounded-b-xl shadow-lg border space-y-6">
        {/* Messages d'erreur/succès/info */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}
        
        {info && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
            {info}
          </div>
        )}
        
        {/* Critères de recherche */}
        <div className="mb-6 pb-6 border-b">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center flex items-center justify-center gap-2">
            <FilterIcon className="h-5 w-5" />
            CRITÈRES DE RECHERCHE
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Code Secret</label>
              <input 
                type="text" 
                placeholder="Saisir code" 
                value={codeSecret}
                onChange={(e) => setCodeSecret(e.target.value)}
                className="w-full form-input"
              />
            </div>
            
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Date {viewMode === 'validees' ? 'Validation' : 'Analyse'} (Début)</label>
              <div className="relative">
                <input 
                  id="dateDebutInput"
                  type="date" 
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="w-full form-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => ouvrirCalendrier('debut')}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  <CalendarIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Date {viewMode === 'validees' ? 'Validation' : 'Analyse'} (Fin)</label>
              <div className="relative">
                <input 
                  id="dateFinInput"
                  type="date" 
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="w-full form-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => ouvrirCalendrier('fin')}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  <CalendarIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Campagne</label>
              <select 
                value={campagne}
                onChange={(e) => setCampagne(e.target.value)}
                className="w-full form-select"
              >
                <option value="all">Toutes</option>
                {campagnes.map((camp, index) => (
                  <option key={index} value={camp}>{camp}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-4">
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Ville</label>
              <select 
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                className="w-full form-select"
              >
                <option value="all">Toutes</option>
                {villes.map((v, index) => (
                  <option key={index} value={v}>{v}</option>
                ))}
              </select>
            </div>
            
            {viewMode === 'toutes' && (
              <div className="space-y-1">
                <label className="font-medium text-gray-600">Conformité</label>
                <select 
                  value={conformite}
                  onChange={(e) => setConformite(e.target.value)}
                  className="w-full form-select"
                >
                  <option value="all">Tous</option>
                  <option value="conforme">Conforme</option>
                  <option value="non-conforme">Non conforme</option>
                </select>
              </div>
            )}
            
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Exportateur</label>
              <select 
                value={exportateur}
                onChange={(e) => setExportateur(e.target.value)}
                className="w-full form-select"
              >
                <option value="all">Tous</option>
                {exportateurs.map((exp) => (
                  <option key={exp.id} value={exp.nom}>{exp.nom}</option>
                ))}
              </select>
            </div>
            
            {viewMode === 'toutes' && (
              <div className="space-y-1">
                <label className="font-medium text-gray-600">Statut Validation</label>
                <select 
                  value={statutValidation}
                  onChange={(e) => setStatutValidation(e.target.value)}
                  className="w-full form-select"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="non-validé">Non validé</option>
                  <option value="validé">Toutes analyses validées</option>
                  <option value="validé-conforme">Validé & Conforme</option>
                  <option value="validé-non-conforme">Validé & Non conforme</option>
                </select>
              </div>
            )}
            
            {viewMode === 'validees' && (
              <div className="space-y-1">
                <label className="font-medium text-gray-600">Statut</label>
                <select 
                  value={statutValidation}
                  onChange={(e) => setStatutValidation(e.target.value)}
                  className="w-full form-select"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="validé">Validé</option>
                  <option value="rejeté">Rejeté</option>
                </select>
              </div>
            )}
          </div>
          
          <div className="flex justify-center gap-4 mt-6">
            <button 
              onClick={rechercher}
              disabled={loading || (viewMode === 'validees' && loadingValidees)}
              className="bg-[#0d2d53] hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <SearchIcon className="h-5 w-5"/>
              <span>{loading || loadingValidees ? 'Recherche...' : 'Rechercher'}</span>
            </button>
            
            <button 
              onClick={reinitialiserFiltres}
              disabled={loading || loadingValidees}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <XCircleIcon className="h-5 w-5"/>
              <span>Réinitialiser</span>
            </button>
            
            <button 
              onClick={() => viewMode === 'toutes' ? chargerAnalyses(true) : chargerAnalysesValidees()}
              disabled={loading || loadingValidees}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshIcon className="h-5 w-5"/>
              <span>Actualiser</span>
            </button>
          </div>
        </div>
        
        {/* Informations résumé */}
        {(viewMode === 'toutes' ? filteredAnalyses : analysesValidees).length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Date Début:</span>
                <p className="font-medium">{dateDebut || 'Non spécifié'}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Date Fin:</span>
                <p className="font-medium">{dateFin || 'Non spécifié'}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Campagne:</span>
                <p className="font-medium">{campagne || 'Non spécifié'}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Ville:</span>
                <p className="font-medium">{ville || 'Non spécifié'}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-gray-700">
                    {viewMode === 'toutes' ? 'Nombre Total d\'analyses:' : 'Nombre Total d\'analyses validées:'}
                  </span>
                  <p className="font-bold text-lg text-blue-800">
                    {viewMode === 'toutes' ? filteredAnalyses.length : analysesValidees.length}
                  </p>
                </div>
                {viewMode === 'toutes' && (
                  <div className="flex gap-2">
                    <span className="flex items-center gap-1 text-sm">
                      <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                      <span>Non validé</span>
                    </span>
                    <span className="flex items-center gap-1 text-sm">
                      <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                      <span>Validé & Conforme</span>
                    </span>
                    <span className="flex items-center gap-1 text-sm">
                      <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded"></div>
                      <span>Validé & Non conforme</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Tableau des résultats */}
        <div>
          <div className="overflow-x-auto border rounded-lg shadow-md">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 uppercase text-xs text-gray-600">
                <tr>
                  {viewMode === 'toutes' && (
                    <th className="p-3 font-semibold tracking-wider text-center w-12">
                      <input 
                        type="checkbox" 
                        checked={selectedAnalyses.length > 0 && selectedAnalyses.length === filteredAnalyses.filter(a => a.VALIDER_ANALYSE_KKO === 0).length}
                        onChange={toggleSelectAll}
                        className="form-checkbox h-4 w-4"
                        disabled={filteredAnalyses.length === 0 || filteredAnalyses.filter(a => a.VALIDER_ANALYSE_KKO === 0).length === 0}
                      />
                    </th>
                  )}
                  <th className="p-3 font-semibold tracking-wider text-left">Code secret</th>
                  <th className="p-3 font-semibold tracking-wider text-left">Analyseur</th>
                  <th className="p-3 font-semibold tracking-wider text-left">Campagne</th>
                  <th className="p-3 font-semibold tracking-wider text-center">
                    {viewMode === 'toutes' ? 'Date analyse' : 'Date validation'}
                  </th>
                  <th className="p-3 font-semibold tracking-wider text-center">Statut</th>
                  <th className="p-3 font-semibold tracking-wider text-center">Brisure</th>
                  <th className="p-3 font-semibold tracking-wider text-center">Déchet</th>
                  <th className="p-3 font-semibold tracking-wider text-center">Cabot</th>
                  <th className="p-3 font-semibold tracking-wider text-center">M. Étrangère</th>
                  <th className="p-3 font-semibold tracking-wider text-center">Grainage</th>
                  <th className="p-3 font-semibold tracking-wider text-center">Humidité</th>
                  <th className="p-3 font-semibold tracking-wider text-center">Moisie</th>
                  <th className="p-3 font-semibold tracking-wider text-center">Mité</th>
                  <th className="p-3 font-semibold tracking-wider text-center">Ardoisée</th>
                  <th className="p-3 font-semibold tracking-wider text-center">Plate</th>
                  <th className="p-3 font-semibold tracking-wider text-center">Germée</th>
                  <th className="p-3 font-semibold tracking-wider text-center">Violette</th>
                  <th className="p-3 font-semibold tracking-wider text-center">Défectueuses</th>
                  <th className="p-3 font-semibold tracking-wider text-center">Norme Ivoirienne</th>
                  <th className="p-3 font-semibold tracking-wider text-center">Norme Internationale</th>
                  <th className="p-3 font-semibold tracking-wider text-center">Conformité</th>
                  <th className="p-3 font-semibold tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading || loadingValidees ? (
                  <tr>
                    <td colSpan={viewMode === 'toutes' ? 23 : 22} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                      <p className="text-gray-500 mt-2">
                        {viewMode === 'toutes' ? 'Chargement des analyses...' : 'Chargement des analyses validées...'}
                      </p>
                    </td>
                  </tr>
                ) : (viewMode === 'toutes' ? filteredAnalyses : analysesValidees).length === 0 ? (
                  <tr>
                    <td colSpan={viewMode === 'toutes' ? 23 : 22} className="text-center py-20">
                      <EmptyBoxIcon className="h-16 w-16 mx-auto text-gray-300" />
                      <p className="text-gray-500 font-semibold mt-2">
                        {viewMode === 'toutes' 
                          ? (analyses.length === 0 ? 'Aucune analyse disponible' : 'Aucune analyse correspond aux filtres')
                          : 'Aucune analyse validée correspond aux filtres'
                        }
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {viewMode === 'toutes' 
                          ? (analyses.length === 0 ? 'Cliquez sur "Rechercher" pour charger les analyses' : 'Ajustez vos critères de recherche')
                          : 'Ajustez vos critères de recherche'
                        }
                      </p>
                    </td>
                  </tr>
                ) : (
                  (viewMode === 'toutes' ? filteredAnalyses : analysesValidees).map((analyse) => {
                    const estValidee = viewMode === 'validees' || ('VALIDER_ANALYSE_KKO' in analyse && analyse.VALIDER_ANALYSE_KKO === 1);
                    
                    return (
                      <tr 
                        key={analyse.ID_ANALYSE_KKO || (analyse as AnalyseValidee).ID_ANALYSE_VALIDER} 
                        className={`transition-colors duration-150 ${viewMode === 'toutes' ? getRowColorClass(analyse as AnalyseCacao) : 'bg-green-50 hover:bg-green-100 border-l-4 border-green-500'}`}
                      >
                        {viewMode === 'toutes' && (
                          <td className="p-3 text-center">
                            <input 
                              type="checkbox" 
                              checked={selectedAnalyses.includes(analyse.ID_ANALYSE_KKO)}
                              onChange={() => toggleSelectAnalysis(analyse.ID_ANALYSE_KKO, estValidee)}
                              className="form-checkbox h-4 w-4"
                              disabled={estValidee}
                            />
                          </td>
                        )}
                        <td className="p-3 font-mono font-medium">{analyse.CODE_SECRET_CODIFICATION}</td>
                        <td className="p-3">{'NOM_ANALYSEUR' in analyse ? analyse.NOM_ANALYSEUR || 'N/A' : 'N/A'}</td>
                        <td className="p-3">{analyse.CAMP_DEMANDE || 'N/A'}</td>
                        <td className="p-3 text-center">
                          {viewMode === 'toutes' 
                            ? new Date(analyse.DATE_ANALYSE_KKO).toLocaleDateString('fr-FR')
                            : formaterDate((analyse as AnalyseValidee).DATE_VALIDATION)
                          }
                        </td>
                        <td className="p-3 text-center">
                          {getBadgeStatut(analyse)}
                        </td>
                        <td className="p-3 text-center">{analyse.POIDS_BRISURES?.toFixed(2) || '0.00'}</td>
                        <td className="p-3 text-center">{analyse.POIDS_DECHET?.toFixed(2) || '0.00'}</td>
                        <td className="p-3 text-center">{analyse.POIDS_CRABOT?.toFixed(2) || '0.00'}</td>
                        <td className="p-3 text-center">{analyse.POIDS_ETRANGERES?.toFixed(2) || '0.00'}</td>
                        <td className="p-3 text-center font-medium">{analyse.GRAINAGE?.toFixed(0) || '0'}</td>
                        <td className="p-3 text-center">{analyse.TAUXHUMIDITE?.toFixed(1) || '0.0'}</td>
                        <td className="p-3 text-center">{analyse.MOISIE_CALCULE?.toFixed(2) || '0.00'}</td>
                        <td className="p-3 text-center">{analyse.MITEE_CALCULE?.toFixed(2) || '0.00'}</td>
                        <td className="p-3 text-center">{analyse.ARDOISEE_CALCULE?.toFixed(2) || '0.00'}</td>
                        <td className="p-3 text-center">{analyse.PLATE_CALCULE?.toFixed(2) || '0.00'}</td>
                        <td className="p-3 text-center">{analyse.GERMEE_CALCULE?.toFixed(2) || '0.00'}</td>
                        <td className="p-3 text-center">{analyse.VIOLETTE_CALCULE?.toFixed(2) || '0.00'}</td>
                        <td className="p-3 text-center font-medium">
                          {calculerTotalDefectueuses(analyse)}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            analyse.NORME_IVOIRIENNE?.includes('G1') ? 'bg-green-100 text-green-800' :
                            analyse.NORME_IVOIRIENNE?.includes('G2') ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {analyse.NORME_IVOIRIENNE || 'N/A'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            analyse.NORME_INTERNATIONALE?.includes('GF') ? 'bg-green-100 text-green-800' :
                            analyse.NORME_INTERNATIONALE?.includes('FF') ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {analyse.NORME_INTERNATIONALE || 'N/A'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            analyse.CONFORME ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {analyse.CONFORME ? (
                              <>
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                                CONFORME
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="h-3 w-3 mr-1" />
                                NON CONFORME
                              </>
                            )}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center space-x-2">
                            <button 
                              onClick={() => ouvrirEdition(analyse)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                              title="Modifier"
                              disabled={estValidee && viewMode === 'toutes'}
                            >
                              <EditIconAlt className="h-4 w-4" />
                            </button>
                            {viewMode === 'toutes' && !estValidee && (
                              <button 
                                onClick={() => {
                                  setSelectedAnalyses([analyse.ID_ANALYSE_KKO]);
                                  setValidationType(analyse.CONFORME ? 'validate' : 'reject');
                                  setShowValidationDialog(true);
                                }}
                                className={`p-1 rounded hover:bg-gray-100 ${
                                  analyse.CONFORME ? 'text-green-600 hover:text-green-800' : 'text-red-600 hover:text-red-800'
                                }`}
                                title={analyse.CONFORME ? 'Valider' : 'Rejeter'}
                              >
                                {analyse.CONFORME ? (
                                  <SaveIcon className="h-4 w-4" />
                                ) : (
                                  <XCircleIcon className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions globales - seulement pour la vue toutes les analyses */}
        {viewMode === 'toutes' && (
          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <div className="text-sm text-gray-600">
              {selectedAnalyses.length > 0 && (
                <span className="font-medium">
                  {selectedAnalyses.length} analyse(s) non validée(s) sélectionnée(s)
                </span>
              )}
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  const nonValidees = filteredAnalyses.filter(a => 
                    selectedAnalyses.includes(a.ID_ANALYSE_KKO) && a.VALIDER_ANALYSE_KKO === 0
                  );
                  if (nonValidees.length === 0) {
                    setError('Aucune analyse non validée sélectionnée');
                    return;
                  }
                  setValidationType('validate');
                  setShowValidationDialog(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50"
                disabled={selectedAnalyses.length === 0 || loading}
              >
                <SaveIcon className="h-5 w-5"/>
                Valider la sélection
              </button>
              
              <button 
                onClick={() => {
                  const nonValidees = filteredAnalyses.filter(a => 
                    selectedAnalyses.includes(a.ID_ANALYSE_KKO) && a.VALIDER_ANALYSE_KKO === 0
                  );
                  if (nonValidees.length === 0) {
                    setError('Aucune analyse non validée sélectionnée');
                    return;
                  }
                  setValidationType('reject');
                  setShowValidationDialog(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50"
                disabled={selectedAnalyses.length === 0 || loading}
              >
                <XCircleIcon className="h-5 w-5"/>
                Rejeter la sélection
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Bouton retour */}
      <div className="mt-8">
        <button 
          onClick={onNavigateBack} 
          className="flex items-center space-x-2 bg-[#0d2d53] hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-colors"
        >
          <BackArrowIcon className="h-5 w-5" />
          <span>Retour</span>
        </button>
      </div>

      {/* Dialogue de validation */}
      {showValidationDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {validationType === 'validate' ? 'Valider les analyses' : 'Rejeter les analyses'}
            </h3>
            <p className="text-gray-700 mb-4">
              Êtes-vous sûr de vouloir {validationType === 'validate' ? 'valider' : 'rejeter'} {selectedAnalyses.length} analyse(s) ?
              {validationType === 'validate' ? ' Elles seront marquées comme validées et enregistrées dans la table des analyses validées.' : ' Elles seront marquées comme rejetées.'}
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remarque (optionnelle)
              </label>
              <textarea
                value={validationRemarque}
                onChange={(e) => setValidationRemarque(e.target.value)}
                rows={3}
                className="form-textarea w-full"
                placeholder="Ajoutez une remarque pour cette validation..."
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => {
                  setShowValidationDialog(false);
                  setValidationRemarque('');
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
                disabled={loading}
              >
                Annuler
              </button>
              <button 
                onClick={() => {
                  if (validationRemarque && editingAnalysis) {
                    setEditingAnalysis({
                      ...editingAnalysis,
                      REMARQUE: validationRemarque
                    });
                  }
                  validerAnalyses(validationType === 'validate');
                }}
                disabled={loading}
                className={`px-4 py-2 rounded text-white ${
                  validationType === 'validate' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                {loading ? 'Traitement...' : (validationType === 'validate' ? 'Valider' : 'Rejeter')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogue d'édition */}
      {showEditDialog && editingAnalysis && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Modifier l'analyse</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Brisure</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editingAnalysis.POIDS_BRISURES || 0}
                  onChange={(e) => setEditingAnalysis({
                    ...editingAnalysis,
                    POIDS_BRISURES: parseFloat(e.target.value) || 0
                  })}
                  className="form-input w-full mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Déchet</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editingAnalysis.POIDS_DECHET || 0}
                  onChange={(e) => setEditingAnalysis({
                    ...editingAnalysis,
                    POIDS_DECHET: parseFloat(e.target.value) || 0
                  })}
                  className="form-input w-full mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cabot</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editingAnalysis.POIDS_CRABOT || 0}
                  onChange={(e) => setEditingAnalysis({
                    ...editingAnalysis,
                    POIDS_CRABOT: parseFloat(e.target.value) || 0
                  })}
                  className="form-input w-full mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Matière Étrangère</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editingAnalysis.POIDS_ETRANGERES || 0}
                  onChange={(e) => setEditingAnalysis({
                    ...editingAnalysis,
                    POIDS_ETRANGERES: parseFloat(e.target.value) || 0
                  })}
                  className="form-input w-full mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Humidité</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={editingAnalysis.TAUXHUMIDITE || 0}
                  onChange={(e) => setEditingAnalysis({
                    ...editingAnalysis,
                    TAUXHUMIDITE: parseFloat(e.target.value) || 0
                  })}
                  className="form-input w-full mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Conformité</label>
                <select 
                  value={editingAnalysis.CONFORME ? '1' : '0'}
                  onChange={(e) => setEditingAnalysis({
                    ...editingAnalysis,
                    CONFORME: e.target.value === '1' ? 1 : 0
                  })}
                  className="form-select w-full mt-1"
                >
                  <option value="1">Conforme</option>
                  <option value="0">Non conforme</option>
                </select>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">Remarque</label>
              <textarea 
                value={editingAnalysis.REMARQUE || ''}
                onChange={(e) => setEditingAnalysis({
                  ...editingAnalysis,
                  REMARQUE: e.target.value
                })}
                rows={3}
                className="form-textarea w-full mt-1"
              />
            </div>
            
            <div className="flex justify-end space-x-4">
              <button 
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingAnalysis(null);
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50"
                disabled={loading}
              >
                Annuler
              </button>
              <button 
                onClick={enregistrerModification}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .form-input, .form-select, .form-textarea {
          padding: 0.5rem 0.75rem; 
          border: 1px solid #d1d5db; 
          border-radius: 0.375rem;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
          width: 100%;
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none; 
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgb(59 130 246 / 0.25);
        }
        .form-checkbox {
          border-radius: 0.25rem;
        }
        .form-select {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center; 
          background-repeat: no-repeat; 
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }
        /* Empêcher le zoom sur iOS */
        @media screen and (max-width: 768px) {
          input, select, textarea {
            font-size: 16px !important;
          }
        }
        /* Styles pour le tableau */
        table {
          min-width: 100%;
        }
        th, td {
          white-space: nowrap;
        }
        /* Scroll horizontal pour les petits écrans */
        .overflow-x-auto {
          overflow-x: auto;
        }
        /* Animation de chargement */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        /* Style pour les inputs date */
        input[type="date"] {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        /* Style pour les boutons calendrier */
        .relative button {
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
        }
        /* Améliorer l'apparence des selects */
        select {
          cursor: pointer;
        }
        /* Boutons désactivés */
        button:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        input[type="checkbox"] {
          cursor: pointer;
        }
        input[type="checkbox"]:disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        /* Couleurs spécifiques pour les statuts */
        .bg-green-50 {
          background-color: #f0fdf4;
        }
        .bg-red-50 {
          background-color: #fef2f2;
        }
        .bg-orange-50 {
          background-color: #fff7ed;
        }
        .hover\:bg-green-100:hover {
          background-color: #dcfce7;
        }
        .hover\:bg-red-100:hover {
          background-color: #fee2e2;
        }
        .hover\:bg-orange-100:hover {
          background-color: #ffedd5;
        }
      `}</style>
    </div>
  );
};

export default ResultatsAnalyses;