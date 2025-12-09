
import React from 'react';
import {
  BackArrowIcon,
  DocumentIcon,
  SearchIcon,
  CalendarIcon,
  PrintIcon,
  EmptyBoxIcon,
  EditIcon
} from './Icons';

interface EditionFacturesProps {
  onNavigateBack: () => void;
}

const tableHeaders = [
  "Réf. Facture", "Date Facture", "Exportateur", "Campagne", "Montant HT", "Statut", "Actions"
];

const EditionFactures: React.FC<EditionFacturesProps> = ({ onNavigateBack }) => {
  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="bg-[#0d2d53] text-white rounded-t-xl p-6 flex items-center shadow-lg">
        <DocumentIcon className="h-10 w-10 mr-4" />
        <div>
          <h2 className="text-3xl font-bold">Édition des Factures</h2>
          <p className="text-blue-200">Création, modification et consultation des factures</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-b-xl shadow-lg border space-y-6">
         <div className="mb-6 pb-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Réf. Facture</label>
              <input type="text" placeholder="Saisir référence" className="w-full form-input" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Exportateur</label>
              <select className="w-full form-select"><option>Tous</option></select>
            </div>
            <div className="space-y-1 relative">
              <label className="font-medium text-gray-600">Date Début</label>
              <input type="date" className="w-full form-input pr-8" />
              <CalendarIcon className="absolute right-2 top-7 h-5 w-5 text-gray-400" />
            </div>
             <div className="space-y-1 relative">
              <label className="font-medium text-gray-600">Date Fin</label>
              <input type="date" className="w-full form-input pr-8" />
              <CalendarIcon className="absolute right-2 top-7 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <button className="bg-[#0d2d53] hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg shadow-md flex items-center gap-2">
              <SearchIcon className="h-5 w-5"/>
              <span>Rechercher</span>
            </button>
          </div>
        </div>
        
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
                <tr>
                    <td colSpan={tableHeaders.length} className="text-center py-20">
                        <EmptyBoxIcon className="h-16 w-16 mx-auto text-gray-300" />
                        <p className="text-gray-500 font-semibold mt-2">Aucune facture à afficher</p>
                    </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
            <button className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-6 rounded-lg border border-gray-300 shadow-sm flex items-center gap-2"><PrintIcon className="h-5 w-5"/>Imprimer la sélection</button>
        </div>
      </div>
      
      <div className="mt-8">
        <button onClick={onNavigateBack} className="flex items-center space-x-2 bg-[#0d2d53] hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-colors">
          <BackArrowIcon className="h-5 w-5" />
          <span>Retour</span>
        </button>
      </div>
      <style>{`
        .form-input, .form-select {
            padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem;
        }
        .form-input:focus, .form-select:focus {
            outline: none; border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgb(59 130 246 / 0.25);
        }
        .form-select {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
            background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em;
        }
      `}</style>
    </div>
  );
};

export default EditionFactures;
