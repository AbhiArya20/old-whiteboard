const usernameInput = document.getElementById('username');
const connectBtn = document.getElementById('connect-btn');
const disconnectBtn = document.getElementById('disconnect-btn');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const wifiIcon = document.getElementById('wifi-icon');
const toastContainer = document.getElementById('toast-container');
const featureCards = document.querySelectorAll('.feature-card');
featureCards.forEach((card, index) => {
    card.style.opacity = '0'; card.style.transform = 'translateY(20px)';
    setTimeout(() => {
        card.style.transition = 'all 0.5s ease'; card.style.opacity = '1'; card.style.transform = 'translateY(0)';
    }, 800 + (index * 100));
}); let socket = null;
let isConnected = false;
function connectToWebSocket() {
    const username = usernameInput.value.trim();
    if (!username) {
        showToast('Username required', 'Please enter a username to connect', 'error');
        return;
    }
    try {
        socket = new WebSocket('wss://echo.websocket.org'); socket.onopen = function () {
            isConnected = true; updateConnectionStatus(true); showToast('Connected!', `Welcome to the server, ${username}!`, 'success'); socket.send(JSON.stringify({ type: 'join', username }));
        }; socket.onmessage = function (event) { console.log('Message from server:', event.data); }; socket.onclose = function () { isConnected = false; updateConnectionStatus(false); showToast('Disconnected', 'Connection to the server was closed', 'error'); }; socket.onerror = function (error) { console.error('WebSocket error:', error); showToast('Connection error', 'Failed to connect to the server', 'error'); };
    } catch (error) { console.error('Error connecting to WebSocket:', error); showToast('Connection error', 'Failed to connect to the server', 'error'); }
}
function disconnectFromWebSocket() {
    if (socket) {
        socket.close(); isConnected = false; updateConnectionStatus(false);
        showToast('Disconnected', 'You\'ve been disconnected from the server', 'error');
    }
}
function updateConnectionStatus(connected) {
    if (connected) {
        statusIndicator.classList.add('connected');
        statusText.textContent = 'Connected to server'; wifiIcon.style.display = 'inline-block';
        connectBtn.style.display = 'none'; disconnectBtn.style.display = 'flex'; usernameInput.disabled = true;
    } else {
        statusIndicator.classList.remove('connected'); statusText.textContent = 'Not connected'; wifiIcon.style.display = 'none';
        connectBtn.style.display = 'flex'; disconnectBtn.style.display = 'none'; usernameInput.disabled = false;
    }
} function showToast(title, message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`; toast.innerHTML = `${title}${message}`; toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards'; setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 5000);
} connectBtn.addEventListener('click', connectToWebSocket);
disconnectBtn.addEventListener('click', disconnectFromWebSocket);
window.addEventListener('beforeunload', function () { if (socket) { socket.close(); } });
