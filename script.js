let dom_replay = document.querySelector("#replay");
let dom_score1 = document.querySelector("#score1");
let dom_score2 = document.querySelector("#score2");
let dom_canvas1 = document.querySelector("#canvas1");
let dom_canvas2 = document.querySelector("#canvas2");
let CTX1 = dom_canvas1.getContext("2d");
let CTX2 = dom_canvas2.getContext("2d");

const W = (dom_canvas1.width = dom_canvas2.width = 400);
const H = (dom_canvas1.height = dom_canvas2.height = 400);

let snakes = [],
    food1,
    food2,
    cells = 15,
    isGameOver = false,
    gameStarted = false; // Variable para controlar el inicio del juego

let score1 = 0; // Inicializar score1
let score2 = 0; // Inicializar score2
let gameInterval; // Variable para almacenar el ID del intervalo

// Obtener el elemento para mostrar el mensaje de fin de juego
const gameOverMessage = document.getElementById('gameOverMessage');

// Cargar imágenes para las cabezas de las serpientes
const headImage1 = new Image();
headImage1.src = '/images/headPlayer1.png'; // Ruta de la imagen para el Jugador 1
const headImage2 = new Image();
headImage2.src = '/images/headPlayer2.png'; // Ruta de la imagen para el Jugador 2

let helpers = {
    Vec: class {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        add(v) {
            this.x += v.x;
            this.y += v.y;
            return this;
        }
    },
    isCollision(v1, v2) {
        return v1.x === v2.x && v1.y === v2.y;
    },
    drawGrid(ctx) {
        ctx.lineWidth = 1.1;
        ctx.strokeStyle = "#232332";
        for (let i = 1; i < cells; i++) {
            let f = (W / cells) * i;
            ctx.beginPath();
            ctx.moveTo(f, 0);
            ctx.lineTo(f, H);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, f);
            ctx.lineTo(W, f);
            ctx.stroke();
            ctx.closePath();
        }
    },
    drawInitialState() {
        // Dibuja el estado inicial de las serpientes y la comida
        CTX1.clearRect(0, 0, W, H);
        CTX2.clearRect(0, 0, W, H);
        this.drawGrid(CTX1);
        this.drawGrid(CTX2);

        food1 = new helpers.Vec(Math.floor(Math.random() * cells), Math.floor(Math.random() * cells));
        food2 = new helpers.Vec(Math.floor(Math.random() * cells), Math.floor(Math.random() * cells));

        // Dibuja la comida en rojo para ambos jugadores
        CTX1.fillStyle = "red";
        drawRoundedRect(CTX1, food1.x * (W / cells), food1.y * (H / cells), (W / cells), (H / cells), 10);
        CTX2.fillStyle = "red";
        drawRoundedRect(CTX2, food2.x * (W / cells), food2.y * (H / cells), (W / cells), ( H / cells), 10);
    }
};

let directions = {
    player1: { x: 1, y: 0 },
    player2: { x: 1, y: 0 } // Inicializa el movimiento del jugador 2 hacia la derecha
};

let KEY = {
    listen() {
        addEventListener("keydown", handleKeydown, false);
    },
    unlisten() {
        removeEventListener("keydown", handleKeydown, false);
    }
};

function handleKeydown(e) {
    // Controles del Jugador 1
    if (e.key === "ArrowUp" && directions.player2.y === 0) {
        directions.player2 = { x: 0, y: -1 };
    }
    if (e.key === "ArrowDown" && directions.player2.y === 0) {
        directions.player2 = { x: 0 , y: 1 };
    }
    if (e.key === "ArrowLeft" && directions.player2.x ===  0) {
        directions.player2 = { x: -1, y: 0 };
    }
    if (e.key === "ArrowRight" && directions.player2.x === 0) {
        directions.player2 = { x: 1, y: 0 };
    }

    // Controles del Jugador 2
    if (e.key === "w" && directions.player1.y === 0) {
        directions.player1 = { x: 0, y: -1 };
    }
    if (e.key === "s" && directions.player1.y === 0) {
        directions.player1 = { x: 0, y: 1 };
    }
    if (e.key === "a" && directions.player1.x === 0) {
        directions.player1 = { x: -1, y: 0 };
    }
    if (e.key === "d" && directions.player1.x === 0) {
        directions.player1 = { x: 1, y: 0 };
    }

    // Reiniciar el juego al presionar la barra espaciadora
    if (e.key === " ") {
        e.preventDefault(); // Evitar el comportamiento predeterminado de la barra espaciadora
        restartGame(); // Reiniciar el juego
    }
}

// Agregar evento de clic al botón de reinicio
dom_replay.addEventListener("click", restartGame);

// Función para actualizar el puntaje
function updateScore() {
    dom_score1.innerText = score1.toString().padStart(2, '0');
    dom_score2.innerText = score2.toString().padStart(2, '0');
}

// Función para iniciar el juego
function startGame() {
    if (gameStarted) return;

    gameStarted = true;
    isGameOver = false;
    score1 = 0; 
    score2 = 0;
    gameOverAlertShown = false;

    const initialX = 0; 
    const initialY = Math.floor(cells / 2); 

    snakes = [
        [new helpers.Vec(initialX, initialY)], 
        [new helpers.Vec(initialX, initialY)]  
    ];

    // Mover las serpientes automáticamente hacia la derecha
    directions.player1 = { x: 1, y: 0 };
    directions.player2 = { x: 1, y: 0 };

    KEY.listen();
    draw();
    gameInterval = setInterval(updateSnakes, 100); 
    gameOverMessage.style.display = "none"; 
    updateScore(); // Actualizar el puntaje al iniciar el juego
}

// Función para reiniciar el juego
function restartGame() {
    clearInterval(gameInterval); 
    KEY.unlisten(); // Desvincular eventos de teclado
    gameStarted = false; 
    isGameOver = false;

    // Reiniciar puntajes
    score1 = 0;
    score2 = 0;
    updateScore(); // Actualizar los puntajes en el DOM

    // Reiniciar dirección de las serpientes
    directions.player1 = { x: 1, y: 0 }; 
    directions.player2 = { x: 1, y: 0 }; 

    // Reiniciar la comida
    food1 = new helpers.Vec(Math.floor(Math.random() * cells), Math.floor(Math.random() * cells));
    food2 = new helpers.Vec(Math.floor(Math.random() * cells), Math.floor(Math.random() * cells));

    // Limpiar el estado de las serpientes
    snakes = [];
    
    // Dibujar estado inicial
    helpers.drawInitialState(); 

    // Iniciar el juego nuevamente
    startGame(); 
}

// Función para dibujar un rectángulo con bordes redondeados
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx .moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

// Función para dibujar la cabeza de la serpiente como una imagen circular
function drawSnakeHead(ctx, x, y, image) {
    const radius = (W / cells) / 2; // Radio del círculo, la mitad del tamaño de la celda
    ctx.save(); // Guarda el estado del canvas
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2); // Dibuja un círculo
    ctx.closePath();
    ctx.clip(); // Recorta el canvas a la forma del círculo
    ctx.drawImage(image, x, y, (W / cells), (H / cells)); // Dibuja la imagen en la posición (x, y)
    ctx.restore(); // Restaura el canvas al estado anterior
}

// Función de dibujo
function draw() {
    CTX1.clearRect(0, 0, W, H);
    CTX2.clearRect(0, 0, W, H);
    helpers.drawGrid(CTX1);
    helpers.drawGrid(CTX2);

    // Dibuja la comida en rojo para ambos jugadores
    CTX1.fillStyle = "red"; 
    drawRoundedRect(CTX1, food1.x * (W / cells), food1.y * (H / cells), (W / cells), (H / cells), 10);
    CTX2.fillStyle = "red"; 
    drawRoundedRect(CTX2, food2.x * (W / cells), food2.y * (H / cells), (W / cells), (H / cells), 10);

    snakes.forEach((snake, index) => {
        let ctx = index === 0 ? CTX1 : CTX2;
        // Dibuja la cabeza de la serpiente usando la imagen circular
        drawSnakeHead(ctx, snake[0].x * (W / cells), snake[0].y * (H / cells), index === 0 ? headImage1 : headImage2);
        // Dibuja el cuerpo de la serpiente
        for (let i = 1; i < snake.length; i++) {
            ctx.fillStyle = index === 0 ? "green" : "blue";
            drawRoundedRect(ctx, snake[i].x * (W / cells), snake[i].y * (H / cells), (W / cells), (H / cells), 10);
        }
    });

    if (!isGameOver) requestAnimationFrame(draw);
}

// Actualiza la posición de las serpientes
function updateSnakes() {
    let gameOverCount = 0; 
    let collisionStatus = [false, false]; 

    snakes.forEach((snake, index) => {
        let head = snake[0];
        let newHead = new helpers.Vec(head.x, head.y);

        if (index === 0) newHead.add(new helpers.Vec(directions.player1.x, directions.player1.y));
        else newHead.add(new helpers.Vec(directions.player2.x, directions.player2.y));

        if (index === 0 && helpers.isCollision(newHead, food1)) {
            score1++;
            food1 = new helpers.Vec(Math.floor(Math.random() * cells), Math.floor(Math.random() * cells)); 
            updateScore(); // Actualizar el puntaje después de que el jugador 1 coma una fruta
        } else if (index === 1 && helpers.isCollision(newHead, food2)) {
            score2++;
            food2 = new helpers.Vec(Math.floor(Math.random() * cells), Math.floor(Math.random() * cells)); 
            updateScore(); // Actualizar el puntaje después de que el jugador 2 coma una fruta
        } else {
            snake.pop(); 
        }

        snake.unshift(newHead); 
        collisionStatus[index] = checkGameOver(snake, index); 

        if (collisionStatus[index]) {
            gameOverCount++;
        }

        // Verificar si alguno de los jugadores ha alcanzado 30 puntos
        if (score1 >= 30 || score2 >= 30) {
            const winner = score1 >= 30 ? 1 : 2;
            alert(`¡Jugador ${winner} ha ganado al alcanzar 30 puntos!`);
            clearInterval(gameInterval); 
            dom_replay.style.display = "block"; 
        }
    });

    if (gameOverCount === snakes.length) {
        alert("¡Es un empate! Ambos jugadores han colisionado.");
        clearInterval(gameInterval); 
        dom_replay.style.display = "block"; 
    } else if (gameOverCount === 1) {
        const losingPlayerIndex = collisionStatus.indexOf(true);
        alert(`¡Jugador ${losingPlayerIndex + 1} ha perdido! El ganador es el Jugador ${losingPlayerIndex === 0 ? 2 : 1}`); 
        clearInterval(gameInterval); 
        dom_replay.style.display = "block"; 
    }
}

// Verifica si el juego ha terminado
function checkGameOver(snake, playerIndex) {
    let head = snake[0];

    if (head.x < 0 || head.x >= cells || head.y < 0 || head.y >= cells) {
        return true; 
    }

    for (let i = 1; i < snake.length; i++) {
        if (helpers.isCollision(head, snake[i])) {
            return true; 
        }
    }
    return false; 
}

// Iniciar el juego al cargar la página
window.onload = () => {
    helpers.drawInitialState(); 
};

// Escuchar la tecla para iniciar o reiniciar el juego
KEY.listen();