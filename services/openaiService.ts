export const getClientToken = async (): Promise<string> => {
  try {
    const response = await fetch('/api/token', { method: 'POST' });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to fetch token from server:', errorData);
      throw new Error('Failed to fetch token from server.');
    }
    const data = await response.json();
    if (!data.token) {
      console.error('Token not found in server response:', data);
      throw new Error('Token not found in server response.');
    }
    return data.token;
  } catch (error) {
    console.error('Error fetching ephemeral token:', error);
    throw error;
  }
};