# 🔐 API Security Setup

## ⚠️ CRITICAL SECURITY NOTICE

Your API keys have been moved to the `.env` file. **The keys that were previously in your code are now exposed and should be regenerated immediately!**

## Immediate Actions Required

### 1. Regenerate Your API Keys

**OpenAI API Key:**
1. Go to https://platform.openai.com/api-keys
2. Revoke the old key: `sk-proj-p1Ver3bx...` 
3. Create a new API key
4. Update your `.env` file with the new key

**Google API Key:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Delete or restrict the old key
3. Create a new API key with proper restrictions
4. Update your `.env` file with the new key

### 2. Setup Your Environment

1. **Copy the template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and add your NEW API keys:**
   ```env
   OPENAI_API_KEY=your_new_openai_key
   GOOGLE_API_KEY=your_new_google_key
   GOOGLE_CSE_ID=your_cse_id
   ```

3. **Never commit `.env` to Git** (already added to `.gitignore`)

### 3. Important Security Note for Browser Apps

⚠️ **Client-side apps cannot securely use API keys!** 

Since Voxon runs in the browser, API keys will still be visible to users. For production use, you should:

1. **Create a backend server** to proxy API calls
2. **Use environment variables** on the server
3. **Never expose API keys** to the client

## Recommended Production Architecture

```
User Browser → Your Backend Server → OpenAI/Google APIs
                (with API keys)
```

## Quick Fix for Development

For now, to make your app work locally:

1. Manually add your keys to `assistantConfig` in `script.js` (lines 9-11)
2. **NEVER commit this file** with keys in it
3. Use git commands to ignore local changes:
   ```bash
   git update-index --assume-unchanged script.js
   ```

## Better Solution: Use a Build Tool

Consider using Vite or similar to inject environment variables at build time:

```bash
npm create vite@latest
# Then use import.meta.env.VITE_OPENAI_API_KEY
```

## Files Created

- `.env` - Your actual API keys (DO NOT COMMIT)
- `.env.example` - Template file (safe to commit)
- `.gitignore` - Prevents `.env` from being committed
- `config.js` - Configuration loader (for future use with bundlers)
- `API_SECURITY.md` - This file

## Need Help?

If you need help setting up a proper backend to secure your API keys, let me know!
