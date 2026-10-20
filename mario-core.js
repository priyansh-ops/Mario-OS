/* M.A.R.I.O. // QUANTUM NEURAL CORE */

const STATE = {
  activeTab: 'hud-tab',
  isListening: false,
  isLocked: true,
  geminiKey: localStorage.getItem('mario_gemini_key') || '',
  auxKey: localStorage.getItem('mario_aux_key') || '',
  wakeWord: localStorage.getItem('mario_wake') || 'Mario',
  passphrase: localStorage.getItem('mario_pass') || 'Eternity is great',
  memories: JSON.parse(localStorage.getItem('mario_memories') || '[]')
};

// Tab Switching
document.querySelectorAll('.deck-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.deck-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const tabId = btn.getAttribute('data-tab');
    document.getElementById(tabId).classList.add('active');
  });
});

// Config Storage
document.getElementById('save-config').addEventListener('click', () => {
  const gKey = document.getElementById('gemini-key').value.trim();
  const aKey = document.getElementById('aux-key').value.trim();
  const wWord = document.getElementById('wake-word').value.trim();
  const pWord = document.getElementById('passphrase').value.trim();

  if (gKey) localStorage.setItem('mario_gemini_key', gKey);
  if (aKey) localStorage.setItem('mario_aux_key', aKey);
  if (wWord) localStorage.setItem('mario_wake', wWord);
  if (pWord) localStorage.setItem('mario_pass', pWord);

  STATE.geminiKey = gKey || STATE.geminiKey;
  STATE.auxKey = aKey || STATE.auxKey;
  STATE.wakeWord = wWord || STATE.wakeWord;
  STATE.passphrase = pWord || STATE.passphrase;

  document.getElementById('security-state').textContent = 'UNLOCKED';
  document.getElementById('security-state').classList.remove('locked');
  appendMessage('MARIO', 'Neural Protocols synchronized. Keys locked in local secure vault.');
});

// Canvas Arc Visualizer
const canvas = document.getElementById('visualizer-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 170;
canvas.height = 170;

let angle = 0;
function drawReactor() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 60;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = STATE.isListening ? '#00d2ff' : '#e6b800';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Floating Particles
  for (let i = 0; i < 8; i++) {
    const pAngle = angle + (i * (Math.PI / 4));
    const px = centerX + Math.cos(pAngle) * (radius + 8);
    const py = centerY + Math.sin(pAngle) * (radius + 8);
    ctx.fillStyle = STATE.isListening ? '#00d2ff' : '#e6b800';
    ctx.fillRect(px - 2, py - 2, 4, 4);
  }

  angle += STATE.isListening ? 0.08 : 0.02;
  requestAnimationFrame(drawReactor);
}
drawReactor();

// Terminal Chat Execution
document.getElementById('terminal-send').addEventListener('click', handleTerminalCommand);
document.getElementById('terminal-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleTerminalCommand();
});

function handleTerminalCommand() {
  const input = document.getElementById('terminal-input');
  const text = input.value.trim();
  if (!text) return;

  appendMessage('PRIYANSH', text);
  input.value = '';
  processAIQuery(text);
}

function appendMessage(sender, text) {
  const feed = document.getElementById('terminal-feed');
  const div = document.createElement('div');
  div.className = sender === 'MARIO' ? 'msg mario-msg' : 'msg user-msg';
  div.innerHTML = `<span class="speaker">${sender}:</span>${text}`;
  feed.appendChild(div);
  feed.scrollTop = feed.scrollHeight;
}

// Gemini Multi-Route Engine
async function processAIQuery(query) {
  const status = document.getElementById('status-text');
  status.textContent = 'NEURAL PROCESSING...';

  if (!STATE.geminiKey) {
    status.textContent = 'AWAITING KEY';
    appendMessage('MARIO', 'Warning: Config tab me jaakar Gemini API key link karo pehle!');
    return;
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${STATE.geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `System Prompt: You are MARIO, an autonomous elite futuristic AI assistant built for Priyansh. You possess sharp intellect, blunt honesty, and casual witty banter. Talk in natural Hinglish or casual Hindi. Never sound robotic. Never give boring generic replies. Directly address the user's command. User says: "${query}"`
          }]
        }]
      })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Subroutine failed to output valid tensor.';
    
    appendMessage('MARIO', reply);
    status.textContent = 'SYSTEM ARMED // ACTIVE';
    speakCasual(reply);
    saveMemoryLog(query, reply);

  } catch (err) {
    appendMessage('MARIO', `Neural route error: ${err.message}`);
    status.textContent = 'ROUTE FAULT';
  }
}

// Natural Voice Engine
function speakCasual(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const cleanText = text.replace(/[*#_`]/g, '');
  const utter = new SpeechSynthesisUtterance(cleanText);
  utter.rate = 1.05;
  utter.pitch = 0.95;

  const voices = window.speechSynthesis.getVoices();
  const hindiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
  if (hindiVoice) utter.voice = hindiVoice;

  window.speechSynthesis.speak(utter);
}

// Memory Vault Storage
function saveMemoryLog(q, r) {
  const logContainer = document.getElementById('memory-logs');
  const entry = document.createElement('div');
  entry.className = 'memory-entry';
  entry.innerHTML = `
    <span class="mem-time">[${new Date().toLocaleTimeString()}]</span>
    <p><strong>Query:</strong> ${q}</p>
    <p><strong>Memo:</strong> ${r.slice(0, 100)}...</p>
  `;
  logContainer.prepend(entry);
}
