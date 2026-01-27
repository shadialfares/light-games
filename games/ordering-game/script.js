class OrderingGame {
    constructor() {
        this.items = [];
        this.correctOrder = [];
        this.level = 1;
        this.score = 0;
        this.attempts = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.gameMode = 'numbers';
        this.difficulty = 'medium';
        this.orderDirection = 'ascending';
        this.draggedElement = null;
        
        this.levelConfigs = {
            easy: { min: 3, max: 5, scoreMultiplier: 10 },
            medium: { min: 6, max: 8, scoreMultiplier: 20 },
            hard: { min: 9, max: 12, scoreMultiplier: 30 }
        };
        
        this.initializeElements();
        this.attachEventListeners();
        this.startNewGame();
    }

    initializeElements() {
        this.gameBoard = document.getElementById('game-board');
        this.levelDisplay = document.getElementById('level');
        this.timerDisplay = document.getElementById('timer');
        this.scoreDisplay = document.getElementById('score');
        this.targetOrderDisplay = document.getElementById('target-order');
        this.attemptsDisplay = document.getElementById('attempts');
        this.messageElement = document.getElementById('message');
        this.successAnimation = document.getElementById('success-animation');
        
        this.newGameBtn = document.getElementById('new-game-btn');
        this.checkBtn = document.getElementById('check-btn');
        this.hintBtn = document.getElementById('hint-btn');
        
        this.gameModeSelect = document.getElementById('game-mode');
        this.difficultySelect = document.getElementById('difficulty');
        this.orderDirectionSelect = document.getElementById('order-direction');
    }

    attachEventListeners() {
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.checkBtn.addEventListener('click', () => this.checkAnswer());
        this.hintBtn.addEventListener('click', () => this.showHint());
        
        this.gameModeSelect.addEventListener('change', (e) => {
            this.gameMode = e.target.value;
            this.startNewGame();
        });
        
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.startNewGame();
        });
        
        this.orderDirectionSelect.addEventListener('change', (e) => {
            this.orderDirection = e.target.value;
            this.updateTargetDisplay();
        });
    }

    startNewGame() {
        this.resetGame();
        this.generateItems();
        this.shuffleItems();
        this.renderBoard();
        this.startTimer();
        this.updateTargetDisplay();
        this.showMessage(`رتب العناصر بالترتيب ${this.orderDirection === 'ascending' ? 'التصاعدي' : 'التنازلي'}`, '');
    }

    resetGame() {
        this.items = [];
        this.correctOrder = [];
        this.attempts = 0;
        this.timer = 0;
        
        clearInterval(this.timerInterval);
        
        this.updateStats();
        this.hintBtn.disabled = false;
        this.checkBtn.disabled = false;
        this.hideSuccessAnimation();
    }

    generateItems() {
        const config = this.levelConfigs[this.difficulty];
        const count = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
        
        switch (this.gameMode) {
            case 'numbers':
                this.generateNumbers(count);
                break;
            case 'letters':
                this.generateLetters(count);
                break;
            case 'mixed':
                this.generateMixed(count);
                break;
        }
    }

    generateNumbers(count) {
        const start = Math.floor(Math.random() * 50) + 1;
        for (let i = 0; i < count; i++) {
            this.items.push({
                value: start + i,
                type: 'number'
            });
        }
        this.correctOrder = [...this.items];
    }

    generateLetters(count) {
        const startLetter = Math.floor(Math.random() * (26 - count + 1));
        for (let i = 0; i < count; i++) {
            this.items.push({
                value: String.fromCharCode(65 + startLetter + i),
                type: 'letter'
            });
        }
        this.correctOrder = [...this.items];
    }

    generateMixed(count) {
        const numbers = Math.floor(count / 2);
        const letters = count - numbers;
        
        for (let i = 0; i < numbers; i++) {
            this.items.push({
                value: Math.floor(Math.random() * 50) + 1,
                type: 'number'
            });
        }
        
        const startLetter = Math.floor(Math.random() * (26 - letters + 1));
        for (let i = 0; i < letters; i++) {
            this.items.push({
                value: String.fromCharCode(65 + startLetter + i),
                type: 'letter'
            });
        }
        
        this.correctOrder = [...this.items];
    }

    shuffleItems() {
        for (let i = this.items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
        }
    }

    getCorrectOrder() {
        // Create a copy of items to sort
        const sortedItems = [...this.items];
        
        sortedItems.sort((a, b) => {
            // Separate numbers and letters first
            if (a.type !== b.type) {
                return this.orderDirection === 'ascending' 
                    ? (a.type === 'number' ? -1 : 1)
                    : (a.type === 'number' ? 1 : -1);
            }
            
            // Sort within same type
            if (a.type === 'number') {
                return this.orderDirection === 'ascending' 
                    ? a.value - b.value 
                    : b.value - a.value;
            } else {
                return this.orderDirection === 'ascending'
                    ? a.value.localeCompare(b.value)
                    : b.value.localeCompare(a.value);
            }
        });
        
        return sortedItems;
    }

    renderBoard() {
        this.gameBoard.innerHTML = '';
        
        this.items.forEach((item, index) => {
            const itemElement = this.createItemElement(item, index);
            this.gameBoard.appendChild(itemElement);
        });
    }

    createItemElement(item, index) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'order-item';
        itemDiv.draggable = true;
        itemDiv.dataset.index = index;
        itemDiv.textContent = item.value;
        
        // Add index indicator
        const indexSpan = document.createElement('span');
        indexSpan.className = 'item-index';
        indexSpan.textContent = index + 1;
        itemDiv.appendChild(indexSpan);
        
        // Add drag event listeners
        itemDiv.addEventListener('dragstart', (e) => this.handleDragStart(e));
        itemDiv.addEventListener('dragend', (e) => this.handleDragEnd(e));
        itemDiv.addEventListener('dragover', (e) => this.handleDragOver(e));
        itemDiv.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Add touch event listeners for mobile
        itemDiv.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        itemDiv.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        itemDiv.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        return itemDiv;
    }

    handleDragStart(e) {
        this.draggedElement = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }

    handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        
        if (this.draggedElement !== e.target) {
            const draggedIndex = parseInt(this.draggedElement.dataset.index);
            const targetIndex = parseInt(e.target.dataset.index);
            
            // Swap items in array
            [this.items[draggedIndex], this.items[targetIndex]] = 
            [this.items[targetIndex], this.items[draggedIndex]];
            
            // Re-render board
            this.renderBoard();
        }
        
        return false;
    }

    handleTouchStart(e) {
        const touch = e.touches[0];
        this.draggedElement = e.target;
        this.draggedElement.classList.add('dragging');
        this.touchOffset = {
            x: touch.clientX - this.draggedElement.getBoundingClientRect().left,
            y: touch.clientY - this.draggedElement.getBoundingClientRect().top
        };
    }

    handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if (elementBelow && elementBelow.classList.contains('order-item') && elementBelow !== this.draggedElement) {
            elementBelow.style.transform = 'scale(1.1)';
        }
    }

    handleTouchEnd(e) {
        const touch = e.changedTouches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        
        this.draggedElement.classList.remove('dragging');
        
        if (elementBelow && elementBelow.classList.contains('order-item') && elementBelow !== this.draggedElement) {
            elementBelow.style.transform = '';
            
            const draggedIndex = parseInt(this.draggedElement.dataset.index);
            const targetIndex = parseInt(elementBelow.dataset.index);
            
            // Swap items in array
            [this.items[draggedIndex], this.items[targetIndex]] = 
            [this.items[targetIndex], this.items[draggedIndex]];
            
            // Re-render board
            this.renderBoard();
        }
    }

    checkAnswer() {
        this.attempts++;
        this.updateStats();
        
        // Get the correct order without modifying current items
        this.correctOrder = this.getCorrectOrder();
        
        const isCorrect = this.items.every((item, index) => 
            item.value === this.correctOrder[index].value && 
            item.type === this.correctOrder[index].type
        );
        
        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleIncorrectAnswer();
        }
    }

    handleCorrectAnswer() {
        const config = this.levelConfigs[this.difficulty];
        const timeBonus = Math.max(0, 300 - this.timer) * 2;
        const attemptBonus = Math.max(0, 100 - (this.attempts - 1) * 20);
        const levelScore = config.scoreMultiplier * 10 + timeBonus + attemptBonus;
        
        this.score += Math.floor(levelScore);
        this.level++;
        this.updateStats();
        
        this.showMessage('رائع! ترتيب صحيح! 🎉', 'success');
        
        // Show correct animation
        Array.from(this.gameBoard.children).forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('correct');
            }, index * 100);
        });
        
        // Show success animation
        setTimeout(() => {
            this.showSuccessAnimation();
        }, 1000);
        
        // Next level after delay
        setTimeout(() => {
            this.hideSuccessAnimation();
            this.startNewGame();
        }, 3000);
    }

    handleIncorrectAnswer() {
        this.showMessage('ترتيب غير صحيح. حاول مرة أخرى!', 'error');
        
        // Show incorrect animation briefly
        Array.from(this.gameBoard.children).forEach(item => {
            item.classList.add('incorrect');
            setTimeout(() => {
                item.classList.remove('incorrect');
            }, 500);
        });
        
        // Show some correct items as hints
        setTimeout(() => {
            this.showPartialHint();
        }, 600);
    }

    showPartialHint() {
        this.correctOrder = this.getCorrectOrder();
        
        Array.from(this.gameBoard.children).forEach((item, index) => {
            const currentItem = this.items[index];
            if (currentItem.value === this.correctOrder[index].value && 
                currentItem.type === this.correctOrder[index].type) {
                item.classList.add('hint');
                setTimeout(() => {
                    item.classList.remove('hint');
                }, 2000);
            }
        });
    }

    showHint() {
        if (this.hintBtn.disabled) return;
        
        this.correctOrder = this.getCorrectOrder();
        
        // Find first incorrect item and highlight it
        let incorrectIndex = -1;
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].value !== this.correctOrder[i].value || 
                this.items[i].type !== this.correctOrder[i].type) {
                incorrectIndex = i;
                break;
            }
        }
        
        if (incorrectIndex !== -1) {
            const items = Array.from(this.gameBoard.children);
            items[incorrectIndex].classList.add('hint');
            setTimeout(() => {
                items[incorrectIndex].classList.remove('hint');
            }, 2000);
            
            this.score = Math.max(0, this.score - 50);
            this.updateStats();
            this.showMessage('تم خصم 50 نقطة للتلميح', 'warning');
        }
        
        this.hintBtn.disabled = true;
        setTimeout(() => {
            this.hintBtn.disabled = false;
        }, 5000);
    }

    showSuccessAnimation() {
        this.successAnimation.classList.add('show');
    }

    hideSuccessAnimation() {
        this.successAnimation.classList.remove('show');
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimer();
        }, 1000);
    }

    updateTimer() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateTargetDisplay() {
        const directionText = this.orderDirection === 'ascending' ? 'تصاعدي' : 'تنازلي';
        this.targetOrderDisplay.textContent = directionText;
    }

    updateStats() {
        this.levelDisplay.textContent = this.level;
        this.scoreDisplay.textContent = this.score;
        this.attemptsDisplay.textContent = this.attempts;
    }

    showMessage(message, type = '') {
        this.messageElement.textContent = message;
        this.messageElement.className = `message ${type}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new OrderingGame();
});