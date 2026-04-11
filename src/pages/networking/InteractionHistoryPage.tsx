import React from 'react';
import { InteractionHistory } from '../../components/networking/InteractionHistory';

export const InteractionHistoryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <InteractionHistory />
    </div>
  );
};

export default InteractionHistoryPage;
