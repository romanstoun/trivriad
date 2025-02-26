const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 40; // Размер клетки 40x40 пикселей
const cols = 8;
const rows = 12;
const scoreDisplay = document.getElementById('score');

let board = [];
let score = 0;
let selected = null;

const colors = ['#ff69b4', '#98ff98', '#ff4500', '#9370db', '#ffff99', '#87ceeb']; // Яркие цвета для фишек

// Инициализация игрового поля
function initBoard() {
    for (let r = 0; r < rows; r++) {
        board[r] = [];
        for (let c = 0; c < cols; c++) {
            board[r][c] = Math.floor(Math.random() * colors.length);
        }
    }
    removeMatches();
    fillEmptySpaces();
    drawBoard();
}

// Отрисовка игрового поля
function drawBoard() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            context.fillStyle = colors[board[r][c]];
            context.fillRect(c * grid, r * grid, grid - 2, grid - 2); // Лёгкий отступ для обводки
            context.strokeStyle = '#ffd700'; // Золотая обводка
            context.lineWidth = 2;
            context.strokeRect(c * grid, r * grid, grid - 2, grid - 2);
        }
    }
    if (selected) {
        const [r, c] = selected;
        context.fillStyle = 'rgba(255, 215, 0, 0.5)'; // Подсветка выбранной фишки
        context.fillRect(c * grid, r * grid, grid - 2, grid - 2);
    }
}

// Проверка на совпадения
function checkMatches() {
    let matches = [];
    // Горизонтальные совпадения
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols - 2; c++) {
            if (board[r][c] === board[r][c + 1] && board[r][c] === board[r][c + 2]) {
                matches.push([r, c], [r, c + 1], [r, c + 2]);
            }
        }
    }
    // Вертикальные совпадения
    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows - 2; r++) {
            if (board[r][c] === board[r + 1][c] && board[r][c] === board[r + 2][c]) {
                matches.push([r, c], [r + 1, c], [r + 2, c]);
            }
        }
    }
    return [...new Set(matches.map(JSON.stringify))].map(JSON.parse); // Уникальные совпадения
}

function removeMatches() {
    const matches = checkMatches();
    if (matches.length) {
        matches.forEach(([r, c]) => board[r][c] = -1); // Помечаем для удаления (-1)
        score += matches.length * 10; // Увеличиваем счёт
        scoreDisplay.textContent = score;
        fillEmptySpaces();
        removeMatches(); // Рекурсивно проверяем новые совпадения
    }
}

function fillEmptySpaces() {
    for (let c = 0; c < cols; c++) {
        let emptySpots = [];
        for (let r = rows - 1; r >= 0; r--) {
            if (board[r][c] === -1) emptySpots.push(r);
            else if (emptySpots.length) {
                board[emptySpots.shift()][c] = board[r][c];
                board[r][c] = -1;
                emptySpots.push(r);
            }
        }
        while (emptySpots.length) {
            board[emptySpots.shift()][c] = Math.floor(Math.random() * colors.length);
        }
    }
}

// Обмен фишек
function swapPieces(pos1, pos2) {
    [board[pos1[0]][pos1[1]], board[pos2[0]][pos2[1]]] = [board[pos2[0]][pos2[1]], board[pos1[0]][pos1[1]]];
    removeMatches();
    drawBoard();
}

// Сенсорное управление свайпами
let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
    const col = Math.floor(touchStartX / grid);
    const row = Math.floor(touchStartY / grid);
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
        selected = [row, col];
        drawBoard();
    }
});

canvas.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (selected) {
        const [r, c] = selected;
        let newPos = null;
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Горизонтальный свайп (влево/вправо)
            if (deltaX > 50 && c < cols - 1) newPos = [r, c + 1]; // Вправо
            else if (deltaX < -50 && c > 0) newPos = [r, c - 1]; // Влево
        } else {
            // Вертикальный свайп (вверх/вниз)
            if (deltaY > 50 && r > 0) newPos = [r - 1, c]; // Вверх
            else if (deltaY < -50 && r < rows - 1) newPos = [r + 1, c]; // Вниз
        }

        if (newPos) {
            swapPieces([r, c], newPos);
        }
        selected = null;
        drawBoard();
    }
});

// Инициализация игры
initBoard();