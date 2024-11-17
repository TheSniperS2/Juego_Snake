let dom_replay = document.querySelector("#replay");
let dom_score1 = document.querySelector("#score1");
let dom_score2 = document.querySelector("#score2");
let dom_canvas = document.querySelector("#canvas"); // Solo un canvas ahora
let CTX = dom_canvas.getContext("2d");

const W = (dom_canvas.width = 400);
const H = (dom_canvas.height = 400);

let snakes = [],
    food,
    cells = 20,
    isGameOver = false,
    gameStarted = false;

let score1 = 0;
let score2 = 0;
let gameInterval;

const gameOverMessage = document.getElementById('gameOverMessage');

const headImage1 = new Image();
headImage1.src = 'images/headPlayer1.png'; // Ruta de la imagen para el Jugador 1
const headImage2 = new Image();
headImage2.src = 'images/headPlayer2.png'; // Ruta de la imagen para el Jugador 2

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
        CTX.clearRect(0, 0, W, H);
        this.drawGrid(CTX);

        food = new helpers.Vec(Math.floor(Math.random() * cells), Math.floor(Math.random() * cells));

        CTX.fillStyle = "red";
        drawRoundedRect(CTX, food.x * (W / cells), food.y * (H / cells), (W / cells), (H / cells), 10);
    }
};

let directions = {
    player1: { x: 0, y: 1 }, // Jugador 1 inicia moviéndose hacia abajo
    player2: { x: 0, y: -1 } // Jugador 2 inicia moviéndose hacia arriba
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
        directions.player2 = { x: 0, y: 1 };
    }
    if (e.key === "ArrowLeft" && directions.player2.x === 0) {
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
        e.preventDefault();
        restartGame();
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

    const initialX1 = 0; // Jugador 1 comienza en la esquina superior izquierda
    const initialY1 = 0; 
    const initialX2 = cells - 1; // Jugador 2 comienza en la esquina inferior derecha
    const initialY2 = cells - 1; 

    snakes = [
        [new helpers.Vec(initialX1, initialY1)], 
        [new helpers.Vec(initialX2, initialY2)]  
    ];

    directions.player1 = { x: 0, y: 1 }; // Jugador 1 se mueve hacia abajo
    directions.player2 = { x: 0, y: -1 }; // Jugador 2 se mueve hacia arriba

    KEY.listen();
    draw();
    gameInterval = setInterval(updateSnakes, 100); 
    gameOverMessage.style.display = "none"; 
    updateScore();
}

// Función para reiniciar el juego
function restartGame() {
    clearInterval(gameInterval); 
    KEY.unlisten(); 
    gameStarted = false; 
    isGameOver = false;

    score1 = 0;
    score2 = 0;
    updateScore();

    directions.player1 = { x: 0, y: 1 }; // Reiniciar dirección del Jugador 1 hacia abajo
    directions.player2 = { x: 0, y: -1 }; // Reiniciar dirección del Jugador 2 hacia arriba

    food = new helpers.Vec(Math.floor(Math.random() * cells), Math.floor(Math.random() * cells));
    snakes = [];
    
    helpers.drawInitialState(); 
    startGame(); 
}

// Función para dibujar un rectángulo con bordes redondeados
function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
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
    const radius = (W / cells) / 2; 
    ctx.save(); 
    ctx.beginPath();
    ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2); 
    ctx.closePath();
    ctx.clip(); 
    ctx.drawImage(image, x, y, (W / cells), (H / cells)); 
    ctx.restore(); 
}

// Función de dibujo
function draw() {
    CTX.clearRect(0, 0, W, H);
    helpers.drawGrid(CTX);

    CTX.fillStyle = "red"; 
    drawRoundedRect(CTX, food.x * (W / cells), food.y * (H / cells), (W / cells), (H / cells), 10);

    snakes.forEach((snake, index) => {
        drawSnakeHead(CTX, snake[0].x * (W / cells), snake[0].y * (H / cells), index ===  0 ? headImage1 : headImage2);
        for (let i = 1; i < snake.length; i++) {
            CTX.fillStyle = index === 0 ? "green" : "blue";
            drawRoundedRect(CTX, snake[i].x * (W / cells), snake[i].y * (H / cells), ( W / cells), (H / cells), 10);
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

        if (helpers.isCollision(newHead, food)) {
            if (index === 0) {
                score1++;
            } else {
                score2++;
            }
            food = new helpers.Vec(Math.floor(Math.random() * cells), Math.floor(Math.random() * cells)); 
            updateScore(); 
        } else {
            snake.pop(); 
        }

        snake.unshift(newHead); 
        collisionStatus[index] = checkGameOver(snake, index); 

        // Verificar colisión entre jugadores
        if (index === 0 && helpers.isCollision(newHead, snakes[1][0])) {
            // Colisión entre cabezas
            alert("¡Ambos jugadores han perdido al chocar con sus cabezas!");
            clearInterval(gameInterval); 
            dom_replay.style.display = "block"; 
            return; // Salir de la función
        } else if (index === 1 && helpers.isCollision(newHead, snakes[0][0])) {
            // Colisión entre cabezas
            alert("¡Ambos jugadores han perdido al chocar con sus cabezas!");
            clearInterval(gameInterval); 
            dom_replay.style.display = "block"; 
            return; // Salir de la función
        }

        // Verifica si uno de los jugadores choca con el cuerpo del otro
        if (index === 0 && checkCollisionWithBody(snake, snakes[1])) {
            collisionStatus[0] = true; // Jugador 1 pierde
            alert("¡El Jugador 1 ha perdido al chocar con el cuerpo del Jugador 2!");
        } else if (index === 1 && checkCollisionWithBody(snake, snakes[0])) {
            collisionStatus[1] = true; // Jugador 2 pierde
            alert("¡El Jugador 2 ha perdido al chocar con el cuerpo del Jugador 1!");
        }

        if (collisionStatus[index]) {
            gameOverCount++;
        }
    });

    if (gameOverCount === snakes.length) {
        alert("¡Ambos jugadores han colisionado.");
        clearInterval(gameInterval); 
        dom_replay.style.display = "block"; 
    } else if (gameOverCount === 1) {
        const losingPlayerIndex = collisionStatus.indexOf(true);
        alert(`¡Jugador ${losingPlayerIndex + 1} ha perdido! El ganador es el Jugador ${losingPlayerIndex === 0 ? 2 : 1}`); 
        clearInterval(gameInterval); 
        dom_replay.style.display = "block"; 
    }
}

// Verifica si un jugador choca con el cuerpo del otro
function checkCollisionWithBody(snake, otherSnake) {
    let head = snake[0];
    for (let i = 1; i < otherSnake.length; i++) {
        if (helpers.isCollision(head, otherSnake[i])) {
            return true; 
        }
    }
    return false; 
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

// Agregar evento de clic al botón de retroceso
document.getElementById("back").addEventListener("click", function() {
    window.location.href = "http://127.0.0.1:5500/principal.html"; // Cambia "index.html" a la URL de tu página principal si es necesario
});

// Escuchar la tecla para iniciar o reiniciar el juego
KEY.listen();