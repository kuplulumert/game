const canvas = document.getElementById('mini');
const ctx = canvas.getContext('2d');

const TILE = 16; // simple grid tile size

const COLORS = {
    GRASS_LIGHT: '#7BC142',
    GRASS_DARK: '#67AB38',
    PATH: '#E2BF5C',
    PATH_EDGE: '#B89846',
    WATER: '#4CA3DD',
    WATER_DARK: '#2E7DB9',
    TREE_OUTLINE: '#0F2F0F',
    TREE_LEAVES: '#228B22',
    TREE_LEAVES_DARK: '#1F5F1F',
    BUILDING: '#B0B0B0',
    ROOF_BLUE: '#5B7BD5',
    NPC_RED: '#DC143C',
    NPC_SKIN: '#FFDBAC',
    BLACK: '#000',
};

function drawGrass() {
    for (let y = 0; y < canvas.height; y += 8) {
        for (let x = 0; x < canvas.width; x += 8) {
            const dark = ((x / 8 + y / 8) % 2) === 1;
            ctx.fillStyle = dark ? COLORS.GRASS_DARK : COLORS.GRASS_LIGHT;
            ctx.fillRect(x, y, 8, 8);
        }
    }
}

function drawPathRect(x, y, w, h) {
    ctx.fillStyle = COLORS.PATH;
    ctx.fillRect(x, y, w, h);
    // edges
    ctx.fillStyle = COLORS.PATH_EDGE;
    ctx.fillRect(x, y, w, 1);
    ctx.fillRect(x, y + h - 1, w, 1);
}

function drawTree(x, y) {
    // layered rectangles
    ctx.fillStyle = COLORS.TREE_LEAVES_DARK;
    ctx.fillRect(x + 2, y + 10, 12, 6);
    ctx.fillStyle = COLORS.TREE_LEAVES;
    ctx.fillRect(x + 4, y + 6, 8, 5);
    ctx.fillRect(x + 6, y + 3, 6, 3);
    ctx.fillStyle = COLORS.TREE_OUTLINE;
    ctx.fillRect(x + 7, y + 16, 2, 2); // trunk hint
}

function drawBuilding(x, y, w, h) {
    ctx.fillStyle = COLORS.BUILDING;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = COLORS.ROOF_BLUE;
    ctx.fillRect(x, y, w, 6);
}

function drawNPC(x, y, color=COLORS.NPC_RED) {
    // simple 12x14 NPC marker
    ctx.fillStyle = color;
    ctx.fillRect(x + 2, y, 12, 6); // hat
    ctx.fillStyle = COLORS.NPC_SKIN;
    ctx.fillRect(x + 4, y + 6, 8, 6); // face
    ctx.fillStyle = COLORS.BLACK;
    ctx.fillRect(x + 5, y + 8, 2, 2);
    ctx.fillRect(x + 9, y + 8, 2, 2);
}

async function loadMap() {
    const res = await fetch('dewford_map.json?_=' + Date.now());
    return await res.json();
}

function drawScene(map) {
    // Base grass
    drawGrass();

    // A simple implied town: a horizontal sand path and some buildings
    drawPathRect(0, 80, 240, 32);

    // Buildings implied by warp events
    for (const warp of map.warp_events) {
        const wx = warp.x * (TILE - 1);
        const wy = warp.y * (TILE - 1);
        drawBuilding(wx - 8, wy - 12, 32, 20);
    }

    // Trees around edges
    for (let x = 0; x < 240; x += 24) drawTree(x + 4, 8);
    for (let x = 0; x < 240; x += 24) drawTree(x + 8, 120);

    // NPC markers from object_events
    for (const obj of map.object_events) {
        const ox = obj.x * (TILE - 1);
        const oy = obj.y * (TILE - 1);
        drawNPC(ox, oy);
    }
}

(async () => {
    const map = await loadMap();
    drawScene(map);
})();

