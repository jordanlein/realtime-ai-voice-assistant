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

### 4. Run the Application

Once the dependencies are installed, you can start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is busy).

When you first launch the application, you will be prompted to enter your API keys for OpenAI and Google Custom Search. These are stored locally in your browser and are required for the application to function.

*   **OpenAI API Key:** You can get your key from the [OpenAI API keys page](https://platform.openai.com/api-keys).
*   **Google Cloud API Key & Custom Search Engine ID:** To enable the web search feature, you need to set up a Google Custom Search Engine. For detailed instructions, please refer to the [Google CSE Setup Guide](./GOOGLE_CSE_SETUP.md).

---

*This is a demonstration application. All conversation data is stored locally on your device.*
