import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  BackArrowIcon,
  CalendarIcon,
  SearchIcon,
  PrintIcon,
  ExportIcon,
  EditIconAlt,
  CheckIcon,
  XIcon
} from './Icons';

interface ValidationCacaoProps {
  onNavigateBack: () => void;
}

interface AnalyseCacao {
  ID_ANALYSE_KKO: number;
  CODE_SECRET_CODIFICATION: string;
  REF_DEMANDE: string;
  AUT_DEMANDE: string;
  RAISONSOCIALE_EXPORTATEUR: string;
  NUM_LOTS: string;
  NOM_ANALYSEUR: string;
  CAMP_DEMANDE: string;
  VILLE_DEMANDE: string;
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
  DATE_ANALYSE_KKO: string;
  VALIDER_ANALYSE_KKO: number;
}

interface FiltresRecherche {
  refDemande: string;
  autorisation: string;
  numeroDossier: string;
  exportateur: string;
  numeroLot: string;
  type: string;
  dateDebut: string;
  dateFin: string;
  campagne: string;
  ville: string;
}

const ValidationCacao: React.FC<ValidationCacaoProps> = ({ onNavigateBack }) => {
  const [analyses, setAnalyses] = useState<AnalyseCacao[]>([]);
  const [analysesFiltrees, setAnalysesFiltrees] = useState<AnalyseCacao[]>([]);
  const [filtres, setFiltres] = useState<FiltresRecherche>({
    refDemande: '',
    autorisation: '',
    numeroDossier: '',
    exportateur: '',
    numeroLot: '',
    type: '',
    dateDebut: '',
    dateFin: '',
    campagne: '',
    ville: ''
  });
  const [exportateurs, setExportateurs] = useState<{id: number, nom: string}[]>([]);
  const [campagnes, setCampagnes] = useState<{nom: string}[]>([]);
  const [villes, setVilles] = useState<string[]>([]);
  const [selection, setSelection] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<Partial<AnalyseCacao>>({});
  const [showCalendarDebut, setShowCalendarDebut] = useState(false);
  const [showCalendarFin, setShowCalendarFin] = useState(false);

  const tableHeaders = [
    'Valider', 'REF DEMANDE', 'AUTORISATION', 'EXPORTATEUR', 'N°LOT', 'CODE SECRET',
    'ANALYSEUR', 'CAMPAGNE', 'DATE D\'ANALYSE', 'BRISURE', 'DÉCHET', 'CRABOT', 
    'MATIÈRE ÉTRANGÈRE', 'GRAINAGE', 'HUMIDITÉ', 'MOISIE', 'MITÉE', 'ARDOISÉE', 
    'PLATE', 'GEMMÉE', 'VIOLETTE', 'DÉFECTUEUSE', 'NORME IVOIRIENNE', 
    'NORME INTERNATIONALE', 'CONFORMITÉ', 'REMARQUE', 'ACTIONS'
  ];

  useEffect(() => {
    chargerDonnees();
    chargerFiltres();
  }, []);

  useEffect(() => {
    filtrerAnalyses();
  }, [analyses, filtres]);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/analyses/cacao');
      const data = await response.json();
      // Filtrer uniquement les analyses validées (VALIDER_ANALYSE_KKO = 1)
      const analysesValidees = data.filter((analyse: AnalyseCacao) => 
        analyse.VALIDER_ANALYSE_KKO === 1
      );
      setAnalyses(analysesValidees);
      setAnalysesFiltrees(analysesValidees);
    } catch (error) {
      console.error('Erreur chargement analyses:', error);
      setAnalyses([]);
    } finally {
      setLoading(false);
    }
  };

  const chargerFiltres = async () => {
    try {
      // Charger les exportateurs
      const responseExportateurs = await fetch('http://localhost:5000/api/exportateurs');
      const dataExportateurs = await responseExportateurs.json();
      setExportateurs(dataExportateurs);

      // Charger les campagnes
      const responseCampagnes = await fetch('http://localhost:5000/api/campagnes');
      const dataCampagnes = await responseCampagnes.json();
      setCampagnes(dataCampagnes);

      // Charger les villes uniques
      const responseAnalyses = await fetch('http://localhost:5000/api/analyses/cacao');
      const analysesData = await responseAnalyses.json();
      const villesUniques = [...new Set(analysesData.map((a: any) => a.VILLE_DEMANDE).filter(Boolean))];
      setVilles(villesUniques);

    } catch (error) {
      console.error('Erreur chargement filtres:', error);
    }
  };

  const filtrerAnalyses = () => {
    let resultats = analyses;

    // Appliquer les filtres
    if (filtres.refDemande) {
      resultats = resultats.filter(analyse => 
        analyse.REF_DEMANDE?.toLowerCase().includes(filtres.refDemande.toLowerCase())
      );
    }

    if (filtres.autorisation) {
      resultats = resultats.filter(analyse => 
        analyse.AUT_DEMANDE?.toLowerCase().includes(filtres.autorisation.toLowerCase())
      );
    }

    if (filtres.exportateur && filtres.exportateur !== 'tous') {
      resultats = resultats.filter(analyse => 
        analyse.RAISONSOCIALE_EXPORTATEUR === filtres.exportateur
      );
    }

    if (filtres.numeroLot) {
      resultats = resultats.filter(analyse => 
        analyse.NUM_LOTS?.toLowerCase().includes(filtres.numeroLot.toLowerCase())
      );
    }

    if (filtres.campagne && filtres.campagne !== 'toutes') {
      resultats = resultats.filter(analyse => 
        analyse.CAMP_DEMANDE === filtres.campagne
      );
    }

    if (filtres.ville && filtres.ville !== 'toutes') {
      resultats = resultats.filter(analyse => 
        analyse.VILLE_DEMANDE === filtres.ville
      );
    }

    if (filtres.dateDebut) {
      resultats = resultats.filter(analyse => 
        new Date(analyse.DATE_ANALYSE_KKO) >= new Date(filtres.dateDebut)
      );
    }

    if (filtres.dateFin) {
      resultats = resultats.filter(analyse => 
        new Date(analyse.DATE_ANALYSE_KKO) <= new Date(filtres.dateFin + 'T23:59:59')
      );
    }

    setAnalysesFiltrees(resultats);
  };

  const handleFiltreChange = (champ: keyof FiltresRecherche, valeur: string) => {
    setFiltres(prev => ({
      ...prev,
      [champ]: valeur
    }));
  };

  const reinitialiserFiltres = () => {
    setFiltres({
      refDemande: '',
      autorisation: '',
      numeroDossier: '',
      exportateur: '',
      numeroLot: '',
      type: '',
      dateDebut: '',
      dateFin: '',
      campagne: '',
      ville: ''
    });
  };

  const gererSelection = (id: number) => {
    setSelection(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const selectionnerTout = () => {
    if (selection.length === analysesFiltrees.length) {
      setSelection([]);
    } else {
      setSelection(analysesFiltrees.map(analyse => analyse.ID_ANALYSE_KKO));
    }
  };

  const validerAnalyses = async () => {
    if (selection.length === 0) {
      alert('Sélectionnez au moins une analyse à valider');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/analyses/valider-bv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysesIds: selection, valider: true })
      });

      const result = await response.json();
      if (result.success) {
        alert(result.message);
        setSelection([]);
        chargerDonnees();
      } else {
        alert('Erreur: ' + result.error);
      }
    } catch (error) {
      console.error('Erreur validation:', error);
      alert('Erreur lors de la validation');
    }
  };

  const rejeterAnalyse = async (id: number) => {
    if (confirm('Voulez-vous vraiment rejeter cette analyse?')) {
      try {
        const response = await fetch('http://localhost:5000/api/analyses/valider', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysesIds: [id], valider: false })
        });

        const result = await response.json();
        if (result.success) {
          alert('Analyse rejetée avec succès');
          chargerDonnees();
        }
      } catch (error) {
        console.error('Erreur rejet:', error);
      }
    }
  };

  const demarrerModification = (analyse: AnalyseCacao) => {
    setEditingId(analyse.ID_ANALYSE_KKO);
    setEditingData({
      POIDS_BRISURES: analyse.POIDS_BRISURES,
      POIDS_DECHET: analyse.POIDS_DECHET,
      POIDS_CRABOT: analyse.POIDS_CRABOT,
      POIDS_ETRANGERES: analyse.POIDS_ETRANGERES,
      TAUXHUMIDITE: analyse.TAUXHUMIDITE,
      MOISIE_CALCULE: analyse.MOISIE_CALCULE,
      MITEE_CALCULE: analyse.MITEE_CALCULE,
      ARDOISEE_CALCULE: analyse.ARDOISEE_CALCULE,
      PLATE_CALCULE: analyse.PLATE_CALCULE,
      GERMEE_CALCULE: analyse.GERMEE_CALCULE,
      VIOLETTE_CALCULE: analyse.VIOLETTE_CALCULE,
      NORME_IVOIRIENNE: analyse.NORME_IVOIRIENNE,
      NORME_INTERNATIONALE: analyse.NORME_INTERNATIONALE,
      CONFORME: analyse.CONFORME,
      REMARQUE: analyse.REMARQUE
    });
  };

  const sauvegarderModification = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/analyses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingData)
      });

      const result = await response.json();
      if (result.success) {
        alert('Modifications enregistrées');
        setEditingId(null);
        setEditingData({});
        chargerDonnees();
      }
    } catch (error) {
      console.error('Erreur modification:', error);
    }
  };

  const annulerModification = () => {
    setEditingId(null);
    setEditingData({});
  };

  const exporterAnalyses = () => {
    const csvContent = analysesFiltrees.map(analyse => 
      Object.values(analyse).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analyses_cacao_' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const calculerDefectueuses = (analyse: AnalyseCacao) => {
    const total = (analyse.GERMEE_CALCULE || 0) + 
                  (analyse.PLATE_CALCULE || 0) + 
                  (analyse.MITEE_CALCULE || 0);
    return total.toFixed(3);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const getDateTwoWeeksAgo = () => {
    const now = new Date();
    now.setDate(now.getDate() - 14);
    return now.toISOString().split('T')[0];
  };

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="bg-[#0d2d53] text-white rounded-t-xl p-6 flex items-center shadow-lg">
        <CheckCircleIcon className="h-10 w-10 mr-4" />
        <div>
          <h2 className="text-3xl font-bold">Validation Résultats Cacao</h2>
          <p className="text-blue-200">Validation des analyses de qualité du cacao</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-white p-6 rounded-b-xl shadow-lg border">
        {/* Filters */}
        <div className="mb-6 pb-6 border-b">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">CRITÈRES DE RECHERCHE</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">REF DEMANDE</label>
              <input 
                type="text" 
                placeholder="Saisir la référence" 
                className="w-full form-input" 
                value={filtres.refDemande}
                onChange={(e) => handleFiltreChange('refDemande', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Autorisation</label>
              <input 
                type="text" 
                placeholder="N° d'autorisation" 
                className="w-full form-input" 
                value={filtres.autorisation}
                onChange={(e) => handleFiltreChange('autorisation', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">N° Dossier</label>
              <input 
                type="text" 
                placeholder="N° de dossier" 
                className="w-full form-input" 
                value={filtres.numeroDossier}
                onChange={(e) => handleFiltreChange('numeroDossier', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Exportateur</label>
              <select 
                className="w-full form-select"
                value={filtres.exportateur}
                onChange={(e) => handleFiltreChange('exportateur', e.target.value)}
              >
                <option value="tous">Tous les exportateurs</option>
                {exportateurs.map(exp => (
                  <option key={exp.id} value={exp.nom}>{exp.nom}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">N° Lot</label>
              <input 
                type="text" 
                placeholder="N° du lot" 
                className="w-full form-input" 
                value={filtres.numeroLot}
                onChange={(e) => handleFiltreChange('numeroLot', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Type</label>
              <input 
                type="text" 
                placeholder="Type d'analyse" 
                className="w-full form-input" 
                value={filtres.type}
                onChange={(e) => handleFiltreChange('type', e.target.value)}
              />
            </div>
            <div className="space-y-1 relative">
              <label className="text-xs font-semibold text-gray-500 flex items-center">
                Date Début
                <button 
                  type="button"
                  onClick={() => setShowCalendarDebut(!showCalendarDebut)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  📅
                </button>
              </label>
              <input 
                type="date" 
                className="w-full form-input pr-8" 
                value={filtres.dateDebut || getDateTwoWeeksAgo()}
                onChange={(e) => handleFiltreChange('dateDebut', e.target.value)}
              />
              {showCalendarDebut && (
                <div className="absolute z-50 mt-1">
                  <input 
                    type="date" 
                    value={filtres.dateDebut || getDateTwoWeeksAgo()}
                    onChange={(e) => {
                      handleFiltreChange('dateDebut', e.target.value);
                      setShowCalendarDebut(false);
                    }}
                    className="border rounded shadow-lg p-2"
                    autoFocus
                  />
                </div>
              )}
            </div>
            <div className="space-y-1 relative">
              <label className="text-xs font-semibold text-gray-500 flex items-center">
                Date Fin
                <button 
                  type="button"
                  onClick={() => setShowCalendarFin(!showCalendarFin)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  📅
                </button>
              </label>
              <input 
                type="date" 
                className="w-full form-input pr-8" 
                value={filtres.dateFin || getCurrentDate()}
                onChange={(e) => handleFiltreChange('dateFin', e.target.value)}
              />
              {showCalendarFin && (
                <div className="absolute z-50 mt-1">
                  <input 
                    type="date" 
                    value={filtres.dateFin || getCurrentDate()}
                    onChange={(e) => {
                      handleFiltreChange('dateFin', e.target.value);
                      setShowCalendarFin(false);
                    }}
                    className="border rounded shadow-lg p-2"
                    autoFocus
                  />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Campagne</label>
              <select 
                className="w-full form-select"
                value={filtres.campagne}
                onChange={(e) => handleFiltreChange('campagne', e.target.value)}
              >
                <option value="toutes">Toutes les campagnes</option>
                {campagnes.map(camp => (
                  <option key={camp.nom} value={camp.nom}>{camp.nom}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Ville</label>
              <select 
                className="w-full form-select"
                value={filtres.ville}
                onChange={(e) => handleFiltreChange('ville', e.target.value)}
              >
                <option value="toutes">Toutes les villes</option>
                {villes.map(ville => (
                  <option key={ville} value={ville}>{ville}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <button 
              onClick={filtrerAnalyses}
              className="bg-[#0d2d53] hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center gap-2"
            >
              <SearchIcon className="h-5 w-5"/>
              <span>Rechercher</span>
            </button>
            <button 
              onClick={reinitialiserFiltres}
              className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-6 rounded-lg border border-gray-300 shadow-sm transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
        
        {/* Table */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-600">
              {loading ? 'Chargement...' : `${analysesFiltrees.length} analyse(s) trouvée(s)`}
            </p>
            <div className="flex gap-2">
              <input 
                type="checkbox" 
                className="rounded"
                checked={selection.length === analysesFiltrees.length && analysesFiltrees.length > 0}
                onChange={selectionnerTout}
              />
              <span className="text-sm text-gray-600">Sélectionner tout</span>
            </div>
          </div>
          
          <p className="text-center text-sm text-gray-500 mb-2 italic">Faites défiler horizontalement pour voir toutes les colonnes</p>
          <div className="overflow-x-auto border rounded-lg max-h-[600px]">
            <table className="min-w-full text-sm">
              <thead className="bg-[#0d2d53] text-white uppercase text-xs">
                <tr>
                  {tableHeaders.map(header => (
                    <th key={header} className="p-3 font-semibold tracking-wider text-left whitespace-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={tableHeaders.length} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d2d53]"></div>
                      </div>
                    </td>
                  </tr>
                ) : analysesFiltrees.length === 0 ? (
                  <tr>
                    <td colSpan={tableHeaders.length} className="text-center py-20">
                      <p className="text-gray-500">Aucune analyse trouvée</p>
                    </td>
                  </tr>
                ) : (
                  analysesFiltrees.map(analyse => (
                    <tr key={analyse.ID_ANALYSE_KKO} className="hover:bg-gray-50">
                      <td className="p-3">
                        <input 
                          type="checkbox" 
                          className="rounded"
                          checked={selection.includes(analyse.ID_ANALYSE_KKO)}
                          onChange={() => gererSelection(analyse.ID_ANALYSE_KKO)}
                        />
                      </td>
                      <td className="p-3">{analyse.REF_DEMANDE}</td>
                      <td className="p-3">{analyse.AUT_DEMANDE}</td>
                      <td className="p-3">{analyse.RAISONSOCIALE_EXPORTATEUR}</td>
                      <td className="p-3">{analyse.NUM_LOTS}</td>
                      <td className="p-3 font-mono">{analyse.CODE_SECRET_CODIFICATION}</td>
                      <td className="p-3">{analyse.NOM_ANALYSEUR}</td>
                      <td className="p-3">{analyse.CAMP_DEMANDE}</td>
                      <td className="p-3">{formatDate(analyse.DATE_ANALYSE_KKO)}</td>
                      
                      {/* Cellules éditables */}
                      <td className="p-1">
                        {editingId === analyse.ID_ANALYSE_KKO ? (
                          <input 
                            type="number" 
                            step="0.001"
                            className="w-full px-2 py-1 border rounded"
                            value={editingData.POIDS_BRISURES || ''}
                            onChange={(e) => setEditingData(prev => ({...prev, POIDS_BRISURES: parseFloat(e.target.value)}))}
                          />
                        ) : (
                          analyse.POIDS_BRISURES?.toFixed(3)
                        )}
                      </td>
                      
                      <td className="p-1">
                        {editingId === analyse.ID_ANALYSE_KKO ? (
                          <input 
                            type="number" 
                            step="0.001"
                            className="w-full px-2 py-1 border rounded"
                            value={editingData.POIDS_DECHET || ''}
                            onChange={(e) => setEditingData(prev => ({...prev, POIDS_DECHET: parseFloat(e.target.value)}))}
                          />
                        ) : (
                          analyse.POIDS_DECHET?.toFixed(3)
                        )}
                      </td>
                      
                      <td className="p-1">
                        {editingId === analyse.ID_ANALYSE_KKO ? (
                          <input 
                            type="number" 
                            step="0.001"
                            className="w-full px-2 py-1 border rounded"
                            value={editingData.POIDS_CRABOT || ''}
                            onChange={(e) => setEditingData(prev => ({...prev, POIDS_CRABOT: parseFloat(e.target.value)}))}
                          />
                        ) : (
                          analyse.POIDS_CRABOT?.toFixed(3)
                        )}
                      </td>
                      
                      <td className="p-1">
                        {editingId === analyse.ID_ANALYSE_KKO ? (
                          <input 
                            type="number" 
                            step="0.001"
                            className="w-full px-2 py-1 border rounded"
                            value={editingData.POIDS_ETRANGERES || ''}
                            onChange={(e) => setEditingData(prev => ({...prev, POIDS_ETRANGERES: parseFloat(e.target.value)}))}
                          />
                        ) : (
                          analyse.POIDS_ETRANGERES?.toFixed(3)
                        )}
                      </td>
                      
                      <td className="p-1">
                        {editingId === analyse.ID_ANALYSE_KKO ? (
                          <input 
                            type="number" 
                            step="0.001"
                            className="w-full px-2 py-1 border rounded"
                            value={editingData.GRAINAGE || ''}
                            onChange={(e) => setEditingData(prev => ({...prev, GRAINAGE: parseFloat(e.target.value)}))}
                          />
                        ) : (
                          analyse.GRAINAGE?.toFixed(3)
                        )}
                      </td>
                      
                      <td className="p-1">
                        {editingId === analyse.ID_ANALYSE_KKO ? (
                          <input 
                            type="number" 
                            step="0.1"
                            className="w-full px-2 py-1 border rounded"
                            value={editingData.TAUXHUMIDITE || ''}
                            onChange={(e) => setEditingData(prev => ({...prev, TAUXHUMIDITE: parseFloat(e.target.value)}))}
                          />
                        ) : (
                          analyse.TAUXHUMIDITE?.toFixed(1) + '%'
                        )}
                      </td>
                      
                      <td className="p-1">
                        {editingId === analyse.ID_ANALYSE_KKO ? (
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full px-2 py-1 border rounded"
                            value={editingData.MOISIE_CALCULE || ''}
                            onChange={(e) => setEditingData(prev => ({...prev, MOISIE_CALCULE: parseFloat(e.target.value)}))}
                          />
                        ) : (
                          analyse.MOISIE_CALCULE?.toFixed(2) + '%'
                        )}
                      </td>
                      
                      <td className="p-1">
                        {editingId === analyse.ID_ANALYSE_KKO ? (
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full px-2 py-1 border rounded"
                            value={editingData.MITEE_CALCULE || ''}
                            onChange={(e) => setEditingData(prev => ({...prev, MITEE_CALCULE: parseFloat(e.target.value)}))}
                          />
                        ) : (
                          analyse.MITEE_CALCULE?.toFixed(2) + '%'
                        )}
                      </td>
                      
                      <td className="p-1">
                        {editingId === analyse.ID_ANALYSE_KKO ? (
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full px-2 py-1 border rounded"
                            value={editingData.ARDOISEE_CALCULE || ''}
                            onChange={(e) => setEditingData(prev => ({...prev, ARDOISEE_CALCULE: parseFloat(e.target.value)}))}
                          />
                        ) : (
                          analyse.ARDOISEE_CALCULE?.toFixed(2) + '%'
                        )}
                      </td>
                      
                      <td className="p-1">
                        {editingId === analyse.ID_ANALYSE_KKO ? (
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full px-2 py-1 border rounded"
                            value={editingData.PLATE_CALCULE || ''}
                            onChange={(e) => setEditingData(prev => ({...prev, PLATE_CALCULE: parseFloat(e.target.value)}))}
                          />
                        ) : (
                          analyse.PLATE_CALCULE?.toFixed(2) + '%'
                        )}
                      </td>
                      
                      <td className="p-1">
                        {editingId === analyse.ID_ANALYSE_KKO ? (
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full px-2 py-1 border rounded"
                            value={editingData.GERMEE_CALCULE || ''}
                            onChange={(e) => setEditingData(prev => ({...prev, GERMEE_CALCULE: parseFloat(e.target.value)}))}
                          />
                        ) : (
                          analyse.GERMEE_CALCULE?.toFixed(2) + '%'
                        )}
                      </td>
                      
                      <td className="p-1">
                        {editingId === analyse.ID_ANALYSE_KKO ? (
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full px-2 py-1 border rounded"
                            value={editingData.VIOLETTE_CALCULE || ''}
                            onChange={(e) => setEditingData(prev => ({...prev, VIOLETTE_CALCULE: parseFloat(e.target.value)}))}
                          />
                        ) : (
                          analyse.VIOLETTE_CALCULE?.toFixed(2) + '%'
                        )}
                      </td>
                      
                      <td className="p-3">{calculerDefectueuses(analyse)}%</td>
                      
                      <td className="p-1">
                        {editingId === analyse.ID_ANALYSE_KKO ? (
                          <input 
                            type="text" 
                            className="w-full px-2 py-1 border rounded"
                            value={editingData.NORME_IVOIRIENNE || ''}
                            onChange={(e) => setEditingData(prev => ({...prev, NORME_IVOIRIENNE: e.target.value}))}
                          />
                        ) : (
                          analyse.NORME_IVOIRIENNE
                        )}
                      </td>
                      
                      <td className="p-1">
                        {editingId === analyse.ID_ANALYSE_KKO ? (
                          <input 
                            type="text" 
                            className="w-full px-2 py-1 border rounded"
                            value={editingData.NORME_INTERNATIONALE || ''}
                            onChange={(e) => setEditingData(prev => ({...prev, NORME_INTERNATIONALE: e.target.value}))}
                          />
                        ) : (
                          analyse.NORME_INTERNATIONALE
                        )}
                      </td>
                      
                      <td className="p-1">
                        {editingId === analyse.ID_ANALYSE_KKO ? (
                          <select 
                            className="w-full px-2 py-1 border rounded"
                            value={editingData.CONFORME || 0}
                            onChange={(e) => setEditingData(prev => ({...prev, CONFORME: parseInt(e.target.value)}))}
                          >
                            <option value={1}>Conforme</option>
                            <option value={0}>Non Conforme</option>
                          </select>
                        ) : (
                          analyse.CONFORME === 1 ? 'Conforme' : 'Non Conforme'
                        )}
                      </td>
                      
                      <td className="p-1">
                        {editingId === analyse.ID_ANALYSE_KKO ? (
                          <input 
                            type="text" 
                            className="w-full px-2 py-1 border rounded"
                            value={editingData.REMARQUE || ''}
                            onChange={(e) => setEditingData(prev => ({...prev, REMARQUE: e.target.value}))}
                          />
                        ) : (
                          analyse.REMARQUE?.substring(0, 30) + (analyse.REMARQUE?.length > 30 ? '...' : '')
                        )}
                      </td>
                      
                      <td className="p-3">
                        <div className="flex gap-2">
                          {editingId === analyse.ID_ANALYSE_KKO ? (
                            <>
                              <button 
                                onClick={() => sauvegarderModification(analyse.ID_ANALYSE_KKO)}
                                className="bg-green-500 hover:bg-green-600 text-white p-1 rounded"
                                title="Sauvegarder"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={annulerModification}
                                className="bg-gray-500 hover:bg-gray-600 text-white p-1 rounded"
                                title="Annuler"
                              >
                                <XIcon className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => demarrerModification(analyse)}
                                className="bg-blue-500 hover:bg-blue-600 text-white p-1 rounded"
                                title="Modifier"
                              >
                                <EditIconAlt className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => rejeterAnalyse(analyse.ID_ANALYSE_KKO)}
                                className="bg-red-500 hover:bg-red-600 text-white p-1 rounded"
                                title="Rejeter"
                              >
                                <XIcon className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination and Table Actions */}
          <div className="flex justify-between items-center mt-4">
            <div>
              <span className="text-sm text-gray-600">
                Total: {analysesFiltrees.length} analyse(s)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={exporterAnalyses}
                className="px-4 py-2 text-sm font-medium text-white bg-[#0d2d53] rounded-md hover:bg-blue-800 flex items-center gap-2"
              >
                <ExportIcon className="h-5 w-5"/>
                Exporter CSV
              </button>
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <PrintIcon className="h-5 w-5"/>
                Imprimer
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
          <button 
            onClick={onNavigateBack}
            className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-6 rounded-lg border border-gray-300 shadow-sm transition-colors"
          >
            Retour
          </button>
          <button 
            onClick={validerAnalyses}
            disabled={selection.length === 0}
            className={`font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center gap-2 ${
              selection.length === 0 
                ? 'bg-gray-400 cursor-not-allowed text-gray-700' 
                : 'bg-[#0d2d53] hover:bg-blue-800 text-white'
            }`}
          >
            <CheckIcon className="h-5 w-5"/>
            <span>Valider la Sélection ({selection.length})</span>
          </button>
          <button 
            onClick={chargerDonnees}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors"
          >
            Actualiser
          </button>
        </div>
      </div>

      <style>{`
        .form-input {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgb(59 130 246 / 0.25);
        }
        .form-select {
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          background-color: white;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }
        .form-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgb(59 130 246 / 0.25);
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
          position: absolute;
          right: 0;
          top: 0;
        }
      `}</style>
    </div>
  );
};

export default ValidationCacao;