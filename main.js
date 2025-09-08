const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game configuration
const TILE_SIZE = 16;
const MAP_WIDTH = 32;
const MAP_HEIGHT = 24;
const VIEWPORT_WIDTH = 15;
const VIEWPORT_HEIGHT = 10;

// Camera position
let camera = { x: 0, y: 0 };

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => keys[e.key] = true);
document.addEventListener('keyup', (e) => keys[e.key] = false);

// Tile types
const TILES = {
    GRASS: 0,
    WATER: 1,
    SAND: 2,
    STONE_PATH: 3,
    TREE_BASE: 4,
    TREE_TOP: 5,
    HOUSE_BOTTOM_LEFT: 6,
    HOUSE_BOTTOM_RIGHT: 7,
    HOUSE_TOP_LEFT: 8,
    HOUSE_TOP_RIGHT: 9,
    HOUSE_ROOF_LEFT: 10,
    HOUSE_ROOF_RIGHT: 11,
    FLOWER: 12,
    ROCK: 13
};

// Generate random map
function generateMap() {
    const map = [];
    
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Base terrain
            if (y < 4) {
                // Water area at top
                map[y][x] = TILES.WATER;
            } else if (y < 6) {
                // Sand beach
                map[y][x] = TILES.SAND;
            } else {
                // Grass area
                map[y][x] = TILES.GRASS;
                
                // Add some variety
                if (Math.random() < 0.1) {
                    map[y][x] = TILES.FLOWER;
                } else if (Math.random() < 0.05) {
                    map[y][x] = TILES.ROCK;
                }
            }
        }
    }
    
    // Add paths
    for (let x = 10; x < 22; x++) {
        if (map[8]) map[8][x] = TILES.STONE_PATH;
        if (map[15]) map[15][x] = TILES.STONE_PATH;
    }
    for (let y = 8; y < 16; y++) {
        if (map[y]) map[y][16] = TILES.STONE_PATH;
    }
    
    // Add trees (2x2)
    const treePositions = [
        [5, 10], [8, 12], [12, 8], [20, 10], [25, 14], [28, 8], [6, 18], [15, 20]
    ];
    
    treePositions.forEach(([x, y]) => {
        if (y < MAP_HEIGHT - 1 && x < MAP_WIDTH - 1) {
            map[y][x] = TILES.TREE_BASE;
            map[y][x + 1] = TILES.TREE_BASE;
            map[y - 1][x] = TILES.TREE_TOP;
            map[y - 1][x + 1] = TILES.TREE_TOP;
        }
    });
    
    // Add houses (2x3)
    const housePositions = [
        [14, 12], [22, 18]
    ];
    
    housePositions.forEach(([x, y]) => {
        if (y < MAP_HEIGHT - 2 && x < MAP_WIDTH - 1) {
            // Roof
            map[y - 2][x] = TILES.HOUSE_ROOF_LEFT;
            map[y - 2][x + 1] = TILES.HOUSE_ROOF_RIGHT;
            // Top
            map[y - 1][x] = TILES.HOUSE_TOP_LEFT;
            map[y - 1][x + 1] = TILES.HOUSE_TOP_RIGHT;
            // Bottom
            map[y][x] = TILES.HOUSE_BOTTOM_LEFT;
            map[y][x + 1] = TILES.HOUSE_BOTTOM_RIGHT;
        }
    });
    
    return map;
}

// Drawing functions
function drawGrassTile(x, y) {
    // Base grass
    ctx.fillStyle = '#4a7c59';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    
    // Grass texture
    ctx.fillStyle = '#5d8a6b';
    for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + i * 4, y + 2, 2, 1);
        ctx.fillRect(x + i * 4 + 2, y + 6, 2, 1);
        ctx.fillRect(x + i * 4, y + 10, 2, 1);
        ctx.fillRect(x + i * 4 + 2, y + 14, 2, 1);
    }
}

function drawWaterTile(x, y) {
    // Base water
    ctx.fillStyle = '#1e6091';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    
    // Water waves
    ctx.fillStyle = '#2980b9';
    ctx.fillRect(x + 2, y + 4, 4, 1);
    ctx.fillRect(x + 8, y + 8, 4, 1);
    ctx.fillRect(x + 4, y + 12, 4, 1);
    
    ctx.fillStyle = '#3498db';
    ctx.fillRect(x + 1, y + 2, 2, 1);
    ctx.fillRect(x + 10, y + 6, 2, 1);
    ctx.fillRect(x + 6, y + 14, 2, 1);
}

function drawSandTile(x, y) {
    // Base sand
    ctx.fillStyle = '#f4d03f';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    
    // Sand texture
    ctx.fillStyle = '#f7dc6f';
    for (let i = 0; i < 8; i++) {
        ctx.fillRect(x + (i % 4) * 4 + 1, y + Math.floor(i / 4) * 8 + 3, 1, 1);
        ctx.fillRect(x + (i % 4) * 4 + 3, y + Math.floor(i / 4) * 8 + 6, 1, 1);
    }
}

function drawStonePathTile(x, y) {
    // Base stone
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
    
    // Stone pattern
    ctx.fillStyle = '#95a5a6';
    ctx.fillRect(x + 2, y + 2, 4, 4);
    ctx.fillRect(x + 10, y + 2, 4, 4);
    ctx.fillRect(x + 2, y + 10, 4, 4);
    ctx.fillRect(x + 10, y + 10, 4, 4);
    
    // Highlights
    ctx.fillStyle = '#bdc3c7';
    ctx.fillRect(x + 3, y + 3, 2, 2);
    ctx.fillRect(x + 11, y + 3, 2, 2);
    ctx.fillRect(x + 3, y + 11, 2, 2);
    ctx.fillRect(x + 11, y + 11, 2, 2);
}

function drawTreeBase(x, y) {
    drawGrassTile(x, y);
    
    // Tree trunk
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + 4, y + 8, 8, 8);
    
    // Trunk highlight
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(x + 5, y + 9, 2, 6);
    
    // Trunk shadow
    ctx.fillStyle = '#654321';
    ctx.fillRect(x + 9, y + 9, 2, 6);
}

function drawTreeTop(x, y) {
    drawGrassTile(x, y);
    
    // Tree foliage
    ctx.fillStyle = '#228b22';
    ctx.fillRect(x + 1, y + 4, 14, 12);
    
    // Foliage details
    ctx.fillStyle = '#32cd32';
    ctx.fillRect(x + 3, y + 6, 3, 3);
    ctx.fillRect(x + 10, y + 6, 3, 3);
    ctx.fillRect(x + 6, y + 9, 4, 4);
    
    // Dark foliage
    ctx.fillStyle = '#006400';
    ctx.fillRect(x + 2, y + 12, 2, 2);
    ctx.fillRect(x + 12, y + 12, 2, 2);
}

function drawHouseBottomLeft(x, y) {
    drawGrassTile(x, y);
    
    // House wall
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(x + 2, y + 4, 14, 12);
    
    // Door
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + 8, y + 8, 6, 8);
    
    // Door handle
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(x + 12, y + 11, 1, 1);
}

function drawHouseBottomRight(x, y) {
    drawGrassTile(x, y);
    
    // House wall
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(x, y + 4, 14, 12);
    
    // Window
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(x + 3, y + 8, 6, 4);
    
    // Window frame
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(x + 2, y + 7, 8, 1);
    ctx.fillRect(x + 2, y + 12, 8, 1);
    ctx.fillRect(x + 2, y + 8, 1, 4);
    ctx.fillRect(x + 9, y + 8, 1, 4);
    ctx.fillRect(x + 5, y + 8, 1, 4);
}

function drawHouseTopLeft(x, y) {
    drawGrassTile(x, y);
    
    // House wall
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(x + 2, y, 14, 16);
    
    // Wall details
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(x + 4, y + 2, 10, 1);
    ctx.fillRect(x + 4, y + 14, 10, 1);
}

function drawHouseTopRight(x, y) {
    drawGrassTile(x, y);
    
    // House wall
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(x, y, 14, 16);
    
    // Wall details
    ctx.fillStyle = '#b8860b';
    ctx.fillRect(x + 2, y + 2, 10, 1);
    ctx.fillRect(x + 2, y + 14, 10, 1);
}

function drawHouseRoofLeft(x, y) {
    drawGrassTile(x, y);
    
    // Roof
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(x + 1, y + 8, 15, 8);
    
    // Roof highlight
    ctx.fillStyle = '#dc143c';
    ctx.fillRect(x + 2, y + 9, 12, 2);
}

function drawHouseRoofRight(x, y) {
    drawGrassTile(x, y);
    
    // Roof
    ctx.fillStyle = '#8b0000';
    ctx.fillRect(x, y + 8, 15, 8);
    
    // Roof highlight
    ctx.fillStyle = '#dc143c';
    ctx.fillRect(x + 2, y + 9, 12, 2);
}

function drawFlowerTile(x, y) {
    drawGrassTile(x, y);
    
    // Flower
    ctx.fillStyle = '#ff69b4';
    ctx.fillRect(x + 6, y + 6, 4, 4);
    
    // Flower center
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(x + 7, y + 7, 2, 2);
}

function drawRockTile(x, y) {
    drawGrassTile(x, y);
    
    // Rock
    ctx.fillStyle = '#696969';
    ctx.fillRect(x + 4, y + 8, 8, 6);
    
    // Rock highlight
    ctx.fillStyle = '#a9a9a9';
    ctx.fillRect(x + 5, y + 9, 3, 2);
    
    // Rock shadow
    ctx.fillStyle = '#2f4f4f';
    ctx.fillRect(x + 8, y + 11, 3, 2);
}

// Main drawing function
function drawTile(tileType, x, y) {
    switch (tileType) {
        case TILES.GRASS:
            drawGrassTile(x, y);
            break;
        case TILES.WATER:
            drawWaterTile(x, y);
            break;
        case TILES.SAND:
            drawSandTile(x, y);
            break;
        case TILES.STONE_PATH:
            drawStonePathTile(x, y);
            break;
        case TILES.TREE_BASE:
            drawTreeBase(x, y);
            break;
        case TILES.TREE_TOP:
            drawTreeTop(x, y);
            break;
        case TILES.HOUSE_BOTTOM_LEFT:
            drawHouseBottomLeft(x, y);
            break;
        case TILES.HOUSE_BOTTOM_RIGHT:
            drawHouseBottomRight(x, y);
            break;
        case TILES.HOUSE_TOP_LEFT:
            drawHouseTopLeft(x, y);
            break;
        case TILES.HOUSE_TOP_RIGHT:
            drawHouseTopRight(x, y);
            break;
        case TILES.HOUSE_ROOF_LEFT:
            drawHouseRoofLeft(x, y);
            break;
        case TILES.HOUSE_ROOF_RIGHT:
            drawHouseRoofRight(x, y);
            break;
        case TILES.FLOWER:
            drawFlowerTile(x, y);
            break;
        case TILES.ROCK:
            drawRockTile(x, y);
            break;
        default:
            drawGrassTile(x, y);
    }
}

// Render the map
function render(gameMap) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < VIEWPORT_HEIGHT; y++) {
        for (let x = 0; x < VIEWPORT_WIDTH; x++) {
            const mapX = x + camera.x;
            const mapY = y + camera.y;
            
            if (mapX >= 0 && mapX < MAP_WIDTH && mapY >= 0 && mapY < MAP_HEIGHT) {
                const tileType = gameMap[mapY][mapX];
                drawTile(tileType, x * TILE_SIZE, y * TILE_SIZE);
            }
        }
    }
}

// Handle input
function handleInput() {
    const speed = 1;
    
    if (keys['ArrowUp'] && camera.y > 0) {
        camera.y -= speed;
    }
    if (keys['ArrowDown'] && camera.y < MAP_HEIGHT - VIEWPORT_HEIGHT) {
        camera.y += speed;
    }
    if (keys['ArrowLeft'] && camera.x > 0) {
        camera.x -= speed;
    }
    if (keys['ArrowRight'] && camera.x < MAP_WIDTH - VIEWPORT_WIDTH) {
        camera.x += speed;
    }
}

// Game loop
function gameLoop() {
    handleInput();
    render(gameMap);
    requestAnimationFrame(gameLoop);
}

// Initialize and start the game
const gameMap = generateMap();
camera.x = Math.floor((MAP_WIDTH - VIEWPORT_WIDTH) / 2);
camera.y = Math.floor((MAP_HEIGHT - VIEWPORT_HEIGHT) / 2);
gameLoop();