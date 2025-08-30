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

## Step 3: Update Your `.env` File

1.  Open the `.env` file in the root of the project.
2.  Paste your Search Engine ID as the value for `VITE_GOOGLE_CSE_ID`.

    ```
    VITE_GOOGLE_CSE_ID="your-search-engine-id-here"
    ```

## Step 4: Test the Search

Your voice assistant should now be able to search the entire web for current information.

## API Key Information

Your Google Cloud API Key is also stored in the `.env` file:

```
VITE_GOOGLE_API_KEY="your-google-cloud-api-key-here"
```

Make sure this key is correct and has the "Custom Search API" enabled in your Google Cloud project.

### API Limits

The Custom Search JSON API has a free quota of 100 search queries per day. For more information, see the [API pricing page](https://developers.google.com/custom-search/v1/overview#pricing).