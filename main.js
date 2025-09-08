const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// CONFIG
const TILE_SIZE = 32;
const PLAYER_SPEED = 2;
const canvasScale = 2;

canvas.width = 15 * TILE_SIZE;
canvas.height = 10 * TILE_SIZE;

// LOAD TILESET
const tileset = new Image();
tileset.src = 'https://i.imgur.com/7ef7qxU.png'; // Sample GBA grass tile

// LOAD PLAYER SPRITE
const playerSprite = new Image();
playerSprite.src = 'https://i.imgur.com/Qq6fvzV.png'; // Brendan sprite

let player = {
  x: 5 * TILE_SIZE,
  y: 5 * TILE_SIZE,
  frame: 0,
  direction: 'down',
  moving: false
};

const keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

function drawTile(x, y) {
  ctx.drawImage(tileset, 0, 0, 16, 16, x, y, TILE_SIZE, TILE_SIZE);
}

function drawMap() {
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 15; x++) {
      drawTile(x * TILE_SIZE, y * TILE_SIZE);
    }
  }
}

function drawPlayer() {
  const sx = (player.frame % 3) * 16;
  const sy = {
    down: 0,
    left: 16,
    right: 32,
    up: 48
  }[player.direction];

  // Draw shadow
  ctx.beginPath();
  ctx.ellipse(player.x + TILE_SIZE/2, player.y + TILE_SIZE - 4, 8, 4, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fill();

  ctx.drawImage(playerSprite, sx, sy, 16, 16, player.x, player.y, TILE_SIZE, TILE_SIZE);
}

function movePlayer() {
  player.moving = false;
  if (keys['ArrowUp']) {
    player.y -= PLAYER_SPEED;
    player.direction = 'up';
    player.moving = true;
  }
  if (keys['ArrowDown']) {
    player.y += PLAYER_SPEED;
    player.direction = 'down';
    player.moving = true;
  }
  if (keys['ArrowLeft']) {
    player.x -= PLAYER_SPEED;
    player.direction = 'left';
    player.moving = true;
  }
  if (keys['ArrowRight']) {
    player.x += PLAYER_SPEED;
    player.direction = 'right';
    player.moving = true;
  }
  if (player.moving) {
    player.frame++;
  } else {
    player.frame = 1;
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  movePlayer();
  drawPlayer();
  requestAnimationFrame(gameLoop);
}

tileset.onload = () => {
  playerSprite.onload = () => {
    gameLoop();
  };
};
