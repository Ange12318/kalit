
import React, { useState } from 'react';
import {
  BackArrowIcon,
  MicroscopeIcon,
  KeyIcon,
  SearchIcon,
  CacaoIcon,
  CafeIcon,
  SaveIcon
} from './Icons';

interface AnalysesLaboratoireProps {
  onNavigateBack: () => void;
}

const AnalysesLaboratoire: React.FC<AnalysesLaboratoireProps> = ({ onNavigateBack }) => {
  const [activeTab, setActiveTab] = useState('cacao');

  const CacaoForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><label className="block text-sm font-medium text-gray-700">Taux Humidité (%)</label><input type="number" className="form-input w-full mt-1" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Grainage</label><input type="number" className="form-input w-full mt-1" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Taux Brisure (%)</label><input type="number" className="form-input w-full mt-1" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Taux Déchets (%)</label><input type="number" className="form-input w-full mt-1" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Taux Crabot (%)</label><input type="number" className="form-input w-full mt-1" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Taux Mat. Étrangère (%)</label><input type="number" className="form-input w-full mt-1" /></div>
      </div>
      <fieldset className="border p-4 rounded-md">
        <legend className="text-md font-semibold px-2">Défauts (%)</legend>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div><label className="block text-sm text-gray-600">Moisie</label><input type="number" className="form-input w-full mt-1" /></div>
          <div><label className="block text-sm text-gray-600">Mitée</label><input type="number" className="form-input w-full mt-1" /></div>
          <div><label className="block text-sm text-gray-600">Ardoisée</label><input type="number" className="form-input w-full mt-1" /></div>
          <div><label className="block text-sm text-gray-600">Plate</label><input type="number" className="form-input w-full mt-1" /></div>
          <div><label className="block text-sm text-gray-600">Germée</label><input type="number" className="form-input w-full mt-1" /></div>
          <div><label className="block text-sm text-gray-600">Violette</label><input type="number" className="form-input w-full mt-1" /></div>
        </div>
      </fieldset>
    </div>
  );

  const CafeForm = () => (
     <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div><label className="block text-sm font-medium text-gray-700">Taux Humidité (%)</label><input type="number" className="form-input w-full mt-1" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Nombre Défauts</label><input type="number" className="form-input w-full mt-1" /></div>
        <div><label className="block text-sm font-medium text-gray-700">Poids Défauts</label><input type="number" className="form-input w-full mt-1" /></div>
      </div>
      <fieldset className="border p-4 rounded-md">
        <legend className="text-md font-semibold px-2">Tamis</legend>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 pt-2">
          <div><label className="block text-sm text-gray-600">Tamis 18</label><input type="number" className="form-input w-full mt-1" /></div>
          <div><label className="block text-sm text-gray-600">Tamis 16</label><input type="number" className="form-input w-full mt-1" /></div>
          <div><label className="block text-sm text-gray-600">Tamis 14</label><input type="number" className="form-input w-full mt-1" /></div>
          <div><label className="block text-sm text-gray-600">Tamis 12</label><input type="number" className="form-input w-full mt-1" /></div>
          <div><label className="block text-sm text-gray-600">Tamis 10</label><input type="number" className="form-input w-full mt-1" /></div>
          <div><label className="block text-sm text-gray-600">Tamis Bas</label><input type="number" className="form-input w-full mt-1" /></div>
        </div>
      </fieldset>
    </div>
  );

  return (
    <div className="p-6 lg:p-10 space-y-8">
      <div className="bg-[#0d2d53] text-white rounded-t-xl p-6 flex items-center shadow-lg">
        <MicroscopeIcon className="h-10 w-10 mr-4" />
        <div>
          <h2 className="text-3xl font-bold">Analyses en Laboratoire</h2>
          <p className="text-blue-200">Saisie des résultats d'analyse pour les échantillons codifiés</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-b-xl shadow-lg border space-y-6">
        <div className="bg-gray-100 p-4 rounded-lg flex items-center gap-4">
            <KeyIcon className="h-6 w-6 text-gray-600" />
            <label htmlFor="code-secret" className="text-lg font-bold text-gray-800">Code Secret:</label>
            <input id="code-secret" type="text" className="form-input font-mono text-xl uppercase tracking-widest flex-grow" placeholder="Entrez le code secret..." />
            <button className="bg-[#0d2d53] hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg shadow-md flex items-center gap-2">
                <SearchIcon className="h-5 w-5" />
                <span>Charger</span>
            </button>
        </div>

        <div>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
              <button onClick={() => setActiveTab('cacao')} className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-lg flex items-center gap-2 ${activeTab === 'cacao' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <CacaoIcon className={`h-6 w-6 ${activeTab === 'cacao' ? 'text-blue-600' : 'text-gray-400'}`} />
                Analyse Cacao
              </button>
              <button onClick={() => setActiveTab('cafe')} className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-lg flex items-center gap-2 ${activeTab === 'cafe' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <CafeIcon className={`h-6 w-6 ${activeTab === 'cafe' ? 'text-blue-600' : 'text-gray-400'}`} />
                Analyse Café
              </button>
            </nav>
          </div>
          <div className="pt-6">
            {activeTab === 'cacao' ? <CacaoForm /> : <CafeForm />}
          </div>
        </div>
        <div className="flex justify-end pt-6 border-t">
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md flex items-center gap-2">
            <SaveIcon className="h-5 w-5"/>
            Enregistrer les Résultats
          </button>
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
            box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }
        .form-input:focus, .form-select:focus {
            outline: none; border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgb(59 130 246 / 0.25);
        }
      `}</style>
    </div>
  );
};

export default AnalysesLaboratoire;
