# Realtime AI Voice Assistant

This project is a web-based, real-time AI voice assistant powered by OpenAI's `gpt-realtime` model. It allows you to have spoken conversations with an AI that can respond instantly. The assistant is also equipped with a web search tool to provide up-to-date information.

## ✨ Features

*   **Real-time Conversation:** Speak with an AI assistant and get immediate voice responses.
*   **Voice Variety:** Choose from a selection of different voices for the assistant.
*   **Web Search:** The assistant can search the web for current information, thanks to the integration with Google's Custom Search Engine.
*   **Local History:** Your conversations are automatically saved on your device for you to review later.
*   **Browser-Based:** No need to install any software, it runs directly in your web browser.

## 🛠️ Tech Stack

*   **Frontend:** React, Vite, TypeScript
*   **AI Model:** OpenAI `gpt-realtime`
*   **Real-time AI Communication:** `@openai/agents-realtime`
*   **Web Search:** Google Custom Search Engine API
*   **Local Storage:** IndexedDB

## 🚀 Getting Started

Follow these instructions to set up and run the project on your local machine.

### 1. Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your system.

### 2. Clone the Repository

```bash
git clone <https://github.com/jordanlein/realtime-ai-voice-assistant.git>
cd realtime-ai-voice-assistant
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Environment Variables

You'll need to configure your API keys in an environment file.

1.  Create a new file named `.env` in the root of the project by copying the example file:
    ```bash
    cp .env.example .env
    ```
2.  Open the `.env` file and add your API keys and configuration values:

    ```env
    # Your OpenAI API Key
    VITE_OPENAI_API_KEY="sk-..."

    # Your Google Cloud API Key for the Custom Search API
    VITE_GOOGLE_API_KEY="AIza..."

    # Your Google Custom Search Engine ID
    VITE_GOOGLE_CSE_ID="..."
    ```

*   `VITE_OPENAI_API_KEY`: Your API key from [OpenAI](https://platform.openai.com/api-keys).
*   `VITE_GOOGLE_API_KEY` and `VITE_GOOGLE_CSE_ID`: To enable the web search feature, you need to set up a Google Custom Search Engine. For detailed instructions, please refer to the [Google CSE Setup Guide](./GOOGLE_CSE_SETUP.md).

### 5. Run the Application

Once your environment variables are set, you can start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

---

*This is a demonstration application. All conversation data is stored locally on your device.*
