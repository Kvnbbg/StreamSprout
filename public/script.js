const rosterList = document.getElementById('roster-list');
const rosterState = document.getElementById('roster-state');
const apiStatus = document.getElementById('api-status');
const syncStatus = document.getElementById('sync-status');
const lastUpdated = document.getElementById('last-updated');
const searchInput = document.getElementById('search');
const playerForm = document.getElementById('player-form');
const playerFeedback = document.getElementById('player-feedback');
const chatLog = document.getElementById('chat-log');
const askForm = document.getElementById('ask-form');
const askInput = document.getElementById('ask-input');
const askFeedback = document.getElementById('ask-feedback');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelectorAll('.nav-link');

const metricTotal = document.getElementById('metric-total');
const metricRole = document.getElementById('metric-role');
const metricAgent = document.getElementById('metric-agent');

let rosterCache = [];
let searchTimeout;

const updateStatus = (element, message, tone = 'neutral') => {
    element.textContent = message;
    element.dataset.tone = tone;
    element.className = `status-pill ${tone}`;
};

const setFeedback = (element, message, tone = 'neutral') => {
    element.textContent = message;
    element.style.color = tone === 'error' ? '#ff8a8a' : '#ffb347';
};

const renderRoster = (players) => {
    rosterList.innerHTML = '';

    if (!players.length) {
        rosterState.textContent = 'No players found yet. Add your first roster entry.';
        rosterState.style.display = 'block';
        return;
    }

    rosterState.style.display = 'none';

    players.forEach((player) => {
        const item = document.createElement('li');
        item.className = 'roster-item';
        item.innerHTML = `
            <strong>${player.name}</strong>
            <span>Role: ${player.role} · Rank: ${player.rank}</span>
            <span>Signature agent: ${player.agent}</span>
        `;
        rosterList.appendChild(item);
    });
};

const computeTop = (items, key) => {
    if (!items.length) return '--';
    const tally = items.reduce((acc, item) => {
        acc[item[key]] = (acc[item[key]] || 0) + 1;
        return acc;
    }, {});
    const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || '--';
};

const renderAnalytics = (players) => {
    metricTotal.textContent = players.length || '--';
    metricRole.textContent = computeTop(players, 'role');
    metricAgent.textContent = computeTop(players, 'agent');
};

const updateTimestamp = () => {
    const timestamp = new Date().toLocaleTimeString();
    lastUpdated.textContent = `Last updated: ${timestamp}`;
};

const fetchRoster = async (query = '') => {
    rosterState.style.display = 'block';
    rosterState.textContent = 'Loading roster...';
    syncStatus.textContent = 'Syncing roster...';

    const endpoint = query ? `/search-players?name=${encodeURIComponent(query)}` : '/players';

    try {
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error('Unable to fetch roster data.');
        }
        const data = await response.json();
        rosterCache = data;
        renderRoster(data);
        renderAnalytics(data);
        syncStatus.textContent = 'Roster synced';
        updateTimestamp();
    } catch (error) {
        rosterState.textContent = 'Roster is unavailable. Check your server connection.';
        rosterList.innerHTML = '';
        syncStatus.textContent = 'Roster sync failed';
    }
};

const sendPlayer = async (payload) => {
    setFeedback(playerFeedback, 'Saving player...');
    try {
        const response = await fetch('/players', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Unable to save player.');
        }

        setFeedback(playerFeedback, 'Player saved successfully.');
        await fetchRoster(searchInput.value.trim());
        playerForm.reset();
    } catch (error) {
        setFeedback(playerFeedback, error.message, 'error');
    }
};

const appendChatMessage = (label, message) => {
    const div = document.createElement('div');
    div.className = 'chat-message';
    div.innerHTML = `<strong>${label}</strong><p>${message}</p>`;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
};

const askAssistant = async (question) => {
    appendChatMessage('You', question);
    appendChatMessage('AI', 'Thinking through roster data and current meta...');

    const loadingNode = chatLog.lastElementChild;

    try {
        const response = await fetch('/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Assistant is unavailable right now.');
        }

        const data = await response.json();
        loadingNode.querySelector('p').textContent = data.answer;
        askFeedback.textContent = '';
    } catch (error) {
        loadingNode.querySelector('p').textContent =
            'Unable to reach the assistant. Confirm your LLM credentials and try again.';
        setFeedback(askFeedback, error.message, 'error');
    }
};

const checkHealth = async () => {
    try {
        const response = await fetch('/health');
        if (!response.ok) throw new Error('API not reachable');
        updateStatus(apiStatus, 'API online', 'success');
    } catch (error) {
        updateStatus(apiStatus, 'API offline', 'error');
    }
};

searchInput.addEventListener('input', (event) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        fetchRoster(event.target.value.trim());
    }, 300);
});

playerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const payload = {
        name: document.getElementById('player-name').value.trim(),
        role: document.getElementById('player-role').value.trim(),
        rank: document.getElementById('player-rank').value.trim(),
        agent: document.getElementById('player-agent').value.trim(),
    };

    if (!payload.name || !payload.role || !payload.rank || !payload.agent) {
        setFeedback(playerFeedback, 'Please complete every field before saving.', 'error');
        return;
    }

    sendPlayer(payload);
});

askForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const question = askInput.value.trim();
    if (!question) {
        setFeedback(askFeedback, 'Type a question for the assistant.', 'error');
        return;
    }
    askInput.value = '';
    askAssistant(question);
});

const init = async () => {
    updateStatus(apiStatus, 'Checking API...', 'neutral');
    await checkHealth();
    await fetchRoster();
};

init();

if (navToggle) {
    navToggle.addEventListener('click', () => {
        const isOpen = document.body.classList.toggle('nav-open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (document.body.classList.contains('nav-open')) {
                document.body.classList.remove('nav-open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });
}
