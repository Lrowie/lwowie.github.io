const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 500;

const gravity = 0.5;
const player = {
    x: 100,
    y: 350,
    width: 50,
    height: 50,
    speed: 2,
    dx: 0,
    dy: 0,
    jumpPower: -15,
    grounded: false
};

let cameraX = 0;
let cameraSpeed = 5;
let keys = {};
let score = 95;
let scoreInterval = setInterval(() => {
    score++;
    if (score === 100) {
        showImage();
    }
    if (cameraX > terrain[terrain.length - 1].x - canvas.width) {
        generateTerrain();
        generateSpikes();
    }
}, 2000);

const terrain = [{ x: 0, y: 400, width: 5000, height: 100 }];
const spikes = [];

function generateTerrain() {
    let lastTerrain = terrain[terrain.length - 1];
    let newTerrain = { x: lastTerrain.x + lastTerrain.width, y: 400, width: 5000, height: 100 };
    terrain.push(newTerrain);
}

function generateSpikes() {
    let lastSpikeX = spikes.length ? spikes[spikes.length - 1].x : 0;
    for (let i = lastSpikeX + 400; i < lastSpikeX + 5000; i += Math.random() * 700 + 400) {
        spikes.push({ x: i, y: 370, width: 40, height: 40 });
    }
}
generateSpikes();

document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

function handleInput() {
    player.dx = 0;
    if (keys['a']) player.dx = -player.speed;
    if (keys['d']) player.dx = player.speed;
    if (keys[' '] && player.grounded) {
        player.dy = player.jumpPower;
        player.grounded = false;
    }
}

function checkCollision() {
    for (let spike of spikes) {
        if (
            player.x < spike.x + spike.width &&
            player.x + player.width > spike.x &&
            player.y + player.height > spike.y
        ) {
            gameOver();
        }
    }
}

function gameOver() {
    clearInterval(scoreInterval);
    localStorage.setItem("score", score);
    window.location.href = "gameover.html";
}

function showImage() {
    let img = new Image();
    img.src = "image.jpg";  // Make sure this path is correct and points to a valid image file.
    
    img.onload = () => {
        // Image is now loaded, so draw it on the canvas
        ctx.drawImage(img, (canvas.width - img.width) / 2, (canvas.height - img.height) / 2);
    };

    img.onerror = () => {
        console.error("Image failed to load.");
    };
}

function update() {
    handleInput();
    player.dy += gravity;
    player.x += player.dx;
    player.y += player.dy;
    
    player.grounded = false;
    for (let block of terrain) {
        if (player.x < block.x + block.width && player.x + player.width > block.x &&
            player.y + player.height > block.y && player.y + player.height - player.dy <= block.y) {
            player.y = block.y - player.height;
            player.dy = 0;
            player.grounded = true;
        }
    }
    
    checkCollision();
    cameraX += cameraSpeed;
    if (player.x < cameraX) player.x = cameraX;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "skyblue";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x - cameraX, player.y, player.width, player.height);
    
    ctx.fillStyle = "green";
    for (let block of terrain) {
        ctx.fillRect(block.x - cameraX, block.y, block.width, block.height);
    }
    
    ctx.fillStyle = "red";
    for (let spike of spikes) {
        ctx.beginPath();
        ctx.moveTo(spike.x - cameraX, spike.y + spike.height);
        ctx.lineTo(spike.x + spike.width / 2 - cameraX, spike.y);
        ctx.lineTo(spike.x + spike.width - cameraX, spike.y + spike.height);
        ctx.closePath();
        ctx.fill();
    }
    
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();