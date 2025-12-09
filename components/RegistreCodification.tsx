import React from 'react';
import {
  BackArrowIcon, CalendarIcon, SearchIcon, RegisterIcon, PrintIcon, ExportIcon,
} from './Icons';

interface RegistreCodificationProps {
  onNavigateBack: () => void;
}

const tableHeaders = [
  "Code Secret", "Libellé", "Date Code", "Codificateur", "Numéro Lot", "Référence",
  "Produit", "Ville", "Exportateurs", "Date Reception", "Récolte", "Grade lot",
  "Date Sondage", "Sondeur", "Rapport"
];

const RegistreCodification: React.FC<RegistreCodificationProps> = ({ onNavigateBack }) => {
  return (
    <div className="p-6 lg:p-10 space-y-8 bg-gray-50">
      {/* Header */}
      <div className="bg-[#0d2d53] text-white rounded-t-xl p-6 flex items-center shadow-lg">
        <RegisterIcon className="h-10 w-10 mr-4" />
        <div>
          <h2 className="text-3xl font-bold">Registre de Codification</h2>
          <p className="text-blue-200">Historique et suivi des opérations de codification</p>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="bg-white p-6 rounded-b-xl shadow-lg border">
        {/* Filters */}
        <div className="mb-6 pb-6 border-b">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">CRITÈRES DE RECHERCHE</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
             <div className="space-y-1">
              <label className="font-medium text-gray-600">Référence</label>
              <input type="text" className="w-full form-input" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-600">N°Lot</label>
              <input type="text" className="w-full form-input" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Exportateur</label>
              <select className="w-full form-select"><option>Sélectionner</option></select>
            </div>
             <div className="space-y-1">
              <label className="font-medium text-gray-600">Produit</label>
              <select className="w-full form-select"><option>Sélectionner</option></select>
            </div>
            <div className="space-y-1 relative">
              <label className="font-medium text-gray-600">Date Début</label>
              <input type="date" defaultValue="2025-11-14" className="w-full form-input pr-8" />
              <CalendarIcon className="absolute right-2 top-7 h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-1 relative">
              <label className="font-medium text-gray-600">Date Fin</label>
              <input type="date" defaultValue="2025-11-14" className="w-full form-input pr-8" />
              <CalendarIcon className="absolute right-2 top-7 h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Campagne</label>
              <select className="w-full form-select"><option>2025/2026</option></select>
            </div>
            <div className="space-y-1">
              <label className="font-medium text-gray-600">Ville</label>
              <select className="w-full form-select"><option>ABIDJAN</option></select>
            </div>
          </div>
        </div>
        
        {/* Table */}
        <div>
          <div className="overflow-x-auto border rounded-lg shadow-md">
            <table className="min-w-full text-xs">
              <thead className="bg-[#0d2d53] text-white uppercase">
                <tr>
                  {tableHeaders.map(header => (
                     <th key={header} className="p-2 font-semibold tracking-wider text-left whitespace-nowrap">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                    <td colSpan={tableHeaders.length} className="text-center py-20">
                        <p className="text-gray-500 font-semibold">Aucune donnée à afficher</p>
                    </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Bottom Actions */}
        <div className="flex justify-between items-end mt-6 pt-6 border-t">
            <div className="flex items-end gap-4">
                <div className="space-y-1">
                    <label htmlFor="codeSecret" className="text-sm font-medium text-gray-600">Code secret</label>
                    <input type="text" id="codeSecret" className="form-input" />
                </div>
                <button className="bg-white hover:bg-gray-100 text-gray-700 font-bold py-2 px-6 rounded-lg border border-gray-300 shadow-sm transition-colors flex items-center gap-2"><PrintIcon className="h-5 w-5"/>Imprimer</button>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-sm font-semibold text-gray-700">
                    Nombre Total de lots: 0
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors flex items-center gap-2"><ExportIcon className="h-5 w-5"/>Exporter</button>
            </div>
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

export default RegistreCodification;