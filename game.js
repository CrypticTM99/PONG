// --- DOM Elements ---
const mainMenu = document.getElementById('mainMenu');
const playBtn = document.getElementById('playBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsMenu = document.getElementById('settingsMenu');
const backBtn = document.getElementById('backBtn');
const gameContainer = document.getElementById('gameContainer');
const pongCanvas = document.getElementById('pongCanvas');
const ctx = pongCanvas.getContext('2d');
const scoreBoard = document.getElementById('scoreBoard');
const playerScoreUI = document.getElementById('playerScore');
const aiScoreUI = document.getElementById('aiScore');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreUI = document.getElementById('finalScore');
const restartBtn = document.getElementById('restartBtn');
const goMenuBtn = document.getElementById('goMenuBtn');
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const volumeRange = document.getElementById('volumeRange');

// --- Game Constants ---
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 84;
const BALL_SIZE = 14;
const PLAYER_X = 16;
const AI_X = pongCanvas.width - PADDLE_WIDTH - 16;
const PADDLE_SPEED = 6;
const BALL_SPEED = 6.2;
const WINNING_SCORE = 5;

// --- Game State ---
let playerY, aiY, ballX, ballY, ballVX, ballVY;
let playerScore = 0;
let aiScore = 0;
let isGameRunning = false;
let isGameOver = false;

// --- Menu Logic ---
playBtn.onclick = () => {
    mainMenu.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    scoreBoard.style.display = 'inline-block';
    startGame();
};
settingsBtn.onclick = () => {
    mainMenu.classList.add('hidden');
    settingsMenu.classList.remove('hidden');
};
backBtn.onclick = () => {
    settingsMenu.classList.add('hidden');
    mainMenu.classList.remove('hidden');
};
restartBtn.onclick = () => {
    gameOverScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    startGame();
};
goMenuBtn.onclick = () => {
    gameOverScreen.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    scoreBoard.style.display = 'none';
    stopMusic();
};

// --- Audio Settings ---
musicToggle.onchange = () => {
    if (musicToggle.checked) playMusic();
    else stopMusic();
};
volumeRange.oninput = () => {
    bgMusic.volume = volumeRange.value;
};

// --- Music Functions ---
function playMusic() {
    if (!musicToggle.checked) return;
    bgMusic.volume = parseFloat(volumeRange.value);
    if (bgMusic.paused) bgMusic.play();
}
function stopMusic() {
    bgMusic.pause();
    bgMusic.currentTime = 0;
}

// --- Game Setup ---
function startGame() {
    playerY = pongCanvas.height / 2 - PADDLE_HEIGHT / 2;
    aiY = pongCanvas.height / 2 - PADDLE_HEIGHT / 2;
    playerScore = 0;
    aiScore = 0;
    isGameRunning = true;
    isGameOver = false;
    updateScoreUI();
    resetBall();
    playMusic();
    requestAnimationFrame(gameLoop);
}

// --- Mouse Paddle Control ---
pongCanvas.onmousemove = function(e) {
    if (!isGameRunning) return;
    const rect = pongCanvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    playerY = Math.max(0, Math.min(pongCanvas.height - PADDLE_HEIGHT, playerY));
};

// --- Game Loop ---
function gameLoop() {
    if (!isGameRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// --- Update Game State ---
function update() {
    // Move ball
    ballX += ballVX;
    ballY += ballVY;

    // Wall collision
    if (ballY <= 0 || ballY + BALL_SIZE >= pongCanvas.height) {
        ballVY = -ballVY;
    }

    // Player paddle collision
    if (
        ballX <= PLAYER_X + PADDLE_WIDTH &&
        ballY + BALL_SIZE > playerY &&
        ballY < playerY + PADDLE_HEIGHT
    ) {
        ballVX = Math.abs(ballVX);
        let hitPos = (ballY + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2);
        ballVY += hitPos * 0.13;
        ballVY = Math.max(-BALL_SPEED * 1.1, Math.min(BALL_SPEED * 1.1, ballVY));
    }

    // AI paddle collision
    if (
        ballX + BALL_SIZE >= AI_X &&
        ballY + BALL_SIZE > aiY &&
        ballY < aiY + PADDLE_HEIGHT
    ) {
        ballVX = -Math.abs(ballVX);
        let hitPos = (ballY + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2);
        ballVY += hitPos * 0.13;
        ballVY = Math.max(-BALL_SPEED * 1.1, Math.min(BALL_SPEED * 1.1, ballVY));
    }

    // Score detection
    if (ballX < 0) {
        // Player missed, AI scores
        aiScore++;
        updateScoreUI();
        if (aiScore >= WINNING_SCORE) endGame(false);
        else resetBall();
    } else if (ballX > pongCanvas.width) {
        // AI missed, player scores
        playerScore++;
        updateScoreUI();
        if (playerScore >= WINNING_SCORE) endGame(true);
        else resetBall();
    }

    // --- AI Movement ---
    // Track ball with a slight delay (difficulty)
    let centerAI = aiY + PADDLE_HEIGHT / 2;
    let centerBall = ballY + BALL_SIZE / 2;
    if (centerAI < centerBall - 8) aiY += PADDLE_SPEED;
    else if (centerAI > centerBall + 8) aiY -= PADDLE_SPEED;
    aiY = Math.max(0, Math.min(pongCanvas.height - PADDLE_HEIGHT, aiY));
}

// --- Reset Ball ---
function resetBall() {
    ballX = pongCanvas.width / 2 - BALL_SIZE / 2;
    ballY = pongCanvas.height / 2 - BALL_SIZE / 2;
    let dir = (Math.random() > 0.5 ? 1 : -1);
    ballVX = BALL_SPEED * dir;
    ballVY = BALL_SPEED * (Math.random() * 0.7 - 0.35);
}

// --- Score UI ---
function updateScoreUI() {
    playerScoreUI.textContent = playerScore;
    aiScoreUI.textContent = aiScore;
}

// --- End Game ---
function endGame(playerWon) {
    isGameRunning = false;
    isGameOver = true;
    gameContainer.classList.add('hidden');
    scoreBoard.style.display = 'none';
    gameOverScreen.classList.remove('hidden');
    finalScoreUI.textContent = playerWon ?
        `You win! Final score: ${playerScore} : ${aiScore}` :
        `You lose! Final score: ${playerScore} : ${aiScore}`;
    stopMusic();
}

// --- Draw Everything ---
function draw() {
    ctx.clearRect(0, 0, pongCanvas.width, pongCanvas.height);

    // Middle dashed line
    ctx.strokeStyle = '#00cfff';
    ctx.setLineDash([12, 12]);
    ctx.beginPath();
    ctx.moveTo(pongCanvas.width / 2, 0);
    ctx.lineTo(pongCanvas.width / 2, pongCanvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Left paddle
    ctx.fillStyle = '#00ffaf';
    ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Right paddle
    ctx.fillStyle = '#ff008c';
    ctx.fillRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Ball
    ctx.fillStyle = '#fffd3e';
    ctx.fillRect(ballX, ballY, BALL_SIZE, BALL_SIZE);
}

// --- Initial UI State ---
mainMenu.classList.remove('hidden');
gameContainer.classList.add('hidden');
settingsMenu.classList.add('hidden');
gameOverScreen.classList.add('hidden');
scoreBoard.style.display = 'none';

bgMusic.volume = volumeRange.value;
bgMusic.pause();