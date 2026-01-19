import React, { useState, useEffect } from 'react';
import {
  BackArrowIcon,
  ListBulletIcon,
  SearchIcon,
  PlusIcon,
  EditIconAlt,
  TrashIcon,
  PrintIcon,
  LogoutIcon,
  EmptyBoxIcon,
  RefreshIcon,
  XCircleIcon,
} from './Icons';

interface GestionExportateursProps {
  onNavigateBack: () => void;
}

// Définir une interface pour typer les données d'un exportateur
// Cela correspond aux colonnes de votre table `exportateurs`
interface Exporter {
  id: number;
  code: string;
  nom: string;
  marque: string;
  ville: string;
  adresse: string;
  contact: string;
}

const tableHeaders = ["Code", "Nom", "Marque", "Ville", "Adresse", "Contact"];

const GestionExportateurs: React.FC<GestionExportateursProps> = ({ onNavigateBack }) => {
  // Etats pour gérer les données, le chargement et les erreurs
  const [exporters, setExporters] = useState<Exporter[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer les données depuis l'API
  const fetchExporters = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // NOTE POUR VOUS : L'URL '/api/exportateurs' est un exemple.
      // Vous devrez la remplacer par l'URL réelle de votre API PHP,
      // par exemple : 'http://localhost/votre-projet/api.php?route=exportateurs'
      const response = await fetch('/api/exportateurs');
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data: Exporter[] = await response.json();
      setExporters(data);

    } catch (err: any) {
      setError("Impossible de charger les données des exportateurs. Assurez-vous que le backend est en cours d'exécution et que l'URL de l'API est correcte. (" + err.message + ")");
      setExporters([]); // Vider les données en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  // Le hook useEffect se déclenche au montage du composant pour charger les données
  useEffect(() => {
    // Pour la démonstration, je simule un appel API avec des données fictives.
    // REMPLACEZ CECI PAR L'APPEL RÉEL QUAND VOTRE API SERA PRÊTE :
    // fetchExporters();

    // --- DÉBUT DU BLOC DE SIMULATION ---
    // (Supprimez ce bloc quand vous connecterez la vraie API)
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
        // Ces données sont tirées de votre script SQL pour un exemple réaliste
        const mockData: Exporter[] = [
            { id: 1, code: '150', nom: 'ADM COCOA SIFCA', marque: 'ADM COCOA SIFCA', ville: 'ABIDJAN', adresse: '01 BP 1289 ABIDJAN 01', contact: '21757575' },
            { id: 2, code: '114', nom: 'AFIMEX & CO', marque: 'AFIMEX', ville: 'ABIDJAN', adresse: '01 BP 1739 ABIDJAN 01', contact: '22405975' },
            { id: 3, code: '202', nom: 'AGRIMEX', marque: 'AGRIMEX', ville: 'ABIDJAN', adresse: '17 BP 1269 ABIDJAN 17', contact: '20210444' },
            { id: 4, code: '218', nom: 'AGROCOM', marque: 'AGROCOM', ville: 'ABIDJAN', adresse: '04 BP 2480 ABIDJAN 04', contact: '20309425' },
        ];
        setExporters(mockData);
        setIsLoading(false);
    }, 1500); // Simule un délai de chargement de 1.5 secondes
    // --- FIN DU BLOC DE SIMULATION ---

  }, []); // Le tableau vide signifie que cet effet ne s'exécute qu'une seule fois

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={tableHeaders.length} className="text-center py-16">
            <div className="flex flex-col items-center text-gray-500">
              <svg className="animate-spin h-8 w-8 text-[#0d2d53] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="font-semibold">Chargement des exportateurs...</p>
            </div>
          </td>
        </tr>
      );
    }

    if (error) {
       return (
        <tr>
          <td colSpan={tableHeaders.length} className="text-center py-16">
            <div className="flex flex-col items-center text-red-500 bg-red-50 p-6 rounded-lg">
                <XCircleIcon className="h-16 w-16 text-red-400 mb-4" />
                <p className="font-bold text-red-700">Erreur de communication avec le serveur</p>
                <p className="text-xs text-red-600 mt-2 max-w-md">{error}</p>
            </div>
          </td>
        </tr>
      );
    }

    if (exporters.length === 0) {
      return (
        <tr>
          <td colSpan={tableHeaders.length} className="text-center py-16">
            <div className="flex flex-col items-center text-gray-500">
                <EmptyBoxIcon className="h-16 w-16 text-gray-300 mb-4" />
                <p className="font-semibold">Aucun exportateur trouvé</p>
                <p className="text-xs">La base de données est peut-être vide ou les filtres ne correspondent à aucune donnée.</p>
            </div>
          </td>
        </tr>
      );
    }

    return exporters.map((exporter) => (
      <tr key={exporter.id} className="hover:bg-gray-50">
        <td className="p-3">{exporter.code}</td>
        <td className="p-3 font-medium">{exporter.nom}</td>
        <td className="p-3">{exporter.marque}</td>
        <td className="p-3">{exporter.ville}</td>
        <td className="p-3">{exporter.adresse}</td>
        <td className="p-3">{exporter.contact}</td>
      </tr>
    ));
  };


  return (
    <div className="p-6 lg:p-10">
      <div className="bg-white rounded-xl shadow-lg border">
        {/* Header */}
        <div className="bg-gray-50 rounded-t-xl p-4 flex items-center justify-between border-b">
            <div className="flex items-center">
                <ListBulletIcon className="h-6 w-6 mr-3 text-[#0d2d53]" />
                <h2 className="text-xl font-bold text-gray-800">Liste des exportateurs</h2>
            </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Filter Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
                <label htmlFor="search-exporter" className="text-sm font-medium text-gray-700 whitespace-nowrap">Nom commençant par :</label>
                <div className="relative w-full max-w-sm">
                    <input 
                        type="text" 
                        id="search-exporter" 
                        className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
            </div>
            <button onClick={fetchExporters} className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold px-4 py-2 rounded-md text-sm transition-colors border border-blue-200">
                <RefreshIcon className="h-4 w-4" />
                <span>Actualiser</span>
            </button>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto border rounded-lg shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {tableHeaders.map((header) => (
                    <th key={header} className="p-3 font-semibold tracking-wider text-left text-gray-600 uppercase">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {renderTableContent()}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <div className="flex flex-wrap gap-2">
             <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors shadow"><PlusIcon className="h-4 w-4" /><span>Ajouter</span></button>
             <button className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors shadow"><EditIconAlt className="h-4 w-4" /><span>Modifier</span></button>
             <button className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors shadow"><TrashIcon className="h-4 w-4" /><span>Supprimer</span></button>
             <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors shadow"><PrintIcon className="h-4 w-4" /><span>Imprimer</span></button>
          </div>
          <button
            onClick={onNavigateBack}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors shadow"
          >
            <LogoutIcon className="h-4 w-4" />
            <span>Quitter</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GestionExportateurs;
