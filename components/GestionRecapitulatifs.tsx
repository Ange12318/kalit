
import React from 'react';
import {
  BackArrowIcon,
  ReceiptIcon,
  SearchIcon,
  CalendarIcon,
  PrintIcon,
  EmptyBoxIcon
} from './Icons';

interface GestionRecapitulatifsProps {
  onNavigateBack: () => void;
}

const tableHeaders = [
  "Code Récap", "Date Début", "Date Fin", "Nbre Factures", "Montant Total", "Commentaire", "Actions"
];

const GestionRecapitulatifs: React.FC<GestionRecapitulatifsProps> = ({ onNavigateBack }) => {
  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="bg-[#0d2d53] text-white rounded-t-xl p-6 flex items-center shadow-lg">
        <ReceiptIcon className="h-10 w-10 mr-4" />
        <div>
          <h2 className="text-3xl font-bold">Gestion des Récapitulatifs</h2>
          <p className="text-blue-200">Groupement et suivi des factures par période</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-b-xl shadow-lg border space-y-6">
        <div className="mb-6 pb-6 border-b">
          <div className="flex justify-center gap-4">
            <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md">
              Créer un nouveau récapitulatif
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
                        <p className="text-gray-500 font-semibold mt-2">Aucun récapitulatif à afficher</p>
                    </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <button onClick={onNavigateBack} className="flex items-center space-x-2 bg-[#0d2d53] hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-colors">
          <BackArrowIcon className="h-5 w-5" />
          <span>Retour</span>
        </button>
      </div>
    </div>
  );
};

export default GestionRecapitulatifs;
