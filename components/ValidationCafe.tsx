
import React from 'react';
import {
  BackArrowIcon,
  CalendarIcon,
  SearchIcon,
  PrintIcon,
  ExportIcon,
  CheckCircleIcon
} from './Icons';

interface ValidationCafeProps {
  onNavigateBack: () => void;
}

const tableHeaders = [
  'REF DEMANDE', 'AUTORISATION', 'EXPORTATEUR', 'N°LOT', 'ANALYSEUR', 'CAMPAGNE', 
  "DATE D'ANALYSE", 'NOMBRE DEFAUTS', 'POIDS DEFAUTS', 'HUMIDITÉ', 'TAMIS 18', 'TAMIS 16', 
  'TAMIS 14', 'TAMIS 12', 'TAMIS 10', 'TAMIS BAS', 'NORMES IVOIRIENNE', 
  'NORME INTERNATIONALE', 'CONFORMITÉ', 'REMARQUE'
];

const ValidationCafe: React.FC<ValidationCafeProps> = ({ onNavigateBack }) => {
  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="bg-[#0d2d53] text-white rounded-t-xl p-6 flex items-center shadow-lg">
        <CheckCircleIcon className="h-10 w-10 mr-4" />
        <div>
          <h2 className="text-3xl font-bold">Validation Résultats Café</h2>
          <p className="text-blue-200">Validation des analyses de qualité du café</p>
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
              <input type="text" placeholder="Saisir la référence" className="w-full form-input" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Autorisation</label>
              <input type="text" placeholder="N° d'autorisation" className="w-full form-input" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">N° Dossier</label>
              <input type="text" placeholder="N° de dossier" className="w-full form-input" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Exportateur</label>
              <select className="w-full form-select"><option>Tous les exportateurs</option></select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">N° Lot</label>
              <input type="text" placeholder="N° du lot" className="w-full form-input" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Type</label>
              <input type="text" placeholder="Type d'analyse" className="w-full form-input" />
            </div>
            <div className="space-y-1 relative">
              <label className="text-xs font-semibold text-gray-500 flex items-center">Date Début</label>
              <input type="date" defaultValue="2025-11-13" className="w-full form-input pr-8" />
              <CalendarIcon className="absolute right-2 top-7 h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-1 relative">
              <label className="text-xs font-semibold text-gray-500 flex items-center">Date Fin</label>
              <input type="date" defaultValue="2025-11-13" className="w-full form-input pr-8" />
              <CalendarIcon className="absolute right-2 top-7 h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Campagne</label>
              <select className="w-full form-select"><option>Toutes les campagnes</option></select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Ville</label>
              <select className="w-full form-select"><option>Toutes les villes</option></select>
            </div>
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <button className="bg-[#0d2d53] hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center gap-2">
              <SearchIcon className="h-5 w-5"/>
              <span>Rechercher</span>
            </button>
            <button className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-6 rounded-lg border border-gray-300 shadow-sm transition-colors">
              Réinitialiser
            </button>
          </div>
        </div>
        
        {/* Table */}
        <div>
          <p className="text-center text-sm text-gray-500 mb-2 italic">Faites défiler horizontalement pour voir toutes les colonnes</p>
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-[#0d2d53] text-white uppercase text-xs">
                <tr>
                  <th className="p-3 sticky left-0 bg-[#0d2d53] z-10 w-16"><input type="checkbox" className="rounded" /></th>
                  {tableHeaders.map(header => (
                     <th key={header} className="p-3 font-semibold tracking-wider text-left whitespace-nowrap">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                    <td colSpan={tableHeaders.length + 1} className="text-center py-20">
                        <p className="text-gray-500">Aucune analyse trouvée</p>
                    </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Pagination and Table Actions */}
          <div className="flex justify-between items-center mt-4">
             <span className="text-sm text-gray-600">Page 1 sur 0</span>
            <div className="flex items-center gap-2">
                <button disabled className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-200 rounded-md cursor-not-allowed">Précédent</button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-[#0d2d53] rounded-md hover:bg-blue-800">Suivant</button>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
            <button className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-6 rounded-lg border border-gray-300 shadow-sm transition-colors">Retour</button>
            <button className="bg-[#0d2d53] hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors">Valider la Sélection</button>
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center gap-2"><ExportIcon className="h-5 w-5"/><span>Exporter les Résultats</span></button>
            <button className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-6 rounded-lg border border-gray-300 shadow-sm transition-colors flex items-center gap-2"><PrintIcon className="h-5 w-5"/><span>Imprimer</span></button>
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
      `}</style>
    </div>
  );
};

export default ValidationCafe;
