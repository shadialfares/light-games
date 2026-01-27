const canvas = document.getElementById('drawing-canvas');
const ctx = canvas.getContext('2d');
const canvasWrapper = document.getElementById('canvas-wrapper');
const templateOverlay = document.getElementById('template-overlay');

// State
let isDrawing = false;
let currentTool = 'brush'; // brush, eraser
let brushSize = 10;
let currentColor = '#FF6B6B';
let lastX = 0;
let lastY = 0;

// Colors Palette
const palette = [
    '#FF6B6B', '#FF8E8E', '#FF4757', // Reds
    '#FFA502', '#FFD32A', '#ECCC68', // Yellows/Oranges
    '#2ED573', '#7BED9F', '#26de81', // Greens
    '#1E90FF', '#70A1FF', '#3742fa', // Blues
    '#5352ED', '#A29BFE', '#6c5ce7', // Purples
    '#2F3542', '#747D8C', '#CED6E0', // Grays
    '#8B4513', '#D2691E', '#F4A460'  // Browns
];

// Templates Data (SVG Paths or Image URLs)
const templates = {
    blank: null,
    flower: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Cpath d='M150,150 Q180,100 210,150 Q260,180 210,210 Q180,260 150,210 Q100,260 70,210 Q20,180 70,150 Q100,100 150,150 M180,180 A20,20 0 1,1 179.9,180' fill='none' stroke='%23000' stroke-width='5'/%3E%3Cline x1='150' y1='210' x2='150' y2='300' stroke='%23000' stroke-width='8'/%3E%3Cpath d='M150,250 Q190,230 210,250 Q170,270 150,250' fill='none' stroke='%23000' stroke-width='4'/%3E%3C/svg%3E")`,
    car: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Cpath d='M50,200 L50,160 L80,160 L100,120 L200,120 L220,160 L250,160 L250,200 L50,200 Z' fill='none' stroke='%23000' stroke-width='5'/%3E%3Ccircle cx='90' cy='200' r='20' fill='none' stroke='%23000' stroke-width='5'/%3E%3Ccircle cx='210' cy='200' r='20' fill='none' stroke='%23000' stroke-width='5'/%3E%3Crect x='110' y='130' width='80' height='30' fill='none' stroke='%23000' stroke-width='3'/%3E%3C/svg%3E")`,
    butterfly: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Cpath d='M150,100 Q150,50 150,50 M150,100 Q200,50 220,100 Q240,150 150,180 Q220,220 200,260 Q150,240 150,200 Q150,240 100,260 Q80,220 150,180 Q60,150 80,100 Q100,50 150,100' fill='none' stroke='%23000' stroke-width='5'/%3E%3Cline x1='150' y1='100' x2='150' y2='200' stroke='%23000' stroke-width='5'/%3E%3Ccircle cx='150' cy='90' r='10' fill='none' stroke='%23000' stroke-width='3'/%3E%3C/svg%3E")`,
    fish: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E%3Cpath d='M250,150 Q200,100 100,100 Q50,150 100,200 Q200,200 250,150 L280,120 L280,180 L250,150 Z' fill='none' stroke='%23000' stroke-width='5'/%3E%3Ccircle cx='100' cy='140' r='5' fill='%23000'/%3E%3Cpath d='M180,120 Q160,150 180,180' fill='none' stroke='%23000' stroke-width='3'/%3E%3C/svg%3E")`
};

// Initialize
function init() {
    setupCanvas();
    setupColors();
    setupEventListeners();
    updateCursor();
    
    // Default tool
    selectTool('brush');
}

function setupCanvas() {
    // Set canvas size to match container
    const rect = canvasWrapper.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Default context settings
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    updateBrush();
}

function setupColors() {
    const container = document.getElementById('colors-container');
    palette.forEach((color, index) => {
        const btn = document.createElement('div');
        btn.className = 'color-btn' + (index === 0 ? ' active' : '');
        btn.style.backgroundColor = color;
        btn.addEventListener('click', () => selectColor(color, btn));
        container.appendChild(btn);
    });
}

function selectColor(color, btnElement) {
    currentColor = color;
    
    // Update UI
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');
    
    // Update custom picker if needed
    document.getElementById('custom-color').value = color;
    
    // Switch to brush if using eraser
    if (currentTool === 'eraser') {
        selectTool('brush');
    }
    
    updateBrush();
}

function selectTool(tool) {
    currentTool = tool;
    
    document.querySelectorAll('.tool-btn').forEach(btn => {
        if (btn.dataset.tool === tool) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    
    updateCursor();
}

function updateBrush() {
    ctx.lineWidth = brushSize;
    if (currentTool === 'eraser') {
        ctx.strokeStyle = '#ffffff';
    } else {
        ctx.strokeStyle = currentColor;
    }
}

function updateCursor() {
    // We could add custom cursors here
}

function setupEventListeners() {
    // Window resize
    window.addEventListener('resize', debounce(setupCanvas, 200));

    // Drawing Events (Mouse)
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Drawing Events (Touch)
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startDrawing(e.touches[0]);
    }, { passive: false });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        draw(e.touches[0]);
    }, { passive: false });
    
    canvas.addEventListener('touchend', stopDrawing);

    // Tools
    document.querySelectorAll('.tool-btn').forEach(btn => {
        if (!btn.disabled) {
            btn.addEventListener('click', () => selectTool(btn.dataset.tool));
        }
    });

    // Brush Size
    const sizeInput = document.getElementById('brush-size');
    const sizePreview = document.querySelector('.size-preview');
    
    sizeInput.addEventListener('input', (e) => {
        brushSize = e.target.value;
        sizePreview.style.width = brushSize + 'px';
        sizePreview.style.height = brushSize + 'px';
        sizePreview.style.backgroundColor = currentTool === 'eraser' ? '#ccc' : currentColor;
        updateBrush();
    });

    // Color Picker
    document.getElementById('custom-color').addEventListener('input', (e) => {
        selectColor(e.target.value, null);
    });

    // Clear Button
    document.getElementById('clear-btn').addEventListener('click', () => {
        if (confirm('هل أنت متأكد من مسح الرسم؟')) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    });

    // Templates
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class
            document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Set template
            const templateKey = btn.dataset.template;
            if (templates[templateKey]) {
                templateOverlay.style.backgroundImage = templates[templateKey];
            } else {
                templateOverlay.style.backgroundImage = 'none';
            }
        });
    });

    // Save Button
    document.getElementById('save-btn').addEventListener('click', saveImage);
}

function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function startDrawing(e) {
    isDrawing = true;
    const coords = getCoordinates(e);
    lastX = coords.x;
    lastY = coords.y;
    
    // Draw a dot
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;
    
    const coords = getCoordinates(e);
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    
    lastX = coords.x;
    lastY = coords.y;
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath(); // Close path
}

function saveImage() {
    // Create a temporary canvas to merge drawing and template
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tCtx = tempCanvas.getContext('2d');
    
    // Draw white background
    tCtx.fillStyle = '#ffffff';
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    
    // Draw user drawing
    tCtx.drawImage(canvas, 0, 0);
    
    // Draw template if active (need to convert SVG bg to image)
    // This is tricky with CSS background-image. 
    // For now, we just save the drawing.
    // To properly save template + drawing, we would need to draw the SVG on canvas.
    
    const link = document.createElement('a');
    link.download = 'my-drawing-majoodi.png';
    link.href = tempCanvas.toDataURL();
    link.click();
}

// Utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Start
window.addEventListener('load', init);
