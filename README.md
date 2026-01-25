# 🎤 Voxon - AI Voice Assistant

Voxon is an intelligent voice assistant powered by OpenAI GPT and Google Search. It features voice commands, YouTube/Spotify playback, web search, and a modern UI with real-time audio visualization.

## ✨ Features

### 🗣️ Voice & Chat
- **Speech-to-Text**: Talk to Voxon using your microphone
- **Text-to-Speech**: Voxon speaks responses back to you
- **AI Chat**: Powered by GPT-4o-mini for intelligent conversations

### 🎵 Media Commands
| Command | Action |
|---------|--------|
| `Play [song]` | Search & play on YouTube |
| `Play [song] on Spotify` | Search & play on Spotify |
| `Play [song] on YouTube` | Explicit YouTube playback |
| `Open [channel] channel` | Open YouTube channel |
| `Search [query] on YouTube` | Search YouTube |

### 🌐 Web Commands
| Command | Action |
|---------|--------|
| `Open [website]` | Opens any website |
| `What's the weather?` | Live weather search |
| `Today's news` | Fetches latest news |
| `Reload` / `Refresh` | Reloads the page |

### 🎨 UI Features
- Real-time audio visualizer
- Dark/Light theme toggle
- Persistent chat history
- Glass-morphism modern design

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/DhanushPillay/Voxon.git
cd Voxon/server
npm install
```

### 2. Configure API Keys
Create `server/.env` with your keys:
```env
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CSE_ID=your_google_cse_id
```

### 3. Start the Server
```bash
cd server
npm start
```

### 4. Open in Browser
Navigate to **http://localhost:3000** (Chrome/Edge recommended)

## � Project Structure

```
Voxon/
├── index.html              # Main entry point
├── src/
│   ├── js/
│   │   └── app.js          # Main application logic
│   └── css/
│       └── styles.css      # Stylesheets
├── server/
│   ├── index.js            # Express API proxy server
│   ├── package.json        # Server dependencies
│   └── .env                # API keys (not in git)

├── .env.example            # API key template
└── README.md
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML5, CSS3, JavaScript ES6+ |
| **Backend** | Node.js, Express |
| **APIs** | OpenAI GPT-4o-mini, Google Custom Search |
| **Browser APIs** | Web Speech, Web Audio |

## 🔒 Security

API keys are stored securely on the backend server. The frontend never has access to your keys.



## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

Made with ❤️ by [Dhanush Pillay](https://github.com/DhanushPillay)
