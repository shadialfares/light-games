class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.isPaused = false;
        this.isProcessing = false;
        this.difficulty = 'medium';
        this.theme = 'colors';
        
        this.themes = {
            colors: [
                '#FF595E', // أحمر
                '#FF924C', // برتقالي
                '#FFCA3A', // أصفر
                '#8AC926', // أخضر تفاحي
                '#4D96FF', // أزرق
                '#6A4C93', // بنفسجي
                '#00BBF9', // سماوي
                '#F72585'  // وردي
              ],
              
            emoji: ['🎈', '🎨', '🎯', '🎪', '🎭', '🎺', '🎸', '🎮'],
            shapes: ['●', '■', '▲', '★', '♥', '☀', '☁', '☂']
        };
        
        this.gridSizes = {
            easy: { cols: 4, rows: 3 },
            medium: { cols: 4, rows: 4 },
            hard: { cols: 6, rows: 4 }
        };
        
        this.initializeElements();
        this.attachEventListeners();
        this.startNewGame();
    }

    initializeElements() {
        this.gameBoard = document.getElementById('game-board');
        this.movesCount = document.getElementById('moves-count');
        this.timerDisplay = document.getElementById('timer');
        this.pairsFound = document.getElementById('pairs-found');
        this.messageElement = document.getElementById('message');
        this.newGameBtn = document.getElementById('new-game-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.hintBtn = document.getElementById('hint-btn');
        this.difficultySelect = document.getElementById('difficulty');
        this.themeSelect = document.getElementById('theme');
    }

    attachEventListeners() {
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.hintBtn.addEventListener('click', () => this.showHint());
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.startNewGame();
        });
        this.themeSelect.addEventListener('change', (e) => {
            this.theme = e.target.value;
            this.updateCardTheme();
        });
    }

    startNewGame() {
        this.resetGame();
        this.createCards();
        this.shuffleCards();
        this.renderBoard();
        this.startTimer();
        this.showMessage('ابحث عن الأزواج المتطابقة!', '');
    }

    resetGame() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.timer = 0;
        this.isPaused = false;
        this.isProcessing = false;
        
        clearInterval(this.timerInterval);
        
        this.updateStats();
        this.pauseBtn.textContent = 'إيقاف';
        this.pauseBtn.innerHTML = '<span class="btn-icon">⏸️</span>إيقاف';
        this.hintBtn.disabled = false;
    }

    createCards() {
        const { cols, rows } = this.gridSizes[this.difficulty];
        const totalCards = cols * rows;
        const pairs = totalCards / 2;
        
        this.cards = [];
        const themeData = this.themes[this.theme];
        
        for (let i = 0; i < pairs; i++) {
            const value = themeData[i % themeData.length];
            this.cards.push({ id: i * 2, value, matched: false });
            this.cards.push({ id: i * 2 + 1, value, matched: false });
        }
    }

    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    renderBoard() {
        const { cols } = this.gridSizes[this.difficulty];
        this.gameBoard.className = `game-board ${this.difficulty}`;
        this.gameBoard.innerHTML = '';

        this.cards.forEach((card, index) => {
            const cardElement = this.createCardElement(card, index);
            this.gameBoard.appendChild(cardElement);
        });
    }

    createCardElement(card, index) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'memory-card';
        cardDiv.dataset.index = index;
    
        const cardFront = document.createElement('div');
        cardFront.className = 'card-face card-front';
    
        const cardBack = document.createElement('div');
        cardBack.className = 'card-face card-back';
    
        if (this.theme === 'colors') {
            cardBack.style.background = card.value;
        } else {
            cardBack.textContent = card.value;
    
            // 🔥 تكبير الإيموجي والأشكال
            cardBack.style.fontSize = this.theme === 'emoji' ? '3.2rem' : '3rem';
            cardBack.style.fontWeight = 'bold';
            cardBack.style.display = 'flex';
            cardBack.style.alignItems = 'center';
            cardBack.style.justifyContent = 'center';
        }
    
        cardDiv.appendChild(cardFront);
        cardDiv.appendChild(cardBack);
    
        if (card.matched) {
            cardDiv.classList.add('matched');
        }
    
        cardDiv.addEventListener('click', () => this.flipCard(index));
        return cardDiv;
    }
    

    flipCard(index) {
        if (this.isPaused || this.isProcessing) return;
        
        const card = this.cards[index];
        const cardElement = this.gameBoard.children[index];
        
        if (card.matched || this.flippedCards.includes(index)) return;
        
        cardElement.classList.add('flipped');
        this.flippedCards.push(index);
        
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateStats();
            this.checkMatch();
        }
    }

    checkMatch() {
        this.isProcessing = true;
        const [index1, index2] = this.flippedCards;
        const card1 = this.cards[index1];
        const card2 = this.cards[index2];
        
        setTimeout(() => {
            if (card1.value === card2.value) {
                card1.matched = true;
                card2.matched = true;
                
                this.gameBoard.children[index1].classList.add('matched');
                this.gameBoard.children[index2].classList.add('matched');
                
                this.matchedPairs++;
                this.updateStats();
                this.showMessage('زوج مطابق! رائع!', 'success');
                
                if (this.matchedPairs === this.cards.length / 2) {
                    this.gameWon();
                }
            } else {
                this.gameBoard.children[index1].classList.remove('flipped');
                this.gameBoard.children[index2].classList.remove('flipped');
                this.showMessage('ليس مطابقاً، حاول مرة أخرى', 'warning');
            }
            
            this.flippedCards = [];
            this.isProcessing = false;
        }, 700);
    }

    showHint() {
        if (this.isPaused || this.hintBtn.disabled) return;
        
        const unmatchedCards = this.cards
            .map((card, index) => ({ card, index }))
            .filter(item => !item.card.matched);
        
        if (unmatchedCards.length === 0) return;
        
        const randomCard = unmatchedCards[Math.floor(Math.random() * unmatchedCards.length)];
        const cardElement = this.gameBoard.children[randomCard.index];
        
        cardElement.classList.add('hint');
        setTimeout(() => {
            cardElement.classList.remove('hint');
        }, 1000);
        
        this.moves += 2;
        this.updateStats();
        this.hintBtn.disabled = true;
        setTimeout(() => {
            this.hintBtn.disabled = false;
        }, 5000);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            clearInterval(this.timerInterval);
            this.pauseBtn.innerHTML = '<span class="btn-icon">▶️</span>متابعة';
            this.showMessage('اللعبة متوقفة', 'warning');
            
            // Hide all cards
            Array.from(this.gameBoard.children).forEach(card => {
                card.style.visibility = 'hidden';
            });
        } else {
            this.startTimer();
            this.pauseBtn.innerHTML = '<span class="btn-icon">⏸️</span>إيقاف';
            this.showMessage('استمر في اللعب!', '');
            
            // Show all cards
            Array.from(this.gameBoard.children).forEach(card => {
                card.style.visibility = 'visible';
            });
        }
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            if (!this.isPaused) {
                this.timer++;
                this.updateTimer();
            }
        }, 1000);
    }

    updateTimer() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateStats() {
        this.movesCount.textContent = this.moves;
        this.pairsFound.textContent = `${this.matchedPairs}/${this.cards.length / 2}`;
    }

    updateCardTheme() {
        this.createCards();
        this.shuffleCards();
        this.renderBoard();
    }

    gameWon() {
        clearInterval(this.timerInterval);
        const finalTime = this.timerDisplay.textContent;
        this.showMessage(`🎉 مبروك! لقد فزت في ${this.moves} حركة و${finalTime}!`, 'success');
        
        // Add celebration animation
        setTimeout(() => {
            Array.from(this.gameBoard.children).forEach((card, index) => {
                setTimeout(() => {
                    card.style.animation = 'matchPulse 0.6s ease';
                }, index * 50);
            });
        }, 500);
    }

    showMessage(message, type = '') {
        this.messageElement.textContent = message;
        this.messageElement.className = `message ${type}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});