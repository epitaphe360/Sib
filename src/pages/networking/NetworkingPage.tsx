import React from 'react';
import { MatchmakingDashboard } from '../../components/networking/MatchmakingDashboard';

export const NetworkingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MatchmakingDashboard />
    </div>
  );
};
