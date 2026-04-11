import React from 'react';
import { useParams } from 'react-router-dom';
import { SpeedNetworking } from '../../components/networking/SpeedNetworking';

export const SpeedNetworkingPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Session ID manquant</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SpeedNetworking sessionId={sessionId} />
    </div>
  );
};

export default SpeedNetworkingPage;
