import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ConversationStatus, TranscriptEntry, OpenAIVoice, SavedConversation } from './types';
import { AVAILABLE_VOICES } from './constants';
import { useIndexedDB } from './hooks/useIndexedDB';
import { getClientToken } from './services/openaiService';
import { webSearch } from './services/webSearchService';
import VoiceSelector from './components/VoiceSelector';
import ConversationView from './components/ConversationView';
import SavedConversations from './components/SavedConversations';
import { RealtimeAgent, RealtimeSession } from '@openai/agents-realtime';

const App: React.FC = () => {
  const [status, setStatus] = useState<ConversationStatus>('idle');
  const [selectedVoice, setSelectedVoice] = useState<OpenAIVoice>(AVAILABLE_VOICES[0]);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const { conversations, addConversation } = useIndexedDB();

  const sessionRef = useRef<RealtimeSession | null>(null);
  
  // Function to get current date, time, and location context
  const getCurrentContext = () => {
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const timeString = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    return {
      date: dateString,
      time: timeString,
      timezone: timezone,
      timestamp: now.toISOString()
    };
  };
  
  // Clean up session on component unmount
  useEffect(() => {
    return () => {
      sessionRef.current?.disconnect();
    };
  }, []);

  const handleTranscript = useCallback((newTranscript: { text: string, final: boolean, speaker: 'user' | 'ai' }) => {
    // Don't add empty transcript entries
    if (!newTranscript.text || !newTranscript.text.trim()) {
      return;
    }
    
    setTranscript(prev => {
        const lastEntry = prev[prev.length - 1];
        if (lastEntry && lastEntry.speaker === newTranscript.speaker && !lastEntry.isFinal) {
            // Update the last entry if it's not final
            const updatedEntry = { ...lastEntry, text: newTranscript.text.trim(), isFinal: newTranscript.final };
            return [...prev.slice(0, -1), updatedEntry];
        } else {
            // Add a new entry only if there's actual content
            return [...prev, { text: newTranscript.text.trim(), speaker: newTranscript.speaker, isFinal: newTranscript.final }];
        }
    });
  }, []);


  const startConversation = useCallback(async () => {
    setStatus('connecting');
    setError(null);
    setTranscript([]);
    
    try {
      console.log('Starting conversation...');
      
      // Check microphone permissions first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
        console.log('Microphone permission granted');
      } catch (micError) {
        console.error('Microphone permission denied:', micError);
        setError('Microphone permission is required. Please allow microphone access and try again.');
        setStatus('idle');
        return;
      }
      
      const token = await getClientToken();
      console.log('Token received:', token ? 'Yes' : 'No');

      console.log('Creating agent...');
      
      // Get current context information
      const context = getCurrentContext();
      
      const agent = new RealtimeAgent({
        name: 'Assistant',
        instructions: `You are a helpful, knowledgeable AI assistant with a warm and engaging personality. Your voice is ${selectedVoice}. 

CURRENT CONTEXT:
- Date: ${context.date}
- Time: ${context.time}
- Timezone: ${context.timezone}

You have access to the current date and time information above. Use this context when relevant to provide more helpful and timely responses. For example, if someone asks about "today" or "now", you can reference the actual current date and time.

Speak naturally and conversationally - be helpful and friendly but not overly enthusiastic. Keep responses concise and to the point while maintaining a pleasant tone. 

If you need to search for current information, use the web_search tool. Always be honest about what you know and don't know. If you're unsure about something, say so rather than guessing.

Your goal is to be genuinely helpful while sounding natural and human-like in conversation.`,
        tools: [
          {
            name: 'web_search',
            description: 'Search the web for current information',
            parameters: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The search query to look up'
                }
              },
              required: ['query']
            }
          }
        ] as any
      });
      
      console.log('Creating session...');
      console.log('Agent config:', {
        name: agent.name,
        instructions: agent.instructions,
        tools: agent.tools
      });
      
      const sessionConfig = {
        model: 'gpt-realtime',
        transport: 'webrtc' as const, // Try WebRTC first, fallback to WebSocket if needed
        config: {
          audio: {
            output: {
              voice: selectedVoice
            }
          }
        }
      };
      
      console.log('Session config:', sessionConfig);
      const session = new RealtimeSession(agent, sessionConfig);
      sessionRef.current = session;

      // Add a timeout to prevent infinite loading - increased to 30 seconds for Realtime API
      let hasReceivedConnectionEvent = false;
      let hasReceivedAnyEvent = false;
      const connectionTimeout = setTimeout(() => {
        if (!hasReceivedConnectionEvent && !hasReceivedAnyEvent) {
          console.error('Connection timeout - session did not connect within 30 seconds');
          console.log('Current transcript state:', transcript);
          console.log('Session ref:', sessionRef.current);
          setError('Connection timeout. Please try again. Check your microphone permissions and internet connection.');
          setStatus('idle');
          sessionRef.current = null;
        }
      }, 30000);

      console.log('Setting up event listeners...');
      
      // Listen for connection status changes
      (session as any).on('connection_change', (status: any) => {
        console.log("Connection status changed:", status);
        hasReceivedConnectionEvent = true;
        if (status === 'connected') {
          console.log("Session connected!");
          clearTimeout(connectionTimeout);
          setStatus('active');
        } else if (status === 'disconnected') {
          console.log("Session disconnected.");
          clearTimeout(connectionTimeout);
          stopConversation(true);
        } else if (status === 'connecting') {
          console.log("Session is connecting...");
        }
      });
      
      // Also listen for transport connection changes
      (session as any).on('transport_event', (event: any) => {
        if (event.type === 'connection_change') {
          console.log("Transport connection status:", event.status);
          hasReceivedConnectionEvent = true;
          if (event.status === 'connected') {
            console.log("Transport connected!");
            clearTimeout(connectionTimeout);
            setStatus('active');
          }
        }
      });
      
      // Listen for transport events
      (session as any).on('transport_event', (event: any) => {
        console.log('Transport event:', event);
        hasReceivedAnyEvent = true;
        
        if (event.type === 'connection_change') {
          console.log("Transport connection status:", event.status);
        } else if (event.type === 'audio_transcript_delta') {
          console.log('Transcript delta:', event);
          // Handle real-time transcript updates
          if (event.delta && event.delta.trim()) {
            handleTranscript({ 
              text: event.delta, 
              final: false, 
              speaker: 'user' 
            });
          }
        } else if (event.type === 'input_audio_buffer.speech_started') {
          console.log('Speech started:', event);
        } else if (event.type === 'input_audio_buffer.speech_stopped') {
          console.log('Speech stopped:', event);
        } else if (event.type === 'input_audio_buffer.committed') {
          console.log('Audio buffer committed:', event);
        }
      });
      
      // Listen for item updates (conversation messages)
      (session as any).on('item_update', (item: any) => {
        console.log('Item update:', item);
        hasReceivedAnyEvent = true;
        
        if (item.type === 'message' && item.content) {
          const speaker = item.role === 'user' ? 'user' : 'ai';
          let text = '';
          
          // Handle different content formats
          if (typeof item.content === 'string') {
            text = item.content;
          } else if (Array.isArray(item.content)) {
            text = item.content.map((c: any) => c.text || '').join(' ');
          } else if (item.content.text) {
            text = item.content.text;
          }
          
          // Only add if there's actual text content
          if (text.trim()) {
            const isFinal = item.status === 'completed';
            handleTranscript({ text: text.trim(), final: isFinal, speaker });
          }
        }
      });
      
      // Listen for history updates (transcript)
      (session as any).on('history_updated', (history: any) => {
        console.log('History updated:', history);
        hasReceivedAnyEvent = true;
        
        // Process all items in history
        if (history && history.length > 0) {
          history.forEach((item: any) => {
            if (item.type === 'message' && item.content) {
              const speaker = item.role === 'user' ? 'user' : 'ai';
              let text = '';
              
              // Handle different content formats
              if (typeof item.content === 'string') {
                text = item.content;
              } else if (Array.isArray(item.content)) {
                text = item.content.map((c: any) => c.text || '').join(' ');
              } else if (item.content.text) {
                text = item.content.text;
              }
              
              // Only add if there's actual text content
              if (text.trim()) {
                const isFinal = item.status === 'completed';
                handleTranscript({ text: text.trim(), final: isFinal, speaker });
              }
            }
          });
        }
      });
      
      // Listen for all events to debug what's happening
      (session as any).on('*', (event: any) => {
        console.log('All session event:', event);
        hasReceivedAnyEvent = true;
      });
      
      // Listen for specific transcript events
      (session as any).on('response.audio_transcript.delta', (event: any) => {
        console.log('Response audio transcript delta:', event);
        hasReceivedAnyEvent = true;
        if (event.delta && event.delta.trim()) {
          handleTranscript({ 
            text: event.delta, 
            final: false, 
            speaker: 'ai' 
          });
        }
      });
      
      (session as any).on('response.audio_transcript.done', (event: any) => {
        console.log('Response audio transcript done:', event);
        hasReceivedAnyEvent = true;
        if (event.transcript && event.transcript.trim()) {
          handleTranscript({ 
            text: event.transcript, 
            final: true, 
            speaker: 'ai' 
          });
        }
      });
      
      (session as any).on('conversation.item.input_audio_transcription.delta', (event: any) => {
        console.log('Input audio transcription delta:', event);
        hasReceivedAnyEvent = true;
        if (event.delta && event.delta.trim()) {
          handleTranscript({ 
            text: event.delta, 
            final: false, 
            speaker: 'user' 
          });
        }
      });
      
      (session as any).on('conversation.item.input_audio_transcription.completed', (event: any) => {
        console.log('Input audio transcription completed:', event);
        hasReceivedAnyEvent = true;
        if (event.transcript && event.transcript.trim()) {
          handleTranscript({ 
            text: event.transcript, 
            final: true, 
            speaker: 'user' 
          });
        }
      });

      // Listen for tool approval requests
      (session as any).on('tool_approval_requested', async (context: any, agent: any, approvalRequest: any) => {
        console.log('Tool approval requested:', approvalRequest);
        hasReceivedAnyEvent = true;
        
        if (approvalRequest.type === 'function_approval' && approvalRequest.tool.name === 'web_search') {
          try {
            const args = JSON.parse(approvalRequest.approvalItem.arguments);
            const query = args.query;
            
            console.log('Web search requested for:', query);
            
            // Add the search query to transcript
            handleTranscript({ 
              text: `Searching for: ${query}`, 
              final: true, 
              speaker: 'ai' 
            });
            
            // Perform the web search
            const searchResult = await webSearch(query);
            
            console.log('Web search completed, result:', searchResult);
            
            // Approve the tool call with the result
            await (session as any).approveToolCall(approvalRequest.approvalItem.id, searchResult);
            
            console.log('Tool call approved with search result');
          } catch (error) {
            console.error('Web search failed:', error);
            const errorMessage = `Search failed: ${error.message}`;
            await (session as any).rejectToolCall(approvalRequest.approvalItem.id, errorMessage);
          }
        }
      });

      // Listen for errors
      (session as any).on('error', (error: any) => {
        console.error('Session error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        
        let errorMessage = 'An unknown error occurred';
        if (error.error && typeof error.error === 'object') {
          errorMessage = error.error.message || error.error.type || 'Configuration error';
        } else if (error.error) {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        clearTimeout(connectionTimeout);
        setError(`Session error: ${errorMessage}. Please check console for details.`);
        stopConversation(true);
      });

      console.log('About to connect session with token:', token ? 'Token present' : 'No token');
      console.log('Session config:', session);
      
      try {
        console.log('Calling session.connect...');
        console.log('Session before connect:', {
          transport: session.transport,
          currentAgent: session.currentAgent,
          options: session.options
        });
        
        await session.connect({ apiKey: token });
        
        console.log('Session connect call completed');
        console.log('Session after connect:', {
          transport: session.transport,
          currentAgent: session.currentAgent,
          muted: session.muted,
          history: session.history
        });
      } catch (connectError) {
        console.error('WebRTC connection failed, trying WebSocket fallback:', connectError);
        
                 // Try WebSocket as fallback
         const websocketSession = new RealtimeSession(agent, {
           model: 'gpt-realtime',
           transport: 'websocket',
           config: {
             audio: {
               output: {
                 voice: selectedVoice
               }
             }
           }
         });
        
        sessionRef.current = websocketSession;
        
        // Set up the same event listeners for WebSocket session
        (websocketSession as any).on('transport_event', (event: any) => {
          console.log('WebSocket transport event:', event);
          hasReceivedAnyEvent = true;
          
          if (event.type === 'connection_change') {
            console.log("WebSocket transport connection status:", event.status);
          } else if (event.type === 'audio_transcript_delta') {
            console.log('WebSocket transcript delta:', event);
            // Handle real-time transcript updates
            if (event.delta && event.delta.trim()) {
              handleTranscript({ 
                text: event.delta, 
                final: false, 
                speaker: 'user' 
              });
            }
          } else if (event.type === 'input_audio_buffer.speech_started') {
            console.log('WebSocket speech started:', event);
          } else if (event.type === 'input_audio_buffer.speech_stopped') {
            console.log('WebSocket speech stopped:', event);
          } else if (event.type === 'input_audio_buffer.committed') {
            console.log('WebSocket audio buffer committed:', event);
          }
        });
        
        (websocketSession as any).on('connection_change', (status: any) => {
          console.log("WebSocket connection status changed:", status);
          hasReceivedConnectionEvent = true;
          if (status === 'connected') {
            console.log("WebSocket session connected!");
            clearTimeout(connectionTimeout);
            setStatus('active');
          } else if (status === 'disconnected') {
            console.log("WebSocket session disconnected.");
            clearTimeout(connectionTimeout);
            stopConversation(true);
          } else if (status === 'connecting') {
            console.log("WebSocket session is connecting...");
          }
        });
        
        (websocketSession as any).on('item_update', (item: any) => {
          console.log('WebSocket item update:', item);
          hasReceivedAnyEvent = true;
          
          if (item.type === 'message' && item.content) {
            const speaker = item.role === 'user' ? 'user' : 'ai';
            let text = '';
            
            // Handle different content formats
            if (typeof item.content === 'string') {
              text = item.content;
            } else if (Array.isArray(item.content)) {
              text = item.content.map((c: any) => c.text || '').join(' ');
            } else if (item.content.text) {
              text = item.content.text;
            }
            
            // Only add if there's actual text content
            if (text.trim()) {
              const isFinal = item.status === 'completed';
              handleTranscript({ text: text.trim(), final: isFinal, speaker });
            }
          }
        });
        
        // Add the same transcript event listeners for WebSocket
        (websocketSession as any).on('response.audio_transcript.delta', (event: any) => {
          console.log('WebSocket response audio transcript delta:', event);
          hasReceivedAnyEvent = true;
          if (event.delta && event.delta.trim()) {
            handleTranscript({ 
              text: event.delta, 
              final: false, 
              speaker: 'ai' 
            });
          }
        });
        
        (websocketSession as any).on('response.audio_transcript.done', (event: any) => {
          console.log('WebSocket response audio transcript done:', event);
          hasReceivedAnyEvent = true;
          if (event.transcript && event.transcript.trim()) {
            handleTranscript({ 
              text: event.transcript, 
              final: true, 
              speaker: 'ai' 
            });
          }
        });
        
        (websocketSession as any).on('conversation.item.input_audio_transcription.delta', (event: any) => {
          console.log('WebSocket input audio transcription delta:', event);
          hasReceivedAnyEvent = true;
          if (event.delta && event.delta.trim()) {
            handleTranscript({ 
              text: event.delta, 
              final: false, 
              speaker: 'user' 
            });
          }
        });
        
        (websocketSession as any).on('conversation.item.input_audio_transcription.completed', (event: any) => {
          console.log('WebSocket input audio transcription completed:', event);
          hasReceivedAnyEvent = true;
          if (event.transcript && event.transcript.trim()) {
            handleTranscript({ 
              text: event.transcript, 
              final: true, 
              speaker: 'user' 
            });
          }
        });
        
        (websocketSession as any).on('history_updated', (history: any) => {
          console.log('WebSocket history updated:', history);
          if (history && history.length > 0) {
            history.forEach((item: any) => {
              if (item.type === 'message' && item.content) {
                const speaker = item.role === 'user' ? 'user' : 'ai';
                let text = '';
                
                // Handle different content formats
                if (typeof item.content === 'string') {
                  text = item.content;
                } else if (Array.isArray(item.content)) {
                  text = item.content.map((c: any) => c.text || '').join(' ');
                } else if (item.content.text) {
                  text = item.content.text;
                }
                
                // Only add if there's actual text content
                if (text.trim()) {
                  const isFinal = item.status === 'completed';
                  handleTranscript({ text: text.trim(), final: isFinal, speaker });
                }
              }
            });
          }
        });
        
        // Listen for tool approval requests in WebSocket session
        (websocketSession as any).on('tool_approval_requested', async (context: any, agent: any, approvalRequest: any) => {
          console.log('WebSocket tool approval requested:', approvalRequest);
          
          if (approvalRequest.type === 'function_approval' && approvalRequest.tool.name === 'web_search') {
            try {
              const args = JSON.parse(approvalRequest.approvalItem.arguments);
              const query = args.query;
              
              console.log('WebSocket web search requested for:', query);
              
              // Perform the web search
              const searchResult = await webSearch(query);
              
              // Approve the tool call with the result
              await (websocketSession as any).approveToolCall(approvalRequest.approvalItem.id, searchResult);
              
              console.log('WebSocket web search completed:', searchResult);
            } catch (error) {
              console.error('WebSocket web search failed:', error);
              await (websocketSession as any).rejectToolCall(approvalRequest.approvalItem.id, 'Web search failed');
            }
          }
        });

        (websocketSession as any).on('error', (error: any) => {
          console.error('WebSocket session error:', error);
          console.error('WebSocket error details:', JSON.stringify(error, null, 2));
          
          let errorMessage = 'An unknown error occurred';
          if (error.error && typeof error.error === 'object') {
            errorMessage = error.error.message || error.error.type || 'Configuration error';
          } else if (error.error) {
            errorMessage = error.error;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          clearTimeout(connectionTimeout);
          setError(`WebSocket session error: ${errorMessage}. Please check console for details.`);
          stopConversation(true);
        });
        
        console.log('Calling WebSocket session.connect...');
        await websocketSession.connect({ apiKey: token });
        console.log('WebSocket session connect call completed');
        console.log('WebSocket session transport:', websocketSession.transport);
      }

    } catch (err) {
      console.error('Failed to start conversation:', err);
      const errorMessage = (err as Error).message || "An unknown error occurred.";
      
      // Provide more specific error messages based on the error type
      let userFriendlyError = errorMessage;
      if (errorMessage.includes('timeout')) {
        userFriendlyError = 'Connection timed out. Please check your internet connection and try again.';
      } else if (errorMessage.includes('permission')) {
        userFriendlyError = 'Microphone permission is required. Please allow microphone access and try again.';
      } else if (errorMessage.includes('API key')) {
        userFriendlyError = 'API key error. Please check your OpenAI API key configuration.';
      }
      
      setError(`Failed to start: ${userFriendlyError}`);
      setStatus('idle');
    }
  }, [selectedVoice, handleTranscript]);

  const stopConversation = useCallback(async (isClosedByServer = false) => {
    console.log('stopConversation called, status:', status, 'isClosedByServer:', isClosedByServer);
    
    if (status === 'idle' || status === 'stopping') {
      console.log('Already idle or stopping, ignoring stop request');
      return;
    }
    
    setStatus('stopping');

    if (!isClosedByServer && sessionRef.current) {
      console.log('Manually disconnecting session...');
      try {
        sessionRef.current.disconnect();
      } catch (error) {
        console.error('Error disconnecting session:', error);
      }
    }
    
    // Create a final transcript, removing any empty messages
    const finalTranscript = transcript.filter(t => t.text.trim() !== '');
    setTranscript(finalTranscript);

    if (finalTranscript.length > 0) {
        try {
            const conversationToSave: Omit<SavedConversation, 'id' | 'userAudioUrl' | 'assistantAudioUrl'> = {
                timestamp: new Date(),
                transcript: finalTranscript,
            };
            await addConversation(conversationToSave);
        } catch (saveError) {
            console.error("Failed to save conversation:", saveError);
            setError("Could not save the conversation to your local history.");
        }
    }
    
    setStatus('idle');
    sessionRef.current = null;
    // Keep final transcript on screen until next session starts
  }, [status, transcript, addConversation]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
                Realtime AI Voice Assistant
            </h1>
            <p className="mt-2 text-lg text-gray-400">Powered by OpenAI's gpt-realtime</p>
        </header>

        {error && (
            <div className="w-full max-w-2xl mx-auto bg-red-800 border border-red-600 text-white px-4 py-3 rounded-lg relative mb-6" role="alert">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
                <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3" aria-label="Close">
                    <svg className="fill-current h-6 w-6 text-red-300" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                </button>
            </div>
        )}
        
        <main className="w-full flex-grow flex flex-col items-center">
            <div className="mb-8">
                <VoiceSelector 
                    selectedVoice={selectedVoice} 
                    onVoiceChange={setSelectedVoice}
                    disabled={status !== 'idle'} 
                />
            </div>

            <ConversationView 
                status={status}
                transcript={transcript}
                onStart={startConversation}
                onStop={() => stopConversation(false)}
            />

            <SavedConversations conversations={conversations} />
        </main>
        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>This is a demonstration application. All conversation data is stored locally on your device.</p>
        </footer>
    </div>
  );
};

export default App;
