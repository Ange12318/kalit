
import React from 'react';
import API_BASE_URL from '../config';  // adapte le chemin


interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  badgeText?: string;
  disabled?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onClick, badgeText, disabled }) => {
  const base = 'relative bg-white rounded-xl shadow-md p-6 text-center flex flex-col items-center justify-center space-y-3 transition-all duration-300 border border-gray-100';
  const interactive = !disabled ? 'hover:shadow-xl hover:scale-105' : '';
  const cursor = !disabled && onClick ? 'cursor-pointer' : '';

  return (
    <div className={`${base} ${interactive} ${cursor}`} onClick={!disabled ? onClick : undefined}>
      {badgeText && (
        <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
          {badgeText}
        </div>
      )}

      <div className="mb-2">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>

      {disabled && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-xl flex items-center justify-center">
          <span className="text-sm text-gray-500">Accès restreint</span>
        </div>
      )}
    </div>
  );
};

export default FeatureCard;
