import React, { useState, useCallback, useEffect } from 'react';
import {
  BackArrowIcon,
  MicroscopeIcon,
  KeyIcon,
  SearchIcon,
  CacaoIcon,
  CafeIcon,
  SaveIcon,
  CheckCircleIcon
} from './Icons';

interface AnalysesLaboratoireProps {
  onNavigateBack: () => void;
}

interface LotInfo {
  ID_CODIFICATION: number;
  CODE_SECRET_CODIFICATION: string;
  LIBELLE_CODIFICATION: string;
  ID_LOTS: number;
  NUM_LOTS: string;
  REF_DEMANDE: string;
  ID_PRODUIT: string;
  LIBELLE_PRODUIT: string;
  RAISONSOCIALE_EXPORTATEUR: string;
  RECOLTE_LOTS: string;
  NOM_MAGASIN: string;
}

// Interface pour les données Cacao
interface CacaoData {
  // Formation générale
  poidsDeclaration: string;
  poidsEchantillon: string;
  poidsTotalEchantillon: string;
  
  // Première partie - Tableau des analyses
  fevesEntieres: string;
  fevesPlates: string;
  poidsDechet: string;
  poidsFevesPlates: string;
  poidsFevesEntieres: string;
  
  // Épreuve à la loupe
  poidsBrisures: string;
  poidsEtrangeres: string;
  poidsFevesBrisees: string;
  poidsCoques: string;
  poidsCrabot: string;
  totalLoupe: string;
  totalLoupeEquivalent: string;
  
  // Détermination du grainage
  totalFevesEntieres: string;
  grainage: string;
  poidsNombreFevesEntieres: string; // Renommé
  
  // Taux d'humidité (3 lectures)
  lectureHumidite1: string;
  lectureHumidite2: string;
  lectureHumidite3: string;
  totalHumidite: string;
  tauxHumiditePourcentage: string;
  
  // Norme et classification
  normeIvoirienne: string;
  normeInternationale: string;
  conforme: boolean;
  remarque: string;
  
  // Épreuve à la coupe - Défauts (plateaux 1, 2, 3)
  moisiePlateau1: string;
  moisiePlateau2: string;
  moisiePlateau3: string;
  moisieTotal: string;
  moisiePourcentage: string;
  
  miteePlateau1: string;
  miteePlateau2: string;
  miteePlateau3: string;
  miteeTotal: string;
  miteePourcentage: string;
  
  ardoiseePlateau1: string;
  ardoiseePlateau2: string;
  ardoiseePlateau3: string;
  ardoiseeTotal: string;
  ardoiseePourcentage: string;
  
  platePlateau1: string;
  platePlateau2: string;
  platePlateau3: string;
  plateTotal: string;
  platePourcentage: string;
  
  germeePlateau1: string;
  germeePlateau2: string;
  germeePlateau3: string;
  germeeTotal: string;
  germeePourcentage: string;
  
  violettePlateau1: string;
  violettePlateau2: string;
  violettePlateau3: string;
  violetteTotal: string;
  violettePourcentage: string;
  
  // Nbre fèves pour défauts
  nbreFevesDefauts: string;
}

// Interface pour les données Café
interface CafeData {
  tauxHumidite: string;
  normeClassification: string;
  tamis18_saisi: string;
  tamis16_saisi: string;
  tamis14_saisi: string;
  tamis12_saisi: string;
  tamis10_saisi: string;
  tamisbas_saisi: string;
  nbreDefaut: string;
  poidsDefaut: string;
}

// ============================================
// COMPOSANT CACAO FORM
// ============================================
const CacaoForm: React.FC<{
  cacaoData: CacaoData;
  onCacaoChange: (field: keyof CacaoData, value: string) => void;
  calculerValeur: (valeur: string) => string;
  calculerPourcentageDefaut: (total: string, nbreFeves: string) => string;
  calculerPoidsFevesEntieres: () => string;
  calculerTotalFèvesEntieres: () => string;
  calculerGrainage: () => string;
  calculerMoyenneHumidite: () => string;
  calculerTotalHumidite: () => string;
  calculerPourcentageDechet: () => string;
  calculerPourcentageBrisures: () => string;
  calculerPourcentageEtrangeres: () => string;
  calculerPourcentageFevesBrisees: () => string;
  calculerPourcentageCrabot: () => string;
  calculerPoidsNombreFevesEntieres: () => string;
}> = React.memo(({ 
  cacaoData, 
  onCacaoChange, 
  calculerValeur,
  calculerPourcentageDefaut,
  calculerPoidsFevesEntieres,
  calculerTotalFèvesEntieres,
  calculerGrainage,
  calculerMoyenneHumidite,
  calculerTotalHumidite,
  calculerPourcentageDechet,
  calculerPourcentageBrisures,
  calculerPourcentageEtrangeres,
  calculerPourcentageFevesBrisees,
  calculerPourcentageCrabot,
  calculerPoidsNombreFevesEntieres
}) => {
  
  const handleInputChange = useCallback((field: keyof CacaoData) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      let value = e.target.value;
      
      // Validation spécifique pour poidsDeclaration (7 chiffres)
      if (field === 'poidsDeclaration') {
        // Limiter à 7 chiffres maximum
        if (value.includes('.')) {
          const parts = value.split('.');
          if (parts[0].length > 7) {
            parts[0] = parts[0].slice(0, 7);
          }
          if (parts[1] && parts[1].length > 3) {
            parts[1] = parts[1].slice(0, 3);
          }
          value = parts.join('.');
        } else {
          if (value.length > 7) {
            value = value.slice(0, 7);
          }
        }
      } else {
        // Validation standard : maximum 3 chiffres avant la virgule et 3 après
        if (value.includes('.')) {
          const parts = value.split('.');
          if (parts[0].length > 3) {
            parts[0] = parts[0].slice(0, 3);
          }
          if (parts[1] && parts[1].length > 3) {
            parts[1] = parts[1].slice(0, 3);
          }
          value = parts.join('.');
        } else {
          if (value.length > 3) {
            value = value.slice(0, 3);
          }
        }
      }
      
      onCacaoChange(field, value);
    }, [onCacaoChange]);

  const handleCheckboxChange = useCallback((field: keyof CacaoData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onCacaoChange(field, e.target.checked ? '1' : '0');
    }, [onCacaoChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  }, []);

  // Calculer le total loupe (sans coques)
  const calculerTotalLoupe = useCallback(() => {
    const brisures = parseFloat(cacaoData.poidsBrisures) || 0;
    const etrangeres = parseFloat(cacaoData.poidsEtrangeres) || 0;
    const brisees = parseFloat(cacaoData.poidsFevesBrisees) || 0;
    const crabot = parseFloat(cacaoData.poidsCrabot) || 0;
    return (brisures + etrangeres + brisees + crabot).toFixed(3);
  }, [cacaoData.poidsBrisures, cacaoData.poidsEtrangeres, cacaoData.poidsFevesBrisees, cacaoData.poidsCrabot]);

  // Calculer les totaux pour chaque défaut
  const calculerTotalDefaut = useCallback((plateau1: string, plateau2: string, plateau3: string) => {
    const p1 = parseFloat(plateau1) || 0;
    const p2 = parseFloat(plateau2) || 0;
    const p3 = parseFloat(plateau3) || 0;
    return (p1 + p2 + p3).toFixed(3);
  }, []);

  return (
    <div className="space-y-6">
      {/* Informations générales */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-3 text-blue-900">Formation générale</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Poids Déclaration (kg)</label>
            <input 
              type="number" 
              step="0.001"
              min="0"
              max="9999999"
              value={cacaoData.poidsDeclaration}
              onChange={handleInputChange('poidsDeclaration')}
              onKeyDown={handleKeyDown}
              className="form-input w-full mt-1" 
              placeholder="Ex: 2000.000"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum 7 chiffres</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Poids Échantillon (g)</label>
            <input 
              type="number" 
              step="0.001"
              min="0"
              max="999"
              value={cacaoData.poidsEchantillon}
              onChange={handleInputChange('poidsEchantillon')}
              onKeyDown={handleKeyDown}
              className="form-input w-full mt-1" 
              placeholder="Ex: 300"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Poids Total Échantillon (g)</label>
            <input 
              type="number" 
              step="0.001"
              min="0"
              max="999"
              value={cacaoData.poidsTotalEchantillon}
              onChange={handleInputChange('poidsTotalEchantillon')}
              onKeyDown={handleKeyDown}
              className="form-input w-full mt-1" 
              placeholder="Ex: 2000"
            />
          </div>
        </div>
      </div>
      
      {/* Première partie - Tableau des analyses */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-3 text-green-900">Première partie - Tableau des analyses</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">A) Fèves Entières (g)</label>
            <input 
              type="number" 
              step="0.001"
              min="0"
              max="999"
              value={cacaoData.fevesEntieres}
              onChange={handleInputChange('fevesEntieres')}
              onKeyDown={handleKeyDown}
              className="form-input w-full mt-1" 
              placeholder="Ex: 280.000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">B) Fèves Plates (g)</label>
            <input 
              type="number" 
              step="0.001"
              min="0"
              max="999"
              value={cacaoData.fevesPlates}
              onChange={handleInputChange('fevesPlates')}
              onKeyDown={handleKeyDown}
              className="form-input w-full mt-1" 
              placeholder="Ex: 0.000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">C) Poids Déchet (g)</label>
            <div className="space-y-1">
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.poidsDechet}
                onChange={handleInputChange('poidsDechet')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1" 
                placeholder="Ex: 18.800"
              />
              <div className="text-xs text-gray-600 bg-gray-100 p-1 rounded">
                %: {calculerPourcentageDechet()}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Poids Fèves Plates (g)</label>
            <input 
              type="number" 
              step="0.001"
              min="0"
              max="999"
              value={cacaoData.poidsFevesPlates}
              onChange={handleInputChange('poidsFevesPlates')}
              onKeyDown={handleKeyDown}
              className="form-input w-full mt-1" 
              placeholder="Ex: 0.000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Poids Fèves Entières (g)</label>
            <input 
              type="text" 
              value={calculerPoidsFevesEntieres()}
              readOnly
              className="form-input w-full mt-1 bg-gray-100" 
            />
            <p className="text-xs text-gray-500 mt-1">Calculé: 300 - Total épreuve loupe</p>
          </div>
        </div>
      </div>
      
      {/* Épreuve à la loupe */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-3 text-yellow-900">Épreuve à la loupe (g)</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Poids des brisures</label>
            <div className="space-y-1">
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.poidsBrisures}
                onChange={handleInputChange('poidsBrisures')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1" 
                placeholder="Ex: 3.300"
              />
              <div className="text-xs text-gray-600 bg-gray-100 p-1 rounded">
                %: {calculerPourcentageBrisures()}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Poids M. ETR</label>
            <div className="space-y-1">
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.poidsEtrangeres}
                onChange={handleInputChange('poidsEtrangeres')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1" 
                placeholder="Ex: 2.400"
              />
              <div className="text-xs text-gray-600 bg-gray-100 p-1 rounded">
                %: {calculerPourcentageEtrangeres()}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Poids des F. Brisées</label>
            <div className="space-y-1">
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.poidsFevesBrisees}
                onChange={handleInputChange('poidsFevesBrisees')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1" 
                placeholder="Ex: 2.000"
              />
              <div className="text-xs text-gray-600 bg-gray-100 p-1 rounded">
                %: {calculerPourcentageFevesBrisees()}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Poids des Crabot</label>
            <div className="space-y-1">
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.poidsCrabot}
                onChange={handleInputChange('poidsCrabot')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1" 
                placeholder="Ex: 8.000"
              />
              <div className="text-xs text-gray-600 bg-gray-100 p-1 rounded">
                %: {calculerPourcentageCrabot()}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">TOTAL (g)</label>
            <input 
              type="text" 
              value={calculerTotalLoupe()}
              readOnly
              className="form-input w-full mt-1 bg-gray-100" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Équivalent (g)</label>
            <input 
              type="number" 
              step="0.001"
              min="0"
              max="999"
              value={cacaoData.totalLoupeEquivalent}
              onChange={handleInputChange('totalLoupeEquivalent')}
              onKeyDown={handleKeyDown}
              className="form-input w-full mt-1" 
              placeholder="Équivalent"
            />
          </div>
        </div>
      </div>
      
      {/* Détermination du grainage */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-3 text-purple-900">Détermination du grainage</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">POIDS DE NOMBRE DE FEVE ENTIERE</label>
            <input 
              type="text" 
              value={calculerPoidsNombreFevesEntieres()}
              readOnly
              className="form-input w-full mt-1 bg-gray-100 font-semibold" 
            />
            <p className="text-xs text-gray-500 mt-1">Calculé: 300 - (brisures + ETR + F. brisées + crabot)</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Total Fèves entières (A+Équivalent) (Fèves/300g)</label>
            <input 
              type="text" 
              value={calculerTotalFèvesEntieres()}
              readOnly
              className="form-input w-full mt-1 bg-gray-100 font-semibold" 
            />
            <p className="text-xs text-gray-500 mt-1">A + Équivalent</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Grainage (fèves/100g)</label>
            <input 
              type="text" 
              value={calculerGrainage()}
              readOnly
              className="form-input w-full mt-1 bg-gray-100 font-semibold" 
              placeholder="Calculé automatiquement"
            />
            <p className="text-xs text-gray-500 mt-1">Total × 100 ÷ 300</p>
          </div>
        </div>
      </div>
      
      {/* Taux d'humidité */}
      <div className="bg-indigo-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-3 text-indigo-900">Détermination du taux d'humidité</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Lecture 1</label>
            <input 
              type="number" 
              step="0.001"
              min="0"
              max="999"
              value={cacaoData.lectureHumidite1}
              onChange={handleInputChange('lectureHumidite1')}
              onKeyDown={handleKeyDown}
              className="form-input w-full mt-1" 
              placeholder="0.000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Lecture 2</label>
            <input 
              type="number" 
              step="0.001"
              min="0"
              max="999"
              value={cacaoData.lectureHumidite2}
              onChange={handleInputChange('lectureHumidite2')}
              onKeyDown={handleKeyDown}
              className="form-input w-full mt-1" 
              placeholder="0.000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Lecture 3</label>
            <input 
              type="number" 
              step="0.001"
              min="0"
              max="999"
              value={cacaoData.lectureHumidite3}
              onChange={handleInputChange('lectureHumidite3')}
              onKeyDown={handleKeyDown}
              className="form-input w-full mt-1" 
              placeholder="0.000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">TOTAL</label>
            <input 
              type="text" 
              value={calculerTotalHumidite()}
              readOnly
              className="form-input w-full mt-1 bg-gray-100" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">MOY %</label>
            <input 
              type="text" 
              value={calculerMoyenneHumidite()}
              readOnly
              className="form-input w-full mt-1 bg-gray-100 font-semibold" 
            />
          </div>
        </div>
      </div>
      
      {/* Nbre fèves pour défauts */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-3 text-gray-900">Nombre de fèves pour calcul des défauts</h3>
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-700">Nombre total de fèves examinées</label>
          <input 
            type="number" 
            min="0"
            max="999"
            value={cacaoData.nbreFevesDefauts}
            onChange={handleInputChange('nbreFevesDefauts')}
            onKeyDown={handleKeyDown}
            className="form-input w-full mt-1" 
            placeholder="Ex: 300"
          />
          <p className="text-xs text-gray-500 mt-1">Utilisé pour calculer les pourcentages de défauts</p>
        </div>
      </div>
      
      {/* Épreuve à la coupe - Défauts */}
      <fieldset className="border-2 border-red-200 p-4 rounded-lg bg-red-50">
        <legend className="text-lg font-semibold px-3 text-red-900">Épreuve à la coupe - Défauts (%)</legend>
        
        {/* Moisies */}
        <div className="mb-6">
          <h4 className="font-semibold text-md mb-2 text-gray-700">Moisies</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs text-gray-600">Plateau 1</label>
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.moisiePlateau1}
                onChange={handleInputChange('moisiePlateau1')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1 text-sm" 
                placeholder="0.000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Plateau 2</label>
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.moisiePlateau2}
                onChange={handleInputChange('moisiePlateau2')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1 text-sm" 
                placeholder="0.000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Plateau 3</label>
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.moisiePlateau3}
                onChange={handleInputChange('moisiePlateau3')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1 text-sm" 
                placeholder="0.000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">TOTAL</label>
              <input 
                type="text" 
                value={calculerTotalDefaut(cacaoData.moisiePlateau1, cacaoData.moisiePlateau2, cacaoData.moisiePlateau3)}
                readOnly
                className="form-input w-full mt-1 text-sm bg-gray-100" 
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">MOY %</label>
              <input 
                type="text" 
                value={calculerPourcentageDefaut(
                  calculerTotalDefaut(cacaoData.moisiePlateau1, cacaoData.moisiePlateau2, cacaoData.moisiePlateau3),
                  cacaoData.nbreFevesDefauts
                )}
                readOnly
                className="form-input w-full mt-1 text-sm bg-gray-100 font-semibold" 
              />
            </div>
          </div>
        </div>
        
        {/* Mitées */}
        <div className="mb-6">
          <h4 className="font-semibold text-md mb-2 text-gray-700">Mitées</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs text-gray-600">Plateau 1</label>
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.miteePlateau1}
                onChange={handleInputChange('miteePlateau1')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1 text-sm" 
                placeholder="0.000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Plateau 2</label>
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.miteePlateau2}
                onChange={handleInputChange('miteePlateau2')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1 text-sm" 
                placeholder="0.000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Plateau 3</label>
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.miteePlateau3}
                onChange={handleInputChange('miteePlateau3')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1 text-sm" 
                placeholder="0.000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">TOTAL</label>
              <input 
                type="text" 
                value={calculerTotalDefaut(cacaoData.miteePlateau1, cacaoData.miteePlateau2, cacaoData.miteePlateau3)}
                readOnly
                className="form-input w-full mt-1 text-sm bg-gray-100" 
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">MOY %</label>
              <input 
                type="text" 
                value={calculerPourcentageDefaut(
                  calculerTotalDefaut(cacaoData.miteePlateau1, cacaoData.miteePlateau2, cacaoData.miteePlateau3),
                  cacaoData.nbreFevesDefauts
                )}
                readOnly
                className="form-input w-full mt-1 text-sm bg-gray-100 font-semibold" 
              />
            </div>
          </div>
        </div>
        
        {/* Ardoisées */}
        <div className="mb-6">
          <h4 className="font-semibold text-md mb-2 text-gray-700">Ardoisées</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs text-gray-600">Plateau 1</label>
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.ardoiseePlateau1}
                onChange={handleInputChange('ardoiseePlateau1')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1 text-sm" 
                placeholder="0.000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Plateau 2</label>
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.ardoiseePlateau2}
                onChange={handleInputChange('ardoiseePlateau2')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1 text-sm" 
                placeholder="0.000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Plateau 3</label>
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.ardoiseePlateau3}
                onChange={handleInputChange('ardoiseePlateau3')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1 text-sm" 
                placeholder="0.000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">TOTAL</label>
              <input 
                type="text" 
                value={calculerTotalDefaut(cacaoData.ardoiseePlateau1, cacaoData.ardoiseePlateau2, cacaoData.ardoiseePlateau3)}
                readOnly
                className="form-input w-full mt-1 text-sm bg-gray-100" 
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">MOY %</label>
              <input 
                type="text" 
                value={calculerPourcentageDefaut(
                  calculerTotalDefaut(cacaoData.ardoiseePlateau1, cacaoData.ardoiseePlateau2, cacaoData.ardoiseePlateau3),
                  cacaoData.nbreFevesDefauts
                )}
                readOnly
                className="form-input w-full mt-1 text-sm bg-gray-100 font-semibold" 
              />
            </div>
          </div>
        </div>
        
        {/* Plates */}
        <div className="mb-6">
          <h4 className="font-semibold text-md mb-2 text-gray-700">Plates</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs text-gray-600">Plateau 1</label>
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.platePlateau1}
                onChange={handleInputChange('platePlateau1')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1 text-sm" 
                placeholder="0.000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Plateau 2</label>
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.platePlateau2}
                onChange={handleInputChange('platePlateau2')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1 text-sm" 
                placeholder="0.000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Plateau 3</label>
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.platePlateau3}
                onChange={handleInputChange('platePlateau3')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1 text-sm" 
                placeholder="0.000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">TOTAL</label>
              <input 
                type="text" 
                value={calculerTotalDefaut(cacaoData.platePlateau1, cacaoData.platePlateau2, cacaoData.platePlateau3)}
                readOnly
                className="form-input w-full mt-1 text-sm bg-gray-100" 
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">MOY %</label>
              <input 
                type="text" 
                value={calculerPourcentageDefaut(
                  calculerTotalDefaut(cacaoData.platePlateau1, cacaoData.platePlateau2, cacaoData.platePlateau3),
                  cacaoData.nbreFevesDefauts
                )}
                readOnly
                className="form-input w-full mt-1 text-sm bg-gray-100 font-semibold" 
              />
            </div>
          </div>
        </div>
        
        {/* Germées */}
        <div className="mb-6">
          <h4 className="font-semibold text-md mb-2 text-gray-700">Germées</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs text-gray-600">Plateau 1</label>
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.germeePlateau1}
                onChange={handleInputChange('germeePlateau1')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1 text-sm" 
                placeholder="0.000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Plateau 2</label>
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.germeePlateau2}
                onChange={handleInputChange('germeePlateau2')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1 text-sm" 
                placeholder="0.000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Plateau 3</label>
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.germeePlateau3}
                onChange={handleInputChange('germeePlateau3')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1 text-sm" 
                placeholder="0.000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">TOTAL</label>
              <input 
                type="text" 
                value={calculerTotalDefaut(cacaoData.germeePlateau1, cacaoData.germeePlateau2, cacaoData.germeePlateau3)}
                readOnly
                className="form-input w-full mt-1 text-sm bg-gray-100" 
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">MOY %</label>
              <input 
                type="text" 
                value={calculerPourcentageDefaut(
                  calculerTotalDefaut(cacaoData.germeePlateau1, cacaoData.germeePlateau2, cacaoData.germeePlateau3),
                  cacaoData.nbreFevesDefauts
                )}
                readOnly
                className="form-input w-full mt-1 text-sm bg-gray-100 font-semibold" 
              />
            </div>
          </div>
        </div>
        
        {/* Violette */}
        <div className="mb-6">
          <h4 className="font-semibold text-md mb-2 text-gray-700">Violettes</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs text-gray-600">Plateau 1</label>
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.violettePlateau1}
                onChange={handleInputChange('violettePlateau1')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1 text-sm" 
                placeholder="0.000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Plateau 2</label>
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.violettePlateau2}
                onChange={handleInputChange('violettePlateau2')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1 text-sm" 
                placeholder="0.000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">Plateau 3</label>
              <input 
                type="number" 
                step="0.001"
                min="0"
                max="999"
                value={cacaoData.violettePlateau3}
                onChange={handleInputChange('violettePlateau3')}
                onKeyDown={handleKeyDown}
                className="form-input w-full mt-1 text-sm" 
                placeholder="0.000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">TOTAL</label>
              <input 
                type="text" 
                value={calculerTotalDefaut(cacaoData.violettePlateau1, cacaoData.violettePlateau2, cacaoData.violettePlateau3)}
                readOnly
                className="form-input w-full mt-1 text-sm bg-gray-100" 
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600">MOY %</label>
              <input 
                type="text" 
                value={calculerPourcentageDefaut(
                  calculerTotalDefaut(cacaoData.violettePlateau1, cacaoData.violettePlateau2, cacaoData.violettePlateau3),
                  cacaoData.nbreFevesDefauts
                )}
                readOnly
                className="form-input w-full mt-1 text-sm bg-gray-100 font-semibold" 
              />
            </div>
          </div>
        </div>
      </fieldset>
      
      {/* Classification */}
      <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
        <h3 className="font-semibold text-lg mb-3 text-gray-900">Classification</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Norme Ivoirienne</label>
            <input 
              type="text" 
              value={cacaoData.normeIvoirienne}
              readOnly
              className="form-input w-full mt-1 bg-gray-100 font-semibold" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Norme Internationale (FCC)</label>
            <input 
              type="text" 
              value={cacaoData.normeInternationale}
              readOnly
              className="form-input w-full mt-1 bg-gray-100 font-semibold" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Conforme</label>
            <div className="flex items-center mt-2 space-x-4">
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  checked={cacaoData.conforme}
                  onChange={(e) => onCacaoChange('conforme', e.target.checked ? '1' : '0')}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">OUI</span>
              </label>
              <label className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  checked={!cacaoData.conforme}
                  onChange={() => onCacaoChange('conforme', '0')}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-gray-700">NON</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Remarque</label>
          <textarea 
            value={cacaoData.remarque}
            onChange={(e) => onCacaoChange('remarque', e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            className="form-textarea w-full mt-1" 
            placeholder="Ajoutez vos remarques ici..."
          />
        </div>
      </div>
    </div>
  );
});

CacaoForm.displayName = 'CacaoForm';

// ============================================
// COMPOSANT CAFE FORM
// ============================================
const CafeForm: React.FC<{
  cafeData: CafeData;
  onCafeChange: (field: keyof CafeData, value: string) => void;
  calculerValeur: (valeur: string) => string;
}> = React.memo(({ cafeData, onCafeChange, calculerValeur }) => {
  
  const handleInputChange = useCallback((field: keyof CafeData) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let value = e.target.value;
      
      // Validation : maximum 3 chiffres avant la virgule et 3 après
      if (value.includes('.')) {
        const parts = value.split('.');
        if (parts[0].length > 3) {
          parts[0] = parts[0].slice(0, 3);
        }
        if (parts[1] && parts[1].length > 3) {
          parts[1] = parts[1].slice(0, 3);
        }
        value = parts.join('.');
      } else {
        if (value.length > 3) {
          value = value.slice(0, 3);
        }
      }
      
      onCafeChange(field, value);
    }, [onCafeChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Informations générales */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-3 text-blue-900">Classification et Norme</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Norme de Classification</label>
            <select
              value={cafeData.normeClassification}
              onChange={handleInputChange('normeClassification')}
              onKeyDown={handleKeyDown}
              className="form-select w-full mt-1"
            >
              <option value="">Sélectionner...</option>
              <option value="Grade 0">Grade 0</option>
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
              <option value="Grade 4">Grade 4</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Taux d'humidité (sans calcul) */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-3 text-yellow-900">Taux d'Humidité</h3>
        <div className="max-w-sm">
          <label className="block text-sm font-medium text-gray-700">Taux Humidité (%)</label>
          <input 
            type="number" 
            step="0.1"
            min="0"
            max="999"
            value={cafeData.tauxHumidite}
            onChange={handleInputChange('tauxHumidite')}
            onKeyDown={handleKeyDown}
            className="form-input w-full mt-1" 
            placeholder="Ex: 12.0"
          />
          <p className="text-xs text-gray-500 mt-1">Pas de calcul automatique pour ce champ</p>
        </div>
      </div>
      
      {/* Défauts */}
      <div className="bg-red-50 p-4 rounded-lg">
        <h3 className="font-semibold text-lg mb-3 text-red-900">Défauts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre Défauts</label>
            <input 
              type="number"
              min="0"
              max="999"
              value={cafeData.nbreDefaut}
              onChange={handleInputChange('nbreDefaut')}
              onKeyDown={handleKeyDown}
              className="form-input w-full mt-1" 
              placeholder="Ex: 5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Poids Défauts (g)</label>
            <input 
              type="number" 
              step="0.01"
              min="0"
              max="999"
              value={cafeData.poidsDefaut}
              onChange={handleInputChange('poidsDefaut')}
              onKeyDown={handleKeyDown}
              className="form-input w-full mt-1" 
              placeholder="Ex: 2.5"
            />
          </div>
        </div>
      </div>
      
      {/* Analyse au tamis */}
      <fieldset className="border-2 border-green-200 p-4 rounded-lg bg-green-50">
        <legend className="text-lg font-semibold px-3 text-green-900">Analyse au Tamis - Calcul Automatique</legend>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-3">
          {[
            { key: 'tamis18_saisi', label: 'Tamis 18' },
            { key: 'tamis16_saisi', label: 'Tamis 16' },
            { key: 'tamis14_saisi', label: 'Tamis 14' },
            { key: 'tamis12_saisi', label: 'Tamis 12' },
            { key: 'tamis10_saisi', label: 'Tamis 10' },
            { key: 'tamisbas_saisi', label: 'Tamis Bas' }
          ].map((tamis) => (
            <div key={tamis.key} className="bg-white p-3 rounded border">
              <label className="block text-sm font-semibold text-gray-700 mb-2">{tamis.label}</label>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600">Valeur Saisie</label>
                  <input 
                    type="number" 
                    step="0.001"
                    min="0"
                    max="999"
                    value={cafeData[tamis.key as keyof CafeData]}
                    onChange={handleInputChange(tamis.key as keyof CafeData)}
                    onKeyDown={handleKeyDown}
                    className="form-input w-full mt-1 text-sm" 
                    placeholder="0.000"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600">Résultat Calculé</label>
                  <input 
                    type="text" 
                    value={calculerValeur(cafeData[tamis.key as keyof CafeData] as string)}
                    readOnly
                    className="form-input w-full mt-1 text-sm bg-gray-100 font-semibold" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-3 text-center italic">Formule appliquée : (valeur saisie × 100) ÷ 3</p>
      </fieldset>
    </div>
  );
});

CafeForm.displayName = 'CafeForm';

// ============================================
// COMPOSANT PRINCIPAL
// ============================================
const AnalysesLaboratoire: React.FC<AnalysesLaboratoireProps> = ({ onNavigateBack }) => {
  const [codeSecret, setCodeSecret] = useState('');
  const [lotInfo, setLotInfo] = useState<LotInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'cacao' | 'cafe'>('cacao');
  
  // États pour le formulaire CACAO
  const [cacaoData, setCacaoData] = useState<CacaoData>({
    // Formation générale
    poidsDeclaration: '',
    poidsEchantillon: '300',
    poidsTotalEchantillon: '2000',
    
    // Première partie - Tableau des analyses
    fevesEntieres: '',
    fevesPlates: '',
    poidsDechet: '',
    poidsFevesPlates: '',
    poidsFevesEntieres: '',
    
    // Épreuve à la loupe
    poidsBrisures: '',
    poidsEtrangeres: '',
    poidsFevesBrisees: '',
    poidsCoques: '',
    poidsCrabot: '',
    totalLoupe: '',
    totalLoupeEquivalent: '',
    
    // Détermination du grainage
    totalFevesEntieres: '',
    grainage: '',
    poidsNombreFevesEntieres: '',
    
    // Taux d'humidité (3 lectures)
    lectureHumidite1: '',
    lectureHumidite2: '',
    lectureHumidite3: '',
    totalHumidite: '',
    tauxHumiditePourcentage: '',
    
    // Norme et classification
    normeIvoirienne: '',
    normeInternationale: '',
    conforme: false,
    remarque: '',
    
    // Épreuve à la coupe - Défauts (plateaux 1, 2, 3)
    moisiePlateau1: '',
    moisiePlateau2: '',
    moisiePlateau3: '',
    moisieTotal: '',
    moisiePourcentage: '',
    
    miteePlateau1: '',
    miteePlateau2: '',
    miteePlateau3: '',
    miteeTotal: '',
    miteePourcentage: '',
    
    ardoiseePlateau1: '',
    ardoiseePlateau2: '',
    ardoiseePlateau3: '',
    ardoiseeTotal: '',
    ardoiseePourcentage: '',
    
    platePlateau1: '',
    platePlateau2: '',
    platePlateau3: '',
    plateTotal: '',
    platePourcentage: '',
    
    germeePlateau1: '',
    germeePlateau2: '',
    germeePlateau3: '',
    germeeTotal: '',
    germeePourcentage: '',
    
    violettePlateau1: '',
    violettePlateau2: '',
    violettePlateau3: '',
    violetteTotal: '',
    violettePourcentage: '',
    
    // Nbre fèves pour défauts
    nbreFevesDefauts: '300'
  });
  
  // États pour le formulaire CAFÉ
  const [cafeData, setCafeData] = useState<CafeData>({
    tauxHumidite: '',
    normeClassification: '',
    tamis18_saisi: '',
    tamis16_saisi: '',
    tamis14_saisi: '',
    tamis12_saisi: '',
    tamis10_saisi: '',
    tamisbas_saisi: '',
    nbreDefaut: '',
    poidsDefaut: ''
  });
  
  // Fonction de calcul automatique : (valeur × 100) ÷ 3
  const calculerValeur = useCallback((valeur: string): string => {
    if (!valeur || isNaN(parseFloat(valeur))) return '';
    const resultat = (parseFloat(valeur) * 100) / 3;
    return resultat.toFixed(3);
  }, []);
  
  // Fonction pour calculer le pourcentage des défauts
  const calculerPourcentageDefaut = useCallback((total: string, nbreFeves: string): string => {
    if (!total || !nbreFeves || isNaN(parseFloat(total)) || isNaN(parseFloat(nbreFeves))) return '';
    const totalNum = parseFloat(total);
    const nbreFevesNum = parseFloat(nbreFeves);
    if (nbreFevesNum === 0) return '0.000';
    const pourcentage = (totalNum / nbreFevesNum) * 100;
    return pourcentage.toFixed(3);
  }, []);
  
  // Fonction pour calculer le poids des fèves entières
  const calculerPoidsFevesEntieres = useCallback((): string => {
    // Calcul: 300 - Total épreuve loupe (sans coques)
    const poidsBrisures = parseFloat(cacaoData.poidsBrisures) || 0;
    const poidsEtrangeres = parseFloat(cacaoData.poidsEtrangeres) || 0;
    const poidsFevesBrisees = parseFloat(cacaoData.poidsFevesBrisees) || 0;
    const poidsCrabot = parseFloat(cacaoData.poidsCrabot) || 0;
    
    const totalLoupe = poidsBrisures + poidsEtrangeres + poidsFevesBrisees + poidsCrabot;
    const poidsFevesEntieres = 300 - totalLoupe;
    
    return poidsFevesEntieres.toFixed(3);
  }, [cacaoData.poidsBrisures, cacaoData.poidsEtrangeres, cacaoData.poidsFevesBrisees, cacaoData.poidsCrabot]);
  
  // Fonction pour calculer le poids de nombre de fèves entières
  const calculerPoidsNombreFevesEntieres = useCallback((): string => {
    // Calcul: 300g - (Poids des brisures + Poids M. ETR + Poids des F. Brisées + Poids des Crabot)
    const poidsBrisures = parseFloat(cacaoData.poidsBrisures) || 0;
    const poidsEtrangeres = parseFloat(cacaoData.poidsEtrangeres) || 0;
    const poidsFevesBrisees = parseFloat(cacaoData.poidsFevesBrisees) || 0;
    const poidsCrabot = parseFloat(cacaoData.poidsCrabot) || 0;
    
    const total = poidsBrisures + poidsEtrangeres + poidsFevesBrisees + poidsCrabot;
    const poidsNombreFevesEntieres = 300 - total;
    
    return poidsNombreFevesEntieres.toFixed(3);
  }, [cacaoData.poidsBrisures, cacaoData.poidsEtrangeres, cacaoData.poidsFevesBrisees, cacaoData.poidsCrabot]);
  
  // Fonction pour calculer le total des fèves entières
  const calculerTotalFèvesEntieres = useCallback((): string => {
    // A (fèves entières) + Équivalent
    const A = parseFloat(cacaoData.fevesEntieres) || 0;
    const equivalent = parseFloat(cacaoData.totalLoupeEquivalent) || 0;
    
    const total = A + equivalent;
    return total.toFixed(3);
  }, [cacaoData.fevesEntieres, cacaoData.totalLoupeEquivalent]);
  
  // Fonction pour calculer le grainage
  const calculerGrainage = useCallback((): string => {
    const totalFeves = parseFloat(calculerTotalFèvesEntieres()) || 0;
    const grainage = (totalFeves * 100) / 300;
    return grainage.toFixed(3);
  }, [calculerTotalFèvesEntieres]);
  
  // Fonction pour calculer le total humidité
  const calculerTotalHumidite = useCallback((): string => {
    const l1 = parseFloat(cacaoData.lectureHumidite1) || 0;
    const l2 = parseFloat(cacaoData.lectureHumidite2) || 0;
    const l3 = parseFloat(cacaoData.lectureHumidite3) || 0;
    return (l1 + l2 + l3).toFixed(3);
  }, [cacaoData.lectureHumidite1, cacaoData.lectureHumidite2, cacaoData.lectureHumidite3]);
  
  // Fonction pour calculer la moyenne d'humidité
  const calculerMoyenneHumidite = useCallback((): string => {
    const total = parseFloat(calculerTotalHumidite()) || 0;
    const moyenne = total / 3;
    return moyenne.toFixed(3);
  }, [calculerTotalHumidite]);
  
  // Fonction pour calculer le pourcentage de déchet
  const calculerPourcentageDechet = useCallback((): string => {
    const poidsDechet = parseFloat(cacaoData.poidsDechet) || 0;
    const poidsDeclaration = parseFloat(cacaoData.poidsDeclaration) || 0;
    
    if (poidsDeclaration === 0) return '0.000';
    const pourcentage = (poidsDechet * 100) / poidsDeclaration;
    return pourcentage.toFixed(3);
  }, [cacaoData.poidsDechet, cacaoData.poidsDeclaration]);
  
  // Fonction pour calculer le pourcentage des brisures
  const calculerPourcentageBrisures = useCallback((): string => {
    const poidsBrisures = parseFloat(cacaoData.poidsBrisures) || 0;
    const pourcentage = (poidsBrisures * 100) / 300;
    return pourcentage.toFixed(3);
  }, [cacaoData.poidsBrisures]);
  
  // Fonction pour calculer le pourcentage des matières étrangères
  const calculerPourcentageEtrangeres = useCallback((): string => {
    const poidsEtrangeres = parseFloat(cacaoData.poidsEtrangeres) || 0;
    const pourcentage = (poidsEtrangeres * 100) / 300;
    return pourcentage.toFixed(3);
  }, [cacaoData.poidsEtrangeres]);
  
  // Fonction pour calculer le pourcentage des fèves brisées
  const calculerPourcentageFevesBrisees = useCallback((): string => {
    const poidsFevesBrisees = parseFloat(cacaoData.poidsFevesBrisees) || 0;
    const pourcentage = (poidsFevesBrisees * 100) / 300;
    return pourcentage.toFixed(3);
  }, [cacaoData.poidsFevesBrisees]);
  
  // Fonction pour calculer le pourcentage des crabot
  const calculerPourcentageCrabot = useCallback((): string => {
    const poidsCrabot = parseFloat(cacaoData.poidsCrabot) || 0;
    const pourcentage = (poidsCrabot * 100) / 300;
    return pourcentage.toFixed(3);
  }, [cacaoData.poidsCrabot]);
  
  // Fonction pour calculer la classification automatique
  const calculerClassification = useCallback(() => {
    // Récupérer les pourcentages des défauts
    const moisiePourc = parseFloat(calculerPourcentageDefaut(
      (parseFloat(cacaoData.moisiePlateau1 || '0') + parseFloat(cacaoData.moisiePlateau2 || '0') + parseFloat(cacaoData.moisiePlateau3 || '0')).toString(),
      cacaoData.nbreFevesDefauts
    )) || 0;
    
    const ardoiseePourc = parseFloat(calculerPourcentageDefaut(
      (parseFloat(cacaoData.ardoiseePlateau1 || '0') + parseFloat(cacaoData.ardoiseePlateau2 || '0') + parseFloat(cacaoData.ardoiseePlateau3 || '0')).toString(),
      cacaoData.nbreFevesDefauts
    )) || 0;
    
    const germeePourc = parseFloat(calculerPourcentageDefaut(
      (parseFloat(cacaoData.germeePlateau1 || '0') + parseFloat(cacaoData.germeePlateau2 || '0') + parseFloat(cacaoData.germeePlateau3 || '0')).toString(),
      cacaoData.nbreFevesDefauts
    )) || 0;
    
    const platePourc = parseFloat(calculerPourcentageDefaut(
      (parseFloat(cacaoData.platePlateau1 || '0') + parseFloat(cacaoData.platePlateau2 || '0') + parseFloat(cacaoData.platePlateau3 || '0')).toString(),
      cacaoData.nbreFevesDefauts
    )) || 0;
    
    const miteePourc = parseFloat(calculerPourcentageDefaut(
      (parseFloat(cacaoData.miteePlateau1 || '0') + parseFloat(cacaoData.miteePlateau2 || '0') + parseFloat(cacaoData.miteePlateau3 || '0')).toString(),
      cacaoData.nbreFevesDefauts
    )) || 0;
    
    const defectueusesPourc = germeePourc + platePourc + miteePourc;
    
    // Calcul norme ivoirienne
    let normeIvoirienne = '';
    if (moisiePourc <= 3 && ardoiseePourc <= 3 && defectueusesPourc <= 3) {
      normeIvoirienne = 'G1';
    } else if (moisiePourc <= 4 && ardoiseePourc <= 8 && defectueusesPourc <= 6) {
      normeIvoirienne = 'G2';
    } else {
      normeIvoirienne = 'SG (Sous Grade)';
    }
    
    // Calcul norme internationale (FCC)
    let normeInternationale = '';
    const defectueusesFCC = moisiePourc + miteePourc;
    
    if (defectueusesFCC <= 5 && ardoiseePourc <= 5) {
      normeInternationale = 'GF (Good Fermented)';
    } else if (defectueusesFCC <= 10 && ardoiseePourc <= 10) {
      normeInternationale = 'FF (Fair Fermented)';
    } else {
      normeInternationale = 'FAQ (Fair Average Quality)';
    }
    
    // Déterminer si conforme (par défaut on considère conforme si G1 ou GF)
    const conforme = normeIvoirienne === 'G1' || normeInternationale === 'GF (Good Fermented)';
    
    return { normeIvoirienne, normeInternationale, conforme };
  }, [
    cacaoData.moisiePlateau1, cacaoData.moisiePlateau2, cacaoData.moisiePlateau3,
    cacaoData.ardoiseePlateau1, cacaoData.ardoiseePlateau2, cacaoData.ardoiseePlateau3,
    cacaoData.germeePlateau1, cacaoData.germeePlateau2, cacaoData.germeePlateau3,
    cacaoData.platePlateau1, cacaoData.platePlateau2, cacaoData.platePlateau3,
    cacaoData.miteePlateau1, cacaoData.miteePlateau2, cacaoData.miteePlateau3,
    cacaoData.nbreFevesDefauts,
    calculerPourcentageDefaut
  ]);

  // Mettre à jour la classification automatiquement
  useEffect(() => {
    const classification = calculerClassification();
    
    // Vérifier si les valeurs ont changé avant de mettre à jour l'état
    if (classification.normeIvoirienne !== cacaoData.normeIvoirienne ||
        classification.normeInternationale !== cacaoData.normeInternationale ||
        classification.conforme !== cacaoData.conforme) {
      setCacaoData(prev => ({
        ...prev,
        normeIvoirienne: classification.normeIvoirienne,
        normeInternationale: classification.normeInternationale,
        conforme: classification.conforme
      }));
    }
  }, [calculerClassification, cacaoData.normeIvoirienne, cacaoData.normeInternationale, cacaoData.conforme]);
  
  // Gestionnaires optimisés avec useCallback
  const handleCacaoChange = useCallback((field: keyof CacaoData, value: string) => {
    setCacaoData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  const handleCafeChange = useCallback((field: keyof CafeData, value: string) => {
    setCafeData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  // Charger les informations du lot
  const chargerLot = async () => {
    if (!codeSecret.trim()) {
      setError('Veuillez entrer un code secret');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(`http://localhost:5000/api/codes-secrets/valider/${codeSecret}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Code secret invalide');
      }
      
      const data = await response.json();
      setLotInfo(data);
      
      // Définir l'onglet actif selon le produit
      if (data.ID_PRODUIT === 'KKO') {
        setActiveTab('cacao');
      } else if (data.ID_PRODUIT === 'KFE') {
        setActiveTab('cafe');
      }
      
      setSuccess(`Échantillon chargé avec succès`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
      setLotInfo(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Enregistrer l'analyse CACAO
  const enregistrerAnalyseCacao = async () => {
    if (!lotInfo) {
      setError('Aucun lot chargé');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const classification = calculerClassification();
      
      // Calculer le total loupe (sans coques)
      const poidsBrisures = parseFloat(cacaoData.poidsBrisures) || 0;
      const poidsEtrangeres = parseFloat(cacaoData.poidsEtrangeres) || 0;
      const poidsFevesBrisees = parseFloat(cacaoData.poidsFevesBrisees) || 0;
      const poidsCrabot = parseFloat(cacaoData.poidsCrabot) || 0;
      const totalLoupe = (poidsBrisures + poidsEtrangeres + poidsFevesBrisees + poidsCrabot).toFixed(3);
      
      // Calculer le poids des fèves entières
      const poidsFevesEntieresCalcul = (300 - parseFloat(totalLoupe)).toFixed(3);
      
      // Calculer le poids de nombre de fèves entières
      const poidsNombreFevesEntieresCalcul = calculerPoidsNombreFevesEntieres();
      
      // Calculer le total des fèves entières
      const totalFevesEntieresCalcul = calculerTotalFèvesEntieres();
      
      // Calculer le grainage
      const grainageCalcul = calculerGrainage();
      
      // Calculer le total humidité
      const totalHumiditeCalcul = calculerTotalHumidite();
      
      // Calculer la moyenne humidité
      const moyenneHumiditeCalcul = calculerMoyenneHumidite();
      
      const response = await fetch('http://localhost:5000/api/analyses/cacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idCodification: lotInfo.ID_CODIFICATION,
          
          // Formation générale
          poidsDeclaration: cacaoData.poidsDeclaration,
          poidsEchantillon: cacaoData.poidsEchantillon,
          poidsTotalEchantillon: cacaoData.poidsTotalEchantillon,
          
          // Première partie - Tableau des analyses
          fevesEntieres: cacaoData.fevesEntieres,
          fevesPlates: cacaoData.fevesPlates,
          poidsDechet: cacaoData.poidsDechet,
          poidsFevesPlates: cacaoData.poidsFevesPlates,
          poidsFevesEntieres: poidsFevesEntieresCalcul,
          
          // Épreuve à la loupe
          poidsBrisures: cacaoData.poidsBrisures,
          poidsEtrangeres: cacaoData.poidsEtrangeres,
          poidsFevesBrisees: cacaoData.poidsFevesBrisees,
          poidsCoques: '0', // Toujours 0 comme dans vos données
          poidsCrabot: cacaoData.poidsCrabot,
          
          // Détermination du grainage
          totalFevesEntieres: totalFevesEntieresCalcul,
          grainage: grainageCalcul,
          poidsNombreFevesEntieres: poidsNombreFevesEntieresCalcul,
          
          // Taux d'humidité
          lectureHumidite1: cacaoData.lectureHumidite1,
          lectureHumidite2: cacaoData.lectureHumidite2,
          lectureHumidite3: cacaoData.lectureHumidite3,
          tauxHumiditePourcentage: moyenneHumiditeCalcul,
          
          // Classification
          normeIvoirienne: classification.normeIvoirienne,
          normeInternationale: classification.normeInternationale,
          conforme: classification.conforme,
          remarque: cacaoData.remarque,
          
          // Défauts
          moisiePlateau1: cacaoData.moisiePlateau1,
          moisiePlateau2: cacaoData.moisiePlateau2,
          moisiePlateau3: cacaoData.moisiePlateau3,
          
          miteePlateau1: cacaoData.miteePlateau1,
          miteePlateau2: cacaoData.miteePlateau2,
          miteePlateau3: cacaoData.miteePlateau3,
          
          ardoiseePlateau1: cacaoData.ardoiseePlateau1,
          ardoiseePlateau2: cacaoData.ardoiseePlateau2,
          ardoiseePlateau3: cacaoData.ardoiseePlateau3,
          
          platePlateau1: cacaoData.platePlateau1,
          platePlateau2: cacaoData.platePlateau2,
          platePlateau3: cacaoData.platePlateau3,
          
          germeePlateau1: cacaoData.germeePlateau1,
          germeePlateau2: cacaoData.germeePlateau2,
          germeePlateau3: cacaoData.germeePlateau3,
          
          violettePlateau1: cacaoData.violettePlateau1,
          violettePlateau2: cacaoData.violettePlateau2,
          violettePlateau3: cacaoData.violettePlateau3,
          
          nbreFevesDefauts: cacaoData.nbreFevesDefauts,
          
          analyseurId: 7
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'enregistrement');
      }
      
      const result = await response.json();
      setSuccess(`Analyse cacao enregistrée avec succès ! (ID: ${result.idAnalyse})`);
      
      // Réinitialiser le formulaire
      setCacaoData({
        poidsDeclaration: '',
        poidsEchantillon: '300',
        poidsTotalEchantillon: '2000',
        fevesEntieres: '',
        fevesPlates: '',
        poidsDechet: '',
        poidsFevesPlates: '',
        poidsFevesEntieres: '',
        poidsBrisures: '',
        poidsEtrangeres: '',
        poidsFevesBrisees: '',
        poidsCoques: '',
        poidsCrabot: '',
        totalLoupe: '',
        totalLoupeEquivalent: '',
        totalFevesEntieres: '',
        grainage: '',
        poidsNombreFevesEntieres: '',
        lectureHumidite1: '',
        lectureHumidite2: '',
        lectureHumidite3: '',
        totalHumidite: '',
        tauxHumiditePourcentage: '',
        normeIvoirienne: '',
        normeInternationale: '',
        conforme: false,
        remarque: '',
        moisiePlateau1: '',
        moisiePlateau2: '',
        moisiePlateau3: '',
        moisieTotal: '',
        moisiePourcentage: '',
        miteePlateau1: '',
        miteePlateau2: '',
        miteePlateau3: '',
        miteeTotal: '',
        miteePourcentage: '',
        ardoiseePlateau1: '',
        ardoiseePlateau2: '',
        ardoiseePlateau3: '',
        ardoiseeTotal: '',
        ardoiseePourcentage: '',
        platePlateau1: '',
        platePlateau2: '',
        platePlateau3: '',
        plateTotal: '',
        platePourcentage: '',
        germeePlateau1: '',
        germeePlateau2: '',
        germeePlateau3: '',
        germeeTotal: '',
        germeePourcentage: '',
        violettePlateau1: '',
        violettePlateau2: '',
        violettePlateau3: '',
        violetteTotal: '',
        violettePourcentage: '',
        nbreFevesDefauts: '300'
      });
      setCodeSecret('');
      setLotInfo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };
  
  // Enregistrer l'analyse CAFÉ
  const enregistrerAnalyseCafe = async () => {
    if (!lotInfo) {
      setError('Aucun lot chargé');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('http://localhost:5000/api/analyses/cafe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idCodification: lotInfo.ID_CODIFICATION,
          ...cafeData,
          analyseurId: 7
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'enregistrement');
      }
      
      setSuccess('Analyse café enregistrée avec succès !');
      
      // Réinitialiser le formulaire
      setCafeData({
        tauxHumidite: '',
        normeClassification: '',
        tamis18_saisi: '',
        tamis16_saisi: '',
        tamis14_saisi: '',
        tamis12_saisi: '',
        tamis10_saisi: '',
        tamisbas_saisi: '',
        nbreDefaut: '',
        poidsDefaut: ''
      });
      setCodeSecret('');
      setLotInfo(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };
  
  // Gérer la touche Entrée pour éviter la soumission du formulaire
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
        e.preventDefault();
      }
    };
    
    document.addEventListener('keydown', handleGlobalKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);
  
  // Gérer la touche Entrée dans le champ code secret
  const handleCodeSecretKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading && !lotInfo) {
      e.preventDefault();
      chargerLot();
    }
  }, [loading, lotInfo]);
  
  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="bg-[#0d2d53] text-white rounded-t-xl p-6 flex items-center shadow-lg">
        <MicroscopeIcon className="h-10 w-10 mr-4" />
        <div>
          <h2 className="text-3xl font-bold">Analyses en Laboratoire</h2>
          <p className="text-blue-200">Saisie des résultats d'analyse pour les échantillons codifiés</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-b-xl shadow-lg border space-y-6">
        {/* Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}
        
        {/* Saisie du code secret */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-5 rounded-xl border-2 border-gray-300 shadow-sm">
          <div className="flex items-center gap-4">
            <KeyIcon className="h-7 w-7 text-gray-700" />
            <label htmlFor="code-secret" className="text-lg font-bold text-gray-800">Code Secret :</label>
            <input 
              id="code-secret" 
              type="text" 
              value={codeSecret}
              onChange={(e) => setCodeSecret(e.target.value.toUpperCase())}
              onKeyDown={handleCodeSecretKeyDown}
              disabled={loading || !!lotInfo}
              className="form-input font-mono text-xl uppercase tracking-widest flex-grow disabled:bg-gray-200" 
              placeholder="Entrez le code secret..." 
            />
            <button 
              onClick={chargerLot}
              disabled={loading || !!lotInfo}
              className="bg-[#0d2d53] hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SearchIcon className="h-5 w-5" />
              <span>{loading ? 'Chargement...' : 'Charger'}</span>
            </button>
          </div>
        </div>
        
        {/* Informations du lot - Version simplifiée */}
        {lotInfo && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
            <h3 className="font-bold text-lg text-blue-900 mb-3 flex items-center">
              <CheckCircleIcon className="h-6 w-6 mr-2 text-green-600" />
              Échantillon Chargé
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Code Secret:</span>
                <p className="font-mono font-bold text-lg">{lotInfo.CODE_SECRET_CODIFICATION}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Produit:</span>
                <p className="font-bold">{lotInfo.LIBELLE_PRODUIT}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setLotInfo(null);
                setCodeSecret('');
                setError('');
                setSuccess('');
              }}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Charger un autre échantillon
            </button>
          </div>
        )}

        {/* Formulaires d'analyse */}
        {lotInfo && (
          <>
            <div>
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                  <button 
                    onClick={() => setActiveTab('cacao')} 
                    disabled={lotInfo.ID_PRODUIT !== 'KKO'}
                    className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-lg flex items-center gap-2 transition-colors ${
                      activeTab === 'cacao' && lotInfo.ID_PRODUIT === 'KKO'
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <CacaoIcon className={`h-6 w-6 ${activeTab === 'cacao' && lotInfo.ID_PRODUIT === 'KKO' ? 'text-blue-600' : 'text-gray-300'}`} />
                    Analyse Cacao {lotInfo.ID_PRODUIT !== 'KKO' && '(Indisponible)'}
                  </button>
                  <button 
                    onClick={() => setActiveTab('cafe')} 
                    disabled={lotInfo.ID_PRODUIT !== 'KFE'}
                    className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-lg flex items-center gap-2 transition-colors ${
                      activeTab === 'cafe' && lotInfo.ID_PRODUIT === 'KFE'
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <CafeIcon className={`h-6 w-6 ${activeTab === 'cafe' && lotInfo.ID_PRODUIT === 'KFE' ? 'text-blue-600' : 'text-gray-300'}`} />
                    Analyse Café {lotInfo.ID_PRODUIT !== 'KFE' && '(Indisponible)'}
                  </button>
                </nav>
              </div>
              <div className="pt-6">
                {activeTab === 'cacao' && lotInfo.ID_PRODUIT === 'KKO' && (
                  <CacaoForm 
                    cacaoData={cacaoData}
                    onCacaoChange={handleCacaoChange}
                    calculerValeur={calculerValeur}
                    calculerPourcentageDefaut={calculerPourcentageDefaut}
                    calculerPoidsFevesEntieres={calculerPoidsFevesEntieres}
                    calculerTotalFèvesEntieres={calculerTotalFèvesEntieres}
                    calculerGrainage={calculerGrainage}
                    calculerMoyenneHumidite={calculerMoyenneHumidite}
                    calculerTotalHumidite={calculerTotalHumidite}
                    calculerPourcentageDechet={calculerPourcentageDechet}
                    calculerPourcentageBrisures={calculerPourcentageBrisures}
                    calculerPourcentageEtrangeres={calculerPourcentageEtrangeres}
                    calculerPourcentageFevesBrisees={calculerPourcentageFevesBrisees}
                    calculerPourcentageCrabot={calculerPourcentageCrabot}
                    calculerPoidsNombreFevesEntieres={calculerPoidsNombreFevesEntieres}
                  />
                )}
                {activeTab === 'cafe' && lotInfo.ID_PRODUIT === 'KFE' && (
                  <CafeForm 
                    cafeData={cafeData}
                    onCafeChange={handleCafeChange}
                    calculerValeur={calculerValeur}
                  />
                )}
              </div>
            </div>
            
            {/* Bouton d'enregistrement */}
            <div className="flex justify-end pt-6 border-t">
              <button 
                onClick={activeTab === 'cacao' ? enregistrerAnalyseCacao : enregistrerAnalyseCafe}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <SaveIcon className="h-5 w-5"/>
                {loading ? 'Enregistrement...' : 'Enregistrer les Résultats'}
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Bouton retour */}
      <div className="mt-8">
        <button 
          onClick={onNavigateBack} 
          className="flex items-center space-x-2 bg-[#0d2d53] hover:bg-blue-800 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-colors"
        >
          <BackArrowIcon className="h-5 w-5" />
          <span>Retour</span>
        </button>
      </div>

      <style>{`
        .form-input, .form-select, .form-textarea {
          padding: 0.5rem 0.75rem; 
          border: 1px solid #d1d5db; 
          border-radius: 0.375rem;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none; 
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgb(59 130 246 / 0.25);
        }
        .form-input:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
        }
        .form-input[readonly] {
          background-color: #f9fafb;
          color: #6b7280;
        }
        .form-checkbox {
          border-radius: 0.25rem;
        }
        /* Empêcher le zoom sur iOS */
        @media screen and (max-width: 768px) {
          input, select, textarea {
            font-size: 16px !important;
          }
        }
        /* Empêcher le comportement de soumission automatique */
        form {
          margin: 0;
          padding: 0;
        }
        input, select {
          margin: 0;
        }
        /* Correction du problème d'arrondi */
        input[type="number"] {
          -moz-appearance: textfield;
        }
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default AnalysesLaboratoire;