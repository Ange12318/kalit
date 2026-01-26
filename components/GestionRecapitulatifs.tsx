import React, { useState, useEffect } from 'react';
import {
  BackArrowIcon,
  ReceiptIcon,
  SearchIcon,
  CalendarIcon,
  PrintIcon,
   EditIconAlt,
  TrashIcon,
  SaveIcon,
  EmptyBoxIcon
} from './Icons';

interface GestionRecapitulatifsProps {
  onNavigateBack: () => void;
}

const GestionRecapitulatifs: React.FC<GestionRecapitulatifsProps> = ({ onNavigateBack }) => {
  const [recaps, setRecaps] = useState([]);
  const [factures, setFactures] = useState([]);
  const [selectedRecap, setSelectedRecap] = useState(null);
  const [selectedFactures, setSelectedFactures] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [recapData, setRecapData] = useState({
    code: '',
    dateDebut: '',
    dateFin: '',
    commentaire: ''
  });

  const tableHeaders = [
    "Code Récap", "Date Début", "Date Fin", "Nbre Factures", "Montant Total", "Commentaire", "Actions"
  ];

  // Charger les récapitulatifs existants
  const loadRecaps = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/recapitulatifs');
      
      if (!response.ok) {
        // Essayer de récupérer le message d'erreur JSON
        try {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erreur ${response.status}`);
        } catch (parseErr) {
          // Si ce n'est pas du JSON, retourner une erreur générique
          throw new Error(`Erreur serveur ${response.status}: ${response.statusText}`);
        }
      }

      const data = await response.json();
      setRecaps(data.data || []);
      setError('');
    } catch (err) {
      console.error('Erreur loadRecaps:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      setRecaps([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les factures disponibles
const loadFactures = async () => {
  try {
    const response = await fetch('/api/factures?limit=1000');

    if (!response.ok) {
      // Essayer de récupérer le message d'erreur JSON
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur ${response.status}`);
      } catch (parseErr) {
        // Si ce n'est pas du JSON, retourner une erreur générique
        throw new Error(`Erreur serveur ${response.status}: ${response.statusText}`);
      }
    }

    const data = await response.json();
    // CORRECTION : Gérer le cas où data est un tableau ou un objet avec data
    if (Array.isArray(data)) {
      setFactures(data);
    } else {
      setFactures(data.data || []);
    }
  } catch (err) {
    console.error('Erreur loadFactures:', err);
    // Ne pas afficher l'erreur si c'est juste qu'il n'y a pas de factures
    setFactures([]);
  }
};

  useEffect(() => {
    loadRecaps();
    loadFactures();
  }, []);

  // Générer le nom par défaut
  const generateDefaultCode = () => {
    const now = new Date();
    const mois = (now.getMonth() + 1).toString().padStart(2, '0');
    const annee = now.getFullYear();
    return `RECAP-${mois}-${annee}`;
  };

  // Gérer l'ouverture de la modale de création
  const handleOpenCreateModal = () => {
    const defaultCode = generateDefaultCode();
    const today = new Date().toISOString().split('T')[0];
    
    setRecapData({
      code: defaultCode,
      dateDebut: today,
      dateFin: today,
      commentaire: 'Récapitulatif mensuel'
    });
    setSelectedFactures([]);
    setShowCreateModal(true);
    setError('');
  };

  // Gérer l'ouverture de la modale d'édition
  const handleOpenEditModal = (recap) => {
    setSelectedRecap(recap);
    setRecapData({
      code: recap.CODE_REACP || '',
      dateDebut: recap.DATE_DEBUT_RECAP ? recap.DATE_DEBUT_RECAP.split('T')[0] : '',
      dateFin: recap.DATE_FIN_RECAP ? recap.DATE_FIN_RECAP.split('T')[0] : '',
      commentaire: recap.CMT_RECAP || ''
    });
    
    // Charger les factures de ce récapitulatif
    fetchRecapFactures(recap.ID_RECAP);
    
    setShowEditModal(true);
    setError('');
  };

  // Charger les factures d'un récapitulatif
  const fetchRecapFactures = async (idRecap) => {
    try {
      const response = await fetch(`/api/recapitulatifs/${idRecap}/factures`);
      if (!response.ok) throw new Error('Erreur lors du chargement des factures');
      const data = await response.json();
      setSelectedFactures(data.map(f => f.ID_FACTURES));
    } catch (err) {
      setError(err.message);
    }
  };

  // Créer un récapitulatif
  const handleCreateRecap = async () => {
    if (!recapData.code.trim()) {
      setError('Le code du récapitulatif est requis');
      return;
    }

    if (selectedFactures.length === 0) {
      setError('Veuillez sélectionner au moins une facture');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/recapitulatifs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...recapData,
          facturesIds: selectedFactures
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création');
      }

      const result = await response.json();
      setSuccessMessage('Récapitulatif créé avec succès');
      setShowCreateModal(false);
      loadRecaps();
      
      // Réinitialiser les données
      setRecapData({
        code: '',
        dateDebut: '',
        dateFin: '',
        commentaire: ''
      });
      setSelectedFactures([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Modifier un récapitulatif
  const handleUpdateRecap = async () => {
    if (!selectedRecap) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/recapitulatifs/${selectedRecap.ID_RECAP}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...recapData,
          facturesIds: selectedFactures
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la modification');
      }

      const result = await response.json();
      setSuccessMessage('Récapitulatif modifié avec succès');
      setShowEditModal(false);
      loadRecaps();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer un récapitulatif
  const handleDeleteRecap = async (idRecap) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce récapitulatif ?')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/recapitulatifs/${idRecap}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      setSuccessMessage('Récapitulatif supprimé avec succès');
      loadRecaps();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer une facture d'un récapitulatif
  const handleRemoveFactureFromRecap = async (factureId) => {
    if (!selectedRecap) return;

    try {
      const response = await fetch(`/api/recapitulatifs/${selectedRecap.ID_RECAP}/factures/${factureId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      // Mettre à jour la liste des factures sélectionnées
      setSelectedFactures(prev => prev.filter(id => id !== factureId));
      
      // Recharger les données du récapitulatif
      loadRecaps();
    } catch (err) {
      setError(err.message);
    }
  };

  // Exporter un récapitulatif
  const handleExportRecap = async (recap) => {
    try {
      const response = await fetch(`/api/recapitulatifs/${recap.ID_RECAP}/export`);
      if (!response.ok) throw new Error('Erreur lors de l\'export');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${recap.CODE_REACP}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
    }
  };

  // Gérer la sélection/désélection des factures
  const toggleFactureSelection = (factureId) => {
    setSelectedFactures(prev => {
      if (prev.includes(factureId)) {
        return prev.filter(id => id !== factureId);
      } else {
        return [...prev, factureId];
      }
    });
  };

  // Filtrer les récapitulatifs
  const filteredRecaps = recaps.filter(recap =>
    recap.CODE_REACP?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recap.CMT_RECAP?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculer le montant total des factures sélectionnées
  const calculateSelectedTotal = () => {
    return selectedFactures.reduce((total, factureId) => {
      const facture = factures.find(f => f.ID_FACTURES === factureId);
      return total + (facture?.MONTANT_FACTURES || 0);
    }, 0);
  };

  // Obtenir les factures d'un récapitulatif
  const getRecapFactures = (recapId) => {
    // Dans une implémentation réelle, vous feriez un appel API
    // Pour l'exemple, nous filtrons les factures
    return factures.filter(f => f.ID_RECAP === recapId);
  };

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* En-tête */}
      <div className="bg-[#0d2d53] text-white rounded-t-xl p-6 flex items-center shadow-lg">
        <ReceiptIcon className="h-10 w-10 mr-4" />
        <div>
          <h2 className="text-3xl font-bold">Gestion des Récapitulatifs</h2>
          <p className="text-blue-200">Groupement et suivi des factures par période</p>
        </div>
      </div>

      {/* Messages d'alerte */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
          <p>{error}</p>
        </div>
      )}
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
          <p>{successMessage}</p>
        </div>
      )}

      {/* Contenu principal */}
      <div className="bg-white p-6 rounded-b-xl shadow-lg border space-y-6">
        {/* Barre d'actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher par code ou commentaire..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md flex items-center gap-2"
          >
            <SaveIcon className="h-5 w-5" />
            Créer un nouveau récapitulatif
          </button>
        </div>

        {/* Tableau des récapitulatifs */}
        <div>
          <div className="overflow-x-auto border rounded-lg shadow-md">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 uppercase text-xs text-gray-600">
                <tr>
                  {tableHeaders.map(header => (
                    <th key={header} className="p-3 font-semibold tracking-wider text-left">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={tableHeaders.length} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredRecaps.length === 0 ? (
                  <tr>
                    <td colSpan={tableHeaders.length} className="text-center py-20">
                      <EmptyBoxIcon className="h-16 w-16 mx-auto text-gray-300" />
                      <p className="text-gray-500 font-semibold mt-2">Aucun récapitulatif à afficher</p>
                      <button
                        onClick={handleOpenCreateModal}
                        className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Créer votre premier récapitulatif
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredRecaps.map((recap) => (
                    <tr key={recap.ID_RECAP} className="hover:bg-gray-50">
                      <td className="p-3 font-medium text-blue-700">{recap.CODE_REACP}</td>
                      <td className="p-3">
                        {recap.DATE_DEBUT_RECAP ? new Date(recap.DATE_DEBUT_RECAP).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="p-3">
                        {recap.DATE_FIN_RECAP ? new Date(recap.DATE_FIN_RECAP).toLocaleDateString('fr-FR') : '-'}
                      </td>
                      <td className="p-3 font-semibold">{recap.NBRE_FACTURE_RECAP || 0}</td>
                      <td className="p-3 font-bold text-green-700">
                        {(recap.MONTANT_RECAP || 0).toLocaleString('fr-FR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })} FCFA
                      </td>
                      <td className="p-3 text-gray-600 max-w-xs truncate">{recap.CMT_RECAP}</td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(recap)}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Modifier"
                          >
                            < EditIconAlt className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleExportRecap(recap)}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Exporter"
                          >
                            <PrintIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecap(recap.ID_RECAP)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modale de création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-2xl font-bold text-gray-800">Créer un récapitulatif</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Formulaire de création */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code du récapitulatif *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={recapData.code}
                    onChange={(e) => setRecapData({...recapData, code: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={recapData.commentaire}
                    onChange={(e) => setRecapData({...recapData, commentaire: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={recapData.dateDebut}
                    onChange={(e) => setRecapData({...recapData, dateDebut: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={recapData.dateFin}
                    onChange={(e) => setRecapData({...recapData, dateFin: e.target.value})}
                  />
                </div>
              </div>

              {/* Liste des factures disponibles */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4">Sélectionner les factures</h4>
                <div className="border rounded-lg max-h-60 overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="p-3 text-left">Sélection</th>
                        <th className="p-3 text-left">N° Facture</th>
                        <th className="p-3 text-left">Exportateur</th>
                        <th className="p-3 text-left">Montant</th>
                        <th className="p-3 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {factures
                                .filter(f => !f.ID_RECAP) // AJOUTER CETTE LIGNE - Filtrer les factures sans récap

                      .map((facture) => (
                        <tr key={facture.ID_FACTURES} className="border-t hover:bg-gray-50">
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedFactures.includes(facture.ID_FACTURES)}
                              onChange={() => toggleFactureSelection(facture.ID_FACTURES)}
                              className="h-4 w-4 text-blue-600"
                            />
                          </td>
                          <td className="p-3 font-medium">{facture.REF_FACUTRES}</td>
                          <td className="p-3">{facture.RAISONSOCIALE_EXPORTATEUR}</td>
                          <td className="p-3 font-semibold">
                            {(facture.MONTANT_FACTURES || 0).toLocaleString('fr-FR')} FCFA
                          </td>
                          <td className="p-3">
                            {facture.DATE_FACTURES ? new Date(facture.DATE_FACTURES).toLocaleDateString('fr-FR') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {selectedFactures.length} facture(s) sélectionnée(s)
                  </span>
                  <span className="font-bold text-green-700">
                    Total: {calculateSelectedTotal().toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreateRecap}
                  disabled={isLoading || selectedFactures.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? 'Création...' : 'Créer le récapitulatif'}
                  <SaveIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'édition */}
      {showEditModal && selectedRecap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  Modifier le récapitulatif: {selectedRecap.CODE_REACP}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Formulaire d'édition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code du récapitulatif *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={recapData.code}
                    onChange={(e) => setRecapData({...recapData, code: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={recapData.commentaire}
                    onChange={(e) => setRecapData({...recapData, commentaire: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={recapData.dateDebut}
                    onChange={(e) => setRecapData({...recapData, dateDebut: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={recapData.dateFin}
                    onChange={(e) => setRecapData({...recapData, dateFin: e.target.value})}
                  />
                </div>
              </div>

              {/* Liste des factures du récapitulatif */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4">Factures du récapitulatif</h4>
                <div className="border rounded-lg max-h-60 overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="p-3 text-left">Sélection</th>
                        <th className="p-3 text-left">N° Facture</th>
                        <th className="p-3 text-left">Exportateur</th>
                        <th className="p-3 text-left">Montant</th>
                        <th className="p-3 text-left">Date</th>
                        <th className="p-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {factures
                        .filter(f => selectedFactures.includes(f.ID_FACTURES))
                        .map((facture) => (
                          <tr key={facture.ID_FACTURES} className="border-t hover:bg-gray-50">
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={selectedFactures.includes(facture.ID_FACTURES)}
                                onChange={() => toggleFactureSelection(facture.ID_FACTURES)}
                                className="h-4 w-4 text-blue-600"
                              />
                            </td>
                            <td className="p-3 font-medium">{facture.REF_FACUTRES}</td>
                            <td className="p-3">{facture.RAISONSOCIALE_EXPORTATEUR}</td>
                            <td className="p-3 font-semibold">
                              {(facture.MONTANT_FACTURES || 0).toLocaleString('fr-FR')} FCFA
                            </td>
                            <td className="p-3">
                              {facture.DATE_FACTURES ? new Date(facture.DATE_FACTURES).toLocaleDateString('fr-FR') : '-'}
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => handleRemoveFactureFromRecap(facture.ID_FACTURES)}
                                className="text-red-600 hover:text-red-800 p-1"
                                title="Retirer du récapitulatif"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {selectedFactures.length} facture(s) dans le récapitulatif
                  </span>
                  <span className="font-bold text-green-700">
                    Total: {calculateSelectedTotal().toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleUpdateRecap}
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? 'Modification...' : 'Modifier'}
                  <SaveIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bouton Retour */}
      <div className="mt-8">
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

export default GestionRecapitulatifs;