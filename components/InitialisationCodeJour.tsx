import React, { useState, useEffect } from 'react';
import {
  BackArrowIcon,
  GearIcon,
  InformationCircleIcon,
  KeyIcon,
  PlusIcon,
  ValidationIcon,
  RefreshIcon,
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
  const [loading, setLoading] = useState<boolean>(false);

  // Charger l'état initial du code du jour
  useEffect(() => {
    const fetchCodeJourState = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/code-jour/current');
        const data = await response.json();
        
        if (data.statut === 'ACTIF') {
          setCurrentCode(data.codeJour.toString());
          setInitializationDate(data.dateInitialisation);
          setInitializedBy(data.initialisePar);
          setIsActive(true);
          
          // Récupérer le nombre de lots codifiés aujourd'hui
          const countResponse = await fetch('http://localhost:5000/api/lots/codified/count-today');
          const countData = await countResponse.json();
          setLotsCodifiedCount(countData.count || 0);
        } else {
          setIsActive(false);
          setCurrentCode('0');
          setLotsCodifiedCount(0);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du code du jour:', error);
        setIsActive(false);
        setLotsCodifiedCount(0);
      }
      setLoading(false);
    };

    fetchCodeJourState();
  }, []);

  // Mettre à jour le compteur toutes les 30 secondes quand actif
  useEffect(() => {
    if (!isActive) return;

    const updateCounter = async () => {
      try {
        const countResponse = await fetch('http://localhost:5000/api/lots/codified/count-today');
        const countData = await countResponse.json();
        setLotsCodifiedCount(countData.count || 0);
        
        // Mettre à jour aussi le code du jour
        const codeResponse = await fetch('http://localhost:5000/api/code-jour/current');
        const codeData = await codeResponse.json();
        if (codeData.statut === 'ACTIF') {
          setCurrentCode(codeData.codeJour.toString());
        }
      } catch (error) {
        console.error('Erreur mise à jour compteur:', error);
      }
    };

    updateCounter();
    const interval = setInterval(updateCounter, 30000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Vérifier si le code a expiré (24h)
  useEffect(() => {
    const checkCodeValidity = () => {
      if (initializationDate && isActive) {
        const initDate = new Date(initializationDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - initDate.getTime());
        const diffHours = diffTime / (1000 * 60 * 60);
        
        if (diffHours >= 24) {
          // Le code a expiré après 24h
          handleReset();
        }
      }
    };

    checkCodeValidity();
    const interval = setInterval(checkCodeValidity, 60000); // Vérifier toutes les minutes
    return () => clearInterval(interval);
  }, [initializationDate, isActive]);

  const handleInitializeCode = async () => {
    setLoading(true);
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
        const data = await response.json();
        setCurrentCode('0');
        setInitializationDate(formattedDate);
        setInitializedBy('Utilisateur');
        setIsActive(true);
        setLotsCodifiedCount(0);
        alert('Code du jour initialisé avec succès');
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erreur initialisation:', error);
      alert('Erreur réseau lors de l\'initialisation');
    }
    setLoading(false);
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/code-jour/reset', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentCode('0');
        setInitializationDate('');
        setInitializedBy('');
        setIsActive(false);
        setLotsCodifiedCount(0);
        alert('Code du jour réinitialisé avec succès');
      } else {
        const errorData = await response.json();
        alert(`Erreur: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Erreur réinitialisation:', error);
      alert('Erreur réseau lors de la réinitialisation');
    }
    setLoading(false);
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

  // Calculer l'heure d'expiration
  const expirationTime = initializationDate 
    ? new Date(new Date(initializationDate).getTime() + (24 * 60 * 60 * 1000))
    : null;

  const displayExpiration = expirationTime 
    ? expirationTime.toLocaleDateString('fr-FR', {
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
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3">Chargement...</span>
              </div>
            ) : isActive ? (
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs font-semibold text-gray-500 uppercase">DÉBUT D'ACTIVITÉ</p>
              <p className="text-sm font-bold text-gray-800">{displayDate}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-xs font-semibold text-gray-500 uppercase">EXPIRATION</p>
              <p className="text-sm font-bold text-gray-800">{displayExpiration}</p>
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
        
        {/* Initialize Code Section */}
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
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors flex items-center gap-2"
              >
                <ValidationIcon className="h-5 w-5"/>
                <span>{loading ? 'Initialisation...' : 'Activer le Code du Jour'}</span>
              </button>
            ) : (
              <button 
                onClick={handleReset}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors flex items-center gap-2"
              >
                <RefreshIcon className="h-5 w-5"/>
                <span>{loading ? 'Réinitialisation...' : 'Réinitialiser le Code'}</span>
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
              <p className="text-sm text-green-600 text-center mt-2">
                Le code sera automatiquement réinitialisé dans 24 heures
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Back Button */}
      <div className="mt-8">
        <button 
          onClick={onNavigateBack} 
          disabled={loading}
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