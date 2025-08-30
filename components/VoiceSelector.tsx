
import React from 'react';
import { OpenAIVoice } from '../types';
import { AVAILABLE_VOICES } from '../constants';

interface VoiceSelectorProps {
  selectedVoice: OpenAIVoice;
  onVoiceChange: (voice: OpenAIVoice) => void;
  disabled: boolean;
}

const VoiceSelector: React.FC<VoiceSelectorProps> = ({ selectedVoice, onVoiceChange, disabled }) => {
  return (
    <div className="flex flex-col items-center space-y-2">
      <label htmlFor="voice-select" className="text-sm font-medium text-gray-400">
        Assistant Voice
      </label>
      <select
        id="voice-select"
        value={selectedVoice}
        onChange={(e) => onVoiceChange(e.target.value as OpenAIVoice)}
        disabled={disabled}
        className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:opacity-50"
      >
        {AVAILABLE_VOICES.map((voice) => (
          <option key={voice} value={voice} className="capitalize">
            {voice.charAt(0).toUpperCase() + voice.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default VoiceSelector;
