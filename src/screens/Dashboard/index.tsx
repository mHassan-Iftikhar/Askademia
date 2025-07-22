import React from 'react';
import { WebSocketProvider, useWebSocket } from './WebSocketProvider';
import Chat from './Chat';
import AudioPlayer from './AudioPlayer';
import ScreenShare from './ScreenShare';

const DashboardContent: React.FC = () => {
  const { lastAudioData } = useWebSocket();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Chat />
            {lastAudioData && <AudioPlayer base64Audio={lastAudioData} />}
          </div>
          <div>
            <ScreenShare />
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <WebSocketProvider url="ws://localhost:8080/ws">
      <DashboardContent />
    </WebSocketProvider>
  );
};

export default Dashboard;