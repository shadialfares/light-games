// Expanded Data with Categories
const allGameData = [
    // Animals
    { id: 'lion', char: '🦁', category: 'animals' },
    { id: 'cat', char: '🐱', category: 'animals' },
    { id: 'dog', char: '🐶', category: 'animals' },
    { id: 'fox', char: '🦊', category: 'animals' },
    { id: 'bear', char: '🐻', category: 'animals' },
    { id: 'panda', char: '🐼', category: 'animals' },
    { id: 'koala', char: '🐨', category: 'animals' },
    { id: 'tiger', char: '🐯', category: 'animals' },
    { id: 'monkey', char: '🐵', category: 'animals' },
    { id: 'chicken', char: '🐔', category: 'animals' },
    { id: 'penguin', char: '🐧', category: 'animals' },
    { id: 'frog', char: '🐸', category: 'animals' },
    
    // Fruits
    { id: 'apple', char: '🍎', category: 'fruits' },
    { id: 'banana', char: '🍌', category: 'fruits' },
    { id: 'grapes', char: '🍇', category: 'fruits' },
    { id: 'watermelon', char: '🍉', category: 'fruits' },
    { id: 'orange', char: '🍊', category: 'fruits' },
    { id: 'lemon', char: '🍋', category: 'fruits' },
    { id: 'pineapple', char: '🍍', category: 'fruits' },
    { id: 'strawberry', char: '🍓', category: 'fruits' },
    { id: 'cherry', char: '🍒', category: 'fruits' },
    { id: 'peach', char: '🍑', category: 'fruits' },
    { id: 'pear', char: '🍐', category: 'fruits' },
    { id: 'kiwi', char: '🥝', category: 'fruits' },

    // Shapes (Using geometric emojis or colors)
    { id: 'circle', char: '🔴', category: 'shapes' },
    { id: 'triangle', char: '🔺', category: 'shapes' },
    { id: 'square', char: '🟧', category: 'shapes' },
    { id: 'heart', char: '❤️', category: 'shapes' },
    { id: 'star', char: '⭐', category: 'shapes' },
    { id: 'moon', char: '🌙', category: 'shapes' },
    { id: 'diamond', char: '🔷', category: 'shapes' },
    { id: 'spades', char: '♠️', category: 'shapes' },
    { id: 'clubs', char: '♣️', category: 'shapes' },
    { id: 'spiral', char: '🌀', category: 'shapes' },

    // Transport
    { id: 'car', char: '🚗', category: 'transport' },
    { id: 'taxi', char: '🚕', category: 'transport' },
    { id: 'bus', char: '🚌', category: 'transport' },
    { id: 'police', char: '🚓', category: 'transport' },
    { id: 'ambulance', char: '🚑', category: 'transport' },
    { id: 'fire-truck', char: '🚒', category: 'transport' },
    { id: 'bike', char: '🚲', category: 'transport' },
    { id: 'train', char: '🚂', category: 'transport' },
    { id: 'airplane', char: '✈️', category: 'transport' },
    { id: 'rocket', char: '🚀', category: 'transport' },
    { id: 'ship', char: '🚢', category: 'transport' }
];

// Game State
let currentCategory = 'mixed';
let currentLevel = 'easy';
let score = 0;
let matchedCount = 0;
let totalItemsToPlay = 3;

// DOM Elements
const shadowsContainer = document.getElementById('shadows-container');
const itemsContainer = document.getElementById('items-container');
const scoreElement = document.getElementById('score');
const successMessage = document.getElementById('success-message');
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menu-btn');
const closeSidebarBtn = document.getElementById('close-sidebar');

// Level Configuration
const levels = {
    'easy': 3,
    'medium': 6,
    'hard': 9
};

// Initialize Sidebar Events
function initSidebar() {
    // Category Buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update UI
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Update State
            currentCategory = e.target.dataset.category;
            initGame();
            
            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    // Level Buttons
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Update UI
            document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            // Update State
            currentLevel = e.target.dataset.level;
            totalItemsToPlay = levels[currentLevel];
            initGame();

            // Close sidebar on mobile
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });

    // Menu Toggle
    menuBtn.addEventListener('click', () => {
        sidebar.classList.add('open');
    });

    closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });
}

function initGame() {
    // Reset state
    score = 0;
    matchedCount = 0;
    scoreElement.textContent = score;
    successMessage.classList.add('hidden');
    shadowsContainer.innerHTML = '';
    itemsContainer.innerHTML = '';

    // Filter Data based on Category
    let filteredData = [];
    if (currentCategory === 'mixed') {
        filteredData = [...allGameData];
    } else {
        filteredData = allGameData.filter(item => item.category === currentCategory);
    }

    // Ensure we have enough items for the level
    // If not enough items in category (unlikely with current data but good for safety), reduce count
    const playCount = Math.min(totalItemsToPlay, filteredData.length);

    // Pick random items
    const shuffledData = [...filteredData].sort(() => 0.5 - Math.random());
    const selectedItems = shuffledData.slice(0, playCount);

    // Create Shadows (Targets)
    const shuffledShadows = [...selectedItems].sort(() => 0.5 - Math.random());

    shuffledShadows.forEach(item => {
        const shadowBox = document.createElement('div');
        shadowBox.classList.add('shadow-box');
        shadowBox.dataset.id = item.id;
        
        // Create the silhouette
        const span = document.createElement('span');
        span.textContent = item.char;
        shadowBox.appendChild(span);

        // Add Drop Events
        shadowBox.addEventListener('dragover', handleDragOver);
        shadowBox.addEventListener('dragenter', handleDragEnter);
        shadowBox.addEventListener('dragleave', handleDragLeave);
        shadowBox.addEventListener('drop', handleDrop);

        shadowsContainer.appendChild(shadowBox);
    });

    // Create Draggable Items
    const shuffledDraggables = [...selectedItems].sort(() => 0.5 - Math.random());
    
    shuffledDraggables.forEach(item => {
        const itemBox = document.createElement('div');
        itemBox.classList.add('draggable-item');
        itemBox.draggable = true;
        itemBox.textContent = item.char;
        itemBox.id = item.id; // Using ID to match

        // Add Drag Events
        itemBox.addEventListener('dragstart', handleDragStart);
        itemBox.addEventListener('dragend', handleDragEnd);

        // Touch support for mobile
        itemBox.addEventListener('touchstart', handleTouchStart, {passive: false});
        itemBox.addEventListener('touchmove', handleTouchMove, {passive: false});
        itemBox.addEventListener('touchend', handleTouchEnd);

        itemsContainer.appendChild(itemBox);
    });
}

// --- Drag and Drop Logic (Desktop) ---

let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.id);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedItem = null;
    
    // Clean up any highlight classes left over
    document.querySelectorAll('.shadow-box').forEach(box => {
        box.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    if (!this.classList.contains('matched')) {
        this.style.borderColor = 'var(--primary-color)';
        this.style.transform = 'scale(1.05)';
    }
}

function handleDragLeave(e) {
    this.style.borderColor = '#bbb';
    this.style.transform = 'scale(1)';
}

function handleDrop(e) {
    e.preventDefault();
    this.style.borderColor = '#bbb';
    this.style.transform = 'scale(1)';

    const id = e.dataTransfer.getData('text/plain');
    const draggableElement = document.getElementById(id);

    checkMatch(draggableElement, this);
}

// --- Touch Logic (Mobile) ---
// Simplified implementation for touch dragging
let touchDragItem = null;
let touchStartX = 0;
let touchStartY = 0;
let initialX = 0;
let initialY = 0;

function handleTouchStart(e) {
    e.preventDefault();
    touchDragItem = this;
    const touch = e.touches[0];
    
    // Get initial position relative to viewport
    const rect = this.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
    
    // Calculate offset inside the element
    touchStartX = touch.clientX - initialX;
    touchStartY = touch.clientY - initialY;
    
    this.style.position = 'fixed';
    this.style.left = initialX + 'px';
    this.style.top = initialY + 'px';
    this.style.zIndex = 1000;
    this.style.opacity = '0.8';
}

function handleTouchMove(e) {
    if (!touchDragItem) return;
    e.preventDefault();
    const touch = e.touches[0];
    
    const currentX = touch.clientX - touchStartX;
    const currentY = touch.clientY - touchStartY;
    
    touchDragItem.style.left = currentX + 'px';
    touchDragItem.style.top = currentY + 'px';
}

function handleTouchEnd(e) {
    if (!touchDragItem) return;
    
    // Hide the item briefly to see what's underneath
    touchDragItem.style.display = 'none';
    const touch = e.changedTouches[0];
    const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    touchDragItem.style.display = 'flex';
    
    // Find if we dropped on a shadow box
    const shadowBox = elemBelow ? elemBelow.closest('.shadow-box') : null;
    
    if (shadowBox) {
        checkMatch(touchDragItem, shadowBox);
    } else {
        // Return to original position if missed
        resetItemPosition(touchDragItem);
    }
    
    touchDragItem = null;
}

function resetItemPosition(item) {
    item.style.position = '';
    item.style.left = '';
    item.style.top = '';
    item.style.zIndex = '';
    item.style.opacity = '';
}

// --- Common Logic ---

function checkMatch(item, shadowBox) {
    if (!item || !shadowBox) return;
    if (shadowBox.classList.contains('matched')) return;

    if (item.id === shadowBox.dataset.id) {
        // Match!
        shadowBox.classList.add('matched');
        
        // Visual feedback
        shadowBox.innerHTML = '';
        const clonedItem = item.cloneNode(true);
        clonedItem.draggable = false;
        clonedItem.style.position = ''; // Reset styles if coming from touch
        clonedItem.classList.remove('draggable-item');
        clonedItem.style.fontSize = '3.5rem';
        clonedItem.style.margin = '0';
        shadowBox.appendChild(clonedItem);
        
        // Remove the original draggable item
        item.remove();
        
        score += 10;
        matchedCount++;
        scoreElement.textContent = score;

        // Ensure we use the current play count, not global if it changed mid-game (though unlikely with reset)
        // But better to use matchedCount vs current rendered shadows
        const totalTargets = document.querySelectorAll('.shadow-box').length;
        
        if (matchedCount === totalTargets) {
            setTimeout(() => {
                successMessage.classList.remove('hidden');
                startConfetti();
            }, 500);
        }
    } else {
        // No match
        shadowBox.style.animation = 'shake 0.5s';
        setTimeout(() => shadowBox.style.animation = '', 500);
        
        // If it was touch, reset position
        if (item.style.position === 'fixed') {
            resetItemPosition(item);
        }
    }
}

function startConfetti() {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#FF9F43', '#54A0FF'];
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = -10 + 'px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
        confetti.style.animationDelay = (Math.random() * 2) + 's';
        document.body.appendChild(confetti);
        
        // Remove after animation
        confetti.addEventListener('animationend', () => {
            confetti.remove();
        });
    }
}

// Add shake keyframes dynamically
const styleSheet = document.createElement("style");
styleSheet.innerText = `
@keyframes shake {
  0% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}
`;
document.head.appendChild(styleSheet);

// Initialize
initSidebar();
initGame();
