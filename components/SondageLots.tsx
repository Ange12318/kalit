import React, { useState, useEffect } from 'react';
import {
  BackArrowIcon,
  CalendarIcon,
  SearchIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  ValidationIcon
} from './Icons';

interface Lot {
  ID_LOTS: number;
  NUM_LOTS: string;
  REF_DEMANDE: string;
  LIBELLE_PRODUIT: string;
  VILLE_EXPORTATEUR: string;
  RAISONSOCIALE_EXPORTATEUR: string;
  DATEREC_DEMANDE: string;
  RECOLTE_LOTS: string;
  NOM_MAGASIN: string;
  ID_GRADE: string;
  ETAT_SONDAGE_LOTS: string;
}

interface SondageLotsProps {
  onNavigateBack: () => void;
}

const SondageLots: React.FC<SondageLotsProps> = ({ onNavigateBack }) => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLots, setSelectedLots] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [decisionSondage, setDecisionSondage] = useState('Oui');
  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);
  const [codeSondeur, setCodeSondeur] = useState<string>('');

  // Date du jour par défaut
  const today = new Date().toISOString().split('T')[0];

  // Filtres
  const [filters, setFilters] = useState({
    reference: '',
    dossier: '',
    numeroLot: '',
    exportateur: '',
    produit: '',
    type: '',
    recolte: '',
    ville: '',
    dateDebut: today,
    dateFin: today
  });

  const [exportateurs, setExportateurs] = useState<any[]>([]);
  const [produits, setProduits] = useState<any[]>([]);

  const tableHeaders = [
    'NUMERO LOTS', 'N°LOTS', 'REFERENCE', 'PRODUIT', 'VILLE', 'EXPORTATEUR', 
    'DATE RECEPTION', 'RECOLTE', 'MAGASIN', 'GRADE LOT', 'STATUT SONDAGE'
  ];

  useEffect(() => {
    // Charger les listes déroulantes
    const fetchSelects = async () => {
      try {
        const [expRes, prodRes, usersRes] = await Promise.all([
          fetch('http://localhost:5000/api/exportateurs'),
          fetch('http://localhost:5000/api/produits'),
          fetch('http://localhost:5000/api/utilisateurs')
        ]);
        const exportateursData = await expRes.json();
        const produitsData = await prodRes.json();
        const utilisateursData = await usersRes.json();
        setExportateurs(exportateursData);
        setProduits(produitsData);
        setUtilisateurs(utilisateursData);
        
        // Sélectionner le premier utilisateur par défaut si disponible
        if (utilisateursData.length > 0) {
          setCodeSondeur(utilisateursData[0].id.toString());
        }
      } catch (err) {
        console.error('Erreur chargement des listes:', err);
      }
    };
    fetchSelects();
  }, []);

  const rechercherLots = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.reference) params.append('reference', filters.reference);
      if (filters.numeroLot) params.append('numeroLot', filters.numeroLot);
      if (filters.exportateur) params.append('exportateur', filters.exportateur);
      if (filters.produit) params.append('produit', filters.produit);
      if (filters.recolte) params.append('recolte', filters.recolte);
      if (filters.ville) params.append('ville', filters.ville);
      if (filters.dateDebut) params.append('dateDebut', filters.dateDebut);
      if (filters.dateFin) params.append('dateFin', filters.dateFin);

      const res = await fetch(`http://localhost:5000/api/sondage/lots?${params}`);
      const data = await res.json();
      setLots(data);
      setSelectedLots([]);
    } catch (err) {
      console.error('Erreur recherche lots:', err);
      alert('Erreur lors de la recherche des lots');
    }
    setLoading(false);
  };

  const reinitialiserFiltres = () => {
    setFilters({
      reference: '',
      dossier: '',
      numeroLot: '',
      exportateur: '',
      produit: '',
      type: '',
      recolte: '',
      ville: '',
      dateDebut: today,
      dateFin: today
    });
    setLots([]);
    setSelectedLots([]);
  };

  const toggleSelectAll = () => {
    if (selectedLots.length === lots.length) {
      setSelectedLots([]);
    } else {
      setSelectedLots(lots.map(lot => lot.ID_LOTS));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedLots(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const validerDecisionSondage = async () => {
    if (selectedLots.length === 0) {
      alert('Veuillez sélectionner au moins un lot');
      return;
    }

    // Vérifier qu'un code sondeur est sélectionné si la décision est "Oui"
    if (decisionSondage === 'Oui' && !codeSondeur) {
      alert('Veuillez sélectionner un sondeur');
      return;
    }

    setLoading(true);
    try {
      // Utiliser l'endpoint d'enregistrement complet
      const res = await fetch('http://localhost:5000/api/lots/enregistrerSondage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lotIds: selectedLots,
          dateSondage: new Date().toISOString().slice(0, 19).replace('T', ' '),
          codeSondeur: decisionSondage === 'Oui' ? codeSondeur : null,
          observationSondage: `Sondage effectué le ${new Date().toLocaleDateString('fr-FR')}`,
          decisionSondage: decisionSondage,
          nbreEchanSondage: 10,
          poidsTotalSondage: 100
        })
      });

      const result = await res.json();
      
      if (res.ok) {
        alert(`${selectedLots.length} lot(s) ${decisionSondage === 'Oui' ? 'sondé(s) et enregistré(s) dans le registre' : 'marqué(s) comme non sondé(s)'}`);
        rechercherLots();
        setSelectedLots([]);
      } else {
        alert(`Erreur: ${result.error || 'L\'enregistrement a échoué'}`);
      }
    } catch (err) {
      console.error('Erreur enregistrement sondage:', err);
      alert('Erreur réseau lors de l\'enregistrement');
    }
    setLoading(false);
  };

  const getStatutSondageColor = (statut: string) => {
    return statut === 'OUI' ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
  };

  const getRowColor = (statut: string) => {
    return statut === 'OUI' ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-gray-50">
      {/* Header */}
      <div className="bg-[#0d2d53] text-white rounded-t-xl p-6 flex items-center shadow-lg">
        <MagnifyingGlassIcon className="h-10 w-10 mr-4" />
        <div>
          <h2 className="text-3xl font-bold">Sondage des Lots</h2>
          <p className="text-blue-200">Gestion du sondage des lots pour échantillonnage</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-white p-6 rounded-b-xl shadow-lg border">
        {/* Filters */}
        <div className="mb-6 pb-6 border-b">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">CRITÈRES DE RECHERCHE</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 text-sm">
            <div className="space-y-1">
              <label className="font-medium text-gray-600"># Référence</label>
              <input 
                type="text" 
                placeholder="Saisir la référence" 
                className="w-full form-input"
                value={filters.reference}
                onChange={e => setFilters({...filters, reference: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-600">N° Dossier</label>
              <input 
                type="text" 
                placeholder="N° de dossier" 
                className="w-full form-input"
                value={filters.dossier}
                onChange={e => setFilters({...filters, dossier: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-600">N° Lots</label>
              <input 
                type="text" 
                placeholder="N° des lots" 
                className="w-full form-input"
                value={filters.numeroLot}
                onChange={e => setFilters({...filters, numeroLot: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Exportateur</label>
              <select 
                className="w-full form-select"
                value={filters.exportateur}
                onChange={e => setFilters({...filters, exportateur: e.target.value})}
              >
                <option value="">Sélectionner</option>
                {exportateurs.map(exp => (
                  <option key={exp.id} value={exp.id}>{exp.nom}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Produit</label>
              <select 
                className="w-full form-select"
                value={filters.produit}
                onChange={e => setFilters({...filters, produit: e.target.value})}
              >
                <option value="">Sélectionner</option>
                {produits.map(prod => (
                  <option key={prod.id} value={prod.id}>{prod.nom}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Récolte</label>
              <input 
                type="text" 
                placeholder="Récolte" 
                className="w-full form-input"
                value={filters.recolte}
                onChange={e => setFilters({...filters, recolte: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Ville</label>
              <select 
                className="w-full form-select"
                value={filters.ville}
                onChange={e => setFilters({...filters, ville: e.target.value})}
              >
                <option value="">Sélectionner</option>
                <option value="ABIDJAN">ABIDJAN</option>
                <option value="SAN PEDRO">SAN PEDRO</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Date Début</label>
              <div className="relative">
                <input 
                  type="date" 
                  className="w-full form-input pr-8" 
                  value={filters.dateDebut}
                  onChange={e => setFilters({...filters, dateDebut: e.target.value})}
                />
                <CalendarIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Date Fin</label>
              <div className="relative">
                <input 
                  type="date" 
                  className="w-full form-input pr-8" 
                  value={filters.dateFin}
                  onChange={e => setFilters({...filters, dateFin: e.target.value})}
                />
                <CalendarIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <button 
              onClick={rechercherLots}
              disabled={loading}
              className="bg-[#0d2d53] hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center gap-2"
            >
              <SearchIcon className="h-5 w-5"/>
              <span>{loading ? 'Recherche...' : 'Rechercher'}</span>
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
          <p className="text-center text-sm text-gray-500 mb-2 italic">** Faites défiler horizontalement pour voir toutes les colonnes</p>
          <div className="overflow-x-auto border rounded-lg shadow-md">
            <table className="min-w-full text-xs">
              <thead className="bg-[#0d2d53] text-white uppercase">
                <tr>
                  <th className="p-3 sticky left-0 bg-[#0d2d53] z-10 w-12">
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      onChange={toggleSelectAll}
                      checked={selectedLots.length === lots.length && lots.length > 0}
                    />
                  </th>
                  {tableHeaders.map(header => (
                     <th key={header} className="p-2 font-semibold tracking-wider text-left whitespace-nowrap">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td colSpan={tableHeaders.length + 1} className="text-center py-4">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Chargement...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && lots.length === 0 && (
                  <tr>
                    <td colSpan={tableHeaders.length + 1} className="text-center py-20">
                      <p className="text-gray-500 font-semibold">Aucune donnée à afficher</p>
                      <p className="text-sm text-gray-400 mt-2">Utilisez les filtres pour rechercher des lots</p>
                    </td>
                  </tr>
                )}
                {!loading && lots.map(lot => (
                  <tr 
                    key={lot.ID_LOTS} 
                    className={`${getRowColor(lot.ETAT_SONDAGE_LOTS)} transition-colors`}
                  >
                    <td className="p-3 sticky left-0 bg-inherit z-10">
                      <input 
                        type="checkbox" 
                        className="rounded" 
                        checked={selectedLots.includes(lot.ID_LOTS)}
                        onChange={() => toggleSelect(lot.ID_LOTS)}
                      />
                    </td>
                    <td className="p-2 whitespace-nowrap">{lot.NUM_LOTS || '-'}</td>
                    <td className="p-2 whitespace-nowrap">{lot.NUM_LOTS || '-'}</td>
                    <td className="p-2 whitespace-nowrap">{lot.REF_DEMANDE || '-'}</td>
                    <td className="p-2 whitespace-nowrap">{lot.LIBELLE_PRODUIT || '-'}</td>
                    <td className="p-2 whitespace-nowrap">{lot.VILLE_EXPORTATEUR || '-'}</td>
                    <td className="p-2 whitespace-nowrap">{lot.RAISONSOCIALE_EXPORTATEUR || '-'}</td>
                    <td className="p-2 whitespace-nowrap">{formatDate(lot.DATEREC_DEMANDE)}</td>
                    <td className="p-2 whitespace-nowrap">{lot.RECOLTE_LOTS || '-'}</td>
                    <td className="p-2 whitespace-nowrap">{lot.NOM_MAGASIN || '-'}</td>
                    <td className="p-2 whitespace-nowrap">{lot.ID_GRADE || '-'}</td>
                    <td className={`p-2 whitespace-nowrap ${getStatutSondageColor(lot.ETAT_SONDAGE_LOTS)}`}>
                      {lot.ETAT_SONDAGE_LOTS === 'OUI' ? 'Sondé' : 'Non sondé'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Decision Section */}
        <div className="mt-6 pt-6 border-t bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <QuestionMarkCircleIcon className="h-6 w-6 mr-2 text-blue-700"/>
            Décision de Sondage
            {selectedLots.length > 0 && (
              <span className="ml-2 text-sm font-normal text-blue-600">
                ({selectedLots.length} lot(s) sélectionné(s))
              </span>
            )}
          </h3>
          
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="space-y-1 w-64">
              <label className="font-medium text-gray-600">Sonder ?</label>
              <select 
                className="w-full form-select"
                value={decisionSondage}
                onChange={e => setDecisionSondage(e.target.value)}
              >
                <option value="Oui">Oui (enregistre dans le registre)</option>
                <option value="Non">Non (marque simplement comme non sondé)</option>
              </select>
            </div>
            
            {decisionSondage === 'Oui' && (
              <div className="space-y-1 w-64">
                <label className="font-medium text-gray-600">Sondeur *</label>
                <select 
                  className="w-full form-select"
                  value={codeSondeur}
                  onChange={e => setCodeSondeur(e.target.value)}
                  required
                >
                  <option value="">Sélectionner un sondeur</option>
                  {utilisateurs.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.nom} {user.fonction ? `(${user.fonction})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <button 
              onClick={validerDecisionSondage}
              disabled={selectedLots.length === 0 || loading || (decisionSondage === 'Oui' && !codeSondeur)}
              className={`${
                selectedLots.length > 0 && !loading && !(decisionSondage === 'Oui' && !codeSondeur)
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              } text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center gap-2`}
            >
              <ValidationIcon className="h-5 w-5"/>
              <span>
                {loading ? 'Enregistrement...' : `Valider (${selectedLots.length} lot(s))`}
              </span>
            </button>
          </div>
          
          <div className="mt-3 text-sm text-gray-600">
            <strong>Note :</strong> {decisionSondage === 'Oui' 
              ? 'Un sondeur valide doit être sélectionné pour l\'enregistrement dans le registre.' 
              : 'Les lots seront seulement marqués comme non sondés.'}
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
        </div>
      </div>
      
      {/* Back Button */}
      <div className="mt-8">
        <button onClick={onNavigateBack} className="flex items-center space-x-2 bg-[#0d2d53] hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-colors">
          <BackArrowIcon className="h-5 w-5" />
          <span>Retour</span>
        </button>
      </div>

      <style>{`
        .form-input, .form-select {
            padding: 0.5rem 0.75rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input:focus, .form-select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgb(59 130 246 / 0.25);
        }
        .form-select {
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
      `}</style>
    </div>
  );
};

export default SondageLots;