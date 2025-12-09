import React, { useEffect, useState } from 'react';
import { BackArrowIcon, PrintIcon } from './Icons';

type Lot = {
  numero?: string;
  nbreSacs?: number;
  poids?: number;
  marque?: string | null;
  magasin?: string | null;
  recolte?: string | null;
  qualite?: string | null;
  parite?: string | null;
};

type DemandeFull = {
  ID_DEMANDE?: number;
  REF_DEMANDE?: string;
  AUT_DEMANDE?: string;
  DATEEMI_DEMANDE?: string;
  CAMP_DEMANDE?: string;
  LIBELLE_PRODUIT?: string;
  RAISONSOCIALE_EXPORTATEUR?: string;
  MARQUE_EXPORTATEUR?: string;
  NBRELOT_DEMANDE?: number;
  lots?: Lot[];
  // fallback fields from POST payload shape
  refDemande?: string;
  autDemande?: string;
  dateEmission?: string;
  campagne?: string;
  produit?: string;
  exportateur?: string | number;
  nbreLots?: number;
  lots_list?: Lot[];
};

const ImprimerOrdreSondage: React.FC<{ 
  onNavigateBack: () => void;
  demandeId: number;
}> = ({ onNavigateBack, demandeId }) => {
  const [demande, setDemande] = useState<DemandeFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [lotsState, setLotsState] = useState<Lot[]>([]);

  useEffect(() => {
    const fetchDemande = async () => {
      setLoading(true);
      try {
        // Récupérer la demande principale avec jointure exportateur
        const res = await fetch(`http://localhost:5000/api/demandes/${demandeId}`);
        if (res.ok) {
          const data = await res.json();
          console.log('Données demande récupérées:', data);
          setDemande(data);
        } else {
          // Fallback: recherche par référence
          const res2 = await fetch(`http://localhost:5000/api/demandes?ref=${demandeId}`);
          const d2 = await res2.json();
          setDemande(Array.isArray(d2) ? d2[0] || null : d2 || null);
        }

        // Récupérer les lots depuis l'endpoint dédié
        try {
          const rl = await fetch(`http://localhost:5000/api/demandes/${demandeId}/lots`);
          if (rl.ok) {
            const lotsData = await rl.json();
            console.log('Lots récupérés:', lotsData);
            // Normaliser les noms de champs
            const mapped = (lotsData || []).map((ll: any) => ({
              numero: ll.numero || ll.NUM_LOTS || ll.NUMERO || '',
              nbreSacs: ll.nbreSac ?? ll.NBRESAC_LOTS ?? null,
              poids: ll.poidsNet ?? ll.POIDS_LOTS ?? null,
              marque: ll.marque ?? ll.ID_MARQUE ?? null,
              magasin: ll.magasin ?? ll.ID_MAGASIN ?? null,
              recolte: ll.recolte ?? ll.RECOLTE_LOTS ?? null,
              qualite: ll.qualite ?? ll.GRADELOTS ?? null,
              parite: ll.parite ?? null,
            }));
            setLotsState(mapped);
          }
        } catch (e) {
          console.warn('Impossible de récupérer les lots dédiés', e);
        }
      } catch (e) {
        console.error('Erreur fetch demande', e);
        setDemande(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDemande();
  }, [demandeId]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (d?: string) => {
    if (!d) return '';
    try { 
      return new Date(d).toLocaleDateString('fr-FR'); 
    } catch { 
      return d; 
    }
  };

  const composeRefOS = (d: DemandeFull | null) => {
    if (!d) return '';
    const date = d.DATEEMI_DEMANDE || d.dateEmission || new Date().toISOString();
    const dt = new Date(date);
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const yyyy = dt.getFullYear();
    const numero = d.ID_DEMANDE || demandeId || 0;
    return `${numero}/${mm}/${yyyy}`;
  };

  // Utiliser les lots récupérés ou ceux de la demande
  const lots: Lot[] = lotsState.length > 0 ? lotsState : ((demande && (demande.lots || (demande.lots_list as any) || [])) || []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-[#0d2d53] text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold">Imprimer Ordre de Sondage</h1>
        <p className="text-sm opacity-90">Ordre de sondage pour la demande #{demandeId}</p>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4">Chargement des données...</p>
            </div>
          )}

          {!loading && !demande && (
            <div className="text-center py-8 text-red-600">
              Aucune donnée trouvée pour la demande #{demandeId}
            </div>
          )}

          {!loading && demande && (
            <div id="printable-content" className="print:bg-white print:p-8">
              {/* ---- PAGE 1 ---- */}
              <div className="page page-1 mb-8">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold mb-2">ORDRE DE SONDAGE</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p><strong>Campagne:</strong> {demande.CAMP_DEMANDE || demande.campagne || ''}</p>
                    <p><strong>Date d'émission:</strong> {formatDate(demande.DATEEMI_DEMANDE || demande.dateEmission)}</p>
                  </div>

                  <div className="border p-3">
                    <p><strong>Réf. Demande :</strong> {demande.REF_DEMANDE || demande.refDemande || ''}</p>
                    <p><strong>Réf. CCC :</strong> {demande.AUT_DEMANDE || demande.autDemande || ''}</p>
                    <p><strong>Réf. OS :</strong> {composeRefOS(demande)}</p>
                    <p><strong>Nature Produit :</strong> {demande.LIBELLE_PRODUIT || demande.produit || ''}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p><strong>Client :</strong> {demande.RAISONSOCIALE_EXPORTATEUR || demande.exportateur || ''}</p>
                  <p className="text-right"><strong>Nombre de lots</strong> {demande.NBRELOT_DEMANDE || demande.nbreLots || lots.length}</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-2 py-1">N°Lot</th>
                        <th className="border px-2 py-1">Nbre de Sac</th>
                        <th className="border px-2 py-1">Poids Net</th>
                        <th className="border px-2 py-1">Marque</th>
                        <th className="border px-2 py-1">Magasin/Usine</th>
                        <th className="border px-2 py-1">Récolte</th>
                        <th className="border px-2 py-1">Qualité</th>
                        <th className="border px-2 py-1">Parité</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lots.length === 0 && (
                        <tr>
                          <td colSpan={8} className="border px-2 py-4 text-center">Aucun lot disponible</td>
                        </tr>
                      )}
                      {lots.map((l, idx) => (
                        <tr key={idx}>
                          <td className="border px-2 py-1">{l.numero || ''}</td>
                          <td className="border px-2 py-1">{l.nbreSacs ?? l.nbreSacs === 0 ? l.nbreSacs : ''}</td>
                          <td className="border px-2 py-1">{l.poids ?? ''}</td>
                          <td className="border px-2 py-1">{l.marque || ''}</td>
                          <td className="border px-2 py-1">{l.magasin || ''}</td>
                          <td className="border px-2 py-1">{l.recolte || ''}</td>
                          <td className="border px-2 py-1">{l.qualite || ''}</td>
                          <td className="border px-2 py-1">{l.parite || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* page break */}
              <div className="page-break" />

              {/* ---- PAGE 2 ---- */}
              <div className="page page-2">
                <div className="text-sm mb-4 font-semibold">SERVICE QUALITE / BV</div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p><strong>Date opération de sondage :</strong> ...... / ...... / ......</p>
                    <p><strong>Début sondage :</strong> H: ...... mn</p>
                    <p><strong>Fin sondage :</strong> H: ...... mn</p>
                    <p><strong>Nombre de lots sondés :</strong> ______</p>
                    <p><strong>Nombre de lots non sondés :</strong> ______</p>
                    <p><strong>Marque & N° de lots non sondés :</strong> ______</p>
                  </div>

                  <div className="border p-3">
                    <div className="mb-2">Magasins</div>
                    <div className="h-16 border mt-2"></div>
                    <div className="mt-4">Noms & signature des magasiniers</div>
                    <div className="h-20 border mt-2"></div>
                  </div>
                </div>

                <div className="mb-6 border p-4">
                  <p><strong>Etat des sacs :</strong> neufs, sains, déchirés, contremarqués, retournés, export</p>
                  <p><strong>Accès des lots :</strong> Phyto, facile, difficile</p>
                  <p><strong>Remarques :</strong> _________________________________________</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-bold">SONDEURS (Noms & Signatures)</div>
                    <div className="mt-6">1/ ________</div>
                    <div className="mt-2">2/ ________</div>
                    <div className="mt-2">3/ ________</div>
                    <div className="mt-2">4/ ________</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">RESPONSABLE SONDAGE</div>
                    <div className="mt-20">Signature: ___________________</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between no-print">
            <button
              onClick={onNavigateBack}
              className="bg-[#0d2d53] hover:bg-blue-900 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 shadow-lg"
            >
              <BackArrowIcon className="h-5 w-5" />
              Retour
            </button>

            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 shadow-lg"
              >
                <PrintIcon className="h-5 w-5" />
                Imprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Styles pour l'impression */}
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            #printable-content, #printable-content * { visibility: visible; }
            #printable-content { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
            .page { page-break-after: auto; }
            .page-break { display: block; page-break-before: always; }
          }

          /* Basic styles to make printed table look like the example */
          .page-1 { padding-bottom: 10px; }
          table th, table td { font-size: 12px; }
        `}
      </style>
    </div>
  );
};

export default ImprimerOrdreSondage;