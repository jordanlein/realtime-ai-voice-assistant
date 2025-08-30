import React, { useState, useRef, useEffect } from 'react';
import { SavedConversation } from '../types';
import { PlayIcon, PauseIcon } from './Icons';

interface SavedConversationsProps {
  conversations: SavedConversation[];
}

const SavedConversations: React.FC<SavedConversationsProps> = ({ conversations }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [currentlyPlayingUrl, setCurrentlyPlayingUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const onEnd = () => setCurrentlyPlayingUrl(null);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('pause', onEnd);

    return () => {
        audio.removeEventListener('ended', onEnd);
        audio.removeEventListener('pause', onEnd);
    };
  }, []);

  const toggleConversation = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
    if (expandedId !== id && audioRef.current) {
        audioRef.current.pause();
    }
  };
  
  const togglePlayPause = (url: string) => {
    if (audioRef.current) {
        if (currentlyPlayingUrl === url) {
            audioRef.current.pause();
            setCurrentlyPlayingUrl(null);
        } else {
            audioRef.current.src = url;
            audioRef.current.play();
            setCurrentlyPlayingUrl(url);
        }
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-300">Conversation History</h2>
      <audio ref={audioRef} className="hidden" />
      {conversations.length === 0 ? (
        <p className="text-center text-gray-500">No saved conversations yet.</p>
      ) : (
        <div className="space-y-4">
          {conversations.map((convo) => {
            const isExpanded = expandedId === convo.id;
            const isUserPlaying = currentlyPlayingUrl === convo.userAudioUrl;
            const isAiPlaying = currentlyPlayingUrl === convo.assistantAudioUrl;

            return (
                <div key={convo.id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <button
                    onClick={() => toggleConversation(convo.id)}
                    className="w-full text-left p-4 flex justify-between items-center bg-gray-700 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-expanded={isExpanded}
                >
                    <span className="font-semibold">{new Date(convo.timestamp).toLocaleString()}</span>
                    <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                </button>
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="p-4 space-y-4">
                    <div className="flex space-x-4">
                        {convo.userAudioUrl && (
                            <button onClick={() => togglePlayPause(convo.userAudioUrl!)} className="flex items-center space-x-2 bg-blue-600 px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm">
                                {isUserPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                                <span>User Audio</span>
                            </button>
                        )}
                        {convo.assistantAudioUrl && (
                             <button onClick={() => togglePlayPause(convo.assistantAudioUrl!)} className="flex items-center space-x-2 bg-teal-600 px-3 py-1 rounded-md hover:bg-teal-700 transition-colors text-sm">
                                {isAiPlaying ? <PauseIcon className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
                                <span>AI Audio</span>
                            </button>
                        )}
                    </div>
                    <div className="max-h-60 overflow-y-auto bg-gray-900 p-3 rounded-md">
                        {convo.transcript.map((entry, index) => (
                        <p key={index} className={`mb-2 ${entry.speaker === 'user' ? 'text-blue-300' : 'text-teal-200'}`}>
                            <span className="font-bold capitalize">{entry.speaker}:</span> {entry.text}
                        </p>
                        ))}
                    </div>
                    </div>
                </div>
                </div>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default SavedConversations;