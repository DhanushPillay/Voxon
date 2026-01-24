// Voxon - AI Voice Assistant Script

// Assistant configuration
// IMPORTANT: API keys should be loaded from environment variables
// See .env.example for setup instructions
const assistantConfig = {
  language: "en-US",
  // For security, these should be loaded from a backend or build-time environment variables
  // NEVER hardcode API keys in client-side code
  openAIKey: "", // Load from environment or backend
  googleApiKey: "", // Load from environment or backend
  googleCSEId: "", // Load from environment or backend
  openAIURL: "https://api.openai.com/v1/chat/completions",
  googleURL: "https://www.googleapis.com/customsearch/v1"
};

// State variables
let chatHistory = [];
let recognition = null;
let isListening = false;

// Audio Visualizer variables
let audioContext, analyser, dataArray, source, animationId;
let canvas, canvasCtx;

// ============ Theme Management ============
function loadTheme() {
  const savedTheme = localStorage.getItem("voxonTheme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeButton(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("voxonTheme", newTheme);
  updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
  const icon = document.getElementById("themeIcon");
  const text = document.getElementById("themeText");
  if (theme === "dark") {
    icon.textContent = "☀️";
    text.textContent = "Light";
  } else {
    icon.textContent = "🌙";
    text.textContent = "Dark";
  }
}

// ============ UI Helpers ============
function updateStatus(message) {
  document.getElementById("status").textContent = message;
}

function showTypingIndicator(show) {
  document.getElementById("typingIndicator").style.display = show ? "inline" : "none";
}

// ============ Chat History ============
function addToChatHistory(user, assistant) {
  chatHistory.push({ user, assistant });
  updateChatHistory();
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

function deleteHistoryEntry(index) {
  chatHistory.splice(index, 1);
  updateChatHistory();
  localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
}

function clearAllHistory() {
  chatHistory = [];
  updateChatHistory();
  localStorage.removeItem("chatHistory");
  updateStatus("Chat history cleared");
}

function updateChatHistory() {
  const historyDiv = document.getElementById("historyEntries");
  historyDiv.innerHTML = "";
  chatHistory.forEach((entry, idx) => {
    const userDiv = document.createElement("div");
    userDiv.className = "chat-entry";
    userDiv.innerHTML = `<span class="chat-user">You:</span> ${entry.user}<br>
      <span class="chat-assistant">Assistant:</span> ${entry.assistant}
      <button class="delete-btn" onclick="deleteHistoryEntry(${idx})">Delete</button>`;
    historyDiv.appendChild(userDiv);
  });
}

// ============ Input Handling ============
function handleTextInput(event) {
  event.preventDefault();
  const input = document.getElementById("textInput").value.trim();
  if (!input) return;
  document.getElementById("userText").textContent = input;
  processInput(input);
  document.getElementById("textInput").value = "";
}

function processInput(transcript) {
  // Reload command
  if (transcript.toLowerCase().includes("reload") || transcript.toLowerCase().includes("refresh")) {
    document.getElementById("assistantResponse").textContent = "Reloading the page...";
    speak("Reloading the page...");
    addToChatHistory(transcript, "Reloading the page...");
    setTimeout(() => {
      location.reload();
    }, 1200);
    return;
  }

  // Play song/video on YouTube
  const playMatch = transcript.match(/play (.+) on youtube/i);
  if (playMatch) {
    const query = playMatch[1].trim();
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    document.getElementById("assistantResponse").textContent = `Playing "${query}" on YouTube...`;
    speak(`Playing ${query} on YouTube`);
    addToChatHistory(transcript, `Playing "${query}" on YouTube...`);
    setTimeout(() => {
      window.open(url, "_blank");
    }, 1200);
    return;
  }

  // Open site command
  const openMatch = transcript.match(/open (.+)/i);
  if (openMatch) {
    let site = openMatch[1].trim().toLowerCase();
    let url = "";

    if (site.match(/^https?:\/\/[^\s]+$/)) {
      url = site;
    } else if (site.match(/^[^\s]+\.[a-z]{2,}$/)) {
      url = "https://" + site;
    } else if (site.includes("youtube")) url = "https://www.youtube.com";
    else if (site.includes("google")) url = "https://www.google.com";
    else if (site.includes("facebook")) url = "https://www.facebook.com";
    else if (site.includes("twitter")) url = "https://www.twitter.com";
    else if (site.includes("github")) url = "https://www.github.com";
    else url = "https://" + site.replace(/\s+/g, "") + ".com";

    document.getElementById("assistantResponse").textContent = `Opening ${site}...`;
    speak(`Opening ${site}`);
    addToChatHistory(transcript, `Opening ${site}...`);
    setTimeout(() => {
      window.open(url, "_blank");
    }, 1200);
    return;
  }

  // Use Google Search for certain keywords
  if (transcript.toLowerCase().includes("weather") || transcript.toLowerCase().includes("today") || transcript.toLowerCase().includes("news")) {
    getLiveSearchResponse(transcript);
  } else {
    getAIResponse(transcript);
  }
}

// ============ Speech Recognition ============
function startListening() {
  if (isListening) {
    updateStatus("Already listening...");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Speech Recognition not supported in this browser.");
    updateStatus("Speech recognition not supported");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = assistantConfig.language;
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onstart = function () {
    isListening = true;
    updateStatus("Listening... Speak now");
    document.getElementById("listenBtn").classList.add("pulse");
    document.getElementById("listenBtn").textContent = "🎤 Listening...";
    startVisualizer();
  };

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript;
    document.getElementById("userText").textContent = transcript;
    processInput(transcript);
  };

  recognition.onerror = function (event) {
    console.error("Speech recognition error", event.error);
    updateStatus("Error: " + event.error);
    isListening = false;
    resetListenButton();
    stopVisualizer();
  };

  recognition.onend = function () {
    isListening = false;
    resetListenButton();
    updateStatus("Ready to listen");
    stopVisualizer();
  };

  try {
    recognition.start();
    updateStatus("Starting speech recognition...");
  } catch (error) {
    console.error("Recognition start error:", error);
    updateStatus("Error starting recognition");
  }
}

function resetListenButton() {
  document.getElementById("listenBtn").classList.remove("pulse");
  document.getElementById("listenBtn").textContent = "🎤 Talk";
}

function stopSpeech() {
  window.speechSynthesis.cancel();
  if (isListening && recognition) {
    recognition.stop();
  }
  stopVisualizer();
  updateStatus("Speech stopped");
}

// ============ AI Response ============
async function getAIResponse(question) {
  showTypingIndicator(true);
  document.getElementById("assistantResponse").textContent = "Thinking...";
  window.speechSynthesis.cancel();
  updateStatus("Getting AI response...");

  try {
    const res = await fetch(assistantConfig.openAIURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${assistantConfig.openAIKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: question }]
      })
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    const reply = data.choices[0].message.content;
    document.getElementById("assistantResponse").textContent = reply;
    speak(reply);
    addToChatHistory(question, reply);
    updateStatus("Response received");
  } catch (error) {
    console.error("AI response error:", error);
    document.getElementById("assistantResponse").textContent = "Error fetching AI response. Please check console for details.";
    addToChatHistory(question, "Error fetching AI response.");
    updateStatus("Error getting response");
  }
  showTypingIndicator(false);
}

// ============ Google Search ============
async function getLiveSearchResponse(query) {
  showTypingIndicator(true);
  document.getElementById("assistantResponse").textContent = "Searching the web...";
  window.speechSynthesis.cancel();
  updateStatus("Searching web...");

  try {
    const url = `${assistantConfig.googleURL}?key=${assistantConfig.googleApiKey}&cx=${assistantConfig.googleCSEId}&q=${encodeURIComponent(query)}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Google API error: ${res.status}`);
    }

    const data = await res.json();
    if (data.items && data.items.length > 0) {
      let reply = "";
      data.items.slice(0, 3).forEach((item, idx) => {
        reply += `${idx + 1}. ${item.title} — ${item.snippet}\n`;
      });
      document.getElementById("assistantResponse").textContent = reply;
      speak(data.items[0].title + ". " + data.items[0].snippet);
      addToChatHistory(query, reply);
      updateStatus("Search results received");
    } else {
      document.getElementById("assistantResponse").textContent = "No results found.";
      addToChatHistory(query, "No results found.");
      updateStatus("No results found");
    }
  } catch (error) {
    console.error("Search error:", error);
    document.getElementById("assistantResponse").textContent = "Error fetching live search. Please check console for details.";
    addToChatHistory(query, "Error fetching live search.");
    updateStatus("Error searching");
  }
  showTypingIndicator(false);
}

// ============ Text-to-Speech ============
function speak(text) {
  window.speechSynthesis.cancel();
  // Basic language detection for speech synthesis
  let lang = assistantConfig.language; // default to English
  if (/[\u0600-\u06FF]/.test(text)) lang = "ar-SA"; // Arabic
  else if (/[\u4e00-\u9fff]/.test(text)) lang = "zh-CN"; // Chinese
  else if (/[\u0400-\u04FF]/.test(text)) lang = "ru-RU"; // Russian
  else if (/[\u0900-\u097F]/.test(text)) lang = "hi-IN"; // Hindi
  else if (/¿|¡|á|é|í|ó|ú|ñ/.test(text)) lang = "es-ES"; // Spanish
  else if (/[\u3040-\u30ff]/.test(text)) lang = "ja-JP"; // Japanese
  else if (/[\u0E00-\u0E7F]/.test(text)) lang = "th-TH"; // Thai
  else if (/[\uAC00-\uD7AF]/.test(text)) lang = "ko-KR"; // Korean

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.onstart = function () {
    updateStatus("Speaking...");
  };
  utterance.onend = function () {
    updateStatus("Finished speaking");
  };
  window.speechSynthesis.speak(utterance);
}

// ============ Audio Visualizer ============
async function startVisualizer() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    canvas.style.display = "block";
    drawVisualizer();
  } catch (err) {
    console.error("Error accessing microphone for visualizer:", err);
  }
}

function drawVisualizer() {
  animationId = requestAnimationFrame(drawVisualizer);
  analyser.getByteFrequencyData(dataArray);

  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

  const barWidth = (canvas.width / dataArray.length) * 2.5;
  let barHeight;
  let x = 0;

  for (let i = 0; i < dataArray.length; i++) {
    barHeight = dataArray[i] / 3; // Scale down height

    // Gradient color based on height
    const r = barHeight + 25 * (i / dataArray.length);
    const g = 250 * (i / dataArray.length);
    const b = 50;

    canvasCtx.fillStyle = `rgb(${r},${g},${b})`;
    canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

    x += barWidth + 1;
  }
}

function stopVisualizer() {
  if (source && source.mediaStream) {
    source.mediaStream.getTracks().forEach(track => track.stop());
    source.disconnect();
  }
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
  }
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  canvas.style.display = "none";
}

// ============ Initialization ============
window.onload = function () {
  // Initialize canvas
  canvas = document.getElementById("visualizer");
  canvasCtx = canvas.getContext("2d");

  // Load theme
  loadTheme();

  // Load chat history
  const savedHistory = localStorage.getItem("chatHistory");
  if (savedHistory) {
    chatHistory = JSON.parse(savedHistory);
    updateChatHistory();
  }

  updateStatus("Ready to listen");
};
