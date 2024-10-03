const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let gameOver = false;
let isGameStarted = false;  // Track if the game has started

// Load player and enemy images
const playerImg = new Image();
playerImg.src = 'https://img.itch.zone/aW1nLzUzMDkyNzQucG5n/original/4uHQ7p.png';

const enemyImages = [
    'https://s3.amazonaws.com/files.d20.io/marketplace/6173/bSrteUciR_liMXE2l9qtuA/max.png?1340287385',
    'https://s3.amazonaws.com/files.d20.io/marketplace/6173/bSrteUciR_liMXE2l9qtuA/max.png?1340287385',
    'https://s3.amazonaws.com/files.d20.io/marketplace/6173/bSrteUciR_liMXE2l9qtuA/max.png?1340287385'
].map(src => {
    const img = new Image();
    img.src = src;
    return img;
});

// Load grass image for the moving floor
const grassImg = new Image();
grassImg.src = 'https://static.vecteezy.com/system/resources/previews/009/362/117/non_2x/green-lawn-view-from-top-grass-and-bushes-vector.jpg'; // Replace with your grass texture image path

// Load blood image
const bloodImg = new Image();
bloodImg.src = 'https://www.pngmart.com/files/21/Blood-PNG-Image.png'; // Replace with your blood image URL

const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    speed: 5
};

const bullets = [];
const enemies = [];
const bloodEffects = []; // For blood effects
const keys = {};

// Variables for moving grass effect
let grassY1 = 0;
let grassY2 = -canvas.height;

// Player controls
document.addEventListener("keydown", (e) => {
    keys[e.code] = true;

    // Start the game with Space key
    if (e.code === "Space" && !isGameStarted) {
        startGame();
    }

    // Shoot bullet on "Enter" key press if game started
    if (e.code === "Enter" && isGameStarted && !gameOver) {
        createBullet();
    }
});

document.addEventListener("keyup", (e) => {
    keys[e.code] = false;
});

// Bullet creation
function createBullet() {
    if (!gameOver) {
        bullets.push({
            x: player.x + player.width / 2 - 5,
            y: player.y,
            width: 5,
            height: 10,
            speed: 7
        });
    }
}

// Enemy creation
function createEnemy() {
    const size = 50;
    if (!gameOver) {
        enemies.push({
            x: Math.random() * (canvas.width - size),
            y: 0,
            width: size,
            height: size,
            img: enemyImages[Math.floor(Math.random() * enemyImages.length)], // Random enemy image
            speed: 2 + Math.random() * 2
        });
    }
}

// Blood effect creation
function createBloodEffect(x, y) {
    bloodEffects.push({
        x: x,
        y: y,
        createdAt: Date.now()
    });
}

// Update blood effects to remove after 2 seconds
function updateBloodEffects() {
    const now = Date.now();
    bloodEffects.forEach((effect, index) => {
        if (now - effect.createdAt > 1000) {
            bloodEffects.splice(index, 1); // Remove effect after 2 seconds
        }
    });
}

// Draw blood effects
function drawBloodEffects() {
    bloodEffects.forEach((effect) => {
        // Draw blood image at the effect location
        ctx.drawImage(bloodImg, effect.x - 25, effect.y - 25, 50, 50); // Adjust size and position as needed
    });
}

// Update game objects
function update() {
    // Move player
    if (keys["ArrowLeft"] && player.x > 0 + 10) { // Left wall boundary
        player.x -= player.speed;
    }
    if (keys["ArrowRight"] && player.x < canvas.width - player.width - 10) { // Right wall boundary
        player.x += player.speed;
    }

    // Move bullets
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;
        if (bullet.y + bullet.height < 0) {
            bullets.splice(index, 1);
        }
    });

    // Move enemies
    enemies.forEach((enemy, index) => {
        enemy.y += enemy.speed;

        // Check for collision with player (Game Over condition)
        if (enemy.y + enemy.height > player.y) {
            if (
                enemy.x < player.x + player.width &&
                enemy.x + enemy.width > player.x
            ) {
                gameOver = true;
            }
        }

        // Remove enemy if out of bounds
        if (enemy.y > canvas.height) {
            enemies.splice(index, 1);
        }
    });

    // Collision detection (bullet vs enemy)
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                // Collision detected
                bullets.splice(bulletIndex, 1);
                enemies.splice(enemyIndex, 1);

                // Create blood effect
                createBloodEffect(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            }
        });
    });

    // Update moving grass effect
    grassY1 += 2;
    grassY2 += 2;

    if (grassY1 >= canvas.height) {
        grassY1 = -canvas.height;
    }
    if (grassY2 >= canvas.height) {
        grassY2 = -canvas.height;
    }

    updateBloodEffects(); // Update blood effects
}

// Draw game objects
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw moving grass effect (two grass images moving downward)
    ctx.drawImage(grassImg, 0, grassY1, canvas.width, canvas.height);
    ctx.drawImage(grassImg, 0, grassY2, canvas.width, canvas.height);

    // Draw border walls
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 20, canvas.height); // Left wall
    ctx.fillRect(canvas.width - 20, 0, 20, canvas.height); // Right wall

    // Draw player
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);

    // Draw bullets
    bullets.forEach((bullet) => {
        ctx.fillStyle = "black";
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw enemies
    enemies.forEach((enemy) => {
        ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // Draw blood effects
    drawBloodEffects();

    // Draw Game Over screen
    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "50px Arial";
        ctx.fillText("Game Over", canvas.width / 2 - 150, canvas.height / 2);
    }

    // Draw Start screen
    if (!isGameStarted) {
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("Press Space to Start", canvas.width / 2 - 150, canvas.height / 2);
    }
}

// Game loop
function gameLoop() {
    if (isGameStarted && !gameOver) {
        update();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game when Space is pressed
function startGame() {
    isGameStarted = true;
    setInterval(createEnemy, 1000); // Create enemies every second
}

// Start the game loop
gameLoop();
