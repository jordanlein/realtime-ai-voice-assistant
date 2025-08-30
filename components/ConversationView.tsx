import React, { useEffect, useRef } from 'react';
import { ConversationStatus, TranscriptEntry } from '../types';
import { MicIcon, StopIcon } from './Icons';

interface ConversationViewProps {
  status: ConversationStatus;
  transcript: TranscriptEntry[];
  onStart: () => void;
  onStop: () => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({ status, transcript, onStart, onStop }) => {
  const isBroadcasting = status === 'active' || status === 'connecting';
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to the bottom of the transcript view when new entries are added
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
    }
  }, [transcript]);

  const buttonText = {
    idle: "Start Conversation",
    connecting: "Connecting...",
    active: "Stop Conversation",
    stopping: "Stopping..."
  };

  const buttonAction = isBroadcasting ? onStop : onStart;
  const buttonDisabled = status === 'connecting' || status === 'stopping';

  const getPlaceholderText = () => {
    if (status === 'active') return 'Listening...';
    return 'Press "Start" to begin the conversation.';
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-gray-800 rounded-2xl shadow-2xl p-6 flex flex-col items-center space-y-6">
      <div
        ref={transcriptContainerRef}
        className="w-full h-56 bg-gray-900/70 rounded-xl p-4 space-y-4 overflow-y-auto scroll-smooth border border-gray-700"
        aria-live="polite"
      >
        {transcript.length > 0 ? (
          transcript.map((entry, index) => (
            <div key={index} className="animate-fade-in">
              <p className={entry.speaker === 'user' ? 'text-blue-300' : 'text-teal-200'}>
                <span className="font-bold capitalize">{entry.speaker}:</span> {entry.text}
              </p>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 italic">{getPlaceholderText()}</p>
          </div>
        )}
      </div>

      <button
        onClick={buttonAction}
        disabled={buttonDisabled}
        className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-800
          ${isBroadcasting ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400' : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400'}
          ${buttonDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span className="sr-only">{buttonText[status]}</span>
        {status === 'connecting' ? (
          <div className="w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
        ) : isBroadcasting ? (
          <StopIcon className="w-10 h-10" />
        ) : (
          <MicIcon className="w-10 h-10" />
        )}
        {status === 'active' && (
            <span className="absolute h-full w-full rounded-full bg-red-500 animate-ping opacity-75"></span>
        )}
      </button>

      <p className="text-sm text-gray-400 h-4">{buttonDisabled ? buttonText[status] : ''}</p>
    </div>
  );
};

export default ConversationView;