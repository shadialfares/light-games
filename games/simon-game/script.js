// Audio Context for synthesizing sounds
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

const frequencies = {
    green: 329.63,  // E4
    red: 261.63,    // C4
    yellow: 293.66, // D4
    blue: 392.00,   // G4
    error: 110.00   // A2 (Error buzz)
};

// Game State
let gameSequence = [];
let userSequence = [];
let isGameActive = false;
let isUserTurn = false;
let level = 1;
let highScore = 0;

// DOM Elements
const buttons = {
    green: document.getElementById('btn-green'),
    red: document.getElementById('btn-red'),
    yellow: document.getElementById('btn-yellow'),
    blue: document.getElementById('btn-blue')
};
const startBtn = document.getElementById('start-btn');
const statusText = document.getElementById('status-text');
const levelDisplay = document.getElementById('level');
const highScoreDisplay = document.getElementById('high-score');

// Sound Function
function playSound(color) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = color === 'error' ? 'sawtooth' : 'sine';
    oscillator.frequency.setValueAtTime(frequencies[color], audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
}

// Visual Activation
function activateButton(color) {
    const btn = buttons[color];
    btn.classList.add('active');
    playSound(color);
    
    setTimeout(() => {
        btn.classList.remove('active');
    }, 300);
}

// Game Logic
function startGame() {
    if (isGameActive) return;
    
    isGameActive = true;
    level = 1;
    gameSequence = [];
    userSequence = [];
    levelDisplay.textContent = level;
    startBtn.disabled = true;
    statusText.textContent = 'استعد...';
    
    setTimeout(nextRound, 1000);
}

function nextRound() {
    userSequence = [];
    isUserTurn = false;
    statusText.textContent = 'شاهد النمط';
    
    // Add new color to sequence
    const colors = ['green', 'red', 'yellow', 'blue'];
    const randomColor = colors[Math.floor(Math.random() * 4)];
    gameSequence.push(randomColor);
    
    playSequence();
}

function playSequence() {
    let i = 0;
    const interval = setInterval(() => {
        activateButton(gameSequence[i]);
        i++;
        
        if (i >= gameSequence.length) {
            clearInterval(interval);
            setTimeout(() => {
                isUserTurn = true;
                statusText.textContent = 'دورك الآن!';
            }, 500);
        }
    }, 600); // Speed of sequence
}

function handleInput(color) {
    if (!isGameActive || !isUserTurn) return;
    
    activateButton(color);
    userSequence.push(color);
    
    // Check correctness
    const currentIndex = userSequence.length - 1;
    if (userSequence[currentIndex] !== gameSequence[currentIndex]) {
        gameOver();
        return;
    }
    
    // Check if round complete
    if (userSequence.length === gameSequence.length) {
        isUserTurn = false;
        level++;
        levelDisplay.textContent = level;
        statusText.textContent = 'ممتاز!';
        
        if (level > highScore) {
            highScore = level;
            highScoreDisplay.textContent = highScore;
        }
        
        setTimeout(nextRound, 1000);
    }
}

function gameOver() {
    isGameActive = false;
    playSound('error');
    statusText.textContent = 'خسرت! حاول مجدداً';
    startBtn.disabled = false;
    startBtn.textContent = 'إعادة اللعب ↺';
    
    // Flash all red
    document.body.style.backgroundColor = '#c0392b';
    setTimeout(() => {
        document.body.style.backgroundColor = '';
    }, 200);
}

// Event Listeners
startBtn.addEventListener('click', startGame);

Object.keys(buttons).forEach(color => {
    buttons[color].addEventListener('mousedown', () => handleInput(color));
    buttons[color].addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent ghost click
        handleInput(color);
    });
});

// Load high score from local storage
const savedScore = localStorage.getItem('simonHighScore');
if (savedScore) {
    highScore = parseInt(savedScore);
    highScoreDisplay.textContent = highScore;
}

// Save high score
window.addEventListener('beforeunload', () => {
    localStorage.setItem('simonHighScore', highScore);
});
