import React, { useState } from 'react';
import { ApiKeys } from '../types';

interface ApiKeyModalProps {
  onSave: (keys: ApiKeys) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
  const [google, setGoogle] = useState('');
  const [searchEngineId, setSearchEngineId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass a dummy value for openai key, as it's handled by the server now.
    onSave({ openai: 'unused', google, searchEngineId });
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Enter Google API Keys</h2>
        <p className="text-gray-400 mb-6">
          Please provide your Google API keys for the web search feature. The OpenAI API key is now configured on the server.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="google" className="block text-gray-300 mb-2">Google Cloud API Key</label>
            <input
              id="google"
              type="password"
              value={google}
              onChange={(e) => setGoogle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="searchEngineId" className="block text-gray-300 mb-2">Google Search Engine ID</label>
            <input
              id="searchEngineId"
              type="password"
              value={searchEngineId}
              onChange={(e) => setSearchEngineId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            Save Keys
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;
