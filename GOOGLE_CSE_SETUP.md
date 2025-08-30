# Google Custom Search Engine Setup

To use Google Custom Search API with your voice assistant, you need to create a Custom Search Engine (CSE):

## Step 1: Create a Custom Search Engine

1. Go to https://cse.google.com/cse/
2. Click "Add" to create a new search engine
3. Enter any site in the "Sites to search" field (e.g., `www.google.com`)
4. Give your search engine a name (e.g., "Voice Assistant Search")
5. Click "Create"

## Step 2: Get Your Search Engine ID

1. After creating the CSE, click on it to edit
2. Go to the "Setup" tab
3. Copy the "Search engine ID" (it looks like: `012345678901234567890:abcdefghijk`)

## Step 3: Update the Code

✅ **COMPLETED** - Your Search Engine ID has been configured in `services/webSearchService.ts`:

```typescript
const GOOGLE_CSE_ID = '24171e19c571d465a';
```

## Step 4: Test the Search

✅ **READY TO TEST** - The search should now work with real Google search results!

Your voice assistant can now search the web for current information during conversations.

## Alternative: Use Google Programmable Search Engine

If you want to search the entire web (not just specific sites):

1. Go to https://programmablesearchengine.google.com/
2. Create a new search engine
3. Select "Search the entire web"
4. Get the Search Engine ID and update the code

## API Limits

- Free tier: 100 searches per day
- Paid tier: $5 per 1000 searches
- Your API key: AIzaSyA2oWjwRMziUGrhpebGmVZLol2EnfVDSz8 