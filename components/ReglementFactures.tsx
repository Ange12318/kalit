
import React from 'react';
import {
  BackArrowIcon,
  CreditCardIcon,
  EmptyBoxIcon,
  ValidationIcon
} from './Icons';

interface ReglementFacturesProps {
  onNavigateBack: () => void;
}

const tableHeaders = [
  "Réf. Facture", "Date Facture", "Exportateur", "Montant", "Statut Règlement", "Date Règlement"
];

const ReglementFactures: React.FC<ReglementFacturesProps> = ({ onNavigateBack }) => {
  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="bg-[#0d2d53] text-white rounded-t-xl p-6 flex items-center shadow-lg">
        <CreditCardIcon className="h-10 w-10 mr-4" />
        <div>
          <h2 className="text-3xl font-bold">Règlement des Factures</h2>
          <p className="text-blue-200">Suivi des paiements des factures</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-b-xl shadow-lg border space-y-6">
        <div>
          <div className="overflow-x-auto border rounded-lg shadow-md">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 uppercase text-xs text-gray-600">
                <tr>
                  <th className="p-3 w-12"><input type="checkbox" /></th>
                  {tableHeaders.map(header => (
                     <th key={header} className="p-3 font-semibold tracking-wider text-left">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td colSpan={tableHeaders.length + 1} className="text-center py-20">
                        <EmptyBoxIcon className="h-16 w-16 mx-auto text-gray-300" />
                        <p className="text-gray-500 font-semibold mt-2">Aucune facture en attente de règlement</p>
                    </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md flex items-center gap-2">
            <ValidationIcon className="h-5 w-5"/>
            Marquer comme réglé
          </button>
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

export default ReglementFactures;
