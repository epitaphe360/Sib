import React from 'react';
import { useParams } from 'react-router-dom';
import { SpeedNetworking } from '../../components/networking/SpeedNetworking';
import { useTranslation } from '../../hooks/useTranslation';

export const SpeedNetworkingPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { t } = useTranslation();

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">{t('networking.missing_session_id')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SpeedNetworking sessionId={sessionId} />
    </div>
  );
};

export default SpeedNetworkingPage;

