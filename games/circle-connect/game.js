// ألوان الدوائر
const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B739', '#6C5CE7', '#A29BFE', '#FD79A8'
];

class CircleConnectionGame {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.level = 1;
        this.score = 0;
        this.circles = [];
        this.connections = [];
        this.currentPath = null;
        this.selectedCircle = null;
        this.isDrawing = false;
        this.pathPoints = []; // نقاط المسار الحالي
        
        this.setupCanvas();
        this.setupEventListeners();
        this.startLevel();
    }
    
    setupCanvas() {
        const container = document.querySelector('.game-board');
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;
        
        this.canvas.width = containerWidth;
        this.canvas.height = containerHeight;
        this.width = containerWidth;
        this.height = containerHeight;
    }
    
    setupEventListeners() {
        // أحداث الماوس
        this.canvas.addEventListener('mousedown', (e) => this.onPointerDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onPointerMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onPointerUp(e));
        this.canvas.addEventListener('mouseleave', () => this.onPointerLeave());
        
        // أحداث اللمس
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); // منع التمرير والسلوك الافتراضي
            this.onPointerDown(e.touches[0]);
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault(); // منع التمرير
            this.onPointerMove(e.touches[0]);
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (e.changedTouches.length > 0) {
                this.onPointerUp(e.changedTouches[0]);
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchcancel', () => {
            this.onPointerLeave();
        }, { passive: false });
        
        document.getElementById('resetBtn').addEventListener('click', () => this.resetLevel());
        document.getElementById('nextLevelBtn').addEventListener('click', () => this.nextLevel());
        
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.draw();
        });
    }
    
    startLevel() {
        this.circles = [];
        this.connections = [];
        this.currentPath = null;
        this.selectedCircle = null;
        this.isDrawing = false;
        this.pathPoints = [];
        
        // تحديد عدد الدوائر حسب المستوى
        const numPairs = Math.min(2 + this.level, 8); // من 2 إلى 8 أزواج
        const totalCircles = numPairs * 2;
        
        // إنشاء الدوائر
        const colors = COLORS.slice(0, numPairs);
        const circleData = [];
        
        colors.forEach((color, index) => {
            circleData.push({ color, id: index });
            circleData.push({ color, id: index });
        });
        
        // خلط الدوائر
        this.shuffleArray(circleData);
        
        // وضع الدوائر على اللوحة
        const positions = this.generatePositions(totalCircles);
        
        circleData.forEach((data, index) => {
            const pos = positions[index];
            this.circles.push({
                x: pos.x,
                y: pos.y,
                radius: 25,
                color: data.color,
                id: data.id,
                connected: false
            });
        });
        
        this.updateUI();
        this.draw();
        this.showMessage('ابدأ بتوصيل الدوائر المتطابقة!', 'info');
    }
    
    generatePositions(count) {
        const positions = [];
        const margin = 60;
        const cols = Math.ceil(Math.sqrt(count * 1.5));
        const rows = Math.ceil(count / cols);
        
        const cellWidth = (this.width - margin * 2) / cols;
        const cellHeight = (this.height - margin * 2) / rows;
        
        // إنشاء شبكة من المواضع
        const gridPositions = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                gridPositions.push({
                    x: margin + c * cellWidth + cellWidth / 2,
                    y: margin + r * cellHeight + cellHeight / 2
                });
            }
        }
        
        // إضافة بعض العشوائية للمواضع
        gridPositions.forEach(pos => {
            pos.x += (Math.random() - 0.5) * (cellWidth * 0.3);
            pos.y += (Math.random() - 0.5) * (cellHeight * 0.3);
            pos.x = Math.max(margin, Math.min(this.width - margin, pos.x));
            pos.y = Math.max(margin, Math.min(this.height - margin, pos.y));
        });
        
        // أخذ المواضع المطلوبة
        return gridPositions.slice(0, count);
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    getPointerPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        // دعم كل من الماوس واللمس
        const clientX = e.clientX !== undefined ? e.clientX : e.pageX;
        const clientY = e.clientY !== undefined ? e.clientY : e.pageY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }
    
    // دالة متوافقة مع الكود القديم
    getMousePos(e) {
        return this.getPointerPos(e);
    }
    
    getCircleAt(x, y) {
        for (let i = this.circles.length - 1; i >= 0; i--) {
            const circle = this.circles[i];
            const dx = x - circle.x;
            const dy = y - circle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= circle.radius) {
                return circle;
            }
        }
        return null;
    }
    
    onPointerDown(e) {
        const pos = this.getPointerPos(e);
        const circle = this.getCircleAt(pos.x, pos.y);
        
        if (circle && !circle.connected) {
            this.selectedCircle = circle;
            this.isDrawing = true;
            this.pathPoints = [{ x: circle.x, y: circle.y }]; // بدء المسار من مركز الدائرة
            this.currentPath = {
                start: { x: circle.x, y: circle.y },
                points: this.pathPoints,
                color: circle.color
            };
            this.draw();
        }
    }
    
    onPointerMove(e) {
        if (this.isDrawing && this.selectedCircle) {
            const pos = this.getPointerPos(e);
            
            // إضافة نقطة جديدة للمسار إذا كانت المسافة كافية (لتحسين الأداء)
            if (this.pathPoints.length === 0) {
                this.pathPoints.push({ x: pos.x, y: pos.y });
            } else {
                const lastPoint = this.pathPoints[this.pathPoints.length - 1];
                const distance = Math.sqrt(
                    Math.pow(pos.x - lastPoint.x, 2) + 
                    Math.pow(pos.y - lastPoint.y, 2)
                );
                
                // إضافة نقطة فقط إذا كانت المسافة أكبر من 2 بكسل (للسلاسة على الشاشات اللمسية)
                if (distance > 2) {
                    this.pathPoints.push({ x: pos.x, y: pos.y });
                }
            }
            
            this.currentPath.points = this.pathPoints;
            this.draw();
        }
    }
    
    onPointerUp(e) {
        if (!this.isDrawing || !this.selectedCircle) return;
        
        const pos = this.getPointerPos(e);
        const targetCircle = this.getCircleAt(pos.x, pos.y);
        
        // إضافة نقطة النهاية للمسار
        if (this.pathPoints.length > 0) {
            const lastPoint = this.pathPoints[this.pathPoints.length - 1];
            const distance = Math.sqrt(
                Math.pow(pos.x - lastPoint.x, 2) + 
                Math.pow(pos.y - lastPoint.y, 2)
            );
            if (distance > 1) {
                this.pathPoints.push({ x: pos.x, y: pos.y });
            }
        }
        
        if (targetCircle && 
            targetCircle !== this.selectedCircle &&
            targetCircle.color === this.selectedCircle.color &&
            !targetCircle.connected) {
            
            // إضافة نقطة النهاية (مركز الدائرة المستهدفة)
            this.pathPoints.push({ x: targetCircle.x, y: targetCircle.y });
            
            // التحقق من التقاطع
            const newConnection = {
                start: this.selectedCircle,
                end: targetCircle,
                points: [...this.pathPoints], // نسخ النقاط
                color: this.selectedCircle.color
            };
            
            if (!this.hasIntersection(newConnection)) {
                this.connections.push(newConnection);
                this.selectedCircle.connected = true;
                targetCircle.connected = true;
                this.score += 10;
                this.updateUI();
                
                // التحقق من اكتمال المستوى
                if (this.checkLevelComplete()) {
                    this.showMessage(`ممتاز! أكملت المستوى ${this.level}!`, 'success');
                    document.getElementById('nextLevelBtn').style.display = 'block';
                } else {
                    this.showMessage('رائع! استمر في التوصيل', 'success');
                }
            } else {
                this.showMessage('لا يمكن للخطوط أن تتقاطع!', 'error');
            }
        } else if (this.pathPoints.length > 0) {
            // إذا لم يتم الوصول إلى دائرة صحيحة، إظهار رسالة خطأ
            this.showMessage('يجب الوصول إلى دائرة مطابقة!', 'error');
        }
        
        this.isDrawing = false;
        this.selectedCircle = null;
        this.currentPath = null;
        this.pathPoints = [];
        this.draw();
    }
    
    onPointerLeave() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.selectedCircle = null;
            this.currentPath = null;
            this.pathPoints = [];
            this.draw();
        }
    }
    
    // دوال متوافقة مع الكود القديم
    onMouseDown(e) {
        this.onPointerDown(e);
    }
    
    onMouseMove(e) {
        this.onPointerMove(e);
    }
    
    onMouseUp(e) {
        this.onPointerUp(e);
    }
    
    onMouseLeave() {
        this.onPointerLeave();
    }
    
    hasIntersection(newConnection) {
        // استخدام نقاط المسار الحر للتحقق من التقاطع
        const path1Points = newConnection.points || [];
        
        // إذا لم يكن هناك نقاط كافية، لا يوجد تقاطع
        if (path1Points.length < 2) return false;
        
        for (const conn of this.connections) {
            const path2Points = conn.points || [];
            
            if (path2Points.length < 2) continue;
            
            // التحقق من تقاطع المسارين
            if (this.pathsIntersect(path1Points, path2Points, newConnection, conn)) {
                return true;
            }
        }
        
        return false;
    }
    
    pathsIntersect(points1, points2, path1, path2) {
        // التحقق من تقاطع مسارين عن طريق فحص تقاطع الأجزاء الصغيرة
        for (let i = 0; i < points1.length - 1; i++) {
            for (let j = 0; j < points2.length - 1; j++) {
                const line1 = {
                    x1: points1[i].x,
                    y1: points1[i].y,
                    x2: points1[i + 1].x,
                    y2: points1[i + 1].y
                };
                
                const line2 = {
                    x1: points2[j].x,
                    y1: points2[j].y,
                    x2: points2[j + 1].x,
                    y2: points2[j + 1].y
                };
                
                if (this.linesIntersect(line1, line2, path1, path2)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    linesIntersect(line1, line2, path1 = null, path2 = null) {
        // التحقق من تقاطع خطين باستخدام معادلة التقاطع
        const x1 = line1.x1, y1 = line1.y1, x2 = line1.x2, y2 = line1.y2;
        const x3 = line2.x1, y3 = line2.y1, x4 = line2.x2, y4 = line2.y2;
        
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (Math.abs(denom) < 0.0001) return false; // خطوط متوازية
        
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
        
        // التحقق من أن نقطة التقاطع داخل كلا القطعتين
        if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            const intersectX = x1 + t * (x2 - x1);
            const intersectY = y1 + t * (y2 - y1);
            
            // التحقق من أن التقاطع ليس عند نقطة البداية أو النهاية للدوائر
            if (path1 && path2) {
                const dist1Start = Math.sqrt((intersectX - path1.start.x) ** 2 + (intersectY - path1.start.y) ** 2);
                const dist1End = Math.sqrt((intersectX - path1.end.x) ** 2 + (intersectY - path1.end.y) ** 2);
                const dist2Start = Math.sqrt((intersectX - path2.start.x) ** 2 + (intersectY - path2.start.y) ** 2);
                const dist2End = Math.sqrt((intersectX - path2.end.x) ** 2 + (intersectY - path2.end.y) ** 2);
                
                // إذا كانت نقطة التقاطع قريبة جداً من الدوائر، لا تعتبر تقاطع
                if (dist1Start < 30 || dist1End < 30 || dist2Start < 30 || dist2End < 30) {
                    return false;
                }
            } else {
                const dist1Start = Math.sqrt((intersectX - x1) ** 2 + (intersectY - y1) ** 2);
                const dist1End = Math.sqrt((intersectX - x2) ** 2 + (intersectY - y2) ** 2);
                const dist2Start = Math.sqrt((intersectX - x3) ** 2 + (intersectY - y3) ** 2);
                const dist2End = Math.sqrt((intersectX - x4) ** 2 + (intersectY - y4) ** 2);
                
                if (dist1Start < 5 || dist1End < 5 || dist2Start < 5 || dist2End < 5) {
                    return false;
                }
            }
            
            return true;
        }
        
        return false;
    }
    
    checkLevelComplete() {
        return this.circles.every(circle => circle.connected);
    }
    
    resetLevel() {
        this.startLevel();
        document.getElementById('nextLevelBtn').style.display = 'none';
    }
    
    nextLevel() {
        this.level++;
        this.score += 50; // مكافأة إضافية للمستوى
        this.startLevel();
        document.getElementById('nextLevelBtn').style.display = 'none';
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('level').textContent = this.level;
        document.getElementById('score').textContent = this.score;
    }
    
    showMessage(text, type) {
        const messageEl = document.getElementById('message');
        messageEl.textContent = text;
        messageEl.className = `message ${type}`;
        
        setTimeout(() => {
            messageEl.textContent = '';
            messageEl.className = 'message';
        }, 3000);
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // رسم الخطوط المتصلة
        this.connections.forEach(conn => {
            this.drawPath(conn.points || [], conn.color, 4);
        });
        
        // رسم الخط الحالي
        if (this.currentPath && this.currentPath.points && this.currentPath.points.length > 0) {
            this.drawPath(this.currentPath.points, this.currentPath.color, 3, true);
        }
        
        // رسم الدوائر
        this.circles.forEach(circle => {
            this.drawCircle(circle);
        });
    }
    
    drawPath(points, color, width, dashed = false) {
        if (points.length < 2) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        
        // رسم خط يمر عبر جميع النقاط
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        if (dashed) {
            this.ctx.setLineDash([5, 5]);
        } else {
            this.ctx.setLineDash([]);
        }
        
        this.ctx.stroke();
    }
    
    drawCircle(circle) {
        // الظل
        this.ctx.beginPath();
        this.ctx.arc(circle.x + 2, circle.y + 2, circle.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fill();
        
        // الدائرة
        this.ctx.beginPath();
        this.ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = circle.color;
        this.ctx.fill();
        
        // الحدود
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
        
        if (circle.connected) {
            // علامة صح
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(circle.x - 8, circle.y);
            this.ctx.lineTo(circle.x - 3, circle.y + 5);
            this.ctx.lineTo(circle.x + 8, circle.y - 5);
            this.ctx.stroke();
        }
        
        if (circle === this.selectedCircle) {
            // دائرة خارجية للإشارة
            this.ctx.beginPath();
            this.ctx.arc(circle.x, circle.y, circle.radius + 5, 0, Math.PI * 2);
            this.ctx.strokeStyle = '#FFEB3B';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        }
    }
}

// بدء اللعبة عند تحميل الصفحة
window.addEventListener('load', () => {
    new CircleConnectionGame();
});
