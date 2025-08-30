// This function uses your main OpenAI API key to securely generate a short-lived
// client token for the browser to use. This is the recommended approach from the
// OpenAI Agents SDK documentation.
export const getClientToken = async (apiKey: string) => {
    if (!apiKey) {
      throw new Error('OpenAI API key is missing.');
    }
    
    // Validate API key format
    if (!apiKey.startsWith('sk-')) {
      throw new Error('Invalid API key format. API key should start with "sk-"');
    }

    const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            "session": {
                "type": "realtime",
                "model": "gpt-realtime"
            }
        })
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error('Client token generation failed:', response.status, errorBody);
        
        if (response.status === 401) {
            throw new Error('Invalid API key. Please check your OpenAI API key.');
        } else if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please try again later.');
        } else if (response.status >= 500) {
            throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
        } else {
            throw new Error(`Failed to generate client token: ${response.status} ${JSON.stringify(errorBody)}`);
        }
    }

    const data = await response.json();
    // The API returns the client_secret object directly.
    // The token is in the 'value' property of this object.
    if (!data.value) {
        console.error("Unexpected response structure from getClientToken:", data);
        throw new Error("Failed to parse client token from API response.");
    }
    return data.value;
};