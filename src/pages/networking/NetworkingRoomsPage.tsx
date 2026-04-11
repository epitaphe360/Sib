import React from 'react';
import { useParams } from 'react-router-dom';
import { NetworkingRooms } from '../../components/networking/NetworkingRooms';

export const NetworkingRoomsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();

  return (
    <div className="min-h-screen bg-gray-50">
      <NetworkingRooms eventId={eventId || 'default'} />
    </div>
  );
};

export default NetworkingRoomsPage;
