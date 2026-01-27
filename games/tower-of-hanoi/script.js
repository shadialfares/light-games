class TowerOfHanoi {
    constructor() {
        this.towers = [[], [], []];
        this.moveCount = 0;
        this.diskCount = 3;
        this.selectedTower = null;
        this.isAutoSolving = false;
        this.moveHistory = [];
        this.isShuffleMode = false;
        
        this.initializeElements();
        this.initializeGame();
        this.attachEventListeners();
    }

    initializeElements() {
        this.towerElements = [
            document.getElementById('tower-1'),
            document.getElementById('tower-2'),
            document.getElementById('tower-3')
        ];
        
        this.disksElements = [
            document.getElementById('disks-1'),
            document.getElementById('disks-2'),
            document.getElementById('disks-3')
        ];
        
        this.moveCountElement = document.getElementById('move-count');
        this.minMovesElement = document.getElementById('min-moves');
        this.gameModeDisplay = document.getElementById('game-mode-display');
        this.messageElement = document.getElementById('message');
        this.resetButton = document.getElementById('reset-btn');
        this.autoSolveButton = document.getElementById('auto-solve-btn');
        this.shuffleButton = document.getElementById('shuffle-btn');
        this.diskSlider = document.getElementById('disk-slider');
        this.diskCountDisplay = document.getElementById('disk-count-display');
        this.normalInstructions = document.getElementById('normal-instructions');
        this.shuffleInstructions = document.getElementById('shuffle-instructions');
    }

    initializeGame() {
        this.towers = [[], [], []];
        this.moveCount = 0;
        this.selectedTower = null;
        this.isAutoSolving = false;
        this.moveHistory = [];
        
        if (!this.isShuffleMode) {
            for (let i = this.diskCount; i >= 1; i--) {
                this.towers[0].push(i);
            }
        }
        
        this.updateDisplay();
        this.updateMoveCount();
        this.updateMinMoves();
        this.updateGameMode();
        this.showMessage('');
    }

    attachEventListeners() {
        this.towerElements.forEach((tower, index) => {
            tower.addEventListener('click', () => this.handleTowerClick(index));
        });
        
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.autoSolveButton.addEventListener('click', () => this.autoSolve());
        this.shuffleButton.addEventListener('click', () => this.shuffleDisks());
        
        this.diskSlider.addEventListener('input', (e) => {
            this.diskCount = parseInt(e.target.value);
            this.diskCountDisplay.textContent = this.diskCount;
            this.resetGame();
        });
    }

    handleTowerClick(towerIndex) {
        if (this.isAutoSolving) return;
        
        if (this.selectedTower === null) {
            if (this.towers[towerIndex].length > 0) {
                this.selectedTower = towerIndex;
                this.towerElements[towerIndex].classList.add('selected');
                this.showMessage(`البرج ${towerIndex + 1} تم اختياره`);
            }
        } else {
            if (this.selectedTower === towerIndex) {
                this.towerElements[this.selectedTower].classList.remove('selected');
                this.selectedTower = null;
                this.showMessage('');
            } else {
                this.moveDisk(this.selectedTower, towerIndex);
            }
        }
    }

    moveDisk(fromTower, toTower) {
        if (this.towers[fromTower].length === 0) {
            if (!this.isAutoSolving) {
                this.showMessage('البرج المصدر فارغ!', 'error');
            }
            return false;
        }
        
        if (this.towers[toTower].length > 0) {
            const fromDisk = this.towers[fromTower][this.towers[fromTower].length - 1];
            const toDisk = this.towers[toTower][this.towers[toTower].length - 1];
            
            if (fromDisk > toDisk) {
                if (!this.isAutoSolving) {
                    this.showMessage('لا يمكن وضع قرص أكبر فوق قرص أصغر!', 'error');
                }
                return false;
            }
        }
        
        const disk = this.towers[fromTower].pop();
        this.towers[toTower].push(disk);
        
        this.moveHistory.push({ from: fromTower, to: toTower, disk });
        this.moveCount++;
        
        if (!this.isAutoSolving) {
            this.towerElements[this.selectedTower].classList.remove('selected');
            this.selectedTower = null;
        }
        
        this.updateDisplay();
        this.updateMoveCount();
        
        if (this.checkWin()) {
            this.showMessage(`🎉 مبروك! لقد فزت في ${this.moveCount} حركة!`, 'success');
            this.autoSolveButton.disabled = true;
            this.isAutoSolving = false;
        } else if (!this.isAutoSolving) {
            this.showMessage('');
        }
        
        return true;
    }

    checkWin() {
        if (this.isShuffleMode) {
            for (let i = 0; i < 3; i++) {
                if (this.towers[i].length === this.diskCount) {
                    let isCorrect = true;
                    for (let j = 0; j < this.diskCount - 1; j++) {
                        if (this.towers[i][j] < this.towers[i][j + 1]) {
                            isCorrect = false;
                            break;
                        }
                    }
                    if (isCorrect) return true;
                }
            }
            return false;
        } else {
            return this.towers[2].length === this.diskCount;
        }
    }

    updateDisplay() {
        this.disksElements.forEach((disksElement, towerIndex) => {
            disksElement.innerHTML = '';
            
            this.towers[towerIndex].forEach((diskSize, diskIndex) => {
                const diskElement = document.createElement('div');
                diskElement.className = 'disk';
                diskElement.setAttribute('data-size', diskSize);
                diskElement.textContent = diskSize;
                disksElement.appendChild(diskElement);
            });
        });
    }

    updateMoveCount() {
        this.moveCountElement.textContent = this.moveCount;
    }

    updateMinMoves() {
        const minMoves = Math.pow(2, this.diskCount) - 1;
        this.minMovesElement.textContent = minMoves;
    }

    showMessage(message, type = '') {
        this.messageElement.textContent = message;
        this.messageElement.className = `message ${type}`;
    }

    resetGame() {
        this.isShuffleMode = false;
        this.initializeGame();
        this.autoSolveButton.disabled = false;
        this.shuffleButton.disabled = false;
        this.towerElements.forEach(tower => tower.classList.remove('selected'));
    }

    async autoSolve() {
        if (this.isAutoSolving) return;
        
        this.resetGame();
        this.isAutoSolving = true;
        this.autoSolveButton.disabled = true;
        this.showMessage('جاري حل اللعبة تلقائياً...');
        
        await this.solveHanoi(this.diskCount, 0, 2, 1);
        
        this.isAutoSolving = false;
        this.showMessage(`تم الحل في ${this.moveCount} حركة!`, 'success');
    }

    async solveHanoi(n, from, to, aux) {
        if (n === 1) {
            await this.animateMove(from, to);
            return;
        }
        
        await this.solveHanoi(n - 1, from, aux, to);
        await this.animateMove(from, to);
        await this.solveHanoi(n - 1, aux, to, from);
    }

    async animateMove(from, to) {
        return new Promise(resolve => {
            setTimeout(() => {
                const success = this.moveDisk(from, to);
                if (success) {
                    resolve();
                } else {
                    console.error(`Failed to move disk from tower ${from} to tower ${to}`);
                    resolve();
                }
            }, 500);
        });
    }

    shuffleDisks() {
        this.isShuffleMode = true;
        this.moveCount = 0;
        this.selectedTower = null;
        this.isAutoSolving = false;
        this.moveHistory = [];
        
        const allDisks = [];
        for (let i = 1; i <= this.diskCount; i++) {
            allDisks.push(i);
        }
        
        for (let i = allDisks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allDisks[i], allDisks[j]] = [allDisks[j], allDisks[i]];
        }
        
        this.towers = [[], [], []];
        allDisks.forEach((disk, index) => {
            const towerIndex = index % 3;
            this.towers[towerIndex].push(disk);
        });
        
        this.towers.forEach(tower => {
            tower.sort((a, b) => b - a);
        });
        
        this.updateDisplay();
        this.updateMoveCount();
        this.updateGameMode();
        this.showMessage('تم خلط الأقراص! رتبها بشكل صحيح على أي برج');
        this.autoSolveButton.disabled = true;
        this.shuffleButton.disabled = false;
    }

    updateGameMode() {
        const gameBoard = document.querySelector('.game-board');
        
        if (this.isShuffleMode) {
            this.gameModeDisplay.textContent = 'خلط';
            this.normalInstructions.style.display = 'none';
            this.shuffleInstructions.style.display = 'block';
            this.minMovesElement.textContent = '-';
            gameBoard.classList.add('shuffle-mode');
        } else {
            this.gameModeDisplay.textContent = 'عادي';
            this.normalInstructions.style.display = 'block';
            this.shuffleInstructions.style.display = 'none';
            this.updateMinMoves();
            gameBoard.classList.remove('shuffle-mode');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TowerOfHanoi();
});