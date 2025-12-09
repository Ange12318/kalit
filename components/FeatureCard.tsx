
import React from 'react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  badgeText?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, onClick, badgeText }) => {
  const cardClasses = `relative bg-white rounded-xl shadow-md p-6 text-center flex flex-col items-center justify-center space-y-3 hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 ${onClick ? 'cursor-pointer' : ''}`;
  
  return (
    <div className={cardClasses} onClick={onClick}>
       {badgeText && (
        <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
          {badgeText}
        </div>
      )}
      <div className="mb-2">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};

export default FeatureCard;
