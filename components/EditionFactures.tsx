import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx'; // Import de la bibliothèque Excel
import {
  BackArrowIcon,
  DocumentIcon,
  SearchIcon,
  CalendarIcon,
  PrintIcon,
  EmptyBoxIcon,
  EditIconAlt,
  CheckIcon,
  DownloadIcon,
  UploadIcon
} from './Icons';

interface EditionFacturesProps {
  onNavigateBack: () => void;
}

interface Demande {
  ID_DEMANDE: number;
  REF_DEMANDE: string;
  AUT_DEMANDE: string;
  DATEEMI_DEMANDE: string;
  DATEREC_DEMANDE: string;
  DATE_EXPIR_DEMANDE: string;
  CAMP_DEMANDE: string;
  VILLE_DEMANDE: string;
  POIDS_DEMANDE: number;
  LIBELLE_PRODUIT: string;
  RAISONSOCIALE_EXPORTATEUR: string;
  MARQUE_EXPORTATEUR: string;
  VILLE_EXPORTATEUR: string;
  NBRELOT_DEMANDE: number;
  ETAT_DEMANDE: string;
  total_lots: number;
  lots_valides_bv: number;
  facture_existe: number;
  FACTURE_DEMANDE: number;
  pourcentage_valides: number;
}

interface Facture {
  ID_FACTURES: number;
  REF_FACUTRES: string;
  DATE_FACTURES: string;
  CAMPAGNE_FACTURES: string;
  MONTANT_FACTURES: number;
  VALIDER: string;
  REF_DEMANDE: string;
  AUT_DEMANDE: string;
  LIBELLE_PRODUIT: string;
  RAISONSOCIALE_EXPORTATEUR: string;
  MARQUE_EXPORTATEUR: string;
  VILLE_DEMANDE: string;
  DATEEMI_DEMANDE: string;
  DATEREC_DEMANDE: string;
  DATE_EXPIR_DEMANDE: string;
}

const EditionFactures: React.FC<EditionFacturesProps> = ({ onNavigateBack }) => {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [selectedDemandes, setSelectedDemandes] = useState<number[]>([]);
  const [selectedFactures, setSelectedFactures] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Filtres pour les demandes
  const [filtresDemandes, setFiltresDemandes] = useState({
    refDemande: '',
    autorisation: '',
    exportateur: '',
    campagne: '',
    dateDebut: '',
    dateFin: '',
    produit: '',
    ville: ''
  });

  // Filtres pour les factures
  const [filtresFactures, setFiltresFactures] = useState({
    refFacture: '',
    exportateur: '',
    campagne: '',
    etat: '',
    dateDebut: '',
    dateFin: '',
    ville: ''
  });

  const [exportateurs, setExportateurs] = useState<any[]>([]);
  const [produits, setProduits] = useState<any[]>([]);
  const [campagnes, setCampagnes] = useState<any[]>([]);
  const [villes, setVilles] = useState<any[]>([]);

  useEffect(() => {
    chargerDonneesInitiales();
  }, []);

  const chargerDonneesInitiales = async () => {
    try {
      // Charger les listes déroulantes
      const [expRes, prodRes, campRes] = await Promise.all([
        fetch('http://localhost:5000/api/exportateurs'),
        fetch('http://localhost:5000/api/produits'),
        fetch('http://localhost:5000/api/campagnes')
      ]);

      const exportateursData = await expRes.json();
      const produitsData = await prodRes.json();
      const campagnesData = await campRes.json();

      setExportateurs(exportateursData);
      setProduits(produitsData);
      setCampagnes(campagnesData);

      // Extraire les villes uniques des exportateurs
      const villesUniques = [...new Set(exportateursData.map((exp: any) => exp.ville))];
      setVilles(villesUniques.map(ville => ({ nom: ville })));
    } catch (error) {
      console.error('Erreur chargement données:', error);
    }
  };

  const rechercherDemandes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filtresDemandes).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });

      const response = await fetch(`http://localhost:5000/api/factures/demandes-validees?${params}`);
      const data = await response.json();
      setDemandes(data);
      setSelectedDemandes([]);
      console.log('Demandes récupérées:', data);
    } catch (error) {
      console.error('Erreur recherche demandes:', error);
      setMessage('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const rechercherFactures = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filtresFactures).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });

      const response = await fetch(`http://localhost:5000/api/factures?${params}`);
      const data = await response.json();
      setFactures(data.data || []);
      setSelectedFactures([]);
    } catch (error) {
      console.error('Erreur recherche factures:', error);
      setMessage('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const genererFacture = async (demandeId: number) => {
    try {
      // Générer le numéro de facture
      const numResponse = await fetch('http://localhost:5000/api/factures/generer-numero');
      const numData = await numResponse.json();

      if (!numData.success) {
        throw new Error('Erreur génération numéro facture');
      }

      // Récupérer les infos de la demande
      const demande = demandes.find(d => d.ID_DEMANDE === demandeId);
      if (!demande) {
        throw new Error('Demande non trouvée');
      }

      // Créer la facture
      const factureData = {
        ID_DEMANDES: demandeId,
        REF_FACUTRES: numData.numeroFacture,
        CAMPAGNE_FACTURES: demande.CAMP_DEMANDE,
        DATE_FACTURES: new Date().toISOString().split('T')[0],
        NBRE_LOTS_FACTURES: demande.NBRELOT_DEMANDE,
        VALIDER: 'Non Validée'
      };

      const response = await fetch('http://localhost:5000/api/factures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(factureData)
      });

      const result = await response.json();

      if (result.success) {
        setMessage(`Facture ${numData.numeroFacture} créée avec succès`);
        // Recharger les demandes et factures
        await Promise.all([rechercherDemandes(), rechercherFactures()]);
      } else {
        throw new Error(result.error || 'Erreur création facture');
      }
    } catch (error: any) {
      console.error('Erreur création facture:', error);
      setMessage(`Erreur: ${error.message}`);
    }
  };

  const validerFacture = async (factureId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/factures/${factureId}/valider`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valider: true })
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Facture validée avec succès');
        await rechercherFactures();
      } else {
        throw new Error(result.error || 'Erreur validation');
      }
    } catch (error: any) {
      console.error('Erreur validation facture:', error);
      setMessage(`Erreur: ${error.message}`);
    }
  };

  const exporterFacturesTXT = async () => {
    if (selectedFactures.length === 0) {
      setMessage('Veuillez sélectionner au moins une facture');
      return;
    }

    try {
      const facturesIds = selectedFactures.join(',');
      const response = await fetch(`http://localhost:5000/api/factures/export-txt?facturesIds=${facturesIds}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factures_export_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setMessage(`${selectedFactures.length} facture(s) exportée(s) avec succès`);
    } catch (error: any) {
      console.error('Erreur export factures:', error);
      setMessage(`Erreur: ${error.message}`);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, factureId: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage('');

    try {
      // Lire le fichier Excel
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // Obtenir le nom de la première feuille (normalement "rptFacturesListExportXls")
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convertir la feuille en tableau d'objets JSON
          const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          // Rechercher la colonne "Montant facture" (colonne K dans l'exemple donné)
          // Trouver l'index de la colonne Montant facture
          const headerRow = excelData[0] as string[];
          const montantColIndex = headerRow.findIndex(cell => 
            cell && cell.toString().toLowerCase().includes('montant facture')
          );
          
          if (montantColIndex === -1) {
            throw new Error('Colonne "Montant facture" non trouvée dans le fichier Excel');
          }
          
          // Prendre la première ligne de données (après l'en-tête)
          // Rechercher la ligne correspondant à la facture (par numéro de facture ou autre identifiant)
          let montant = 0;
          
          // Option 1: Prendre le montant de la première ligne de données
          if (excelData.length > 1) {
            const firstDataRow = excelData[1] as any[];
            if (firstDataRow && firstDataRow[montantColIndex]) {
              montant = parseFloat(firstDataRow[montantColIndex]);
            }
          }
          
          // Option 2: Rechercher par référence de facture si disponible
          // const refFactureColIndex = headerRow.findIndex(cell => 
          //   cell && cell.toString().toLowerCase().includes('facture')
          // );
          // if (refFactureColIndex !== -1) {
          //   for (let i = 1; i < excelData.length; i++) {
          //     const row = excelData[i] as any[];
          //     if (row && row[refFactureColIndex] === factureRef) {
          //       montant = parseFloat(row[montantColIndex]);
          //       break;
          //     }
          //   }
          // }
          
          if (montant <= 0) {
            throw new Error('Montant non trouvé ou invalide dans le fichier Excel');
          }
          
          console.log('Montant extrait du fichier Excel:', montant);
          
          // Envoyer le montant au serveur
          const response = await fetch(`http://localhost:5000/api/factures/${factureId}/mettre-a-jour-montant`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nouveauMontant: montant })
          });

          const result = await response.json();

          if (result.success) {
            setMessage(`Montant mis à jour avec succès: ${montant.toFixed(2)} FCFA`);
            await rechercherFactures();
          } else {
            throw new Error(result.error || 'Erreur lors de la mise à jour du montant');
          }
        } catch (error: any) {
          console.error('Erreur traitement fichier Excel:', error);
          setMessage(`Erreur: ${error.message}`);
        } finally {
          setLoading(false);
          // Réinitialiser l'input file
          event.target.value = '';
        }
      };
      
      reader.onerror = () => {
        console.error('Erreur lecture fichier');
        setMessage('Erreur lors de la lecture du fichier Excel');
        setLoading(false);
        event.target.value = '';
      };
      
      reader.readAsBinaryString(file);
      
    } catch (error: any) {
      console.error('Erreur upload fichier:', error);
      setMessage(`Erreur: ${error.message}`);
      setLoading(false);
      event.target.value = '';
    }
  };

  const handleSelectDemande = (id: number) => {
    setSelectedDemandes(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const handleSelectFacture = (id: number) => {
    setSelectedFactures(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const handleSelectAllDemandes = () => {
    if (selectedDemandes.length === demandes.length) {
      setSelectedDemandes([]);
    } else {
      setSelectedDemandes(demandes.map(d => d.ID_DEMANDE));
    }
  };

  const handleSelectAllFactures = () => {
    if (selectedFactures.length === factures.length) {
      setSelectedFactures([]);
    } else {
      setSelectedFactures(factures.map(f => f.ID_FACTURES));
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="bg-[#0d2d53] text-white rounded-t-xl p-6 flex items-center shadow-lg">
        <DocumentIcon className="h-10 w-10 mr-4" />
        <div>
          <h2 className="text-3xl font-bold">Édition des Factures</h2>
          <p className="text-blue-200">Création, modification et consultation des factures</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('succès') || message.includes('mis à jour') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {/* Section 1: Demandes Validées Prêtes pour Facturation */}
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
          Demandes Validées Prêtes pour Facturation
        </h3>

        <div className="mb-6 pb-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Réf. Demande</label>
              <input 
                type="text" 
                placeholder="Saisir référence" 
                className="w-full form-input"
                value={filtresDemandes.refDemande}
                onChange={(e) => setFiltresDemandes({...filtresDemandes, refDemande: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Autorisation</label>
              <input 
                type="text" 
                placeholder="Saisir autorisation" 
                className="w-full form-input"
                value={filtresDemandes.autorisation}
                onChange={(e) => setFiltresDemandes({...filtresDemandes, autorisation: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Exportateur</label>
              <select 
                className="w-full form-select"
                value={filtresDemandes.exportateur}
                onChange={(e) => setFiltresDemandes({...filtresDemandes, exportateur: e.target.value})}
              >
                <option value="">Tous</option>
                {exportateurs.map(exp => (
                  <option key={exp.id} value={exp.nom}>{exp.nom}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Produit</label>
              <select 
                className="w-full form-select"
                value={filtresDemandes.produit}
                onChange={(e) => setFiltresDemandes({...filtresDemandes, produit: e.target.value})}
              >
                <option value="">Tous</option>
                {produits.map(prod => (
                  <option key={prod.id} value={prod.id}>{prod.nom}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1 relative">
              <label className="font-medium text-gray-600">Date Début</label>
              <input 
                type="date" 
                className="w-full form-input pr-8"
                value={filtresDemandes.dateDebut}
                onChange={(e) => setFiltresDemandes({...filtresDemandes, dateDebut: e.target.value})}
              />
              <CalendarIcon className="absolute right-2 top-7 h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-1 relative">
              <label className="font-medium text-gray-600">Date Fin</label>
              <input 
                type="date" 
                className="w-full form-input pr-8"
                value={filtresDemandes.dateFin}
                onChange={(e) => setFiltresDemandes({...filtresDemandes, dateFin: e.target.value})}
              />
              <CalendarIcon className="absolute right-2 top-7 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <button 
              onClick={rechercherDemandes}
              disabled={loading}
              className="bg-[#0d2d53] hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Recherche...</span>
                </>
              ) : (
                <>
                  <SearchIcon className="h-5 w-5"/>
                  <span>Rechercher Demandes</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-lg shadow-md">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 uppercase text-xs text-gray-600">
              <tr>
                <th className="p-3 font-semibold tracking-wider text-left">
                  <input 
                    type="checkbox" 
                    checked={demandes.length > 0 && selectedDemandes.length === demandes.length}
                    onChange={handleSelectAllDemandes}
                  />
                </th>
                <th className="p-3 font-semibold tracking-wider text-left">Réf. Demande</th>
                <th className="p-3 font-semibold tracking-wider text-left">Autorisation</th>
                <th className="p-3 font-semibold tracking-wider text-left">Exportateur</th>
                <th className="p-3 font-semibold tracking-wider text-left">Produit</th>
                <th className="p-3 font-semibold tracking-wider text-left">Poids (kg)</th>
                <th className="p-3 font-semibold tracking-wider text-left">Campagne</th>
                <th className="p-3 font-semibold tracking-wider text-left">Lots Validés</th>
                <th className="p-3 font-semibold tracking-wider text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {demandes.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-20">
                    <EmptyBoxIcon className="h-16 w-16 mx-auto text-gray-300" />
                    <p className="text-gray-500 font-semibold mt-2">Aucune demande validée à afficher</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Les demandes n'apparaissent que lorsque tous leurs lots ont été validés dans validation_bv
                    </p>
                  </td>
                </tr>
              ) : (
                demandes.map(demande => (
                  <tr key={demande.ID_DEMANDE} className="hover:bg-gray-50">
                    <td className="p-3">
                      <input 
                        type="checkbox" 
                        checked={selectedDemandes.includes(demande.ID_DEMANDE)}
                        onChange={() => handleSelectDemande(demande.ID_DEMANDE)}
                      />
                    </td>
                    <td className="p-3 font-medium">{demande.REF_DEMANDE}</td>
                    <td className="p-3">{demande.AUT_DEMANDE}</td>
                    <td className="p-3">{demande.RAISONSOCIALE_EXPORTATEUR}</td>
                    <td className="p-3">{demande.LIBELLE_PRODUIT}</td>
                    <td className="p-3 text-right">{parseFloat(demande.POIDS_DEMANDE as any).toFixed(3)}</td>
                    <td className="p-3">{demande.CAMP_DEMANDE}</td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded text-xs ${demande.lots_valides_bv >= demande.total_lots ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {demande.lots_valides_bv}/{demande.total_lots}
                        </span>
                        {demande.total_lots > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${demande.pourcentage_valides}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => genererFacture(demande.ID_DEMANDE)}
                        disabled={demande.lots_valides_bv < demande.total_lots}
                        className={`text-xs px-3 py-1 rounded flex items-center gap-1 ${demande.lots_valides_bv >= demande.total_lots ? 'bg-[#0d2d53] hover:bg-blue-800 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                        title={demande.lots_valides_bv >= demande.total_lots ? "Générer la facture" : "Tous les lots doivent être validés"}
                      >
                        <DocumentIcon className="h-3 w-3" />
                        Générer Facture
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {demandes.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              {selectedDemandes.length} demande(s) sélectionnée(s) sur {demandes.length}
            </div>
            <button
              onClick={() => {
                // Filtrer seulement les demandes où tous les lots sont validés
                const demandesCompletes = selectedDemandes.filter(id => {
                  const demande = demandes.find(d => d.ID_DEMANDE === id);
                  return demande?.lots_valides_bv >= demande?.total_lots;
                });
                
                demandesCompletes.forEach(id => genererFacture(id));
              }}
              disabled={selectedDemandes.length === 0 || loading}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <DocumentIcon className="h-5 w-5" />
              Générer Factures Sélectionnées
            </button>
          </div>
        )}
      </div>

      {/* Section 2: Factures Existantes */}
      <div className="bg-white p-6 rounded-xl shadow-lg border">
        <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b">
          Liste des Factures
        </h3>

        <div className="mb-6 pb-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Réf. Facture</label>
              <input 
                type="text" 
                placeholder="Saisir référence" 
                className="w-full form-input"
                value={filtresFactures.refFacture}
                onChange={(e) => setFiltresFactures({...filtresFactures, refFacture: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Exportateur</label>
              <input 
                type="text" 
                placeholder="Nom exportateur" 
                className="w-full form-input"
                value={filtresFactures.exportateur}
                onChange={(e) => setFiltresFactures({...filtresFactures, exportateur: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-600">État</label>
              <select 
                className="w-full form-select"
                value={filtresFactures.etat}
                onChange={(e) => setFiltresFactures({...filtresFactures, etat: e.target.value})}
              >
                <option value="">Tous</option>
                <option value="Validée">Validée</option>
                <option value="Non Validée">Non Validée</option>
              </select>
            </div>
            <div className="space-y-1 relative">
              <label className="font-medium text-gray-600">Date Début</label>
              <input 
                type="date" 
                className="w-full form-input pr-8"
                value={filtresFactures.dateDebut}
                onChange={(e) => setFiltresFactures({...filtresFactures, dateDebut: e.target.value})}
              />
              <CalendarIcon className="absolute right-2 top-7 h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-1 relative">
              <label className="font-medium text-gray-600">Date Fin</label>
              <input 
                type="date" 
                className="w-full form-input pr-8"
                value={filtresFactures.dateFin}
                onChange={(e) => setFiltresFactures({...filtresFactures, dateFin: e.target.value})}
              />
              <CalendarIcon className="absolute right-2 top-7 h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Campagne</label>
              <select 
                className="w-full form-select"
                value={filtresFactures.campagne}
                onChange={(e) => setFiltresFactures({...filtresFactures, campagne: e.target.value})}
              >
                <option value="">Toutes</option>
                {campagnes.map(camp => (
                  <option key={camp.nom} value={camp.nom}>{camp.nom}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <button 
              onClick={rechercherFactures}
              disabled={loading}
              className="bg-[#0d2d53] hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Recherche...</span>
                </>
              ) : (
                <>
                  <SearchIcon className="h-5 w-5"/>
                  <span>Rechercher Factures</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border rounded-lg shadow-md">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 uppercase text-xs text-gray-600">
              <tr>
                <th className="p-3 font-semibold tracking-wider text-left">
                  <input 
                    type="checkbox" 
                    checked={factures.length > 0 && selectedFactures.length === factures.length}
                    onChange={handleSelectAllFactures}
                  />
                </th>
                <th className="p-3 font-semibold tracking-wider text-left">N° Facture</th>
                <th className="p-3 font-semibold tracking-wider text-left">Réf. Demande</th>
                <th className="p-3 font-semibold tracking-wider text-left">Exportateur</th>
                <th className="p-3 font-semibold tracking-wider text-left">Produit</th>
                <th className="p-3 font-semibold tracking-wider text-left">Campagne</th>
                <th className="p-3 font-semibold tracking-wider text-left">Date Facture</th>
                <th className="p-3 font-semibold tracking-wider text-left">Montant (FCFA)</th>
                <th className="p-3 font-semibold tracking-wider text-left">État</th>
                <th className="p-3 font-semibold tracking-wider text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {factures.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-20">
                    <EmptyBoxIcon className="h-16 w-16 mx-auto text-gray-300" />
                    <p className="text-gray-500 font-semibold mt-2">Aucune facture à afficher</p>
                  </td>
                </tr>
              ) : (
                factures.map(facture => (
                  <tr 
                    key={facture.ID_FACTURES} 
                    className={`hover:bg-gray-50 ${facture.VALIDER === 'Validée' ? 'bg-green-50' : ''}`}
                  >
                    <td className="p-3">
                      <input 
                        type="checkbox" 
                        checked={selectedFactures.includes(facture.ID_FACTURES)}
                        onChange={() => handleSelectFacture(facture.ID_FACTURES)}
                      />
                    </td>
                    <td className="p-3 font-medium">{facture.REF_FACUTRES}</td>
                    <td className="p-3">{facture.REF_DEMANDE}</td>
                    <td className="p-3">{facture.RAISONSOCIALE_EXPORTATEUR}</td>
                    <td className="p-3">{facture.LIBELLE_PRODUIT}</td>
                    <td className="p-3">{facture.CAMPAGNE_FACTURES}</td>
                    <td className="p-3">
                      {new Date(facture.DATE_FACTURES).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-3 text-right font-bold">
                      {parseFloat(facture.MONTANT_FACTURES as any).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${facture.VALIDER === 'Validée' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {facture.VALIDER}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {facture.VALIDER !== 'Validée' && (
                          <button
                            onClick={() => validerFacture(facture.ID_FACTURES)}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded flex items-center gap-1"
                            title="Valider la facture"
                          >
                            <CheckIcon className="h-3 w-3" />
                            Valider
                          </button>
                        )}
                        <label className={`text-xs px-3 py-1 rounded flex items-center gap-1 cursor-pointer ${facture.VALIDER === 'Validée' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                          <UploadIcon className="h-3 w-3" />
                          Charger Excel
                          <input
                            type="file"
                            accept=".xlsx,.xls"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, facture.ID_FACTURES)}
                            disabled={facture.VALIDER !== 'Validée'}
                            title={facture.VALIDER === 'Validée' ? "Charger un fichier Excel pour mettre à jour le montant" : "La facture doit être validée pour charger un fichier Excel"}
                          />
                        </label>
                        <button
                          onClick={() => {
                            setSelectedFactures([facture.ID_FACTURES]);
                            setTimeout(exporterFacturesTXT, 100);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded flex items-center gap-1"
                          title="Exporter en TXT"
                        >
                          <DownloadIcon className="h-3 w-3" />
                          TXT
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {factures.length > 0 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600">
              {selectedFactures.length} facture(s) sélectionnée(s) sur {factures.length}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={exporterFacturesTXT}
                disabled={selectedFactures.length === 0}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <DownloadIcon className="h-5 w-5" />
                Exporter Sélection en TXT
              </button>
              <button className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-6 rounded-lg border border-gray-300 shadow-sm flex items-center gap-2">
                <PrintIcon className="h-5 w-5"/>
                Imprimer la sélection
              </button>
            </div>
          </div>
        )}
      </div>

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

      <style>{`
        .form-input, .form-select {
            padding: 0.5rem 0.75rem; 
            border: 1px solid #d1d5db; 
            border-radius: 0.375rem;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input:focus, .form-select:focus {
            outline: none; 
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgb(59 130 246 / 0.25);
        }
        .form-select {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
            background-position: right 0.5rem center; 
            background-repeat: no-repeat; 
            background-size: 1.5em 1.5em;
        }
      `}</style>
    </div>
  );
};

export default EditionFactures;