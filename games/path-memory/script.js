const difficultyEl = document.getElementById('difficulty');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const boardEl = document.getElementById('grid-board');
const statusText = document.getElementById('status-text');
const levelEl = document.getElementById('level');
const successCountEl = document.getElementById('success-count');
const successOverlay = document.getElementById('success-overlay');

let gridSize = 6;
let path = [];
let startIndex = 0;
let userPath = [];
let isPreviewing = false;
let isPlaying = false;
let level = 1;
let successCount = 0;

function getGridSize(diff) {
  if (diff === 'easy') return 5;
  if (diff === 'hard') return 7;
  return 6;
}

function indexToRC(index) {
  const r = Math.floor(index / gridSize);
  const c = index % gridSize;
  return { r, c };
}

function rcToIndex(r, c) {
  return r * gridSize + c;
}

function neighbors(index, visited) {
  const { r, c } = indexToRC(index);
  const opts = [];
  if (r > 0) opts.push(rcToIndex(r - 1, c));
  if (r < gridSize - 1) opts.push(rcToIndex(r + 1, c));
  if (c > 0) opts.push(rcToIndex(r, c - 1));
  if (c < gridSize - 1) opts.push(rcToIndex(r, c + 1));
  return opts.filter(i => !visited.has(i));
}

function randomEdgeStart() {
  // اختَر نقطة بداية على الحافة لسهولة التذكر
  const edge = Math.floor(Math.random() * 4); // 0 top,1 right,2 bottom,3 left
  if (edge === 0) return rcToIndex(0, Math.floor(Math.random() * gridSize));
  if (edge === 1) return rcToIndex(Math.floor(Math.random() * gridSize), gridSize - 1);
  if (edge === 2) return rcToIndex(gridSize - 1, Math.floor(Math.random() * gridSize));
  return rcToIndex(Math.floor(Math.random() * gridSize), 0);
}

function generatePath() {
  const diff = difficultyEl.value;
  gridSize = getGridSize(diff);
  const minLen = gridSize + 3;
  const maxLen = gridSize + 6;
  const targetLen = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen;

  const visited = new Set();
  const p = [];
  startIndex = randomEdgeStart();
  let current = startIndex;
  visited.add(current);
  p.push(current);

  let guard = gridSize * gridSize * 3;
  while (p.length < targetLen && guard-- > 0) {
    const opts = neighbors(current, visited);
    if (opts.length === 0) {
      // لا يوجد جار غير مُزار: ارجع خطوة وحاول اتجاه آخر
      if (p.length > 1) {
        p.pop();
        current = p[p.length - 1];
        continue;
      } else {
        // إعادة البدء
        return generatePath();
      }
    }
    current = opts[Math.floor(Math.random() * opts.length)];
    visited.add(current);
    p.push(current);
  }
  return p;
}

function buildBoard() {
  boardEl.innerHTML = '';
  boardEl.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  boardEl.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

  const total = gridSize * gridSize;
  for (let i = 0; i < total; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.textContent = '';
    boardEl.appendChild(cell);
  }
  const startCell = boardEl.children[startIndex];
  const endCell = boardEl.children[path[path.length - 1]];
  startCell.classList.add('start');
  startCell.textContent = 'بداية';
  endCell.classList.add('end');
  endCell.textContent = 'نهاية';
}

function clearClasses(cls) {
  Array.from(boardEl.children).forEach(c => c.classList.remove(cls));
}

function previewPath() {
  isPreviewing = true;
  isPlaying = false;
  userPath = [];
  statusText.textContent = 'شاهد الطريق بعناية...';
  clearClasses('preview');
  clearClasses('user');
  clearClasses('error');

  let t = 0;
  const stepMs = 400;
  path.forEach((idx, i) => {
    setTimeout(() => {
      const cell = boardEl.children[idx];
      cell.classList.add('preview');
    }, t);
    setTimeout(() => {
      const cell = boardEl.children[idx];
      cell.classList.remove('preview');
    }, t + stepMs - 120);
    t += stepMs;
  });
  setTimeout(() => {
    isPreviewing = false;
    isPlaying = true;
    statusText.textContent = 'ابدأ من "بداية" ثم انقر خلايا مجاورة لرسم الطريق';
  }, t + 150);
}

function isAdjacent(a, b) {
  const ar = Math.floor(a / gridSize), ac = a % gridSize;
  const br = Math.floor(b / gridSize), bc = b % gridSize;
  const dr = Math.abs(ar - br), dc = Math.abs(ac - bc);
  return (dr + dc) === 1; // حركة شبكية 4-اتجاهات
}

function resetUser() {
  userPath = [];
  clearClasses('user');
  clearClasses('error');
  statusText.textContent = 'ابدأ من "بداية" ثم تابع نفس الطريق';
}

function handleCellClick(e) {
  if (!isPlaying) return;
  const target = e.target.closest('.cell');
  if (!target) return;
  const idx = parseInt(target.dataset.index, 10);

  if (userPath.length === 0) {
    if (idx !== startIndex) {
      target.classList.add('error');
      statusText.textContent = 'ابدأ من الخلية المعلّمة "بداية"';
      setTimeout(() => target.classList.remove('error'), 600);
      return;
    }
    userPath.push(idx);
    target.classList.add('user');
    statusText.textContent = 'جيد! تابع طريقاً مجاوراً للخلايا السابقة';
    return;
  }

  const last = userPath[userPath.length - 1];
  if (!isAdjacent(last, idx)) {
    target.classList.add('error');
    statusText.textContent = 'اختر خلية مجاورة مباشرة (أعلى/أسفل/يمين/يسار)';
    setTimeout(() => target.classList.remove('error'), 600);
    return;
  }

  // منع تكرار الخلية
  if (userPath.includes(idx)) {
    target.classList.add('error');
    statusText.textContent = 'لا تكرر المرور على نفس الخلية';
    setTimeout(() => target.classList.remove('error'), 600);
    return;
  }

  userPath.push(idx);
  target.classList.add('user');

  if (userPath.length === path.length) {
    isPlaying = false;
    checkResult();
  }
}

function checkResult() {
  const ok = userPath.length === path.length && userPath.every((v, i) => v === path[i]);
  if (ok) {
    successOverlay.classList.add('show');
    statusText.textContent = 'أحسنت! المسار صحيح';
    successCount++;
    level++;
    successCountEl.textContent = successCount;
    levelEl.textContent = level;
    setTimeout(() => {
      successOverlay.classList.remove('show');
      startRound();
    }, 1200);
  } else {
    statusText.textContent = 'أقربت! لكن يوجد اختلاف. اضغط "إعادة المحاولة" وجرب ثانية';
  }
}

function startRound() {
  path = generatePath();
  buildBoard();
  previewPath();
}

function init() {
  gridSize = getGridSize(difficultyEl.value);
  path = generatePath();
  buildBoard();
  statusText.textContent = 'اضغط ابدأ لمشاهدة الطريق';
}

// Events
boardEl.addEventListener('click', handleCellClick);
startBtn.addEventListener('click', () => {
  startRound();
});
resetBtn.addEventListener('click', () => {
  resetUser();
});
difficultyEl.addEventListener('change', () => {
  init();
});

// boot
init();
