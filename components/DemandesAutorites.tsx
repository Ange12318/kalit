import React, { useState, useEffect } from 'react';
import {
  BackArrowIcon,
  SearchIcon,
  CalendarIcon,
  PlusIcon,
  RefreshIcon,
  EditIcon,
  TrashIcon,
  PrintIcon,
  DocumentIcon
} from './Icons';

interface Exportateur {
  id: number;
  nom: string;
}

interface Produit {
  id: string;
  nom: string;
}

interface PosteControle {
  code: string;
  ville: string;
  libelle: string;
  responsable: string;
  etat: number;
}

interface Demande {
  ID_DEMANDE: number;
  REF_DEMANDE: string;
  AUT_DEMANDE: string;
  DATEEMI_DEMANDE: string;
  DATEREC_DEMANDE: string | null;
  DATE_EXPIR_DEMANDE: string | null;
  CAMP_DEMANDE: string;
  LIBELLE_PRODUIT: string;
  EXPORTATEUR: string;
  VILLE_DEMANDE: string; // Changé : plus d'optionnel, c'est obligatoire
  NBRELOT_DEMANDE: number;
  POIDS_DEMANDE: number;
  NBRE_BV_DEMANDE: number;
  NBRE_BA_DEMANDE: number;
  ETAT_DEMANDE: string;
}

const DemandesAutorites: React.FC<{ 
  onNavigateBack: () => void; 
  onNavigateToNouvelleDemande: () => void;
  onNavigateToModifierDemande: (demandeId: number) => void;
  onNavigateToImprimerOrdre: (demandeId: number) => void;
}> = ({
  onNavigateBack,
  onNavigateToNouvelleDemande,
  onNavigateToModifierDemande,
  onNavigateToImprimerOrdre
}) => {
  const [exportateurs, setExportateurs] = useState<Exportateur[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [campagnes, setCampagnes] = useState<string[]>([]);
  const [postesControle, setPostesControle] = useState<PosteControle[]>([]);
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [ville, setVille] = useState('');

  // Filtres avec dates dynamiques
  const today = new Date().toISOString().slice(0, 10);
  const [ref, setRef] = useState('');
  const [aut, setAut] = useState('');
  const [exportateur, setExportateur] = useState('');
  const [produit, setProduit] = useState('');
  const [campagne, setCampagne] = useState('');
  const [dateDebut, setDateDebut] = useState(today);
  const [dateFin, setDateFin] = useState(today);

  useEffect(() => {
    const fetchSelects = async () => {
      try {
        const [exp, prod, camp, postes] = await Promise.all([
          fetch('http://localhost:5000/api/exportateurs').then(r => r.json()),
          fetch('http://localhost:5000/api/produits').then(r => r.json()),
          fetch('http://localhost:5000/api/campagnes').then(r => r.json()),
          fetch('http://localhost:5000/api/postes-controle').then(r => r.json())
        ]);
        setExportateurs(exp);
        setProduits(prod);
        setCampagnes(camp.map((c: any) => c.nom));
        setPostesControle(postes);
      } catch (err) {
        alert('Impossible de charger les listes déroulantes. Vérifie que le backend tourne.');
      }
    };
    fetchSelects();
  }, []);

  const rechercher = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Ajouter seulement les filtres non vides
      if (ref.trim()) params.append('ref', ref.trim());
      if (aut.trim()) params.append('aut', aut.trim());
      if (exportateur) params.append('exportateur', exportateur);
      if (produit) params.append('produit', produit);
      if (campagne) params.append('campagne', campagne);
      if (ville) params.append('ville', ville);
      if (dateDebut) params.append('dateDebut', dateDebut);
      if (dateFin) params.append('dateFin', dateFin);

      const res = await fetch(`http://localhost:5000/api/demandes?${params}`);
      const data = await res.json();
      setDemandes(data);
      setSelectedIds([]); // Réinitialiser la sélection après recherche
    } catch (err) {
      alert('Erreur de recherche');
    }
    setLoading(false);
  };

  const supprimerDemandes = async () => {
    if (selectedIds.length === 0) {
      alert('Veuillez sélectionner au moins une demande à supprimer');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${selectedIds.length} demande(s) ?`)) {
      return;
    }

    setLoading(true);
    try {
      const promises = selectedIds.map(id => 
        fetch(`http://localhost:5000/api/demandes/${id}`, { method: 'DELETE' })
      );
      
      const results = await Promise.all(promises);
      const allSuccess = results.every(res => res.ok);
      
      if (allSuccess) {
        alert(`${selectedIds.length} demande(s) supprimée(s) avec succès`);
        setSelectedIds([]);
        rechercher(); // Recharger la liste
      } else {
        alert('Erreur lors de la suppression de certaines demandes');
      }
    } catch (err) {
      alert('Erreur de suppression');
    }
    setLoading(false);
  };

  const modifierDemande = () => {
    if (selectedIds.length !== 1) {
      alert('Veuillez sélectionner une seule demande à modifier');
      return;
    }
    onNavigateToModifierDemande(selectedIds[0]);
  };

  const imprimerOrdreSondage = () => {
    if (selectedIds.length !== 1) {
      alert('Veuillez sélectionner une seule demande pour imprimer l\'ordre de sondage');
      return;
    }
    onNavigateToImprimerOrdre(selectedIds[0]);
  };

  const reinitialiserFiltres = () => {
    setRef('');
    setAut('');
    setExportateur('');
    setProduit('');
    setCampagne('');
    setVille('');
    setDateDebut(today);
    setDateFin(today);
    setDemandes([]);
    setSelectedIds([]);
  };

  const totalLots = demandes.reduce((s, d) => s + (d.NBRELOT_DEMANDE || 0), 0);
  const totalPoids = demandes.reduce((s, d) => s + (d.POIDS_DEMANDE || 0), 0).toFixed(3);

  const toggleSelectAll = () => {
    if (selectedIds.length === demandes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(demandes.map(d => d.ID_DEMANDE));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header bleu foncé */}
      <div className="bg-[#0d2d53] text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold flex items-center">
          <DocumentIcon className="h-8 w-8 mr-3" />
          Demandes Autorités Ivoirienne
        </h1>
        <p className="text-sm opacity-90">Gestion des demandes d'analyse et de sondage des autorités ivoiriennes</p>
      </div>

      <div className="p-6">
        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-4">
            <input 
              placeholder="Référence" 
              value={ref} 
              onChange={e => setRef(e.target.value)} 
              className="border rounded px-3 py-2 text-sm" 
            />
            <input 
              placeholder="N° Autorisation" 
              value={aut} 
              onChange={e => setAut(e.target.value)} 
              className="border rounded px-3 py-2 text-sm" 
            />
            
            <select value={exportateur} onChange={e => setExportateur(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="">Tous les exportateurs</option>
              {exportateurs.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
            </select>

            <select value={produit} onChange={e => setProduit(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="">Tous les produits</option>
              {produits.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>

            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={dateDebut} 
                onChange={e => setDateDebut(e.target.value)} 
                className="border rounded px-3 py-2 text-sm w-full" 
              />
              <CalendarIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={dateFin} 
                onChange={e => setDateFin(e.target.value)} 
                className="border rounded px-3 py-2 text-sm w-full" 
              />
              <CalendarIcon className="h-5 w-5 text-gray-500 flex-shrink-0" />
            </div>

            <select value={campagne} onChange={e => setCampagne(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="">Toutes les campagnes</option>
              {campagnes.map(c => <option key={c}>{c}</option>)}
            </select>

            <select value={ville} onChange={e => setVille(e.target.value)} className="border rounded px-3 py-2 text-sm">
              <option value="">Toutes les villes</option>
              {postesControle.map(p => (
                <option key={p.code} value={p.ville}>{p.ville}</option>
              ))}
            </select>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-3">
            <button onClick={rechercher} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2">
              <SearchIcon className="h-5 w-5" /> Rechercher
            </button>
            <button onClick={reinitialiserFiltres} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2">
              <RefreshIcon className="h-5 w-5" /> Réinitialiser
            </button>
            <button onClick={onNavigateToNouvelleDemande} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2">
              <PlusIcon className="h-5 w-5" /> Nouvelle Demande
            </button>
            <button 
              onClick={modifierDemande} 
              disabled={selectedIds.length !== 1}
              className={`${selectedIds.length === 1 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'} text-white font-bold py-2 px-4 rounded flex items-center gap-2`}
            >
              <EditIcon className="h-5 w-5" /> Modifier
            </button>
            <button 
              onClick={supprimerDemandes} 
              disabled={selectedIds.length === 0}
              className={`${selectedIds.length > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'} text-white font-bold py-2 px-4 rounded flex items-center gap-2`}
            >
              <TrashIcon className="h-5 w-5" /> Supprimer
            </button>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#0d2d53] text-white text-xs uppercase">
                <tr>
                  <th className="p-3 text-left">
                    <input 
                      type="checkbox" 
                      onChange={toggleSelectAll} 
                      checked={selectedIds.length === demandes.length && demandes.length > 0} 
                    />
                  </th>
                  <th className="p-3 text-left">RÉFÉRENCE</th>
                  <th className="p-3 text-left">PRODUIT</th>
                  <th className="p-3 text-left">VILLE</th>
                  <th className="p-3 text-left">EXPORTATEUR</th>
                  <th className="p-3 text-left">DATE RÉCEPTION</th>
                  <th className="p-3 text-left">DATE EXPIRATION</th>
                  <th className="p-3 text-left">CAMPAGNE</th>
                  <th className="p-3 text-left">NBRE LOTS</th>
                  <th className="p-3 text-left">POIDS NET</th>
                  <th className="p-3 text-left">NBRE BV</th>
                  <th className="p-3 text-left">NBRE BA</th>
                  <th className="p-3 text-left">ÉTAT</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading && (
                  <tr>
                    <td colSpan={13} className="text-center py-10">Chargement en cours...</td>
                  </tr>
                )}
                {!loading && demandes.length === 0 && (
                  <tr>
                    <td colSpan={13} className="text-center py-20 text-gray-500">
                      <div className="flex flex-col items-center">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
                        <p>Aucune donnée à afficher</p>
                        <p className="text-xs">Aucune demande ne correspond aux critères de recherche.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {demandes.map(d => (
                  <tr key={d.ID_DEMANDE} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(d.ID_DEMANDE)} 
                        onChange={() => toggleSelect(d.ID_DEMANDE)} 
                      />
                    </td>
                    <td className="p-3 font-medium text-blue-600">{d.REF_DEMANDE || '-'}</td>
                    <td className="p-3">{d.LIBELLE_PRODUIT || '-'}</td>
                    <td className="p-3">{d.VILLE_DEMANDE || '-'}</td>
                    <td className="p-3">{d.EXPORTATEUR || '-'}</td>
                    <td className="p-3">{d.DATEREC_DEMANDE ? new Date(d.DATEREC_DEMANDE).toLocaleDateString() : '-'}</td>
                    <td className="p-3">{d.DATE_EXPIR_DEMANDE ? new Date(d.DATE_EXPIR_DEMANDE).toLocaleDateString() : '-'}</td>
                    <td className="p-3">{d.CAMP_DEMANDE}</td>
                    <td className="p-3 text-center">{d.NBRELOT_DEMANDE || 0}</td>
                    <td className="p-3 text-right">{d.POIDS_DEMANDE ? Number(d.POIDS_DEMANDE).toFixed(3) : '0.000'}</td>
                    <td className="p-3 text-center">{d.NBRE_BV_DEMANDE || 0}</td>
                    <td className="p-3 text-center">{d.NBRE_BA_DEMANDE || 0}</td>
                    <td className="p-3"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">{d.ETAT_DEMANDE || 'En attente'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pied de tableau */}
          <div className="bg-gray-50 px-6 py-3 flex justify-between items-center text-sm font-medium">
            <div>
              <span className="bg-blue-600 text-white px-3 py-1 rounded">Total Lots: {totalLots}</span>
              <span className="bg-blue-600 text-white px-3 py-1 rounded ml-4">Poids Total: {totalPoids} kg</span>
              <span className="bg-gray-600 text-white px-3 py-1 rounded ml-4">Sélectionnés: {selectedIds.length}</span>
            </div>
            <div className="text-gray-600">
              {demandes.length} demande(s) trouvée(s)
            </div>
          </div>
        </div>

        {/* Boutons Retour et Impression */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={onNavigateBack}
            className="bg-[#0d2d53] hover:bg-blue-900 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 shadow-lg"
          >
            <BackArrowIcon className="h-5 w-5" />
            Retour
          </button>
          
          <button
            onClick={imprimerOrdreSondage}
            disabled={selectedIds.length !== 1}
            className={`${selectedIds.length === 1 ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'} text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 shadow-lg`}
          >
            <PrintIcon className="h-5 w-5" />
            Imprimer Ordre de Sondage
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemandesAutorites;