// Configuration loader for Voxon
// For local development: Update this file with your API keys
// For production: Use environment variables through a backend proxy

const config = {
    // Load from environment variables if available (e.g., Vite, webpack)
    // Otherwise, you'll need to manually add them here (NOT RECOMMENDED for production)
    openAIKey: import.meta?.env?.VITE_OPENAI_API_KEY || "",
    googleApiKey: import.meta?.env?.VITE_GOOGLE_API_KEY || "",
    googleCSEId: import.meta?.env?.VITE_GOOGLE_CSE_ID || "",

    // API endpoints
    openAIURL: import.meta?.env?.VITE_OPENAI_API_URL || "https://api.openai.com/v1/chat/completions",
    googleURL: import.meta?.env?.VITE_GOOGLE_SEARCH_API_URL || "https://www.googleapis.com/customsearch/v1",

    // Language settings
    language: import.meta?.env?.VITE_DEFAULT_LANGUAGE || "en-US"
};

export default config;
