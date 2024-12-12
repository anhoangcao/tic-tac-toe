// Truy cập các thành phần trên giao diện người dùng
const board = document.getElementById('board'); // Bảng chơi
const status = document.getElementById('status'); // Hiển thị trạng thái trò chơi
const resetButton = document.getElementById('reset'); // Nút "New Game"
const undoButton = document.getElementById('undo'); // Nút "Undo"
const aiMoveButton = document.getElementById('ai-move'); // Nút "AI Move"
const scoreX = document.getElementById('score-x'); // Điểm của người chơi X
const scoreO = document.getElementById('score-o'); // Điểm của người chơi O
const scoreDraw = document.getElementById('score-draw'); // Số lần hòa
const playerXInput = document.getElementById('player-x'); // Nhập tên người chơi X
const playerOInput = document.getElementById('player-o'); // Nhập tên người chơi O
const playerXName = document.getElementById('player-x-name'); // Hiển thị tên người chơi X
const playerOName = document.getElementById('player-o-name'); // Hiển thị tên người chơi O
const resetScoreButton = document.getElementById('reset-score'); // Nút "Reset Score"
const boardSizeSelect = document.getElementById('board-size'); // Thay đổi kích thước bảng

// Biến để quản lý trạng thái trò chơi
let currentPlayer = 'X'; // Người chơi hiện tại (X hoặc O)
let gameState = []; // Mảng lưu trạng thái bảng
let gameActive = true; // Biến xác định trò chơi đang chạy
let moveHistory = []; // Lưu lịch sử các nước đi
let scores = { X: 0, O: 0, Draw: 0 }; // Điểm số cho từng người chơi và hòa
let boardSize = 3; // Kích thước mặc định của bảng
let totalCells = boardSize * boardSize; // Tổng số ô dựa trên kích thước bảng

/**
 * Cập nhật kích thước bảng chơi trong CSS Grid
 */
function updateBoardSize() {
    document.documentElement.style.setProperty('--board-size', boardSize);
}

/**
 * Tạo bảng chơi dựa trên kích thước người dùng chọn
 */
function createBoard() {
    board.innerHTML = ''; // Xóa nội dung bảng cũ
    gameState = new Array(totalCells).fill(''); // Reset trạng thái từng ô

    // Tạo các ô trên bảng
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell'); // Gắn class cho CSS
        cell.setAttribute('data-index', i); // Gắn chỉ số cho ô
        cell.addEventListener('click', handleCellClick); // Gắn sự kiện khi click
        board.appendChild(cell); // Thêm ô vào bảng
    }

    updateBoardSize(); // Cập nhật kích thước CSS
    updateWinningConditions(); // Cập nhật điều kiện thắng
    updateGameStatus(); // Hiển thị trạng thái ban đầu
}

/**
 * Cập nhật điều kiện thắng linh động theo kích thước bảng
 */
const winningConditions = [];
function updateWinningConditions() {
    winningConditions.length = 0;

    // Thêm điều kiện thắng theo hàng ngang
    for (let i = 0; i < boardSize; i++) {
        winningConditions.push(
            Array.from({ length: boardSize }, (_, index) => i * boardSize + index)
        );
    }

    // Thêm điều kiện thắng theo cột dọc
    for (let i = 0; i < boardSize; i++) {
        winningConditions.push(
            Array.from({ length: boardSize }, (_, index) => i + index * boardSize)
        );
    }

    // Thêm điều kiện thắng theo đường chéo chính
    winningConditions.push(
        Array.from({ length: boardSize }, (_, index) => index * (boardSize + 1))
    );

    // Thêm điều kiện thắng theo đường chéo phụ
    winningConditions.push(
        Array.from({ length: boardSize }, (_, index) => (index + 1) * (boardSize - 1))
    );
}

/**
 * Xử lý khi người chơi click vào ô
 */
function handleCellClick(e) {
    const clickedCell = e.target;
    const cellIndex = parseInt(clickedCell.getAttribute('data-index'));

    // Bỏ qua nếu ô đã được chọn hoặc trò chơi đã kết thúc
    if (gameState[cellIndex] !== '' || !gameActive) return;

    // Lưu nước đi của người chơi
    gameState[cellIndex] = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase()); // Thêm class cho CSS
    clickedCell.setAttribute('data-symbol', currentPlayer); // Hiển thị biểu tượng
    moveHistory.push(cellIndex); // Lưu lịch sử nước đi
    checkResult(); // Kiểm tra kết quả
}

/**
 * Kiểm tra kết quả sau mỗi lượt đi
 */
function checkResult() {
    let roundWon = false;

    // Kiểm tra tất cả các điều kiện thắng
    for (let i = 0; i < winningConditions.length; i++) {
        const condition = winningConditions[i];
        if (condition.every(index => gameState[index] === currentPlayer)) {
            roundWon = true;

            // Đánh dấu ô thắng
            condition.forEach(index =>
                document.querySelectorAll('.cell')[index].classList.add('winner')
            );
            break;
        }
    }

    // Xử lý khi có người thắng
    if (roundWon) {
        status.textContent = `${currentPlayer} wins!`;
        gameActive = false; // Kết thúc trò chơi
        scores[currentPlayer]++; // Cập nhật điểm số
        updateScoreDisplay(); // Hiển thị điểm
        return;
    }

    // Xử lý khi hòa
    if (!gameState.includes('')) {
        status.textContent = 'It\'s a draw!';
        gameActive = false; // Kết thúc trò chơi
        scores.Draw++;
        updateScoreDisplay();
        return;
    }

    // Chuyển lượt
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateGameStatus();
}

/**
 * Hiển thị trạng thái lượt chơi
 */
function updateGameStatus() {
    status.textContent = `${currentPlayer}'s turn`;
}

/**
 * Reset trò chơi về trạng thái ban đầu
 */
function resetGame() {
    currentPlayer = 'X'; // Đặt lại người chơi ban đầu
    gameState = new Array(totalCells).fill(''); // Xóa trạng thái bảng
    gameActive = true; // Kích hoạt trò chơi
    moveHistory = []; // Xóa lịch sử lượt đi
    updateGameStatus(); // Hiển thị trạng thái
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('x', 'o', 'winner'); // Xóa style
        cell.removeAttribute('data-symbol'); // Xóa biểu tượng
    });
}

/**
 * Hoàn tác lượt đi gần nhất
 */
function undoMove() {
    if (moveHistory.length === 0 || !gameActive) return;

    const lastMove = moveHistory.pop(); // Lấy nước đi cuối cùng
    gameState[lastMove] = ''; // Xóa trạng thái ô
    const cell = document.querySelector(`.cell[data-index="${lastMove}"]`);
    cell.classList.remove('x', 'o'); // Xóa class
    cell.removeAttribute('data-symbol'); // Xóa biểu tượng
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; // Chuyển lượt
    updateGameStatus();
}

/**
 * Hiển thị điểm số
 */
function updateScoreDisplay() {
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
    scoreDraw.textContent = scores.Draw;
}

/**
 * Di chuyển của AI (random)
 */
function aiMove() {
    if (!gameActive) return;

    const emptyCells = gameState.reduce((acc, cell, index) => {
        if (cell === '') acc.push(index);
        return acc;
    }, []);

    if (emptyCells.length > 0) {
        const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const cell = document.querySelector(`.cell[data-index="${randomIndex}"]`);
        cell.click(); // AI tự động click ô
    }
}

/**
 * Cập nhật tên người chơi
 */
function updatePlayerNames() {
    playerXName.textContent = playerXInput.value || 'Player X';
    playerOName.textContent = playerOInput.value || 'Player O';
    updateGameStatus();
}

/**
 * Reset toàn bộ điểm số
 */
function resetScore() {
    scores = { X: 0, O: 0, Draw: 0 };
    updateScoreDisplay();
}

// Gắn sự kiện vào các nút
resetButton.addEventListener('click', resetGame);
undoButton.addEventListener('click', undoMove);
aiMoveButton.addEventListener('click', aiMove);
resetScoreButton.addEventListener('click', resetScore);
playerXInput.addEventListener('input', updatePlayerNames);
playerOInput.addEventListener('input', updatePlayerNames);

// Xử lý thay đổi kích thước bảng
boardSizeSelect.addEventListener('change', function() {
    boardSize = parseInt(boardSizeSelect.value);
    totalCells = boardSize * boardSize;
    resetGame(); // Reset trò chơi
    createBoard(); // Tạo bảng mới
});

// Khởi động trò chơi
createBoard();
resetGame();