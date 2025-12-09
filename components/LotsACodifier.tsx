import React, { useState, useEffect } from 'react';
import {
  BackArrowIcon, CalendarIcon, SearchIcon, ValidationIcon, PrintIcon,
  BoxIcon, KeyIcon, QuestionMarkCircleIcon, RefreshIcon, SparklesIcon
} from './Icons';

interface Lot {
  ID_LOTS: number;
  NUM_LOTS: string;
  REF_DEMANDE: string;
  LIBELLE_PRODUIT: string;
  VILLE_EXPORTATEUR: string;
  RAISONSOCIALE_EXPORTATEUR: string;
  DATEREC_DEMANDE: string;
  DATE_EXPIR_DEMANDE: string;
  RECOLTE_LOTS: string;
  NOM_MAGASIN: string;
  ID_GRADE: string;
  ETAT_SONDAGE_LOTS: string;
  ETAT_CODIFICATION_LOTS: string;
}

interface CodeSecret {
  ID_CODIFICATION: number;
  CODE_SECRET_CODIFICATION: string;
  DATE_ENREG_CODIFICATION: string;
  LIBELLE_CODIFICATION: string;
  NUM_LOTS: string;
  LIBELLE_PRODUIT: string;
}

interface LotsACodifierProps {
  onNavigateBack: () => void;
  onIncrementCodeJour: () => void;
}

const lotsHeaders = [
  'N°DOSSIER', 'REFERENCE', 'PRODUIT', 'VILLE', 'EXPORTATEURS', 'DATE RECEPTION', 
  'DATE EXPIRATION', 'RECOLTE', 'MAGASIN', 'GRADE LOT'
];

const LotsACodifier: React.FC<LotsACodifierProps> = ({ onNavigateBack, onIncrementCodeJour }) => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLots, setSelectedLots] = useState<number[]>([]);
  const [codesSecrets, setCodesSecrets] = useState<CodeSecret[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingCodes, setGeneratingCodes] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);

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
    dateDebut: new Date().toISOString().split('T')[0],
    dateFin: new Date().toISOString().split('T')[0]
  });

  const [exportateurs, setExportateurs] = useState<any[]>([]);
  const [produits, setProduits] = useState<any[]>([]);

  useEffect(() => {
    // Charger les listes déroulantes
    const fetchSelects = async () => {
      try {
        const [expRes, prodRes] = await Promise.all([
          fetch('http://localhost:5000/api/exportateurs'),
          fetch('http://localhost:5000/api/produits')
        ]);
        const exportateursData = await expRes.json();
        const produitsData = await prodRes.json();
        setExportateurs(exportateursData);
        setProduits(produitsData);
      } catch (err) {
        console.error('Erreur chargement des listes:', err);
      }
    };
    fetchSelects();
  }, []);

  // Rechercher les lots SONDÉS uniquement
  const rechercherLotsSondes = async () => {
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
      params.append('sondes', 'true');

      const res = await fetch(`http://localhost:5000/api/sondage/lots?${params}`);
      const data = await res.json();
      
      const lotsSondes = data.filter((lot: Lot) => lot.ETAT_SONDAGE_LOTS === 'OUI');
      setLots(lotsSondes);
      setSelectedLots([]);
      
      // Charger les codes secrets existants
      await chargerCodesSecrets();
    } catch (err) {
      console.error('Erreur recherche lots sondés:', err);
      alert('Erreur lors de la recherche des lots sondés');
    }
    setLoading(false);
  };

  // Charger les codes secrets
  const chargerCodesSecrets = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/codes-secrets');
      const data = await res.json();
      setCodesSecrets(data);
    } catch (err) {
      console.error('Erreur chargement codes secrets:', err);
    }
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
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: new Date().toISOString().split('T')[0]
    });
    setLots([]);
    setSelectedLots([]);
    setCodesSecrets([]);
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

  // Générer le code secret selon le format spécifié
  const genererCodeSecret = (compteurEchantillons: number): string => {
    const maintenant = new Date();
    const derniereAnnee = maintenant.getFullYear().toString().slice(-1); // Dernier chiffre de l'année
    const jourDeLAnnee = Math.floor((maintenant.getTime() - new Date(maintenant.getFullYear(), 0, 0).getTime()) / 86400000);
    const jourFormate = jourDeLAnnee.toString().padStart(3, '0');
    const echantillonFormate = compteurEchantillons.toString().padStart(3, '0');
    
    return `${derniereAnnee}${jourFormate}${echantillonFormate}`;
  };

  // Générer le 1er code pour un lot
  const genererPremierCode = async (lotId: number) => {
    setGeneratingCodes(true);
    try {
      const res = await fetch('http://localhost:5000/api/codes-secrets/generer-premier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lotId })
      });

      if (res.ok) {
        const result = await res.json();
        alert(`1er code généré avec succès: ${result.codeSecret}`);
        await chargerCodesSecrets();
        if (onIncrementCodeJour) {
          onIncrementCodeJour();
        }
      } else {
        alert('Erreur lors de la génération du 1er code');
      }
    } catch (err) {
      console.error('Erreur génération 1er code:', err);
      alert('Erreur réseau');
    }
    setGeneratingCodes(false);
  };

  // Générer une reprise pour un lot
  const genererReprise = async (lotId: number) => {
    setGeneratingCodes(true);
    try {
      const res = await fetch('http://localhost:5000/api/codes-secrets/generer-reprise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lotId })
      });

      if (res.ok) {
        const result = await res.json();
        alert(`Reprise générée avec succès: ${result.codeSecret}`);
        await chargerCodesSecrets();
      } else {
        alert('Erreur lors de la génération de la reprise');
      }
    } catch (err) {
      console.error('Erreur génération reprise:', err);
      alert('Erreur réseau');
    }
    setGeneratingCodes(false);
  };

  // Générer des codes pour plusieurs lots sélectionnés
  const genererCodesSelection = async () => {
    if (selectedLots.length === 0) {
      alert('Veuillez sélectionner au moins un lot');
      return;
    }

    setGeneratingCodes(true);
    try {
      const res = await fetch('http://localhost:5000/api/codes-secrets/generer-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lotsIds: selectedLots })
      });

      if (res.ok) {
        const result = await res.json();
        alert(`${result.codesGeneres.length} code(s) généré(s) avec succès`);
        await chargerCodesSecrets();
        if (onIncrementCodeJour) {
          onIncrementCodeJour();
        }
      } else {
        alert('Erreur lors de la génération des codes');
      }
    } catch (err) {
      console.error('Erreur génération codes sélection:', err);
      alert('Erreur réseau');
    }
    setGeneratingCodes(false);
  };

  // Imprimer un code spécifique
  const imprimerCode = async (codeSecret: CodeSecret) => {
    setPrintLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/codes-secrets/imprimer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeSecret })
      });

      if (res.ok) {
        // Ouvrir une nouvelle fenêtre pour l'impression
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          const result = await res.json();
          printWindow.document.write(result.html);
          printWindow.document.close();
          printWindow.print();
        }
      } else {
        alert('Erreur lors de la génération du document d\'impression');
      }
    } catch (err) {
      console.error('Erreur impression:', err);
      alert('Erreur réseau');
    }
    setPrintLoading(false);
  };

  // Imprimer plusieurs codes
  const imprimerCodesSelection = async () => {
    if (codesSecrets.length === 0) {
      alert('Aucun code à imprimer');
      return;
    }

    setPrintLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/codes-secrets/imprimer-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codesSecrets })
      });

      if (res.ok) {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          const result = await res.json();
          printWindow.document.write(result.html);
          printWindow.document.close();
          printWindow.print();
        }
      } else {
        alert('Erreur lors de la génération du document d\'impression');
      }
    } catch (err) {
      console.error('Erreur impression multiple:', err);
      alert('Erreur réseau');
    }
    setPrintLoading(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleString('fr-FR');
    } catch {
      return dateString;
    }
  };

  // Vérifier si un lot a déjà un 1er code
  const lotAvecPremierCode = (lotId: number) => {
    return codesSecrets.some(code => 
      code.NUM_LOTS === lots.find(l => l.ID_LOTS === lotId)?.NUM_LOTS && 
      code.LIBELLE_CODIFICATION === '1er code'
    );
  };

  // Compter le nombre de reprises pour un lot
  const compterReprises = (numeroLot: string) => {
    return codesSecrets.filter(code => 
      code.NUM_LOTS === numeroLot && code.LIBELLE_CODIFICATION === 'Reprise'
    ).length;
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 bg-gray-50">
      
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        {/* Filters */}
        <div className="mb-6 pb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">CRITÈRES DE RECHERCHE - LOTS SONDÉS</h3>
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
              onClick={rechercherLotsSondes}
              disabled={loading}
              className="bg-[#0d2d53] hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center gap-2"
            >
              <SearchIcon className="h-5 w-5"/>
              <span>{loading ? 'Recherche...' : 'Rechercher Lots Sondés'}</span>
            </button>
            <button 
              onClick={reinitialiserFiltres}
              className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-6 rounded-lg border border-gray-300 shadow-sm transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-lg border space-y-6">
        {/* Lots à Codifier Table */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
            <BoxIcon className="h-6 w-6 mr-2 text-blue-800" />
            Lots Sondés à Codifier ({lots.length} lot(s))
          </h3>
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
                  <th className="p-2 font-semibold tracking-wider text-left whitespace-nowrap">NUMERO LOTS</th>
                  {lotsHeaders.map(header => (
                     <th key={header} className="p-2 font-semibold tracking-wider text-left whitespace-nowrap">{header}</th>
                  ))}
                  <th className="p-2 font-semibold tracking-wider text-left whitespace-nowrap">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && (
                  <tr>
                    <td colSpan={lotsHeaders.length + 3} className="text-center py-4">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Chargement...</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && lots.length === 0 && (
                  <tr>
                    <td colSpan={lotsHeaders.length + 3} className="text-center py-10">
                      <p className="text-gray-500 font-semibold">Aucun lot sondé à afficher</p>
                      <p className="text-sm text-gray-400 mt-2">Les lots doivent d'abord être validés dans le module de sondage</p>
                    </td>
                  </tr>
                )}
                {!loading && lots.map(lot => (
                  <tr key={lot.ID_LOTS} className="hover:bg-gray-50">
                    <td className="p-3 sticky left-0 bg-white z-10">
                      <input 
                        type="checkbox" 
                        className="rounded" 
                        checked={selectedLots.includes(lot.ID_LOTS)}
                        onChange={() => toggleSelect(lot.ID_LOTS)}
                      />
                    </td>
                    <td className="p-2 whitespace-nowrap font-medium">{lot.NUM_LOTS || '-'}</td>
                    <td className="p-2 whitespace-nowrap">{lot.REF_DEMANDE || '-'}</td>
                    <td className="p-2 whitespace-nowrap">{lot.REF_DEMANDE || '-'}</td>
                    <td className="p-2 whitespace-nowrap">{lot.LIBELLE_PRODUIT || '-'}</td>
                    <td className="p-2 whitespace-nowrap">{lot.VILLE_EXPORTATEUR || '-'}</td>
                    <td className="p-2 whitespace-nowrap">{lot.RAISONSOCIALE_EXPORTATEUR || '-'}</td>
                    <td className="p-2 whitespace-nowrap">{formatDate(lot.DATEREC_DEMANDE)}</td>
                    <td className="p-2 whitespace-nowrap">{formatDate(lot.DATE_EXPIR_DEMANDE)}</td>
                    <td className="p-2 whitespace-nowrap">{lot.RECOLTE_LOTS || '-'}</td>
                    <td className="p-2 whitespace-nowrap">{lot.NOM_MAGASIN || '-'}</td>
                    <td className="p-2 whitespace-nowrap">{lot.ID_GRADE || '-'}</td>
                    <td className="p-2 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {!lotAvecPremierCode(lot.ID_LOTS) ? (
                          <button
                            onClick={() => genererPremierCode(lot.ID_LOTS)}
                            disabled={generatingCodes}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2 rounded flex items-center gap-1"
                          >
                            <SparklesIcon className="h-3 w-3" />
                            1er Code
                          </button>
                        ) : (
                          <button
                            onClick={() => genererReprise(lot.ID_LOTS)}
                            disabled={generatingCodes}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded flex items-center gap-1"
                          >
                            <SparklesIcon className="h-3 w-3" />
                            Reprise ({compterReprises(lot.NUM_LOTS)})
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Codes Secrets Table */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
            <KeyIcon className="h-6 w-6 mr-2 text-blue-800" />
            Codes Secrets Générés ({codesSecrets.length} code(s))
          </h3>
          <div className="overflow-x-auto border rounded-lg shadow-md">
            <table className="min-w-full text-xs">
              <thead className="bg-[#0d2d53] text-white uppercase">
                <tr>
                  <th className="p-2 font-semibold tracking-wider text-left whitespace-nowrap">CODE SECRET</th>
                  <th className="p-2 font-semibold tracking-wider text-left whitespace-nowrap">TYPE</th>
                  <th className="p-2 font-semibold tracking-wider text-left whitespace-nowrap">NUMERO LOT</th>
                  <th className="p-2 font-semibold tracking-wider text-left whitespace-nowrap">PRODUIT</th>
                  <th className="p-2 font-semibold tracking-wider text-left whitespace-nowrap">DATE GENERATION</th>
                  <th className="p-2 font-semibold tracking-wider text-left whitespace-nowrap">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {codesSecrets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-10">
                      <p className="text-gray-500 font-semibold">Aucun code généré</p>
                      <p className="text-sm text-gray-400 mt-2">Générez des codes pour les lots affichés ci-dessus</p>
                    </td>
                  </tr>
                ) : (
                  codesSecrets.map((code, index) => (
                    <tr key={code.ID_CODIFICATION || index} className="hover:bg-gray-50">
                      <td className="p-2 whitespace-nowrap font-mono font-bold">{code.CODE_SECRET_CODIFICATION}</td>
                      <td className="p-2 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          code.LIBELLE_CODIFICATION === '1er code' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {code.LIBELLE_CODIFICATION}
                        </span>
                      </td>
                      <td className="p-2 whitespace-nowrap">{code.NUM_LOTS}</td>
                      <td className="p-2 whitespace-nowrap">{code.LIBELLE_PRODUIT}</td>
                      <td className="p-2 whitespace-nowrap">{formatDateTime(code.DATE_ENREG_CODIFICATION)}</td>
                      <td className="p-2 whitespace-nowrap">
                        <button
                          onClick={() => imprimerCode(code)}
                          disabled={printLoading}
                          className="bg-gray-600 hover:bg-gray-700 text-white text-xs py-1 px-2 rounded flex items-center gap-1"
                        >
                          <PrintIcon className="h-3 w-3" />
                          Imprimer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Actions Groupées */}
        <div className="mt-6 pt-6 border-t bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <QuestionMarkCircleIcon className="h-6 w-6 mr-2 text-blue-700"/>
            Actions Groupées
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Génération de Codes</h4>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={genererCodesSelection}
                  disabled={selectedLots.length === 0 || generatingCodes}
                  className={`${
                    selectedLots.length > 0 && !generatingCodes
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  } text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center gap-2`}
                >
                  <SparklesIcon className="h-4 w-4"/>
                  <span>
                    {generatingCodes ? 'Génération...' : `Générer Codes (${selectedLots.length})`}
                  </span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Génère le 1er code pour tous les lots sélectionnés
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Impression</h4>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={imprimerCodesSelection}
                  disabled={codesSecrets.length === 0 || printLoading}
                  className={`${
                    codesSecrets.length > 0 && !printLoading
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  } text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors flex items-center gap-2`}
                >
                  <PrintIcon className="h-4 w-4"/>
                  <span>
                    {printLoading ? 'Préparation...' : `Imprimer Codes (${codesSecrets.length})`}
                  </span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Imprime tous les codes générés (1 code par page)
              </p>
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
        </div>
      </div>
      
      {/* Back Button */}
      <div className="mt-8">
        <button onClick={onNavigateBack} className="flex items-center space-x-2 bg-[#0d2d53] hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-colors">
          <BackArrowIcon className="h-5 w-5" />
          <span>Retour au Tableau de Bord</span>
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

export default LotsACodifier;