import React, { useState, useEffect } from 'react';
import {
  WrenchIcon,
  LogoutIcon,
  SaveIcon
} from './Icons';

interface ConfigurationGeneraleProps {
  onNavigateBack: () => void;
}

interface Parametres {
  PRIX_ANALYSE_KKO: string;
  PRIX_ANALYSE_KFE: string;
  CODE_ENTREPRISE?: string;
  RAISON_SOCIALE?: string;
  VILLE?: string;
  ADRESSE?: string;
  TELEPHONE?: string;
  FAX?: string;
  EMAIL?: string;
  TARESAC_KKO?: string;
  TARESAC_KFE?: string;
  // ... autres champs
}

const InputField = ({ 
  label, 
  id, 
  type = 'text', 
  placeholder = '', 
  value = '', 
  fullWidth = false, 
  isNumber = false,
  onChange 
}) => (
  <div className={`space-y-1 ${fullWidth ? 'col-span-2' : ''}`}>
      <label htmlFor={id} className="text-sm font-medium text-gray-600">{label}</label>
      <input 
          type={type} 
          id={id} 
          placeholder={placeholder} 
          value={value}
          onChange={onChange}
          className={`w-full form-input ${isNumber ? 'text-right' : ''}`}
      />
  </div>
);

const ConfigurationGenerale: React.FC<ConfigurationGeneraleProps> = ({ onNavigateBack }) => {
  const [parametres, setParametres] = useState<Parametres>({
    PRIX_ANALYSE_KKO: '0',
    PRIX_ANALYSE_KFE: '0'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    chargerParametres();
  }, []);

  const chargerParametres = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/parametres');
      const data = await response.json();
      if (data) {
        setParametres(data);
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof Parametres) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setParametres(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      // Préparer les données avec les valeurs par défaut
      const donnees = {
        ...parametres,
        // Assurer que les prix sont bien des nombres
        PRIX_ANALYSE_KKO: parseFloat(parametres.PRIX_ANALYSE_KKO) || 0,
        PRIX_ANALYSE_KFE: parseFloat(parametres.PRIX_ANALYSE_KFE) || 0,
        // Valeurs par défaut pour les autres champs
        CODE_ENTREPRISE: parametres.CODE_ENTREPRISE || '',
        RAISON_SOCIALE: parametres.RAISON_SOCIALE || '',
        VILLE: parametres.VILLE || '',
        ADRESSE: parametres.ADRESSE || '',
        TELEPHONE: parametres.TELEPHONE || '',
        FAX: parametres.FAX || '',
        EMAIL: parametres.EMAIL || '',
        TARESAC_KKO: parseFloat(parametres.TARESAC_KKO as string) || 0,
        TARESAC_KFE: parseFloat(parametres.TARESAC_KFE as string) || 0,
        ETAT: 1,
        GRAINAGE: 0,
        MATIERE_ETRANGERE: 0,
        LAST_ID_FACTURE: 0,
        LAST_CODE_SECRET: 0
      };

      const response = await fetch('http://localhost:5000/api/parametres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donnees)
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage('Paramètres enregistrés avec succès');
        // Recharger les paramètres pour avoir les valeurs mises à jour
        await chargerParametres();
      } else {
        setMessage('Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      setMessage('Erreur de connexion au serveur');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-10 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0d2d53] mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="bg-white rounded-xl shadow-lg border max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gray-50 rounded-t-xl p-4 flex items-center justify-between border-b">
            <div className="flex items-center">
                <WrenchIcon className="h-6 w-6 mr-3 text-[#0d2d53]" />
                <h2 className="text-xl font-bold text-gray-800">Configuration Générale</h2>
            </div>
            {message && (
              <div className={`px-4 py-2 rounded ${message.includes('succès') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {message}
              </div>
            )}
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
                {/* Left Column */}
                <div className="space-y-6">
                    <fieldset className="border rounded-lg p-4">
                        <legend className="text-lg font-semibold text-gray-700 px-2">Information générale</legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                           <InputField 
                             label="Code" 
                             id="code" 
                             value={parametres.CODE_ENTREPRISE || ''}
                             onChange={handleChange('CODE_ENTREPRISE')}
                           />
                           <InputField 
                             label="Raison Sociale" 
                             id="raison_sociale" 
                             fullWidth 
                             value={parametres.RAISON_SOCIALE || ''}
                             onChange={handleChange('RAISON_SOCIALE')}
                           />
                           <InputField 
                             label="Ville" 
                             id="ville" 
                             value={parametres.VILLE || ''}
                             onChange={handleChange('VILLE')}
                           />
                           <InputField 
                             label="Telephone" 
                             id="telephone" 
                             value={parametres.TELEPHONE || ''}
                             onChange={handleChange('TELEPHONE')}
                           />
                           <InputField 
                             label="Fax" 
                             id="fax" 
                             value={parametres.FAX || ''}
                             onChange={handleChange('FAX')}
                           />
                           <InputField 
                             label="Email" 
                             id="email" 
                             type="email" 
                             fullWidth
                             value={parametres.EMAIL || ''}
                             onChange={handleChange('EMAIL')}
                           />
                           <InputField 
                             label="Adresse" 
                             id="adresse" 
                             fullWidth
                             value={parametres.ADRESSE || ''}
                             onChange={handleChange('ADRESSE')}
                           />
                        </div>
                    </fieldset>
                    
                    <fieldset className="border rounded-lg p-4">
                        <legend className="text-lg font-semibold text-gray-700 px-2">Paramètres</legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <InputField 
                              label="Taux Brisure" 
                              id="taux_brisure" 
                              value="0.00" 
                              isNumber
                              onChange={() => {}}
                            />
                            <InputField 
                              label="Taux Crabot toléré" 
                              id="taux_crabot" 
                              value="0.00" 
                              isNumber
                              onChange={() => {}}
                            />
                            <InputField 
                              label="Taux Dechet toléré" 
                              id="taux_dechet" 
                              value="0.00" 
                              isNumber
                              onChange={() => {}}
                            />
                            <InputField 
                              label="Dernier numéro facture" 
                              id="dernier_num_facture" 
                              value="0" 
                              isNumber 
                              fullWidth
                              onChange={() => {}}
                            />
                        </div>
                    </fieldset>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <fieldset className="border rounded-lg p-4">
                        <legend className="text-lg font-semibold text-gray-700 px-2">Tarification</legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                           <InputField 
                             label="Prix/tonne de Cacao (FCFA)" 
                             id="prix_cacao" 
                             value={parametres.PRIX_ANALYSE_KKO || '0'}
                             onChange={handleChange('PRIX_ANALYSE_KKO')}
                             isNumber
                             placeholder="0,000"
                           />
                           <InputField 
                             label="Prix/tonne de Café (FCFA)" 
                             id="prix_cafe" 
                             value={parametres.PRIX_ANALYSE_KFE || '0'}
                             onChange={handleChange('PRIX_ANALYSE_KFE')}
                             isNumber
                             placeholder="0,000"
                           />
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                          <p className="text-sm text-blue-700">
                            <strong>Note:</strong> Ces prix seront appliqués au calcul du montant des factures.
                            Le montant = (Poids total en kg / 1000) × Prix/tonne
                          </p>
                        </div>
                    </fieldset>

                    <fieldset className="border rounded-lg p-4">
                        <legend className="text-lg font-semibold text-gray-700 px-2">Tare des sacs</legend>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                           <InputField 
                             label="Sac Cacao (kg)" 
                             id="tare_cacao" 
                             value={parametres.TARESAC_KKO || '0'}
                             onChange={handleChange('TARESAC_KKO')}
                             isNumber 
                           />
                           <InputField 
                             label="Sac Café (kg)" 
                             id="tare_cafe" 
                             value={parametres.TARESAC_KFE || '0'}
                             onChange={handleChange('TARESAC_KFE')}
                             isNumber 
                           />
                        </div>
                    </fieldset>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <fieldset className="border rounded-lg p-4">
                            <legend className="text-lg font-semibold text-gray-700 px-2">Campagne en cours</legend>
                             <div className="pt-2 space-y-4">
                                <InputField label="" id="campagne_en_cours" onChange={() => {}} />
                                <div className="flex items-center">
                                    <input id="etat_actif" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <label htmlFor="etat_actif" className="ml-2 block text-sm text-gray-900">Etat Actif</label>
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="border rounded-lg p-4">
                            <legend className="text-lg font-semibold text-gray-700 px-2">Laboratoire</legend>
                             <div className="pt-2 space-y-4">
                                <InputField label="Code Laboratoire" id="code_labo" onChange={() => {}} />
                                <InputField label="Nom Laboratoire" id="nom_labo" onChange={() => {}} />
                            </div>
                        </fieldset>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <SaveIcon className="h-4 w-4" />
                <span>Enregistrer</span>
              </>
            )}
          </button>
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