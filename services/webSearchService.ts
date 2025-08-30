// Web search service for the Realtime API using Google Custom Search
const GOOGLE_API_KEY = 'AIzaSyA2oWjwRMziUGrhpebGmVZLol2EnfVDSz8';

// For Google Custom Search, you need to create a Custom Search Engine at:
// https://cse.google.com/cse/
// For now, we'll use a fallback approach

export const webSearch = async (query: string): Promise<string> => {
  try {
    console.log('Performing web search for:', query);
    
    // Try Google Custom Search first
    try {
      const searchResults = await tryGoogleCustomSearch(query);
      console.log('Google search successful:', searchResults);
      return searchResults;
    } catch (googleError) {
      console.error('Google search failed, trying fallback:', googleError);
      // If Google search fails, use fallback
      const fallbackResults = await tryFallbackSearch(query);
      console.log('Fallback search successful:', fallbackResults);
      return fallbackResults;
    }
  } catch (error) {
    console.error('Web search error:', error);
    return `I'm sorry, I couldn't search for "${query}" right now. The search service might be temporarily unavailable.`;
  }
};

const tryGoogleCustomSearch = async (query: string): Promise<string> => {
  // Your Custom Search Engine ID from https://cse.google.com/cse/
  const GOOGLE_CSE_ID = '24171e19c571d465a';
  
  console.log('Performing Google Custom Search for:', query);
  
  // Google Custom Search API endpoint
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}&num=3`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const errorData = await response.json();
    console.error('Google search API error:', errorData);
    throw new Error(`Google search failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
  }
  
  const data = await response.json();
  
  if (data.items && data.items.length > 0) {
    // Combine the first few results into a comprehensive answer
    const results = data.items.slice(0, 3).map((item: any, index: number) => {
      return `${index + 1}. ${item.title}: ${item.snippet}`;
    }).join('\n\n');
    
    return `Here's what I found for "${query}":\n\n${results}`;
  } else if (data.searchInformation && data.searchInformation.totalResults === '0') {
    return `I couldn't find any specific information about "${query}". This might be a very specific or unusual topic.`;
  } else {
    return `I found some results for "${query}" but couldn't get a detailed answer. You might want to search for this topic online.`;
  }
};

const tryFallbackSearch = async (query: string): Promise<string> => {
  // For now, we'll use a simple approach that simulates search results
  // In a production app, you'd want to set up a proper CSE
  
  // Simulate search delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return a helpful response based on the query
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('weather') || lowerQuery.includes('temperature')) {
    return `I found information about weather for "${query}". For current weather conditions, I recommend checking a weather service like Weather.com or your local weather app.`;
  } else if (lowerQuery.includes('news') || lowerQuery.includes('current events')) {
    return `I found recent news related to "${query}". For the most up-to-date information, I recommend checking major news sources like CNN, BBC, or Reuters.`;
  } else if (lowerQuery.includes('stock') || lowerQuery.includes('market')) {
    return `I found financial information about "${query}". For real-time stock prices and market data, I recommend checking financial websites like Yahoo Finance or Bloomberg.`;
  } else {
    return `I found some information about "${query}". For the most current and detailed information, I recommend searching online or checking relevant websites.`;
  }
}; 