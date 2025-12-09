
import React from 'react';
import {
  WrenchIcon,
  LogoutIcon,
  SaveIcon
} from './Icons';

interface ConfigurationGeneraleProps {
  onNavigateBack: () => void;
}

const InputField = ({ label, id, type = 'text', placeholder = '', value = '', fullWidth = false, isNumber = false }) => (
    <div className={`space-y-1 ${fullWidth ? 'col-span-2' : ''}`}>
        <label htmlFor={id} className="text-sm font-medium text-gray-600">{label}</label>
        <input 
            type={type} 
            id={id} 
            placeholder={placeholder} 
            defaultValue={value}
            className={`w-full form-input ${isNumber ? 'text-right' : ''}`}
        />
    </div>
);

const ConfigurationGenerale: React.FC<ConfigurationGeneraleProps> = ({ onNavigateBack }) => {
  return (
    <div className="p-6 lg:p-10">
      <div className="bg-white rounded-xl shadow-lg border max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-50 rounded-t-xl p-4 flex items-center justify-between border-b">
            <div className="flex items-center">
                <WrenchIcon className="h-6 w-6 mr-3 text-[#0d2d53]" />
                <h2 className="text-xl font-bold text-gray-800">Configuration Générale</h2>
            </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                {/* Left Column */}
                <div className="space-y-6">
                    <fieldset className="border rounded-lg p-4">
                        <legend className="text-lg font-semibold text-gray-700 px-2">Information générale</legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                           <InputField label="Code" id="code" />
                           <InputField label="Code ARCC" id="code_arcc" />
                           <InputField label="Raison Sociale" id="raison_sociale" fullWidth />
                           <InputField label="Ville" id="ville" />
                           <InputField label="Signateur BV" id="signateur_bv" />
                           <InputField label="Telephone" id="telephone" />
                           <InputField label="Fax" id="fax" />
                           <InputField label="Email" id="email" type="email" fullWidth />
                           <InputField label="Adresse" id="adresse" fullWidth />
                        </div>
                    </fieldset>
                    
                    <fieldset className="border rounded-lg p-4">
                        <legend className="text-lg font-semibold text-gray-700 px-2">Paramètres</legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <InputField label="Grainage Toléré" id="grainage_tolere" value="0" isNumber />
                            <InputField label="Matières étrangères Tolérés" id="matieres_etrangeres" value="0.00" isNumber/>
                            <InputField label="Taux Brisure" id="taux_brisure" value="0.00" isNumber/>
                            <InputField label="Taux Crabot toléré" id="taux_crabot" value="0.00" isNumber/>
                            <InputField label="Index Code secret" id="index_code_secret" value="0" isNumber/>
                            <InputField label="Taux Dechet toléré" id="taux_dechet" value="0.00" isNumber/>
                            <InputField label="Dernier numéro facture" id="dernier_num_facture" value="0" isNumber fullWidth/>
                        </div>
                    </fieldset>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <fieldset className="border rounded-lg p-4">
                        <legend className="text-lg font-semibold text-gray-700 px-2">Laboratoire</legend>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <InputField label="Code Laboratoire" id="code_labo" fullWidth />
                            <InputField label="Nom Laboratoire" id="nom_labo" fullWidth/>
                            <InputField label="Chef Laboratoire" id="chef_labo" fullWidth/>
                            <InputField label="Responsable qualité" id="resp_qualite" fullWidth/>
                        </div>
                    </fieldset>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <fieldset className="border rounded-lg p-4">
                            <legend className="text-lg font-semibold text-gray-700 px-2">Campagne en cours</legend>
                             <div className="pt-2 space-y-4">
                                <InputField label="" id="campagne_en_cours" />
                                <div className="flex items-center">
                                    <input id="etat_actif" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <label htmlFor="etat_actif" className="ml-2 block text-sm text-gray-900">Etat Actif</label>
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="border rounded-lg p-4">
                            <legend className="text-lg font-semibold text-gray-700 px-2">Tare des sacs</legend>
                             <div className="pt-2 space-y-4">
                               <InputField label="Sac Cacao" id="tare_cacao" value="0,000" isNumber />
                               <InputField label="Sac Café" id="tare_cafe" value="0,000" isNumber />
                            </div>
                        </fieldset>
                    </div>

                    <fieldset className="border rounded-lg p-4">
                        <legend className="text-lg font-semibold text-gray-700 px-2">Tarification</legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                           <InputField label="Prix/tonne de Cacao" id="prix_cacao" value="0,0000" isNumber />
                           <InputField label="Prix/tonne de Café" id="prix_cafe" value="0,0000" isNumber />
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors shadow"><SaveIcon className="h-4 w-4" /><span>Enregistrer</span></button>
          <button
            onClick={onNavigateBack}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors shadow"
          >
            <LogoutIcon className="h-4 w-4" />
            <span>Quitter</span>
          </button>
        </div>
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
      `}</style>
    </div>
  );
};

export default ConfigurationGenerale;
