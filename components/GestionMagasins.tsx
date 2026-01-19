
import React from 'react';
import {
  BackArrowIcon,
  WarehouseIcon,
  SearchIcon,
  PlusIcon,
  EditIconAlt,
  TrashIcon,
  PrintIcon,
  LogoutIcon,
  EmptyBoxIcon
} from './Icons';

interface GestionMagasinsProps {
  onNavigateBack: () => void;
}

const tableHeaders = ["Code", "Nom", "Ville", "Sit. Géographique", "Gerant"];
const magasinsData: any[] = []; // Empty data as requested

const GestionMagasins: React.FC<GestionMagasinsProps> = ({ onNavigateBack }) => {
  return (
    <div className="p-6 lg:p-10">
      <div className="bg-white rounded-xl shadow-lg border">
        {/* Header */}
        <div className="bg-gray-50 rounded-t-xl p-4 flex items-center justify-between border-b">
            <div className="flex items-center">
                <WarehouseIcon className="h-6 w-6 mr-3 text-[#0d2d53]" />
                <h2 className="text-xl font-bold text-gray-800">Liste des magasins</h2>
            </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Filter Section */}
          <div className="flex items-center space-x-2">
            <label htmlFor="search-magasin" className="text-sm font-medium text-gray-700 whitespace-nowrap">Nom commençant par :</label>
            <div className="relative w-full max-w-sm">
                <input 
                    type="text" 
                    id="search-magasin" 
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
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
                {magasinsData.length === 0 ? (
                  <tr>
                    <td colSpan={tableHeaders.length} className="text-center py-16">
                      <div className="flex flex-col items-center text-gray-500">
                          <EmptyBoxIcon className="h-16 w-16 text-gray-300 mb-4" />
                          <p className="font-semibold">Aucun magasin à afficher</p>
                          <p className="text-xs">Utilisez le bouton "Ajouter" pour créer un nouveau magasin.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  // Map over data here if it existed
                  <></>
                )}
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

export default GestionMagasins;
