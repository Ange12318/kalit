import React, { useState, useEffect, useMemo } from 'react';
import { BackArrowIcon, SaveIcon } from './Icons';

const NouvelleDemande: React.FC<{ onNavigateBack: () => void }> = ({ onNavigateBack }) => {
  const [exportateurs, setExportateurs] = useState<any[]>([]);
  const [produits, setProduits] = useState<any[]>([]);
  const [campagnes, setCampagnes] = useState<string[]>([]);
  const [magasins, setMagasins] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);
  const currentYear = new Date().getFullYear();
  const currentCampaign = `${currentYear}/${currentYear + 1}`;

  // Champs principaux
  const [reference, setReference] = useState('');
  const [autorisation, setAutorisation] = useState('');
  const [dossier, setDossier] = useState('');
  const [nature, setNature] = useState('');
  const [exportateurId, setExportateurId] = useState('');
  const [produitId, setProduitId] = useState('');
  const [ville, setVille] = useState('');
  const [campagne, setCampagne] = useState('');
  const [dateAutorisation, setDateAutorisation] = useState(today);
  const [dateValidation, setDateValidation] = useState(today);

  const isCacao = produitId === 'KKO';
  const isCafe = produitId === 'CAFE' || produitId === 'KFE';

  // Grades filtrés selon le produit
  const gradesDisponibles = grades.filter(g => {
    if (isCacao) {
      return g.categorie === 11 || g.categorie === 12;
    } else if (isCafe) {
      return g.categorie === 21;
    }
    return false;
  });

  // Lots - 5 lignes par défaut
  const [lots, setLots] = useState<any[]>(
    Array(5).fill(null).map(() => ({
      numero: '',
      nbreSac: '',
      poidsNet: '',
      marque: '',
      magasin: '',
      recolte: currentCampaign,
      qualite: '',
      parite: 'Sélectionner',
    }))
  );

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const responses = await Promise.all([
          fetch('http://localhost:5000/api/exportateurs'),
          fetch('http://localhost:5000/api/produits'),
          fetch('http://localhost:5000/api/campagnes'),
          fetch('http://localhost:5000/api/magasins'),
          fetch('http://localhost:5000/api/grades'),
        ]);
        const data = await Promise.all(responses.map(r => r.json()));

        setExportateurs(Array.isArray(data[0]) ? data[0] : []);
        setProduits(Array.isArray(data[1]) ? data[1] : []);
        setCampagnes(data[2]?.map((c: any) => c.nom) || []);
        setMagasins(Array.isArray(data[3]) ? data[3] : []);
        setGrades(Array.isArray(data[4]) ? data[4] : []);
      } catch (err) {
        console.error('Erreur chargement', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Totaux généraux (seulement si N° LOT saisi)
  const { totalSacs, totalLots, totalPoidsNet } = useMemo(() => {
    return lots.reduce(
      (acc, lot) => {
        const nbreSac = Number(lot.nbreSac) || 0;
        const poidsNet = Number(lot.poidsNet) || 0;
       
        if (lot.numero?.trim()) {
          acc.totalLots += 1;
          acc.totalSacs += nbreSac;
          acc.totalPoidsNet += poidsNet;
        }
        return acc;
      },
      { totalSacs: 0, totalLots: 0, totalPoidsNet: 0 }
    );
  }, [lots]);

  // Changement de produit → remplissage auto
  const handleProduitChange = (id: string) => {
    setProduitId(id);
    const newIsCacao = id === 'KKO';
    const newIsCafe = id === 'CAFE' || id === 'KFE';
    
    const newLots = lots.map(lot => {
      if (lot.numero?.trim()) {
        if (newIsCacao) {
          return { ...lot, nbreSac: '385', poidsNet: '25025' };
        } else if (newIsCafe) {
          return { ...lot, nbreSac: '420', poidsNet: '25200' };
        }
      }
      return lot;
    });
    setLots(newLots);
  };

  // Gestion saisie lot
  const handleLotChange = (i: number, field: string, value: string) => {
    const newLots = [...lots];
    const lot = newLots[i];

    if (field === 'numero' && !lot.numero && value.trim()) {
      if (isCacao) {
        lot.nbreSac = '385';
        lot.poidsNet = '25025';
      } else if (isCafe) {
        lot.nbreSac = '420';
        lot.poidsNet = '25200';
      }
    }

    if (field === 'nbreSac' && isCafe) {
      const nbreSac = Number(value);
      lot.poidsNet = isNaN(nbreSac) ? '' : (nbreSac * 60).toFixed(3);
    }

    lot[field] = value;
    setLots(newLots);
  };

  const dupliquerLotPrecedent = (i: number) => {
    if (i === 0) return;
    const prev = lots[i - 1];
    if (!prev.numero?.trim()) return;

    const newLots = [...lots];
    newLots[i] = {
      ...newLots[i],
      nbreSac: prev.nbreSac,
      poidsNet: prev.poidsNet,
      marque: prev.marque,
      magasin: prev.magasin,
      recolte: prev.recolte,
      qualite: prev.qualite,
      parite: prev.parite,
    };
    setLots(newLots);
  };

  const ajouterLigne = () => {
    setLots([...lots, {
      numero: '',
      nbreSac: '',
      poidsNet: '',
      marque: '',
      magasin: '',
      recolte: currentCampaign,
      qualite: '',
      parite: 'Sélectionner',
    }]);
  };

  const enregistrer = async () => {
    if (!reference.trim() || !exportateurId || !produitId || !campagne) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      const payload = {
  refDemande: reference.trim(),
  autDemande: autorisation.trim(),
  typeDemande: 'TYPE-A',
  dateEmission: dateAutorisation,
  dateReception: dateAutorisation,
  campagne,
  produit: produitId,
  exportateur: Number(exportateurId),
  nbreLots: totalLots,
  poidsTotal: Number(totalPoidsNet.toFixed(3)),
  natureDemande: nature || 'Nouveau lots',
  naturePrestation: 'PREST01',
  dateExpiration: dateValidation,
  ville: ville, // ← Ajoutez cette ligne
  lots: lots.filter(l => l.numero?.trim()).map(l => ({
    numero: l.numero.trim(),
    nbreSacs: Number(l.nbreSac) || 0,
    poids: Number(l.poidsNet) || 0,
    recolte: l.recolte,
    qualite: l.qualite || null,
    marque: l.marque || null,
    magasin: l.magasin || null,
    parite: l.parite || null,
  })),
};

      const res = await fetch('http://localhost:5000/api/demandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert('Demande enregistrée avec succès !');
        onNavigateBack();
      } else {
        const errorData = await res.json();
        alert('Erreur serveur: ' + (errorData.error || 'Erreur inconnue'));
      }
    } catch (e) {
      alert('Erreur réseau: ' + e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center text-xl">
        Chargement du formulaire...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#0d2d53] text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold">Nouvelle Demande</h1>
        <p className="text-sm opacity-90">Créer une nouvelle demande d'analyse pour les autorités ivoiriennes</p>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Ligne 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700">Référence *</label>
              <input value={reference} onChange={e => setReference(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="ex: DEM-2511-001" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">N° Autorisation</label>
              <input value={autorisation} onChange={e => setAutorisation(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">N° Dossier</label>
              <input value={dossier} onChange={e => setDossier(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">Nature *</label>
              <select value={nature} onChange={e => setNature(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="">Sélectionner</option>
                <option>Nouveau lots</option>
                <option>Lots réusiné</option>
              </select>
            </div>
          </div>

          {/* Ligne 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700">Exportateur *</label>
              <select value={exportateurId} onChange={e => setExportateurId(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="">Sélectionner</option>
                {exportateurs.map(e => <option key={e.id} value={e.id}>{e.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">Produit *</label>
              <select value={produitId} onChange={e => handleProduitChange(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="">Sélectionner</option>
                {produits.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">Ville *</label>
              <select value={ville} onChange={e => setVille(e.target.value)} className="w-full border rounded px-3 py-2">
                <option>ABIDJAN</option>
                <option>SAN PEDRO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">Campagne *</label>
              <select value={campagne} onChange={e => setCampagne(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="">Sélectionner</option>
                {campagnes.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Dates modifiables */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700">Date Autorisation *</label>
              <input type="date" value={dateAutorisation} onChange={e => setDateAutorisation(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700">Date Validation</label>
              <input type="date" value={dateValidation} onChange={e => setDateValidation(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
          </div>

          {/* Totaux Généraux */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-3">Totaux Généraux</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de Sacs</label>
                <input value={totalSacs} disabled className="w-full border rounded px-3 py-2 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de Lots</label>
                <input value={totalLots} disabled className="w-full border rounded px-3 py-2 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Poids Net (kg)</label>
                <input value={totalPoidsNet.toFixed(3)} disabled className="w-full border rounded px-3 py-2 bg-white" />
              </div>
            </div>
          </div>

          {/* Détail des Lots */}
          <div className="mt-8">
            <h3 className="font-bold text-lg mb-3">Détail des Lots</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border">
                <thead className="bg-[#0d2d53] text-white">
                  <tr>
                    <th className="px-4 py-2 text-left">N° LOT</th>
                    <th className="px-4 py-2 text-left">NBRE DE SAC</th>
                    <th className="px-4 py-2 text-left">POIDS NET (KG)</th>
                    <th className="px-4 py-2 text-left">MARQUE</th>
                    <th className="px-4 py-2 text-left">MAGASIN/USINE</th>
                    <th className="px-4 py-2 text-left">RÉCOLTE</th>
                    <th className="px-4 py-2 text-left">QUALITÉ DÉCLARÉE</th>
                    <th className="px-4 py-2 text-left">PARITÉ</th>
                    <th className="px-4 py-2 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {lots.map((lot, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-2">
                        <input value={lot.numero} onChange={e => handleLotChange(i, 'numero', e.target.value)} className="w-full border rounded px-2 py-1" placeholder="LOT-001" />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={lot.nbreSac}
                          onChange={e => handleLotChange(i, 'nbreSac', e.target.value)}
                          readOnly={isCacao}
                          className={`w-full border rounded px-2 py-1 ${isCacao ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={lot.poidsNet}
                          readOnly
                          className="w-full border rounded px-2 py-1 bg-gray-100"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select value={lot.marque} onChange={e => handleLotChange(i, 'marque', e.target.value)} className="w-full border rounded px-2 py-1">
                          <option value="">Sélectionner</option>
                          {exportateurs.map(e => <option key={e.id} value={e.nom}>{e.nom}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <select value={lot.magasin} onChange={e => handleLotChange(i, 'magasin', e.target.value)} className="w-full border rounded px-2 py-1">
                          <option value="">Sélectionner</option>
                          {magasins.map(m => <option key={m.id} value={m.nom}>{m.nom}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <input
                          value={lot.recolte}
                          onChange={e => handleLotChange(i, 'recolte', e.target.value)}
                          readOnly={isCacao}
                          className={`w-full border rounded px-2 py-1 ${isCacao ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <select value={lot.qualite} onChange={e => handleLotChange(i, 'qualite', e.target.value)} className="w-full border rounded px-2 py-1">
                          <option value="">Sélectionner</option>
                          {gradesDisponibles.map(g => (
                            <option key={g.id} value={g.id}>{g.id}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2">
                        <select value={lot.parite} onChange={e => handleLotChange(i, 'parite', e.target.value)} className="w-full border rounded px-2 py-1">
                          <option value="">Sélectionner</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                        </select>
                      </td>
                      <td className="px-4 py-2 text-center">
                        {i > 0 && (
                          <button onClick={() => dupliquerLotPrecedent(i)} className="text-blue-600 hover:text-blue-800 text-xl" title="Dupliquer le lot précédent">
                            Duplicate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button onClick={ajouterLigne} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded">
                + Ajouter une Ligne
              </button>
              <button onClick={enregistrer} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-10 rounded flex items-center gap-2">
                <SaveIcon className="h-6 w-6" />
                {loading ? 'Enregistrement...' : 'Enregistrer la Demande'}
              </button>
            </div>
          </div>

          <div className="flex justify-between mt-10">
            <button onClick={onNavigateBack} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded flex items-center gap-2">
              <BackArrowIcon className="h-5 w-5" /> Retour
            </button>
            <button className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-8 rounded">Annuler</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NouvelleDemande;