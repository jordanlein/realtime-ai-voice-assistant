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

### 3. Set Up Environment Variables

This project uses a backend server to securely handle your OpenAI API key.

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Create a new file named `.env` and add your OpenAI API key:
    ```env
    # Your secret OpenAI API key
    OPENAI_API_KEY="sk-..."
    ```

### 4. Install Dependencies

1.  **Frontend:** In the root directory, install the frontend dependencies:
    ```bash
    npm install
    ```
2.  **Backend:** In the `server` directory, install the backend dependencies:
    ```bash
    cd server
    npm install
    ```

### 5. Run the Application

You need to run both the backend and frontend servers in separate terminals.

1.  **Start the Backend Server:**
    ```bash
    # From the root directory:
    cd server
    node index.js
    ```
    The backend will be running on `http://localhost:3001`.

2.  **Start the Frontend Server:**
    ```bash
    # From the root directory:
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

When you first launch the application, you will be prompted to enter your **Google API keys** for the web search feature. The OpenAI API key is handled securely by the backend.

*   **Google Cloud API Key & Custom Search Engine ID:** To enable the web search feature, you need to set up a Google Custom Search Engine. For detailed instructions, please refer to the [Google CSE Setup Guide](./GOOGLE_CSE_SETUP.md).

---

*This is a demonstration application. All conversation data is stored locally on your device.*
