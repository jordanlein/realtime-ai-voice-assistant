// Web search service for the Realtime API using Google Custom Search
export const webSearch = async (query: string, apiKey: string, cseId: string): Promise<string> => {
  if (!apiKey || !cseId) {
    console.warn('Google API Key or CSE ID is missing. The web search tool will not be available.');
    return "The web search tool is not configured. Please ask the user to configure the Google API Key and CSE ID.";
  }

  try {
    console.log('Performing Google Custom Search for:', query);

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=3`;

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google search API error:', errorData);

      if (errorData.error.message.includes('API key not valid')) {
        return "The Google API key is not valid. Please check the key in the .env file.";
      } else if (errorData.error.message.includes('Custom Search Engine ID not valid')) {
          return "The Google Custom Search Engine ID is not valid. Please check the ID in the .env file.";
      } else {
        return `I'm sorry, I couldn't search for "${query}" right now. The search service returned an error: ${errorData.error.message}`;
      }
    }
    
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const results = data.items.slice(0, 3).map((item: any, index: number) => {
        return `${index + 1}. ${item.title}: ${item.snippet}`;
      }).join('\n\n');

      return `Here's what I found for "${query}":\n\n${results}`;
    } else {
      return `I couldn't find any specific information about "${query}". Please try a different search term.`;
    }
  } catch (error) {
    console.error('Web search error:', error);
    return `I'm sorry, I couldn't search for "${query}" right now. There was a network error when trying to reach the search service.`;
  }
}; 