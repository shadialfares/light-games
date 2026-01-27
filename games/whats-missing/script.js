const categories = {
    animals: ['🦁', '🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🐮', '🐸', '🐵', '🐔', '🐧'],
    fruits: ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🍍', '🥝', '🥑', '🍑', '🥭', '🍐', '🍊', '🍋', '🍈', '🥥'],
    vehicles: ['🚗', '🚕', '🚙', '🚌', '🚓', '🚑', '🚒', '🚲', '🛵', '🚂', '✈️', '🚀', '🚁', '🚤', '🚜', '🚚']
};

const difficulties = {
    easy: { count: 3, time: 5000 },
    medium: { count: 5, time: 7000 },
    hard: { count: 7, time: 8000 }
};

let currentCategory = 'animals';
let currentDifficulty = 'easy';
let score = 0;
let round = 1;
let maxRounds = 5;
let currentItems = [];
let missingItem = '';
let isGameActive = false;

// DOM Elements
const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    result: document.getElementById('result-screen')
};
const itemsGrid = document.getElementById('items-grid');
const optionsArea = document.getElementById('options-area');
const choicesGrid = document.getElementById('choices-grid');
const timerFill = document.getElementById('timer-fill');
const phaseText = document.getElementById('phase-text');
const scoreEl = document.getElementById('score');
const roundEl = document.getElementById('round');
const settingsBtn = document.getElementById('settings-btn');

let scheduledTimeouts = [];

function addTimeout(fn, ms) {
    const id = setTimeout(fn, ms);
    scheduledTimeouts.push(id);
    return id;
}

function clearAllTimeouts() {
    scheduledTimeouts.forEach(clearTimeout);
    scheduledTimeouts = [];
}

// Setup Event Listeners
document.querySelectorAll('.opt-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const parent = btn.parentElement;
        parent.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        if (parent.id === 'category-options') {
            currentCategory = btn.dataset.value;
        } else {
            currentDifficulty = btn.dataset.value;
        }
    });
});

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', () => {
    clearAllTimeouts();
    showScreen('start');
});

settingsBtn.addEventListener('click', () => {
    isGameActive = false;
    clearAllTimeouts();
    itemsGrid.innerHTML = '';
    choicesGrid.innerHTML = '';
    optionsArea.classList.add('hidden');
    timerFill.style.transition = 'none';
    timerFill.style.width = '100%';
    phaseText.textContent = 'احفظ هذه الأشكال! 👀';
    showScreen('start');
});

function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
}

function startGame() {
    score = 0;
    round = 1;
    updateHUD();
    showScreen('game');
    startRound();
}

function updateHUD() {
    scoreEl.textContent = score;
    roundEl.textContent = `${round}/${maxRounds}`;
}

function startRound() {
    isGameActive = true;
    optionsArea.classList.add('hidden');
    itemsGrid.innerHTML = '';
    phaseText.textContent = 'احفظ هذه الأشكال! 👀';
    timerFill.style.transition = 'none';
    timerFill.style.width = '100%';

    // Select items
    const pool = [...categories[currentCategory]];
    const count = difficulties[currentDifficulty].count;
    currentItems = [];
    
    // Get random items
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        currentItems.push(pool[randomIndex]);
        pool.splice(randomIndex, 1);
    }

    // Display items
    displayItems(currentItems);

    // Start timer
    const memorizeTime = difficulties[currentDifficulty].time;
    
    // Force reflow for CSS transition
    addTimeout(() => {
        timerFill.style.transition = `width ${memorizeTime}ms linear`;
        timerFill.style.width = '0%';
    }, 50);

    addTimeout(() => {
        if (isGameActive) hidePhase();
    }, memorizeTime);
}

function displayItems(items) {
    itemsGrid.innerHTML = '';
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'game-item';
        div.textContent = item;
        itemsGrid.appendChild(div);
    });
}

function hidePhase() {
    phaseText.textContent = 'ماذا اختفى؟ 🤔';
    
    // Select item to remove
    const removeIndex = Math.floor(Math.random() * currentItems.length);
    missingItem = currentItems[removeIndex];
    
    // Create new list without missing item
    const displayedItems = [...currentItems];
    displayedItems.splice(removeIndex, 1);
    
    // Shuffle displayed items to make it harder (optional, but good)
    displayedItems.sort(() => Math.random() - 0.5);
    
    displayItems(displayedItems);
    showOptions();
}

function showOptions() {
    optionsArea.classList.remove('hidden');
    choicesGrid.innerHTML = '';
    
    // Create options: Correct answer + 2 random wrong ones from remaining category items
    // But to be fair, distractors should be items NOT currently displayed if possible, 
    // OR just use the pool of items that were NOT selected for this round.
    
    const pool = categories[currentCategory].filter(item => !currentItems.includes(item));
    const distractors = [];
    
    // Get 2 distractors
    for(let i=0; i<2; i++) {
        if(pool.length > 0) {
            const idx = Math.floor(Math.random() * pool.length);
            distractors.push(pool[idx]);
            pool.splice(idx, 1);
        }
    }
    
    const options = [missingItem, ...distractors];
    options.sort(() => Math.random() - 0.5);
    
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = opt;
        btn.onclick = () => handleGuess(opt, btn);
        choicesGrid.appendChild(btn);
    });
}

function handleGuess(guess, btnElement) {
    if (!isGameActive) return;
    
    const buttons = choicesGrid.querySelectorAll('.choice-btn');
    buttons.forEach(b => b.disabled = true);
    
    if (guess === missingItem) {
        btnElement.classList.add('correct');
        score += 10;
        phaseText.textContent = 'ممتاز! إجابة صحيحة 👏';
        triggerConfetti();
    } else {
        btnElement.classList.add('wrong');
        phaseText.textContent = `خطأ! الشكل المختفي هو ${missingItem}`;
        // Highlight correct one
        buttons.forEach(b => {
            if (b.textContent === missingItem) b.classList.add('correct');
        });
    }
    
    updateHUD();
    isGameActive = false;
    
    addTimeout(() => {
        if (round < maxRounds) {
            round++;
            startRound();
        } else {
            endGame();
        }
    }, 2000);
}

function endGame() {
    showScreen('result');
    document.getElementById('final-score').textContent = score;
    const title = document.getElementById('result-title');
    const emoji = document.getElementById('result-emoji');
    
    if (score >= maxRounds * 10) {
        title.textContent = 'مذهل! ذاكرة حديدية 🧠';
        emoji.textContent = '🏆';
        triggerConfetti();
    } else if (score >= maxRounds * 5) {
        title.textContent = 'أحسنت! مستوى جيد 👍';
        emoji.textContent = '🥈';
    } else {
        title.textContent = 'حاول مرة أخرى 💪';
        emoji.textContent = '🥉';
    }
}

function triggerConfetti() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}
