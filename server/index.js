/**
 * Voxon Backend API Proxy Server
 * 
 * This server securely handles API calls to OpenAI and Google,
 * keeping API keys on the server side only.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the parent directory
app.use(express.static(path.join(__dirname, '..')));

// ============ API Endpoints ============

/**
 * POST /api/chat
 * Proxies requests to OpenAI Chat Completion API
 */
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: message }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({ error: errorData.error?.message || 'OpenAI API error' });
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;
        res.json({ reply });

    } catch (error) {
        console.error('OpenAI API error:', error);
        res.status(500).json({ error: 'Failed to get AI response' });
    }
});

/**
 * GET /api/search
 * Proxies requests to Google Custom Search API
 */
app.get('/api/search', async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Query is required' });
    }

    if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_CSE_ID) {
        return res.status(500).json({ error: 'Google API credentials not configured' });
    }

    try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${process.env.GOOGLE_CSE_ID}&q=${encodeURIComponent(q)}`;
        const response = await fetch(url);

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({ error: errorData.error?.message || 'Google API error' });
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Google Search API error:', error);
        res.status(500).json({ error: 'Failed to perform search' });
    }
});

// ============ Health Check ============
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        openai: !!process.env.OPENAI_API_KEY,
        google: !!process.env.GOOGLE_API_KEY && !!process.env.GOOGLE_CSE_ID
    });
});

// ============ Start Server ============
app.listen(PORT, () => {
    console.log(`\n🚀 Voxon server running at http://localhost:${PORT}`);
    console.log(`📁 Serving frontend from ${path.join(__dirname, '..')}`);
    console.log(`\n✅ API Keys configured:`);
    console.log(`   - OpenAI: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
    console.log(`   - Google: ${process.env.GOOGLE_API_KEY ? 'Yes' : 'No'}\n`);
});
