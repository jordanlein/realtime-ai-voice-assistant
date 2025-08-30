# Google Custom Search Engine Setup

To use Google Custom Search API with your voice assistant, you need to create a Custom Search Engine (CSE):

## Step 1: Create a Programmable Search Engine

1.  Go to [https://programmablesearchengine.google.com/](https://programmablesearchengine.google.com/).
2.  Click **"Add"** to create a new search engine.
3.  Give your search engine a name (e.g., "AI Assistant Web Search").
4.  **IMPORTANT**: Under "What to search?", select **"Search the entire web"**. This is crucial for the search tool to work correctly.
5.  Click **"Create"**.

## Step 2: Get Your Search Engine ID

1.  After creating the search engine, you will be taken to the dashboard.
2.  In the "Basic" section of the "Setup" tab, find and copy the **"Search engine ID"**. It will be a long string of letters and numbers.

## Step 3: Use Your Keys in the Application

When you first launch the voice assistant application, you will be prompted to enter your API keys.

1.  **Google Cloud API Key:** This is the API key you created in your Google Cloud project with the "Custom Search API" enabled.
2.  **Google Search Engine ID:** This is the ID you copied in Step 2.

Enter these keys into the appropriate fields in the application. They will be saved locally in your browser for future use.

## Step 4: Test the Search

Once the keys are saved in the application, your voice assistant will be able to search the entire web for current information.

### API Limits

The Custom Search JSON API has a free quota of 100 search queries per day. For more information, see the [API pricing page](https://developers.google.com/custom-search/v1/overview#pricing).