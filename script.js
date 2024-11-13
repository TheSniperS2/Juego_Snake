const canvas1 = document.getElementById('gameCanvas1');
const canvas2 = document.getElementById('gameCanvas2');
const ctx1 = canvas1.getContext('2d');
const ctx2 = canvas2.getContext('2d');
const startButton = document.getElementById('startButton');

let snake1 = [{ x: 10, y: 10 }];
let snake2 = [{ x: 10, y: 10 }];
let food1 = { x: 15, y: 15 };
let food2 = { x: 20, y: 20 };
let score1 = 0;
let score2 = 0;
let direction1 = { x: 1, y: 0 };
let direction2 = { x: 1, y: 0 };
let gameOver = false;
let gameStarted = false;

// Función principal de dibujo
function draw() {
    if (!gameStarted || gameOver) return; // Solo dibuja si el juego ha comenzado y no ha terminado

    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);

    // Dibuja las serpientes y la comida para ambos jugadores
    drawSnake(ctx1, snake1, 'green');
    drawSnake(ctx2, snake2, 'blue');
    drawFood(ctx1, food1);
    drawFood(ctx2, food2);

    // Actualiza la posición de las serpientes y verifica colisiones
    updateSnake(snake1, direction1);
    updateSnake(snake2, direction2);
    checkCollision(snake1, food1, 1);
    checkCollision(snake2, food2, 2);
    checkWallCollision(snake1);
    checkWallCollision(snake2);

    // Muestra el mensaje de Game Over si el juego termina
    if (gameOver) {
        document.getElementById('resultMessage').style.display = 'block';
        document.getElementById('winnerText').innerText = score1 > score2 ? 'Jugador 1 gana!' : 'Jugador 2 gana!';
    }
}

// Función para dibujar la serpiente
function drawSnake(ctx, snake, color) {
    ctx.fillStyle = color;
    snake.forEach(segment => ctx.fillRect(segment.x * 10, segment.y * 10, 10, 10));
}

// Función para dibujar la comida
function drawFood(ctx, food) {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * 10, food.y * 10, 10, 10);
}

// Resto de las funciones
function updateSnake(snake, direction) {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head);
}

function checkCollision(snake, food, player) {
    if (snake[0].x === food.x && snake[0].y === food.y) {
        if (player === 1) {
            score1++;
            document.getElementById('score1').innerText = `Puntuación: ${score1}`;
        } else {
            score2++;
            document.getElementById('score2').innerText = `Puntuación: ${score2}`;
        }
        food.x = Math.floor(Math.random() * (canvas1.width / 10));
        food.y = Math.floor(Math.random() * (canvas1.height / 10));
    } else {
        snake.pop();
    }
}

function checkWallCollision(snake) {
    const head = snake[0];
    if (head.x < 0 || head.x >= canvas1.width / 10 || head.y < 0 || head.y >= canvas1.height / 10) {
        gameOver = true;
    }
}

// Control de movimiento de las serpientes
document.addEventListener('keydown', (event) => {
    if (!gameStarted) return; // Ignora los controles si el juego no ha comenzado

    switch (event.key) {
        case 'ArrowUp':
            if (direction1.y === 0) direction1 = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction1.y === 0) direction1 = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction1.x === 0) direction1 = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction1.x === 0) direction1 = { x: 1, y: 0 };
            break;
        // Controles para el jugador 2 (WASD)
        case 'w':
            if (direction2.y === 0) direction2 = { x: 0, y: -1 };
            break;
        case 's':
            if (direction2.y === 0) direction2 = { x: 0, y: 1 };
            break;
        case 'a':
            if (direction2.x === 0) direction2 = { x: -1, y: 0 };
            break;
        case 'd':
            if (direction2.x === 0) direction2 = { x: 1, y: 0 };
            break;
    }
});

// Iniciar el juego al hacer clic en el botón o al presionar "Espacio"
startButton.addEventListener('click', startGame);
document.addEventListener('keydown', (event) => {
    if (event.key === ' ') startGame();
});

// Función para iniciar el juego
function startGame() {
    if (gameStarted) return; // Evita reiniciar si el juego ya comenzó

    gameStarted = true;
    document.getElementById('resultMessage').style.display = 'none';
    setInterval(draw, 100); // Inicia el bucle de juego
}

// Reiniciar el juego
document.getElementById('restartButton').addEventListener('click', () => {
    snake1 = [{ x: 10, y: 10 }];
    snake2 = [{ x: 10, y: 10 }];
    food1 = { x: 15, y: 15 };
    food2 = { x: 20, y: 20 };
    score1 = 0;
    score2 = 0;
    direction1 = { x: 1, y: 0 };
    direction2 = { x: 1, y: 0 };
    gameOver = false;
    gameStarted = false;
    document.getElementById('resultMessage').style.display = 'none';
    document.getElementById('score1').innerText = `Puntuación: ${score1}`;
    document.getElementById('score2').innerText = `Puntuación: ${score2}`;
});

// HTML del botón de inicio
// <button id="startButton">Iniciar Juego</button>
