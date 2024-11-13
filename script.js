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

// Agregar botones de inicio y reinicio
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

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
    }
};

// Almacenar la dirección de cada serpiente
let directions = {
    player1: { x: 0, y: 0 },
    player2: { x:  0, y: 0 }
};

let KEY = {
    listen() {
        addEventListener("keydown", (e) => {
            if (!gameStarted) return; // Ignora los controles si el juego no ha comenzado

            // Player 1 controls
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
                directions.player1 = { x: 1, y: 0 };
            }

            // Player 2 controls
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
        }, false);
    }
};

// Función para iniciar el juego
function startGame() {
    if (gameStarted) return; // Evita reiniciar si el juego ya comenzó

    gameStarted = true;
    isGameOver = false;
    score1 = 0;
    score2 = 0;
    snakes = [
        [new helpers.Vec(5, 5)], // Jugador 1
        [new helpers.Vec(15, 15)] // Jugador 2
    ];
    food1 = new helpers.Vec(Math.floor(Math.random() * cells), Math.floor(Math.random() * cells)); // Comida del jugador 1
    food2 = new helpers.Vec(Math.floor(Math.random() * cells), Math.floor(Math.random() * cells)); // Comida del jugador 2
    KEY.listen();
    draw();
    gameInterval = setInterval(updateSnakes, 100); // Almacena el ID del intervalo
    restartButton.style.display = "none"; // Oculta el botón de reinicio al iniciar el juego
}

// Función para reiniciar el juego
function restartGame() {
    clearInterval(gameInterval); // Limpia el intervalo anterior
    gameStarted = false; // Reinicia el estado del juego
    isGameOver = false;
    startGame(); // Llama a la función de inicio para reiniciar el juego
    restartButton.style.display = "none"; // Oculta el botón de reinicio
}

// Función de dibujo
function draw() {
    CTX1.clearRect(0, 0, W, H);
    CTX2.clearRect(0, 0, W, H);
    helpers.drawGrid(CTX1);
    helpers.drawGrid(CTX2);

    // Dibuja la comida en ambos canvases como rojas
    CTX1.fillStyle = "red";
    CTX1.fillRect(food1.x * (W / cells), food1.y * (H / cells), (W / cells), (H / cells));
    CTX2.fillStyle = "red"; // Cambia el color para que la comida del jugador 2 también sea roja
    CTX2.fillRect(food2.x * (W / cells), food2.y * (H / cells), (W / cells), (H / cells));

    // Dibuja las serpientes
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
    snakes.forEach((snake, index) => {
        let head = snake[0];
        let newHead = new helpers.Vec(head.x , head.y);

        // Mueve la serpiente en la dirección correspondiente
        if (index === 0) {
            newHead.add(new helpers.Vec(directions.player1.x, directions.player1.y));
        } else {
            newHead.add(new helpers.Vec(directions.player2.x, directions.player2.y));
        }

        // Verifica colisiones
        if (index === 0 && helpers.isCollision(newHead, food1)) {
            score1++;
            food1 = new helpers.Vec(Math.floor(Math.random() * cells), Math.floor(Math.random() * cells)); // Nueva comida para el jugador 1
        } else if (index === 1 && helpers.isCollision(newHead, food2)) {
            score2++;
            food2 = new helpers.Vec(Math.floor(Math.random() * cells), Math.floor(Math.random() * cells)); // Nueva comida para el jugador 2
        } else {
            snake.pop(); // Elimina la cola si no comió
        }

        snake.unshift(newHead); // Agrega la nueva cabeza
        checkGameOver(snake);
    });
}

// Verifica si el juego ha terminado
function checkGameOver(snake) {
    let head = snake[0];

    // Verifica colisión con los bordes del canvas
    if (head.x < 0 || head.x >= cells || head.y < 0 || head.y >= cells) {
        if (!isGameOver) { // Verifica si el juego ya ha terminado
            isGameOver = true;
            alert("Game Over!"); // Mensaje de fin de juego
            restartButton.style.display = "block"; // Muestra el botón de reinicio
        }
    }

    // Verifica colisión con el propio cuerpo de la serpiente
    for (let i = 1; i < snake.length; i++) {
        if (helpers.isCollision(head, snake[i])) {
            if (!isGameOver) { // Verifica si el juego ya ha terminado
                isGameOver = true;
                alert("Game Over!"); // Mensaje de fin de juego
                restartButton.style.display = "block"; // Muestra el botón de reinicio
            }
            break; // Salir del bucle si hay una colisión
        }
    }
}

// Iniciar el juego al hacer clic en el botón
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame); // Agrega el evento para reiniciar el juego
KEY.listen();