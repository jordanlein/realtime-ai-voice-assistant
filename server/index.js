import express from 'express';
import fetch from 'node-fetch';
import 'dotenv/config';

const app = express();
const port = 3001;

app.use(express.json());

app.post('/api/token', async (req, res) => {
  try {
    const sessionConfig = {
      session: {
        type: 'realtime',
        model: 'gpt-realtime',
      },
    };

    const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(sessionConfig),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to generate token: ${response.status} ${errorText}`);
      // It's better to not expose the raw error text to the client.
      throw new Error(`Failed to generate token from OpenAI API.`);
    }

    const data = await response.json();
    // The new structure from OpenAI returns client_secret directly, not nested.
    res.json({ token: data.value });
  } catch (error) {
    console.error('Error in /api/token endpoint:', error);
    res.status(500).json({ error: 'Failed to generate token.' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
