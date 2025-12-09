import React, { useState, useEffect } from 'react';
import {
  BackArrowIcon,
  GearIcon,
  InformationCircleIcon,
  KeyIcon,
  PlusIcon,
  ValidationIcon,
  RefreshIcon
} from './Icons';

interface InitialisationCodeJourProps {
  onNavigateBack: () => void;
}

const InitialisationCodeJour: React.FC<InitialisationCodeJourProps> = ({ onNavigateBack }) => {
  const [currentCode, setCurrentCode] = useState<string>('0');
  const [initializationDate, setInitializationDate] = useState<string>('');
  const [initializedBy, setInitializedBy] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [lotsCodifiedCount, setLotsCodifiedCount] = useState<number>(0);

  // Récupérer le nombre réel de lots codifiés aujourd'hui
  useEffect(() => {
    const fetchLotsCodifiedCount = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/lots/codified/count-today');
    const data = await response.json();
    setLotsCodifiedCount(data.count || 0);
  } catch (error) {
    console.error('Erreur lors de la récupération du nombre de codes générés:', error);
    setLotsCodifiedCount(0);
  }
};

    if (isActive) {
      fetchLotsCodifiedCount();
      // Mettre à jour toutes les 30 secondes pour avoir les données fraîches
      const interval = setInterval(fetchLotsCodifiedCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  // Vérifier si le code est toujours valide (24h)
  useEffect(() => {
    const checkCodeValidity = () => {
      if (initializationDate) {
        const initDate = new Date(initializationDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - initDate.getTime());
        const diffHours = diffTime / (1000 * 60 * 60);
        
        if (diffHours >= 24) {
          // Le code a expiré après 24h
          setIsActive(false);
          setCurrentCode('0');
          setInitializationDate('');
          setInitializedBy('');
          setLotsCodifiedCount(0);
        }
      }
    };

    checkCodeValidity();
    const interval = setInterval(checkCodeValidity, 60000); // Vérifier toutes les minutes
    return () => clearInterval(interval);
  }, [initializationDate]);

  const handleInitializeCode = async () => {
    const today = new Date();
    const formattedDate = today.toISOString();
    
    try {
      const response = await fetch('http://localhost:5000/api/code-jour/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateInitialisation: formattedDate,
          initialisePar: 'Utilisateur'
        })
      });

      if (response.ok) {
        setCurrentCode('0');
        setInitializationDate(formattedDate);
        setInitializedBy('Utilisateur');
        setIsActive(true);
        setLotsCodifiedCount(0);
      } else {
        alert('Erreur lors de l\'initialisation du code du jour');
      }
    } catch (error) {
      console.error('Erreur initialisation:', error);
      alert('Erreur réseau lors de l\'initialisation');
    }
  };

  const handleReset = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/code-jour/reset', {
        method: 'POST'
      });

      if (response.ok) {
        setCurrentCode('0');
        setInitializationDate('');
        setInitializedBy('');
        setIsActive(false);
        setLotsCodifiedCount(0);
      } else {
        alert('Erreur lors de la réinitialisation du code du jour');
      }
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
      alert('Erreur réseau lors de la réinitialisation');
    }
  };

  // Calculer le code actuel basé sur le nombre de lots codifiés
  const displayCode = isActive ? lotsCodifiedCount.toString() : currentCode;

  // Formater la date pour l'affichage
  const displayDate = initializationDate 
    ? new Date(initializationDate).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A';

  return (
    <div className="p-6 lg:p-10 space-y-8">
      {/* Header */}
      <div className="bg-[#0d2d53] text-white rounded-t-xl p-6 flex items-center shadow-lg">
        <GearIcon className="h-10 w-10 mr-4" />
        <div>
          <h2 className="text-3xl font-bold">Initialisation du Code du Jour</h2>
          <p className="text-blue-200">Système automatique de codification quotidienne</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-b-xl shadow-lg border space-y-8">
        {/* Information Box */}
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg" role="alert">
          <div className="flex">
            <div className="py-1"><InformationCircleIcon className="h-6 w-6 text-blue-500 mr-4"/></div>
            <div>
              <p className="font-bold">Système Automatique</p>
              <p className="text-sm">
                Le code du jour démarre à 0 et s'incrémente automatiquement à chaque lot codifié dans le module "Lots à Codifier". 
                Le code est valable 24 heures. Le compteur se met à jour en temps réel.
              </p>
            </div>
          </div>
        </div>

        {/* Current Code Section */}
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <KeyIcon className="h-5 w-5 mr-2 text-gray-600"/>
            Code du Jour Actuel
          </h3>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-6 min-h-[100px] flex items-center justify-center bg-gray-50">
            {isActive ? (
              <div className="text-center">
                <span className="text-4xl font-mono font-bold tracking-widest text-gray-800 block">
                  {displayCode}
                </span>
                <p className="text-sm text-gray-600 mt-2">
                  {lotsCodifiedCount} lot(s) codifié(s) aujourd'hui
                </p>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-xl font-semibold text-gray-400 block">
                  Aucun code actif
                </span>
                <p className="text-sm text-gray-500 mt-2">
                  Initialisez le code pour commencer
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs font-semibold text-gray-500 uppercase">DÉBUT D'ACTIVITÉ</p>
              <p className="text-sm font-bold text-gray-800">{displayDate}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs font-semibold text-gray-500 uppercase">INITIALISÉ PAR</p>
              <p className="text-sm font-bold text-gray-800">{initializedBy || 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs font-semibold text-gray-500 uppercase">STATUT</p>
              {isActive ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <ValidationIcon className="h-4 w-4 mr-1.5"/>
                  Actif (24h)
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  Inactif
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Initialize Code Section - Simplifiée */}
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <PlusIcon className="h-5 w-5 mr-2 text-gray-600"/>
            GESTION DU CODE
          </h3>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center text-yellow-800">
              <InformationCircleIcon className="h-5 w-5 mr-2" />
              <span className="font-semibold">Code automatique : </span>
              <span className="ml-2">Démarre à 0 et s'incrémente avec chaque lot codifié</span>
            </div>
          </div>

          <div className="flex justify-center flex-wrap gap-4">
            {!isActive ? (
              <button 
                onClick={handleInitializeCode} 
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors flex items-center gap-2"
              >
                <ValidationIcon className="h-5 w-5"/>
                <span>Activer le Code du Jour</span>
              </button>
            ) : (
              <button 
                onClick={handleReset} 
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors flex items-center gap-2"
              >
                <RefreshIcon className="h-5 w-5"/>
                <span>Réinitialiser le Code</span>
              </button>
            )}
          </div>

          {isActive && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-center text-green-800">
                <InformationCircleIcon className="h-5 w-5 mr-2" />
                <span className="font-semibold">
                  Code actif • Prochain lot codifié : {parseInt(displayCode) + 1}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Back Button */}
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

export default InitialisationCodeJour;