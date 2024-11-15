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
    cells = 20,
    isGameOver = false,
    gameStarted = false; // Variable para controlar el inicio del juego

let score1 = 0; // Inicializar score1
let score2 = 0; // Inicializar score2
let gameInterval; // Variable para almacenar el ID del intervalo

// Obtener el elemento para mostrar el mensaje de fin de juego
const gameOverMessage = document.getElementById('gameOverMessage');

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

        CTX1.fillStyle = "green";
        CTX1.fillRect(0, Math.floor(cells / 2) * (H / cells), (W / cells), (H / cells)); // Jugador 1
        CTX2.fillStyle = "blue";
        CTX2.fillRect(0, Math.floor(cells / 2) * (H / cells), (W / cells), (H / cells)); // Jugador 2

        food1 = new helpers.Vec(Math.floor(Math.random() * cells), Math.floor(Math.random() * cells));
        food2 = new helpers.Vec(Math.floor(Math.random() * cells), Math.floor(Math.random() * cells));

        CTX1.fillStyle = "red";
        CTX1.fillRect(food1.x * (W / cells), food1.y * (H / cells), (W / cells), (H / cells));
        CTX2.fillStyle = "red";
        CTX2.fillRect(food2.x * (W / cells), food2.y * (H / cells), (W / cells), (H / cells));
    }
};

let directions = {
    player1: { x: 1, y: 0 },
    player2: { x: 1, y: 0 }
};

let KEY = {
    listen() {
        addEventListener("keydown", (e) => {
            // Controles del Jugador 1
            if (e.key === "ArrowUp" && directions.player1.y === 0) {
                directions.player1 = { x: 0, y: -1 };
            }
            if (e.key === "ArrowDown" && directions.player1.y === 0) {
                directions.player1 = { x: 0, y: 1 };
            }
            if (e.key === "ArrowLeft" && directions.player1.x === 0) {
                directions.player1 = { x: -1, y: 0 };
            }
            if (e.key === "ArrowRight" && directions.player1.x === 0) {
                directions .player1 = { x: 1, y: 0 };
            }

            // Controles del Jugador 2
            if (e.key === "w" && directions.player2.y === 0) {
                directions.player2 = { x: 0, y: -1 };
            }
            if (e.key === "s" && directions.player2.y === 0) {
                directions.player2 = { x: 0, y: 1 };
            }
            if (e.key === "a" && directions.player2.x === 0) {
                directions.player2 = { x: -1, y: 0 };
            }
            if (e.key === "d" && directions.player2.x === 0) {
                directions.player2 = { x: 1, y: 0 };
            }

            // Reiniciar el juego al presionar la barra espaciadora
            if (e.key === " ") {
                e.preventDefault(); // Evitar el comportamiento predeterminado de la barra espaciadora
                if (!gameStarted) {
                    startGame(); // Iniciar el juego si no ha comenzado
                } else {
                    restartGame(); // Reiniciar el juego si ya ha comenzado
                }
            }
        }, false);
    }
};

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

    KEY.listen();
    draw();
    gameInterval = setInterval(updateSnakes, 100); 
    gameOverMessage.style.display = "none"; 
}

// Función para reiniciar el juego
function restartGame() {
    clearInterval(gameInterval); 
    gameStarted = false; 
    isGameOver = false;
    directions.player1 = { x: 1, y: 0 }; 
    directions.player2 = { x: 1, y: 0 }; 

    food1 = new helpers.Vec(Math.floor(Math.random() * cells), Math.floor(Math.random() * cells));
    food2 = new helpers.Vec(Math.floor(Math.random() * cells), Math.floor(Math.random() * cells));

    startGame(); 
}

// Función de dibujo
function draw() {
    CTX1.clearRect(0, 0, W, H);
    CTX2.clearRect(0, 0, W, H);
    helpers.drawGrid(CTX1);
    helpers.drawGrid(CTX2);

    CTX1.fillStyle = "red";
    CTX1.fillRect(food1.x * (W / cells), food1.y * (H / cells), (W / cells), (H / cells));
    CTX2.fillStyle = "red"; 
    CTX2.fillRect(food2.x * (W / cells), food2.y * (H / cells), (W / cells), (H / cells));

    snakes.forEach((snake, index) => {
        let ctx = index === 0 ? CTX1 : CTX2;
        ctx.fillStyle = index === 0 ? "green" : "blue";
        snake.forEach(segment => {
            ctx.fillRect(segment.x * (W / cells), segment.y * (H / cells), (W / cells), (H / cells));
        });
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
        } else if (index === 1 && helpers.isCollision(newHead, food2)) {
            score2++;
            food2 = new helpers.Vec(Math.floor(Math.random() * cells), Math.floor(Math.random() * cells)); 
        } else {
            snake.pop (); 
        }

        snake.unshift(newHead); 
        collisionStatus[index] = checkGameOver(snake, index); 

        if (collisionStatus[index]) {
            gameOverCount++;
        }
    });

    if (gameOverCount === snakes.length) {
        if (!gameOverAlertShown) {
            alert("¡Es un empate! Ambos jugadores han colisionado.");
            gameOverAlertShown = true; 
            clearInterval(gameInterval); 
        }
        dom_replay.style.display = "block"; 
    } else if (gameOverCount === 1) {
        const losingPlayerIndex = collisionStatus.indexOf(true);
        if (!gameOverAlertShown) {
            alert(`¡Jugador ${losingPlayerIndex + 1} ha perdido! El ganador es el Jugador ${losingPlayerIndex === 0 ? 2 : 1}`); 
            gameOverAlertShown = true; 
            clearInterval(gameInterval); 
        }
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